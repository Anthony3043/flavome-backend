const matchingService = require('../services/matching.service');

function joinQueue(req, res) {
  try {
    const result = matchingService.joinQueue(req.user.id, req.user.username, req.body.category);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

function leaveQueue(req, res) {
  try {
    matchingService.leaveQueue(req.user.id);
    res.json({ success: true, message: 'Saiu da fila com sucesso' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

function getStats(req, res) {
  try {
    const stats = matchingService.getStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { joinQueue, leaveQueue, getStats };
