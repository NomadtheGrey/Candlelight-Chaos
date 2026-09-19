import React from 'react';
import {
  Zap,
  Sword,
  Shield,
  Trash2,
  CheckCircle,
  Plus,
  Check,
  Package,
  Wrench,
  Flame,
  Sparkles,
  Info,
} from 'lucide-react';
import { GameState, PlayerCard, KludgeWeaponCard, ItemCard } from '../types/game';
import { sound } from '../utils/audio';

interface CardDrawerProps {
  state: GameState;
  onSelectCraftCard: (cardId: string) => void;
  onDeselectCraftCard: (cardId: string) => void;
  onEquipWeapon: (cardId: string) => void;
  onDiscardCard: (cardId: string) => void;
  onInspectCard: (card: PlayerCard | null) => void;
}

export const CardDrawer: React.FC<CardDrawerProps> = ({
  state,
  onSelectCraftCard,
  onDeselectCraftCard,
  onEquipWeapon,
  onDiscardCard,
  onInspectCard,
}) => {
  const cards = state.playerHand;
  const equippedId = state.equippedWeaponId;
  const activePlayer = state.players[state.activePlayerIndex];

  return (
    <div className="bg-slate-900/90 border border-amber-900/40 rounded-xl p-4 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
        <div>
          <h3 className="font-['Cinzel'] font-bold text-slate-200 text-sm tracking-wide uppercase flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-500" />
            {activePlayer.name}'s Inventory & Hand ({cards.length} Cards)
          </h3>
          <p className="text-xs text-slate-400">
            Click an item to slot into the crafting bench, or equip a forged Kludge Weapon for combat.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">
            Equipped:{' '}
            <strong className="text-amber-300">
              {equippedId
                ? cards.find((c) => c.id === equippedId)?.name || 'None'
                : 'Bare Hands (1d6)'}
            </strong>
          </span>
        </div>
      </div>

      {/* Cards Scroller / Grid */}
      {cards.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-xs italic">
          Your inventory is empty. Search rooms to scavenge items!
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {cards.map((card) => {
            const isKludge = card.type === 'kludge_weapon';
            const isEquipped = card.id === equippedId;
            const isSlottedForCraft = state.selectedCraftCardIds.includes(card.id);
            const kludgeWeapon = isKludge ? (card as KludgeWeaponCard) : null;
            const itemCard = !isKludge ? (card as ItemCard) : null;

            return (
              <div
                key={card.id}
                className={`relative rounded-xl p-3 border-2 transition-all duration-200 flex flex-col justify-between select-none ${
                  isEquipped
                    ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] ring-1 ring-amber-400'
                    : isSlottedForCraft
                    ? 'bg-amber-950/25 border-amber-500 shadow-md ring-2 ring-amber-400/80 scale-[1.02]'
                    : isKludge
                    ? 'bg-slate-900/90 border-amber-700/60 hover:border-amber-500'
                    : 'bg-slate-950/90 border-slate-700/80 hover:border-slate-500'
                }`}
              >
                {/* Top Badge: Type / Equipped */}
                <div className="flex items-start justify-between gap-1 mb-1.5">
                  <span
                    className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                      isKludge
                        ? 'bg-amber-950 text-amber-300 border border-amber-700'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {isKludge ? 'Kludge Weapon' : itemCard?.category}
                  </span>

                  {isEquipped && (
                    <span className="text-[9px] font-bold uppercase bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded shadow">
                      Equipped
                    </span>
                  )}
                  {isSlottedForCraft && (
                    <span className="text-[9px] font-bold uppercase bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded">
                      In Slot
                    </span>
                  )}
                </div>

                {/* Card Title */}
                <div className="mb-2">
                  <h4 className="text-xs font-bold text-slate-100 line-clamp-2 leading-snug">
                    {card.name}
                  </h4>
                  {isKludge && kludgeWeapon ? (
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-amber-300 font-semibold">
                      <span className="flex items-center gap-0.5">
                        <Sword className="w-3 h-3" />+{kludgeWeapon.attackDiceBonus}d6
                      </span>
                      {kludgeWeapon.defenseBonus > 0 && (
                        <span className="flex items-center gap-0.5 text-emerald-400">
                          <Shield className="w-3 h-3" />+{kludgeWeapon.defenseBonus}
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 line-clamp-2 mt-1">
                      {card.description}
                    </p>
                  )}
                </div>

                {/* Kludge Durability / Special Rule */}
                {isKludge && kludgeWeapon && (
                  <div className="my-1 text-[10px] bg-slate-950/80 p-1.5 rounded border border-amber-950/60">
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Durability</span>
                      <span className="font-bold text-amber-300">
                        {kludgeWeapon.durability} / {kludgeWeapon.maxDurability}
                      </span>
                    </div>
                    {/* Durability Pips */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: kludgeWeapon.maxDurability }).map((_, idx) => (
                        <span
                          key={idx}
                          className={`w-2 h-1.5 rounded-sm ${
                            idx < kludgeWeapon.durability ? 'bg-amber-400' : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[9px] text-amber-200/80 mt-1 line-clamp-2 italic">
                      {kludgeWeapon.specialRule}
                    </p>
                  </div>
                )}

                {/* Card Action Buttons */}
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center gap-1.5">
                  {isKludge ? (
                    <button
                      onClick={() => {
                        sound.playCardSelect();
                        onEquipWeapon(card.id);
                      }}
                      className={`flex-1 py-1 px-2 text-[10px] font-bold rounded transition-colors ${
                        isEquipped
                          ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {isEquipped ? 'Unequip' : 'Equip Weapon'}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        sound.playCardSelect();
                        if (isSlottedForCraft) {
                          onDeselectCraftCard(card.id);
                        } else {
                          onSelectCraftCard(card.id);
                        }
                      }}
                      className={`flex-1 py-1 px-2 text-[10px] font-bold rounded transition-colors ${
                        isSlottedForCraft
                          ? 'bg-amber-600 text-slate-950 hover:bg-amber-500'
                          : 'bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 border border-amber-800/60'
                      }`}
                    >
                      {isSlottedForCraft ? 'Remove Slot' : '+ Craft Slot'}
                    </button>
                  )}

                  {/* Discard / Scrap */}
                  <button
                    onClick={() => onDiscardCard(card.id)}
                    title="Scrap card"
                    className="p-1 text-slate-500 hover:text-rose-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
