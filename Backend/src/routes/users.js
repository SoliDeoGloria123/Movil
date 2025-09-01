const express = require('express');
const User = require('../models/User');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// Obtener todos los usuarios (solo admin)
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      message: 'Usuarios obtenidos correctamente',
      data: users
    });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Obtener usuario por ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Solo admin o el mismo usuario pueden ver el perfil
    if (req.user.role !== 'admin' && req.user.userId !== id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver este usuario'
      });
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Usuario obtenido correctamente',
      data: user
    });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
