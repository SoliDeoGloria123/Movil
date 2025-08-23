const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

// Login usuario
const login = async (req, res) => {
    try {
        console.log(' DEBUG: Datos recibidos en login', req.body);
        const { email, username, password } = req.body;
        const loginField = email || username;
        console.log(' DEBUG: Campo de login', loginField);
        console.log(' DEBUG: Contraseña recibida', password ? '[PRESENTE]' : '[AUSENTE]');

        // VALIDACION DE CAMPOS REQUERIDA
        if (!loginField || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username/email y contraseña son requeridos'
            });
        }

        // Busqueda de usuarios en la base de datos
        const user = await User.findOne({
            $or: [
                { username: loginField },
                { email: loginField }
            ]
        });

        if (!user) {
            console.log(' DEBUG: Usuario encontrado [NINGUNO]');
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        console.log(' DEBUG: Usuario encontrado', user.username);
        console.log(' DEBUG: Verificando contraseña');

        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, user.password);
        console.log(' DEBUG: Contraseña válida', isValidPassword);

        if (!isValidPassword) {
            console.log(' DEBUG: Contraseña incorrecta');
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Generar token
        const token = generateToken({
            userId: user._id.toString(),
            username: user.username,
            role: user.role 
        });

        console.log(' DEBUG: Token generado', token);

        // Respuesta exitosa
        res.json({
            success: true,
            message: 'Login exitoso',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error(' Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error al procesar la solicitud'
        });
    }
};

// Obtener informacion del usuario autenticado
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error(' Error en getMe:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener información del usuario'
        });
    }
};

// Cambio de contraseña
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Contraseña actual y nueva contraseña son requeridas'
            });
        }

        const user = await User.findById(req.user._id);
        
        // Verificar contraseña actual
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Contraseña actual incorrecta'
            });
        }

        // Encriptar nueva contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        
        // Actualizar contraseña
        await User.findByIdAndUpdate(req.user._id, { password: hashedPassword });

        res.json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });

    } catch (error) {
        console.error(' Error en changePassword:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cambiar contraseña'
        });
    }
};

// Invalidar token usuario (logout)
const logout = async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Logout exitoso'
        });
    } catch (error) {
        console.error(' Error en logout:', error);
        res.status(500).json({
            success: false,
            message: 'Error al hacer logout'
        });
    }
};

// Verificar token
const verifyToken = async (req, res) => {
    try {
        console.log(' DEBUG: Verificando token para usuario:', req.user);
        
        const user = await User.findById(req.user._id).select('-password');
        
        if (!user) {
            console.log(' DEBUG: Usuario no encontrado en DB:', req.user._id);
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        console.log(' DEBUG: Token verificado exitosamente para:', user.username);

        res.json({
            success: true,
            message: 'Token válido',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error(' Error en verifyToken:', error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar token'
        });
    }
};

module.exports = {
    login,
    getMe,
    changePassword,
    logout,
    verifyToken
};
