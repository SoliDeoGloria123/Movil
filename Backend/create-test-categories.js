const Category = require('./src/models/Category');
const mongoose = require('mongoose');
require('dotenv').config();

async function createTestCategories() {
  try {    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado a MongoDB');

    // Crear categorías de prueba
    const categories = [
      { name: 'Tecnología', description: 'Productos tecnológicos y electrónicos', isActive: true },
      { name: 'Hogar', description: 'Artículos para el hogar y decoración', isActive: true },
      { name: 'Deportes', description: 'Equipamiento deportivo y fitness', isActive: false },
      { name: 'Moda', description: 'Ropa y accesorios de moda', isActive: true },
      { name: 'Libros', description: 'Libros y material de lectura', isActive: true }
    ];

    for (const categoryData of categories) {
      const existingCategory = await Category.findOne({ name: categoryData.name });
      if (!existingCategory) {
        const category = new Category(categoryData);
        await category.save();
        console.log(`Categoría creada: ${category.name} - Estado: ${category.isActive ? 'Activa' : 'Inactiva'}`);
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
