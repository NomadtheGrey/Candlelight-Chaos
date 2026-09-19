import React from 'react';
import { Flame, Shield, Sword, Wrench, Heart, Sparkles } from 'lucide-react';
import { RoomReaction } from '../types/game';

interface ReactionPingsProps {
  reactions: RoomReaction[];
  onSendReaction: (emoji: string, text?: string) => void;
}

const REACTION_PRESETS = [
  { emoji: '🔥', label: 'Threat Rising!' },
  { emoji: '⚔️', label: 'Attack Goblin!' },
  { emoji: '🛡️', label: 'Barricade!' },
  { emoji: '💡', label: 'Kludge Craft!' },
  { emoji: '❤️', label: 'Need Help!' },
  { emoji: '🎉', label: 'Great Job!' },
];

export const ReactionPings: React.FC<ReactionPingsProps> = ({ reactions, onSendReaction }) => {
  return (
    <>
      {/* Floating Reaction Bubbles Animation on Screen */}
      <div className="fixed bottom-20 right-4 z-40 pointer-events-none flex flex-col items-end gap-2">
        {reactions.slice(-4).map((r) => (
          <div
            key={r.id}
            className="animate-bounce bg-slate-900/95 border border-amber-500/80 rounded-2xl px-3.5 py-1.5 shadow-2xl flex items-center gap-2 backdrop-blur-md text-xs"
          >
            <span className="text-xl">{r.emoji}</span>
            <div>
              <span className="font-bold text-amber-300 block leading-tight">{r.senderName}</span>
              {r.text && <span className="text-[10px] text-slate-300">{r.text}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Reaction Tray (at bottom of screen or card) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 flex items-center justify-between gap-2 text-xs backdrop-blur-sm">
        <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider hidden sm:inline">
          Sibling Cheer & Callouts:
        </span>
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-0.5">
          {REACTION_PRESETS.map((p) => (
            <button
              key={p.emoji}
              onClick={() => onSendReaction(p.emoji, p.label)}
              title={p.label}
              className="px-2 py-1 bg-slate-800/80 hover:bg-amber-950/80 hover:border-amber-500 border border-slate-700/80 rounded-lg text-sm flex items-center gap-1 transition-all active:scale-90 cursor-pointer"
            >
              <span>{p.emoji}</span>
              <span className="text-[10px] text-slate-300 font-medium hidden md:inline">{p.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
