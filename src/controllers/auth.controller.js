const authService = require('../services/auth.service');

async function register(req, res) {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

async function login(req, res) {
  try {
    const result = await authService.login(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(401).json({ success: false, message: err.message });
  }
}

function logout(req, res) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (token) authService.logout(token);
  res.json({ success: true, message: 'Logout realizado com sucesso' });
}

function profile(req, res) {
  try {
    const user = authService.getProfile(req.user.id);
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
}

module.exports = { register, login, logout, profile };
