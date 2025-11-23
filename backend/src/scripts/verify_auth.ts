

const BASE_URL = 'http://localhost:5000/api/auth';

const testAuth = async () => {
    console.log('Starting Authentication Verification...');

    // 1. Register a new user
    const uniqueId = Date.now();
    const newUser = {
        fullName: `Test User ${uniqueId}`,
        email: `test${uniqueId}@example.com`,
        phone: `${uniqueId}`.slice(0, 10),
        password: 'password123',
        userType: 'passenger'
    };

    console.log(`\n1. Testing Registration for ${newUser.email}...`);
    try {
        const regRes = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        });

        const regData = await regRes.json();
        console.log('Registration Status:', regRes.status);

        if (regRes.status !== 200) {
            console.error('Registration Failed:', regData);
            return;
        }
        console.log('Registration Success!');
        console.log('Token received:', !!regData.token);
        console.log('User received:', regData.user?.email === newUser.email);

        // 2. Login with the same user
        console.log(`\n2. Testing Login for ${newUser.email}...`);
        const loginRes = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: newUser.email,
                password: newUser.password
            })
        });

        const loginData = await loginRes.json();
        console.log('Login Status:', loginRes.status);

        if (loginRes.status !== 200) {
            console.error('Login Failed:', loginData);
            return;
        }
        console.log('Login Success!');
        console.log('Token received:', !!loginData.token);
        console.log('User received:', loginData.user?.email === newUser.email);
        console.log('Redirect Role:', loginData.user?.role);

    } catch (error) {
        console.error('Verification Error:', error);
    }
};

testAuth();
