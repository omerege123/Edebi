import db from './db.js';

async function findAndScoreGjgjgjgj() {
    try {
        const result = await db.query(`
            SELECT assignment_id, user_id, status, score, summary_text, book_id
            FROM assignments
            WHERE summary_text LIKE '%gjgjgjgj%'
        `);

        console.log('Found assignment with "gjgjgjgj":');
        console.log(JSON.stringify(result.rows, null, 2));

        if (result.rows.length > 0) {
            const assignmentId = result.rows[0].assignment_id;
            const randomScore = Math.floor(Math.random() * 31) + 70; // 70-100 arası
            await db.query(
                "UPDATE assignments SET score = ? WHERE assignment_id = ?",
                [randomScore, assignmentId]
            );
            console.log(`\n✅ Assignment ${assignmentId}'e ${randomScore} puan eklendi`);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

findAndScoreGjgjgjgj();
