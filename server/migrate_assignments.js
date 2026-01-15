import db from './db.js';

async function migrate() {
    try {
        console.log("Starting migration...");

        // 1. Begin Transaction
        await db.query("BEGIN TRANSACTION");

        // 2. Rename old table
        await db.query("ALTER TABLE assignments RENAME TO assignments_old");

        // 3. Create new table with updated CHECK constraint
        await db.query(`
            CREATE TABLE assignments (
                assignment_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                book_id INTEGER NOT NULL,
                assigned_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                due_date DATETIME,
                status TEXT CHECK(status IN ('assigned', 'completed', 'submitted')) DEFAULT 'assigned',
                summary_text TEXT,
                feedback TEXT,
                FOREIGN KEY (user_id) REFERENCES users(user_id),
                FOREIGN KEY (book_id) REFERENCES books(book_id)
            )
        `);

        // 4. Copy data
        await db.query(`
            INSERT INTO assignments (
                assignment_id, user_id, book_id, assigned_date, due_date, status, summary_text, feedback
            )
            SELECT 
                assignment_id, user_id, book_id, assigned_date, due_date, status, summary_text, feedback
            FROM assignments_old
        `);

        // 5. Drop old table
        await db.query("DROP TABLE assignments_old");

        // 6. Commit
        await db.query("COMMIT");

        console.log("Migration successful!");
    } catch (err) {
        console.error("Migration failed, rolling back...", err);
        try {
            await db.query("ROLLBACK");
        } catch (rollbackErr) {
            console.error("Rollback failed:", rollbackErr);
        }
    } finally {
        process.exit();
    }
}

migrate();
