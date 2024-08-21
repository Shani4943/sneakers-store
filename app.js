// Import the necessary modules
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

// Import the separated route modules
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const adminRoutes = require('./routes/adminRoutes');
const giftcardRoutes = require('./routes/giftcardRoutes');
const miscRoutes = require('./routes/miscRoutes');

const app = express();

const { readData } = require('./routes/persist'); // Adjust the path if necessary

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parse cookies
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Set up views directory
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');  // You can use any templating engine, here we're using EJS

// Use the separated routes
app.use('/users', authRoutes);
app.use('/users', productRoutes);
app.use('/users', cartRoutes);
app.use('/users', adminRoutes);
app.use('/users', giftcardRoutes);
app.use('/users', miscRoutes);

// Route for the store page
app.get('/', async (req, res) => {
    try {
        const products = await readData('products.json'); // Adjust the path if necessary
        res.render('store', { products }); // Pass the products to the view
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Add the /llm.html route
app.get('/llm.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'llm.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Add the /Readme.html route
app.get('/readme.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'readme.html'));
});