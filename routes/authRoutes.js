const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route to render the registration page
router.get('/register', async (req, res) => {
    try {
        res.render('register');
    } catch (error) {
        console.error('Error rendering register page:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to render the login page
router.get('/login', async (req, res) => {
    try {
        res.render('login');
    } catch (error) {
        console.error('Error rendering login page:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to handle user registration
router.post('/register', async (req, res) => {
    try {
        await userController.register(req, res);
    } catch (error) {
        console.error('Error handling user registration:', error);
        res.status(500).render('register', { error: 'Internal Server Error' });
    }
});

// Route to handle user login
router.post('/login', async (req, res) => {
    try {
        await userController.login(req, res);
    } catch (error) {
        console.error('Error handling user login:', error);
        res.status(500).render('login', { error: 'Internal Server Error' });
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

module.exports = router;
