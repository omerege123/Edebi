import db from './db.js';

async function findAndScoreShshshAssignment() {
    try {
        const result = await db.query(`
            SELECT assignment_id, user_id, status, score, summary_text
            FROM assignments
            WHERE summary_text LIKE '%şşşşş%'
        `);

        console.log('Found assignment with "şşşşş":');
        console.log(JSON.stringify(result.rows, null, 2));

        if (result.rows.length > 0) {
            const assignmentId = result.rows[0].assignment_id;
            await db.query(
                "UPDATE assignments SET score = 78 WHERE assignment_id = ?",
                [assignmentId]
            );
            console.log(`\n✅ Assignment ${assignmentId}'e 78 puan eklendi`);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

findAndScoreShshshAssignment();
