const Category = require('./src/models/Category');
const User = require('./src/models/User');
const mongoose = require('mongoose');
require('dotenv').config();

function createSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Remover guiones múltiples
    .trim();
}

async function createTestCategories() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado a MongoDB');

    // Buscar un usuario admin para asignar como creador
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('Creando usuario admin de prueba...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      adminUser = new User({
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      await adminUser.save();
      console.log('Usuario admin creado: admin@test.com / admin123');
    }

    // Crear categorías de prueba
    const categories = [
      { name: 'Tecnología', description: 'Productos tecnológicos y electrónicos', isActive: true },
      { name: 'Hogar', description: 'Artículos para el hogar y decoración', isActive: true },
      { name: 'Deportes', description: 'Equipamiento deportivo y fitness', isActive: false },
      { name: 'Moda', description: 'Ropa y accesorios de moda', isActive: true },
      { name: 'Libros', description: 'Libros y material de lectura', isActive: true }
    ];

    for (const categoryData of categories) {
      const slug = createSlug(categoryData.name);
      const existingCategory = await Category.findOne({ 
        $or: [{ name: categoryData.name }, { slug: slug }] 
      });
      
      if (!existingCategory) {
        const category = new Category({
          ...categoryData,
          slug: slug,
          createdBy: adminUser._id
        });
        await category.save();
        console.log(`Categoría creada: ${category.name} - Estado: ${category.isActive ? 'Activa' : 'Inactiva'} - Slug: ${category.slug}`);
      } else {
        console.log(`Categoría ya existe: ${categoryData.name}`);
      }
    }

    console.log('\n✅ Categorías de prueba creadas exitosamente');
    console.log('Puedes probar ahora las funcionalidades de:');
    console.log('- Listar categorías');
    console.log('- Crear nuevas categorías');
    console.log('- Editar categorías existentes');
    console.log('- Activar/desactivar categorías');
    console.log('- Eliminar categorías');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestCategories();
