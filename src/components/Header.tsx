import React from 'react';
import { Flame, Shield, Heart, Moon, Volume2, VolumeX, BookOpen, Clock, AlertTriangle, Users } from 'lucide-react';
import { GameState } from '../types/game';
import { sound } from '../utils/audio';

interface HeaderProps {
  state: GameState;
  onOpenRecipes: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenOnlineLobby?: () => void;
  onlineRoomCode?: string | null;
  onlinePlayersCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  onOpenRecipes,
  soundEnabled,
  onToggleSound,
  onOpenOnlineLobby,
  onlineRoomCode,
  onlinePlayersCount,
}) => {
  const overrunRoomsCount = Object.values(state.houseState).filter((r) => r.isOverrun).length;
  const totalGoblins = Object.values(state.houseState).reduce(
    (sum, r) => sum + r.goblins.length,
    0
  );

  // Calculate approximate time of night: Turn 1 is 10:00 PM, Turn 20 is 06:00 AM
  const hours = (22 + Math.floor((state.turnCount - 1) * 0.4)) % 24;
  const minutes = Math.floor(((state.turnCount - 1) * 24) % 60);
  const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${hours >= 12 && hours < 24 ? 'PM' : 'AM'}`;

  return (
    <header className="w-full bg-slate-900/90 border-b border-amber-900/40 px-4 py-3 backdrop-blur-md sticky top-0 z-30 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Title and Turn Badge */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 to-amber-900 border border-amber-400/40 shadow-inner shadow-amber-500/20">
            <Flame className="w-6 h-6 text-amber-200 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-['Cinzel'] font-bold text-lg md:text-xl text-amber-100 tracking-wider flex items-center gap-2">
                Candlelight Chaos
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider bg-amber-950/80 text-amber-400 border border-amber-700/50 rounded">
                Turn {state.turnCount} / 20
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span className="text-amber-300/80">The Night the Goblins Came</span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <Clock className="w-3 h-3 text-amber-400" />
                {timeString}
              </span>
            </p>
          </div>
        </div>

        {/* Vitality Meters: Candlelight + Sibling HP + Overrun Alarm */}
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          {/* Candlelight Meter */}
          <div className="flex items-center gap-2.5 bg-slate-950/80 border border-amber-900/40 px-3 py-1.5 rounded-lg shadow-inner">
            <div className="relative">
              <Flame
                className={`w-5 h-5 ${
                  state.candlelight > 40
                    ? 'text-amber-400 animate-bounce'
                    : 'text-rose-500 animate-pulse'
                }`}
              />
            </div>
            <div className="w-24 sm:w-28">
              <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-0.5">
                <span className="text-amber-200">Candle</span>
                <span className={state.candlelight <= 25 ? 'text-rose-400 font-bold' : 'text-amber-300'}>
                  {state.candlelight}%
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    state.candlelight > 50
                      ? 'bg-gradient-to-r from-amber-500 to-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                      : state.candlelight > 25
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500'
                      : 'bg-gradient-to-r from-rose-600 to-red-500 animate-pulse'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, state.candlelight))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Sibling Health */}
          <div className="flex items-center gap-2.5 bg-slate-950/80 border border-amber-900/40 px-3 py-1.5 rounded-lg shadow-inner">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
            <div className="w-24 sm:w-28">
              <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-0.5">
                <span className="truncate max-w-[65px]">{state.activeSibling.name.split(' ')[0]}</span>
                <span className="text-rose-300">
                  {state.siblingHp}/{state.siblingMaxHp}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-300 rounded-full"
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(100, (state.siblingHp / state.siblingMaxHp) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* House Danger Status */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg">
            {overrunRoomsCount > 0 ? (
              <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold animate-pulse">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>{overrunRoomsCount} Room(s) Overrun!</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>{totalGoblins} Goblins in House</span>
              </div>
            )}
          </div>

          {/* Controls: Online Lobby, Sound & Recipe Guide */}
          <div className="flex items-center gap-2">
            {onOpenOnlineLobby && (
              <button
                onClick={onOpenOnlineLobby}
                title="Multiplayer Squad Lobby"
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer border ${
                  onlineRoomCode
                    ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-600/80'
                    : 'bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 border-amber-700/60'
                }`}
              >
                {onlineRoomCode ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="font-['Cinzel'] tracking-wider">{onlineRoomCode}</span>
                    {onlinePlayersCount ? (
                      <span className="text-[10px] bg-emerald-900/80 px-1.5 py-0.2 rounded border border-emerald-700 font-semibold">
                        {onlinePlayersCount}P
                      </span>
                    ) : null}
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 text-amber-400" />
                    <span className="hidden sm:inline">Online Lobby</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onOpenRecipes}
              title="Kludge Recipes Handbook"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 border border-amber-700/60 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Recipes</span>
            </button>

            <button
              onClick={onToggleSound}
              title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
