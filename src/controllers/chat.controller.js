const matchingService = require('../services/matching.service');

function getRooms(req, res) {
  try {
    const rooms = matchingService.getUserRooms(req.user.id);
    res.json({ success: true, data: rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

function getMessages(req, res) {
  try {
    const msgs = matchingService.getMessages(req.params.id, req.user.id);
    res.json({ success: true, data: msgs });
  } catch (err) {
    res.status(403).json({ success: false, message: err.message });
  }
}

function sendMessage(req, res) {
  try {
    const message = matchingService.addMessage(req.params.id, req.user.id, req.user.username, req.body.content);
    res.status(201).json({ success: true, data: message });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

function leaveRoom(req, res) {
  try {
    matchingService.leaveRoom(req.params.id, req.user.id);
    res.json({ success: true, message: 'Saiu da sala com sucesso' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

module.exports = { getRooms, getMessages, sendMessage, leaveRoom };
