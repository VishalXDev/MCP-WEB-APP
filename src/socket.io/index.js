// Exporting getSocketIO from this file
import socketIo from 'socket.io';
let io;
export const initSocketIO = (server) => {
  io = socketIo(server);
};

export const getSocketIO = () => {
  if (!io) throw new Error("Socket.io is not initialized");
  return io;
};
