import db from './db.js';

async function testUpdate() {
    try {
        const id = 1;
        const text = "Test summary";
        const query = "UPDATE assignments SET summary_text = ?, status = 'submitted' WHERE assignment_id = ? RETURNING *";
        console.log("Testing Query:", query);
        const result = await db.query(query, [text, id]);
        console.log("Result:", JSON.stringify(result, null, 2));
    } catch (err) {
        console.error("Test Query Error:", err);
    } finally {
        process.exit();
    }
}

testUpdate();
