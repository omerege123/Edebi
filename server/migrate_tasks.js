
import db from './db.js';

async function migrate() {
    try {
        console.log('Starting migration...');

        // 1. Create a new table with the new schema
        await db.query(`
            CREATE TABLE assignments_new (
                assignment_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                book_id INTEGER, -- MADE NULLABLE
                assignment_type TEXT DEFAULT 'book',
                title TEXT,
                description TEXT,
                assigned_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                due_date DATETIME,
                status TEXT CHECK(status IN ('assigned', 'submitted', 'approved', 'rejected', 'completed')) DEFAULT 'assigned',
                summary_text TEXT,
                feedback TEXT,
                score INTEGER,
                FOREIGN KEY (user_id) REFERENCES users(user_id),
                FOREIGN KEY (book_id) REFERENCES books(book_id)
            )
        `);

        // 2. Copy data from old table to new table
        // Note: We need to check which columns exist in the current table to avoid errors
        const cols = await db.query("PRAGMA table_info(assignments)");
        const colNames = cols.rows.map(c => c.name);

        const commonCols = ['assignment_id', 'user_id', 'book_id', 'assigned_date', 'due_date', 'status', 'summary_text', 'feedback', 'score']
            .filter(c => colNames.includes(c));

        const colsStr = commonCols.join(', ');
        await db.query(`INSERT INTO assignments_new (${colsStr}) SELECT ${colsStr} FROM assignments`);

        // 3. Drop old table and rename new one
        await db.query("DROP TABLE assignments");
        await db.query("ALTER TABLE assignments_new RENAME TO assignments");

        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit();
    }
}

migrate();
