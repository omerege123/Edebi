import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../database.sqlite');

const db = new sqlite3.Database(dbPath);

const schema = `
CREATE TABLE IF NOT EXISTS weekly_tasks (
    task_id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(class_id)
);

CREATE TABLE IF NOT EXISTS student_task_completions (
    completion_id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES weekly_tasks(task_id),
    FOREIGN KEY (student_id) REFERENCES users(user_id),
    UNIQUE(task_id, student_id)
);
`;

db.serialize(() => {
    db.exec(schema, (err) => {
        if (err) {
            console.error('Error migrating weekly tasks:', err);
        } else {
            console.log('Weekly tasks tables created successfully.');
        }
    });
});

db.close();
