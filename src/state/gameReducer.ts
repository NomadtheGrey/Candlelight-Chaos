import {
  GameState,
  RoomId,
  RoomState,
  PlayerCard,
  KludgeWeaponCard,
  GoblinCard,
  DiceDuelState,
  GameLogEntry,
  ItemCard,
  Sibling,
  PlayerData,
  PlayerConfig,
  SiblingTrait,
  TraitId,
} from '../types/game';
import {
  ROOMS_GRAPH,
  ITEMS_REGISTRY,
  KLUDGE_RECIPES,
  GOBLIN_ROSTER,
  SIBLINGS_ROSTER,
  PLAYER_COLORS,
  MASTER_TRAITS_ROSTER,
  getDefaultTraitForSibling,
} from '../data/gameData';

export type Action =
  | { type: 'MOVE_ROOM'; roomId: RoomId }
  | { type: 'SEARCH_ROOM' }
  | { type: 'SELECT_CRAFT_CARD'; cardId: string }
  | { type: 'DESELECT_CRAFT_CARD'; cardId: string }
  | { type: 'CLEAR_CRAFT_SLOTS' }
  | { type: 'CRAFT_KLUDGE' }
  | { type: 'EQUIP_WEAPON'; cardId: string }
  | { type: 'BARRICADE_ROOM' }
  | { type: 'START_COMBAT'; goblinId?: string }
  | { type: 'ROLL_COMBAT_ROUND' }
  | { type: 'CLOSE_COMBAT' }
  | { type: 'PARLEY_GOBLINS' }
  | { type: 'CALM_BEASTS' }
  | { type: 'EVOLVE_TRAIT'; playerId: string }
  | { type: 'SELECT_TRAIT'; playerId: string; traitId: TraitId }
  | { type: 'END_TURN_DIRECTOR' }
  | { type: 'NEXT_PLAYER_TURN' }
  | { type: 'SWITCH_ACTIVE_PLAYER'; playerIndex: number }
  | { type: 'TRADE_CARD'; targetPlayerId: string; cardId: string }
  | { type: 'STASH_CARD'; cardId: string }
  | { type: 'RETRIEVE_STASH_CARD'; cardId: string }
  | { type: 'REVIVE_SIBLING'; targetPlayerId: string }
  | { type: 'CONFIGURE_GROUP'; gameMode: 'solo' | 'group'; configs: PlayerConfig[]; difficulty?: 'casual' | 'standard' | 'nightmare' }
  | { type: 'INSPECT_CARD'; card: PlayerCard | null }
  | { type: 'DISCARD_CARD'; cardId: string }
  | { type: 'RESTART_GAME'; siblingId?: string }
  | { type: 'SYNC_FULL_STATE'; state: GameState };

const createInitialHouseState = (): Record<RoomId, RoomState> => {
  const rooms: Record<RoomId, RoomState> = {
    living_room: {
      id: 'living_room',
      threatLevel: 1,
      isOverrun: false,
      searchedCount: 0,
      barricadeLevel: 0,
      goblins: [],
    },
    kitchen: {
      id: 'kitchen',
      threatLevel: 2,
      isOverrun: false,
      searchedCount: 0,
      barricadeLevel: 0,
      goblins: [createGoblinInstance('scrapper_snatcher')],
    },
    workshop: {
      id: 'workshop',
      threatLevel: 1,
      isOverrun: false,
      searchedCount: 0,
      barricadeLevel: 0,
      goblins: [],
    },
    basement: {
      id: 'basement',
      threatLevel: 3,
      isOverrun: false,
      searchedCount: 0,
      barricadeLevel: 0,
      goblins: [createGoblinInstance('scrapper_slipper')],
    },
    bedrooms: {
      id: 'bedrooms',
      threatLevel: 1,
      isOverrun: false,
      searchedCount: 0,
      barricadeLevel: 0,
      goblins: [],
    },
    attic: {
      id: 'attic',
      threatLevel: 2,
      isOverrun: false,
      searchedCount: 0,
      barricadeLevel: 0,
      goblins: [],
    },
  };
  return rooms;
};

export function createGoblinInstance(templateId: string): GoblinCard {
  const template = GOBLIN_ROSTER.find((g) => g.id === templateId) || GOBLIN_ROSTER[0];
  return {
    ...template,
    id: `${template.id}_${Math.random().toString(36).substring(2, 7)}`,
  };
}

export interface InitialSetupParams {
  gameMode?: 'solo' | 'group';
  playerConfigs?: PlayerConfig[];
  difficulty?: 'casual' | 'standard' | 'nightmare';
}

export function createInitialState(param?: string | InitialSetupParams): GameState {
  let gameMode: 'solo' | 'group' = 'group';
  let configs: PlayerConfig[] = [];

  if (typeof param === 'string') {
    // Single sibling specified or quick restart
    const sib = SIBLINGS_ROSTER.find((s) => s.id === param) || SIBLINGS_ROSTER[0];
    gameMode = 'solo';
    configs = [
      { id: 'p1', name: sib.name.split(' ')[0], siblingId: sib.id, color: 'amber' },
    ];
  } else if (param && typeof param === 'object') {
    gameMode = param.gameMode || 'group';
    if (param.playerConfigs && param.playerConfigs.length > 0) {
      configs = param.playerConfigs;
    }
  }

  // Default group roster if no configs provided: 3 Sibling Squad (Leo, Maya, Sam)
  if (configs.length === 0) {
    if (gameMode === 'solo') {
      configs = [
        { id: 'p1', name: 'Leo', siblingId: 'leo', color: 'amber' },
      ];
    } else {
      configs = [
        { id: 'p1', name: 'Player 1 (Leo)', siblingId: 'leo', color: 'amber' },
        { id: 'p2', name: 'Player 2 (Maya)', siblingId: 'maya', color: 'emerald' },
        { id: 'p3', name: 'Player 3 (Sam)', siblingId: 'sam', color: 'cyan' },
      ];
    }
  }

  // Sibling starter kits
  const getStarterCards = (siblingId: string): PlayerCard[] => {
    switch (siblingId) {
      case 'leo':
        return [
          { ...ITEMS_REGISTRY['toaster'] },
          { ...ITEMS_REGISTRY['fork'] },
          { ...ITEMS_REGISTRY['duct_tape'] },
          { ...ITEMS_REGISTRY['broom'] },
        ];
      case 'maya':
        return [
          { ...ITEMS_REGISTRY['flashlight'] },
          { ...ITEMS_REGISTRY['broken_mirror'] },
          { ...ITEMS_REGISTRY['salt_shaker'] },
          { ...ITEMS_REGISTRY['fork'] },
        ];
      case 'sam':
        return [
          { ...ITEMS_REGISTRY['heavy_book'] },
          { ...ITEMS_REGISTRY['broom'] },
          { ...ITEMS_REGISTRY['duct_tape'] },
          { ...ITEMS_REGISTRY['iron_nails'] },
        ];
      case 'clara':
      default:
        return [
          { ...ITEMS_REGISTRY['vinegar'] },
          { ...ITEMS_REGISTRY['baking_soda'] },
          { ...ITEMS_REGISTRY['broken_mirror'] },
          { ...ITEMS_REGISTRY['extension_cord'] },
        ];
    }
  };

  const players: PlayerData[] = configs.map((cfg, idx) => {
    const sibling = SIBLINGS_ROSTER.find((s) => s.id === cfg.siblingId) || SIBLINGS_ROSTER[idx % SIBLINGS_ROSTER.length];
    const trait = cfg.traitId && MASTER_TRAITS_ROSTER[cfg.traitId]
      ? { ...MASTER_TRAITS_ROSTER[cfg.traitId] }
      : getDefaultTraitForSibling(sibling.id);

    const maxHpBonus = trait.baseModifiers.maxHpBonus || 0;
    const baseHp = sibling.hp + maxHpBonus;
    const baseMaxHp = sibling.maxHp + maxHpBonus;

    return {
      id: cfg.id,
      name: cfg.name,
      sibling,
      trait,
      evolutionProgress: 0,
      evolutionGoal: trait.evolutionTrigger.targetCount,
      currentRoom: 'living_room',
      hp: baseHp,
      maxHp: baseMaxHp,
      hand: getStarterCards(sibling.id),
      equippedWeaponId: null,
      actionsLeft: 2,
      maxActions: 2,
      hasTakenTurnThisRound: false,
      isDowned: false,
      deathWardUsed: false,
      bigSiblingAbsorbedThisRound: false,
    };
  });

  const houseState = createInitialHouseState();

  // Shared living room stash
  const sharedStash: PlayerCard[] = [
    { ...ITEMS_REGISTRY['mouse_trap'] },
    { ...ITEMS_REGISTRY['extension_cord'] },
  ];

  const firstLog: GameLogEntry = {
    id: `log_${Date.now()}`,
    turn: 1,
    category: 'narrative',
    timestamp: 'Nightfall, 10:00 PM',
    title: 'The Sibling Defense Mobilizes',
    message: `${players.map((p) => p.name).join(', ')} light the central wax candle in the Living Room. Skittering claws echo in the walls. The house defense begins!`,
  };

  const activePlayer = players[0];

  return {
    gameMode,
    playerCount: players.length,
    players,
    activePlayerIndex: 0,
    roundNumber: 1,
    roundPhase: 'player_actions',

    // Active player mirrors
    currentRoom: activePlayer.currentRoom,
    playerHand: activePlayer.hand,
    equippedWeaponId: activePlayer.equippedWeaponId,
    activeSibling: activePlayer.sibling,
    siblingHp: activePlayer.hp,
    siblingMaxHp: activePlayer.maxHp,
    turnCount: 1,
    actionsLeft: activePlayer.actionsLeft,

    // Shared state
    houseState,
    sharedStash,
    activeEnemies: houseState[activePlayer.currentRoom].goblins,
    selectedCraftCardIds: [],
    candlelight: 100,
    gameLog: [firstLog],
    phase: 'exploration',
    activeDuel: null,
    discoveredRecipes: [],
    inspectedCard: null,
  };
}

function syncActivePlayer(state: GameState): GameState {
  const player = state.players[state.activePlayerIndex];
  if (!player) return state;

  return {
    ...state,
    currentRoom: player.currentRoom,
    playerHand: player.hand,
    equippedWeaponId: player.equippedWeaponId,
    activeSibling: player.sibling,
    siblingHp: player.hp,
    siblingMaxHp: player.maxHp,
    actionsLeft: player.actionsLeft,
    activeEnemies: state.houseState[player.currentRoom]?.goblins || [],
  };
}

function updateActivePlayerData(
  state: GameState,
  updater: (p: PlayerData) => Partial<PlayerData>
): GameState {
  const updatedPlayers = state.players.map((p, idx) => {
    if (idx === state.activePlayerIndex) {
      return { ...p, ...updater(p) };
    }
    return p;
  });

  const nextState = {
    ...state,
    players: updatedPlayers,
  };

  return syncActivePlayer(nextState);
}

function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

function rollPool(count: number): number[] {
  const results: number[] = [];
  for (let i = 0; i < count; i++) {
    results.push(rollD6());
  }
  return results;
}

function advancePlayerEvolution(
  player: PlayerData,
  triggerType: string,
  amount: number = 1
): { updatedPlayer: PlayerData; evolvedLog?: GameLogEntry } {
  if (player.trait.isEvolved) {
    return { updatedPlayer: player };
  }

  if (player.trait.evolutionTrigger.type === triggerType) {
    const nextProg = player.evolutionProgress + amount;
    if (nextProg >= player.evolutionGoal) {
      const evolvedTrait: SiblingTrait = {
        ...player.trait,
        isEvolved: true,
      };

      const log: GameLogEntry = {
        id: `evolve_${Date.now()}_${player.id}`,
        turn: 0,
        category: 'narrative',
        timestamp: 'TRAIT EVOLVED!',
        title: `★ ${player.name}'s Trait Evolved: ${evolvedTrait.evolvedName}!`,
        message: `${player.name} mastered "${player.trait.name}"! Unlocked: ${evolvedTrait.evolvedDescription}`,
      };

      return {
        updatedPlayer: {
          ...player,
          trait: evolvedTrait,
          evolutionProgress: player.evolutionGoal,
        },
        evolvedLog: log,
      };
    } else {
      return {
        updatedPlayer: {
          ...player,
          evolutionProgress: nextProg,
        },
      };
    }
  }

  return { updatedPlayer: player };
}

function executeDirectorEscalation(state: GameState): GameState {
  const nextRound = state.roundNumber + 1;
  const nextCandle = Math.max(0, state.candlelight - 5);

  const newHouseState = { ...state.houseState };
  const directorLogs: GameLogEntry[] = [];

  const roomIds = Object.keys(newHouseState) as RoomId[];
  const sortedByDanger = [...roomIds].sort(
    (a, b) => newHouseState[b].threatLevel - newHouseState[a].threatLevel
  );

  const targetRoomId = sortedByDanger[0];
  const secondTarget = roomIds[Math.floor(Math.random() * roomIds.length)];
  const roomsToEscalate = new Set([targetRoomId, secondTarget]);

  roomsToEscalate.forEach((rid) => {
    const rState = { ...newHouseState[rid] };
    if (rState.threatLevel < 5) {
      rState.threatLevel += 1;
    }

    if (rState.threatLevel >= 5 && !rState.isOverrun) {
      rState.isOverrun = true;
      rState.goblins = rState.goblins.map((g) => ({
        ...g,
        isBuffed: true,
        dicePool: g.dicePool + 1,
        hp: g.hp + 2,
      }));

      const adjacent = ROOMS_GRAPH[rid].connectedRoomIds;
      adjacent.forEach((adjId) => {
        const adjRoom = { ...newHouseState[adjId] };
        if (adjRoom.barricadeLevel > 0) {
          adjRoom.barricadeLevel -= 1;
        } else {
          adjRoom.goblins.push(createGoblinInstance('scrapper_cutlery'));
        }
        newHouseState[adjId] = adjRoom;
      });

      directorLogs.push({
        id: `log_${Date.now()}_overrun_${rid}`,
        turn: nextRound,
        category: 'alert',
        timestamp: `Round ${nextRound}`,
        title: `CRITICAL: ${ROOMS_GRAPH[rid].name} is OVERRUN!`,
        message: `Threat hit 5! Goblins looted tools and spilled into adjoining hallways!`,
      });
    }

    newHouseState[rid] = rState;
  });

  // Spawn fresh wave in highest threat room
  const targetRoom = { ...newHouseState[targetRoomId] };
  if (targetRoom.barricadeLevel > 0) {
    targetRoom.barricadeLevel -= 1;
    directorLogs.push({
      id: `log_${Date.now()}_barricade`,
      turn: nextRound,
      category: 'director',
      timestamp: `Round ${nextRound}`,
      title: `Barricade Damaged in ${ROOMS_GRAPH[targetRoomId].name}`,
      message: `The wooden barricades held back the swarm, absorbing the breach!`,
    });
  } else {
    let spawnTemplate = 'scrapper_snatcher';
    if (nextRound > 10) spawnTemplate = 'brute_scrap_golem';
    else if (nextRound > 6) spawnTemplate = 'scrapper_gremlin_shaman';
    else if (nextRound > 3) spawnTemplate = 'scrapper_pot_helm';

    const newGoblin = createGoblinInstance(spawnTemplate);
    targetRoom.goblins.push(newGoblin);

    directorLogs.push({
      id: `log_${Date.now()}_spawn`,
      turn: nextRound,
      category: 'director',
      timestamp: `Round ${nextRound}`,
      title: `Goblin Incursion in ${ROOMS_GRAPH[targetRoomId].name}`,
      message: `A ${newGoblin.name} crawled out from beneath the floorboards!`,
    });
  }
  newHouseState[targetRoomId] = targetRoom;

  // Refresh all non-downed players
  const refreshedPlayers = state.players.map((p) => ({
    ...p,
    actionsLeft: p.maxActions,
    hasTakenTurnThisRound: false,
  }));

  // Find first active player
  let firstPlayerIdx = refreshedPlayers.findIndex((p) => !p.isDowned);
  if (firstPlayerIdx === -1) firstPlayerIdx = 0;

  const roundStartLog: GameLogEntry = {
    id: `log_${Date.now()}_round`,
    turn: nextRound,
    category: 'narrative',
    timestamp: `Round ${nextRound}`,
    title: `Round ${nextRound} Begins`,
    message: `Candlelight burns down to ${nextCandle}%. Sibling turn passes to ${refreshedPlayers[firstPlayerIdx].name}!`,
  };

  const isDawnVictory = nextRound > 20;
  const isDarkDefeat = nextCandle <= 0;

  const intermediateState: GameState = {
    ...state,
    players: refreshedPlayers,
    activePlayerIndex: firstPlayerIdx,
    roundNumber: nextRound,
    turnCount: nextRound,
    candlelight: nextCandle,
    houseState: newHouseState,
    gameLog: [roundStartLog, ...directorLogs, ...state.gameLog],
    phase: isDawnVictory ? 'victory' : isDarkDefeat ? 'defeat' : state.phase,
    roundPhase: 'player_actions',
    selectedCraftCardIds: [],
  };

  return syncActivePlayer(intermediateState);
}

export function gameReducer(state: GameState, action: Action): GameState {
  const activePlayer = state.players[state.activePlayerIndex];

  switch (action.type) {
    case 'SYNC_FULL_STATE': {
      return action.state;
    }

    case 'CONFIGURE_GROUP': {
      return createInitialState({
        gameMode: action.gameMode,
        playerConfigs: action.configs,
        difficulty: action.difficulty,
      });
    }

    case 'RESTART_GAME': {
      return createInitialState({
        gameMode: state.gameMode,
        playerConfigs: state.players.map((p) => ({
          id: p.id,
          name: p.name,
          siblingId: p.sibling.id,
          color: 'amber',
        })),
      });
    }

    case 'SWITCH_ACTIVE_PLAYER': {
      if (action.playerIndex < 0 || action.playerIndex >= state.players.length) return state;
      const nextState = {
        ...state,
        activePlayerIndex: action.playerIndex,
        selectedCraftCardIds: [],
        activeDuel: null,
      };
      return syncActivePlayer(nextState);
    }

    case 'NEXT_PLAYER_TURN': {
      // Mark current player as having finished
      const updatedPlayers = state.players.map((p, idx) =>
        idx === state.activePlayerIndex ? { ...p, hasTakenTurnThisRound: true } : p
      );

      // Look for next player who hasn't taken their turn and is not downed
      let nextIdx = -1;
      for (let i = 1; i <= state.players.length; i++) {
        const candidateIdx = (state.activePlayerIndex + i) % state.players.length;
        if (!updatedPlayers[candidateIdx].hasTakenTurnThisRound && !updatedPlayers[candidateIdx].isDowned) {
          nextIdx = candidateIdx;
          break;
        }
      }

      if (nextIdx !== -1) {
        // Next sibling in current round
        const nextPlayer = updatedPlayers[nextIdx];
        const turnLog: GameLogEntry = {
          id: `log_${Date.now()}`,
          turn: state.roundNumber,
          category: 'narrative',
          timestamp: `Round ${state.roundNumber}`,
          title: `${nextPlayer.name}'s Turn`,
          message: `Control passes to ${nextPlayer.name} in the ${ROOMS_GRAPH[nextPlayer.currentRoom].name}. (${nextPlayer.actionsLeft} AP)`,
        };

        const nextState: GameState = {
          ...state,
          players: updatedPlayers,
          activePlayerIndex: nextIdx,
          selectedCraftCardIds: [],
          activeDuel: null,
          gameLog: [turnLog, ...state.gameLog],
        };
        return syncActivePlayer(nextState);
      } else {
        // All players have taken their turn -> Goblin Director Escalation Phase!
        return executeDirectorEscalation({ ...state, players: updatedPlayers });
      }
    }

    case 'END_TURN_DIRECTOR': {
      return executeDirectorEscalation(state);
    }

    case 'INSPECT_CARD': {
      return {
        ...state,
        inspectedCard: action.card,
      };
    }

    case 'DISCARD_CARD': {
      const updatedHand = activePlayer.hand.filter((c) => c.id !== action.cardId);
      const isEquipped = activePlayer.equippedWeaponId === action.cardId;

      return updateActivePlayerData(state, () => ({
        hand: updatedHand,
        equippedWeaponId: isEquipped ? null : activePlayer.equippedWeaponId,
      }));
    }

    case 'MOVE_ROOM': {
      if (activePlayer.actionsLeft <= 0) return state;

      const nextRoomGoblins = state.houseState[action.roomId].goblins;
      let hpLoss = 0;
      let penaltyNote = '';

      // Quick Stepper trait ignores flee penalty
      const isQuickStepper = activePlayer.trait.traitId === 'quick_stepper';

      if (state.phase === 'combat' && state.activeEnemies.length > 0 && !isQuickStepper) {
        const hasSlipperBiter = state.activeEnemies.some((g) => g.id.startsWith('scrapper_slipper'));
        if (hasSlipperBiter) {
          hpLoss = 1;
          penaltyNote = ' A Slipper Biter nipped your heel for 1 damage as you fled!';
        }
      } else if (isQuickStepper && state.phase === 'combat') {
        penaltyNote = ' (Quick Stepper slipped past the goblins effortlessly!)';
      }

      // Athlete trait check: vaulting barricade
      const destRoomState = state.houseState[action.roomId];
      let apSpent = 1;
      if (activePlayer.trait.traitId === 'athlete') {
        if (destRoomState.barricadeLevel > 0) {
          penaltyNote += ' (Athlete vaulted the fortified barricade cleanly!)';
          if (activePlayer.trait.isEvolved) {
            apSpent = 0; // Champion Hurdler refunds 1 AP
            penaltyNote += ' [Champion Hurdler: 1 AP Refunded!]';
          }
        }
      }

      // Lightfoot trait: high threat stealth
      if (activePlayer.trait.traitId === 'lightfoot' && destRoomState.threatLevel >= 3) {
        penaltyNote += ' [Lightfoot: Moved silently through high-threat corridor!]';
      }

      const newHp = Math.max(0, activePlayer.hp - hpLoss);
      const moveLog: GameLogEntry = {
        id: `log_${Date.now()}`,
        turn: state.roundNumber,
        category: 'move',
        timestamp: `Round ${state.roundNumber}`,
        title: `${activePlayer.name} moved to ${ROOMS_GRAPH[action.roomId].name}`,
        message: `${activePlayer.name} slipped into the ${ROOMS_GRAPH[action.roomId].name}.${penaltyNote} ${
          nextRoomGoblins.length > 0 ? `(${nextRoomGoblins.length} goblin(s) present!)` : ''
        }`,
      };

      // Trait Evolution advances
      let evoPlayer = activePlayer;
      let evoLogs: GameLogEntry[] = [];

      if (isQuickStepper) {
        const evoRes = advancePlayerEvolution(evoPlayer, 'MOVE_COUNT', 1);
        evoPlayer = evoRes.updatedPlayer;
        if (evoRes.evolvedLog) evoLogs.push(evoRes.evolvedLog);
      } else if (activePlayer.trait.traitId === 'athlete') {
        const evoRes = advancePlayerEvolution(evoPlayer, 'VAULT_OR_MOVE', 1);
        evoPlayer = evoRes.updatedPlayer;
        if (evoRes.evolvedLog) evoLogs.push(evoRes.evolvedLog);
      } else if (activePlayer.trait.traitId === 'lightfoot') {
        const evoRes = advancePlayerEvolution(evoPlayer, 'STEALTH_TRAVERSE', 1);
        evoPlayer = evoRes.updatedPlayer;
        if (evoRes.evolvedLog) evoLogs.push(evoRes.evolvedLog);
      }

      const nextState = updateActivePlayerData(state, (p) => ({
        ...evoPlayer,
        currentRoom: action.roomId,
        hp: newHp,
        actionsLeft: Math.max(0, p.actionsLeft - apSpent),
      }));

      return {
        ...nextState,
        activeEnemies: nextRoomGoblins,
        phase: nextRoomGoblins.length > 0 ? 'combat' : 'exploration',
        activeDuel: null,
        gameLog: [...evoLogs, moveLog, ...state.gameLog],
      };
    }

    case 'SEARCH_ROOM': {
      if (activePlayer.actionsLeft <= 0) return state;
      const room = ROOMS_GRAPH[activePlayer.currentRoom];
      const roomState = state.houseState[activePlayer.currentRoom];

      if (roomState.searchedCount >= room.maxSearchCount) {
        return {
          ...state,
          gameLog: [
            {
              id: `log_${Date.now()}`,
              turn: state.roundNumber,
              category: 'search',
              timestamp: `Round ${state.roundNumber}`,
              title: 'Caches Empty',
              message: `The ${room.name} has already been scavenged clean!`,
            },
            ...state.gameLog,
          ],
        };
      }

      // Roll search loot
      const totalWeight = room.searchTable.reduce((sum, item) => sum + item.weight, 0);
      let rand = Math.random() * totalWeight;
      let chosenItemId = room.searchTable[0].itemId;

      for (const entry of room.searchTable) {
        if (rand < entry.weight) {
          chosenItemId = entry.itemId;
          break;
        }
        rand -= entry.weight;
      }

      const foundItem = ITEMS_REGISTRY[chosenItemId] || ITEMS_REGISTRY['fork'];
      const newItems: PlayerCard[] = [{ ...foundItem, id: `${foundItem.id}_${Date.now()}` }];

      // Scavenger trait: Master Hoarder (drops 2 item cards instead of 1)
      const isScavenger = activePlayer.trait.traitId === 'scavenger';
      if (isScavenger && activePlayer.trait.isEvolved) {
        const secondItemIndex = Math.floor(Math.random() * room.searchTable.length);
        const secondItem = ITEMS_REGISTRY[room.searchTable[secondItemIndex].itemId];
        if (secondItem) {
          newItems.push({ ...secondItem, id: `${secondItem.id}_hoard_${Date.now()}` });
        }
      }

      // Night Eyes trait: exploration bonus in Basement or Attic
      const isNightEyes = activePlayer.trait.traitId === 'night_eyes';
      const isDarkRoom = activePlayer.currentRoom === 'basement' || activePlayer.currentRoom === 'attic';
      if (isNightEyes && isDarkRoom && activePlayer.trait.isEvolved) {
        const bonusEntry = room.searchTable[0];
        const bonusItem = ITEMS_REGISTRY[bonusEntry.itemId];
        if (bonusItem) {
          newItems.push({ ...bonusItem, id: `${bonusItem.id}_truesight_${Date.now()}` });
        }
      }

      // Maya signature trait: Keen Senses
      if (activePlayer.sibling.id === 'maya' && Math.random() > 0.4 && !isScavenger) {
        const bonusItemId = room.searchTable[Math.floor(Math.random() * room.searchTable.length)].itemId;
        const bonusItem = ITEMS_REGISTRY[bonusItemId];
        if (bonusItem) {
          newItems.push({ ...bonusItem, id: `${bonusItem.id}_bonus_${Date.now()}` });
        }
      }

      // Evolution advances
      let evoPlayer = activePlayer;
      let evoLogs: GameLogEntry[] = [];
      if (isScavenger) {
        const evoRes = advancePlayerEvolution(evoPlayer, 'SEARCH_COUNT', 1);
        evoPlayer = evoRes.updatedPlayer;
        if (evoRes.evolvedLog) evoLogs.push(evoRes.evolvedLog);
      } else if (isNightEyes && isDarkRoom) {
        const evoRes = advancePlayerEvolution(evoPlayer, 'DARK_ROOM_SEARCH', 1);
        evoPlayer = evoRes.updatedPlayer;
        if (evoRes.evolvedLog) evoLogs.push(evoRes.evolvedLog);
      }

      const updatedHouseState = {
        ...state.houseState,
        [activePlayer.currentRoom]: {
          ...roomState,
          searchedCount: roomState.searchedCount + 1,
        },
      };

      const searchLog: GameLogEntry = {
        id: `log_${Date.now()}`,
        turn: state.roundNumber,
        category: 'search',
        timestamp: `Round ${state.roundNumber}`,
        title: `Scavenged in ${room.name}`,
        message: `${activePlayer.name} found ${newItems.map((i) => `[${i.name}]`).join(' and ')} in the ${room.name}!${
          isScavenger && activePlayer.trait.isEvolved ? ' (Master Hoarder double yield!)' : ''
        }`,
      };

      const nextState = updateActivePlayerData(state, (p) => ({
        ...evoPlayer,
        hand: [...p.hand, ...newItems],
        actionsLeft: Math.max(0, p.actionsLeft - 1),
      }));

      return {
        ...nextState,
        houseState: updatedHouseState,
        gameLog: [...evoLogs, searchLog, ...state.gameLog],
      };
    }

    case 'BARRICADE_ROOM': {
      if (activePlayer.actionsLeft <= 0) return state;
      const roomState = state.houseState[activePlayer.currentRoom];
      if (roomState.barricadeLevel >= 2) return state;

      const updatedHouseState = {
        ...state.houseState,
        [activePlayer.currentRoom]: {
          ...roomState,
          barricadeLevel: roomState.barricadeLevel + 1,
        },
      };

      const barricadeLog: GameLogEntry = {
        id: `log_${Date.now()}`,
        turn: state.roundNumber,
        category: 'craft',
        timestamp: `Round ${state.roundNumber}`,
        title: `Fortified ${ROOMS_GRAPH[activePlayer.currentRoom].name}`,
        message: `${activePlayer.name} nailed heavy chairs and planks against the door frame (Level ${roomState.barricadeLevel + 1}).`,
      };

      const nextState = updateActivePlayerData(state, (p) => ({
        actionsLeft: Math.max(0, p.actionsLeft - 1),
      }));

      return {
        ...nextState,
        houseState: updatedHouseState,
        gameLog: [barricadeLog, ...state.gameLog],
      };
    }

    case 'SELECT_CRAFT_CARD': {
      if (state.selectedCraftCardIds.includes(action.cardId)) return state;
      if (state.selectedCraftCardIds.length >= 3) return state;
      return {
        ...state,
        selectedCraftCardIds: [...state.selectedCraftCardIds, action.cardId],
      };
    }

    case 'DESELECT_CRAFT_CARD': {
      return {
        ...state,
        selectedCraftCardIds: state.selectedCraftCardIds.filter((id) => id !== action.cardId),
      };
    }

    case 'CLEAR_CRAFT_SLOTS': {
      return {
        ...state,
        selectedCraftCardIds: [],
      };
    }

    case 'CRAFT_KLUDGE': {
      if (state.selectedCraftCardIds.length < 2) return state;
      const selectedCards = activePlayer.hand.filter((c) =>
        state.selectedCraftCardIds.includes(c.id)
      );

      const baseIds = selectedCards.map((c) => c.id.split('_')[0]);

      // Match known recipes
      const matchedRecipe = KLUDGE_RECIPES.find((r) => {
        if (r.requiredItemIds.length !== baseIds.length) return false;
        return r.requiredItemIds.every((reqId) => baseIds.includes(reqId));
      });

      // Kludge Master trait check
      const isKludgeMaster = activePlayer.trait.traitId === 'kludge_master';
      const isEvolvedKludge = isKludgeMaster && activePlayer.trait.isEvolved;
      const traitAttackBonus = isEvolvedKludge ? 2 : isKludgeMaster ? 1 : 0;
      const traitDurabilityBonus = isEvolvedKludge ? 2 : isKludgeMaster ? 1 : 0;

      // Bonus for Leo: Master Kludger (+1 durability)
      const leoDurabilityBonus = (activePlayer.sibling.id === 'leo' ? 1 : 0) + traitDurabilityBonus;

      let newKludgeWeapon: KludgeWeaponCard;
      if (matchedRecipe) {
        newKludgeWeapon = {
          id: `kludge_${matchedRecipe.id}_${Date.now()}`,
          name: matchedRecipe.resultName,
          type: 'kludge_weapon',
          recipeItemNames: selectedCards.map((c) => c.name),
          description: matchedRecipe.description,
          attackDiceBonus: matchedRecipe.attackDiceBonus + traitAttackBonus,
          defenseBonus: matchedRecipe.defenseBonus,
          durability: matchedRecipe.durability + leoDurabilityBonus,
          maxDurability: matchedRecipe.durability + leoDurabilityBonus,
          specialRule: isEvolvedKludge
            ? `${matchedRecipe.specialRule} | Junk Architect: Durability is preserved on critical rolls (6)!`
            : matchedRecipe.specialRule,
          iconName: matchedRecipe.iconName,
        };
      } else {
        // Improvised Kludge
        newKludgeWeapon = {
          id: `improvised_${Date.now()}`,
          name: `Makeshift ${selectedCards[0].name.split(' ')[0]} Contraption`,
          type: 'kludge_weapon',
          recipeItemNames: selectedCards.map((c) => c.name),
          description: `A hastily assembled defensive kludge bound with wires and grit.`,
          attackDiceBonus: 1 + traitAttackBonus,
          defenseBonus: 1,
          durability: 3 + leoDurabilityBonus,
          maxDurability: 3 + leoDurabilityBonus,
          specialRule: isEvolvedKludge
            ? 'Improvised Strike. Junk Architect: Preserves durability on 6s.'
            : 'Improvised Strike: Reliable blunt force.',
          iconName: 'Wrench',
        };
      }

      const updatedHand = activePlayer.hand.filter(
        (c) => !state.selectedCraftCardIds.includes(c.id)
      );
      updatedHand.push(newKludgeWeapon);

      const discovered = matchedRecipe && !state.discoveredRecipes.includes(matchedRecipe.id)
        ? [...state.discoveredRecipes, matchedRecipe.id]
        : state.discoveredRecipes;

      const craftLog: GameLogEntry = {
        id: `log_${Date.now()}`,
        turn: state.roundNumber,
        category: 'craft',
        timestamp: `Round ${state.roundNumber}`,
        title: `Forged ${newKludgeWeapon.name}!`,
        message: `${activePlayer.name} combined [${selectedCards.map((c) => c.name).join(' + ')}] into [${newKludgeWeapon.name}]!${
          isKludgeMaster ? ' (Kludge Master weapon reinforcement applied!)' : ''
        }`,
      };

      // Advance evolution for Kludge Master
      let evoPlayer = activePlayer;
      let evoLogs: GameLogEntry[] = [];
      if (isKludgeMaster) {
        const evoRes = advancePlayerEvolution(evoPlayer, 'CRAFT_ITEM', 1);
        evoPlayer = evoRes.updatedPlayer;
        if (evoRes.evolvedLog) evoLogs.push(evoRes.evolvedLog);
      }

      const nextState = updateActivePlayerData(state, (p) => ({
        ...evoPlayer,
        hand: updatedHand,
        equippedWeaponId: newKludgeWeapon.id,
        actionsLeft: Math.max(0, p.actionsLeft - 1),
      }));

      return {
        ...nextState,
        selectedCraftCardIds: [],
        discoveredRecipes: discovered,
        gameLog: [...evoLogs, craftLog, ...state.gameLog],
      };
    }

    case 'EQUIP_WEAPON': {
      return updateActivePlayerData(state, () => ({
        equippedWeaponId: action.cardId,
      }));
    }

    case 'TRADE_CARD': {
      const target = state.players.find((p) => p.id === action.targetPlayerId);
      if (!target || target.id === activePlayer.id) return state;
      if (target.currentRoom !== activePlayer.currentRoom) return state;

      const card = activePlayer.hand.find((c) => c.id === action.cardId);
      if (!card) return state;

      const updatedActiveHand = activePlayer.hand.filter((c) => c.id !== card.id);
      const isEquipped = activePlayer.equippedWeaponId === card.id;

      const updatedPlayers = state.players.map((p) => {
        if (p.id === activePlayer.id) {
          return {
            ...p,
            hand: updatedActiveHand,
            equippedWeaponId: isEquipped ? null : p.equippedWeaponId,
          };
        }
        if (p.id === target.id) {
          return {
            ...p,
            hand: [...p.hand, card],
          };
        }
        return p;
      });

      const tradeLog: GameLogEntry = {
        id: `log_${Date.now()}`,
        turn: state.roundNumber,
        category: 'trade',
        timestamp: `Round ${state.roundNumber}`,
        title: `Co-Op Hand-off`,
        message: `${activePlayer.name} passed [${card.name}] to ${target.name} in the ${ROOMS_GRAPH[activePlayer.currentRoom].name}!`,
      };

      const nextState: GameState = {
        ...state,
        players: updatedPlayers,
        gameLog: [tradeLog, ...state.gameLog],
      };

      return syncActivePlayer(nextState);
    }

    case 'STASH_CARD': {
      if (activePlayer.currentRoom !== 'living_room') return state;
      const card = activePlayer.hand.find((c) => c.id === action.cardId);
      if (!card) return state;

      const updatedHand = activePlayer.hand.filter((c) => c.id !== card.id);
      const isEquipped = activePlayer.equippedWeaponId === card.id;

      const stashLog: GameLogEntry = {
        id: `log_${Date.now()}`,
        turn: state.roundNumber,
        category: 'craft',
        timestamp: `Round ${state.roundNumber}`,
        title: `Stashed in Supply Trunk`,
        message: `${activePlayer.name} deposited [${card.name}] into the communal Living Room trunk.`,
      };

      const nextState = updateActivePlayerData(state, () => ({
        hand: updatedHand,
        equippedWeaponId: isEquipped ? null : activePlayer.equippedWeaponId,
      }));

      return {
        ...nextState,
        sharedStash: [...state.sharedStash, card],
        gameLog: [stashLog, ...state.gameLog],
      };
    }

    case 'RETRIEVE_STASH_CARD': {
      if (activePlayer.currentRoom !== 'living_room') return state;
      const card = state.sharedStash.find((c) => c.id === action.cardId);
      if (!card) return state;

      const updatedStash = state.sharedStash.filter((c) => c.id !== card.id);

      const retrieveLog: GameLogEntry = {
        id: `log_${Date.now()}`,
        turn: state.roundNumber,
        category: 'craft',
        timestamp: `Round ${state.roundNumber}`,
        title: `Retrieved from Supply Trunk`,
        message: `${activePlayer.name} took [${card.name}] from the communal trunk.`,
      };

      const nextState = updateActivePlayerData(state, (p) => ({
        hand: [...p.hand, card],
      }));

      return {
        ...nextState,
        sharedStash: updatedStash,
        gameLog: [retrieveLog, ...state.gameLog],
      };
    }

    case 'REVIVE_SIBLING': {
      const target = state.players.find((p) => p.id === action.targetPlayerId);
      if (!target || target.currentRoom !== activePlayer.currentRoom) return state;
      if (!target.isDowned && target.hp > 0) return state;

      const updatedPlayers = state.players.map((p) => {
        if (p.id === target.id) {
          return {
            ...p,
            hp: 4,
            isDowned: false,
          };
        }
        return p;
      });

      const reviveLog: GameLogEntry = {
        id: `log_${Date.now()}`,
        turn: state.roundNumber,
        category: 'revive',
        timestamp: `Round ${state.roundNumber}`,
        title: `Ally Revived!`,
        message: `${activePlayer.name} tended to ${target.name} with emergency first aid, bringing them back to 4 HP!`,
      };

      const nextState = updateActivePlayerData(
        { ...state, players: updatedPlayers, gameLog: [reviveLog, ...state.gameLog] },
        (p) => ({ actionsLeft: Math.max(0, p.actionsLeft - 1) })
      );

      return syncActivePlayer(nextState);
    }

    case 'START_COMBAT': {
      if (state.activeEnemies.length === 0) return state;
      const targetGoblin = action.goblinId
        ? state.activeEnemies.find((g) => g.id === action.goblinId) || state.activeEnemies[0]
        : state.activeEnemies[0];

      // Check for in-room ally assistance
      const assistingPlayer = state.players.find(
        (p) => p.id !== activePlayer.id && p.currentRoom === activePlayer.currentRoom && !p.isDowned
      );

      return {
        ...state,
        phase: 'combat',
        activeDuel: {
          goblin: targetGoblin,
          playerDice: [],
          goblinDice: [],
          playerHighest: 0,
          goblinHighest: 0,
          winner: null,
          damageDealt: 0,
          damageTaken: 0,
          isRolling: false,
          roundSummary: null,
          assistSibling: assistingPlayer ? assistingPlayer.sibling : null,
          assistPlayerName: assistingPlayer ? assistingPlayer.name : null,
        },
      };
    }

    case 'ROLL_COMBAT_ROUND': {
      if (!state.activeDuel) return state;
      const goblin = state.activeDuel.goblin;
      const equipped = activePlayer.hand.find(
        (c) => c.id === activePlayer.equippedWeaponId && c.type === 'kludge_weapon'
      ) as KludgeWeaponCard | undefined;

      const isBeast = goblin.id.startsWith('scrapper_slipper') ||
        goblin.name.toLowerCase().includes('hound') ||
        goblin.name.toLowerCase().includes('biter') ||
        goblin.name.toLowerCase().includes('gremlin') ||
        goblin.specialRule.toLowerCase().includes('beast');

      // Trait Checks
      const isBrawler = activePlayer.trait.traitId === 'brawler';
      const isEvolvedBrawler = isBrawler && activePlayer.trait.isEvolved;

      const isPackLeader = activePlayer.trait.traitId === 'pack_leader';
      const isEvolvedPackLeader = isPackLeader && activePlayer.trait.isEvolved;

      const isAnimalLover = activePlayer.trait.traitId === 'animal_lover';
      const isEvolvedAnimalLover = isAnimalLover && activePlayer.trait.isEvolved;

      const isBigSibling = activePlayer.trait.traitId === 'big_sibling';
      const isEvolvedBigSibling = isBigSibling && activePlayer.trait.isEvolved;

      const weaponBonusDice = equipped ? equipped.attackDiceBonus : (isEvolvedBrawler ? 2 : isBrawler ? 1 : 0);
      // Co-Op bonus: if teammate is present in room, +1 Assist Die (or +2 with Pack Leader)
      const hasAssist = !!state.activeDuel.assistSibling;
      const packLeaderBonus = (isPackLeader && hasAssist) ? 1 : 0;
      const animalLoverBonus = (isAnimalLover && isBeast) ? 1 : 0;
      const assistBonus = (hasAssist ? 1 : 0) + packLeaderBonus;
      // Clara bonus if using chemical kludge
      const claraBonus = activePlayer.sibling.id === 'clara' && equipped?.specialRule.includes('Acid') ? 1 : 0;

      const playerPoolSize = Math.max(
        1,
        activePlayer.sibling.baseDicePool + weaponBonusDice + assistBonus + claraBonus + animalLoverBonus
      );
      const playerDice = rollPool(playerPoolSize);

      const beastWhispererDebuff = (isEvolvedAnimalLover && isBeast) ? 2 : 0;
      const goblinBonusDice = (goblin.isBuffed ? 1 : 0) + (goblin.attackModifier || 0);
      const goblinPoolSize = Math.max(1, goblin.dicePool + goblinBonusDice - beastWhispererDebuff);
      const goblinDice = rollPool(goblinPoolSize);

      let playerHighest = Math.max(...playerDice);
      let goblinHighest = Math.max(...goblinDice);

      if (equipped && equipped.name.includes('Electro-Whipper')) {
        goblinHighest = Math.max(1, goblinHighest - 1);
      }

      let winner: 'player' | 'goblin' | 'tie_defender';
      if (playerHighest > goblinHighest) {
        winner = 'player';
      } else if (goblinHighest > playerHighest) {
        winner = 'goblin';
      } else {
        // Ties go to the defender!
        winner = 'tie_defender';
      }

      let damageDealt = 0;
      let damageTaken = 0;
      let roundSummary = '';

      if (winner === 'player' || winner === 'tie_defender') {
        const margin = winner === 'player' ? playerHighest - goblinHighest : 1;
        damageDealt = Math.max(1, 1 + margin);

        if (equipped?.name.includes('Acid Fizz') && goblin.tier >= 2) damageDealt += 2;
        if (equipped?.name.includes('Lightning Launcher') && playerDice.includes(6)) damageDealt += 2;
        if (equipped?.name.includes('Snap-Jaw') && goblin.tier === 1 && playerHighest >= 5) damageDealt = 99;

        const assistNote = state.activeDuel.assistPlayerName
          ? ` (Assisted by ${state.activeDuel.assistPlayerName}${isPackLeader ? ' - Pack Leader bonus!' : ''}!)`
          : '';

        roundSummary = winner === 'player'
          ? `Hit! Your roll [${playerDice.join(', ')}] bested goblin's [${goblinDice.join(', ')}]. Dealt ${damageDealt} damage!${assistNote}`
          : `Defender's Tie! On tied high die of ${playerHighest}, the siblings hold the line! Dealt ${damageDealt} damage!${assistNote}`;
      } else {
        const margin = goblinHighest - playerHighest;
        const defenseReduction = (equipped ? equipped.defenseBonus : 0) + (isEvolvedPackLeader && hasAssist ? 1 : 0);
        damageTaken = Math.max(1, margin + 1 - defenseReduction);

        if (isBigSibling && hasAssist) {
          const absorb = isEvolvedBigSibling ? 2 : 1;
          damageTaken = Math.max(0, damageTaken - absorb);
          roundSummary = `Big Sibling shielded the team (-${absorb} dmg)! `;
        }

        roundSummary += `Goblin strikes back! Rolled [${goblinDice.join(', ')}] vs your [${playerDice.join(', ')}]. Took ${damageTaken} damage!`;
      }

      let updatedGoblinHp = Math.max(0, goblin.hp - damageDealt);
      let updatedPlayerHp = Math.max(0, activePlayer.hp - damageTaken);

      // Survivor Trait: Death Ward check
      let deathWardUsed = activePlayer.deathWardUsed;
      let survivorEvolved = false;
      if (updatedPlayerHp <= 0 && activePlayer.trait.traitId === 'survivor' && !deathWardUsed) {
        updatedPlayerHp = 1;
        deathWardUsed = true;
        survivorEvolved = true;
        roundSummary += ' 🛡️ SURVIVOR DEFICIT: Refused to fall! Clung on with 1 HP!';
      }

      // Survivor: Ironclad end-of-combat heal
      if (updatedGoblinHp <= 0 && activePlayer.trait.traitId === 'survivor' && activePlayer.trait.isEvolved) {
        if (updatedPlayerHp < Math.floor(activePlayer.maxHp * 0.5)) {
          updatedPlayerHp = Math.min(activePlayer.maxHp, updatedPlayerHp + 1);
          roundSummary += ' [Ironclad: Restored 1 HP after combat victory!]';
        }
      }

      // Weapon durability consumption
      let updatedHand = [...activePlayer.hand];
      let updatedEquippedId = activePlayer.equippedWeaponId;

      if (equipped) {
        const isCrit = playerHighest === 6;
        const isJunkArchitect = activePlayer.trait.traitId === 'kludge_master' && activePlayer.trait.isEvolved;

        if (isCrit && isJunkArchitect) {
          roundSummary += ` (Junk Architect critical roll: [${equipped.name}] durability preserved!)`;
        } else {
          const nextDurability = equipped.durability - 1;
          if (nextDurability <= 0) {
            updatedHand = updatedHand.filter((c) => c.id !== equipped.id);
            updatedEquippedId = null;
            roundSummary += ` Your [${equipped.name}] shattered!`;
          } else {
            updatedHand = updatedHand.map((c) =>
              c.id === equipped.id ? { ...c, durability: nextDurability } : c
            );
          }
        }
      }

      let updatedRoomGoblins = state.houseState[activePlayer.currentRoom].goblins;
      let knockbackDest: RoomId | null = null;

      // Pit Fighter knockback on remaining goblin
      if (isEvolvedBrawler && (winner === 'player' || winner === 'tie_defender') && updatedGoblinHp > 0) {
        const currentConns = ROOMS_GRAPH[activePlayer.currentRoom].connectedRoomIds;
        if (currentConns.length > 0) {
          const destId = currentConns[0];
          knockbackDest = destId;
          updatedRoomGoblins = updatedRoomGoblins.filter((g) => g.id !== goblin.id);
          roundSummary += ` [Pit Fighter Knockback: Hurled ${goblin.name} into the ${ROOMS_GRAPH[destId].name}!]`;
        }
      } else if (updatedGoblinHp <= 0) {
        updatedRoomGoblins = updatedRoomGoblins.filter((g) => g.id !== goblin.id);
      }

      // Check if player is downed
      const isPlayerDowned = updatedPlayerHp <= 0;
      const allSiblingsDowned = state.players.every((p) =>
        p.id === activePlayer.id ? isPlayerDowned : p.isDowned || p.hp <= 0
      );

      // Trait Evolution advances
      let evoPlayer: PlayerData = { ...activePlayer, deathWardUsed };
      let evoLogs: GameLogEntry[] = [];

      if (survivorEvolved) {
        const evoRes = advancePlayerEvolution(evoPlayer, 'SURVIVE_LETHAL', 1);
        evoPlayer = evoRes.updatedPlayer;
        if (evoRes.evolvedLog) evoLogs.push(evoRes.evolvedLog);
      } else if (updatedGoblinHp <= 0) {
        if (isBrawler) {
          const evoRes = advancePlayerEvolution(evoPlayer, 'COMBAT_WIN', 1);
          evoPlayer = evoRes.updatedPlayer;
          if (evoRes.evolvedLog) evoLogs.push(evoRes.evolvedLog);
        } else if (isPackLeader && hasAssist) {
          const evoRes = advancePlayerEvolution(evoPlayer, 'GROUP_COMBAT', 1);
          evoPlayer = evoRes.updatedPlayer;
          if (evoRes.evolvedLog) evoLogs.push(evoRes.evolvedLog);
        } else if (isAnimalLover && isBeast) {
          const evoRes = advancePlayerEvolution(evoPlayer, 'CALM_OR_DEFEAT_BEAST', 1);
          evoPlayer = evoRes.updatedPlayer;
          if (evoRes.evolvedLog) evoLogs.push(evoRes.evolvedLog);
        }
      }

      if (isBigSibling && hasAssist && damageTaken > 0) {
        const evoRes = advancePlayerEvolution(evoPlayer, 'PROTECT_SIBLING', 1);
        evoPlayer = evoRes.updatedPlayer;
        if (evoRes.evolvedLog) evoLogs.push(evoRes.evolvedLog);
      }

      const combatLog: GameLogEntry = {
        id: `log_${Date.now()}`,
        turn: state.roundNumber,
        category: 'combat',
        timestamp: `Round ${state.roundNumber}`,
        title: `Clash with ${goblin.name}`,
        message: roundSummary,
        diceDetails: {
          playerDice,
          goblinDice,
          playerHighest,
          goblinHighest,
          winner,
          assistPlayerName: state.activeDuel.assistPlayerName || undefined,
        },
      };

      const updatedDuel: DiceDuelState = {
        ...state.activeDuel,
        goblin: { ...goblin, hp: updatedGoblinHp },
        playerDice,
        goblinDice,
        playerHighest,
        goblinHighest,
        winner,
        damageDealt,
        damageTaken,
        isRolling: false,
        roundSummary,
      };

      const nextState = updateActivePlayerData(state, () => ({
        trait: evoPlayer.trait,
        evolutionProgress: evoPlayer.evolutionProgress,
        deathWardUsed: evoPlayer.deathWardUsed,
        hp: updatedPlayerHp,
        isDowned: isPlayerDowned,
        hand: updatedHand,
        equippedWeaponId: updatedEquippedId,
      }));

      const newHouseState = {
        ...state.houseState,
        [activePlayer.currentRoom]: {
          ...state.houseState[activePlayer.currentRoom],
          goblins: updatedRoomGoblins,
        },
      };

      if (knockbackDest) {
        newHouseState[knockbackDest] = {
          ...newHouseState[knockbackDest],
          goblins: [...newHouseState[knockbackDest].goblins, { ...goblin, hp: updatedGoblinHp }],
        };
      }

      return {
        ...nextState,
        houseState: newHouseState,
        activeEnemies: updatedRoomGoblins,
        activeDuel: updatedDuel,
        gameLog: [...evoLogs, combatLog, ...state.gameLog],
        phase: allSiblingsDowned ? 'defeat' : state.phase,
      };
    }

    case 'PARLEY_GOBLINS': {
      if (activePlayer.actionsLeft <= 0) return state;
      const roomGoblins = state.houseState[activePlayer.currentRoom].goblins;
      if (roomGoblins.length === 0) return state;

      const isGoblinTalker = activePlayer.trait.traitId === 'goblin_talker';
      const isEvolved = isGoblinTalker && activePlayer.trait.isEvolved;

      // Parley pacifies or distracts one goblin
      const targetGoblin = roomGoblins[0];
      const remainingGoblins = roomGoblins.slice(1);

      let lootItem: PlayerCard | null = null;
      if (isEvolved) {
        const room = ROOMS_GRAPH[activePlayer.currentRoom];
        const lootId = room.searchTable[0]?.itemId || 'shiny_trinket';
        const itemTemplate = ITEMS_REGISTRY[lootId] || ITEMS_REGISTRY['fork'];
        lootItem = { ...itemTemplate, id: `loot_${Date.now()}` };
      }

      let evoPlayer = activePlayer;
      let evoLogs: GameLogEntry[] = [];
      if (isGoblinTalker) {
        const evoRes = advancePlayerEvolution(evoPlayer, 'PARLEY_SUCCESS', 1);
        evoPlayer = evoRes.updatedPlayer;
        if (evoRes.evolvedLog) evoLogs.push(evoRes.evolvedLog);
      }

      const parleyLog: GameLogEntry = {
        id: `log_${Date.now()}`,
        turn: state.roundNumber,
        category: 'narrative',
        timestamp: `Round ${state.roundNumber}`,
        title: `Parleyed with ${targetGoblin.name}!`,
        message: `${activePlayer.name} chattered in high-pitched Gobblese, convincing ${targetGoblin.name} to back down!${
          lootItem ? ` The goblin bribed you with [${lootItem.name}]!` : ''
        }`,
      };

      const nextState = updateActivePlayerData(state, (p) => ({
        ...evoPlayer,
        hand: lootItem ? [...p.hand, lootItem] : p.hand,
        actionsLeft: Math.max(0, p.actionsLeft - 1),
      }));

      return {
        ...nextState,
        houseState: {
          ...state.houseState,
          [activePlayer.currentRoom]: {
            ...state.houseState[activePlayer.currentRoom],
            goblins: remainingGoblins,
          },
        },
        activeEnemies: remainingGoblins,
        phase: remainingGoblins.length > 0 ? 'combat' : 'exploration',
        activeDuel: null,
        gameLog: [...evoLogs, parleyLog, ...state.gameLog],
      };
    }

    case 'CALM_BEASTS': {
      if (activePlayer.actionsLeft <= 0) return state;
      const roomGoblins = state.houseState[activePlayer.currentRoom].goblins;
      const beastIndex = roomGoblins.findIndex(
        (g) =>
          g.id.startsWith('scrapper_slipper') ||
          g.name.toLowerCase().includes('hound') ||
          g.name.toLowerCase().includes('biter') ||
          g.specialRule.toLowerCase().includes('beast')
      );

      if (beastIndex === -1) return state;

      const beast = roomGoblins[beastIndex];
      const remainingGoblins = roomGoblins.filter((_, idx) => idx !== beastIndex);

      let evoPlayer = activePlayer;
      let evoLogs: GameLogEntry[] = [];
      const evoRes = advancePlayerEvolution(evoPlayer, 'CALM_OR_DEFEAT_BEAST', 1);
      evoPlayer = evoRes.updatedPlayer;
      if (evoRes.evolvedLog) evoLogs.push(evoRes.evolvedLog);

      const calmLog: GameLogEntry = {
        id: `log_${Date.now()}`,
        turn: state.roundNumber,
        category: 'narrative',
        timestamp: `Round ${state.roundNumber}`,
        title: `Calmed ${beast.name}`,
        message: `${activePlayer.name} whistled a soothing tune, redirecting the beast out of the room!`,
      };

      const nextState = updateActivePlayerData(state, (p) => ({
        ...evoPlayer,
        actionsLeft: Math.max(0, p.actionsLeft - 1),
      }));

      return {
        ...nextState,
        houseState: {
          ...state.houseState,
          [activePlayer.currentRoom]: {
            ...state.houseState[activePlayer.currentRoom],
            goblins: remainingGoblins,
          },
        },
        activeEnemies: remainingGoblins,
        phase: remainingGoblins.length > 0 ? 'combat' : 'exploration',
        activeDuel: null,
        gameLog: [...evoLogs, calmLog, ...state.gameLog],
      };
    }

    case 'EVOLVE_TRAIT': {
      const playerIndex = state.players.findIndex((p) => p.id === action.playerId);
      if (playerIndex === -1) return state;
      const targetPlayer = state.players[playerIndex];
      if (targetPlayer.trait.isEvolved) return state;

      const evolvedTrait: SiblingTrait = {
        ...targetPlayer.trait,
        isEvolved: true,
      };

      const evoLog: GameLogEntry = {
        id: `log_${Date.now()}`,
        turn: state.roundNumber,
        category: 'narrative',
        timestamp: `Round ${state.roundNumber}`,
        title: `★ Trait Evolved: ${evolvedTrait.evolvedName}!`,
        message: `${targetPlayer.name} has unlocked the evolved trait [${evolvedTrait.evolvedName}]! ${evolvedTrait.evolvedDescription}`,
      };

      const updatedPlayers = state.players.map((p, idx) =>
        idx === playerIndex
          ? {
              ...p,
              trait: evolvedTrait,
              evolutionProgress: p.evolutionGoal,
            }
          : p
      );

      return {
        ...state,
        players: updatedPlayers,
        gameLog: [evoLog, ...state.gameLog],
      };
    }

    case 'SELECT_TRAIT': {
      const playerIndex = state.players.findIndex((p) => p.id === action.playerId);
      if (playerIndex === -1) return state;
      const newTrait = MASTER_TRAITS_ROSTER[action.traitId];
      if (!newTrait) return state;

      const updatedPlayers = state.players.map((p, idx) => {
        if (idx === playerIndex) {
          const maxHpDiff = (newTrait.baseModifiers.maxHpBonus || 0) - (p.trait.baseModifiers.maxHpBonus || 0);
          return {
            ...p,
            trait: { ...newTrait },
            evolutionProgress: 0,
            evolutionGoal: newTrait.evolutionTrigger.targetCount,
            hp: Math.max(1, p.hp + maxHpDiff),
            maxHp: Math.max(1, p.maxHp + maxHpDiff),
          };
        }
        return p;
      });

      return syncActivePlayer({
        ...state,
        players: updatedPlayers,
      });
    }

    case 'CLOSE_COMBAT': {
      return {
        ...state,
        activeDuel: null,
        phase: state.activeEnemies.length > 0 ? 'combat' : 'exploration',
      };
    }

    default:
      return state;
  }
}
