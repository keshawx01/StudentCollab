import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

const AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop&crop=faces'
];

const COLORS = ['#F26B27', '#059669', '#2563EB', '#7C3AED', '#D97706', '#DB2777'];

const getBackendUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return window.location.origin;
  }
  return 'http://127.0.0.1:5000';
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [latency, setLatency] = useState(12);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [roomsList, setRoomsList] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [whiteboardShapes, setWhiteboardShapes] = useState([]);
  const [documentState, setDocumentState] = useState({ content: '', version: 0, lastUpdatedBy: '' });
  const [doubts, setDoubts] = useState([]);
  const [remoteCursors, setRemoteCursors] = useState({});
  const [systemLogs, setSystemLogs] = useState([]);
  const [systemStats, setSystemStats] = useState(null);

  // WebRTC Real Media Streams (Audio & Camera)
  const [localStream, setLocalStream] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [mediaError, setMediaError] = useState(null);

  // Persistent User Profile with Multi-Room Membership
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('nith_collab_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    const randomNum = Math.floor(10 + Math.random() * 90);
    return {
      id: `std-${Date.now()}-${randomNum}`,
      name: `NIT Student #${randomNum}`,
      rollNo: `24BCS0${randomNum}`,
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      joinedRoomIds: ['cs-302']
    };
  });

  const socketRef = useRef(null);

  const loginUser = (userData) => {
    const updated = {
      ...currentUser,
      ...userData,
      id: currentUser.id || `std-${Date.now()}`
    };
    setCurrentUser(updated);
    localStorage.setItem('nith_collab_user', JSON.stringify(updated));
    if (socketRef.current && currentRoom) {
      socketRef.current.emit('room:join', { roomId: currentRoom.id, student: updated });
    }
  };

  const addSystemLog = (direction, eventName, payload) => {
    const log = {
      id: `client-log-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      timestamp: new Date().toLocaleTimeString(),
      direction,
      eventName,
      payloadSummary: JSON.stringify(payload).substring(0, 80)
    };
    setSystemLogs(prev => [log, ...prev.slice(0, 49)]);
  };

  const toggleAudioPermission = async () => {
    try {
      if (!audioEnabled) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: videoEnabled });
        setLocalStream(stream);
        setAudioEnabled(true);
        setMediaError(null);
        emitPresenceToggle({ audio: true });
      } else {
        if (localStream) {
          localStream.getAudioTracks().forEach(track => track.stop());
        }
        setAudioEnabled(false);
        emitPresenceToggle({ audio: false });
      }
    } catch (err) {
      setMediaError('Microphone permission denied or device not found.');
      setAudioEnabled(false);
      emitPresenceToggle({ audio: false });
    }
  };

  const toggleVideoPermission = async () => {
    try {
      if (!videoEnabled) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: audioEnabled, video: true });
        setLocalStream(stream);
        setVideoEnabled(true);
        setMediaError(null);
        emitPresenceToggle({ video: true });
      } else {
        if (localStream) {
          localStream.getVideoTracks().forEach(track => track.stop());
        }
        setVideoEnabled(false);
        emitPresenceToggle({ video: false });
      }
    } catch (err) {
      setMediaError('Camera permission denied or device not found.');
      setVideoEnabled(false);
      emitPresenceToggle({ video: false });
    }
  };

  useEffect(() => {
    const backendUrl = getBackendUrl();
    const newSocket = io(backendUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      addSystemLog('RECEIVED', 'connect', { socketId: newSocket.id });
      if (currentRoom) {
        newSocket.emit('room:join', { roomId: currentRoom.id, student: currentUser });
      }
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      addSystemLog('RECEIVED', 'disconnect', {});
    });

    newSocket.on('rooms:updated', (rooms) => {
      setRoomsList(rooms);
    });

    newSocket.on('room:snapshot', ({ room, participants: roomParts }) => {
      setCurrentRoom(room);
      setParticipants(roomParts || []);
      setWhiteboardShapes(room?.whiteboard || []);
      setDocumentState(room?.document || { content: '', version: 0, lastUpdatedBy: '' });
      setDoubts(room?.doubts || []);
      addSystemLog('RECEIVED', 'room:snapshot', { roomId: room?.id, parts: (roomParts || []).length });
    });

    newSocket.on('presence:update', (updatedParts) => {
      setParticipants(updatedParts);
      addSystemLog('RECEIVED', 'presence:update', { count: updatedParts.length });
    });

    newSocket.on('whiteboard:sync', (shapes) => {
      setWhiteboardShapes(shapes);
      addSystemLog('RECEIVED', 'whiteboard:sync', { count: shapes.length });
    });

    newSocket.on('doc:update', ({ doc, deltaOp }) => {
      setDocumentState(doc);
      addSystemLog('RECEIVED', 'doc:update', { version: doc?.version, deltaOp });
    });

    newSocket.on('doubt:sync', (updatedDoubts) => {
      setDoubts(updatedDoubts);
      addSystemLog('RECEIVED', 'doubt:sync', { count: updatedDoubts.length });
    });

    newSocket.on('cursor:update', ({ socketId, name, color, x, y }) => {
      setRemoteCursors(prev => ({
        ...prev,
        [socketId]: { name, color, x, y, lastSeen: Date.now() }
      }));
    });

    const pingInterval = setInterval(() => {
      const start = Date.now();
      fetch(`${backendUrl}/api/system/stats`)
        .then(res => res.json())
        .then(data => {
          setLatency(Math.max(4, Date.now() - start));
          setSystemStats(data);
          setIsConnected(true);
        })
        .catch(() => setLatency(25));
    }, 4000);

    return () => {
      clearInterval(pingInterval);
      newSocket.close();
    };
  }, []);

  const joinRoom = (roomId) => {
    // Add to student's joined rooms list
    const currentJoined = currentUser.joinedRoomIds || [];
    if (!currentJoined.includes(roomId)) {
      const updatedJoined = [...currentJoined, roomId];
      const updatedUser = { ...currentUser, joinedRoomIds: updatedJoined };
      setCurrentUser(updatedUser);
      localStorage.setItem('nith_collab_user', JSON.stringify(updatedUser));
    }

    if (socketRef.current) {
      socketRef.current.emit('room:join', { roomId, student: currentUser });
      addSystemLog('SENT', 'room:join', { roomId, studentName: currentUser.name });
    }
  };

  const createNewRoom = async (roomData) => {
    const backendUrl = getBackendUrl();
    const newRoomId = `room-${Date.now()}`;
    const payload = {
      ...roomData,
      id: newRoomId,
      host: currentUser.name
    };

    // Emit via WebSocket
    if (socketRef.current) {
      socketRef.current.emit('room:create', payload);
    }

    // Immediate local state update for instant zero-latency feedback
    const localNewRoom = {
      id: newRoomId,
      name: payload.name,
      category: payload.category || 'Custom Room',
      building: payload.building || 'Online',
      host: currentUser.name,
      description: payload.description || 'Custom study room',
      activeCount: 1
    };

    setRoomsList(prev => [...prev, localNewRoom]);

    // Send HTTP POST to persist
    try {
      await fetch(`${backendUrl}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('Backend fetch create room fallback:', err);
    }

    // Auto-join new room
    joinRoom(newRoomId);
    return localNewRoom;
  };

  const emitWhiteboardAdd = (shape) => {
    if (!socketRef.current) return;
    socketRef.current.emit('whiteboard:shape-add', shape);
    addSystemLog('SENT', 'whiteboard:shape-add', { type: shape.type });
  };

  const emitWhiteboardUpdate = (shapes) => {
    if (!socketRef.current) return;
    socketRef.current.emit('whiteboard:shapes-update', shapes);
    addSystemLog('SENT', 'whiteboard:shapes-update', { count: shapes.length });
  };

  const emitWhiteboardClear = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('whiteboard:clear');
    addSystemLog('SENT', 'whiteboard:clear', {});
  };

  const emitDocOp = (content, deltaOp) => {
    if (!socketRef.current) return;
    socketRef.current.emit('doc:op', {
      content,
      updatedBy: currentUser.name,
      deltaOp
    });
    addSystemLog('SENT', 'doc:op', { deltaOp });
  };

  const emitDoubtAdd = (title, details, codeSnippet) => {
    if (!socketRef.current) return;
    socketRef.current.emit('doubt:add', {
      author: currentUser.name,
      authorId: currentUser.id,
      avatar: currentUser.avatar,
      title,
      details,
      codeSnippet
    });
    addSystemLog('SENT', 'doubt:add', { title });
  };

  const emitDoubtUpvote = (doubtId) => {
    if (!socketRef.current) return;
    socketRef.current.emit('doubt:upvote', { doubtId, userId: currentUser.id });
    addSystemLog('SENT', 'doubt:upvote', { doubtId });
  };

  const emitDoubtResolve = (doubtId, status) => {
    if (!socketRef.current) return;
    socketRef.current.emit('doubt:resolve', { doubtId, status });
    addSystemLog('SENT', 'doubt:resolve', { doubtId, status });
  };

  const emitDoubtReply = (doubtId, text) => {
    if (!socketRef.current) return;
    socketRef.current.emit('doubt:reply', { doubtId, author: currentUser.name, text });
    addSystemLog('SENT', 'doubt:reply', { doubtId });
  };

  const emitCursorMove = (x, y) => {
    if (!socketRef.current) return;
    socketRef.current.emit('cursor:move', {
      name: currentUser.name,
      color: currentUser.color,
      x,
      y
    });
  };

  const emitPresenceToggle = (updates) => {
    if (!socketRef.current) return;
    socketRef.current.emit('presence:toggle', updates);
    addSystemLog('SENT', 'presence:toggle', updates);
  };

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      latency,
      currentUser,
      loginUser,
      currentRoom,
      roomsList,
      participants,
      whiteboardShapes,
      documentState,
      doubts,
      remoteCursors,
      systemLogs,
      systemStats,
      localStream,
      audioEnabled,
      videoEnabled,
      mediaError,
      toggleAudioPermission,
      toggleVideoPermission,
      joinRoom,
      createNewRoom,
      emitWhiteboardAdd,
      emitWhiteboardUpdate,
      emitWhiteboardClear,
      emitDocOp,
      emitDoubtAdd,
      emitDoubtUpvote,
      emitDoubtResolve,
      emitDoubtReply,
      emitCursorMove,
      emitPresenceToggle
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
