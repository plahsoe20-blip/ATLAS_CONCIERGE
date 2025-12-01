import logger from '../config/logger.js';

let io;
const connectedUsers = new Map(); // userId -> socketId
const driverLocations = new Map(); // driverId -> { lat, lng, heading, speed, timestamp }

export const initializeSocketHandlers = (socketIO) => {
  io = socketIO;

  io.on('connection', (socket) => {
    logger.info(`WebSocket client connected: ${socket.id}`);

    // User authentication
    socket.on('authenticate', (data) => {
      const { userId, role } = data;
      connectedUsers.set(userId, { socketId: socket.id, role });
      socket.userId = userId;
      socket.role = role;
      logger.info(`User authenticated: ${userId} (${role})`);
    });

    // Driver location updates
    socket.on('location_update', (data) => {
      if (socket.role === 'DRIVER') {
        const { lat, lng, heading, speed, bookingId } = data;
        driverLocations.set(socket.userId, {
          lat,
          lng,
          heading,
          speed,
          timestamp: Date.now(),
          bookingId
        });

        // Broadcast to concierge tracking this booking
        io.emit('driver_location', {
          driverId: socket.userId,
          bookingId,
          lat,
          lng,
          heading,
          speed
        });
      }
    });

    // Booking status updates
    socket.on('booking_status', (data) => {
      io.emit('booking_updated', data);
      logger.info(`Booking status broadcast: ${data.bookingId} -> ${data.status}`);
    });

    // Chat messages
    socket.on('send_message', (data) => {
      const { recipientId, message } = data;
      const recipient = connectedUsers.get(recipientId);
      if (recipient) {
        io.to(recipient.socketId).emit('new_message', {
          senderId: socket.userId,
          message,
          timestamp: Date.now()
        });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        if (socket.role === 'DRIVER') {
          driverLocations.delete(socket.userId);
        }
        logger.info(`User disconnected: ${socket.userId}`);
      }
    });
  });

  logger.info('WebSocket handlers initialized');
};

// Broadcast to all operators
export const broadcastToOperators = (data) => {
  if (!io) return;
  
  connectedUsers.forEach((userData, userId) => {
    if (userData.role === 'OPERATOR') {
      io.to(userData.socketId).emit('operator_notification', data);
    }
  });
};

// Send to specific user
export const sendToUser = (userId, event, data) => {
  if (!io) return;
  
  const user = connectedUsers.get(userId);
  if (user) {
    io.to(user.socketId).emit(event, data);
  }
};

// Get driver location
export const getDriverLocation = (driverId) => {
  return driverLocations.get(driverId) || null;
};

export default { initializeSocketHandlers, broadcastToOperators, sendToUser, getDriverLocation };
