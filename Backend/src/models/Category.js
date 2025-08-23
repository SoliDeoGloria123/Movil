const mongoose = require('mongoose');


const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, 'el nombre  de la categoria es requerido'],
        unique: true,
        trim: true,
        minlength: [3, 'el nombre de la categoria debe tener al menos 3 caracteres'],
        maxlength: [100, 'el nombre no puede tener mas de 100 caracteres']
    },
    description: {
        type: String,
        require: [true, 'la descripcion de la categoria es requerida'],
        trim: true,
        maxlength: [500, 'la descripcion no puede tener mas de 500 caracteres']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
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
        require: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},{
    timestamps: true
});

categorySchema.pre('save', function(next) {
    if (!this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    next();
});


categorySchema.pre('findOneAndUpdate', function(next) {
    const update = this.getUpdate();
    if (update.name) {
        update.slug = update.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    next();
});

categorySchema.virtual('productCount', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'category',
    count: true
});

categorySchema.statics.findActive = function(){
    return this.find({ isActive: true }).sort({sortOrder: 1, name: 1});
};

categorySchema.methods.canBeDeleted = async function() {
    const Subcategory = mongoose.model('Subcategory');
    const Product = mongoose.model('Product');
    
    const SubcategoryCount = await Subcategory.countDocuments({ category: this._id });
    const ProductCount = await Product.countDocuments({ category: this._id });

    return SubcategoryCount === 0 && ProductCount === 0;
};


categorySchema.index({isActive: 1});
categorySchema.index({sortOrder: 1});
categorySchema.index({createdBy: 1});

module.exports = mongoose.model('Category', categorySchema);

