const {Order} = require('../models/order');
const express = require('express');
const { OrderItem } = require('../models/order-item');
const router = express.Router();

router.get(`/`, async (req, res) =>{
    const orderList = await Order.find().populate('user', 'name').sort({'dateOrdered': -1});

    if(!orderList) {
        res.status(500).json({success: false})
    }
    res.send(orderList);
})

router.get(`/:id`, async (req, res) =>{
    const order = await Order.findById(req.params.id)
        .populate('user', 'name')
        // Get more detail of each order-item
        .populate({
            path: 'orderItems', populate: {
                path : 'product', populate: 'category'}
        });

    if(!order) {
        res.status(500).json({success: false})
    }
    res.send(order);
})

// Create order-item first and attach them to order request
router.post('/', async (req, res) => {
    // Use Promise.all to return one resolved promise
    // Otherwise orderitems is empty
    const orderItemsIds  = Promise.all(req.body.orderItems.map(async (orderItem) =>{
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })

        newOrderItem = await newOrderItem.save();
        // Get the id in an array only
        return newOrderItem._id;
    }))
    const orderItemsIdsResolved = await orderItemsIds;

    // Total price array
    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId) =>{
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
        // Get total price of one item
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice
    }))

    const totalPrice = totalPrices.reduce((a,b) => a + b, 0);

    let order = new Order({
        // Used to be orderItemsIds before resolving promise
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        // Calculate total price in backend
        totalPrice: totalPrice,
        user: req.body.user,
    })
    order = await order.save();

    // CHECK: tutorial says status(400)?
    if (!order) return res.status(404).send("The order connot be created");
    res.send(order);
})

// api/v1/orders/{id}
// For changing order status
router.put('/:id', async (req, res) => {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status
        },
        // Console will show new order with id, else show the old order
        { new: true}
    )
    if (!order) return res.status(400).send("The order connot be created");
    res.send(order);
})

// api/v1/categories/{id}
router.delete('/:id', async (req,res) => {
    Order.findByIdAndRemove(req.params.id)
        .then(async order => {
            if (order) {
                //Wait for all delete task to be done
                await order.orderItems.map(async orderItem => {
                    //Find every order-item and delete
                    await OrderItem.findByIdAndRemove(orderItem)
                    //May add .then to handle error
                })
                return res.status(200).json({success: true, message: "The order has been removed"});
            } else {
                return res.status(404).json({success: false, message: "The order not found"});
            }
        }).catch(err => {
        return res.status(400).json({success: false, error: err});
    })
});

// api/v1/orders/get/totalsales
router.get('/get/totalsales', async (req, res) => {
    const totalSales = await Order.aggregate([
        { $group: { _id: null , totalsales : { $sum : '$totalPrice'}}}
    ])

    if(!totalSales) {
        return res.status(400).send('The order sales cannot be generated');
    }
    // Use pop() to get totalseles only
    res.send({totalSales: totalSales.pop().totalsales})
})

// Create api for counting the number of orders
router.get(`/get/count`, async (req, res) => {
    // https://mongoosejs.com/docs/api/model.html#model_Model.find
    // Removed (count) => count in countDocuments()
    const orderCount = await Order.countDocuments();
    if (!orderCount) {
        res.status(500).json({success: false});
    }
    res.send({
        orderCount: orderCount
    });
})

// Create api for getting user orders
// api/v1/orders/get/userorders/{id}
router.get(`/get/userorders/:userid`, async (req, res) =>{
    const userOrderList = await Order.find({user: req.params.userid}).populate({
        path: 'orderItems', populate: {
            path : 'product', populate: 'category'}
    }).sort({'dateOrdered': -1});

    if(!userOrderList) {
        res.status(500).json({success: false})
    }
    res.send(userOrderList);
})

module.exports = router;
