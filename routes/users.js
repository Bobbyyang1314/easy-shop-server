const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

//ADDED by GU
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

const jwt = require('jsonwebtoken');
// asynchronous request, find the products first and res.send
// same as .then()
router.get(`/`, async (req, res) => {
    // Don't show the user's password
    const userList = await User.find().select('-passwordHash');
    //Select certain fields
    //const userList = await User.find().select('name phone email');

    if (!userList) {
        res.status(500).json({success: false});
    }
    return res.send(userList);
})

// Get user by id
router.get('/:id', async (req, res) => {
    // Don't show the user's password
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) return res.status(500).json({ message: 'The user with the given id connot be found.' });
    res.status(200).send(user);
})

router.post('/', async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        //passwordHash: req.body.passwordHash,
        //Added by Gu
        passwordHash: bcrypt.hashSync(req.body.password, salt),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country
    })
    user = await user.save();

    if (!user) return res.status(404).send("The user cannot be created");
    res.send(user);
})

router.post(`/login`, async (req, res) => {
    const user = await User.findOne({email: req.body.email});
    const secret = process.env.SECRET;
    if (!user) return res.status(400).send("The user cannot be found");
    // Authenticate with the email and password
        //Need to set the salt in the passwordHash part
    else if (bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret,
            {expiresIn: '1d'} // Token will expire in 1 day
        )
        return res.status(200).send({user: user.email, token: token});
    } else {
        return res.status(400).send("Password mismatch");
    }
})



// Create api for counting the number of users
router.get(`/get/count`, async (req, res) => {
    // https://mongoosejs.com/docs/api/model.html#model_Model.find
    const userCount = await User.countDocuments();
    if (!userCount) {
        res.status(500).json({success: false});
    }
    res.send({
        userCount: userCount
    });
})

module.exports = router;