import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function check() {
    try {
        const res = await pool.query("SELECT DISTINCT durum FROM quotes");
        console.log('Distinct durum values:', res.rows);

        // Let's also check if there are nulls or empty strings
        const resCount = await pool.query("SELECT count(*) FROM quotes WHERE durum IS NULL OR durum = ''");
        console.log('Invalid durum count:', resCount.rows[0].count);

        if (res.rows.length > 0) {
            console.log('Current statuses in DB:', res.rows.map(r => `"${r.durum}"`).join(', '));
        }

    } catch (err) {
        console.error('Check Error:', err.message);
    } finally {
        await pool.end();
    }
}

check();
