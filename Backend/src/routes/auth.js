const express = require('express');
const router = express.Router();

//Importar controladores de autenticacion
const{
    login,
    getMe,
    changePassword,
    logout,
    verifyToken
} = require('../controllers/AuthController');

//importar middleware de autenticacion
const{ verifyToken: authMiddleware } = require('../middleware/auth');

//Ruta login
router.post('/login', login);

//Ruta obtener usuario
router.get('/me', authMiddleware, getMe);

//Ruta cambiar contraseña
router.put('/change-password', authMiddleware, changePassword);

//Ruta cerrar sesión
router.post('/logout', authMiddleware, logout);

//Ruta verificar token
router.get('/verify-token', authMiddleware, verifyToken);

module.exports = router;
