import db from './server/db.js';

async function testClassAssignment() {
    try {
        // Test: Create a class assignment
        const class_id = 1; // Assuming class 1 exists
        const book_id = 1;  // Assuming book 1 exists
        const due_date = '2026-01-20';

        console.log("Testing class assignment creation...");
        console.log("Input data:", { class_id, book_id, due_date });

        // Get students in the class
        const students = await db.query("SELECT student_id FROM class_enrollments WHERE class_id = ?", [class_id]);
        console.log("\nStudents in class:", students.rows);

        if (students.rows.length === 0) {
            console.log("No students in this class!");
            process.exit();
        }

        // Create assignments
        const studentsRows = students.rows;
        const newValues = [];
        const newPlaceholders = [];
        studentsRows.forEach((s) => {
            newPlaceholders.push(`(?, ?, ?, ?, ?, ?, ?)`);
            newValues.push(s.student_id, book_id, due_date, 'book', null, null, class_id);
        });

        const newQuery = `INSERT INTO assignments (user_id, book_id, due_date, assignment_type, title, description, class_id) VALUES ${newPlaceholders.join(', ')}`;
        console.log("\nQuery:", newQuery);
        console.log("Values:", newValues);

        await db.query(newQuery, newValues);

        console.log("\n✅ Assignments created successfully!");

        // Verify
        const verify = await db.query("SELECT assignment_id, user_id, class_id FROM assignments WHERE class_id = ?", [class_id]);
        console.log("\nVerification - Assignments with class_id =", class_id, ":");
        console.log(JSON.stringify(verify.rows, null, 2));

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        process.exit();
    }
}

testClassAssignment();
