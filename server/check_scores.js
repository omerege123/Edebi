import db from './db.js';

async function checkScores() {
    try {
        const result = await db.query(`
            SELECT assignment_id, user_id, book_id, status, score, summary_text
            FROM assignments
            WHERE summary_text IS NOT NULL AND summary_text != ''
            ORDER BY assignment_id DESC
            LIMIT 10
        `);

        console.log('Recent assignments with summaries:');
        console.log(JSON.stringify(result.rows, null, 2));

        const scoreCount = await db.query(`
            SELECT COUNT(*) as count FROM assignments WHERE score IS NOT NULL
        `);
        console.log('\nTotal assignments with scores:', scoreCount.rows[0].count);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

checkScores();
