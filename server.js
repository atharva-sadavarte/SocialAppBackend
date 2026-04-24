require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5001;

// Create HTTP server integrating Express app
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // To be restricted to the frontend URL later
  }
});

// App-level socket instance if needed within routes
// app.set('io', io);

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Custom socket events can be handled here

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
