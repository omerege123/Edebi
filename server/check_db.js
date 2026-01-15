import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function check() {
    try {
        const res = await pool.query('SELECT count(*) as count FROM users');
        console.log('--- DATABASE CHECK ---');
        console.log('Users:', res.rows[0].count);

        const res2 = await pool.query('SELECT count(*) as count FROM books');
        console.log('Books:', res2.rows[0].count);

        const res3 = await pool.query('SELECT count(*) as count FROM quotes');
        console.log('Total Quotes:', res3.rows[0].count);

        const res3approved = await pool.query("SELECT count(*) as count FROM quotes WHERE durum = 'onaylandi'");
        console.log('Approved (onaylandi) Quotes:', res3approved.rows[0].count);

        const resEnroll = await pool.query('SELECT count(*) as count FROM class_enrollments');
        console.log('Class Enrollments:', resEnroll.rows[0].count);

        const resAssign = await pool.query('SELECT assignment_id, user_id, status FROM assignments');
        console.log('Assignments:');
        resAssign.rows.forEach(a => console.log(`- ID ${a.assignment_id}: User ${a.user_id}, Status=${a.status}`));

        const users = await pool.query('SELECT user_id, kullanici_adi, parola_hash, rol FROM users');
        console.log('User Credentials:');
        users.rows.forEach(u => console.log(`- ${u.kullanici_adi} (${u.rol}): PW=${u.parola_hash}`));

        console.log('--- CHECK COMPLETED ---');
    } catch (err) {
        console.error('Check Error:', err.message);
    } finally {
        await pool.end();
    }
}

check();
