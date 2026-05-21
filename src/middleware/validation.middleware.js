const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const messageSchema = Joi.object({
  content: Joi.string().min(1).max(1000).required(),
});

const queueSchema = Joi.object({
  category: Joi.string().valid('movies', 'games', 'series', 'music', 'general').required(),
});

function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }
    next();
  };
}

module.exports = { validate, registerSchema, loginSchema, messageSchema, queueSchema };
