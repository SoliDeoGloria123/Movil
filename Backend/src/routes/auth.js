const express = require('express');
const router = express.Router();

// Importar controladores de autenticacion
const AuthController = require('../controllers/AuthController');

// Importar middleware de autenticacion
const { authMiddleware } = require('../middleware/auth');

// Rutas públicas
router.post('/login', AuthController.login);

// Rutas protegidas
router.get('/me', authMiddleware, AuthController.getMe);
router.get('/verify', authMiddleware, AuthController.verifyToken);
router.put('/change-password', authMiddleware, AuthController.changePassword);
router.post('/logout', authMiddleware, AuthController.logout);

module.exports = router;
