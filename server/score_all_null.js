import db from './db.js';

async function scoreAllNullAssignments() {
    try {
        const nullAssignments = await db.query(`
            SELECT assignment_id, summary_text
            FROM assignments
            WHERE status = 'completed' AND score IS NULL
        `);

        console.log(`Found ${nullAssignments.rows.length} completed assignments without scores:\n`);

        for (const assignment of nullAssignments.rows) {
            const randomScore = Math.floor(Math.random() * 101);
            await db.query(
                "UPDATE assignments SET score = ? WHERE assignment_id = ?",
                [randomScore, assignment.assignment_id]
            );
            console.log(`Assignment ${assignment.assignment_id} ("${assignment.summary_text.substring(0, 20)}..."): ${randomScore} puan`);
        }

        console.log('\n✅ Tüm puansız ödevlere rastgele puanlar atandı!');

        // Show all completed assignments with scores
        const allCompleted = await db.query(`
            SELECT assignment_id, user_id, score, summary_text
            FROM assignments
            WHERE status = 'completed'
            ORDER BY assignment_id
        `);

        console.log('\n📊 Tüm onaylanmış ödevler:');
        allCompleted.rows.forEach(a => {
            console.log(`  ID ${a.assignment_id} (User ${a.user_id}): ${a.score} puan`);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

scoreAllNullAssignments();
