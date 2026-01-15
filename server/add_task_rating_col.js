import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../database.sqlite');

const db = new sqlite3.Database(dbPath);

const sql = `ALTER TABLE student_task_completions ADD COLUMN rating INTEGER;`;

db.serialize(() => {
    db.run(sql, (err) => {
        if (err) {
            console.log("Info (might already exist):", err.message);
        } else {
            console.log("Column 'rating' added successfully.");
        }
    });
});

db.close();
