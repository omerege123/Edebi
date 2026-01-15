import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../database.sqlite');

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run("ALTER TABLE user_badges ADD COLUMN is_seen INTEGER DEFAULT 0", (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('Column is_seen already exists.');
            } else {
                console.error('Error adding column:', err.message);
            }
        } else {
            console.log('Column is_seen added successfully.');
        }
    });
});

db.close();
