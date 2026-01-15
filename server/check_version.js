import db from './db.js';

async function checkVersion() {
    try {
        const result = await db.query("SELECT sqlite_version();");
        console.log("SQLite Version:", result.rows[0]['sqlite_version()']);
    } catch (err) {
        console.error("Error checking version:", err);
    } finally {
        process.exit();
    }
}

checkVersion();
