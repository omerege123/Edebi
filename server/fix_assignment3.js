import db from './db.js';

async function addScoreToAssignment3() {
    try {
        await db.query(
            "UPDATE assignments SET score = 92 WHERE assignment_id = 3"
        );
        console.log('✅ Assignment 3\'e 92 puan eklendi');

        const result = await db.query(
            "SELECT assignment_id, status, score, summary_text FROM assignments WHERE assignment_id = 3"
        );
        console.log('Güncel durum:', result.rows[0]);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

addScoreToAssignment3();
