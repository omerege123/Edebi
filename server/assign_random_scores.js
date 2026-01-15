import db from './db.js';

async function assignRandomScores() {
    try {
        // Get all completed assignments without scores
        const assignments = await db.query(`
            SELECT assignment_id 
            FROM assignments 
            WHERE status = 'completed' AND score IS NULL
        `);

        console.log(`Found ${assignments.rows.length} completed assignments without scores`);

        for (const assignment of assignments.rows) {
            // Generate random score between 0 and 100
            const randomScore = Math.floor(Math.random() * 101);

            await db.query(
                "UPDATE assignments SET score = ? WHERE assignment_id = ?",
                [randomScore, assignment.assignment_id]
            );

            console.log(`Assignment ${assignment.assignment_id}: ${randomScore} puan atandı`);
        }

        console.log('\n✅ Tüm onaylanmış ödevlere rastgele puanlar atandı!');

        // Show summary
        const summary = await db.query(`
            SELECT assignment_id, user_id, status, score 
            FROM assignments 
            WHERE status = 'completed' 
            ORDER BY assignment_id
        `);
        console.log('\nGüncel durum:');
        console.log(JSON.stringify(summary.rows, null, 2));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

assignRandomScores();
