const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const userController = require('../controllers/userController');

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.cookies.username) {
        return next();
    } else {
        res.redirect('/users/login');
    }
}

// Middleware to check if the user is an admin
function isAdmin(req, res, next) {
    if (req.cookies.username === 'admin') {
        return next();
    } else {
        res.status(403).send('Access denied.');
    }
}

// Route that handles the GET request for /register
router.get('/register', (req, res) => {
    res.render('register');
});

// Route that handles the GET request for /login
router.get('/login', (req, res) => {
    res.render('login');
});

// Route to handle user registration
router.post('/register', userController.register);

// Route to handle user login
router.post('/login', userController.login);

// Route to handle user logout
router.get('/logout', userController.logout);

// Protected routes
router.get('/store', isAuthenticated, (req, res) => {
    const products = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/products.json')));
    res.render('store', { products, username: req.cookies.username });
});

router.get('/cart', isAuthenticated, (req, res) => {
    const username = req.cookies.username;
    const cart = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/cart.json')));
    res.render('cart', { cart: cart[username] || [] });
});

router.get('/checkout', isAuthenticated, (req, res) => {
    const username = req.cookies.username;
    const cart = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/cart.json')));

    if (!cart[username] || cart[username].length === 0) {
        return res.redirect('/users/cart'); // Redirect back to the cart page
    }

    let totalPrice = 0;

    if (cart[username]) {
        cart[username].forEach(item => {
            totalPrice += item.price * item.quantity;
        });
    }

    // Render the checkout page with cart details and total price
    res.render('checkout', { cart: cart[username], totalPrice: totalPrice });
});


// Add the route to handle the 'complete purchase' action
router.post('/checkout/complete', isAuthenticated, (req, res) => {
    const username = req.cookies.username;
    const cartFilePath = path.join(__dirname, '../data/cart.json');
    const purchasesFilePath = path.join(__dirname, '../data/purchases.json');

    // Load the cart and purchases data
    const cart = JSON.parse(fs.readFileSync(cartFilePath));
    const purchases = JSON.parse(fs.readFileSync(purchasesFilePath));

    if (!cart[username] || cart[username].length === 0) {
        return res.status(400).send('Your cart is empty.');
    }

    // Add the cart items to the user's purchase history
    if (!purchases[username]) {
        purchases[username] = [];
    }
    purchases[username].push(...cart[username]);

    // Clear the user's cart
    cart[username] = [];

    // Save the updated cart and purchases back to the file
    fs.writeFileSync(cartFilePath, JSON.stringify(cart, null, 2));
    fs.writeFileSync(purchasesFilePath, JSON.stringify(purchases, null, 2));

    // Redirect to the thank you page
    res.redirect('/users/thankyou');
});

// Route to display the thank you page
router.get('/thankyou', isAuthenticated, (req, res) => {
    res.render('thankyou'); // Make sure you have a 'thank_you.ejs' file in your views directory
});


router.get('/admin', isAuthenticated, isAdmin, (req, res) => {
    const activityLog = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/activityLog.json')));
    const products = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/products.json')));
    res.render('admin', { activityLog, products });
});

// Add to cart route
router.post('/store/add-to-cart', isAuthenticated, (req, res) => {
    const { title } = req.body;
    const username = req.cookies.username;

    const products = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/products.json')));
    const product = products.find(p => p.title === title);

    if (!product) {
        return res.status(400).json({ success: false, message: 'Product not found.' });
    }

    const cart = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/cart.json')));

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

    fs.writeFileSync(path.join(__dirname, '../data/cart.json'), JSON.stringify(cart, null, 2));

    res.json({ success: true });
});

router.post('/store/increase-quantity', isAuthenticated, (req, res) => {
    const { title } = req.body;
    const username = req.cookies.username;

    const cart = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/cart.json')));

    if (!cart[username]) {
        return res.status(400).json({ success: false, message: 'Cart not found.' });
    }

    const productIndex = cart[username].findIndex(item => item.title === title);

    if (productIndex !== -1) {
        cart[username][productIndex].quantity += 1;
    } else {
        return res.status(400).json({ success: false, message: 'Product not found in cart.' });
    }

    fs.writeFileSync(path.join(__dirname, '../data/cart.json'), JSON.stringify(cart, null, 2));

    res.json({ success: true });
});

router.post('/store/decrease-quantity', isAuthenticated, (req, res) => {
    const { title } = req.body;
    const username = req.cookies.username;

    const cart = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/cart.json')));

    if (!cart[username]) {
        return res.status(400).json({ success: false, message: 'Cart not found.' });
    }

    const productIndex = cart[username].findIndex(item => item.title === title);

    if (productIndex !== -1) {
        if (cart[username][productIndex].quantity > 1) {
            cart[username][productIndex].quantity -= 1;
        } else {
            cart[username].splice(productIndex, 1); // Remove item if quantity is 0
        }
    } else {
        return res.status(400).json({ success: false, message: 'Product not found in cart.' });
    }

    fs.writeFileSync(path.join(__dirname, '../data/cart.json'), JSON.stringify(cart, null, 2));

    res.json({ success: true });
});




// Remove from cart route
router.post('/store/remove-from-cart', isAuthenticated, (req, res) => {
    const { title } = req.body;
    const username = req.cookies.username;

    const cart = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/cart.json')));

    if (!cart[username]) {
        return res.status(400).json({ success: false, message: 'Cart not found.' });
    }

    cart[username] = cart[username].filter(item => item.title !== title);

    fs.writeFileSync(path.join(__dirname, '../data/cart.json'), JSON.stringify(cart, null, 2));

    res.redirect('/users/cart');
});

// Add to wishlist route
router.post('/wishlist/add', isAuthenticated, (req, res) => {
    const username = req.cookies.username;
    const { title } = req.body;
    const wishlistFilePath = path.join(__dirname, '../data/wishlist.json');
    const wishlist = JSON.parse(fs.readFileSync(wishlistFilePath));

    if (!wishlist[username]) {
        wishlist[username] = [];
    }

    if (!wishlist[username].some(item => item.title === title)) {
        wishlist[username].push({ title });
        fs.writeFileSync(wishlistFilePath, JSON.stringify(wishlist, null, 2));
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'Item already in wishlist' });
    }
});

// View wishlist route
router.get('/wishlist', isAuthenticated, (req, res) => {
    const username = req.cookies.username;
    const wishlistFilePath = path.join(__dirname, '../data/wishlist.json');
    const wishlist = JSON.parse(fs.readFileSync(wishlistFilePath));
    const userWishlist = wishlist[username] || [];

    // Load products to map title to image
    const products = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/products.json')));
    const productMap = new Map(products.map(p => [p.title, p.image]));

    // Map wishlist items to include images
    const wishlistWithImages = userWishlist.map(item => ({
        ...item,
        image: productMap.get(item.title) || null
    }));

    res.render('wishlist', { wishlist: wishlistWithImages });
});

// Remove from wishlist route
router.post('/wishlist/remove', isAuthenticated, (req, res) => {
    const { title } = req.body;
    const username = req.cookies.username;

    const wishlistFilePath = path.join(__dirname, '../data/wishlist.json');
    const wishlist = JSON.parse(fs.readFileSync(wishlistFilePath));

    if (!wishlist[username]) {
        return res.status(400).json({ success: false });
    }

    wishlist[username] = wishlist[username].filter(item => item.title !== title);

    fs.writeFileSync(wishlistFilePath, JSON.stringify(wishlist, null, 2));

    res.json({ success: true });
});


// Route to display the gift card purchase page
router.get('/giftcard', isAuthenticated, (req, res) => {
    res.render('giftcard'); // Render the gift card form page
});

// Route to handle the checkout process and redirect to the thank you page
router.post('/giftcard/checkout', isAuthenticated, (req, res) => {
    const { amount, message, yourName, recipientEmail } = req.body;

    // Here you can process the gift card data (e.g., save it, send an email, etc.)
    console.log('Gift Card Purchased:', { amount, message, yourName, recipientEmail });

    // Redirect to the thank you page
    res.redirect('/users/giftcard/thank-you');
});

// Route to display the thank you page
router.get('/giftcard/thank-you', isAuthenticated, (req, res) => {
    res.render('giftcardThankYou');
});

// Route to display the gift card purchase confirmation page
router.get('/giftcard/confirmation', isAuthenticated, (req, res) => {
    res.render('giftcardConfirmation'); // Render the confirmation page
});

// Route for the Terms and Conditions page
router.get('/terms', (req, res) => {
    res.render('terms');
});

// Route for the Contact Us page
router.get('/contact', (req, res) => {
    res.render('contact');
});

// Handle contact form submission
router.post('/contact', (req, res) => {
    const { name, email, orderNumber, reason, message } = req.body;

    // Process the form data here (e.g., save to a database, send an email)
    console.log('Contact Us Form Submitted:', { name, email, orderNumber, reason, message });

    // Redirect to a thank you page or show a success message
    res.redirect('/users/contact-success');
});

// Route to display the contact success page
router.get('/contact-success', (req, res) => {
    res.render('contact_success');
});

module.exports = router;
