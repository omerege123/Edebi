import db from './server/db.js';

async function createTestClassAssignment() {
    try {
        console.log("Creating a test class assignment...\n");

        // Get class 1 students
        const students = await db.query("SELECT student_id FROM class_enrollments WHERE class_id = 1");
        console.log("Students in class 1:", students.rows);

        // Create assignment for each student with class_id
        for (const s of students.rows) {
            await db.query(`
                INSERT INTO assignments (user_id, book_id, due_date, assignment_type, title, description, class_id)
                VALUES (?, 1, '2026-01-25', 'writing', 'Test Sınıf Ödevi', 'Bu bir test serbest ödevidir', 1)
            `, [s.student_id]);
        }

        console.log("✅ Test class assignments created!");

        // Verify
        const verify = await db.query(`
            SELECT a.assignment_id, a.user_id, a.class_id, a.title, a.assignment_type, c.sinif_adi
            FROM assignments a
            LEFT JOIN classes c ON a.class_id = c.class_id
            WHERE a.title = 'Test Sınıf Ödevi'
        `);
        console.log("\nCreated assignments:");
        console.log(JSON.stringify(verify.rows, null, 2));

    } catch (err) {
        console.error("Error:", err);
    } finally {
        process.exit();
    }
}

createTestClassAssignment();
