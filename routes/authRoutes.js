const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const persist = require('./persist');


// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.cookies.username) {
        return next();
    } else {
        res.redirect('/users/login');
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

// Export the router to make it available in other files
module.exports = router;
