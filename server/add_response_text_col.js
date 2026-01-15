import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../database.sqlite');

const db = new sqlite3.Database(dbPath);

const sql = `ALTER TABLE student_task_completions ADD COLUMN response_text TEXT;`;

db.serialize(() => {
    db.run(sql, (err) => {
        if (err) {
            console.log("Info:", err.message);
        } else {
            console.log("Column response_text added successfully.");
        }
    });
});

db.close();
