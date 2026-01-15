import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

console.log('Database connecting...');
if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is missing!');
} else {
    console.log('DATABASE_URL found (length:', process.env.DATABASE_URL.length, ')');
}

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on('connect', () => {
    console.log('PostgreSQL Pool connected');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

export default {
    query: (text, params = []) => {
        // Convert ? to $1, $2, etc. to maintain compatibility with existing code
        let count = 1;
        const newText = text.replace(/\?/g, () => `$${count++}`);
        return pool.query(newText, params);
    },
    pool // Export pool if needed for transactions
};
