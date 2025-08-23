const express = require('express');
const router = express.Router();

const{
    getCategories,
    getActiveCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryActive,
    reorderCategories,
    getCategoryStats,
} = require('../controllers/categoryController');

const{
    authMiddleware,
    verifyAdmin,
    verifyAdminOrCoordinator
} = require('../middleware/auth')


//Middleware de validacion
const { validateObjectId } = require('../middleware/errorHandler');
//categorias activas para fron puublico
router.get('/active', getActiveCategories);

//aplicar verificacion de token a todas las rutas
router.use(authMiddleware);

//Estadisticas de categorias
router.get('/stats', verifyAdmin, getCategoryStats);

//Reordenar categorias
router.put('/reorder', verifyAdminOrCoordinator, reorderCategories);

//listar todas las categorias
router.get('/', getCategories);

//categoria por id
router.get('/:id', validateObjectId('id'), getCategoryById);

//crear categoria
router.post('/', verifyAdminOrCoordinator, createCategory);

//actualizar categoria
router.put('/:id', validateObjectId('id'), verifyAdminOrCoordinator, updateCategory);

//eliminar categoria
router.delete('/:id', validateObjectId('id'), verifyAdmin, deleteCategory);

//activar/desactivar categoria
router.patch('/:id/toggle-status', validateObjectId('id'), verifyAdminOrCoordinator, toggleCategoryActive);


module.exports = router;
