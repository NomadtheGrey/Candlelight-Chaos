import React from 'react';
import {
  Users,
  Wrench,
  Eye,
  Shield,
  Sparkles,
  Zap,
  Heart,
  Footprints,
  Sword,
  AlertTriangle,
  Settings2,
  Award,
} from 'lucide-react';
import { GameState, PlayerData } from '../types/game';
import { ROOMS_GRAPH, MASTER_TRAITS_ROSTER } from '../data/gameData';

interface SquadStatusBarProps {
  state: GameState;
  onSwitchPlayer: (index: number) => void;
  onOpenSquadSetup: () => void;
}

const SIBLING_ICONS: Record<string, React.ElementType> = {
  Wrench,
  Eye,
  Shield,
  Sparkles,
};

export const SquadStatusBar: React.FC<SquadStatusBarProps> = ({
  state,
  onSwitchPlayer,
  onOpenSquadSetup,
}) => {
  return (
    <div className="bg-slate-900/95 border border-amber-900/40 rounded-xl p-3 shadow-xl backdrop-blur-md">
      {/* Top Label & Mode Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-950 text-amber-400 border border-amber-800">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-['Cinzel'] font-bold text-xs md:text-sm text-slate-100 tracking-wider uppercase">
                Sibling Defense Squad
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-700/60 uppercase">
                {state.playerCount} {state.playerCount === 1 ? 'Player (Solo)' : 'Players (Group Co-Op)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Round {state.roundNumber} • Click any sibling card to inspect their hand or pass the turn
            </p>
          </div>
        </div>

        <button
          onClick={onOpenSquadSetup}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:text-amber-200 bg-slate-800 hover:bg-slate-700 border border-amber-800/50 rounded-lg transition-colors cursor-pointer"
        >
          <Settings2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Player & Group Options</span>
        </button>
      </div>

      {/* Grid of Players */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {state.players.map((player, idx) => {
          const isActive = idx === state.activePlayerIndex;
          const roomNode = ROOMS_GRAPH[player.currentRoom];
          const SiblingIcon = SIBLING_ICONS[player.sibling.iconName] || Shield;
          const equipped = player.hand.find(
            (c) => c.id === player.equippedWeaponId && c.type === 'kludge_weapon'
          );

          return (
            <div
              key={player.id}
              onClick={() => onSwitchPlayer(idx)}
              className={`rounded-xl p-2.5 border transition-all cursor-pointer relative overflow-hidden select-none ${
                isActive
                  ? 'bg-amber-950/50 border-amber-400 ring-2 ring-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                  : player.isDowned
                  ? 'bg-rose-950/40 border-rose-800 opacity-80'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Active Glow Accent Bar */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500" />
              )}

              {/* Player Header */}
              <div className="flex items-start justify-between gap-1 mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-lg border ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 border-amber-300'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    <SiblingIcon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      P{idx + 1} • {player.name}
                    </span>
                    <span className="text-xs font-bold text-slate-100 truncate block max-w-[110px]">
                      {player.sibling.name.split(' ')[0]}
                    </span>
                  </div>
                </div>

                {/* Status Pills */}
                <div>
                  {isActive ? (
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 animate-pulse">
                      Active
                    </span>
                  ) : player.isDowned ? (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700 flex items-center gap-0.5">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      Downed
                    </span>
                  ) : player.hasTakenTurnThisRound ? (
                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      Done
                    </span>
                  ) : (
                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Ready
                    </span>
                  )}
                </div>
              </div>

              {/* HP Bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-400 fill-rose-500/20" />
                    HP
                  </span>
                  <span className={`font-bold ${player.hp <= 3 ? 'text-rose-400' : 'text-slate-200'}`}>
                    {player.hp}/{player.maxHp}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      player.hp <= 3 ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Room Location & Action Points */}
              <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-900 text-slate-300">
                <span className="flex items-center gap-1 text-slate-400 truncate max-w-[105px]">
                  <Footprints className="w-3 h-3 text-amber-500 shrink-0" />
                  {roomNode.name}
                </span>

                <span className="flex items-center gap-1 font-semibold text-amber-300 shrink-0">
                  <Zap className="w-3 h-3 text-amber-400" />
                  {player.actionsLeft} AP
                </span>
              </div>

              {/* Sibling Trait & Evolution Status */}
              {(() => {
                const trait = player.trait;
                if (!trait) return null;
                const req = trait.evolutionTrigger;
                const currentProg = player.evolutionProgress || 0;
                const isEvolved = trait.isEvolved;

                return (
                  <div
                    title={isEvolved ? `${trait.evolvedName}: ${trait.evolvedDescription}` : `${trait.name}: ${trait.description}`}
                    className={`mt-1.5 px-1.5 py-1 rounded text-[9px] border flex flex-col gap-0.5 ${
                      isEvolved
                        ? 'bg-amber-950/70 border-amber-500/80 text-amber-200'
                        : 'bg-slate-900/90 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold flex items-center gap-1 truncate">
                        {isEvolved ? (
                          <>
                            <Award className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                            <span className="text-amber-300">{trait.evolvedName}</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                            <span>{trait.name}</span>
                          </>
                        )}
                      </span>
                      <span className="text-[8.5px] font-semibold opacity-80 shrink-0">
                        {isEvolved ? 'EVOLVED' : `${currentProg}/${req.targetCount}`}
                      </span>
                    </div>

                    {!isEvolved && (
                      <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (currentProg / req.targetCount) * 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Equipped Weapon pill */}
              <div className="mt-1 text-[9.5px] truncate text-slate-400 flex items-center gap-1 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800">
                <Sword className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                <span className="truncate">
                  {equipped && equipped.type === 'kludge_weapon'
                    ? `${equipped.name} (${(equipped as any).durability}/${(equipped as any).maxDurability})`
                    : equipped
                    ? equipped.name
                    : 'Bare Hands (1d6)'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
