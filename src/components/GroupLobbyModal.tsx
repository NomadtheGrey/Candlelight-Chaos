import React, { useState } from 'react';
import {
  Users,
  X,
  Sparkles,
  Shield,
  Wrench,
  Eye,
  Check,
  Flame,
  Moon,
  Skull,
  UserCheck,
  Gamepad2,
} from 'lucide-react';
import { PlayerConfig } from '../types/game';
import { SIBLINGS_ROSTER } from '../data/gameData';

interface GroupLobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (
    gameMode: 'solo' | 'group',
    configs: PlayerConfig[],
    difficulty: 'casual' | 'standard' | 'nightmare'
  ) => void;
  currentConfigs: PlayerConfig[];
  currentGameMode: 'solo' | 'group';
}

const SIBLING_ICONS: Record<string, React.ElementType> = {
  Wrench,
  Eye,
  Shield,
  Sparkles,
};

const DEFAULT_NAMES = ['Leo', 'Maya', 'Sam', 'Clara'];

export const GroupLobbyModal: React.FC<GroupLobbyModalProps> = ({
  isOpen,
  onClose,
  onStartGame,
  currentConfigs,
  currentGameMode,
}) => {
  const [playerCount, setPlayerCount] = useState<number>(
    currentConfigs.length > 0 ? currentConfigs.length : 3
  );
  const [gameMode, setGameMode] = useState<'solo' | 'group'>(
    playerCount === 1 ? 'solo' : 'group'
  );
  const [difficulty, setDifficulty] = useState<'casual' | 'standard' | 'nightmare'>('standard');

  const [players, setPlayers] = useState<PlayerConfig[]>(() => {
    if (currentConfigs && currentConfigs.length > 0) {
      return currentConfigs;
    }
    return [
      { id: 'p1', name: 'Player 1', siblingId: 'leo', color: 'amber' },
      { id: 'p2', name: 'Player 2', siblingId: 'maya', color: 'emerald' },
      { id: 'p3', name: 'Player 3', siblingId: 'sam', color: 'cyan' },
      { id: 'p4', name: 'Player 4', siblingId: 'clara', color: 'purple' },
    ];
  });

  if (!isOpen) return null;

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    if (count === 1) {
      setGameMode('solo');
    } else {
      setGameMode('group');
    }

    // Ensure we have enough configs
    const newPlayers = [...players];
    while (newPlayers.length < count) {
      const idx = newPlayers.length;
      const sib = SIBLINGS_ROSTER[idx % SIBLINGS_ROSTER.length];
      newPlayers.push({
        id: `p${idx + 1}`,
        name: `Player ${idx + 1}`,
        siblingId: sib.id,
        color: ['amber', 'emerald', 'cyan', 'purple'][idx % 4],
      });
    }
    setPlayers(newPlayers);
  };

  const handleUpdateName = (index: number, name: string) => {
    const updated = [...players];
    updated[index] = { ...updated[index], name };
    setPlayers(updated);
  };

  const handleUpdateSibling = (index: number, siblingId: string) => {
    const updated = [...players];
    updated[index] = { ...updated[index], siblingId };
    setPlayers(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeConfigs = players.slice(0, playerCount);
    onStartGame(gameMode, activeConfigs, difficulty);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-amber-600/70 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-900/40 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl shadow-md">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-['Cinzel'] font-bold text-xl text-amber-200 tracking-wide">
                Multi-Player & Sibling Squad Options
              </h3>
              <p className="text-xs text-slate-400">
                Configure your defense group for Pass & Play or cooperative squad play
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1.5 space-y-5">
          {/* Section 1: Number of Players */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              1. How many players in your group?
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {[1, 2, 3, 4].map((count) => (
                <button
                  type="button"
                  key={count}
                  onClick={() => handlePlayerCountChange(count)}
                  className={`py-3 px-2 rounded-xl border text-center font-bold text-sm transition-all cursor-pointer ${
                    playerCount === count
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 scale-102 ring-2 ring-amber-300'
                      : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-center mb-1">
                    <Users className="w-4 h-4" />
                  </div>
                  <span>{count} {count === 1 ? 'Player' : 'Players'}</span>
                  <span className="block text-[10px] font-medium opacity-80 mt-0.5">
                    {count === 1 ? 'Solo' : count === 2 ? 'Duo Co-Op' : count === 3 ? 'Trio Squad' : 'Full House'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Mode Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              2. Play Style
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGameMode('group')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  gameMode === 'group'
                    ? 'bg-amber-950/60 border-amber-500 text-amber-200 ring-1 ring-amber-400'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-slate-100 mb-1">
                  <Gamepad2 className="w-4 h-4 text-amber-400" />
                  Pass & Play / Couch Co-Op
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Players take individual turns in round sequence, passing the device or calling out actions, with in-room co-op dice assists and item handoffs.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setGameMode('solo')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  gameMode === 'solo'
                    ? 'bg-amber-950/60 border-amber-500 text-amber-200 ring-1 ring-amber-400'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-slate-100 mb-1">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  Single Commander Mode
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  One person commands the whole sibling defense squad or explores with a single champion.
                </p>
              </button>
            </div>
          </div>

          {/* Section 3: Player Roster & Sibling Assignment */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              3. Customize Sibling Assignment & Player Names
            </label>
            <div className="space-y-3">
              {players.slice(0, playerCount).map((p, idx) => {
                const assignedSibling = SIBLINGS_ROSTER.find((s) => s.id === p.siblingId) || SIBLINGS_ROSTER[0];
                const IconComponent = SIBLING_ICONS[assignedSibling.iconName] || Shield;

                return (
                  <div
                    key={p.id}
                    className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    {/* Player Info & Name Input */}
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-amber-950 text-amber-400 border border-amber-800/80 shrink-0">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">
                          Player {idx + 1} Name
                        </span>
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => handleUpdateName(idx, e.target.value)}
                          placeholder={`Player ${idx + 1}`}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-semibold focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Sibling Character Selector */}
                    <div className="flex-1 sm:max-w-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Assigned Sibling Role
                      </span>
                      <select
                        value={p.siblingId}
                        onChange={(e) => handleUpdateSibling(idx, e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-200 font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        {SIBLINGS_ROSTER.map((sib) => (
                          <option key={sib.id} value={sib.id}>
                            {sib.name} ({sib.role} - {sib.hp} HP)
                          </option>
                        ))}
                      </select>
                      <span className="text-[10px] text-slate-400 block mt-1 line-clamp-1 italic">
                        {assignedSibling.trait}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Night Setting / Difficulty */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              4. Siege Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2.5 text-xs">
              {[
                { id: 'casual', title: 'Cozy Night', desc: 'More candle oil, gentle initial incursions.' },
                { id: 'standard', title: 'Standard Siege', desc: 'Tactical balance, steady room escalation.' },
                { id: 'nightmare', title: 'Nightmare Swarm', desc: 'Brutal goblin density & faster decay.' },
              ].map((diff) => (
                <button
                  type="button"
                  key={diff.id}
                  onClick={() => setDifficulty(diff.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                    difficulty === diff.id
                      ? 'bg-amber-950/60 border-amber-500 text-amber-200 ring-1 ring-amber-400'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <strong className="block text-slate-100 font-bold mb-0.5">{diff.title}</strong>
                  <span className="text-[10px] text-slate-400 leading-tight block">{diff.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg border border-amber-300 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              Deploy Sibling Defense ({playerCount} {playerCount === 1 ? 'Player' : 'Players'})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
