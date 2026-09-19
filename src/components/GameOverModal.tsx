import React from 'react';
import {
  Trophy,
  Skull,
  RotateCcw,
  Sparkles,
  Shield,
  Wrench,
  Flame,
  CheckCircle,
  Eye,
} from 'lucide-react';
import { GameState } from '../types/game';
import { SIBLINGS_ROSTER } from '../data/gameData';

interface GameOverModalProps {
  state: GameState;
  onRestart: (siblingId: string) => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ state, onRestart }) => {
  const isVictory = state.phase === 'victory';

  const overrunCount = Object.values(state.houseState).filter((r) => r.isOverrun).length;
  const kludgesCrafted = state.playerHand.filter((c) => c.type === 'kludge_weapon').length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-4">
      <div
        className={`bg-slate-900 border-2 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative overflow-hidden text-center flex flex-col items-center gap-5 ${
          isVictory ? 'border-amber-500/80' : 'border-rose-900/80'
        }`}
      >
        {/* Glow backdrop */}
        <div
          className={`absolute top-0 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
            isVictory ? 'bg-amber-500/15' : 'bg-rose-600/15'
          }`}
        />

        {/* Icon banner */}
        <div
          className={`p-4 rounded-2xl border-2 shadow-inner ${
            isVictory
              ? 'bg-amber-950/60 border-amber-400 text-amber-300'
              : 'bg-rose-950/60 border-rose-600 text-rose-400'
          }`}
        >
          {isVictory ? (
            <Trophy className="w-12 h-12 text-amber-300 animate-bounce" />
          ) : (
            <Skull className="w-12 h-12 text-rose-500 animate-pulse" />
          )}
        </div>

        {/* Title & Flavor */}
        <div>
          <h2 className="font-['Cinzel'] font-bold text-2xl md:text-3xl text-slate-100 tracking-wider">
            {isVictory ? 'Dawn Breaks Over The Gables!' : 'The House Has Fallen'}
          </h2>
          <p className="text-xs md:text-sm text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
            {isVictory
              ? 'Sunlight pours across the floorboards. The goblin hordes shriek and retreat into the earth. You and your siblings defended your home against impossible odds!'
              : state.candlelight <= 0
              ? 'The final candle flickered and died. Total pitch-black darkness swallowed the hallways, and the goblin claws closed in.'
              : state.siblingHp <= 0
              ? 'Overwhelmed by goblin swarms, the siblings could fight no longer.'
              : 'Too many rooms were completely overrun by the looting goblin horde.'}
          </p>
        </div>

        {/* Game Stats Summary */}
        <div className="grid grid-cols-3 gap-3 w-full bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block">Turns Survived</span>
            <strong className="text-base text-amber-300 font-bold">{state.turnCount}</strong>
          </div>
          <div>
            <span className="text-slate-400 block">Rooms Overrun</span>
            <strong className="text-base text-rose-400 font-bold">{overrunCount} / 6</strong>
          </div>
          <div>
            <span className="text-slate-400 block">Recipes Known</span>
            <strong className="text-base text-emerald-400 font-bold">
              {state.discoveredRecipes.length}
            </strong>
          </div>
        </div>

        {/* Choose Sibling for Next Run */}
        <div className="w-full text-left">
          <h4 className="font-['Cinzel'] font-bold text-xs uppercase text-slate-300 tracking-wider mb-2">
            Choose Sibling for Next Defense:
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SIBLINGS_ROSTER.map((sib) => {
              const isCurrent = state.activeSibling.id === sib.id;
              return (
                <button
                  key={sib.id}
                  onClick={() => onRestart(sib.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all hover:scale-102 cursor-pointer ${
                    isCurrent
                      ? 'bg-amber-950/60 border-amber-400 text-amber-200'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-100">{sib.name.split(' ')[0]}</span>
                    <span className="text-[10px] text-amber-400 font-semibold">{sib.hp} HP</span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2">{sib.trait}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Restart Action */}
        <button
          onClick={() => onRestart(state.activeSibling.id)}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm uppercase tracking-wider rounded-xl border border-amber-300 shadow-xl shadow-amber-500/20 active:scale-98 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Play Again with {state.activeSibling.name.split(' ')[0]}</span>
        </button>
      </div>
    </div>
  );
};
