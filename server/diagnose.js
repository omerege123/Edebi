import db from './db.js';

async function check() {
    try {
        const tables = await db.query("SELECT name FROM sqlite_master WHERE type='table'");
        console.log('Tables:', tables.rows.map(r => r.name));

        const quotes = await db.query("SELECT * FROM quotes LIMIT 1");
        console.log('Sample Quote:', quotes.rows[0]);

        const likes = await db.query("SELECT * FROM quote_likes LIMIT 1");
        console.log('Sample Like:', likes.rows[0]);

        const comments = await db.query("SELECT * FROM quote_comments LIMIT 1");
        console.log('Sample Comment:', comments.rows[0]);
    } catch (err) {
        console.error('Diagnostic error:', err);
    }
}

check();
