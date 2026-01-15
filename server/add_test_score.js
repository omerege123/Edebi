import db from './db.js';

async function addTestScore() {
    try {
        // Add a test score to assignment_id 8 (completed)
        await db.query(
            "UPDATE assignments SET score = 85 WHERE assignment_id = 8"
        );
        console.log('Test score (85) added to assignment_id 8');

        // Verify
        const result = await db.query(
            "SELECT assignment_id, status, score FROM assignments WHERE assignment_id = 8"
        );
        console.log('Updated assignment:', result.rows[0]);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

addTestScore();
