import db from './server/db.js';

async function checkData() {
    try {
        const result = await db.query("SELECT assignment_id, user_id, class_id, assignment_type FROM assignments");
        console.log("Assignments Count:", result.rows.length);
        console.log("Data sample:");
        console.log(JSON.stringify(result.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkData();
