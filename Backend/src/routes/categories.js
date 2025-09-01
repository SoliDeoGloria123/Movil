const express = require('express');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Obtener todas las categorías
router.get('/', async (req, res) => {
  try {
    // Por ahora retornamos datos mock
    const categories = [
      { _id: '1', name: 'Electrónicos', description: 'Productos electrónicos' },
      { _id: '2', name: 'Ropa', description: 'Ropa y accesorios' },
      { _id: '3', name: 'Hogar', description: 'Artículos para el hogar' }
    ];

    res.json({
      success: true,
      message: 'Categorías obtenidas correctamente',
      data: categories
    });
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Crear categoría (requiere autenticación)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la categoría es requerido'
      });
    }

    // Simulamos la creación
    const newCategory = {
      _id: Date.now().toString(),
      name,
      description: description || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: newCategory
    });
  } catch (error) {
    console.error('Error creando categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
