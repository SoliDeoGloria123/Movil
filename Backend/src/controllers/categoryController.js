const { Category, Subcategory, Product } = require('../models'); // ✅ Cambiar SubCategory a Subcategory
const { asyncHandler } = require('../middleware/errorHandler');

//Obteer todas las categorias
const getCategories = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
//Fltros de la busqueda
 const filter = {};
 if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

 //Nombre o descripcion
 if (req.query.search) {
     filter.$or = [
         { name: { $regex: req.query.search, $options: 'i' } },
         { description: { $regex: req.query.search, $options: 'i' } }
     ];
 }
//consulta la base de datos
let query = Category.find(filter)
.populate('createdBy', 'username', 'firstName', 'lastName')
.populate('subCategoriesCount')
.populate('productsCount')
.sort({ sortOrder: 1, name: 1 });


if (req.query.page) {
    query = query.skip(skip).limit(limit);
}
//Ejecutar la consulta
const categories = await query;
const total = await Category.countDocuments(filter);
res.status(200).json({
    success: true,
    data: categories,
    pagination: req.query.page ? {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
    } : undefined
});
});
const getActiveCategories = asyncHandler(async (req, res) => {
    const categories = await Category.findActive();
    res.status(200).json({
        success: true,
        data: categories
    });
});

//Obtener una categoria por su ID
const getCategoryById = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id)
    .populate('createdBy', 'username firstName lastName')
    .populate('updatedBy', 'username firstName lastName');
    if (!category) {
        return res.status(404).json({
            success: false,
            message: 'Categoría no encontrada'
        });
    }
    //Obtener subcategorias  de esta categoria
    const subCategories = await Subcategory.find({ category: category._id, isActive: true }) // ✅ Cambiar SubCategory a Subcategory
    .sort({ sortOrder: 1, name: 1 });
    res.status(200).json({
        success: true,
        data: {
            category: category.toObject(),
            subCategories
        }
    });
});

//Crear una categoria
const createCategory = asyncHandler(async (req, res) => {
    const { 
        name,
        description,
        icon,
        sortOrder,
        isActive,
    } = req.body;
    if (!name ) {
        return res.status(400).json({
            success: false,
            message: 'Nombre y descripción son requeridos'
        });
    }
    const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    if (existingCategory) {
        return res.status(400).json({
            success: false,
            message: 'Ya existe una categoría con este nombre'
        });
    }
    //Crear la categoria
    const category = await Category.create({
        name,
        description,
        icon,
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
        createdBy: req.user._id
    });
    res.status(201).json({
        success: true,
        data: category
    });
});
//Actualizar una categoria
const updateCategory = asyncHandler(async (req, res) => {
 const category = await Category.findById(req.params.id);

 if (!category) {
     return res.status(404).json({
         success: false,
         message: 'Categoría no encontrada'
     });
 }

 const { 
     name,
     description,
     icon,
     color,
     sortOrder,
     isActive
 } = req.body;

 //Verificar duplicados en cada linea
 if (!name && name !== category.name) {
     const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') }
     });
     if (existingCategory) {
         return res.status(400).json({
             success: false,
             message: 'Ya existe una categoría con este nombre'
         });
     }
 }
 //Actualizar campos
if (name ) category.name = name;
if (description !== undefined) category.description = description;
if (icon !== undefined) category.icon = icon;
if (color !== undefined) category.color = color;
if (sortOrder !== undefined) category.sortOrder = sortOrder;
if (isActive !== undefined) category.isActive = isActive;

category.updatedBy = req.user._id;
await category.save();

res.status(200).json({
    success: true,
    message: 'Categoría actualizada correctamente',
    data: category
});
});

//Eliminar categoria
const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        return res.status(404).json({
            success: false,
            message: 'Categoría no encontrada'
        });
    }
    //verificar si se puede eliminar
    const canDelete = await category.canBeDeleted(); // ✅ Cambiar de canDelete() a canBeDeleted()
    if (!canDelete) {
        return res.status(400).json({
            success: false,
            message: 'No se puede eliminar la categoría porque tiene subcategorías o productos asociados'
        });
    }
    await Category.findByIdAndDelete(req.params.id); // ✅ Cambiar también esta línea
    res.status(200).json({
        success: true,
        message: 'Categoría eliminada correctamente'
    });
});

//Activar o desactivar categoría
const toggleCategoryActive = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id); // ✅ Cambiar de _id a id
    if (!category) {
        return res.status(404).json({
            success: false,
            message: 'Categoría no encontrada'
        });
    }
    category.isActive = !category.isActive;
    category.updatedBy = req.user._id;
    await category.save();
    //Si la categoria se desactiva  desactivar subcategorias y productos asociados
    if (!category.isActive) {
        await Subcategory.updateMany({ category: category._id }, { isActive: false, updatedBy: req.user._id }); // ✅ Cambiar SubCategory a Subcategory
        await Product.updateMany({ category: category._id }, { isActive: false, updatedBy: req.user._id });
    }
    res.status(200).json({
        success: true,
        message: `Categoría ${category.isActive ? 'activada' : 'desactivada'} correctamente`,
        data: category
    });
});
//Ordenar categorías
const reorderCategories = asyncHandler(async (req, res) => {
    const { categoryIds } = req.body;

    if (!Array || !Array.isArray(categoryIds)) {
        return res.status(400).json({
            success: false,
            message: 'Ya requiere un array de IDs de categorias'
        });
    }

    //Actualizar el orden de las categorías
  const updatePromises = categoryIds.map(( categoryId, index) =>
      Category.findByIdAndUpdate(
        categoryId,
        { sortOrder: index + 1 ,
            updatedBy: req.user._id
        },
        { new: true }
      )
  );

  await Promise.all(updatePromises);

  res.status(200).json({
      success: true,
      message: 'Categorías reordenadas correctamente'
  });
});
//Obtener estadisticas de categoria
const getCategoryStats = asyncHandler(async (req, res) => {
    const stats = await Category.aggregate([
        {
            $group: {
                _id: null,
                totalCategories: { $sum: 1 },
                activeCategories: { $sum: { $cond:[{'$eq': ['$isActive', true]}, 1, 0] } }
            }
        }
    ]);
    const categoriesWithSubcounts = await Category.aggregate([
        {
            $lookup: {
                from: 'subcategories',
                localField: '_id',
                foreignField: 'category',
                as: 'subCategories'
            }
        },
        {
            $project: {
                name: 1,
                subCategoriesCount: { $size: '$subCategories' },
            }
        },
        { $sort: { subCategoriesCount: -1 } },
        { $limit: 5 }
    ]);
    res.status(200).json({
        success: true,
        data: {
            stats: stats[0] || {
                totalCategories: 0,
                activeCategories: 0
            },
            topCategories: categoriesWithSubcounts
        }
    });
});
module.exports = {
    getCategories,
    getActiveCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryActive,
    reorderCategories,
    getCategoryStats
};

