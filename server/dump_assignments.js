import db from './db.js';

async function listAssignments() {
    try {
        const result = await db.query("SELECT * FROM assignments");
        console.log("Assignments in DB:");
        console.log(JSON.stringify(result.rows, null, 2));
    } catch (err) {
        console.error("Error listing assignments:", err);
    } finally {
        process.exit();
    }
}

listAssignments();
