const { verifyToken } = require('./auth.service');
const matchingService = require('./matching.service');

// Mapa de userId → socketId
const connectedUsers = new Map();

function initialize(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 Novo socket conectado: ${socket.id}`);

    // Autenticação
    socket.on('authenticate', ({ token }) => {
      try {
        const user = verifyToken(token);
        socket.userId = user.id;
        socket.username = user.username;
        connectedUsers.set(user.id, socket.id);
        socket.emit('authenticated', { success: true, user: { id: user.id, username: user.username } });
        console.log(`✅ Usuário autenticado: ${user.username}`);
      } catch (err) {
        socket.emit('authenticated', { success: false, message: 'Token inválido' });
      }
    });

    // Entrar na fila via WebSocket
    socket.on('join_queue', ({ category }) => {
      if (!socket.userId) {
        return socket.emit('error', { message: 'Não autenticado' });
      }
      try {
        const result = matchingService.joinQueue(socket.userId, socket.username, category, io);
        if (result.matched) {
          // Notifica os dois usuários
          const partnerSocketId = connectedUsers.get(result.partner.userId);
          socket.emit('match_found', { roomId: result.roomId, partner: result.partner });
          if (partnerSocketId) {
            io.to(partnerSocketId).emit('match_found', {
              roomId: result.roomId,
              partner: { userId: socket.userId, username: socket.username },
            });
          }
        } else {
          socket.emit('queue_status', { queued: true, position: result.position, category });
        }
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Sair da fila
    socket.on('leave_queue', () => {
      if (!socket.userId) return;
      matchingService.leaveQueue(socket.userId);
      socket.emit('queue_status', { queued: false });
    });

    // Entrar na sala
    socket.on('join_room', ({ roomId }) => {
      if (!socket.userId) return socket.emit('error', { message: 'Não autenticado' });
      socket.join(roomId);
      socket.emit('joined_room', { roomId });
    });

    // Enviar mensagem via WebSocket
    socket.on('send_message', ({ roomId, content }) => {
      if (!socket.userId) return socket.emit('error', { message: 'Não autenticado' });
      try {
        const message = matchingService.addMessage(roomId, socket.userId, socket.username, content);
        io.to(roomId).emit('new_message', message);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Digitando
    socket.on('typing_start', ({ roomId }) => {
      socket.to(roomId).emit('partner_typing', { typing: true, username: socket.username });
    });

    socket.on('typing_stop', ({ roomId }) => {
      socket.to(roomId).emit('partner_typing', { typing: false, username: socket.username });
    });

    // Sair da sala
    socket.on('leave_room', ({ roomId }) => {
      if (!socket.userId) return;
      try {
        matchingService.leaveRoom(roomId, socket.userId);
        socket.to(roomId).emit('partner_left', { userId: socket.userId, username: socket.username });
        socket.leave(roomId);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Desconexão
    socket.on('disconnect', () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        matchingService.leaveQueue(socket.userId);
        console.log(`❌ Usuário desconectado: ${socket.username}`);
      }
    });
  });
}

module.exports = { initialize };
