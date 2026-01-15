import db from './db.js';

async function findKerem() {
    try {
        const result = await db.query("SELECT * FROM users WHERE ad LIKE '%KEREM%' OR soyad LIKE '%KEREM%'");
        console.log("Users matching KEREM:");
        console.log(JSON.stringify(result.rows, null, 2));
    } catch (err) {
        console.error("Error finding user:", err);
    } finally {
        process.exit();
    }
}

findKerem();
