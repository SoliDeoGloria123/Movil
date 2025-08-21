const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre de la subcategoría es requerido'],
        trim: true, 
        minlength: [2, 'El nombre de la subcategoría debe tener al menos 2 caracteres'],
        maxlength: [100, 'El nombre de la subcategoría no puede tener más de 100 caracteres']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'La descripción no puede tener más de 1000 caracteres']
    },
    shortDescription: {
        type: String,
        trim: true,
        maxlength: [250, 'La descripción corta no puede tener más de 250 caracteres']
    },
    slug: {
        type: String,
        lowercase: true,
        trim: true
    },
    sku: {
        type: String,
        required: [true, 'El SKU del producto es requerido'],
        trim: true,
        unique: true,
        uppercase: true,
        minlength: [3, 'El SKU del producto debe tener al menos 3 caracteres'],
        maxlength: [50, 'El SKU del producto no puede tener más de 50 caracteres']
    },
     category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'La categoría  es requerida'],
            validate: {
                validator: async function(categoryId) {
                    const Category = mongoose.model('Category');
                    const category = await Category.findById(categoryId);
                    return category && category.isActive;
                },
                message: 'La categoría debe existir y estar activa'
    
            }
        },
 subcategorycategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory',
        required: [true, 'La subcategoría  es requerida'],
        validate: {
            validator: async function(subcategoryId) {
                const Subcategory = mongoose.model('Subcategory');
                const subcategory = await Subcategory.findById(subcategoryId);
                return subcategory && subcategory.isActive;
            },
            message: 'La subcategoría debe existir y estar activa'

        }
    },
    price: {
        type: Number,
        required: [true, 'El precio del producto es requerido'],
        min: [0, 'El precio no puede ser negativo'],
        validate:{
            validator: function (value) {
                return Number.isFinite(value) && value >= 0;
            },
            message: 'El precio debe ser un número valido o mayor a 0'
        }
    },
    comparePrice:{
        type: Number,
        min: [0, 'El precio de comparación no puede ser negativo'],
        validate: {
            validator: function (value) {
                if (value === null || value === undefined) 
                    return true;
                return Number.isFinite(value) && value >= 0;

            },
            message: 'El precio de comparación debe ser un número valido o mayor a 0'
        }
    },
    cost: {
        type: Number,
        min: [0, 'El costo no puede ser negativo'],
        validate: {
            validator: function (value) {
                if (value === null || value === undefined) 
                    return true;
                return Number.isFinite(value) && value >= 0;

            },
            message: 'El costo debe ser un número valido o mayor a 0'
        }
    },
    stock:{
       quantity: {
           type: Number,
           default: 0,
           min: [0, 'La cantidad de stock no puede ser negativa'],
       },
       minStock:{
        type: Number,
        default: 0,
        min: [0, 'La cantidad mínima de stock no puede ser negativa'],
       },
       trackStock: {
           type: Boolean,
           default: true
       }
    },
    dimensions: {
        weight: {
            type: Number,
            min: [0, 'El peso debe ser un número positivo']
        },
        length: {
            type: Number,
            min: [0, 'La longitud debe ser un número positivo']
        },
        width: {
            type: Number,
            min: [0, 'El ancho debe ser un número positivo']
        },
        height: {
            type: Number,
            min: [0, 'La altura debe ser un número positivo']
        },
    },
       images: [{
            url: {
                type: String,
                required: true,
                trim: true
            },
            alt: {
                type: String,
                required: true,
                trim: true,
                maxlength: [200, 'El texto alternativo no puede tener más de 200 caracteres']
            },
            isPrimary: {
                type: Boolean,
                default: false
            }
        }],
        tags: [{
            type: String,
            trim: true,
            lowercase: true,
            maxlength: [50, 'Los tags no pueden tener más de 50 caracteres']
        }],
        isActive: {
            type: Boolean,
            default: true,
        },
        isFeatured: {
            type: Boolean,
            default: false
        },
        isDigital:{
            type:Boolean,
            default:false
        },
        sortOrder: {
            type: Number,
            trim: true,
            maxlength: [70, 'el orden no puede tener mas de 70 caracteres']
        },
        seoDescription: {
            type: String,
            trim: true,
            maxlength: [160, 'La descripción SEO no puede tener más de 160 caracteres']
        },
         createdBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    require: true
                },
                updatedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                }

}, {
    timestamps: true
});

ProductSchema.pre('save', function(next) {
    if (!this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    next();
});

ProductSchema.pre('findOneAndUpdate', function(next) {
    const update = this.getUpdate();
    if (update.name) {
        update.slug = update.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    next();
});
ProductSchema.pre('save', async function(next) {
    if (!this.isModified('category') || this.isModified('subcategory')) {
        const Subcategory = mongoose.model('Subcategory');
        const subcategory = await Subcategory.findById(this.subcategory);
        if (!subcategory) {
            return next(new Error('La subcategoría no es válida'));
        }
        if (subcategory.category.toString() !== this.category.toString()) {
            return next(new Error('La subcategoría no pertenece a la categoría seleccionada'));
        }
    }
    next();
});
ProductSchema.virtual('profitMargin').get(function(){
    if (this.price && this.cost) {
        return ((this.price - this.cost) / this.price) * 100;
    };
    return 0;
});
ProductSchema.virtual('isOutOfStock').get(function() {
    if (this.stock.trackStock) return false;
    return this.stock.quantity <= 0;
});
ProductSchema.virtual('primaryImage').get(function() {
  return this.images.find(image => image.isPrimary) || this.images[0];
});
ProductSchema.statics.findActive = function() {
    return this.find({ isActive: true })
    .populate('category', 'name slug')
    .populate('subcategory', 'name slug')
    .sort({ sortOrder: 1, name: 1 });
};

ProductSchema.statics.findByCategory = function(categoryId) {
    return this.find({ 
        category: categoryId,
        isActive: true
    })
    .populate('category', 'name slug')
    .populate('subcategory', 'name slug')
    .sort({ sortOrder: 1, name: 1 });
};
ProductSchema.statics.findBySubcategory = function(subcategoryId) {
    return this.find({ 
        subcategory: subcategoryId,
        isActive: true
    })
    .populate('category', 'name slug')
    .populate('subcategory', 'name slug')
    .sort({ sortOrder: 1, name: 1 });
};
ProductSchema.statics.findFeatured = function() {
    return this.find({ 
        isFeatured: true,
        isActive: true
    })
    .populate('category', 'name slug')
    .populate('subcategory', 'name slug')
    .sort({ sortOrder: 1, name: 1 });
};

ProductSchema.methods.getFullName = async function() {
    await this.populate([
        { path: 'category', select: 'name' },
        { path: 'subcategory', select: 'name' }
    ]);

    return `${this.category.name} > ${this.subcategory.name} > ${this.name}`;
};

ProductSchema.methods.updateStock = function(quantity) {
if (this.stock.trackStock) {
        this.stock.quantity += quantity;
        if (this.stock.quantity < 0) {
            this.stock.quantity = 0;
        }
    }
    return this.save();
};

ProductSchema.index({category: 1});
ProductSchema.index({subcategory: 1});
ProductSchema.index({isActive: 1});
ProductSchema.index({isFeatured: 1});
ProductSchema.index({price: 1});
ProductSchema.index({'stock.quantity': 1});
ProductSchema.index({sortOrder: 1});
ProductSchema.index({createdBy: 1});
ProductSchema.index({tags: 1});

ProductSchema.index({
    name: 'text',
    description: 'text',
    shortDescription: 'text',
    tags: 'text',
});
module.exports = mongoose.model('Product', ProductSchema);