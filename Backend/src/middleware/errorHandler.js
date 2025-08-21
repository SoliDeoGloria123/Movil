const errorHandler = (err, req, res, next) => {
    console.error('Error Stack', err.stack);
    

    //Error de validación
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => message);
        return res.status(400).json({ success: false, message: `${field} ya existe en el sistema`});
    }

    //Error de cast objectId
    if (err.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'ID de objeto no válido' });
    }

    //Error JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Token inválido' });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expirado' });
    }
    res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'Error interno del servidor'
        
    });
};
//Middleware para rutas no encontradas
const notFound = (req, res, next) => {
    const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

//Middleware para validar ObjectId
const validateObjectId = (paramName = 'id') => {
    return (req, res, next) => {
        const mongoose = require('mongoose');
        const id = req.params[paramName];
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'ID de objeto no válido' });
        }
        next();
    };
};

//Middleware para capturar errores asincrónicos
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    errorHandler,
    notFound,
    validateObjectId,
    asyncHandler
};