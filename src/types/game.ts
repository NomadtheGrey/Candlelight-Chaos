export type RoomId = 'living_room' | 'kitchen' | 'workshop' | 'basement' | 'bedrooms' | 'attic';

export type ItemRarity = 'common' | 'uncommon' | 'rare';

export type ItemCardType = 'item' | 'kludge_weapon';

export interface ItemCard {
  id: string;
  name: string;
  type: 'item';
  category: 'hardware' | 'appliance' | 'chemical' | 'household' | 'salvage';
  description: string;
  iconName: string;
  fluff: string;
  rarity: ItemRarity;
}

export interface KludgeWeaponCard {
  id: string;
  name: string;
  type: 'kludge_weapon';
  recipeItemNames: string[];
  description: string;
  attackDiceBonus: number; // e.g., +1 or +2 extra d6s to combat pool
  defenseBonus: number; // modifies defense roll or blocks damage
  durability: number; // charges remaining before breaking
  maxDurability: number;
  specialRule: string; // e.g. "Stun on 6", "Cleave to 2nd goblin", "Shock: Goblin rolls at -1"
  iconName: string;
  isEquipped?: boolean;
}

export type PlayerCard = ItemCard | KludgeWeaponCard;

export interface RoomNode {
  id: RoomId;
  name: string;
  description: string;
  flavor: string;
  connectedRoomIds: RoomId[];
  searchTable: {
    itemId: string;
    weight: number;
  }[];
  maxSearchCount: number;
  iconName: string;
}

export interface RoomState {
  id: RoomId;
  threatLevel: number; // 1 to 5
  isOverrun: boolean; // Threat 5 triggers Overrun
  searchedCount: number; // how many times searched
  barricadeLevel: number; // 0 to 2
  goblins: GoblinCard[];
  threatFrozen?: boolean;
  trapsDisarmed?: boolean;
  revealedByScout?: boolean;
  deepCacheSearched?: boolean;
}

export type GoblinTier = 1 | 2 | 3;

export interface GoblinCard {
  id: string;
  name: string;
  title: string;
  tier: GoblinTier;
  hp: number;
  maxHp: number;
  dicePool: number; // number of d6s rolled in combat
  attackModifier: number;
  specialRule: string;
  lootDrop?: string;
  iconName: string;
  isBuffed?: boolean; // If gained weapon upgrade during room overrun
}

export interface KludgeRecipe {
  id: string;
  resultName: string;
  requiredItemIds: string[]; // 2 or 3 item ids
  attackDiceBonus: number;
  defenseBonus: number;
  durability: number;
  specialRule: string;
  description: string;
  iconName: string;
}

export interface Sibling {
  id: string;
  name: string;
  role: string;
  trait: string;
  description: string;
  baseDicePool: number; // default base 1d6
  hp: number;
  maxHp: number;
  iconName: string;
}

export type TraitId =
  | 'animal_lover'
  | 'athlete'
  | 'big_sibling'
  | 'brawler'
  | 'goblin_talker'
  | 'kludge_master'
  | 'lightfoot'
  | 'night_eyes'
  | 'pack_leader'
  | 'quick_stepper'
  | 'scavenger'
  | 'survivor';

export interface TraitEvolutionTrigger {
  type: string;
  description: string;
  targetCount: number;
  requiredTier?: number;
  minRoomThreat?: number;
}

export interface TraitFeature {
  name: string;
  description: string;
}

export interface SiblingTrait {
  traitId: TraitId;
  name: string;
  category: string;
  type: string;
  primaryFocus: string;
  description: string;
  passive: TraitFeature;
  active: TraitFeature;
  synergy: TraitFeature;
  evolved: TraitFeature;
  isEvolved: boolean;
  evolvedName: string;
  evolvedDescription: string;
  iconName: string;
  baseModifiers: {
    craftingBonus?: number;
    durabilityBonus?: number;
    combatDiceBonus?: number;
    maxHpBonus?: number;
    canParley?: boolean;
    canCalmBeasts?: boolean;
    ignoreVisionPenalty?: boolean;
    freeBarricadeVault?: boolean;
    ignoreUnarmedPenalty?: boolean;
    rerollSearch?: boolean;
    absorbAllyDamage?: boolean;
    alliedCombatBonus?: number;
    rapidMovement?: boolean;
    stealthMaster?: boolean;
    petCompanion?: boolean;
    doubleSearchLoot?: boolean;
    maxHandSizeBonus?: number;
    synergyFoodToyBonus?: boolean;
    synergyHeavySpeedBonus?: boolean;
    synergyShieldDurabilityBonus?: boolean;
    synergyImprovisedAttackBonus?: boolean;
    synergyBribeJunk?: boolean;
    synergyReducedCraftCost?: boolean;
    synergyTrapDoubleAoe?: boolean;
    synergyLightDurationBonus?: boolean;
    synergyBuffAllSiblings?: boolean;
    synergyMobilityZeroCost?: boolean;
    synergyHealingBonus?: boolean;
  };
  evolutionTrigger: TraitEvolutionTrigger;
  evolvedModifiers: {
    craftingBonus?: number;
    durabilityBonus?: number;
    ignoreDurabilityLossOnCrit?: boolean;
    doubleSearchDrop?: boolean;
    unarmedDiceBonus?: number;
    unarmedKnockback?: boolean;
    combatHpRegen?: boolean;
    beastAlliesBonus?: number;
    stealthMaster?: boolean;
    alliedCombatBonus?: number;
    freeParleyBribe?: boolean;
    absorbCapacity?: number;
    vaultActionRefund?: boolean;
    moveTwoRooms?: boolean;
    trueSightDarkRoom?: boolean;
    unarmedCritOnFive?: boolean;
    extraActionsTurn?: number;
    safeCombatRetreat?: boolean;
    ironCoverNullifyChance?: number;
    deepCacheAllowed?: boolean;
    packCallTurns?: number;
    masterManipulatorTurns?: number;
    lightningBlitz?: boolean;
    diehardInvulnerability?: boolean;
    commanderFreeAction?: boolean;
  };
}

export interface PlayerConfig {
  id: string;
  name: string;
  siblingId: string;
  traitId?: TraitId;
  color: string;
}

export interface PlayerBuffs {
  evasiveShift?: boolean;
  drawAttention?: boolean;
  packCallTurns?: number;
  focusFireTargetId?: string;
  masterManipulatorTurns?: number;
  adrenalineRushUsed?: boolean;
  rummageUsedThisRound?: boolean;
  secondWindUsed?: boolean;
  shadowStepAvailable?: boolean;
  diehardInvulnerable?: boolean;
}

export interface PlayerData {
  id: string;
  name: string;
  sibling: Sibling;
  trait: SiblingTrait;
  evolutionProgress: number;
  evolutionGoal: number;
  currentRoom: RoomId;
  hp: number;
  maxHp: number;
  hand: PlayerCard[];
  equippedWeaponId: string | null;
  actionsLeft: number;
  maxActions: number;
  hasTakenTurnThisRound: boolean;
  isDowned?: boolean;
  deathWardUsed?: boolean;
  secondWindUsed?: boolean;
  bigSiblingAbsorbedThisRound?: boolean;
  buffs?: PlayerBuffs;
  maxHandSize?: number;
}

export type LogCategory = 'move' | 'search' | 'craft' | 'combat' | 'director' | 'narrative' | 'alert' | 'trade' | 'revive';

export interface GameLogEntry {
  id: string;
  turn: number;
  category: LogCategory;
  timestamp: string;
  title: string;
  message: string;
  diceDetails?: {
    playerDice: number[];
    goblinDice: number[];
    playerHighest: number;
    goblinHighest: number;
    winner: 'player' | 'goblin' | 'tie_defender';
    assistPlayerName?: string;
  };
}

export interface DiceDuelState {
  goblin: GoblinCard;
  playerDice: number[];
  goblinDice: number[];
  playerHighest: number;
  goblinHighest: number;
  winner: 'player' | 'goblin' | 'tie_defender' | null;
  damageDealt: number;
  damageTaken: number;
  isRolling: boolean;
  roundSummary: string | null;
  assistSibling?: Sibling | null;
  assistPlayerName?: string | null;
}

export type GamePhase = 'exploration' | 'crafting' | 'combat' | 'director' | 'victory' | 'defeat';

export interface OnlineRoomPlayer {
  id: string;
  name: string;
  siblingId: string;
  traitId?: TraitId;
  color: string;
  isHost: boolean;
  isReady: boolean;
  isOnline: boolean;
  lastSeen: number;
}

export interface OnlineRoomInfo {
  roomId: string;
  name: string;
  hostPlayerId: string;
  status: 'lobby' | 'in_game' | 'ended';
  difficulty: 'casual' | 'standard' | 'nightmare';
  players: OnlineRoomPlayer[];
  createdAt: number;
  gameState?: GameState;
}

export interface RoomReaction {
  id: string;
  senderName: string;
  emoji: string;
  text: string;
  timestamp: number;
}

export interface GameState {
  gameMode: 'solo' | 'group';
  playerCount: number;
  players: PlayerData[];
  activePlayerIndex: number;
  roundNumber: number;
  roundPhase: 'player_actions' | 'pass_turn_prompt' | 'director_escalation';

  // Active player convenience aliases
  currentRoom: RoomId;
  playerHand: PlayerCard[];
  equippedWeaponId: string | null;
  activeSibling: Sibling;
  siblingHp: number;
  siblingMaxHp: number;
  turnCount: number;
  actionsLeft: number;

  // Shared house and game state
  houseState: Record<RoomId, RoomState>;
  sharedStash: PlayerCard[];
  activeEnemies: GoblinCard[];
  selectedCraftCardIds: string[];
  candlelight: number; // 100 down to 0
  gameLog: GameLogEntry[];
  phase: GamePhase;
  activeDuel: DiceDuelState | null;
  discoveredRecipes: string[];
  inspectedCard: PlayerCard | null;
}
