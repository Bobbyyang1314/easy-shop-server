const {Product} = require('../models/product');
const express = require('express');
const router = express.Router();
const {Category} = require('../models/category');
const mongoose = require('mongoose');
// Added in tutorial 7-002
// https://www.npmjs.com/package/multer
const multer = require('multer');

// Validate user uploaded file type
const FILE_TYPE_MAP = {
    // MIME type
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

// Modified from https://github.com/expressjs/multer , DiskStorage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        // Callback when there's error
        let uploadError = new Error('Invalid image type');

        if(isValid) {
            uploadError = null
        }
        cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        // Use array to check file type and assign extension
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
})

const uploadOptions = multer({ storage: storage })

// asynchronous request, find the products first and res.send
// same as .then()
router.get(`/`, async (req, res) => {
    // localhost:3000/api/v1/products?categories=2342342, 234234
    let filter = {}
    if (req.query.categories) {
        filter = {category: req.query.categories.split(',')}
    }
    // https://mongoosejs.com/docs/api/model.html#model_Model.find
    // const productList = await Product.find().select('name image -_id'); // only display specific factors. May need to disable toHexString when testing
    const productList = await Product.find(filter, ).populate('category'); // show details of the specific value
    if (!productList) {
        res.status(500).json({success: false});
    }
    res.send(productList);
})

router.get(`/:id`, async (req, res) => {
    // https://mongoosejs.com/docs/api/model.html#model_Model.find
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) {
        res.status(500).json({success: false});
    }
    res.send(product);
})

router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    // Check if category is valid
    if (!mongoose.isValidObjectId(req.body.category)) return res.status(400).send("Invalid category id");
    // Bool for testing category
    const category = await Category.findById(req.body.category)
    if (!category) return res.status(400).send("Category not found")

    const file = req.file;
    if (!file) return res.status(400).send("File not found")

    // Corresponds with multer filename
    const fileName = file.filename;
    // Help to build URL
    const basePath = `${req.protocol}://${req.get('host')}/public/upload/`;

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        // Full URL required
        image: `${basePath}${fileName}`, // "http://localhost:3000/public/upload/image-2323232"
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    });

    product = await product.save();
    if (!product) return res.status(500).send("The product cannot be created");
    return res.status(200).send(product);
})

router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id');
    }
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    const product = await Product.findById(req.params.id);

    if (!product) return res.status(400).send('Invalid Product!');

    const file = req.file;
    let imagepath;

    if (file) {
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagepath = `${basePath}${fileName}`;
    } else {
        imagepath = product.image;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: imagepath,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        },
        // Console will show new category with id, else show the old category
        { new: true}
    );
    if (!updatedProduct) return res.status(500).send("The product cannot be updated!");
    res.send(updatedProduct);
})

router.delete('/:id', async (req,res) => {
    Product.findByIdAndRemove(req.params.id)
        .then(product => {
            if (product) {
                return res.status(200).json({success: true, message: "The product has been removed"});
            } else {
                return res.status(404).json({success: false, message: "The product not found"});
            }
        }).catch(err => {
        return res.status(400).json({success: false, error: err});
    })
});

// Create api for counting the number of products
router.get(`/get/count`, async (req, res) => {
    // https://mongoosejs.com/docs/api/model.html#model_Model.find
    const productCount = await Product.countDocuments();
    if (!productCount) {
        res.status(500).json({success: false});
    }
    res.send({
        productCount: productCount
    });
})

// Create api for listing {count} of products which are isFeatured
router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0;
    // https://mongoosejs.com/docs/api/model.html#model_Model.find
    const products = await Product.find({isFeatured: true}).limit(+count); // change str count to numeric
    if (!products) {
        res.status(500).json({success: false});
    }
    res.send(products);
})

// Create api to update product image gallery
router.put(
    '/gallery-images/:id',
    uploadOptions.array('images', 10),
    async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send("Invalid product id");
        }
        const files = req.files;
        let imagesPaths = [];
        const basePath = `${req.protocol}://${req.get('host')}/public/upload/`;
        if(files) {
            files.map(file =>{
                imagesPaths.push(`${basePath}${file.filename}`);

            })
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                images: imagesPaths
            },
            { new: true}
        )
        if (!product) return res.status(500).send("The product cannot be updated!");
        res.send(product);
    }
);


module.exports = router;