import React from 'react';
import {
  Sofa,
  Utensils,
  Wrench,
  Flame,
  Bed,
  Boxes,
  Skull,
  Shield,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Footprints,
  Users,
} from 'lucide-react';
import { RoomId, RoomState, GameState } from '../types/game';
import { ROOMS_GRAPH } from '../data/gameData';

interface RoomNavigatorProps {
  state: GameState;
  onMoveRoom: (roomId: RoomId) => void;
}

const ROOM_ICONS: Record<string, React.ElementType> = {
  Sofa,
  Utensils,
  Wrench,
  Flame,
  Bed,
  Boxes,
};

export const RoomNavigator: React.FC<RoomNavigatorProps> = ({ state, onMoveRoom }) => {
  const currentRoomNode = ROOMS_GRAPH[state.currentRoom];
  const connectedIds = currentRoomNode.connectedRoomIds;
  const activePlayer = state.players[state.activePlayerIndex];

  const getThreatColor = (level: number, isOverrun: boolean) => {
    if (isOverrun) return 'text-rose-500 bg-rose-950/80 border-rose-600 shadow-[0_0_12px_rgba(225,29,72,0.4)]';
    switch (level) {
      case 1:
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60';
      case 2:
        return 'text-amber-400 bg-amber-950/40 border-amber-800/60';
      case 3:
        return 'text-orange-400 bg-orange-950/40 border-orange-800/60';
      case 4:
        return 'text-red-400 bg-red-950/60 border-red-700/80';
      case 5:
      default:
        return 'text-rose-400 bg-rose-950/80 border-rose-600';
    }
  };

  return (
    <div className="bg-slate-900/80 border border-amber-900/30 rounded-xl p-4 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
        <div>
          <h2 className="font-['Cinzel'] font-bold text-slate-200 text-sm tracking-wide uppercase flex items-center gap-2">
            <Footprints className="w-4 h-4 text-amber-500" />
            House Blueprint & Sibling Positions
          </h2>
          <p className="text-xs text-slate-400">
            {activePlayer.name}'s Position:{' '}
            <span className="text-amber-300 font-semibold">{currentRoomNode.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> T1
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-orange-400"></span> T3
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span> Overrun
          </span>
        </div>
      </div>

      {/* Grid of rooms representing the house nodes */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {(Object.keys(ROOMS_GRAPH) as RoomId[]).map((roomId) => {
          const room = ROOMS_GRAPH[roomId];
          const roomState = state.houseState[roomId];
          const isCurrent = state.currentRoom === roomId;
          const isConnected = connectedIds.includes(roomId);
          const IconComponent = ROOM_ICONS[room.iconName] || Sofa;
          const siblingsHere = state.players.filter((p) => p.currentRoom === roomId);

          return (
            <div
              key={roomId}
              className={`relative rounded-lg p-3 transition-all duration-200 border text-left flex flex-col justify-between ${
                isCurrent
                  ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)] ring-1 ring-amber-400/50'
                  : isConnected
                  ? 'bg-slate-800/80 border-slate-700 hover:border-amber-600/70 hover:bg-slate-800 cursor-pointer'
                  : 'bg-slate-900/50 border-slate-800/70 opacity-60'
              }`}
              onClick={() => {
                if (isConnected && !isCurrent) {
                  onMoveRoom(roomId);
                }
              }}
            >
              <div>
                {/* Header inside room node card */}
                <div className="flex items-start justify-between gap-1 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`p-1.5 rounded-md ${
                        isCurrent ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-100 truncate max-w-[95px] sm:max-w-[120px]">
                        {room.name}
                      </h3>
                      {isCurrent && (
                        <span className="text-[10px] text-amber-400 font-semibold block leading-tight">
                          ACTIVE TURN HERE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Threat Meter Badge */}
                  <div
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 ${getThreatColor(
                      roomState.threatLevel,
                      roomState.isOverrun
                    )}`}
                    title={`Threat Level: ${roomState.threatLevel} / 5`}
                  >
                    <Flame className="w-3 h-3" />
                    <span>{roomState.isOverrun ? 'OVERRUN' : `T${roomState.threatLevel}`}</span>
                  </div>
                </div>

                {/* Siblings present in this room */}
                {siblingsHere.length > 0 && (
                  <div className="flex flex-wrap gap-1 my-1.5">
                    {siblingsHere.map((sib) => (
                      <span
                        key={sib.id}
                        className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 border ${
                          sib.id === activePlayer.id
                            ? 'bg-amber-500 text-slate-950 border-amber-300'
                            : 'bg-slate-900 text-slate-200 border-slate-700'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        {sib.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Status pips & Goblins */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-1 border-t border-slate-800/80">
                {/* Goblins presence */}
                <div className="flex items-center gap-1">
                  {roomState.goblins.length > 0 ? (
                    <span className="flex items-center gap-1 text-rose-400 font-medium">
                      <Skull className="w-3 h-3 text-rose-400" />
                      {roomState.goblins.length} Goblin{roomState.goblins.length > 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="text-slate-500 text-[10px]">Clear</span>
                  )}
                </div>

                {/* Barricade status */}
                {roomState.barricadeLevel > 0 && (
                  <span className="flex items-center gap-0.5 text-amber-400 text-[10px]" title="Barricaded door">
                    <ShieldCheck className="w-3 h-3" />
                    B{roomState.barricadeLevel}
                  </span>
                )}

                {/* Move Action Prompt */}
                {isConnected && !isCurrent && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveRoom(roomId);
                    }}
                    className="flex items-center gap-1 text-[10px] font-bold text-amber-400 hover:text-amber-200 bg-amber-950/60 hover:bg-amber-900/80 px-2 py-0.5 rounded border border-amber-800/60 transition-colors cursor-pointer"
                  >
                    Move <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
