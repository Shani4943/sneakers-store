// Handles: Displaying products, adding to cart, wishlist management

const express = require('express');
const router = express.Router();
const persist = require('./persist');  // Import the persist module

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.cookies.username) {
        return next();
    } else {
        res.redirect('/users/login');
    }
}

// Route to display products in the store
router.get('/store', isAuthenticated, (req, res) => {
    const products = persist.readData('products.json');
    res.render('store', { products, username: req.cookies.username });
});

// Add to cart route
router.post('/store/add-to-cart', isAuthenticated, (req, res) => {
    const { title } = req.body;
    const username = req.cookies.username;

    const products = persist.readData('products.json');
    const product = products.find(p => p.title === title);

    if (!product) {
        return res.status(400).json({ success: false, message: 'Product not found.' });
    }

    const cart = persist.readData('cart.json');

    if (!cart[username]) {
        cart[username] = [];
    }

    // Check if the product already exists in the cart
    const existingProductIndex = cart[username].findIndex(item => item.title === title);

    if (existingProductIndex !== -1) {
        // If the product exists, increase the quantity
        if (!cart[username][existingProductIndex].quantity) {
            cart[username][existingProductIndex].quantity = 1; // Initialize quantity if not present
        }
        cart[username][existingProductIndex].quantity += 1;
    } else {
        // If the product does not exist in the cart, add it with a quantity of 1
        cart[username].push({ ...product, quantity: 1 });
    }

    persist.writeData('cart.json', cart);

    res.json({ success: true });
});

// View wishlist route
router.get('/wishlist', isAuthenticated, (req, res) => {
    const username = req.cookies.username;
    const wishlist = persist.readData('wishlist.json');
    const userWishlist = wishlist[username] || [];

    // Load products to map title to image
    const products = persist.readData('products.json');
    const productMap = new Map(products.map(p => [p.title, p.image]));

    // Map wishlist items to include images
    const wishlistWithImages = userWishlist.map(item => ({
        ...item,
        image: productMap.get(item.title) || null
    }));

    res.render('wishlist', { wishlist: wishlistWithImages });
});

// Add to wishlist route
router.post('/wishlist/add', isAuthenticated, (req, res) => {
    const username = req.cookies.username;
    const { title } = req.body;
    const wishlist = persist.readData('wishlist.json');

    if (!wishlist[username]) {
        wishlist[username] = [];
    }

    if (!wishlist[username].some(item => item.title === title)) {
        wishlist[username].push({ title });
        persist.writeData('wishlist.json', wishlist);
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'Item already in wishlist' });
    }
});

// Remove from wishlist route
router.post('/wishlist/remove', isAuthenticated, (req, res) => {
    const { title } = req.body;
    const username = req.cookies.username;

    const wishlist = persist.readData('wishlist.json');

    if (!wishlist[username]) {
        return res.status(400).json({ success: false });
    }

    wishlist[username] = wishlist[username].filter(item => item.title !== title);

    persist.writeData('wishlist.json', wishlist);

    res.json({ success: true });
});

module.exports = router;
