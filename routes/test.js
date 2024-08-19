(async () => {
    const fetch = (await import('node-fetch')).default;

    const baseUrl = 'http://localhost:3000';
    let cookies = '';

    // Function to perform login and store cookies
    async function login() {
        const loginResponse = await fetch(`${baseUrl}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: 'admin', password: 'admin' })
        });

        if (loginResponse.ok) {
            cookies = loginResponse.headers.get('set-cookie');
            console.log('Successfully logged in');
        } else {
            console.error('Login failed');
        }
    }

    const routes = [
        { method: 'GET', path: '/', description: 'Root route' },
        { method: 'GET', path: '/users/login', description: 'Login page' },
        { method: 'GET', path: '/users/register', description: 'Register page' },
        {
            method: 'POST',
            path: '/users/login',
            description: 'Login action',
            body: { username: 'admin', password: 'admin' }
        },
        { method: 'POST', path: '/users/register', description: 'Register action', body: { username: 'newuser1', password: 'newpassword1' } },
        { method: 'GET', path: '/users/store', description: 'Store page' },
        {
            method: 'POST',
            path: '/users/store/add-to-cart',
            description: 'Add to cart action',
            body: { title: 'Olive Green' },
            validate: async () => {
                const cartResponse = await fetch(`${baseUrl}/users/cart`, {
                    headers: { 'Cookie': cookies } // Send the cookies with the request
                });
                const cartHtml = await cartResponse.text();
                return cartHtml.includes('Olive Green');
            }
        },
        {
            method: 'DELETE',
            path: '/users/store/remove-from-cart',
            description: 'Remove from cart action',
            body: { title: 'Olive Green' },
            validate: async () => {
                const cartResponse = await fetch(`${baseUrl}/users/cart`, {
                    headers: { 'Cookie': cookies }
                });
                const cartHtml = await cartResponse.text();
                return !cartHtml.includes('Olive Green');
            }
        },
        { method: 'GET', path: '/users/wishlist', description: 'Wishlist page' },
        { method: 'POST', path: '/users/wishlist/add', description: 'Add to wishlist action', body: { title: 'Black with Patches Dunks' } },
        { method: 'GET', path: '/users/giftcard', description: 'Buy gift card page' },
        {
            method: 'POST',
            path: '/users/giftcard/checkout',
            description: 'Purchase gift card action',
            body: {
                amount: 50,
                message: 'Happy Birthday!',
                yourName: 'Test User',
                recipientEmail: 'test@example.com'
            }
        }
    ];

    async function runTests() {
        // Perform login before running tests that require authentication
        await login();

        for (const route of routes) {
            const url = `${baseUrl}${route.path}`;
            let options = {
                method: route.method,
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': cookies // Include cookies for authenticated routes
                },
            };

            if (['POST', 'PUT', 'DELETE'].includes(route.method) && route.body) {
                options.body = JSON.stringify(route.body);
            }

            try {
                console.log(`Sending request to ${url} with options:`, options);
                const response = await fetch(url, options);
                const responseBody = await response.text();
                let passed = response.ok;

                // If the route has a validation function, run it
                if (route.validate) {
                    passed = passed && await route.validate();
                }

                if (passed) {
                    console.log(`PASS: ${route.description} (${route.method} ${route.path})`);
                } else {
                    console.log(`FAIL: ${route.description} (${route.method} ${route.path}) - Status: ${response.status}`);
                    console.log(`Response: ${responseBody}`);
                }
            } catch (error) {
                console.log(`ERROR: ${route.description} (${route.method} ${route.path}) - ${error.message}`);
            }
        }
    }

    runTests();
})();
