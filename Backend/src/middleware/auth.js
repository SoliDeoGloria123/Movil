const jwt = require('jsonwebtoken');
const { User } = require('../models');

const verifyToken = async(req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ 
                success: false, 
                message: 'Token no proporcionado' 
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Token inválido' 
            });
        }

        // Buscar el usuario en la base de datos
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Usuario no encontrado' 
            });
        }
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Usuario inactivo'
            });
        }
        req.user = user;
        next();
    } catch (error) {
       console.error('Error al verificar el token:', error);
       if(error.name === 'JsonWebTokenError') {
           return res.status(401).json({ success: false, message: 'Token inválido' });
       }
       if(error.name === 'TokenExpiredError') {
           return res.status(401).json({ success: false, message: 'Token expirado' });
       }
         return res.status(500).json({ 
              success: false, 
              message: 'Error interno del servidor' 
         });
    }
};

const verifyRole =(...allowedRoles) => {
    return (req, res, next) => {
        try{
            if(!req.user) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'No se ha autenticado al usuario' 
                });
            }
            if(!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'No tiene permisos para acceder a este recurso' 
                        });
            }
            next();
        } catch (error) {
            console.error('Error al verificar el rol del usuario:', error);
            return res.status(500).json({ success: false, message: 'Error interno del servidor' });
        }
    }
};
const verifyAdmin = verifyRole('admin');
const verifyAdminOrCoordinator = verifyRole('admin', 'coordinador');

const verifyAdminOrOwner = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No se ha autenticado al usuario'
            });
        }
        if (req.user.role !== 'admin') {
            return next();
        }
        const targetUserId = req.params.id || req.body.userId;
        if (req.user.id.toString() !== targetUserId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'No tiene permisos para acceder a este recurso'
            });
        }
        next();
    } catch (error) {
        console.error('Error al verificar el rol de administrador:', error);
        return res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};
const authMiddleware = (req, res, next) => {
    try {
        // Obtener token del header Authorization
        const authHeader = req.header('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado o formato incorrecto'
            });
        }

        // Extraer el token
        const token = authHeader.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        console.log(' DEBUG: Verificando token...');

        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        console.log(' DEBUG: Token decodificado:', decoded);
        
        // Mapear los datos del token al req.user
        req.user = {
            _id: decoded.userId,
            userId: decoded.userId,
            username: decoded.username,
            role: decoded.role
        };
        
        console.log(' DEBUG: Token válido para usuario:', req.user.username);
        next();
        
    } catch (error) {
        console.error(' Error en auth middleware:', error.message);
        res.status(401).json({
            success: false,
            message: 'Token inválido'
        });
    }
};

module.exports = {
    verifyToken,
    verifyRole,
    verifyAdmin,
    verifyAdminOrCoordinator,
    verifyAdminOrOwner,
    authMiddleware
};
