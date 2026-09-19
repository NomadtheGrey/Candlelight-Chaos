import React, { useState } from 'react';
import {
  Sword,
  Shield,
  Skull,
  Heart,
  RotateCcw,
  Sparkles,
  ArrowRight,
  X,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { GameState, KludgeWeaponCard, DiceDuelState } from '../types/game';
import { sound } from '../utils/audio';

interface CombatModalProps {
  state: GameState;
  onRollRound: () => void;
  onCloseCombat: () => void;
  onRetreat: () => void;
}

const DICE_DOT_LAYOUTS: Record<number, number[][]> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

const DieFace: React.FC<{ value: number; isHighest: boolean; isPlayer: boolean }> = ({
  value,
  isHighest,
  isPlayer,
}) => {
  const dots = DICE_DOT_LAYOUTS[value] || [[1, 1]];

  return (
    <div
      className={`w-12 h-12 rounded-xl p-1.5 border-2 shadow-lg flex flex-col justify-between transition-transform duration-300 ${
        isHighest
          ? isPlayer
            ? 'bg-amber-100 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)] scale-110 ring-2 ring-amber-400'
            : 'bg-rose-100 border-rose-600 shadow-[0_0_12px_rgba(225,29,72,0.6)] scale-110 ring-2 ring-rose-500'
          : isPlayer
          ? 'bg-slate-800 border-slate-700 text-slate-300'
          : 'bg-slate-900 border-slate-800 text-slate-400'
      }`}
    >
      <div className="grid grid-cols-3 grid-rows-3 w-full h-full gap-0.5">
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => {
            const hasDot = dots.some(([dr, dc]) => dr === r && dc === c);
            return (
              <div key={`${r}-${c}`} className="flex items-center justify-center">
                {hasDot && (
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isHighest
                        ? isPlayer
                          ? 'bg-amber-950'
                          : 'bg-rose-950'
                        : isPlayer
                        ? 'bg-amber-400'
                        : 'bg-rose-400'
                    }`}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export const CombatModal: React.FC<CombatModalProps> = ({
  state,
  onRollRound,
  onCloseCombat,
  onRetreat,
}) => {
  const [rolling, setRolling] = useState(false);
  const duel = state.activeDuel;
  if (!duel) return null;

  const goblin = duel.goblin;
  const equippedWeapon = state.playerHand.find(
    (c) => c.id === state.equippedWeaponId && c.type === 'kludge_weapon'
  ) as KludgeWeaponCard | undefined;

  const isGoblinDead = goblin.hp <= 0;
  const isPlayerDead = state.siblingHp <= 0;
  const activePlayer = state.players[state.activePlayerIndex];

  const handleRoll = () => {
    setRolling(true);
    sound.playDiceRoll();
    setTimeout(() => {
      onRollRound();
      setRolling(false);
      sound.playAttackHit();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-rose-900/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative overflow-hidden flex flex-col gap-5">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-950 border border-rose-700 rounded-lg">
              <Sword className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="font-['Cinzel'] font-bold text-lg text-rose-100 tracking-wide">
                Tactical Dice Duel Engine
              </h3>
              <p className="text-xs text-slate-400">
                1d6 Pool Comparison • Highest Die Wins • <strong className="text-amber-300">Ties Go to Defender</strong>
              </p>
            </div>
          </div>

          {!isPlayerDead && (
            <button
              onClick={onCloseCombat}
              className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800 rounded-lg cursor-pointer"
              title="Close duel panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Co-Op Assist Callout Banner */}
        {duel.assistPlayerName && (
          <div className="bg-emerald-950/70 border border-emerald-600/70 rounded-xl px-3.5 py-2 flex items-center justify-between gap-2 text-xs">
            <span className="font-bold text-emerald-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Co-Op Assist Active: {duel.assistPlayerName} is fighting alongside you!
            </span>
            <span className="bg-emerald-900 text-emerald-200 font-bold px-2 py-0.5 rounded text-[11px] border border-emerald-700">
              +1 Free Assist Die
            </span>
          </div>
        )}

        {/* Combatants Arena: Sibling vs Goblin */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Sibling Card */}
          <div className="bg-slate-950/90 border border-amber-900/60 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Defender ({activePlayer.name})
                </span>
                <span className="text-xs font-semibold text-rose-400 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 fill-rose-500/30" />
                  {state.siblingHp} / {state.siblingMaxHp} HP
                </span>
              </div>
              <h4 className="font-bold text-base text-slate-100 mb-1">
                {state.activeSibling.name}
              </h4>
              <p className="text-xs text-slate-400 mb-3">
                Weapon:{' '}
                <strong className="text-amber-300">
                  {equippedWeapon ? equippedWeapon.name : 'Bare Hands'}
                </strong>
                {equippedWeapon && (
                  <span className="block text-[11px] text-amber-400/90 mt-0.5">
                    +{equippedWeapon.attackDiceBonus}d6 Attack • {equippedWeapon.durability}/{equippedWeapon.maxDurability} Durability
                  </span>
                )}
              </p>
            </div>

            {/* Sibling Dice Pool Tray */}
            <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-2">
                Sibling Pool ({Math.max(1, state.activeSibling.baseDicePool + (equippedWeapon?.attackDiceBonus || 0))} Dice)
              </span>
              <div className="flex flex-wrap items-center gap-2 min-h-[50px]">
                {duel.playerDice.length > 0 ? (
                  duel.playerDice.map((val, idx) => (
                    <DieFace
                      key={idx}
                      value={val}
                      isHighest={val === duel.playerHighest}
                      isPlayer={true}
                    />
                  ))
                ) : (
                  <span className="text-xs text-slate-600 italic">Roll to duel...</span>
                )}
              </div>
            </div>
          </div>

          {/* Goblin Card */}
          <div className="bg-slate-950/90 border border-rose-900/60 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                  Invader (Goblin)
                </span>
                <span className="text-xs font-semibold text-rose-400 flex items-center gap-1">
                  <Skull className="w-3.5 h-3.5 text-rose-500" />
                  {goblin.hp} / {goblin.maxHp} HP
                </span>
              </div>
              <h4 className="font-bold text-base text-slate-100 mb-1">
                {goblin.name}
              </h4>
              <p className="text-xs text-slate-400 mb-3">
                <span className="text-rose-300">{goblin.title}</span> • {goblin.specialRule}
              </p>
            </div>

            {/* Goblin Dice Pool Tray */}
            <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-2">
                Goblin Pool ({goblin.dicePool + (goblin.isBuffed ? 1 : 0)} Dice)
              </span>
              <div className="flex flex-wrap items-center gap-2 min-h-[50px]">
                {duel.goblinDice.length > 0 ? (
                  duel.goblinDice.map((val, idx) => (
                    <DieFace
                      key={idx}
                      value={val}
                      isHighest={val === duel.goblinHighest}
                      isPlayer={false}
                    />
                  ))
                ) : (
                  <span className="text-xs text-slate-600 italic">Awaiting roll...</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Duel Resolution Banner */}
        {duel.roundSummary && (
          <div
            className={`p-3 rounded-xl border text-xs font-medium ${
              duel.winner === 'player'
                ? 'bg-amber-950/60 border-amber-500/80 text-amber-200'
                : duel.winner === 'tie_defender'
                ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-200'
                : 'bg-rose-950/60 border-rose-600 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold mb-1">
              {duel.winner === 'player' ? (
                <Sparkles className="w-4 h-4 text-amber-400" />
              ) : duel.winner === 'tie_defender' ? (
                <Shield className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              )}
              <span>Round Resolution:</span>
            </div>
            <p>{duel.roundSummary}</p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
          {!isGoblinDead && !isPlayerDead ? (
            <>
              <button
                onClick={onRetreat}
                className="px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
              >
                Flee Room (Retreat)
              </button>

              <button
                onClick={handleRoll}
                disabled={rolling}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm uppercase tracking-wider rounded-lg border border-amber-300 shadow-lg shadow-amber-500/20 active:scale-98 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Sword className="w-4 h-4" />
                <span>{rolling ? 'Rolling Dice Pool...' : 'Roll Dice Pool!'}</span>
              </button>
            </>
          ) : isGoblinDead ? (
            <div className="w-full flex items-center justify-between">
              <span className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Goblin Slain!
              </span>
              <button
                onClick={onCloseCombat}
                className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg border border-emerald-400 transition-colors"
              >
                Return to Room
              </button>
            </div>
          ) : (
            <div className="w-full text-center">
              <span className="text-rose-400 font-bold text-sm">
                You have succumbed to the goblin horde...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
