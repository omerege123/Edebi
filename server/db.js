import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

console.log('Database connecting...');
const connectionString = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL is missing! Checked both NETLIFY_DATABASE_URL and DATABASE_URL');
} else {
    console.log('Database connection string found');
}

const pool = new pg.Pool({
    connectionString: connectionString,
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
