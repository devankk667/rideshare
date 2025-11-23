import fetch from 'node-fetch';

const testRegister = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullName: 'Test User Node',
                email: 'nodeuser@example.com',
                phone: '1111111111',
                password: 'password123',
                userType: 'passenger'
            }),
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Data:', data);
    } catch (error) {
        console.error('Error:', error);
    }
};

testRegister();
