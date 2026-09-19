import { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, OnlineRoomInfo, OnlineRoomPlayer, RoomReaction } from '../types/game';
import { Action } from '../state/gameReducer';
import { sound } from '../utils/audio';

interface UseMultiplayerRoomProps {
  onRemoteStateUpdate?: (nextState: GameState) => void;
}

export function useMultiplayerRoom({ onRemoteStateUpdate }: UseMultiplayerRoomProps = {}) {
  const [room, setRoom] = useState<OnlineRoomInfo | null>(null);
  const [localPlayerId, setLocalPlayerId] = useState<string | null>(() => {
    return sessionStorage.getItem('candlelight_player_id') || null;
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reactions, setReactions] = useState<RoomReaction[]>([]);
  const [announcement, setAnnouncement] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const activeRoomIdRef = useRef<string | null>(null);

  activeRoomIdRef.current = room?.roomId || null;

  // Clear announcement after a brief delay
  useEffect(() => {
    if (announcement) {
      const timer = setTimeout(() => setAnnouncement(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [announcement]);

  // Connect WebSocket to active room
  const connectSocket = useCallback((roomId: string, playerId: string) => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws?roomId=${encodeURIComponent(roomId)}&playerId=${encodeURIComponent(playerId)}`;

    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      setError(null);
      setIsConnecting(false);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === 'SYNC') {
          if (msg.room) setRoom(msg.room);
          if (msg.gameState && onRemoteStateUpdate) {
            onRemoteStateUpdate(msg.gameState);
          }
        } else if (msg.type === 'ROOM_UPDATE') {
          if (msg.room) setRoom(msg.room);
          if (msg.announcement) {
            setAnnouncement(msg.announcement);
            sound.playCardSelect();
          }
        } else if (msg.type === 'GAME_STARTED') {
          if (msg.room) setRoom(msg.room);
          if (msg.gameState && onRemoteStateUpdate) {
            onRemoteStateUpdate(msg.gameState);
            sound.playAlertThreat();
          }
        } else if (msg.type === 'STATE_UPDATE') {
          if (msg.gameState && onRemoteStateUpdate) {
            onRemoteStateUpdate(msg.gameState);
          }
        } else if (msg.type === 'PLAYER_PRESENCE') {
          if (msg.room) setRoom(msg.room);
        } else if (msg.type === 'REACTION') {
          if (msg.reaction) {
            setReactions((prev) => [...prev.slice(-6), msg.reaction]);
            sound.playCoOpAssist();
          }
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    ws.onclose = () => {
      // Attempt auto-reconnect if still in a room
      if (activeRoomIdRef.current === roomId) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          connectSocket(roomId, playerId);
        }, 2500);
      }
    };

    ws.onerror = (e) => {
      console.warn('WebSocket encountered error, fallback polling active', e);
    };
  }, [onRemoteStateUpdate]);

  // Create room
  const createRoom = async (
    hostName: string,
    siblingId: string,
    customCode?: string,
    difficulty: 'casual' | 'standard' | 'nightmare' = 'standard'
  ) => {
    setIsConnecting(true);
    setError(null);
    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostName, siblingId, customCode, difficulty }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create room');
      }

      setLocalPlayerId(data.playerId);
      sessionStorage.setItem('candlelight_player_id', data.playerId);
      setRoom(data.room);
      connectSocket(data.roomId, data.playerId);
      return data;
    } catch (err: any) {
      setError(err.message || 'Error creating game room');
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  // Join room
  const joinRoom = async (roomId: string, name: string, siblingId: string) => {
    setIsConnecting(true);
    setError(null);
    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, name, siblingId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to join room');
      }

      setLocalPlayerId(data.playerId);
      sessionStorage.setItem('candlelight_player_id', data.playerId);
      setRoom(data.room);
      connectSocket(data.roomId, data.playerId);
      return data;
    } catch (err: any) {
      setError(err.message || 'Error joining room');
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  // Start game (Host only)
  const startGame = async () => {
    if (!room || !localPlayerId) return;
    try {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'START_GAME' }));
      } else {
        const res = await fetch(`/api/rooms/${room.roomId}/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId: localPlayerId }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to start game');
        }
        setRoom(data.room);
        if (data.gameState && onRemoteStateUpdate) {
          onRemoteStateUpdate(data.gameState);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error starting game');
    }
  };

  // Broadcast game action to all devices in the room
  const dispatchOnlineAction = useCallback((action: Action) => {
    if (!room || !localPlayerId) return;

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'ACTION',
          action,
        })
      );
    } else {
      // Fallback to REST endpoint
      fetch(`/api/rooms/${room.roomId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: localPlayerId, action }),
      }).catch((e) => console.error('REST action fallback error:', e));
    }
  }, [room, localPlayerId]);

  // Send fun reaction ping across devices
  const sendReaction = (emoji: string, text: string = '') => {
    if (!room || !localPlayerId) return;
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'REACTION',
          emoji,
          text,
        })
      );
    } else {
      fetch(`/api/rooms/${room.roomId}/reaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: localPlayerId, emoji, text }),
      }).catch((e) => console.error('Reaction fallback error:', e));
    }
  };

  // Leave room
  const leaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    clearTimeout(reconnectTimeoutRef.current);
    setRoom(null);
    activeRoomIdRef.current = null;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      clearTimeout(reconnectTimeoutRef.current);
    };
  }, []);

  const isHost = Boolean(room && localPlayerId && room.hostPlayerId === localPlayerId);
  const myPlayer = room?.players.find((p) => p.id === localPlayerId);

  return {
    room,
    localPlayerId,
    myPlayer,
    isHost,
    isConnecting,
    error,
    reactions,
    announcement,
    createRoom,
    joinRoom,
    startGame,
    dispatchOnlineAction,
    sendReaction,
    leaveRoom,
  };
}
