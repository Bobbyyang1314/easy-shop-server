/**
 * User model
 */
const mongoose = require('mongoose');

// https://mongoosejs.com/docs/guide.html
// Defining your schema
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    street: {
        type: String,
        default: ''
    },
    apartment: {
        type: String,
        default: ''
    },
    zip: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: ''
    },
    country: {
        type: String,
        default: ''
    },
})

// Make frontend friendly by changing the _id to id
userSchema.virtual('id').get(function () {
    return this._id.toHexString();
})
userSchema.set('toJSON', {
    virtuals: true
})

// Creating a model
// Could also be used in other files
exports.User = mongoose.model('User', userSchema);