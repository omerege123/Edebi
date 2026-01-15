import db from './db.js';

async function checkKeremAssignments() {
    try {
        const result = await db.query("SELECT * FROM assignments WHERE user_id = 4");
        console.log("Assignments for KEREM (user_id 4):");
        console.log(JSON.stringify(result.rows, null, 2));
    } catch (err) {
        console.error("Error checking assignments:", err);
    } finally {
        process.exit();
    }
}

checkKeremAssignments();
