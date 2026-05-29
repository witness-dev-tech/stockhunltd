const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

// Immediately verify connection health on startup
pool.query('SELECT 1')
    .then(() => {
        console.log('🚀 StockHub DB Connection: SUCCESS. Database pool initialized safely.');
    })
    .catch((err) => {
        console.error('❌ StockHub DB Connection: FAILED. Verify database services or credentials.');
        console.error(err.message);
    });

module.exports = pool;