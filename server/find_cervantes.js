import db from './db.js';

async function findCervantes() {
    try {
        const result = await db.query(`
            SELECT a.assignment_id, a.user_id, a.status, a.score, a.summary_text,
                   b.kitap_adi, b.yazar
            FROM assignments a
            JOIN books b ON a.book_id = b.book_id
            WHERE b.kitap_adi LIKE '%CERVANTES%' OR a.summary_text LIKE '%kojıkpojık%'
        `);

        console.log('CERVANTES assignment found:');
        console.log(JSON.stringify(result.rows, null, 2));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

findCervantes();
