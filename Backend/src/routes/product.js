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
    verifyToken,
    verifyAdminOrCoordinator,
    verifyAdmin
} = require('../middleware/auth');

//Middleware de validacion 
const {validateObjectId,} = require('../middleware/errorHandler');

//subcategorias activadas para el frontend publico
router.get('/category/:categoryId', validateObjectId('categoryId'), getProductsByCategories);

//subcategorias activadas para el frontend publico
router.get('/subcategory/:subcategoryId', validateObjectId('subcategoryId'), getProductsBysubcategories);

//Subcategorias activas para frontend publico
router.get('/', getActiveProducts);

router.get('/featured', getFeaturedProducts);

//aplicar verificacion de token a todos las rutas
router.use(verifyToken);

//estadistas de  los productos
router.get('/stats', verifyAdmin, getProductStats);
//ontener productos por sku
router.get('/sku/:sku', getProductBySku);

//lista de todos los productos
router.get('/',  getProducts);

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