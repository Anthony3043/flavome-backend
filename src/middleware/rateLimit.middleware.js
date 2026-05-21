const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5,
  message: { success: false, message: 'Muitas tentativas. Tente novamente em 1 minuto.' },
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, message: 'Limite de requisições atingido.' },
});

const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: 'Limite de mensagens atingido.' },
});

module.exports = { authLimiter, chatLimiter, messageLimiter };
