// Handles: Admin-specific functionalities

const express = require('express');
const router = express.Router();
const persist = require('./persist');  // Import the persist module

// Middleware to check if the user is authenticated and an admin
function isAuthenticated(req, res, next) {
    if (req.cookies.username) {
        return next();
    } else {
        res.redirect('/users/login');
    }
}

function isAdmin(req, res, next) {
    if (req.cookies.username === 'admin') {
        return next();
    } else {
        res.status(403).send('Access denied.');
    }
}

// Admin dashboard route
router.get('/admin', isAuthenticated, isAdmin, (req, res) => {
    const activityLog = persist.readData('activityLog.json');
    const products = persist.readData('products.json');
    res.render('admin', { activityLog, products });
});

module.exports = router;
