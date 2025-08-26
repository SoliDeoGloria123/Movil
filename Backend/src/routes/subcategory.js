const express=require('express');
const router =express.Router();

const{
    getSubcategories,
    getSubcategoriesByCategory,
    getActiveSubcategories,
    getSubcategoryById,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    toggleSubcategoryActive,
    reorderSubcategories,
    getSubcategoryStats
} = require('../controllers/subcategoryControllers');

//Midllewares de autenticacion y autorizacion
const{
    authMiddleware,
    verifyAdminOrCoordinator,
    verifyAdmin
} = require('../middleware/auth');

//Middleware de validacion 
const {validateObjectId,} = require('../middleware/errorHandler');

//Subcategorias activas para frontend publico (sin autenticación)
router.get('/active', getActiveSubcategories);

//subcategorias por categoria (sin autenticación)
router.get('/category/:categoryId', validateObjectId('categoryId'), getSubcategoriesByCategory);

//aplicar verificacion de token a todas las rutas protegidas
router.use(authMiddleware);

//estadistas de subcategorias (requiere admin)
router.get('/stats', verifyAdmin, getSubcategoryStats);

//reordenar subcategorias (requiere admin o coordinador)
router.post('/reorder', verifyAdminOrCoordinator, reorderSubcategories);

//lista de todas las subcategorias (requiere autenticación)
router.get('/', getSubcategories);

//subcategoria por id (requiere autenticación)
router.get('/:id', validateObjectId('id'), getSubcategoryById);

//crear un nuevo subcategoria
router.post('/', verifyAdminOrCoordinator, createSubcategory);

//actualizar un subcategoria
router.put('/:id', validateObjectId('id'), verifyAdminOrCoordinator, updateSubcategory);

//eliminar un subcategoria
router.delete('/:id', validateObjectId('id'), verifyAdmin, deleteSubcategory);

//activar o desactivar un subcategoria
router.patch('/:id/toggle-status', validateObjectId('id'), verifyAdminOrCoordinator, toggleSubcategoryActive);


module.exports = router;