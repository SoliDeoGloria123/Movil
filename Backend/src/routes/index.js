//archivo principal del rutas
//centralizar las rutas
const express = require('express');
const router = express.Router();


//importar las rutas
const authRoutes = require('./auth');
const userRoutes = require('./user');
const categoryRoutes = require('./category');
const SubcategoryRoutes = require('./subcategory');
const productRoutes = require('./product');
const { version } = require('mongoose');

//Cada modulo tiene su propio espacio de nombres en la url
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/subcategories', SubcategoryRoutes);
router.use('/products', productRoutes);


//permitir verificar que el servidor este funcionando correctamente
router.get('/health', (req, res) => {
    res.status(200).json({ 
        success: true,
        message: 'Servidor en funcionamiento' ,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
//Proporcionar documentacion basica sobre la api
router.get('/',(req, res) => {
    res.status(200).json({
        success: true,
        message: 'Bienvenido a la API de gestion de productos',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            categories: '/api/categories',
            subcategories: '/api/subcategories',
            products: '/api/products'
        },
        documentation: {
            postman: 'Importe la coleccion Postman para probar  todos los endpoints',
            authentication: 'usa /api/auth/login para obtener el token JWT'
        }
    });
});
module.exports = router;