import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../server/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
    try {
        console.log('Reading schema...');
        const schema = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf8');

        console.log('Reading seed data...');
        const seed = fs.readFileSync(path.join(__dirname, '../database/seed.sql'), 'utf8');

        console.log('Dropping existing tables (cascade)...');
        await db.query(`
            DROP TABLE IF EXISTS activity_log CASCADE;
            DROP TABLE IF EXISTS teacher_feedback CASCADE;
            DROP TABLE IF EXISTS book_recommendations CASCADE;
            DROP TABLE IF EXISTS task_participation CASCADE;
            DROP TABLE IF EXISTS reading_tasks CASCADE;
            DROP TABLE IF EXISTS user_badges CASCADE;
            DROP TABLE IF EXISTS badges CASCADE;
            DROP TABLE IF EXISTS quote_tags CASCADE;
            DROP TABLE IF EXISTS tags CASCADE;
            DROP TABLE IF EXISTS quote_comments CASCADE;
            DROP TABLE IF EXISTS quotes CASCADE;
            DROP TABLE IF EXISTS books CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
        `);

        console.log('Applying schema...');
        await db.query(schema);

        console.log('Applying seed data...');
        await db.query(seed);

        console.log('Database setup complete!');
        process.exit(0);
    } catch (err) {
        console.error('Error setting up database:', err);
        process.exit(1);
    }
}

setupDatabase();
