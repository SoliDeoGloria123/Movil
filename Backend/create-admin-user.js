require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Importar modelo de usuario
const User = require('./src/models/User');

async function createAdminUser() {
    try {
        // Conectar a MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Conectado a MongoDB');

        // Verificar si ya existe el usuario admin
        const existingAdmin = await User.findOne({
            $or: [
                { email: 'admin@test.com' },
                { username: 'admin' }
            ]
        });

        if (existingAdmin) {
            console.log('✅ Usuario admin ya existe:', existingAdmin.username);
            console.log('📧 Email:', existingAdmin.email);
            console.log('🔑 Role:', existingAdmin.role);
            process.exit(0);
        }

        // Crear contraseña hasheada
        const hashedPassword = await bcrypt.hash('admin123', 12);

        // Crear usuario admin
        const adminUser = new User({
            username: 'admin',
            email: 'admin@test.com',
            password: hashedPassword,
            role: 'admin'
        });

        await adminUser.save();
        console.log('✅ Usuario admin creado exitosamente');
        console.log('👤 Username: admin');
        console.log('📧 Email: admin@test.com');
        console.log('🔑 Password: admin123');
        console.log('👑 Role: admin');

        // Crear usuario coordinador también
        const hashedCoordPassword = await bcrypt.hash('coord123', 12);
        const coordUser = new User({
            username: 'coordinador',
            email: 'coordinador@test.com',
            password: hashedCoordPassword,
            role: 'coordinador'
        });

        await coordUser.save();
        console.log('✅ Usuario coordinador creado exitosamente');
        console.log('👤 Username: coordinador');
        console.log('📧 Email: coordinador@test.com');
        console.log('🔑 Password: coord123');
        console.log('👑 Role: coordinador');

    } catch (error) {
        console.error('❌ Error creando usuarios:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Desconectado de MongoDB');
        process.exit(0);
    }
}

createAdminUser();
