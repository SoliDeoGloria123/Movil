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
    verifyToken,
    verifyAdminOrCoordinator,
    verifyAdmin
} = require('../middleware/auth');

//Middleware de validacion 
const {validateObjectId,} = require('../middleware/errorHandler');

//subcategorias activadas para el frontend publico
router.get('/category/:categoryId', validateObjectId('categoryId'), getSubcategoriesByCategory);

//Subcategorias activas para frontend publico
router.get('/', getActiveSubcategories);

//aplicar verificacion de token a todos las rutas
router.use(verifyToken);

//estadistas de  los subcategorias
router.get('/stats', verifyAdmin, getSubcategoryStats);

//reordenar subcategorias
router.post('/reorder', verifyAdminOrCoordinator, reorderSubcategories);

//lista de todos los subcategorias
router.get('/',  getSubcategories);

//subcategoria por id
router.get('/:id', validateObjectId('id'),  getSubcategoryById);

//crear un nuevo subcategoria
router.post('/', verifyAdminOrCoordinator, createSubcategory);

//actualizar un subcategoria
router.put('/:id', validateObjectId('id'), verifyAdminOrCoordinator, updateSubcategory);

//eliminar un subcategoria
router.delete('/:id', validateObjectId('id'), verifyAdmin, deleteSubcategory);

//activar o desactivar un subcategoria
router.patch('/:id/toggle-status', validateObjectId('id'), verifyAdminOrCoordinator, toggleSubcategoryActive);


module.exports = router;