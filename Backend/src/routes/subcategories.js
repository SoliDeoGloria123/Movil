const express = require('express');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Obtener todas las subcategorías
router.get('/', async (req, res) => {
  try {
    // Por ahora retornamos datos mock
    const subcategories = [
      { _id: '1', name: 'Celulares', categoryId: '1', description: 'Teléfonos móviles' },
      { _id: '2', name: 'Laptops', categoryId: '1', description: 'Computadoras portátiles' },
      { _id: '3', name: 'Camisas', categoryId: '2', description: 'Camisas para hombre y mujer' }
    ];

    res.json({
      success: true,
      message: 'Subcategorías obtenidas correctamente',
      data: subcategories
    });
  } catch (error) {
    console.error('Error obteniendo subcategorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
