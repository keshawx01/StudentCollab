// In-Memory Data Store with persistence interface for Campus Study Rooms

const rooms = {
  'cs-302': {
    id: 'cs-302',
    name: 'CS-302: Data Structures & Algorithms',
    category: 'Department Course',
    building: 'LHC-102',
    host: 'Prof. Sharma / TA Rohit',
    description: 'Live doubt solving and shared whiteboard for Binary Trees, Graph algorithms, and LeetCode discussions.',
    whiteboard: [
      {
        id: 'shape-1',
        type: 'text',
        x: 120,
        y: 80,
        text: '🌲 Binary Search Tree In-Order Traversal',
        color: '#60A5FA',
        fontSize: 22
      },
      {
        id: 'shape-2',
        type: 'rect',
        x: 100,
        y: 130,
        width: 480,
        height: 220,
        color: '#3B82F6',
        strokeWidth: 2,
        fill: 'rgba(59, 130, 246, 0.08)'
      },
      {
        id: 'shape-3',
        type: 'sticky',
        x: 620,
        y: 130,
        width: 200,
        height: 160,
        text: '📌 Homework Alert:\nImplement Red-Black Tree rotateLeft() by Friday 11:59 PM!',
        color: '#FBBF24'
      }
    ],
    document: {
      content: `# CS-302: Data Structures & Algorithms Notes

## 1. Tree Traversals Summary
- **In-Order (Left, Root, Right)**: Yields sorted order for BST.
- **Pre-Order (Root, Left, Right)**: Useful for copying tree topology.
- **Post-Order (Left, Right, Root)**: Useful for bottom-up deletion or tree size computation.

\`\`\`cpp
// In-Order Traversal C++ snippet
void inOrder(Node* root) {
    if (!root) return;
    inOrder(root->left);
    cout << root->val << " ";
    inOrder(root->right);
}
\`\`\`

## 2. Graph Algorithms Preview
- Dijkstra Shortest Path: O((V + E) log V) using Priority Queue.
- Bellman-Ford: Handles negative edge weights, detects negative cycles.
`,
      version: 12,
      lastUpdatedBy: 'Rohit (TA)',
      history: [
        { version: 10, updatedBy: 'Aman Kumar', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { version: 11, updatedBy: 'Priya Sharma', timestamp: new Date(Date.now() - 1800000).toISOString() },
        { version: 12, updatedBy: 'Rohit (TA)', timestamp: new Date(Date.now() - 300000).toISOString() }
      ]
    },
    doubts: [
      {
        id: 'd-1',
        author: 'Sunil Verma (Roll: 21BCS042)',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
        title: 'How does amortized time complexity work for Dynamic Arrays?',
        details: 'Why is vector push_back() O(1) on average even though resizing takes O(N) when capacity doubles?',
        upvotes: 7,
        upvoters: ['user-1', 'user-2', 'user-3'],
        status: 'In Discussion', // Unresolved | In Discussion | Resolved
        codeSnippet: `std::vector<int> arr;\nfor(int i=0; i<1000; i++) {\n  arr.push_back(i); // Resizes at 1, 2, 4, 8, 16...\n}`,
        raisedAt: new Date(Date.now() - 2400000).toISOString(),
        replies: [
          { author: 'Rohit (TA)', text: 'Geometric expansion! Total copying work for N elements is 1 + 2 + 4 + ... + N = 2N - 1. Divided by N operations, work per op is <= 2 -> O(1) amortized!' }
        ]
      },
      {
        id: 'd-2',
        author: 'Neha Thakur (Roll: 21BCS089)',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
        title: 'Difference between Kruskal and Prim algorithms for MST?',
        details: 'When should we prefer Kruskal using Disjoint Set Union over Prim using Min Heap?',
        upvotes: 4,
        upvoters: ['user-4'],
        status: 'Unresolved',
        codeSnippet: '',
        raisedAt: new Date(Date.now() - 900000).toISOString(),
        replies: []
      }
    ]
  },

  'ec-201': {
    id: 'ec-201',
    name: 'EC-201: Signals & Systems',
    category: 'Department Course',
    building: 'LHC-204',
    host: 'Dr. R. K. Singh',
    description: 'Fourier Transform derivation, Laplace transform properties, and MATLAB filter design lab.',
    whiteboard: [
      {
        id: 'shape-10',
        type: 'text',
        x: 100,
        y: 100,
        text: '⚡ Continuous-Time Fourier Transform (CTFT)',
        color: '#10B981',
        fontSize: 22
      },
      {
        id: 'shape-11',
        type: 'sticky',
        x: 500,
        y: 120,
        width: 220,
        height: 150,
        text: '💡 Key Concept:\nConvolution in Time Domain ⟷ Multiplication in Frequency Domain!',
        color: '#F472B6'
      }
    ],
    document: {
      content: `# EC-201: Signals & Systems Notes

## Fourier Transform Formulas
- **Direct CTFT**: X(w) = integral_-infinity^+infinity x(t) e^(-jwt) dt
- **Inverse CTFT**: x(t) = 1/(2pi) integral_-infinity^+infinity X(w) e^(jwt) dw

## Sampling Theorem (Nyquist-Shannon)
To perfectly reconstruct a bandlimited signal with maximum frequency B, the sampling frequency fs must satisfy:
$$ f_s \\ge 2 B $$
`,
      version: 5,
      lastUpdatedBy: 'Vikram Mehta',
      history: []
    },
    doubts: [
      {
        id: 'd-20',
        author: 'Ananya Sharma',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces',
        title: 'Region of Convergence (ROC) properties for Right-Sided signals?',
        details: 'Does ROC extend outward from the outermost pole to infinity?',
        upvotes: 5,
        upvoters: [],
        status: 'Resolved',
        codeSnippet: '',
        raisedAt: new Date(Date.now() - 5400000).toISOString(),
        replies: [
          { author: 'Dr. R. K. Singh', text: 'Yes, exactly! For a right-sided signal, ROC is Re(s) > max_pole_real.' }
        ]
      }
    ]
  },

  'himalaya-room-4': {
    id: 'himalaya-room-4',
    name: 'Himalaya Hostel Study Room 4',
    category: 'Hostel Group Study',
    building: 'Himalaya Hostel Block C',
    host: 'Akash & Group',
    description: 'Late-night competitive programming, Gate CS revision, and system design mock discussions.',
    whiteboard: [
      {
        id: 'shape-30',
        type: 'text',
        x: 150,
        y: 80,
        text: '🚀 Scalable WebSockets Architecture',
        color: '#A855F7',
        fontSize: 24
      }
    ],
    document: {
      content: `# GATE CS 2027 Notes & Mock Group Strategy

1. **Operating Systems**: Page replacement (LRU vs FIFO), Deadlock Prevention vs Avoidance (Banker's Algorithm).
2. **Computer Networks**: TCP Flow Control (Sliding Window) vs Congestion Control (Slow Start, Fast Retransmit).
3. **DBMS**: B+ Tree index depth calculation and normalization (3NF vs BCNF).
`,
      version: 3,
      lastUpdatedBy: 'Akash Verma',
      history: []
    },
    doubts: []
  },

  'nith-hackathon-7': {
    id: 'nith-hackathon-7',
    name: 'NITH Annual Hackathon Team 7',
    category: 'Project Work',
    building: 'Computer Center Lab 2',
    host: 'Team Alpha',
    description: 'Real-time collaborative project room for NITH Hackathon 2026 submission.',
    whiteboard: [],
    document: {
      content: `# NITH Hackathon Project Proposal: Smart Campus IoT & Collab

## Architecture Overview
- React + Tailwind frontend for high-FPS user interactions.
- Socket.io WebSockets with Redis Pub/Sub for distributed server scalability.
- MongoDB for persistent storage of user notes, whiteboards, and doubt logs.
`,
      version: 8,
      lastUpdatedBy: 'Karan Malhotra',
      history: []
    },
    doubts: []
  }
};

// In-Memory active sockets per room: roomID -> Map<socketId, studentInfo>
const activeParticipants = new Map();

export const getRoomsList = () => {
  return Object.values(rooms).map(r => ({
    id: r.id,
    name: r.name,
    category: r.category,
    building: r.building,
    host: r.host,
    description: r.description,
    activeCount: activeParticipants.has(r.id) ? activeParticipants.get(r.id).size : 0
  }));
};

export const getRoom = (id) => {
  return rooms[id] || null;
};

export const createRoom = (roomData) => {
  const id = roomData.id || `room-${Date.now()}`;
  rooms[id] = {
    id,
    name: roomData.name || 'New Study Room',
    category: roomData.category || 'General Study',
    building: roomData.building || 'Online / Virtual',
    host: roomData.host || 'Student Host',
    description: roomData.description || 'Custom study room created for collaborative study.',
    whiteboard: [],
    document: {
      content: `# ${roomData.name}\n\nWelcome to your shared collaborative study room!`,
      version: 1,
      lastUpdatedBy: roomData.host || 'System',
      history: []
    },
    doubts: []
  };
  return rooms[id];
};


export const addWhiteboardShape = (roomId, shape) => {
  if (!rooms[roomId]) return null;
  const existingIdx = rooms[roomId].whiteboard.findIndex(s => s.id === shape.id);
  if (existingIdx >= 0) {
    rooms[roomId].whiteboard[existingIdx] = { ...rooms[roomId].whiteboard[existingIdx], ...shape };
  } else {
    rooms[roomId].whiteboard.push(shape);
  }
  return rooms[roomId].whiteboard;
};

export const updateWhiteboardShapes = (roomId, shapes) => {
  if (!rooms[roomId]) return null;
  rooms[roomId].whiteboard = shapes;
  return rooms[roomId].whiteboard;
};

export const clearWhiteboard = (roomId) => {
  if (!rooms[roomId]) return null;
  rooms[roomId].whiteboard = [];
  return [];
};

export const updateDocument = (roomId, content, updatedBy) => {
  if (!rooms[roomId]) return null;
  const doc = rooms[roomId].document;
  doc.version += 1;
  doc.content = content;
  doc.lastUpdatedBy = updatedBy;
  doc.history.unshift({
    version: doc.version,
    updatedBy,
    timestamp: new Date().toISOString()
  });
  if (doc.history.length > 20) doc.history.pop();
  return doc;
};

export const addDoubt = (roomId, doubtData) => {
  if (!rooms[roomId]) return null;
  const newDoubt = {
    id: `d-${Date.now()}`,
    author: doubtData.author || 'Anonymous Student',
    avatar: doubtData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
    title: doubtData.title,
    details: doubtData.details || '',
    upvotes: 1,
    upvoters: [doubtData.authorId || 'self'],
    status: 'Unresolved',
    codeSnippet: doubtData.codeSnippet || '',
    raisedAt: new Date().toISOString(),
    replies: []
  };
  rooms[roomId].doubts.unshift(newDoubt);
  return rooms[roomId].doubts;
};

export const upvoteDoubt = (roomId, doubtId, userId) => {
  if (!rooms[roomId]) return null;
  const doubt = rooms[roomId].doubts.find(d => d.id === doubtId);
  if (doubt) {
    const hasUpvoted = doubt.upvoters.includes(userId);
    if (hasUpvoted) {
      doubt.upvoters = doubt.upvoters.filter(u => u !== userId);
      doubt.upvotes = Math.max(0, doubt.upvotes - 1);
    } else {
      doubt.upvoters.push(userId);
      doubt.upvotes += 1;
    }
  }
  return rooms[roomId].doubts;
};

export const resolveDoubt = (roomId, doubtId, status) => {
  if (!rooms[roomId]) return null;
  const doubt = rooms[roomId].doubts.find(d => d.id === doubtId);
  if (doubt) {
    doubt.status = status;
  }
  return rooms[roomId].doubts;
};

export const addDoubtReply = (roomId, doubtId, replyData) => {
  if (!rooms[roomId]) return null;
  const doubt = rooms[roomId].doubts.find(d => d.id === doubtId);
  if (doubt) {
    doubt.replies.push({
      author: replyData.author,
      text: replyData.text,
      timestamp: new Date().toISOString()
    });
  }
  return rooms[roomId].doubts;
};

// Participant Presence Management
// Default Campus Peers per Room for Live Attendance
const roomPeerSeeds = {
  'cs-302': [
    { id: 'peer-1', name: 'Rohit (TA)', rollNo: '21BCS001', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=faces', color: '#059669', audio: false, video: false, handRaised: false },
    { id: 'peer-2', name: 'Priya Sharma', rollNo: '24BCS012', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces', color: '#2563EB', audio: true, video: false, handRaised: false }
  ],
  'ec-201': [
    { id: 'peer-3', name: 'Vikram Mehta', rollNo: '24BCS089', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=faces', color: '#7C3AED', audio: false, video: false, handRaised: false }
  ]
};

export const joinParticipant = (roomId, socketId, student) => {
  if (!activeParticipants.has(roomId)) {
    activeParticipants.set(roomId, new Map());
  }
  const roomMap = activeParticipants.get(roomId);
  const participantData = {
    socketId,
    id: student.id || socketId,
    name: student.name || 'NIT Student',
    rollNo: student.rollNo || `24BCS${Math.floor(1000 + Math.random() * 9000)}`,
    avatar: student.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
    color: student.color || '#F26B27',
    audio: student.audio || false,
    video: student.video || false,
    handRaised: student.handRaised || false,
    joinedAt: new Date().toISOString()
  };
  roomMap.set(socketId, participantData);
  return getParticipants(roomId);
};

export const updateParticipantState = (roomId, socketId, updates) => {
  if (!activeParticipants.has(roomId)) return [];
  const roomMap = activeParticipants.get(roomId);
  if (roomMap.has(socketId)) {
    const current = roomMap.get(socketId);
    roomMap.set(socketId, { ...current, ...updates });
  }
  return getParticipants(roomId);
};

export const removeParticipant = (socketId) => {
  let affectedRoom = null;
  activeParticipants.forEach((roomMap, roomId) => {
    if (roomMap.has(socketId)) {
      roomMap.delete(socketId);
      affectedRoom = { roomId, remaining: getParticipants(roomId) };
    }
  });
  return affectedRoom;
};

export const getParticipants = (roomId) => {
  const seeds = roomPeerSeeds[roomId] || [];
  const live = activeParticipants.has(roomId) ? Array.from(activeParticipants.get(roomId).values()) : [];
  
  // Merge live sockets with seeds without duplicates
  const liveIds = new Set(live.map(p => p.id));
  const filteredSeeds = seeds.filter(s => !liveIds.has(s.id));
  
  return [...live, ...filteredSeeds];
};

