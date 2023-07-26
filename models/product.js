/**
 * Product model
 */
const mongoose = require('mongoose');

// https://mongoosejs.com/docs/guide.html
// Defining your schema
const productSchema = mongoose.Schema({
    name: {
        type: String, // String is shorthand for {type: String}
        required: true
    },
    description: {
        type: String,
        required: true
    },
    richDescription: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    images: [{
        type: String,
    }],
    brand: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        default: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    countInStock: {
        type: Number,
        required: true,
        min: 0,
        max: 255
    },
    rating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    dateCreated: {
        type: Date,
        default: Date.now()
    },
})

// Make frontend friendly by changing the _id to id
productSchema.virtual('id').get(function () {
    return this._id.toHexString();
})
productSchema.set('toJSON', {
    virtuals: true
})


// Creating a model
// Could also be used in other files
exports.Product = mongoose.model('Product', productSchema);