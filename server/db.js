import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
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
