import React, { useRef, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Hand,
  Building,
  ShieldCheck,
  Radio,
  UserPlus,
  Share2,
  AlertCircle
} from 'lucide-react';

export const AttendanceSidebar = ({ room, onShareLink }) => {
  const {
    participants,
    currentUser,
    localStream,
    audioEnabled,
    videoEnabled,
    mediaError,
    toggleAudioPermission,
    toggleVideoPermission,
    emitPresenceToggle
  } = useSocket();

  const videoRef = useRef(null);

  const [isHandRaised, setIsHandRaised] = React.useState(false);

  // Attach real local media stream to video element when camera permission is granted
  useEffect(() => {
    if (videoRef.current && localStream && videoEnabled) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream, videoEnabled]);

  const handleToggleHand = () => {
    const next = !isHandRaised;
    setIsHandRaised(next);
    emitPresenceToggle({ handRaised: next });
  };

  return (
    <aside className="w-full lg:w-72 glass-panel rounded-3xl p-4 flex flex-col justify-between gap-4 border border-[#EADCCF] shadow-card bg-white/95">
      
      {/* Room Details Header */}
      <div>
        <div className="flex items-center justify-between border-b border-[#F2E8DC] pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#F26B27] animate-pulse" />
            <h2 className="text-xs font-black uppercase tracking-wider text-[#1E1611] font-display">
              Live Attendance ({participants.length})
            </h2>
          </div>
          <button
            onClick={onShareLink}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold rounded-full bg-[#FDEEE4] text-[#A04515] hover:bg-[#F26B27] hover:text-white transition-all border border-[#FED7AA]"
            title="Invite / Share Link"
          >
            <UserPlus className="w-3 h-3" />
            <span>Invite</span>
          </button>
        </div>

        {/* Room metadata card */}
        {room && (
          <div className="mb-3 bg-[#FAF4EC] p-3 rounded-2xl border border-[#EADCCF] text-xs">
            <div className="font-extrabold text-[#1E1611] mb-1 font-display">{room.name}</div>
            <div className="flex items-center gap-1.5 text-[#574C43] text-[11px] mb-1">
              <Building className="w-3.5 h-3.5 text-[#F26B27]" />
              <span>{room.building || 'NITH Campus'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#574C43] text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#A04515]" />
              <span>Host: {room.host || 'Student Host'}</span>
            </div>
          </div>
        )}

        {/* Live Camera Video Feed Preview (WebRTC Hardware Permission) */}
        {videoEnabled && (
          <div className="mb-3 rounded-2xl overflow-hidden border-2 border-[#F26B27] bg-black relative aspect-video shadow-md">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />
            <div className="absolute bottom-1 left-2 text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
              YOU (Live Cam)
            </div>
          </div>
        )}

        {/* Media Permission Warning Banner */}
        {mediaError && (
          <div className="mb-3 p-2.5 rounded-2xl bg-rose-500/10 border border-rose-300 text-rose-700 text-[11px] flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{mediaError}</span>
          </div>
        )}

        {/* Real Hardware Media Controls (Mic, Cam, Raise Hand) */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={toggleAudioPermission}
            className={`flex flex-col items-center justify-center p-2 rounded-2xl text-xs font-bold transition-all border ${
              audioEnabled
                ? 'bg-emerald-500/15 text-emerald-900 border-emerald-400 shadow-sm'
                : 'bg-[#FAF4EC] text-[#574C43] border-[#EADCCF] hover:bg-[#F2E8DC]'
            }`}
            title="Request Microphone Permission"
          >
            {audioEnabled ? <Mic className="w-4 h-4 mb-1 text-emerald-600" /> : <MicOff className="w-4 h-4 mb-1 text-[#78716C]" />}
            <span className="text-[10px]">{audioEnabled ? 'Mic On' : 'Unmute'}</span>
          </button>

          <button
            onClick={toggleVideoPermission}
            className={`flex flex-col items-center justify-center p-2 rounded-2xl text-xs font-bold transition-all border ${
              videoEnabled
                ? 'bg-[#F26B27]/15 text-[#A04515] border-[#F26B27] shadow-sm'
                : 'bg-[#FAF4EC] text-[#574C43] border-[#EADCCF] hover:bg-[#F2E8DC]'
            }`}
            title="Request Camera Permission"
          >
            {videoEnabled ? <Video className="w-4 h-4 mb-1 text-[#F26B27]" /> : <VideoOff className="w-4 h-4 mb-1 text-[#78716C]" />}
            <span className="text-[10px]">{videoEnabled ? 'Cam On' : 'Start Cam'}</span>
          </button>

          <button
            onClick={handleToggleHand}
            className={`flex flex-col items-center justify-center p-2 rounded-2xl text-xs font-bold transition-all border ${
              isHandRaised
                ? 'bg-amber-500/15 text-amber-900 border-amber-400 shadow-sm animate-bounce'
                : 'bg-[#FAF4EC] text-[#574C43] border-[#EADCCF] hover:bg-[#F2E8DC]'
            }`}
          >
            <Hand className={`w-4 h-4 mb-1 ${isHandRaised ? 'text-amber-600' : 'text-[#78716C]'}`} />
            <span className="text-[10px]">{isHandRaised ? 'Hand Up' : 'Raise Hand'}</span>
          </button>
        </div>

        {/* Participants List */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {participants.map((p) => {
            const isMe = p.id === currentUser.id || p.socketId === currentUser.id;
            return (
              <div
                key={p.socketId || p.id}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-[#FAF4EC]/80 border border-[#EADCCF] hover:bg-[#F2E8DC] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-8 h-8 rounded-full object-cover border-2 shadow-sm"
                      style={{ borderColor: p.color || '#F26B27' }}
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border border-white rounded-full"></div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold text-[#1E1611]">{p.name}</span>
                      {isMe && (
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-[#FDEEE4] text-[#A04515] border border-[#FED7AA]">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#574C43] font-mono">{p.rollNo}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {p.handRaised && (
                    <span className="p-1 rounded-full bg-amber-500/20 text-amber-600 animate-pulse" title="Hand Raised">
                      <Hand className="w-3.5 h-3.5" />
                    </span>
                  )}
                  {p.audio && (
                    <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-600" title="Mic Active">
                      <Mic className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Info Badge Footer */}
      <div className="pt-3 border-t border-[#F2E8DC] flex items-center gap-3">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-9 h-9 rounded-full object-cover border-2 shadow-sm"
          style={{ borderColor: currentUser.color || '#F26B27' }}
        />
        <div className="overflow-hidden">
          <div className="text-xs font-black text-[#1E1611] truncate">{currentUser.name}</div>
          <div className="text-[10px] text-[#A04515] font-mono truncate">{currentUser.rollNo} • NIT Hamirpur</div>
        </div>
      </div>

    </aside>
  );
};
