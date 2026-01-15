import db from './db.js';

async function diagnose() {
    try {
        console.log("1. Checking assignments table schema...");
        const schema = await db.query("PRAGMA table_info(assignments)");
        console.log(JSON.stringify(schema.rows, null, 2));

        console.log("\n2. Finding a test assignment (ID 1)...");
        const ass = await db.query("SELECT * FROM assignments WHERE assignment_id = 1");
        console.log("Before Update:", JSON.stringify(ass.rows[0], null, 2));

        console.log("\n3. Testing UPDATE with 'submitted' status...");
        const updateQuery = "UPDATE assignments SET summary_text = 'Diagnose test', status = 'submitted' WHERE assignment_id = 1 RETURNING *";
        try {
            const result = await db.query(updateQuery);
            console.log("Update SUCCESS:", JSON.stringify(result.rows[0], null, 2));
        } catch (updateErr) {
            console.error("Update FAILED:", updateErr);
        }

        console.log("\n4. Testing UPDATE with 'assigned' status (reset)...");
        await db.query("UPDATE assignments SET status = 'assigned' WHERE assignment_id = 1");
        console.log("Reset successful.");

    } catch (err) {
        console.error("Diagnosis Error:", err);
    } finally {
        process.exit();
    }
}

diagnose();
