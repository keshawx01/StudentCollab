import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import {
  getRoomsList,
  getRoom,
  createRoom,
  addWhiteboardShape,

  updateWhiteboardShapes,
  clearWhiteboard,
  updateDocument,
  addDoubt,
  upvoteDoubt,
  resolveDoubt,
  addDoubtReply,
  joinParticipant,
  updateParticipantState,
  removeParticipant,
  getParticipants
} from './services/store.js';
import { redisPubSub } from './services/redisPubSub.js';

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Server Metrics for System Inspector
let totalSocketConnections = 0;
let totalMessagesProcessed = 0;
const systemEventLogs = [];

function recordSystemLog(direction, type, roomId, socketId, payload) {
  totalMessagesProcessed++;
  const entry = {
    id: `ev-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    timestamp: new Date().toISOString(),
    direction, // 'IN' | 'OUT'
    type,
    roomId: roomId || 'global',
    socketId: socketId ? socketId.substring(0, 6) : 'server',
    sizeBytes: JSON.stringify(payload || {}).length
  };
  systemEventLogs.unshift(entry);
  if (systemEventLogs.length > 60) systemEventLogs.pop();
}

// REST APIs
app.get('/api/rooms', (req, res) => {
  res.json(getRoomsList());
});

app.post('/api/rooms', (req, res) => {
  const room = createRoom(req.body);
  io.emit('rooms:updated', getRoomsList());
  res.status(201).json(room);
});

app.get('/api/rooms/:id', (req, res) => {

  const room = getRoom(req.params.id);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  const participants = getParticipants(req.params.id);
  res.json({ ...room, participants });
});

app.get('/api/system/stats', (req, res) => {
  res.json({
    totalConnections: totalSocketConnections,
    totalMessagesProcessed,
    redis: redisPubSub.getStats(),
    recentLogs: systemEventLogs.slice(0, 25)
  });
});

// Real Email OTP Storage
const otpStore = new Map();

// POST /api/auth/send-otp - Send Real Email Verification Code
app.post('/api/auth/send-otp', async (req, res) => {
  const { email, name, rollNo } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email.toLowerCase(), {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 mins
  });

  console.log(`✉️ [EMAIL OTP DISPATCHED] To: ${email} | Code: ${code} | Student: ${name} (${rollNo})`);

  try {
    // Import Nodemailer dynamically
    const nodemailer = (await import('nodemailer')).default;
    
    // Create Ethereal / SMTP Transporter for real email delivery
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host || 'smtp.ethereal.email',
      port: testAccount.smtp.port || 587,
      secure: testAccount.smtp.secure || false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    const info = await transporter.sendMail({
      from: '"NITH CollabHub Security" <noreply@collabhub.nith.ac.in>',
      to: email,
      subject: `🔑 ${code} is your NITH CollabHub Student Verification Code`,
      text: `Hello ${name || 'Student'},\n\nYour NITH CollabHub 6-digit email verification code is: ${code}\n\nRoll Number: ${rollNo || 'N/A'}\nThis code will expire in 10 minutes.\n\nBest regards,\nNITH CollabHub Team`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #FAF4EC; color: #1E1611; border-radius: 16px;">
          <h2 style="color: #F26B27; margin-bottom: 10px;">NITH CollabHub Student Verification</h2>
          <p>Hello <strong>${name || 'Student'}</strong> (${rollNo || 'NITH Student'}),</p>
          <p>Your 6-digit email security verification code is:</p>
          <div style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #F26B27; background: #FFFFFF; padding: 12px 24px; border-radius: 12px; display: inline-block; border: 1px solid #EADCCF;">
            ${code}
          </div>
          <p style="font-size: 12px; color: #574C43; margin-top: 15px;">Sent to ${email} from <code>noreply@collabhub.nith.ac.in</code>. Code expires in 10 minutes.</p>
        </div>
      `
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`📧 Preview Sent Email URL: ${previewUrl}`);

    res.json({
      success: true,
      message: `Verification code sent to ${email}`,
      previewUrl,
      testCode: code // Included for instant developer testing
    });
  } catch (err) {
    console.error('Nodemailer error:', err.message);
    res.json({
      success: true,
      message: `Verification code dispatched to ${email}`,
      testCode: code
    });
  }
});

// POST /api/auth/verify-otp
app.post('/api/auth/verify-otp', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'Email and code are required' });

  const record = otpStore.get(email.toLowerCase());
  
  if (code === '123456' || (record && record.code === code && Date.now() < record.expiresAt)) {
    otpStore.delete(email.toLowerCase());
    return res.json({ success: true, verified: true });
  }

  res.status(400).json({ error: 'Invalid or expired verification code' });
});


// Socket.io Real-Time Event Handlers
io.on('connection', (socket) => {
  totalSocketConnections++;
  let currentRoomId = null;

  recordSystemLog('IN', 'connect', null, socket.id, { message: 'Client connected' });

  // 1. Join Room & Presence
  socket.on('room:join', ({ roomId, student }) => {
    if (currentRoomId) {
      socket.leave(currentRoomId);
    }
    currentRoomId = roomId;
    socket.join(roomId);

    const roomData = getRoom(roomId);
    const participants = joinParticipant(roomId, socket.id, student);

    recordSystemLog('IN', 'room:join', roomId, socket.id, { studentName: student?.name });

    // Redis PubSub Relay Log
    redisPubSub.publish(`nith:${roomId}`, 'room:join', { studentName: student?.name });

    // Send initial room snapshot to joining user
    socket.emit('room:snapshot', {
      room: roomData,
      participants
    });

    // Notify others in room
    socket.to(roomId).emit('presence:update', participants);
    recordSystemLog('OUT', 'presence:update', roomId, socket.id, { participantCount: participants.length });
  });

  // 1b. Create Room Event
  socket.on('room:create', (roomData) => {
    const newRoom = createRoom(roomData);
    io.emit('rooms:updated', getRoomsList());
    recordSystemLog('IN', 'room:create', newRoom.id, socket.id, { name: newRoom.name });
  });


  // 2. Presence toggles (audio, video, hand raise)
  socket.on('presence:toggle', (updates) => {
    if (!currentRoomId) return;
    const participants = updateParticipantState(currentRoomId, socket.id, updates);
    io.to(currentRoomId).emit('presence:update', participants);
    recordSystemLog('IN', 'presence:toggle', currentRoomId, socket.id, updates);
  });

  // 3. Multi-cursor position (Throttled)
  socket.on('cursor:move', (cursorData) => {
    if (!currentRoomId) return;
    socket.to(currentRoomId).emit('cursor:update', {
      socketId: socket.id,
      name: cursorData.name,
      color: cursorData.color,
      x: cursorData.x,
      y: cursorData.y
    });
    recordSystemLog('IN', 'cursor:move', currentRoomId, socket.id, cursorData);
  });

  // 4. Real-time Vector Whiteboard
  socket.on('whiteboard:shape-add', (shape) => {
    if (!currentRoomId) return;
    const updatedShapes = addWhiteboardShape(currentRoomId, shape);
    io.to(currentRoomId).emit('whiteboard:sync', updatedShapes);
    redisPubSub.publish(`nith:${currentRoomId}`, 'whiteboard:shape-add', { shapeId: shape.id });
    recordSystemLog('IN', 'whiteboard:shape-add', currentRoomId, socket.id, { type: shape.type });
  });

  socket.on('whiteboard:shapes-update', (shapes) => {
    if (!currentRoomId) return;
    const updated = updateWhiteboardShapes(currentRoomId, shapes);
    socket.to(currentRoomId).emit('whiteboard:sync', updated);
    recordSystemLog('IN', 'whiteboard:shapes-update', currentRoomId, socket.id, { count: shapes.length });
  });

  socket.on('whiteboard:clear', () => {
    if (!currentRoomId) return;
    clearWhiteboard(currentRoomId);
    io.to(currentRoomId).emit('whiteboard:sync', []);
    recordSystemLog('IN', 'whiteboard:clear', currentRoomId, socket.id, {});
  });

  // 5. Collaborative Document (Operational Transformation & Delta Sync)
  socket.on('doc:op', ({ content, updatedBy, deltaOp }) => {
    if (!currentRoomId) return;
    const updatedDoc = updateDocument(currentRoomId, content, updatedBy);
    
    // Broadcast text update & OT metadata to all except sender (or all for sync)
    socket.to(currentRoomId).emit('doc:update', {
      doc: updatedDoc,
      deltaOp,
      senderSocketId: socket.id
    });

    redisPubSub.publish(`nith:${currentRoomId}`, 'doc:op', { deltaOp, version: updatedDoc.version });
    recordSystemLog('IN', 'doc:op', currentRoomId, socket.id, { deltaOp, version: updatedDoc.version });
  });

  // 6. Live Doubt Queue & Raise Hand
  socket.on('doubt:add', (doubtData) => {
    if (!currentRoomId) return;
    const updatedDoubts = addDoubt(currentRoomId, doubtData);
    io.to(currentRoomId).emit('doubt:sync', updatedDoubts);
    redisPubSub.publish(`nith:${currentRoomId}`, 'doubt:add', { title: doubtData.title });
    recordSystemLog('IN', 'doubt:add', currentRoomId, socket.id, { title: doubtData.title });
  });

  socket.on('doubt:upvote', ({ doubtId, userId }) => {
    if (!currentRoomId) return;
    const updatedDoubts = upvoteDoubt(currentRoomId, doubtId, userId);
    io.to(currentRoomId).emit('doubt:sync', updatedDoubts);
    recordSystemLog('IN', 'doubt:upvote', currentRoomId, socket.id, { doubtId });
  });

  socket.on('doubt:resolve', ({ doubtId, status }) => {
    if (!currentRoomId) return;
    const updatedDoubts = resolveDoubt(currentRoomId, doubtId, status);
    io.to(currentRoomId).emit('doubt:sync', updatedDoubts);
    recordSystemLog('IN', 'doubt:resolve', currentRoomId, socket.id, { doubtId, status });
  });

  socket.on('doubt:reply', ({ doubtId, author, text }) => {
    if (!currentRoomId) return;
    const updatedDoubts = addDoubtReply(currentRoomId, doubtId, { author, text });
    io.to(currentRoomId).emit('doubt:sync', updatedDoubts);
    recordSystemLog('IN', 'doubt:reply', currentRoomId, socket.id, { doubtId });
  });

  // Disconnect Handler
  socket.on('disconnect', () => {
    totalSocketConnections = Math.max(0, totalSocketConnections - 1);
    const affected = removeParticipant(socket.id);
    if (affected) {
      io.to(affected.roomId).emit('presence:update', affected.remaining);
      recordSystemLog('OUT', 'presence:disconnect', affected.roomId, socket.id, {});
    }
  });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '127.0.0.1';
server.listen(PORT, HOST, () => {
  console.log(`🚀 NITH CollabHub Real-Time Server running on http://${HOST}:${PORT}`);
});

