const express = require('express');
const router = express.Router();

const{
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    getUserStats,
} = require('../controllers/UserController');

const{
    authMiddleware,
    verifyRole,
    verifyAdmin,
    verifyAdminOrCoordinator,
    verifyAdminOrOwner
} = require('../middleware/auth')


//Middleware de validacion
const { validateObjectId } = require('../middleware/errorHandler');
//aplicar verificacion de token a todas las rutas
router.use(authMiddleware);

//Estadisticas de usuarios
router.get('/stats', verifyAdmin, getUserStats);

//listar todos los usuarios
router.get('/', verifyAdmin, getUsers);

//usuario por id
router.get('/:id', validateObjectId('id'), verifyAdminOrOwner, getUserById);

//crear usuario
router.post('/', verifyAdmin, createUser);

//actualizar usuario
router.put('/:id', validateObjectId('id'), verifyAdminOrOwner, updateUser);

//eliminar usuario
router.delete('/:id', validateObjectId('id'), verifyAdmin, deleteUser);

//activar/desactivar usuario
router.patch('/:id/toggle-status', validateObjectId('id'), verifyAdmin, toggleUserStatus);


module.exports = router;
