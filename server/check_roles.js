import db from './db.js';

async function checkUserRoles() {
    try {
        const result = await db.query("SELECT DISTINCT rol FROM users");
        console.log("Distinct roles in DB:");
        console.log(JSON.stringify(result.rows, null, 2));
    } catch (err) {
        console.error("Error checking roles:", err);
    } finally {
        process.exit();
    }
}

checkUserRoles();
