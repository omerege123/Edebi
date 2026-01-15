import db from './server/db.js';

async function checkUser4Assignments() {
    try {
        console.log("Checking assignments for user 4 (KEREM)...\n");

        const result = await db.query(`
            SELECT a.assignment_id, a.class_id, b.kitap_adi, c.sinif_adi
            FROM assignments a
            LEFT JOIN books b ON a.book_id = b.book_id
            LEFT JOIN classes c ON a.class_id = c.class_id
            WHERE a.user_id = 4
            ORDER BY a.assignment_id
        `);

        console.log("Assignments for KEREM:");
        result.rows.forEach(a => {
            console.log(`ID: ${a.assignment_id}, class_id: ${a.class_id}, sinif_adi: ${a.sinif_adi}, kitap: ${a.kitap_adi}`);
        });

        console.log("\n\nClass assignments (where class_id is not null):");
        const classAssignments = result.rows.filter(a => a.class_id !== null);
        console.log(classAssignments);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        process.exit();
    }
}

checkUser4Assignments();
