const express = require('express');
const app = express();
const helmet = require('helmet');
//const rateLimit = require('express-rate-limit');

const expressValidator = require('express-validator');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const path = require('path');

app.use(morgan('combined')); // Logs requests in Apache combined format
app.use(compression()); // Enable compression for responses
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser()); // Parse cookies

// Use express-validator in your route handlers to validate and sanitize inputs
const { body, validationResult } = require('express-validator');

// Example of validation in a route
app.post('/some-route', [
  body('username').isAlphanumeric().withMessage('Username must be alphanumeric'),
  body('email').isEmail().withMessage('Invalid email address'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Handle valid input
});

// Rate limiting middleware for general use
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.',
// });
// app.use(limiter);

// Specific rate limiter for login
// const loginLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5, // Limit each IP to 5 login attempts per windowMs
//   message: 'Too many login attempts from this IP, please try again later.',
// });
// app.use('/users/login', loginLimiter);

// Middleware to make username available in all templates
app.use((req, res, next) => {
  res.locals.username = req.cookies.username || undefined;
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// Your routes and other middleware here



// Import the separated route modules
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const adminRoutes = require('./routes/adminRoutes');
const giftcardRoutes = require('./routes/giftcardRoutes');
const miscRoutes = require('./routes/miscRoutes');

const { readData } = require('./routes/persist'); // Adjust the path if necessary

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parse cookies
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Middleware to make username available in all templates
app.use((req, res, next) => {
    res.locals.username = req.cookies.username || undefined;
    next();
});


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

// Add the /Readme.html route
app.get('/readme.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'readme.html'));
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
