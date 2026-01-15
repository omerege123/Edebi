import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function fix() {
    try {
        // Fix passwords for initial users
        await pool.query("UPDATE users SET parola_hash = '123456' WHERE kullanici_adi IN ('ali123', 'ayse123', 'mehmet_hoca')");
        console.log('Fixed passwords for ali123, ayse123, mehmet_hoca to 123456');

        // Approve all quotes
        const res = await pool.query("UPDATE quotes SET durum = 'onaylandi'");
        console.log(`Successfully approved ${res.rowCount} quotes.`);

        // Reset sequences to be safe
        const tables = ['users', 'books', 'quotes', 'assignments', 'badges', 'classes'];
        for (const table of tables) {
            const idCol = table === 'classes' ? 'class_id' : (table.endsWith('s') ? table.slice(0, -1) + '_id' : table + '_id');
            try {
                await pool.query(`SELECT setval(pg_get_serial_sequence('${table}', '${idCol}'), (SELECT MAX(${idCol}) FROM ${table}))`);
                console.log(`Reset sequence for ${table}`);
            } catch (e) { }
        }

    } catch (err) {
        console.error('Fix Error:', err.message);
    } finally {
        await pool.end();
    }
}

fix();
