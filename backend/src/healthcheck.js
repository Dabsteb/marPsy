const http = require('http');

const PORT = process.env.PORT || 3000;
const HOST = 'localhost';

const options = {
    hostname: HOST,
    port: PORT,
    path: '/',
    method: 'GET',
    timeout: 2000
};

const req = http.request(options, (res) => {
    if (res.statusCode === 200) {
        console.log('✅ Healthcheck passed');
        process.exit(0);
    } else {
        console.log(`❌ Healthcheck failed with status: ${res.statusCode}`);
        process.exit(1);
    }
});

req.on('error', (err) => {
    console.log(`❌ Healthcheck failed with error: ${err.message}`);
    process.exit(1);
});

req.on('timeout', () => {
    console.log('❌ Healthcheck timeout');
    req.destroy();
    process.exit(1);
});

req.end(); 