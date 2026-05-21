const express = require('express');
const router = express.Router();
const matchingController = require('../controllers/matching.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { chatLimiter } = require('../middleware/rateLimit.middleware');
const { validate, queueSchema } = require('../middleware/validation.middleware');

router.use(authMiddleware);

router.post('/join', chatLimiter, validate(queueSchema), matchingController.joinQueue);
router.delete('/leave', chatLimiter, matchingController.leaveQueue);
router.get('/stats', matchingController.getStats);

module.exports = router;
