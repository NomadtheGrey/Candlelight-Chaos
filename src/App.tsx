/**
 * Candlelight Chaos: The Night the Goblins Came
 * A card-driven interactive narrative and tactical defense game
 * Designed for Human Players: Online Multi-Device Lobby & Same-Device Pass & Play
 */

import React, { useReducer, useState, useCallback, useEffect } from 'react';
import {
  gameReducer,
  createInitialState,
  Action,
} from './state/gameReducer';
import { Header } from './components/Header';
import { SquadStatusBar } from './components/SquadStatusBar';
import { RoomNavigator } from './components/RoomNavigator';
import { ActiveRoomView } from './components/ActiveRoomView';
import { CraftingWorkbench } from './components/CraftingWorkbench';
import { CardDrawer } from './components/CardDrawer';
import { CombatModal } from './components/CombatModal';
import { GameLog } from './components/GameLog';
import { GameOverModal } from './components/GameOverModal';
import { RecipeModal } from './components/RecipeModal';
import { GroupLobbyModal } from './components/GroupLobbyModal';
import { OnlineLobbyModal } from './components/OnlineLobbyModal';
import { ReactionPings } from './components/ReactionPings';
import { RoomId, PlayerCard, PlayerConfig } from './types/game';
import { useMultiplayerRoom } from './hooks/useMultiplayerRoom';
import { sound } from './utils/audio';
import { Wrench, Shield, AlertCircle, Users, Zap, Wifi, Sparkles, Copy, Check } from 'lucide-react';

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => createInitialState());
  const [showCrafting, setShowCrafting] = useState(true);
  const [showRecipes, setShowRecipes] = useState(false);
  const [showLocalLobbyModal, setShowLocalLobbyModal] = useState(false);
  const [showOnlineLobbyModal, setShowOnlineLobbyModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Sync state received from server over WebSocket / REST
  const handleRemoteStateUpdate = useCallback((nextState: any) => {
    if (nextState) {
      dispatch({ type: 'SYNC_FULL_STATE', state: nextState });
    }
  }, []);

  const multiplayer = useMultiplayerRoom({
    onRemoteStateUpdate: handleRemoteStateUpdate,
  });

  // Automatically open lobby modal if URL contains a ?room=XYZ invitation parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRoom = params.get('room');
      if (urlRoom && !multiplayer.room) {
        setShowOnlineLobbyModal(true);
      }
    }
  }, [multiplayer.room]);

  // Dispatch an action locally and synchronize with room if playing online
  const dispatchWithSync = useCallback(
    (action: Action) => {
      dispatch(action);
      if (multiplayer.room) {
        multiplayer.dispatchOnlineAction(action);
      }
    },
    [multiplayer]
  );

  const activePlayer = state.players[state.activePlayerIndex] || state.players[0];

  // In online play, determine if this device controls the active turn
  const isMyTurnOnline = Boolean(
    !multiplayer.room ||
      (multiplayer.myPlayer &&
        (activePlayer.id === multiplayer.myPlayer.id ||
          activePlayer.name.toLowerCase() === multiplayer.myPlayer.name.toLowerCase()))
  );

  const toggleSound = () => {
    sound.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  const handleMoveRoom = (roomId: RoomId) => {
    sound.playMoveRoom();
    dispatchWithSync({ type: 'MOVE_ROOM', roomId });
  };

  const handleSearch = () => {
    sound.playCardSelect();
    dispatchWithSync({ type: 'SEARCH_ROOM' });
  };

  const handleBarricade = () => {
    sound.playCardSelect();
    dispatchWithSync({ type: 'BARRICADE_ROOM' });
  };

  const handleStartCombat = (goblinId?: string) => {
    sound.playAlertThreat();
    dispatchWithSync({ type: 'START_COMBAT', goblinId });
  };

  const handleRollRound = () => {
    dispatchWithSync({ type: 'ROLL_COMBAT_ROUND' });
  };

  const handleCloseCombat = () => {
    dispatchWithSync({ type: 'CLOSE_COMBAT' });
  };

  const handleRetreat = () => {
    dispatchWithSync({ type: 'CLOSE_COMBAT' });
  };

  const handleParley = () => {
    sound.playCardSelect();
    dispatchWithSync({ type: 'PARLEY_GOBLINS' });
  };

  const handleCalmBeasts = () => {
    sound.playCardSelect();
    dispatchWithSync({ type: 'CALM_BEASTS' });
  };

  const handleEndTurn = () => {
    sound.playAlertThreat();
    dispatchWithSync({ type: 'END_TURN_DIRECTOR' });
  };

  const handleNextPlayerTurn = () => {
    sound.playTurnPass();
    dispatchWithSync({ type: 'NEXT_PLAYER_TURN' });
  };

  const handleSwitchPlayer = (playerIndex: number) => {
    sound.playCardSelect();
    dispatchWithSync({ type: 'SWITCH_ACTIVE_PLAYER', playerIndex });
  };

  const handleTradeCard = (targetPlayerId: string, cardId: string) => {
    sound.playCoOpAssist();
    dispatchWithSync({ type: 'TRADE_CARD', targetPlayerId, cardId });
  };

  const handleReviveSibling = (targetPlayerId: string) => {
    sound.playCraftSuccess();
    dispatchWithSync({ type: 'REVIVE_SIBLING', targetPlayerId });
  };

  const handleStashCard = (cardId: string) => {
    sound.playCardSelect();
    dispatchWithSync({ type: 'STASH_CARD', cardId });
  };

  const handleRetrieveStashCard = (cardId: string) => {
    sound.playCardSelect();
    dispatchWithSync({ type: 'RETRIEVE_STASH_CARD', cardId });
  };

  const handleConfigureLocalGroup = (
    gameMode: 'solo' | 'group',
    configs: PlayerConfig[],
    difficulty: 'casual' | 'standard' | 'nightmare'
  ) => {
    sound.playAlertThreat();
    dispatchWithSync({
      type: 'CONFIGURE_GROUP',
      gameMode,
      configs,
      difficulty,
    });
  };

  const handleSelectCraftCard = (cardId: string) => {
    dispatchWithSync({ type: 'SELECT_CRAFT_CARD', cardId });
  };

  const handleDeselectCraftCard = (cardId: string) => {
    dispatchWithSync({ type: 'DESELECT_CRAFT_CARD', cardId });
  };

  const handleClearSlots = () => {
    dispatchWithSync({ type: 'CLEAR_CRAFT_SLOTS' });
  };

  const handleCraftKludge = () => {
    sound.playCraftSuccess();
    dispatchWithSync({ type: 'CRAFT_KLUDGE' });
  };

  const handleEquipWeapon = (cardId: string) => {
    dispatchWithSync({ type: 'EQUIP_WEAPON', cardId });
  };

  const handleDiscardCard = (cardId: string) => {
    dispatchWithSync({ type: 'DISCARD_CARD', cardId });
  };

  const handleInspectCard = (card: PlayerCard | null) => {
    dispatchWithSync({ type: 'INSPECT_CARD', card });
  };

  const handleRestart = (siblingId: string) => {
    dispatchWithSync({ type: 'RESTART_GAME', siblingId });
  };

  const copyRoomInvite = () => {
    if (!multiplayer.room) return;
    const url = `${window.location.origin}${window.location.pathname}?room=${multiplayer.room.roomId}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      sound.playCardSelect();
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header with Candle vitality, Sibling HP, Clock, Online Lobby, and Audio Controls */}
      <Header
        state={state}
        onOpenRecipes={() => setShowRecipes(true)}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onOpenOnlineLobby={() => setShowOnlineLobbyModal(true)}
        onlineRoomCode={multiplayer.room?.roomId}
        onlinePlayersCount={multiplayer.room?.players.length}
      />

      {/* Main Game Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 flex flex-col gap-4 sm:gap-6">
        {/* Multi-Player Sibling Squad Status Bar */}
        <SquadStatusBar
          state={state}
          onSwitchPlayer={handleSwitchPlayer}
          onOpenSquadSetup={() => setShowOnlineLobbyModal(true)}
        />

        {/* Live Multi-Device Sibling Banner */}
        {multiplayer.room && (
          <div className="bg-emerald-950/60 border border-emerald-600/60 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Online Multi-Device Lobby: {multiplayer.room.roomId}
                </span>
                <p className="text-xs text-slate-300">
                  You are playing as:{' '}
                  <strong className="text-amber-300">
                    {multiplayer.myPlayer?.name || 'Human Player'} (
                    {state.players.find((p) => p.id === multiplayer.myPlayer?.id)?.sibling.name.split(' ')[0] || 'Defender'})
                  </strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyRoomInvite}
                className="px-3 py-1.5 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {linkCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Invite Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Invite Children (Copy Link)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Active Turn Announcement Banner */}
        <div className="bg-gradient-to-r from-amber-950/60 via-slate-900/90 to-amber-950/40 border border-amber-800/60 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-1.5 rounded-lg font-bold text-xs flex items-center gap-1 shadow ${
                isMyTurnOnline
                  ? 'bg-amber-500 text-slate-950 animate-pulse'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isMyTurnOnline ? 'YOUR TURN' : 'ACTIVE TURN'}</span>
            </div>
            <div>
              <span className="font-['Cinzel'] font-bold text-sm sm:text-base text-amber-200">
                {activePlayer.name} ({activePlayer.sibling.name.split(' ')[0]})
              </span>
              <span className="text-xs text-slate-400 block sm:inline sm:ml-2">
                • {activePlayer.actionsLeft} Action Point(s) Remaining this turn
                {!isMyTurnOnline && multiplayer.room && ' (Taking actions on their device)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHowToPlay(!showHowToPlay)}
              className="text-xs text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
            >
              {showHowToPlay ? 'Hide Guide' : 'Group Play & Rules Guide'}
            </button>
          </div>
        </div>

        {/* Quick How-To-Play Collapsible Banner */}
        {showHowToPlay && (
          <div className="bg-slate-900/95 border border-amber-600/50 rounded-xl p-4 text-xs text-slate-300 grid grid-cols-1 md:grid-cols-4 gap-4 shadow-xl">
            <div>
              <h4 className="font-bold text-amber-300 mb-1 flex items-center gap-1.5 font-['Cinzel']">
                <Users className="w-4 h-4 text-amber-400" />
                1. Multi-Device Sibling Squad
              </h4>
              <p className="text-slate-400 leading-relaxed">
                Click <strong>"Online Lobby"</strong> in the top bar to create a room code (e.g. <em>GOBLIN-42</em>). Children can join on their own devices or tablets by opening the link or typing the code!
              </p>
            </div>
            <div>
              <h4 className="font-bold text-amber-300 mb-1 flex items-center gap-1.5 font-['Cinzel']">
                <Shield className="w-4 h-4 text-emerald-400" />
                2. In-Room Co-Op Assists
              </h4>
              <p className="text-slate-400 leading-relaxed">
                When siblings gather in the same room, combat awards an automatic <strong>+1 Assist Die</strong>! Siblings can also trade scavenged items and revive teammates when downed.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-amber-300 mb-1 flex items-center gap-1.5 font-['Cinzel']">
                <Wrench className="w-4 h-4 text-amber-400" />
                3. Junk Magic & Stash
              </h4>
              <p className="text-slate-400 leading-relaxed">
                Combine 2 or 3 cards in the bench to synthesize Kludge Weapons. Visit the <strong>Living Room</strong> to access the communal supply trunk and deposit items for other siblings!
              </p>
            </div>
            <div>
              <h4 className="font-bold text-amber-300 mb-1 flex items-center gap-1.5 font-['Cinzel']">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                4. Automated Goblin Director
              </h4>
              <p className="text-slate-400 leading-relaxed">
                At the end of each round, threats escalate across the house. Overrun rooms empower goblins and spill them into adjoining halls. Survive 20 rounds until dawn breaks!
              </p>
            </div>
          </div>
        )}

        {/* Section 1: House Blueprint & Active Room View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: House Blueprint Navigator (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <RoomNavigator state={state} onMoveRoom={handleMoveRoom} />

            {/* Quick Workbench toggle if hidden */}
            {!showCrafting && (
              <button
                onClick={() => setShowCrafting(true)}
                className="w-full py-2.5 bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 border border-amber-700/60 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
              >
                <Wrench className="w-4 h-4 text-amber-400" />
                <span>Open Crafting Bench</span>
              </button>
            )}
          </div>

          {/* Right Column: Active Room Exploration & Tactical Actions (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            <ActiveRoomView
              state={state}
              onSearch={handleSearch}
              onBarricade={handleBarricade}
              onStartCombat={handleStartCombat}
              onParley={handleParley}
              onCalmBeasts={handleCalmBeasts}
              onEndTurn={handleEndTurn}
              onNextPlayerTurn={handleNextPlayerTurn}
              onOpenCrafting={() => setShowCrafting(true)}
              onTradeCard={handleTradeCard}
              onReviveSibling={handleReviveSibling}
              onStashCard={handleStashCard}
              onRetrieveStashCard={handleRetrieveStashCard}
            />
          </div>
        </div>

        {/* Section 2: Interactive Kludge Crafting Bench (when active) */}
        {showCrafting && (
          <CraftingWorkbench
            state={state}
            onDeselectCraftCard={handleDeselectCraftCard}
            onClearSlots={handleClearSlots}
            onCraftKludge={handleCraftKludge}
            onClose={() => setShowCrafting(false)}
          />
        )}

        {/* Section 3: Card Drawer & Player Hand */}
        <CardDrawer
          state={state}
          onSelectCraftCard={handleSelectCraftCard}
          onDeselectCraftCard={handleDeselectCraftCard}
          onEquipWeapon={handleEquipWeapon}
          onDiscardCard={handleDiscardCard}
          onInspectCard={handleInspectCard}
        />

        {/* Real-Time Sibling Cheer Reactions */}
        <ReactionPings
          reactions={multiplayer.reactions}
          onSendReaction={(emoji, text) => multiplayer.sendReaction(emoji, text)}
        />

        {/* Section 4: Scrollable Narrative & Combat Log Feed */}
        <GameLog logs={state.gameLog} />
      </main>

      {/* Online Multi-Device Lobby Modal */}
      <OnlineLobbyModal
        isOpen={showOnlineLobbyModal}
        onClose={() => setShowOnlineLobbyModal(false)}
        room={multiplayer.room}
        localPlayerId={multiplayer.localPlayerId}
        isHost={multiplayer.isHost}
        isConnecting={multiplayer.isConnecting}
        error={multiplayer.error}
        onCreateRoom={multiplayer.createRoom}
        onJoinRoom={multiplayer.joinRoom}
        onUpdatePlayer={multiplayer.updatePlayerInLobby}
        onStartGame={multiplayer.startGame}
        onSwitchToLocalGroup={() => setShowLocalLobbyModal(true)}
      />

      {/* Local Pass & Play Same-Device Squad Setup Modal */}
      <GroupLobbyModal
        isOpen={showLocalLobbyModal}
        onClose={() => setShowLocalLobbyModal(false)}
        onStartGame={handleConfigureLocalGroup}
        currentConfigs={state.players.map((p) => ({
          id: p.id,
          name: p.name,
          siblingId: p.sibling.id,
          traitId: p.trait?.traitId,
          color: 'amber',
        }))}
        currentGameMode={state.gameMode}
      />

      {/* Combat Dice Duel Modal */}
      {state.phase === 'combat' && state.activeDuel && (
        <CombatModal
          state={state}
          onRollRound={handleRollRound}
          onCloseCombat={handleCloseCombat}
          onRetreat={handleRetreat}
        />
      )}

      {/* Blueprints / Recipe Handbook Modal */}
      <RecipeModal
        isOpen={showRecipes}
        onClose={() => setShowRecipes(false)}
        discoveredRecipes={state.discoveredRecipes}
      />

      {/* Game Over Modal (Victory or Defeat) */}
      {(state.phase === 'victory' || state.phase === 'defeat') && (
        <GameOverModal state={state} onRestart={handleRestart} />
      )}
    </div>
  );
}
