// replace </p><p><code>app.use(bodyParser.json())</code> with <code>app.use(express.json())</code> </p>
const express = require('express');
const app = express();
// const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
// Cross-origin resource sharing (CORS) is a mechanism 
// that allows restricted resources on a web page to be 
// accessed from another domain outside the domain from 
// which the first resource was served.
const cors = require('cors');
// Get the url from env
require('dotenv/config');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

const api = process.env.API_URL;
app.use(cors());
app.options('*', cors());

// Middleware
// Display json in format
app.use(express.json());
// Display log requests in format
app.use(morgan('tiny'));
// Implement helper to auth
app.use(authJwt());
// Uploaded file will be in static path
// To make uploaded images visible frontend
app.use('/public/upload', express.static(__dirname + '/public/uploads'));

app.use(errorHandler);

// Routes
const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');
const usersRoutes = require('./routes/users');
const ordersRoutes = require('./routes/orders');

// Routes
// https://developer.mozilla.org/zh-CN/docs/Learn/Server-side/Express_Nodejs/routes
app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);

// Connect to MongoDB Atlas Server
mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'mern-easy-shop'
})
    .then(() => {
        console.log('Database Connection is ready...')
    })
    .catch((err) => {
        console.log(err);
    })

// server connect
// app.listen(3000);

// Production
const server = app.listen(process.env.PORT || 3000, function () {
    const port = server.address().port;
    console.log("Express is working on port " + port);
})

