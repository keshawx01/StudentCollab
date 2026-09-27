import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import {
  Users,
  Wifi,
  WifiOff,
  Cpu,
  GraduationCap,
  ChevronDown,
  Share2,
  PlusCircle,
  User,
  Check,
  Copy
} from 'lucide-react';

export const Header = ({
  rooms,
  selectedRoomId,
  onSelectRoom,
  activeTab,
  setActiveTab,
  showInspector,
  setShowInspector,
  onOpenCreateRoomModal,
  onOpenLoginModal
}) => {
  const { isConnected, latency, participants, currentUser } = useSocket();
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShareRoomLink = () => {
    const currentUrl = window.location.origin + window.location.pathname + `?room=${selectedRoomId}`;
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-[#EADCCF] px-4 py-3 shadow-card">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand & Logo - Clean NITH CollabHub ONLY as requested */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-[#F26B27] via-[#EA580C] to-[#C2410C] shadow-lg shadow-orange-500/30 text-white">
            <GraduationCap className="w-6 h-6" />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h1 className="font-black text-2xl tracking-tight text-[#1E1611] font-display">
              NITH <span className="text-[#F26B27]">CollabHub</span>
            </h1>
          </div>
        </div>

        {/* Room Switcher, Create Room, Share Link & View Tabs */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          
          {/* Room Selector */}
          <div className="relative flex-1 md:w-52">
            <select
              value={selectedRoomId}
              onChange={(e) => onSelectRoom(e.target.value)}
              className="w-full bg-white border border-[#EADCCF] rounded-full px-3.5 py-1.5 text-xs font-bold text-[#1E1611] focus:outline-none focus:ring-2 focus:ring-[#F26B27] cursor-pointer shadow-sm appearance-none pr-8"
            >
              {rooms.map((room) => (
                <option key={room.id} value={room.id} className="bg-white text-[#1E1611]">
                  📍 {room.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#574C43] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Create Room Button */}
          <button
            onClick={onOpenCreateRoomModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF4EC] hover:bg-[#F2E8DC] border border-[#EADCCF] text-[#1E1611] text-xs font-bold transition-all shadow-sm"
            title="Create New Custom Study Room"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#F26B27]" />
            <span>New Room</span>
          </button>

          {/* Share Room Link Button */}
          <button
            onClick={handleShareRoomLink}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm border ${
              copiedLink
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-[#FDEEE4] text-[#A04515] border-[#FED7AA] hover:bg-[#F26B27] hover:text-white'
            }`}
            title="Copy Direct Share Room Link"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share Room'}</span>
          </button>

          {/* Nav Tabs */}
          <div className="flex items-center bg-[#F2E8DC]/80 p-1 rounded-full border border-[#EADCCF] text-xs">
            <button
              onClick={() => setActiveTab('whiteboard')}
              className={`px-3 py-1 rounded-full font-bold transition-all ${
                activeTab === 'whiteboard'
                  ? 'bg-[#F26B27] text-white shadow-md shadow-orange-500/25'
                  : 'text-[#574C43] hover:text-[#1E1611]'
              }`}
            >
              🎨 Canvas
            </button>
            <button
              onClick={() => setActiveTab('document')}
              className={`px-3 py-1 rounded-full font-bold transition-all ${
                activeTab === 'document'
                  ? 'bg-[#F26B27] text-white shadow-md shadow-orange-500/25'
                  : 'text-[#574C43] hover:text-[#1E1611]'
              }`}
            >
              📝 Notes (OT)
            </button>
            <button
              onClick={() => setActiveTab('doubts')}
              className={`px-3 py-1 rounded-full font-bold transition-all ${
                activeTab === 'doubts'
                  ? 'bg-[#F26B27] text-white shadow-md shadow-orange-500/25'
                  : 'text-[#574C43] hover:text-[#1E1611]'
              }`}
            >
              ❓ Doubts
            </button>
          </div>
        </div>

        {/* User Profile Login Button, Socket Ping & Inspector Button */}
        <div className="flex items-center gap-2.5">
          
          {/* User Profile Button */}
          <button
            onClick={onOpenLoginModal}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#EADCCF] hover:border-[#F26B27] text-xs font-bold text-[#1E1611] shadow-sm transition-all"
            title="Edit Profile / Log In"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-5 h-5 rounded-full object-cover border border-[#F26B27]"
            />
            <span className="max-w-[90px] truncate">{currentUser.name}</span>
          </button>

          {/* System Inspector Button */}
          <button
            onClick={() => setShowInspector(!showInspector)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-md ${
              showInspector
                ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-purple-500/30'
                : 'bg-[#F26B27] hover:bg-[#E05315] text-white shadow-orange-500/25'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span className="hidden sm:inline">Inspector</span>
          </button>


        </div>

      </div>
    </header>
  );
};
