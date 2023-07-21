const {Category} = require('../models/category');
const express = require('express');
const router = express.Router();

// asychronous request, find the products first and res.send
// same as .then()
router.get(`/`, async (req, res) => {
    // https://mongoosejs.com/docs/api/model.html#model_Model.find
    // mongoose model function .find() -- findAll
    const categoryList = await Category.find();

    if (!categoryList) {
        res.status(500).json({success: false});
    }
    res.status(200).send(categoryList);
})

// Get category by id
router.get('/:id', async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(500).json({ message: 'The category with the given id connot be found.' });
    res.status(200).send(category); 
})

router.post('/', async (req, res) => {
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    })
    category = await category.save();

    if (!category) return res.status(404).send("The category connot be created");
    res.send(category);
})

router.put('/:id', async (req, res) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color
        },
        // Console will show new category with id, else show the old category
        { new: true}
    )
    if (!category) return res.status(400).send("The category connot be created");
    res.send(category);
})

// api/v1/categories/{id}
router.delete('/:id', async (req,res) => {
    Category.findByIdAndRemove(req.params.id)
        .then(category => {
        if (category) {
            return res.status(200).json({success: true, message: "The category has been removed"});
        } else {
            return res.status(404).json({success: false, message: "The category not found"});
        }
    }).catch(err => {
        return res.status(400).json({success: false, error: err});
    })
});

module.exports = router;