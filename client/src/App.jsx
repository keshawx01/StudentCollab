import React, { useState, useEffect } from 'react';
import { useSocket, SocketProvider } from './context/SocketContext';
import { Header } from './components/Header';
import { AttendanceSidebar } from './components/AttendanceSidebar';
import { Whiteboard } from './components/Whiteboard';
import { SharedDocEditor } from './components/SharedDocEditor';
import { DoubtBoard } from './components/DoubtBoard';
import { SystemInspector } from './components/SystemInspector';
import { CreateRoomModal } from './components/CreateRoomModal';
import { LoginModal } from './components/LoginModal';

function MainApp() {
  const { currentRoom, joinRoom, roomsList, currentUser } = useSocket();

  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState('cs-302');
  const [activeTab, setActiveTab] = useState('whiteboard'); // whiteboard | document | doubts
  const [showInspector, setShowInspector] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(!currentUser.isVerified);


  // Sync rooms list from socket context or fetch from backend
  useEffect(() => {
    if (roomsList && roomsList.length > 0) {
      setRooms(roomsList);
    } else {
      const backendUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? window.location.origin : 'http://localhost:5000';
      fetch(`${backendUrl}/api/rooms`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setRooms(data);
          }
        })
        .catch(() => {});
    }
  }, [roomsList]);

  // Support reading shared room link from URL query params (e.g. ?room=cs-302)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setSelectedRoomId(roomParam);
      joinRoom(roomParam);
    } else {
      joinRoom('cs-302');
    }
  }, []);

  const handleSelectRoom = (roomId) => {
    setSelectedRoomId(roomId);
    joinRoom(roomId);
    // Update URL query string without reloading page
    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?room=${roomId}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  const handleShareLink = () => {
    const currentUrl = window.location.origin + window.location.pathname + `?room=${selectedRoomId}`;
    navigator.clipboard.writeText(currentUrl);
    alert(`Room share link copied to clipboard!\n${currentUrl}`);
  };

  return (
    <div className="min-h-screen bg-[#FAF4EC] text-[#1E1611] flex flex-col font-sans selection:bg-[#F26B27] selection:text-white">
      
      {/* Top Header */}
      <Header
        rooms={rooms.length > 0 ? rooms : [
          { id: 'cs-302', name: 'CS-302: Data Structures' },
          { id: 'ec-201', name: 'EC-201: Signals & Systems' },
          { id: 'himalaya-room-4', name: 'Himalaya Hostel Room 4' },
          { id: 'nith-hackathon-7', name: 'NITH Hackathon Team 7' }
        ]}
        selectedRoomId={selectedRoomId}
        onSelectRoom={handleSelectRoom}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showInspector={showInspector}
        setShowInspector={setShowInspector}
        onOpenCreateRoomModal={() => setShowCreateModal(true)}
        onOpenLoginModal={() => setShowLoginModal(true)}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 flex flex-col lg:flex-row gap-4">
        
        {/* Active Collaboration View */}
        <section className="flex-1 flex flex-col min-w-0">
          {activeTab === 'whiteboard' && <Whiteboard />}
          {activeTab === 'document' && <SharedDocEditor />}
          {activeTab === 'doubts' && <DoubtBoard />}
        </section>

        {/* Attendance & Participant Sidebar */}
        <AttendanceSidebar room={currentRoom} onShareLink={handleShareLink} />

      </main>

      {/* Technical System Architecture & Inspector Modal */}
      {showInspector && (
        <SystemInspector onClose={() => setShowInspector(false)} />
      )}

      {/* Create Room Modal */}
      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onRoomCreated={(newRoomId) => handleSelectRoom(newRoomId)}
        />
      )}

      {/* Login / Profile Modal */}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} forceSignUp={!currentUser.isVerified} />
      )}


    </div>
  );
}

export default function App() {
  return (
    <SocketProvider>
      <MainApp />
    </SocketProvider>
  );
}
