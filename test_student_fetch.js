import db from './server/db.js';

async function testStudentAssignments() {
    try {
        const userId = 1; // Test with user 1

        console.log("Testing student assignments fetch for user_id:", userId);

        // Simulate the backend query
        let queryStr = `
            SELECT a.*, b.kitap_adi, b.yazar, c.sinif_adi
            FROM assignments a
            LEFT JOIN books b ON a.book_id = b.book_id
            LEFT JOIN classes c ON a.class_id = c.class_id
            WHERE a.user_id = ?
        `;
        const params = [userId];
        queryStr += " ORDER BY a.due_date ASC";

        console.log("\nQuery:", queryStr);
        console.log("Params:", params);

        const result = await db.query(queryStr, params);

        console.log("\n📊 Total assignments:", result.rows.length);
        console.log("\n📋 Assignments breakdown:");

        const classAssignments = result.rows.filter(a => a.class_id !== null);
        const individualAssignments = result.rows.filter(a => a.class_id === null);

        console.log("  🏫 Class assignments:", classAssignments.length);
        console.log("  👤 Individual assignments:", individualAssignments.length);

        console.log("\n🏫 Class Assignments:");
        classAssignments.forEach(a => {
            console.log(`  - ID: ${a.assignment_id}, Class: ${a.sinif_adi} (${a.class_id}), Book: ${a.kitap_adi}`);
        });

        console.log("\n👤 Individual Assignments:");
        individualAssignments.slice(0, 5).forEach(a => {
            console.log(`  - ID: ${a.assignment_id}, Book: ${a.kitap_adi}`);
        });

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        process.exit();
    }
}

testStudentAssignments();
