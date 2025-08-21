const mongoose = require('mongoose');
const Category = require('./Category');

const subcategorySchema = new mongoose.Schema({
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
        maxlength: [500, 'La descripción no puede tener más de 500 caracteres']
    },
    slug: {
        type: String,
        lowercase: true,
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'La categoría es requerida'],
        validate: {
            validator: async function(categoryId) {
                const Category = mongoose.model('Category');
                const category = await Category.findById(categoryId);
                return category && category.isActive;
            },
            message: 'La categoría debe existir y estar activa'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    icon: {
        type: String,
        trim: true
    },
    color: {
        type: String,
        trim: true,
        match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/, 'el color debe ser un color hexadecimal valido']
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

subcategorySchema.pre('save', function(next) {
    if (!this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    next();
});

subcategorySchema.pre('findOneAndUpdate', function(next) {
    const update = this.getUpdate();
    if (update.name) {
        update.slug = update.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    next();
});

subcategorySchema.pre('save', async function(next) {
    if (this.isModified('category')) {
        const Category = mongoose.model('Category');
        const category = await Category.findById(this.category);
        if (!category) {
            return next(new Error('La categoría especificada no existe'));
        }
        if (!category.isActive) {
            return next(new Error('La categoría debe estar activa'));
        }
    }
    next();
});

subcategorySchema.virtual('productCount', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'subcategory',
    count: true
});

subcategorySchema.statics.findByCategory = function(categoryId) {
    return this.find({ 
        category: categoryId,
        isActive: true
    })
    .populate('category', 'name slug')
    .sort({ sortOrder: 1, name: 1 });
};

subcategorySchema.statics.findActive = function(){
    return this.find({ isActive: true })
    .populate('category', 'name slug')
    .sort({sortOrder: 1, name: 1});
};

subcategorySchema.methods.canBeDeleted = async function() {
    const Product = mongoose.model('Product');
    const productCount = await Product.countDocuments({ subcategory: this._id });
    return productCount === 0;
};

subcategorySchema.methods.getFullPath = async function() {
    await this.populate('category', 'name');
    return `${this.category.name} > ${this.name}`;
};

subcategorySchema.index({category: 1});
subcategorySchema.index({isActive: 1});
subcategorySchema.index({sortOrder: 1});
subcategorySchema.index({slug: 1});
subcategorySchema.index({createdBy: 1});

module.exports = mongoose.model('Subcategory', subcategorySchema);