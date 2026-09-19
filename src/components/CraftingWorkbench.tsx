import React, { useState } from 'react';
import {
  Wrench,
  Sparkles,
  Zap,
  Trash2,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Shield,
  Sword,
  X,
  Plus,
} from 'lucide-react';
import { GameState, ItemCard, KludgeWeaponCard, PlayerCard } from '../types/game';
import { KLUDGE_RECIPES, ITEMS_REGISTRY } from '../data/gameData';
import { sound } from '../utils/audio';

interface CraftingWorkbenchProps {
  state: GameState;
  onDeselectCraftCard: (cardId: string) => void;
  onClearSlots: () => void;
  onCraftKludge: () => void;
  onClose?: () => void;
}

export const CraftingWorkbench: React.FC<CraftingWorkbenchProps> = ({
  state,
  onDeselectCraftCard,
  onClearSlots,
  onCraftKludge,
  onClose,
}) => {
  const [showCodex, setShowCodex] = useState(false);

  // Cards currently slotted
  const slottedCards = state.playerHand.filter((c) =>
    state.selectedCraftCardIds.includes(c.id)
  );

  const slottedItemBaseIds = slottedCards.map((c) => c.id.split('_')[0]);

  // Preview matching recipe
  const previewRecipe = KLUDGE_RECIPES.find((recipe) => {
    if (recipe.requiredItemIds.length !== slottedItemBaseIds.length) return false;
    const sortedRecipe = [...recipe.requiredItemIds].sort();
    const sortedSlotted = [...slottedItemBaseIds].sort();
    return sortedRecipe.every((val, idx) => val === sortedSlotted[idx]);
  });

  const canCraft = slottedCards.length >= 2;

  const handleCraft = () => {
    sound.playCraftSuccess();
    onCraftKludge();
  };

  return (
    <div className="bg-slate-900/95 border-2 border-amber-600/60 rounded-xl p-5 shadow-2xl backdrop-blur-md relative overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-900/40 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500 text-slate-950 rounded-lg">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-['Cinzel'] font-bold text-lg text-amber-200 tracking-wide flex items-center gap-2">
              Kludge Crafting Bench
              <span className="text-[11px] font-sans font-normal px-2 py-0.5 bg-amber-950/80 text-amber-300 border border-amber-700/60 rounded">
                Junk Magic Engine
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Combine 2 or 3 scavenged items to forge lethal makeshifts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCodex(!showCodex)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-700/50 rounded-lg transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{showCodex ? 'Hide Recipes' : 'Recipe Codex'}</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-700 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Slotted Cards Interactive Dropzone */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>Component Slots ({slottedCards.length} / 3 selected)</span>
          {slottedCards.length > 0 && (
            <button
              onClick={onClearSlots}
              className="text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Clear Slots
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((slotIdx) => {
            const card = slottedCards[slotIdx];
            return (
              <div
                key={slotIdx}
                className={`min-h-[110px] rounded-lg p-3 border-2 border-dashed flex flex-col justify-between transition-all ${
                  card
                    ? 'bg-amber-950/30 border-amber-500/80 shadow-inner'
                    : 'bg-slate-950/40 border-slate-800 flex items-center justify-center text-slate-600'
                }`}
              >
                {card ? (
                  <>
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        {card.type === 'item' ? card.category : 'Weapon'}
                      </span>
                      <button
                        onClick={() => onDeselectCraftCard(card.id)}
                        className="text-slate-400 hover:text-rose-400 p-0.5 rounded"
                        title="Remove component"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="my-1">
                      <h4 className="text-xs font-bold text-slate-100 line-clamp-2">
                        {card.name}
                      </h4>
                    </div>

                    <span className="text-[10px] text-slate-400 italic truncate">
                      Ready to synthesize
                    </span>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <Plus className="w-5 h-5 text-slate-700 mb-1" />
                    <span className="text-[11px] text-slate-500">Empty Slot {slotIdx + 1}</span>
                    <span className="text-[9px] text-slate-600">Select card from hand</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Synthesis Preview Box */}
      <div className="bg-slate-950/80 border border-amber-900/40 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Synthesis Preview
          </span>
          {canCraft && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                previewRecipe
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                  : 'bg-amber-950 text-amber-300 border border-amber-700'
              }`}
            >
              {previewRecipe ? '★ Master Recipe Matched' : '⚙ Improvised Kludge'}
            </span>
          )}
        </div>

        {canCraft ? (
          <div>
            <h3 className="text-sm font-bold text-amber-300 mb-1">
              {previewRecipe ? previewRecipe.resultName : 'Cobbled Junk Contraption'}
            </h3>
            <p className="text-xs text-slate-300 mb-2">
              {previewRecipe
                ? previewRecipe.description
                : 'A fragile but dangerous improvised weapon synthesized from household junk.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-900/90 p-2 rounded border border-slate-800">
              <span className="flex items-center gap-1 text-amber-300 font-semibold">
                <Sword className="w-3.5 h-3.5" />
                Pool Bonus: +{previewRecipe ? previewRecipe.attackDiceBonus : 1}d6
              </span>
              <span className="flex items-center gap-1 text-emerald-300 font-semibold">
                <Shield className="w-3.5 h-3.5" />
                Defense: +{previewRecipe ? previewRecipe.defenseBonus : 1}
              </span>
              <span className="text-slate-400">
                Durability:{' '}
                <strong className="text-slate-200">
                  {(previewRecipe ? previewRecipe.durability : 3) +
                    (state.activeSibling.id === 'leo' ? 1 : 0)}{' '}
                  uses
                </strong>
                {state.activeSibling.id === 'leo' && (
                  <span className="text-amber-400 ml-1">(+1 Leo Perk)</span>
                )}
              </span>
            </div>

            <p className="text-[11px] text-amber-200/90 mt-2 font-medium">
              Rule:{' '}
              {previewRecipe
                ? previewRecipe.specialRule
                : 'Jury-Rigged: Deals +1 attack die and can deflect one incoming strike.'}
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic py-2">
            Select at least 2 item cards from your inventory below to preview kludge synthesis.
          </p>
        )}
      </div>

      {/* Craft Action Button */}
      <button
        onClick={handleCraft}
        disabled={!canCraft}
        className={`w-full py-3 rounded-lg font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
          canCraft
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 border border-amber-300 active:scale-98 shadow-amber-500/20 animate-pulse cursor-pointer'
            : 'bg-slate-800/50 text-slate-600 border border-slate-800 cursor-not-allowed'
        }`}
      >
        <Zap className="w-4 h-4 text-slate-950" />
        <span>Synthesize Kludge Weapon!</span>
      </button>

      {/* Recipe Codex / Handbook Drawer */}
      {showCodex && (
        <div className="mt-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-['Cinzel'] font-bold text-xs uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              Scrap Engineering Codex ({state.discoveredRecipes.length} / {KLUDGE_RECIPES.length} Discovered)
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {KLUDGE_RECIPES.map((recipe) => {
              const isDiscovered = state.discoveredRecipes.includes(recipe.id);
              const itemNames = recipe.requiredItemIds.map(
                (id) => ITEMS_REGISTRY[id]?.name || id
              );

              return (
                <div
                  key={recipe.id}
                  className={`p-2.5 rounded-lg border text-xs ${
                    isDiscovered
                      ? 'bg-amber-950/30 border-amber-700/60'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-100 flex items-center gap-1">
                      {isDiscovered && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                      {recipe.resultName}
                    </span>
                    <span className="text-[10px] text-amber-400 font-semibold">
                      +{recipe.attackDiceBonus}d6
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 mb-1">
                    <strong className="text-amber-400/80">Ingredients:</strong> {itemNames.join(' + ')}
                  </p>
                  <p className="text-[10px] text-slate-400 italic">
                    {recipe.specialRule}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
