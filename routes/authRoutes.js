const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const persist = require('./persist'); // Import the persist module

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.cookies.username) {
        return next();
    } else {
        res.redirect('/users/login');
    }
}

// Route that handles the GET request for /register
router.get('/register', async (req, res) => {
    try {
        res.render('register');
    } catch (error) {
        console.error('Error rendering register page:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route that handles the GET request for /login
router.get('/login', async (req, res) => {
    try {
        res.render('login');
    } catch (error) {
        console.error('Error rendering login page:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/login', async (req, res) => {
    try {
        await userController.login(req, res);
    } catch (error) {
        console.error('Error handling user login:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/register', async (req, res) => {
    try {
        await userController.register(req, res);
    } catch (error) {
        console.error('Error handling user registration:', error);
        res.status(500).render('register', { error: 'Internal Server Error' }); // Render the registration page with a generic error message
    }
});



// Route to handle user logout
router.get('/logout', async (req, res) => {
    try {
        await userController.logout(req, res);
    } catch (error) {
        console.error('Error handling user logout:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Export the router to make it available in other files
module.exports = router;
