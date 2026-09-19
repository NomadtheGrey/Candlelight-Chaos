import React from 'react';
import {
  Search,
  Sword,
  Shield,
  Clock,
  Flame,
  Skull,
  Wrench,
  Zap,
  ArrowRight,
  MessageSquare,
  HeartHandshake,
} from 'lucide-react';
import { GameState } from '../types/game';
import { ROOMS_GRAPH } from '../data/gameData';
import { InRoomAlliesPanel } from './InRoomAlliesPanel';

interface ActiveRoomViewProps {
  state: GameState;
  onSearch: () => void;
  onBarricade: () => void;
  onStartCombat: (goblinId?: string) => void;
  onParley?: () => void;
  onCalmBeasts?: () => void;
  onEndTurn: () => void;
  onNextPlayerTurn: () => void;
  onOpenCrafting: () => void;
  onTradeCard: (targetPlayerId: string, cardId: string) => void;
  onReviveSibling: (targetPlayerId: string) => void;
  onStashCard: (cardId: string) => void;
  onRetrieveStashCard: (cardId: string) => void;
}

export const ActiveRoomView: React.FC<ActiveRoomViewProps> = ({
  state,
  onSearch,
  onBarricade,
  onStartCombat,
  onParley,
  onCalmBeasts,
  onEndTurn,
  onNextPlayerTurn,
  onOpenCrafting,
  onTradeCard,
  onReviveSibling,
  onStashCard,
  onRetrieveStashCard,
}) => {
  const currentRoom = ROOMS_GRAPH[state.currentRoom];
  const roomState = state.houseState[state.currentRoom];
  const searchesRemaining = currentRoom.maxSearchCount - roomState.searchedCount;
  const activeGoblins = roomState.goblins;
  const hasGoblins = activeGoblins.length > 0;
  const activePlayer = state.players[state.activePlayerIndex];

  return (
    <div className="bg-slate-900/90 border border-amber-900/40 rounded-xl p-4 sm:p-5 shadow-2xl backdrop-blur-md flex flex-col gap-4">
      {/* Room Header & Atmospheric Narrative */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h2 className="font-['Cinzel'] font-bold text-xl md:text-2xl text-amber-200 tracking-wide">
              {currentRoom.name}
            </h2>
            {roomState.isOverrun && (
              <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-rose-950 text-rose-300 border border-rose-600 rounded animate-pulse">
                OVERRUN
              </span>
            )}
            {roomState.barricadeLevel > 0 && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-700/60 rounded">
                Barricaded (Lv {roomState.barricadeLevel})
              </span>
            )}
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
              Active Turn: {activePlayer.name}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-serif italic mb-1">
            "{currentRoom.flavor}"
          </p>
          <p className="text-xs text-slate-400">
            {currentRoom.description}
          </p>
        </div>

        {/* Threat Level 1 to 5 Visual Segment Meter */}
        <div className="bg-slate-950/80 border border-amber-900/40 p-3 rounded-lg flex flex-col items-end min-w-[150px]">
          <div className="flex items-center justify-between w-full text-xs font-semibold mb-1.5">
            <span className="text-slate-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              Threat Level
            </span>
            <span
              className={`font-bold ${
                roomState.threatLevel >= 4
                  ? 'text-rose-400'
                  : roomState.threatLevel >= 3
                  ? 'text-orange-400'
                  : 'text-emerald-400'
              }`}
            >
              {roomState.threatLevel} / 5
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 w-full">
            {[1, 2, 3, 4, 5].map((lvl) => {
              const active = lvl <= roomState.threatLevel;
              return (
                <div
                  key={lvl}
                  className={`h-2 rounded-sm transition-all duration-300 ${
                    active
                      ? lvl >= 5
                        ? 'bg-rose-600 shadow-[0_0_6px_rgba(225,29,72,0.8)]'
                        : lvl >= 4
                        ? 'bg-red-500'
                        : lvl >= 3
                        ? 'bg-orange-500'
                        : lvl >= 2
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                      : 'bg-slate-800'
                  }`}
                />
              );
            })}
          </div>

          <span className="text-[10px] text-slate-400 mt-1.5">
            Searches: <strong className="text-slate-200">{searchesRemaining}</strong> left
          </span>
        </div>
      </div>

      {/* Multi-Player Co-Op: In-Room Allies & Communal Living Room Trunk */}
      <InRoomAlliesPanel
        state={state}
        onTradeCard={onTradeCard}
        onReviveSibling={onReviveSibling}
        onStashCard={onStashCard}
        onRetrieveStashCard={onRetrieveStashCard}
      />

      {/* Active Goblins In This Room */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="font-['Cinzel'] font-bold text-sm text-slate-200 tracking-wide uppercase flex items-center gap-1.5">
            <Skull className="w-4 h-4 text-rose-500" />
            Lurking Goblins ({activeGoblins.length})
          </h3>
          {hasGoblins && (
            <span className="text-xs text-rose-400 font-semibold animate-pulse">
              Combat Encounter Imminent!
            </span>
          )}
        </div>

        {hasGoblins ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeGoblins.map((goblin) => (
              <div
                key={goblin.id}
                className="bg-slate-950/80 border-2 border-rose-900/60 rounded-xl p-3 shadow-lg relative overflow-hidden group hover:border-rose-600 transition-colors"
              >
                {/* Tier & Name */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                      {goblin.title}
                    </span>
                    <h4 className="text-sm font-bold text-slate-100 mt-1 flex items-center gap-1.5">
                      {goblin.name}
                      {goblin.isBuffed && (
                        <span className="text-[10px] text-amber-400 font-semibold" title="Armed with looted tools (+1 die)">
                          ⚡ Looted
                        </span>
                      )}
                    </h4>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40">
                      Pool: {goblin.dicePool + (goblin.isBuffed ? 1 : 0)}d6
                    </span>
                  </div>
                </div>

                {/* HP Bar */}
                <div className="mb-2.5">
                  <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                    <span>Vitality</span>
                    <span className="font-bold text-rose-400">
                      {goblin.hp} / {goblin.maxHp} HP
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-rose-600 to-red-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${(goblin.hp / goblin.maxHp) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Trait / Rule */}
                <p className="text-[11px] text-slate-400 bg-slate-900/80 p-2 rounded border border-slate-800 mb-3">
                  <strong className="text-amber-300 font-semibold">Special:</strong> {goblin.specialRule}
                </p>

                {/* Duel Action Button */}
                <button
                  onClick={() => onStartCombat(goblin.id)}
                  className="w-full py-2 bg-gradient-to-r from-rose-700 to-rose-900 hover:from-rose-600 hover:to-rose-800 text-rose-100 font-bold text-xs uppercase tracking-wider rounded-lg border border-rose-500/60 shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <Sword className="w-3.5 h-3.5 text-amber-300" />
                  Engage in Dice Duel
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-5 text-center text-slate-400">
            <Shield className="w-7 h-7 text-emerald-500/60 mx-auto mb-1.5" />
            <p className="text-sm font-medium text-slate-300">The {currentRoom.name} is currently secure.</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Scavenge for junk components, fortify doors, or coordinate with siblings before the Director strikes!
            </p>
          </div>
        )}
      </div>

      {/* Tactical Turn Progression Loop Actions */}
      <div className="border-t border-slate-800 pt-3 flex flex-wrap items-center gap-2.5">
        {/* Search Room */}
        <button
          onClick={onSearch}
          disabled={searchesRemaining <= 0 || activePlayer.actionsLeft <= 0}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all border shadow-sm cursor-pointer ${
            searchesRemaining > 0 && activePlayer.actionsLeft > 0
              ? 'bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 border-amber-700/60 active:scale-95'
              : 'bg-slate-800/40 text-slate-600 border-slate-800 cursor-not-allowed'
          }`}
        >
          <Search className="w-4 h-4 text-amber-400" />
          <span>Search ({searchesRemaining})</span>
        </button>

        {/* Fight Goblins */}
        <button
          onClick={() => onStartCombat()}
          disabled={!hasGoblins}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all border shadow-sm cursor-pointer ${
            hasGoblins
              ? 'bg-gradient-to-r from-rose-800 to-rose-950 hover:from-rose-700 hover:to-rose-900 text-rose-100 border-rose-600 active:scale-95 animate-pulse'
              : 'bg-slate-800/40 text-slate-600 border-slate-800 cursor-not-allowed'
          }`}
        >
          <Sword className="w-4 h-4 text-rose-400" />
          <span>Fight ({activeGoblins.length})</span>
        </button>

        {/* Barricade Room */}
        <button
          onClick={onBarricade}
          disabled={roomState.barricadeLevel >= 2 || activePlayer.actionsLeft <= 0}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-lg font-bold text-xs border flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer ${
            roomState.barricadeLevel < 2 && activePlayer.actionsLeft > 0
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              : 'bg-slate-800/40 text-slate-600 border-slate-800 cursor-not-allowed'
          }`}
        >
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Barricade Door</span>
        </button>

        {/* Parley (Goblin Talker / Diplomat) */}
        {hasGoblins && onParley && (
          <button
            onClick={onParley}
            disabled={activePlayer.actionsLeft <= 0}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-lg font-bold text-xs border flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer ${
              activePlayer.actionsLeft > 0
                ? 'bg-purple-950/70 hover:bg-purple-900/80 text-purple-200 border-purple-600/70 shadow-sm'
                : 'bg-slate-800/40 text-slate-600 border-slate-800 cursor-not-allowed'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span>Parley ({activePlayer.trait?.traitId === 'goblin_talker' ? '+Bonus' : 'Talk'})</span>
          </button>
        )}

        {/* Calm Beasts (Animal Lover / Beastmaster) */}
        {activeGoblins.some(
          (g) =>
            g.id.startsWith('scrapper_slipper') ||
            g.name.toLowerCase().includes('hound') ||
            g.name.toLowerCase().includes('biter') ||
            g.specialRule.toLowerCase().includes('beast')
        ) && onCalmBeasts && (
          <button
            onClick={onCalmBeasts}
            disabled={activePlayer.actionsLeft <= 0}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-lg font-bold text-xs border flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer ${
              activePlayer.actionsLeft > 0
                ? 'bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-200 border-emerald-600/70 shadow-sm'
                : 'bg-slate-800/40 text-slate-600 border-slate-800 cursor-not-allowed'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-emerald-400" />
            <span>Calm Beast</span>
          </button>
        )}

        {/* Craft Kludge */}
        <button
          onClick={onOpenCrafting}
          className="flex-1 min-w-[130px] py-2.5 px-3 rounded-lg font-bold text-xs bg-amber-600/90 hover:bg-amber-500 text-slate-950 border border-amber-400 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-amber-600/20 cursor-pointer"
        >
          <Wrench className="w-4 h-4 text-slate-950" />
          <span>Craft Kludge</span>
        </button>

        {/* Pass Turn to Next Sibling or End Turn for Director */}
        {state.playerCount > 1 ? (
          <button
            onClick={onNextPlayerTurn}
            className="flex-1 min-w-[170px] py-2.5 px-3 rounded-lg font-bold text-xs bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 border border-amber-300 flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md cursor-pointer"
          >
            <span>Pass Turn to Next Sibling</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        ) : (
          <button
            onClick={onEndTurn}
            className="flex-1 min-w-[140px] py-2.5 px-3 rounded-lg font-bold text-xs bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-amber-300 border border-amber-800/80 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>End Turn (Director)</span>
          </button>
        )}
      </div>
    </div>
  );
};
