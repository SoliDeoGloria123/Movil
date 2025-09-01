const express = require('express');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    // Por ahora retornamos datos mock
    const products = [
      { 
        _id: '1', 
        name: 'iPhone 13', 
        description: 'Smartphone Apple iPhone 13 128GB',
        price: 899.99,
        categoryId: '1',
        subcategoryId: '1',
        stock: 10
      },
      { 
        _id: '2', 
        name: 'MacBook Pro', 
        description: 'Laptop Apple MacBook Pro 13"',
        price: 1299.99,
        categoryId: '1',
        subcategoryId: '2',
        stock: 5
      },
      { 
        _id: '3', 
        name: 'Camisa Polo', 
        description: 'Camisa polo de algodón',
        price: 39.99,
        categoryId: '2',
        subcategoryId: '3',
        stock: 25
      }
    ];

    res.json({
      success: true,
      message: 'Productos obtenidos correctamente',
      data: products
    });
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Crear producto (requiere autenticación)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, description, price, categoryId, subcategoryId, stock } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y precio son requeridos'
      });
    }

    // Simulamos la creación
    const newProduct = {
      _id: Date.now().toString(),
      name,
      description: description || '',
      price: parseFloat(price),
      categoryId,
      subcategoryId,
      stock: parseInt(stock) || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: newProduct
    });
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
