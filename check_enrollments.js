import db from './server/db.js';

async function checkEnrollments() {
    try {
        console.log("Checking class enrollments...\n");

        // Get all enrollments
        const enrollments = await db.query("SELECT * FROM class_enrollments");
        console.log("📋 All enrollments:");
        console.log(JSON.stringify(enrollments.rows, null, 2));

        // Get all classes
        const classes = await db.query("SELECT * FROM classes");
        console.log("\n🏫 All classes:");
        console.log(JSON.stringify(classes.rows, null, 2));

        // Get all students
        const students = await db.query("SELECT user_id, ad, soyad FROM users WHERE rol = 'ogrenci'");
        console.log("\n👥 All students:");
        console.log(JSON.stringify(students.rows, null, 2));

        // Check which students have class assignments
        const classAssignments = await db.query(`
            SELECT a.assignment_id, a.user_id, a.class_id, u.ad, u.soyad, c.sinif_adi
            FROM assignments a
            JOIN users u ON a.user_id = u.user_id
            LEFT JOIN classes c ON a.class_id = c.class_id
            WHERE a.class_id IS NOT NULL
        `);
        console.log("\n📚 Class assignments:");
        console.log(JSON.stringify(classAssignments.rows, null, 2));

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        process.exit();
    }
}

checkEnrollments();
