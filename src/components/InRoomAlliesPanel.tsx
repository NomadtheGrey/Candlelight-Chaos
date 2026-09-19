import React, { useState } from 'react';
import {
  Users,
  Heart,
  HandMetal,
  Package,
  ArrowRightLeft,
  Sparkles,
  Shield,
  Wrench,
  AlertTriangle,
  Plus,
  ArrowDownToLine,
  ArrowUpFromLine,
} from 'lucide-react';
import { GameState, PlayerCard, PlayerData } from '../types/game';

interface InRoomAlliesPanelProps {
  state: GameState;
  onTradeCard: (targetPlayerId: string, cardId: string) => void;
  onReviveSibling: (targetPlayerId: string) => void;
  onStashCard: (cardId: string) => void;
  onRetrieveStashCard: (cardId: string) => void;
}

export const InRoomAlliesPanel: React.FC<InRoomAlliesPanelProps> = ({
  state,
  onTradeCard,
  onReviveSibling,
  onStashCard,
  onRetrieveStashCard,
}) => {
  const activePlayer = state.players[state.activePlayerIndex];
  const alliesInRoom = state.players.filter(
    (p) => p.id !== activePlayer.id && p.currentRoom === activePlayer.currentRoom
  );

  const isLivingRoom = activePlayer.currentRoom === 'living_room';
  const [tradingTargetId, setTradingTargetId] = useState<string | null>(null);
  const [showDepositPicker, setShowDepositPicker] = useState<boolean>(false);

  if (alliesInRoom.length === 0 && !isLivingRoom) {
    return null;
  }

  return (
    <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-3">
      {/* 1. Allies In Room Section */}
      {alliesInRoom.length > 0 && (
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 font-['Cinzel'] tracking-wide uppercase">
              <Users className="w-3.5 h-3.5" />
              <span>In-Room Allies ({alliesInRoom.length})</span>
            </div>

            <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-950/70 border border-emerald-700/60 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              +1 Co-Op Assist Die Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {alliesInRoom.map((ally) => (
              <div
                key={ally.id}
                className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-100">{ally.name}</span>
                    <span className="text-[10px] text-slate-400">({ally.sibling.name.split(' ')[0]})</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span className="text-rose-400 font-medium">
                      {ally.hp}/{ally.maxHp} HP
                    </span>
                    <span>•</span>
                    <span>{ally.hand.length} cards</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {ally.isDowned ? (
                    <button
                      onClick={() => onReviveSibling(ally.id)}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-slate-950 font-bold text-[10px] uppercase rounded border border-rose-400 flex items-center gap-1 cursor-pointer animate-bounce"
                    >
                      <Heart className="w-3 h-3" />
                      Revive!
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        setTradingTargetId(tradingTargetId === ally.id ? null : ally.id)
                      }
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-700/70 font-semibold text-[10px] rounded flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <ArrowRightLeft className="w-3 h-3 text-amber-400" />
                      Trade
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Card Handoff Drawer */}
          {tradingTargetId && (
            <div className="mt-2.5 p-2.5 bg-slate-900 border border-amber-800/60 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-amber-300">
                  Select an item to give to{' '}
                  {alliesInRoom.find((a) => a.id === tradingTargetId)?.name}:
                </span>
                <button
                  onClick={() => setTradingTargetId(null)}
                  className="text-[10px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {activePlayer.hand.length === 0 ? (
                <p className="text-[10px] text-slate-500 italic">No cards in your hand to trade.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {activePlayer.hand.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => {
                        onTradeCard(tradingTargetId, card.id);
                        setTradingTargetId(null);
                      }}
                      className="p-1.5 bg-slate-950 border border-slate-700 hover:border-amber-500 rounded text-left transition-colors cursor-pointer"
                    >
                      <span className="text-[11px] font-bold text-slate-200 block truncate">
                        {card.name}
                      </span>
                      <span className="text-[9px] text-amber-400 capitalize block">
                        {card.type === 'kludge_weapon' ? 'Kludge Weapon' : (card as any).category}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. Communal Living Room Supply Trunk */}
      {isLivingRoom && (
        <div className="border-t border-slate-800/80 pt-2.5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 font-['Cinzel'] tracking-wide uppercase">
              <Package className="w-3.5 h-3.5 text-amber-400" />
              <span>Communal Supply Trunk (Living Room)</span>
            </div>

            <button
              onClick={() => setShowDepositPicker(!showDepositPicker)}
              className="text-[10px] font-semibold text-amber-300 hover:text-amber-200 bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ArrowDownToLine className="w-2.5 h-2.5 text-amber-400" />
              Deposit Item
            </button>
          </div>

          {showDepositPicker && (
            <div className="mb-2 p-2 bg-slate-900 border border-amber-800/60 rounded-lg">
              <div className="flex justify-between items-center mb-1 text-[11px] text-amber-200 font-medium">
                <span>Choose item to store for allies:</span>
                <button
                  onClick={() => setShowDepositPicker(false)}
                  className="text-[10px] text-slate-400 underline cursor-pointer"
                >
                  Done
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {activePlayer.hand.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => onStashCard(card.id)}
                    className="p-1.5 bg-slate-950 border border-slate-700 hover:border-amber-400 rounded text-left text-[10px] font-medium text-slate-200 truncate cursor-pointer transition-colors"
                  >
                    + {card.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stashed items in the trunk */}
          {state.sharedStash.length === 0 ? (
            <p className="text-[11px] text-slate-500 italic py-1">
              Trunk is currently empty. Any sibling passing through the Living Room can deposit items here for the group.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
              {state.sharedStash.map((card) => (
                <div
                  key={card.id}
                  className="bg-slate-900 border border-amber-900/50 rounded-lg p-1.5 flex items-center justify-between gap-1 text-[11px]"
                >
                  <span className="truncate text-slate-200 font-medium">{card.name}</span>
                  <button
                    onClick={() => onRetrieveStashCard(card.id)}
                    title="Take into inventory"
                    className="p-1 text-[9px] font-bold bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-700 rounded transition-colors cursor-pointer shrink-0"
                  >
                    Take
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
