
import db from './db.js';

async function addScoreColumn() {
    try {
        await db.query("ALTER TABLE assignments ADD COLUMN score INTEGER");
        console.log('Score column added successfully to assignments table.');
    } catch (err) {
        if (err.message.includes('duplicate column name')) {
            console.log('Score column already exists.');
        } else {
            console.error('Error adding column:', err);
        }
    } finally {
        process.exit();
    }
}

addScoreColumn();
