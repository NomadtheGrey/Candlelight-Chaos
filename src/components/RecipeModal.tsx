import React from 'react';
import { BookOpen, X, Sparkles, Sword, Shield, Zap, CheckCircle2 } from 'lucide-react';
import { KLUDGE_RECIPES, ITEMS_REGISTRY } from '../data/gameData';

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  discoveredRecipes: string[];
}

export const RecipeModal: React.FC<RecipeModalProps> = ({
  isOpen,
  onClose,
  discoveredRecipes,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-amber-600/70 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-900/40 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 text-slate-950 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Cinzel'] font-bold text-lg text-amber-200 tracking-wide">
                Kludge Weapon Blueprints
              </h3>
              <p className="text-xs text-slate-400">
                Junk Magic formulas discovered by the siblings ({discoveredRecipes.length} / {KLUDGE_RECIPES.length})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Recipes Grid */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {KLUDGE_RECIPES.map((recipe) => {
            const isDiscovered = discoveredRecipes.includes(recipe.id);
            const itemNames = recipe.requiredItemIds.map(
              (id) => ITEMS_REGISTRY[id]?.name || id
            );

            return (
              <div
                key={recipe.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isDiscovered
                    ? 'bg-amber-950/30 border-amber-600/80 shadow-md'
                    : 'bg-slate-950/80 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                      {isDiscovered && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {recipe.resultName}
                    </h4>
                    {isDiscovered && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                        Discovered
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span className="text-amber-300 flex items-center gap-0.5">
                      <Sword className="w-3.5 h-3.5" />+{recipe.attackDiceBonus}d6
                    </span>
                    {recipe.defenseBonus > 0 && (
                      <span className="text-emerald-300 flex items-center gap-0.5">
                        <Shield className="w-3.5 h-3.5" />+{recipe.defenseBonus}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-300 mb-2 font-medium">
                  <span className="text-amber-400 font-semibold">Ingredients: </span>
                  {itemNames.join(' + ')}
                </p>

                <p className="text-xs text-slate-400 mb-2">
                  {recipe.description}
                </p>

                <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-[11px] text-amber-200">
                  <strong className="text-amber-400">Special Rule:</strong> {recipe.specialRule}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-800 pt-3 mt-4 text-center text-xs text-slate-400">
          Tip: You can also combine <strong className="text-amber-300">any two or three items</strong> to forge an Improvised Junk Contraption!
        </div>
      </div>
    </div>
  );
};
