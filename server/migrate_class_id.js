import db from './db.js';

async function migrate() {
    try {
        console.log('Starting migration: adding class_id to assignments...');

        // Check if class_id already exists to avoid errors
        const tableInfo = await db.query("PRAGMA table_info(assignments)");
        const hasClassId = tableInfo.rows.some(column => column.name === 'class_id');

        if (hasClassId) {
            console.log('class_id already exists in assignments table.');
        } else {
            await db.query("ALTER TABLE assignments ADD COLUMN class_id INTEGER REFERENCES classes(class_id)");
            console.log('Successfully added class_id to assignments table.');
        }

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit();
    }
}

migrate();
