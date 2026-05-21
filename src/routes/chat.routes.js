const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { chatLimiter, messageLimiter } = require('../middleware/rateLimit.middleware');
const { validate, messageSchema } = require('../middleware/validation.middleware');

router.use(authMiddleware);

router.get('/rooms', chatLimiter, chatController.getRooms);
router.get('/rooms/:id/messages', chatLimiter, chatController.getMessages);
router.post('/rooms/:id/messages', messageLimiter, validate(messageSchema), chatController.sendMessage);
router.post('/rooms/:id/leave', chatLimiter, chatController.leaveRoom);

module.exports = router;
