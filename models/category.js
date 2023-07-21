const mongoose = require('mongoose');

// https://mongoosejs.com/docs/guide.html
// Defining your schema
const categorySchema = mongoose.Schema({
    name: {
        type: String, // String is shorthand for {type: String}
        required: true
    },
    icon: {
        type: String,
    },
    color: {
        type: String,
    },
    // category: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Category',
    //     required: true
    // },
})
// Creating a model
// Could also be used in other files
exports.Category = mongoose.model('Category', categorySchema);