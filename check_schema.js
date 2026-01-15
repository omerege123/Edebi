import db from './server/db.js';

async function checkSchema() {
    try {
        const result = await db.query("PRAGMA table_info(assignments)");
        console.log("Assignments Table Columns:");
        console.log(JSON.stringify(result.rows, null, 2));

        const resultClasses = await db.query("PRAGMA table_info(classes)");
        console.log("\nClasses Table Columns:");
        console.log(JSON.stringify(resultClasses.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkSchema();
