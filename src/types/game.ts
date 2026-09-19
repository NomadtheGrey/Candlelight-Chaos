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

export interface PlayerConfig {
  id: string;
  name: string;
  siblingId: string;
  color: string;
}

export interface PlayerData {
  id: string;
  name: string;
  sibling: Sibling;
  currentRoom: RoomId;
  hp: number;
  maxHp: number;
  hand: PlayerCard[];
  equippedWeaponId: string | null;
  actionsLeft: number;
  maxActions: number;
  hasTakenTurnThisRound: boolean;
  isDowned?: boolean;
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
