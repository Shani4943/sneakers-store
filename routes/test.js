const fetch = require('node-fetch');

const baseUrl = 'http://localhost:3000';
const routes = [
    { method: 'GET', path: '/', description: 'Root route' },
    { method: 'GET', path: '/users/login', description: 'Login page' },
    { method: 'GET', path: '/users/register', description: 'Register page' },
    { method: 'POST', path: '/users/login', description: 'Login action', body: { username: 'testuser', password: 'password' } },
    { method: 'POST', path: '/users/register', description: 'Register action', body: { username: 'newuser', password: 'newpassword' } },
    { method: 'GET', path: '/users/store', description: 'Store page' },
    { method: 'POST', path: '/users/store/add-to-cart', description: 'Add to cart action', body: { productId: '123' } },
    { method: 'GET', path: '/users/cart', description: 'View cart' },
    { method: 'POST', path: '/users/store/remove-from-cart', description: 'Remove from cart action', body: { productId: '123' } },
    { method: 'GET', path: '/users/wishlist', description: 'Wishlist page' },
    { method: 'POST', path: '/users/wishlist/add', description: 'Add to wishlist action', body: { productId: '123' } },
    { method: 'GET', path: '/users/giftcard', description: 'Buy gift card page' },
    { method: 'POST', path: '/users/giftcard/purchase', description: 'Purchase gift card action', body: { amount: 50, email: 'test@example.com', message: 'Happy Birthday!' } },
];

async function runTests() {
    for (const route of routes) {
        const url = `${baseUrl}${route.path}`;
        let options = {
            method: route.method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (route.method === 'POST' && route.body) {
            options.body = JSON.stringify(route.body);
        }

        try {
            const response = await fetch(url, options);
            if (response.ok) {
                console.log(`PASS: ${route.description} (${route.method} ${route.path})`);
            } else {
                console.log(`FAIL: ${route.description} (${route.method} ${route.path}) - Status: ${response.status}`);
            }
        } catch (error) {
            console.log(`ERROR: ${route.description} (${route.method} ${route.path}) - ${error.message}`);
        }
    }
}

runTests();
