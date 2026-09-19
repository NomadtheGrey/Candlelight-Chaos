import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { gameReducer, createInitialState, Action } from './src/state/gameReducer';
import {
  GameState,
  OnlineRoomInfo,
  OnlineRoomPlayer,
  PlayerConfig,
  RoomReaction,
} from './src/types/game';
import { SIBLINGS_ROSTER, PLAYER_COLORS } from './src/data/gameData';

interface ServerRoom {
  id: string;
  name: string;
  hostPlayerId: string;
  status: 'lobby' | 'in_game' | 'ended';
  difficulty: 'casual' | 'standard' | 'nightmare';
  players: OnlineRoomPlayer[];
  gameState: GameState | null;
  clients: Map<string, WebSocket>;
  reactions: RoomReaction[];
  lastActivity: number;
}

const rooms = new Map<string, ServerRoom>();

function generateRoomCode(): string {
  const prefixes = ['GOBLIN', 'CANDLE', 'HOUSE', 'CHAOS', 'TORCH', 'ATTIC', 'EMBER'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const num = Math.floor(10 + Math.random() * 90);
  return `${prefix}-${num}`;
}

function sanitizeRoom(room: ServerRoom): OnlineRoomInfo {
  return {
    roomId: room.id,
    name: room.name,
    hostPlayerId: room.hostPlayerId,
    status: room.status,
    difficulty: room.difficulty,
    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      siblingId: p.siblingId,
      traitId: p.traitId,
      color: p.color,
      isHost: p.isHost,
      isReady: p.isReady,
      isOnline: room.clients.has(p.id) && room.clients.get(p.id)?.readyState === WebSocket.OPEN,
      lastSeen: p.lastSeen,
    })),
    createdAt: room.lastActivity,
    gameState: room.gameState || undefined,
  };
}

function broadcastToRoom(room: ServerRoom, payload: any) {
  const message = JSON.stringify(payload);
  room.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
      } catch (err) {
        console.error('Error sending message to client', err);
      }
    }
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: Date.now(), activeRooms: rooms.size });
  });

  // Create a new room
  app.post('/api/rooms/create', (req, res) => {
    const { hostName, siblingId, traitId, customCode, difficulty = 'standard' } = req.body;
    const name = (hostName || 'Player 1').trim();
    const rawCode = (customCode || generateRoomCode()).trim().toUpperCase();
    const cleanCode = rawCode.replace(/[^A-Z0-9-]/g, '').slice(0, 12);
    const roomId = cleanCode || generateRoomCode();

    const playerId = `player-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const selectedSibling = siblingId || 'leo';

    const newPlayer: OnlineRoomPlayer = {
      id: playerId,
      name,
      siblingId: selectedSibling,
      traitId: traitId || undefined,
      color: PLAYER_COLORS[0]?.id || 'amber',
      isHost: true,
      isReady: true,
      isOnline: true,
      lastSeen: Date.now(),
    };

    const room: ServerRoom = {
      id: roomId,
      name: `${name}'s Defense Squad`,
      hostPlayerId: playerId,
      status: 'lobby',
      difficulty: difficulty as 'casual' | 'standard' | 'nightmare',
      players: [newPlayer],
      gameState: null,
      clients: new Map(),
      reactions: [],
      lastActivity: Date.now(),
    };

    rooms.set(roomId, room);

    res.json({
      success: true,
      roomId,
      playerId,
      room: sanitizeRoom(room),
    });
  });

  // Join an existing room
  app.post('/api/rooms/join', (req, res) => {
    const { roomId: rawRoomId, name: rawName, siblingId, traitId } = req.body;
    if (!rawRoomId || !rawName) {
      return res.status(400).json({ error: 'Room code and your name are required' });
    }

    const roomId = rawRoomId.trim().toUpperCase();
    const room = rooms.get(roomId);
    if (!room) {
      return res.status(404).json({ error: `Room "${roomId}" not found. Check the room code!` });
    }

    const name = rawName.trim();
    // Check if player with this exact name already exists in room
    let existingPlayer = room.players.find((p) => p.name.toLowerCase() === name.toLowerCase());

    if (existingPlayer) {
      existingPlayer.lastSeen = Date.now();
      if (siblingId) existingPlayer.siblingId = siblingId;
      if (traitId) existingPlayer.traitId = traitId;
      return res.json({
        success: true,
        roomId,
        playerId: existingPlayer.id,
        room: sanitizeRoom(room),
      });
    }

    if (room.players.length >= 4) {
      return res.status(400).json({ error: 'Lobby is full! Maximum 4 sibling defenders allowed.' });
    }

    // Pick an unused sibling if available
    const usedSiblings = new Set(room.players.map((p) => p.siblingId));
    let assignedSibling = siblingId;
    if (!assignedSibling || usedSiblings.has(assignedSibling)) {
      const available = SIBLINGS_ROSTER.find((s) => !usedSiblings.has(s.id));
      assignedSibling = available ? available.id : SIBLINGS_ROSTER[0].id;
    }

    const playerId = `player-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const colorIndex = room.players.length % PLAYER_COLORS.length;

    const newPlayer: OnlineRoomPlayer = {
      id: playerId,
      name,
      siblingId: assignedSibling,
      traitId: traitId || undefined,
      color: PLAYER_COLORS[colorIndex]?.id || 'emerald',
      isHost: false,
      isReady: true,
      isOnline: true,
      lastSeen: Date.now(),
    };

    room.players.push(newPlayer);
    room.lastActivity = Date.now();

    // Broadcast updated player list
    broadcastToRoom(room, {
      type: 'ROOM_UPDATE',
      room: sanitizeRoom(room),
      announcement: `🎉 ${newPlayer.name} logged into the lobby as ${
        SIBLINGS_ROSTER.find((s) => s.id === assignedSibling)?.name.split(' ')[0]
      }!`,
    });

    res.json({
      success: true,
      roomId,
      playerId,
      room: sanitizeRoom(room),
    });
  });

  // Get room info
  app.get('/api/rooms/:roomId', (req, res) => {
    const roomId = req.params.roomId.trim().toUpperCase();
    const room = rooms.get(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json({ success: true, room: sanitizeRoom(room) });
  });

  // Start game from lobby
  app.post('/api/rooms/:roomId/start', (req, res) => {
    const roomId = req.params.roomId.trim().toUpperCase();
    const { playerId } = req.body;
    const room = rooms.get(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.hostPlayerId !== playerId) {
      return res.status(403).json({ error: 'Only the squad host can start the game!' });
    }

    // Convert room.players into PlayerConfig[]
    const configs: PlayerConfig[] = room.players.map((p) => ({
      id: p.id,
      name: p.name,
      siblingId: p.siblingId,
      traitId: p.traitId,
      color: p.color,
    }));

    const initialState = createInitialState({
      gameMode: room.players.length > 1 ? 'group' : 'solo',
      playerConfigs: configs,
      difficulty: room.difficulty,
    });

    room.gameState = initialState;
    room.status = 'in_game';
    room.lastActivity = Date.now();

    const sanitized = sanitizeRoom(room);
    broadcastToRoom(room, {
      type: 'GAME_STARTED',
      room: sanitized,
      gameState: initialState,
    });

    res.json({ success: true, room: sanitized, gameState: initialState });
  });

  // Dispatch game action via REST (reliable fallback for mobile/tablets)
  app.post('/api/rooms/:roomId/action', (req, res) => {
    const roomId = req.params.roomId.trim().toUpperCase();
    const { playerId, action } = req.body;
    const room = rooms.get(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (!room.gameState) {
      return res.status(400).json({ error: 'Game is not started yet' });
    }

    try {
      const nextState = gameReducer(room.gameState, action as Action);
      room.gameState = nextState;
      room.lastActivity = Date.now();

      broadcastToRoom(room, {
        type: 'STATE_UPDATE',
        gameState: nextState,
        action,
        fromPlayerId: playerId,
      });

      res.json({ success: true, gameState: nextState });
    } catch (err: any) {
      console.error('Error applying game action:', err);
      res.status(500).json({ error: err?.message || 'Failed to apply game action' });
    }
  });

  // Send quick reaction/cheer ping
  app.post('/api/rooms/:roomId/reaction', (req, res) => {
    const roomId = req.params.roomId.trim().toUpperCase();
    const { playerId, emoji, text } = req.body;
    const room = rooms.get(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const player = room.players.find((p) => p.id === playerId);
    const reaction: RoomReaction = {
      id: `react-${Date.now()}`,
      senderName: player?.name || 'Sibling',
      emoji: emoji || '🔥',
      text: text || '',
      timestamp: Date.now(),
    };

    room.reactions.push(reaction);
    if (room.reactions.length > 20) room.reactions.shift();

    broadcastToRoom(room, {
      type: 'REACTION',
      reaction,
    });

    res.json({ success: true, reaction });
  });

  // Create HTTP server
  const httpServer = http.createServer(app);

  // Attach WebSocket Server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
    const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
    const roomId = url.searchParams.get('roomId')?.trim().toUpperCase();
    const playerId = url.searchParams.get('playerId');

    if (!roomId || !playerId) {
      ws.close(1008, 'Missing roomId or playerId in connection URL');
      return;
    }

    const room = rooms.get(roomId);
    if (!room) {
      ws.close(1008, 'Room not found');
      return;
    }

    // Register client socket
    room.clients.set(playerId, ws);
    const player = room.players.find((p) => p.id === playerId);
    if (player) {
      player.lastSeen = Date.now();
      player.isOnline = true;
    }

    // Send immediate sync to newly connected client
    ws.send(
      JSON.stringify({
        type: 'SYNC',
        room: sanitizeRoom(room),
        gameState: room.gameState,
      })
    );

    // Notify room of presence update
    broadcastToRoom(room, {
      type: 'PLAYER_PRESENCE',
      playerId,
      isOnline: true,
      room: sanitizeRoom(room),
    });

    ws.on('message', (data: string) => {
      try {
        const msg = JSON.parse(data.toString());

        if (msg.type === 'ACTION' && room.gameState && msg.action) {
          const nextState = gameReducer(room.gameState, msg.action as Action);
          room.gameState = nextState;
          room.lastActivity = Date.now();

          broadcastToRoom(room, {
            type: 'STATE_UPDATE',
            gameState: nextState,
            action: msg.action,
            fromPlayerId: playerId,
          });
        } else if (msg.type === 'UPDATE_PLAYER') {
          if (player) {
            if (msg.name) player.name = msg.name;
            if (msg.siblingId) player.siblingId = msg.siblingId;
            if (msg.traitId) player.traitId = msg.traitId;
            if (typeof msg.isReady === 'boolean') player.isReady = msg.isReady;
            broadcastToRoom(room, {
              type: 'ROOM_UPDATE',
              room: sanitizeRoom(room),
            });
          }
        } else if (msg.type === 'START_GAME') {
          if (room.hostPlayerId === playerId) {
            const configs: PlayerConfig[] = room.players.map((p) => ({
              id: p.id,
              name: p.name,
              siblingId: p.siblingId,
              traitId: p.traitId,
              color: p.color,
            }));
            const initialState = createInitialState({
              gameMode: room.players.length > 1 ? 'group' : 'solo',
              playerConfigs: configs,
              difficulty: room.difficulty,
            });
            room.gameState = initialState;
            room.status = 'in_game';
            room.lastActivity = Date.now();

            broadcastToRoom(room, {
              type: 'GAME_STARTED',
              room: sanitizeRoom(room),
              gameState: initialState,
            });
          }
        } else if (msg.type === 'REACTION') {
          const reaction: RoomReaction = {
            id: `react-${Date.now()}`,
            senderName: player?.name || 'Sibling',
            emoji: msg.emoji || '⭐',
            text: msg.text || '',
            timestamp: Date.now(),
          };
          room.reactions.push(reaction);
          broadcastToRoom(room, { type: 'REACTION', reaction });
        } else if (msg.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG' }));
        }
      } catch (e) {
        console.error('WebSocket message handling error:', e);
      }
    });

    ws.on('close', () => {
      room.clients.delete(playerId);
      if (player) {
        player.isOnline = false;
        player.lastSeen = Date.now();
      }
      broadcastToRoom(room, {
        type: 'PLAYER_PRESENCE',
        playerId,
        isOnline: false,
        room: sanitizeRoom(room),
      });
    });

    ws.on('error', (err) => {
      console.error(`WebSocket error for player ${playerId}:`, err);
    });
  });

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Candlelight Chaos game server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
