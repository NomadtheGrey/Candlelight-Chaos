import React, { useState } from 'react';
import {
  ScrollText,
  Sword,
  Search,
  Wrench,
  AlertTriangle,
  Flame,
  Footprints,
  BookOpen,
} from 'lucide-react';
import { GameLogEntry, LogCategory } from '../types/game';

interface GameLogProps {
  logs: GameLogEntry[];
}

export const GameLog: React.FC<GameLogProps> = ({ logs }) => {
  const [filter, setFilter] = useState<'all' | 'combat' | 'craft' | 'director'>('all');

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    if (filter === 'combat') return log.category === 'combat';
    if (filter === 'craft') return log.category === 'craft';
    if (filter === 'director') return log.category === 'director' || log.category === 'alert';
    return true;
  });

  const getBadgeStyle = (cat: LogCategory) => {
    switch (cat) {
      case 'combat':
        return 'bg-rose-950/80 text-rose-300 border-rose-800';
      case 'craft':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'search':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-800';
      case 'move':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'director':
      case 'alert':
        return 'bg-red-950 text-red-300 border-red-700 font-bold animate-pulse';
      case 'narrative':
      default:
        return 'bg-purple-950/80 text-purple-300 border-purple-800';
    }
  };

  const getCategoryIcon = (cat: LogCategory) => {
    switch (cat) {
      case 'combat':
        return <Sword className="w-3 h-3 text-rose-400" />;
      case 'craft':
        return <Wrench className="w-3 h-3 text-amber-400" />;
      case 'search':
        return <Search className="w-3 h-3 text-cyan-400" />;
      case 'move':
        return <Footprints className="w-3 h-3 text-slate-400" />;
      case 'director':
      case 'alert':
        return <AlertTriangle className="w-3 h-3 text-red-400" />;
      default:
        return <BookOpen className="w-3 h-3 text-purple-400" />;
    }
  };

  return (
    <div className="bg-slate-900/90 border border-amber-900/40 rounded-xl p-4 shadow-xl backdrop-blur-md flex flex-col h-full">
      {/* Header & Filter tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5 mb-3">
        <h3 className="font-['Cinzel'] font-bold text-slate-200 text-sm tracking-wide uppercase flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-amber-500" />
          Narrative & Battle Log
        </h3>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 text-[11px]">
          {(['all', 'combat', 'craft', 'director'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2 py-0.5 rounded capitalize font-medium transition-colors ${
                filter === cat
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Log Feed */}
      <div className="flex-1 max-h-72 overflow-y-auto pr-1.5 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5 text-xs transition-colors hover:border-slate-700"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[9px] uppercase px-1.5 py-0.5 rounded border flex items-center gap-1 font-semibold ${getBadgeStyle(
                    log.category
                  )}`}
                >
                  {getCategoryIcon(log.category)}
                  {log.category}
                </span>
                <span className="font-bold text-slate-200 truncate max-w-[200px] sm:max-w-xs">
                  {log.title}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 whitespace-nowrap">
                {log.timestamp}
              </span>
            </div>

            <p className="text-slate-300 font-sans leading-relaxed text-[11px]">
              {log.message}
            </p>

            {/* Optional Dice Duel detail pill */}
            {log.diceDetails && (
              <div className="mt-1.5 pt-1.5 border-t border-slate-900 flex items-center gap-3 text-[10px] text-slate-400">
                <span>
                  Player: [
                  <strong className="text-amber-300">
                    {log.diceDetails.playerDice.join(', ')}
                  </strong>
                  ] (High: {log.diceDetails.playerHighest})
                </span>
                <span>•</span>
                <span>
                  Goblin: [
                  <strong className="text-rose-400">
                    {log.diceDetails.goblinDice.join(', ')}
                  </strong>
                  ] (High: {log.diceDetails.goblinHighest})
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
