import React, { useState, useEffect } from 'react';
import {
  Users,
  Copy,
  Check,
  Sparkles,
  Shield,
  ArrowRight,
  Flame,
  X,
  Smartphone,
  Wifi,
  Crown,
  Heart,
  Wrench,
  BookOpen,
  Footprints,
  Play,
} from 'lucide-react';
import { OnlineRoomInfo, OnlineRoomPlayer } from '../types/game';
import { SIBLINGS_ROSTER, PLAYER_COLORS } from '../data/gameData';
import { sound } from '../utils/audio';

interface OnlineLobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: OnlineRoomInfo | null;
  localPlayerId: string | null;
  isHost: boolean;
  isConnecting: boolean;
  error: string | null;
  onCreateRoom: (hostName: string, siblingId: string, customCode?: string) => Promise<any>;
  onJoinRoom: (roomId: string, name: string, siblingId: string) => Promise<any>;
  onStartGame: () => Promise<void>;
  onSwitchToLocalGroup: () => void;
}

export const OnlineLobbyModal: React.FC<OnlineLobbyModalProps> = ({
  isOpen,
  onClose,
  room,
  localPlayerId,
  isHost,
  isConnecting,
  error,
  onCreateRoom,
  onJoinRoom,
  onStartGame,
  onSwitchToLocalGroup,
}) => {
  const [tab, setTab] = useState<'join' | 'host' | 'local'>('join');
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [selectedSibling, setSelectedSibling] = useState<string>('leo');
  const [copied, setCopied] = useState(false);

  // Check URL query parameters for ?room=XYZ
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRoom = params.get('room');
      if (urlRoom) {
        setRoomCode(urlRoom.toUpperCase());
        setTab('join');
      }
    }
  }, []);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (!room) return;
    const url = `${window.location.origin}${window.location.pathname}?room=${room.roomId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      sound.playCardSelect();
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !roomCode.trim()) return;
    try {
      await onJoinRoom(roomCode.trim().toUpperCase(), name.trim(), selectedSibling);
    } catch (err) {
      // Handled by hook error state
    }
  };

  const handleHostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await onCreateRoom(name.trim(), selectedSibling, roomCode.trim() || undefined);
    } catch (err) {
      // Handled by hook error state
    }
  };

  const myPlayer = room?.players.find((p) => p.id === localPlayerId);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-amber-600/70 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col gap-4 my-auto">
        {/* Amber glow background */}
        <div className="absolute top-0 right-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-950 border border-amber-700 text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Cinzel'] font-bold text-lg text-slate-100 tracking-wide flex items-center gap-2">
                Multiplayer Sibling Lobby
              </h3>
              <p className="text-xs text-slate-400">
                Log in as human players on separate phones, tablets, or laptops
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="bg-rose-950/80 border border-rose-600/80 text-rose-200 text-xs px-3.5 py-2.5 rounded-xl">
            {error}
          </div>
        )}

        {/* If ALREADY IN A ROOM: Show Active Lobby View */}
        {room ? (
          <div className="flex flex-col gap-4">
            {/* Room Code & Invite Share Card */}
            <div className="bg-slate-950/90 border border-amber-800/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Lobby Room Code (Tell your children to enter this code)
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-['Cinzel'] font-black text-2xl sm:text-3xl text-amber-300 tracking-widest">
                    {room.roomId}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </span>
                </div>
              </div>

              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-700/80 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Copy Join Link</span>
                  </>
                )}
              </button>
            </div>

            {/* Players in Lobby */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  Defenders in Lobby ({room.players.length} / 4)
                </span>
                <span className="text-[11px] text-slate-400">
                  {4 - room.players.length > 0
                    ? `Waiting for ${4 - room.players.length} more sibling(s)...`
                    : 'Full squad assembled!'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {room.players.map((player) => {
                  const sibling = SIBLINGS_ROSTER.find((s) => s.id === player.siblingId) || SIBLINGS_ROSTER[0];
                  const isMe = player.id === localPlayerId;

                  return (
                    <div
                      key={player.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                        isMe
                          ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                          : 'bg-slate-950/80 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-300 shrink-0">
                          {sibling.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-100 truncate max-w-[110px]">
                              {player.name}
                            </span>
                            {player.isHost && (
                              <span title="Squad Host" className="inline-flex">
                                <Crown className="w-3 h-3 text-amber-400 shrink-0" />
                              </span>
                            )}
                            {isMe && (
                              <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded font-semibold shrink-0">
                                YOU
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {sibling.name.split(' ')[0]} ({sibling.trait})
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Ready
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Empty open slot placeholder */}
                {Array.from({ length: Math.max(0, 4 - room.players.length) }).map((_, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-dashed border-slate-800 bg-slate-950/30 flex items-center justify-center text-xs text-slate-600 italic"
                  >
                    Open Sibling Slot
                  </div>
                ))}
              </div>
            </div>

            {/* Launch Game Actions */}
            <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
              {isHost ? (
                <button
                  onClick={onStartGame}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm uppercase tracking-wider rounded-xl border border-amber-300 shadow-xl shadow-amber-500/25 active:scale-98 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Launch Night Defense ({room.players.length} Players)!</span>
                </button>
              ) : (
                <div className="text-center py-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-amber-300/90 font-medium">
                  Waiting for Squad Host to launch the game... You're all set!
                </div>
              )}

              <p className="text-[11px] text-slate-400 text-center">
                All connected devices will automatically sync when the game begins.
              </p>
            </div>
          </div>
        ) : (
          /* NOT YET IN A ROOM: Navigation Tabs (Join, Host, or Local) */
          <div className="flex flex-col gap-4">
            {/* Mode selection tabs */}
            <div className="grid grid-cols-3 gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setTab('join')}
                className={`py-2 px-3 rounded-lg font-bold transition-colors cursor-pointer ${
                  tab === 'join'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Join with Code
              </button>
              <button
                type="button"
                onClick={() => setTab('host')}
                className={`py-2 px-3 rounded-lg font-bold transition-colors cursor-pointer ${
                  tab === 'host'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Room
              </button>
              <button
                type="button"
                onClick={() => {
                  onSwitchToLocalGroup();
                  onClose();
                }}
                className={`py-2 px-3 rounded-lg font-bold transition-colors text-slate-400 hover:text-slate-200 cursor-pointer`}
              >
                Pass & Play (1 Device)
              </button>
            </div>

            {tab === 'join' && (
              <form onSubmit={handleJoinSubmit} className="flex flex-col gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Room Code:
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="e.g. GOBLIN-42 or CANDLE-77"
                    maxLength={14}
                    required
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm font-['Cinzel'] tracking-widest uppercase focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Ask whoever created the room for the code, or click the invite link they sent!
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Your Name:
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name (e.g. Liam, Emma, Dad)"
                    maxLength={18}
                    required
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2 text-slate-100 text-sm focus:outline-none"
                  />
                </div>

                {/* Sibling Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Select Your Sibling Character:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SIBLINGS_ROSTER.map((sib) => {
                      const isSelected = selectedSibling === sib.id;
                      return (
                        <button
                          key={sib.id}
                          type="button"
                          onClick={() => setSelectedSibling(sib.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-950/60 border-amber-400 text-amber-200 ring-1 ring-amber-400'
                              : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-bold text-xs text-slate-100">{sib.name}</span>
                            <span className="text-[10px] text-amber-400 font-semibold">{sib.hp} HP</span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-tight">{sib.trait}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isConnecting || !name.trim() || !roomCode.trim()}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-bold text-sm uppercase tracking-wider rounded-xl border border-amber-300 shadow-lg shadow-amber-500/20 active:scale-98 flex items-center justify-center gap-2 transition-all cursor-pointer mt-1"
                >
                  <Wifi className="w-4 h-4" />
                  <span>{isConnecting ? 'Connecting...' : 'Join Lobby & Get In!'}</span>
                </button>
              </form>
            )}

            {tab === 'host' && (
              <form onSubmit={handleHostSubmit} className="flex flex-col gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Your Name (Host):
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name (e.g. Dad, Mom, Emma)"
                    maxLength={18}
                    required
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2 text-slate-100 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Custom Room Code (Optional):
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="Leave blank for auto-generated code"
                    maxLength={12}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2 text-slate-100 text-sm font-['Cinzel'] tracking-wider uppercase focus:outline-none"
                  />
                </div>

                {/* Sibling Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Select Your Sibling Character:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SIBLINGS_ROSTER.map((sib) => {
                      const isSelected = selectedSibling === sib.id;
                      return (
                        <button
                          key={sib.id}
                          type="button"
                          onClick={() => setSelectedSibling(sib.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-950/60 border-amber-400 text-amber-200 ring-1 ring-amber-400'
                              : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-bold text-xs text-slate-100">{sib.name}</span>
                            <span className="text-[10px] text-amber-400 font-semibold">{sib.hp} HP</span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-tight">{sib.trait}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isConnecting || !name.trim()}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-bold text-sm uppercase tracking-wider rounded-xl border border-amber-300 shadow-lg shadow-amber-500/20 active:scale-98 flex items-center justify-center gap-2 transition-all cursor-pointer mt-1"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isConnecting ? 'Creating Room...' : 'Create Room & Open Lobby'}</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
