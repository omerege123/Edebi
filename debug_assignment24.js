import db from './server/db.js';

async function debugAssignment24() {
    try {
        console.log("Checking assignment 24 details...\n");

        // Get assignment 24 directly
        const assignment = await db.query(`
            SELECT a.*, b.kitap_adi, b.yazar, c.sinif_adi
            FROM assignments a
            LEFT JOIN books b ON a.book_id = b.book_id
            LEFT JOIN classes c ON a.class_id = c.class_id
            WHERE a.assignment_id = 24
        `);
        console.log("Assignment 24 from DB:");
        console.log(JSON.stringify(assignment.rows[0], null, 2));

        // Check class 1
        const cls = await db.query("SELECT * FROM classes WHERE class_id = 1");
        console.log("\nClass 1 data:");
        console.log(JSON.stringify(cls.rows[0], null, 2));

    } catch (err) {
        console.error("Error:", err);
    } finally {
        process.exit();
    }
}

debugAssignment24();
