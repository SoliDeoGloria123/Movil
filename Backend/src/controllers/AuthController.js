const bcrypt = require('bcrypt');
const { User } = require('../models');
const { generateToken } = require('../utils/jwt');
const { asyncHandler } = require('../middleware/errorHandler');

//Login usuario
const login = asyncHandler(async (req, res) => {
    console.log(' DEBUG: Datos recibidos en login', req.body);
    const { email, username, password } = req.body;
    const loginField = email || username;
    console.log(' DEBUG: Campo de login', loginField);
    console.log(' DEBUG: Contraseña recibida', password ? '[PRESENTE]' : '[AUSENTE]');
    //VALIDACION DE CAMPOS REQUERIDA
    if (!loginField || !password) {
        console.log(' Error - Faltan campos requeridos');
        return res.status(400).json({
            success: false,
            message: 'Username y contraseña son requeridos'
        });
    }
    //Busqueda de usuarios en la base de datos
    try{
        console.log(' DEBUG: Buscando usuario en la base de datos', loginField.toLowerCase());
    const user = await User.findOne({
        $or: [
            { username: loginField.toLowerCase() },
            { email: loginField.toLowerCase() }
        ]
    }).select('+password');//incluye el campo  de contraseña oculta
    console.log(' DEBUG: Usuario encontrado', user ? user.username : '[NINGUNO]');
    if (!user) {
        console.log(' Error - Usuario no encontrado');
        return res.status(404).json({
            success: false,
            message: 'Usuario no encontrado'
        });
    }
    //Validar usuario inactivo
    if (!user.isActive) {
        console.log(' Error - Usuario inactivo');
        return res.status(403).json({
            success: false,
            message: 'Usuario inactivo'
        });
    }
    //VERIFICACION DE CONTRASEÑA
   console.log(' DEBUG: Verificando contraseña');
   const isPasswordValid = await bcrypt.comparePassword(password);
   console.log(' DEBUG: Contraseña válida', isPasswordValid);
   if (!isPasswordValid) {
       console.log(' Error - Contraseña incorrecta');
       return res.status(401).json({
           success: false,
           message: 'Contraseña incorrecta'
       });
   }
   user.lastlogin = new Date();
   await user.save();
   //Generar token JWT
   const token = generateToken(user._id);
   console.log(' DEBUG: Token generado', token);
   return res.status(200).json({
       success: true,
       message: 'Login exitoso',
       data:{
        user: userResponse,
        token,
       expiresIn: process.env.JWT_EXPIRES_IN || '1h',
       }
   });
} catch (error) {
        console.log(' Error en login:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al procesar la solicitud',
        });
    }
});
//Obtener informacion del usuario autenticado
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    res.status(200).json({
        success: true,
        data: user
    });
});
//Cambio de contraseña
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: 'Contraseña actual y nueva son requeridas'
        });
    }
    if(newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'La nueva contraseña debe tener al menos 6 caracteres'
        });
    }
    //Olvidaste usuario con contraseña actual
    const user = await User.findById(req.user._id).select('+password');
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
        return res.status(401).json({
            success: false,
            message: 'Contraseña actual incorrecta'
        });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({
        success: true,
        message: 'Contraseña cambiada exitosamente'
    });
});
//Invalidar token usuario estraño
const logout = asyncHandler(async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Logout exitoso'
    });
});
//Verificar token
const verifyToken = asyncHandler(async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Token válido',
        data: req.user
    });
});

module.exports = {
    login,
    getMe,
    changePassword,
    logout,
    verifyToken
};
