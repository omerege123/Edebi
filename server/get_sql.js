import db from './db.js';

async function getSql() {
    try {
        const result = await db.query("SELECT sql FROM sqlite_master WHERE name='assignments'");
        console.log("Assignments Table SQL:");
        console.log(result.rows[0].sql);
    } catch (err) {
        console.error("Error getting SQL:", err);
    } finally {
        process.exit();
    }
}

getSql();
