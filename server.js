const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Prepare Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  console.log('Next.js app is prepared');
  
  // Create HTTP server
  const server = createServer(async (req, res) => {
    try {
      // Parse URL
      const parsedUrl = parse(req.url, true);
      
      // Let Next.js handle the request
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });
  
  // Initialize Socket.io server with better options
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/api/socketio',
    connectTimeout: 45000,
    pingTimeout: 60000,         // Increase ping timeout to reduce disconnects
    pingInterval: 25000,        // Increase ping interval
    transports: ['websocket'],  // Prefer websocket only to reduce connection overhead
    allowEIO3: true,
    maxHttpBufferSize: 1e8,     // 100 MB
  });
  
  // Make global reference to io instance
  global.io = io;
  
  // Socket.io event handlers
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    const userId = socket.handshake.auth.userId || 'anonymous';
    console.log(`User connected: ${userId}`);
    
    // Join a room with user ID for private messages
    if (userId && userId !== 'anonymous') {
      socket.join(userId);
      console.log(`User ${userId} joined room ${userId}`);
    }
    
    // Emit a welcome event to confirm the connection is established
    socket.emit('connection:established', { 
      id: socket.id, 
      status: 'connected',
      timestamp: new Date().toISOString()
    });
    
    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id}, reason: ${reason}`);
    });
    
    socket.on('error', (error) => {
      console.error(`Socket error: ${socket.id}`, error);
    });
    
    // Keep alive ping to maintain connection
    socket.on('ping:client', (callback) => {
      if (typeof callback === 'function') {
        callback({ status: 'ok', time: Date.now() });
      }
    });
    
    // Define task event handlers
    socket.on('task:create', (task) => {
      console.log('Task created:', task);
      io.emit('task:created', task);
    });
    
    socket.on('task:update', (task) => {
      console.log('Task updated:', task);
      io.emit('task:updated', task);
    });
    
    socket.on('task:delete', (taskId) => {
      console.log('Task deleted:', taskId);
      io.emit('task:deleted', taskId);
    });
  });
  
  // Better error handling for the server
  server.on('error', (err) => {
    console.error('Server error:', err);
  });
  
  // Start server
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.IO server running with path: /api/socketio`);
    console.log(`> Environment: ${dev ? 'development' : 'production'}`);
  });
}); 