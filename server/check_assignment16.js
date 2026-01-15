import db from './db.js';

async function checkAssignment16() {
    try {
        const result = await db.query(`
            SELECT assignment_id, user_id, status, score, summary_text
            FROM assignments
            WHERE assignment_id IN (14, 15, 16)
            ORDER BY assignment_id DESC
        `);

        console.log('Recent assignments (14, 15, 16):');
        console.log(JSON.stringify(result.rows, null, 2));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

checkAssignment16();
