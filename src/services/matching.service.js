const { v4: uuidv4 } = require('uuid');

// Filas por categoria
const queues = {
  movies: [],
  games: [],
  series: [],
  music: [],
  general: [],
};

// Salas ativas
const activeRooms = new Map();
// Mensagens por sala
const messages = new Map();

function joinQueue(userId, username, category, io) {
  const validCategories = Object.keys(queues);
  if (!validCategories.includes(category)) {
    throw new Error('Categoria inválida');
  }

  // Remove o usuário de todas as filas antes de adicionar
  leaveAllQueues(userId);

  const queue = queues[category];

  // Tenta fazer match imediato
  if (queue.length > 0) {
    const partner = queue.shift();
    const roomId = uuidv4();

    const room = {
      id: roomId,
      category,
      participants: [
        { userId, username },
        { userId: partner.userId, username: partner.username },
      ],
      createdAt: new Date().toISOString(),
      active: true,
    };

    activeRooms.set(roomId, room);
    messages.set(roomId, []);

    return { matched: true, roomId, partner: { userId: partner.userId, username: partner.username } };
  }

  // Adiciona à fila
  queue.push({ userId, username, category, joinedAt: Date.now() });
  return { matched: false, position: queue.length };
}

function leaveAllQueues(userId) {
  for (const category of Object.keys(queues)) {
    queues[category] = queues[category].filter((u) => u.userId !== userId);
  }
}

function leaveQueue(userId) {
  leaveAllQueues(userId);
}

function getStats() {
  const queueSize = {};
  for (const [category, queue] of Object.entries(queues)) {
    queueSize[category] = queue.length;
  }
  return { queueSize, activeRooms: activeRooms.size };
}

function getRoom(roomId) {
  return activeRooms.get(roomId) || null;
}

function addMessage(roomId, userId, username, content) {
  const room = activeRooms.get(roomId);
  if (!room) throw new Error('Sala não encontrada');

  const isParticipant = room.participants.some((p) => p.userId === userId);
  if (!isParticipant) throw new Error('Usuário não é participante desta sala');

  const message = {
    id: uuidv4(),
    roomId,
    userId,
    username,
    content,
    createdAt: new Date().toISOString(),
  };

  const roomMessages = messages.get(roomId) || [];
  roomMessages.push(message);
  messages.set(roomId, roomMessages);

  return message;
}

function getMessages(roomId, userId) {
  const room = activeRooms.get(roomId);
  if (!room) throw new Error('Sala não encontrada');
  const isParticipant = room.participants.some((p) => p.userId === userId);
  if (!isParticipant) throw new Error('Acesso negado');
  return messages.get(roomId) || [];
}

function getUserRooms(userId) {
  const rooms = [];
  for (const room of activeRooms.values()) {
    if (room.participants.some((p) => p.userId === userId)) {
      rooms.push(room);
    }
  }
  return rooms;
}

function leaveRoom(roomId, userId) {
  const room = activeRooms.get(roomId);
  if (!room) throw new Error('Sala não encontrada');
  room.active = false;
  return room;
}

module.exports = { joinQueue, leaveQueue, getStats, getRoom, addMessage, getMessages, getUserRooms, leaveRoom };
