const { Product, Subcategory, Category } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

//Obtener todos los productos
const getProducts = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    //Filtros par la busquedad
    const filter = {};

    //filtros por categoria y subcategoria
    if (req.query.category) filter.category = req.query.category;
    if (req.query.subcategory) filter.subcategory = req.query.subcategory;

    //filtros booleanos (estado destacado digital)
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    if (req.query.isFeatured !== undefined) filter.isFeatured = req.query.isFeatured === 'true';
    if (req.query.isDigital !== undefined) filter.isDigital = req.query.isDigital === 'true';

    //Filtros por rango de precios
    if(req.query.minPrice || req.query.maxPrice) {
        filter.price = {};
        if(req.query.minPrice) filter.price.$gte = parseInt(req.query.minPrice);
        if(req.query.maxPrice) filter.price.$lte =  parseInt(req.query.maxPrice);
    }

    //filtro de stock bajo
    if(req.query.lowStock === 'true') {
        filter.$expr = { 
            $and: [
                {$eq: ['$stock.trackStock', true] },
                {$lte: ['$stock.quantity', '$stock.minStock']}
            ] 
        };
    }
    //Nombre o descripcion
    if (req.query.search) {
        filter.$or = [
            { name: { $regex: req.query.search, $options: 'i' } },
            { description: { $regex: req.query.search, $options: 'i' } },
            { sku: { $regex: req.query.search, $options: 'i' } },
            { tags: { $regex: req.query.search, $options: 'i' } }
        ];
    }
     //Consultar a la base de datos 
    let query = Product.find(filter)
        .populate('category', 'name slug ')
        .populate('subcategory', 'name slug ')
        .populate('createdBy', 'username firstName lastName')
        .sort({ sortOrder: 1, name: 1 });

    if (req.query.page) {
        query = query.skip(skip).limit(limit);
    }
    //Ejecutar las consultas
    const products = await query;
    const total = await Product.countDocuments(filter);
    res.status(200).json({
        success: true,
        data: products,
        pagination: req.query.page ? {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        } : undefined
    });
});


const getActiveProducts = asyncHandler(async (req, res) => {
    const products = await Product.findActive();
    res.status(200).json({
        success: true,
        data: products
    });
});
//Obtener producto por categorias
const getProductsByCategories = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    //verificar si la subcategoria existe y es activa
    const products = await Product.findByCategory(categoryId);
        return res.status(200).json({
        success: true,
        data: products
    });
    });

    const getProductsBysubcategories = asyncHandler(async (req, res) => {
    const { subcategoryId } = req.params;
    //verificar si la subcategoria existe y es activa
    const products = await Product.findBySubcategory(subcategoryId);
        return res.status(200).json({
        success: true,
        data: products
    });
    });

    const getFeaturedProducts = asyncHandler(async (req, res) => {
    const products = await Product.findFeatured();
        return res.status(200).json({
        success: true,
        data: products
    });
});

//Obtener un producto por ID
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
        .populate('category', 'name slug description')
        .populate('subcategory', 'name slug description')
        .populate('createdBy', 'username firstName lastName')
        .populate('updatedBy', 'username firstName lastName');

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Producto no encontrado'
        });
    }
    res.status(200).json({
        success: true,
        data: product
    });
});
const getProductBySku = asyncHandler(async (req, res) => {
    const product = await Product.findOne({ sku: req.params.sku.toUpperCase() })
        .populate('category', 'name slug ')
        .populate('subcategory', 'name slug ');
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Producto no encontrado'
        });
    }
    res.status(200).json({
        success: true,
        data: product
    });
});

//Crear un producto
const createProduct = asyncHandler(async (req, res) => {
    const { name, 
        description, 
        shortDescription, 
        sku, 
        category, 
        subcategory, 
        price, 
        comparePrice, 
        cost, 
        dimensions, 
        stock, 
        images, 
        isActive, 
        isFeatured, 
        isDigital, 
        sortOrder, 
        seoTitle,
        seoDescription 
    } = req.body;
    const parentCategory = await Category.findById(
        category
    );
    if (parentCategory) {
        return res.status(400).json({
            success: false,
            message: 'Ya existe una categoría con ese nombre'
        });
    }
    const parentSubcategory = await Subcategory.findById(
        subcategory
    );
    if (!parentSubcategory || !parentSubcategory.isActive) {
        return res.status(400).json({
            success: false,
            message: 'La subcategoría no existe o no está activa'
        });
    }
    if (parentCategory.category.toString() !== category) {
        return res.status(400).json({
            success: false,
            message: 'Ya existe una subcategoría con ese nombre'
        });
    }
    //Crear Producto
    const product = await Product.create({
      name, 
        description, 
        shortDescription, 
        sku: sku.toUpperCase(),
        category, 
        subcategory, 
        price, 
        comparePrice, 
        cost, 
        dimensions, 
        tags: tags || {},
        stock: stock || {quantity: 0, minStock: 0, trackStock: true },
        images, 
        isActive: isActive !== undefined ? isActive : true,
        isFeatured: isFeatured || false,
        isDigital: isDigital || false,
        sortOrder: sortOrder || 0,
        seoTitle,
        seoDescription,
        createdBy: req.user._id
    });
    await product.populate([
        { path: 'category', select: 'name slug' },
        { path: 'subcategory', select: 'name slug' },
    ]);

    res.status(201).json({
        success: true,
        message: 'Producto creado correctamente',
        data: product
    });
});

//Actualizar producto
const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Producto no encontrado'
        });
    }

    const { 
         name, 
        description, 
        shortDescription, 
        sku, 
        category, 
        subcategory, 
        price, 
        comparePrice, 
        cost, 
        dimensions, 
        stock, 
        images, 
        isActive, 
        isFeatured, 
        isDigital, 
        sortOrder, 
        seoTitle,
        tags,
        seoDescription,
       } = req.body;

       if(sku && sku.toUpperCase() !== product.sku) {
        const existingSku = await Product.findOne({ sku: sku.toUpperCase() });
        if (existingSku) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un sku '
            });
        }
       }       // Validar categoría y subcategoría si se están actualizando
       if(category || subcategory) {
        const targetCategory = category || product.category;
        const targetSubcategory = subcategory || product.subcategory;

        // Validar que la categoría existe y está activa
        const parentCategory = await Category.findById(targetCategory);
        if (!parentCategory || !parentCategory.isActive) {
            return res.status(400).json({
                success: false,
                message: 'La categoría no existe o no está activa'
            });
        }

        // Validar que la subcategoría existe y está activa
        const parentSubcategory = await Subcategory.findById(targetSubcategory);
        if (!parentSubcategory || !parentSubcategory.isActive) {
            return res.status(400).json({
                success: false,
                message: 'La subcategoría no existe o no está activa'
            });
        }

        // Validar que la subcategoría pertenece a la categoría
        if (parentSubcategory.category.toString() !== targetCategory.toString()) {
            return res.status(400).json({
                success: false,
                message: 'La subcategoría no pertenece a la categoría seleccionada'
            });
        }
       }

//Actualizar productos
if (name ) product.name = name;
if (description !== undefined) product.description = description;
if (shortDescription !== undefined) product.shortDescription = shortDescription;
if (sku) product.sku = sku.toUpperCase();
if (category !== undefined) product.category = category;
if (subcategory !== undefined) product.subcategory = subcategory;
if (price !== undefined) product.price = price;
if (comparePrice !== undefined) product.comparePrice = comparePrice;
if (cost !== undefined) product.cost = cost;
if (dimensions !== undefined) product.dimensions = dimensions;
if (stock !== undefined) product.stock = stock;
if (tags !== undefined) product.tags = tags;
if (images !== undefined) product.images = images;
if (isActive !== undefined) product.isActive = isActive;
if (isFeatured !== undefined) product.isFeatured = isFeatured;
if (isDigital !== undefined) product.isDigital = isDigital;
if (sortOrder !== undefined) product.sortOrder = sortOrder;
if (isActive !== undefined) product.isActive = isActive;
if (seoTitle !== undefined) product.seoTitle = seoTitle;
if (seoDescription !== undefined) product.seoDescription = seoDescription;

product.updatedBy = req.user._id;
await product.save();
await product.populate([
    { path: 'category', select: 'name slug ' },
    { path: 'subcategory', select: 'name slug ' }
]);

res.status(200).json({
    success: true,
    message: 'Producto actualizado correctamente',
    data: product
});
});
//Eliminar producto
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Producto no encontrado'
        });
    }
    //verificar si se puede eliminar
    await Product.findOneAndDelete(req.params.id);
    res.status(200).json({
        success: true,
        message: 'Producto eliminado correctamente'
    });
});
//Activar o desactivar producto
const toggleProductActive = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Producto no encontrado'
        });
    }
    product.isActive = !product.isActive;
    product.updatedBy = req.user._id;
    await product.save();
    //Si el producto se desactiva  desactivar productos asociados
    res.status(200).json({
        success: true,
        message: `Producto ${product.isActive ? 'activado' : 'desactivado'} correctamente`,
        data: product
    });
});
//Actualizar stock del producto
const updateProductStock = asyncHandler(async (req, res) => {
    const { quantity, operation = 'set' } = req.body;
  
    if (quantity === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Se requiere la cantidad'
        });
    }
    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Producto no encontrado'
        });
    }
    if(!product.stock) {
        return res.status(400).json({
            success: false,
            message: 'Este producto no maneja un control de stock'
        });
    }
    //Operaciones set add subtract
    switch (operation) {
        case 'set':
            product.stock.quantity = quantity;
            break;
        case 'add':
            product.stock.quantity = quantity;
            break;
        case 'subtract':
            product.stock.quantity = Math.max(0, product.stock.quantity - quantity);
            break;
        default:
            return res.status(400).json({
                success: false,
                message: 'Operación no válida Use: set, add, subtract'
            });
    }

    product.updatedBy = req.user._id;
    await product.save();
    res.status(200).json({
        success: true,
        message: 'Stock del producto actualizado correctamente',
        data: {
            sku: product.sku,
            name: product.name,
            previousStock: product.stock.quantity,
            newStock: product.stock.quantity,
            isLowStock: product.isLowStock,
            isOutOfStock: product.isOutOfStock,
        }
    });
});

//Obtener estadisticas de producto
const getProductStats = asyncHandler(async (req, res) => {
    const stats = await Product.aggregate([
        {
            $group: {
                _id: null,
                totalProducts: { $sum: 1 },
                activeProducts: { $sum: { $cond:[{$eq: ['$isActive', true]}, 1, 0] } },
                FeaturedProducts: { $sum: { $cond:[{$eq: ['$isFeatured', true]}, 1, 0] } },
                DigitalProducts: { $sum: { $cond:[{$eq: ['$isDigital', true]}, 1, 0] } },
                totalValue: { $sum: '$price' },
                averagePrice: { $avg: '$price' }
            }
        }
    ]);
    //Productos con stock bajo
    const lowStockProducts = await Product.find({
        'stock.trackStock': true,
        $expr: { $lt: ['stock.quantity', 'stock.minStock'] }
    })
    .select('name  sku stock.quantity stock.minStock')
    .limit(10);

    const expensiveProducts = await Product.find({ isActive: true })
    .sort({ price: -1 })
    .limit(5)
    .select('name sku price');

    res.status(200).json({
        success: true,
        data: {
            stats: stats[0] || {
                totalProducts: 0,
                activeProducts: 0,
                FeaturedProducts: 0,
                DigitalProducts: 0,
                totalValue: 0,
                averagePrice: 0
            },
            lowStockProducts,
            expensiveProducts
        }
    });
});

module.exports = {
    getProducts,
    getActiveProducts,
    getProductsByCategories,
    getProductsBysubcategories,
    getFeaturedProducts,
    getProductById,
    getProductBySku,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductActive,
    updateProductStock,
    getProductStats
};