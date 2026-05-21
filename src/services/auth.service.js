const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET || 'flavome-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Armazenamento em memória (substituir por DB em produção)
const users = new Map();
const invalidatedTokens = new Set();

async function register({ username, email, password }) {
  // Verifica se email já existe
  for (const user of users.values()) {
    if (user.email === email) {
      throw new Error('Email já cadastrado');
    }
    if (user.username === username) {
      throw new Error('Username já em uso');
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const id = uuidv4();
  const user = { id, username, email, password: hashedPassword, createdAt: new Date().toISOString() };
  users.set(id, user);

  return { id, username, email, createdAt: user.createdAt };
}

async function login({ email, password }) {
  let found = null;
  for (const user of users.values()) {
    if (user.email === email) { found = user; break; }
  }
  if (!found) throw new Error('Credenciais inválidas');

  const valid = await bcrypt.compare(password, found.password);
  if (!valid) throw new Error('Credenciais inválidas');

  const token = jwt.sign({ id: found.id, username: found.username, email: found.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  return { token, user: { id: found.id, username: found.username, email: found.email } };
}

function logout(token) {
  invalidatedTokens.add(token);
}

function getProfile(userId) {
  const user = users.get(userId);
  if (!user) throw new Error('Usuário não encontrado');
  return { id: user.id, username: user.username, email: user.email, createdAt: user.createdAt };
}

function verifyToken(token) {
  if (invalidatedTokens.has(token)) throw new Error('Token invalidado');
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { register, login, logout, getProfile, verifyToken };
