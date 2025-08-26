const express=require('express');
const router =express.Router();

const{
    getProducts,
    getActiveProducts,
    getProductsByCategories,
    getProductsBysubcategories,
    getFeaturedProducts,
    getProductById,
    getProductBySku,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductActive,
    updateProductStock,
    getProductStats
} = require('../controllers/productControllers');

//Midllewares de autenticacion y autorizacion
const{
    authMiddleware,
    verifyAdminOrCoordinator,
    verifyAdmin
} = require('../middleware/auth');

//Middleware de validacion 
const {validateObjectId,} = require('../middleware/errorHandler');

// ========== RUTAS PÚBLICAS (sin autenticación) ==========
//Productos activos para frontend publico
router.get('/active', getActiveProducts);

//Productos por categoría (público)
router.get('/category/:categoryId', validateObjectId('categoryId'), getProductsByCategories);

//Productos por subcategoría (público)
router.get('/subcategory/:subcategoryId', validateObjectId('subcategoryId'), getProductsBysubcategories);

//Productos destacados (público)
router.get('/featured', getFeaturedProducts);

// ========== APLICAR AUTENTICACIÓN A RUTAS PROTEGIDAS ==========
router.use(authMiddleware);

// ========== RUTAS PROTEGIDAS (requieren autenticación) ==========
//Estadísticas de productos (solo admin)
router.get('/stats', verifyAdmin, getProductStats);

//Obtener productos por SKU
router.get('/sku/:sku', getProductBySku);

//Lista de todos los productos (panel admin)
router.get('/', getProducts);

//subcategoria por id
router.get('/:id', validateObjectId('id'),  getProductById);

//crear un nuevo producto
router.post('/', verifyAdminOrCoordinator, createProduct);

//actualizar un producto
router.put('/:id', validateObjectId('id'), verifyAdminOrCoordinator, updateProduct);

//eliminar un producto
router.delete('/:id', validateObjectId('id'), verifyAdmin, deleteProduct);


//activar o desactivar un producto
router.patch('/:id/toggle-status', validateObjectId('id'), verifyAdminOrCoordinator, toggleProductActive);

//Actualizar producto stock
router.patch('/:id/stock', validateObjectId('id'), verifyAdminOrCoordinator, updateProductStock);

module.exports = router;