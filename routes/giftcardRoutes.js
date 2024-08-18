// Handles: Gift card purchases and related pages

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

// Route to display the gift card purchase page
router.get('/giftcard', isAuthenticated, (req, res) => {
    res.render('giftcard');
});

// Route to handle the gift card checkout process
router.post('/giftcard/checkout', isAuthenticated, (req, res) => {
    const { amount, message, yourName, recipientEmail } = req.body;

    // Load existing gift cards data
    let giftcards = persist.readData('giftcards.json');

    // Generate a unique ID for the gift card purchase (or use another identifier like email or date)
    const giftcardId = Date.now(); // Using timestamp as a simple unique ID

    // Store the gift card data
    giftcards[giftcardId] = {
        amount,
        message,
        yourName,
        recipientEmail,
        date: new Date().toISOString()
    };

    // Save the updated gift cards data back to the file
    persist.writeData('giftcards.json', giftcards);

    // Redirect to the thank you page
    res.redirect('/users/giftcard/thank-you');
});

// Route to display the gift card thank you page
router.get('/giftcard/thank-you', isAuthenticated, (req, res) => {
    res.render('giftcardThankYou');
});

// Route to display the gift card purchase confirmation page
router.get('/giftcard/confirmation', isAuthenticated, (req, res) => {
    res.render('giftcardConfirmation');
});

module.exports = router;
