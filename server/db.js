import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Open the database
const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Wrapper to make sqlite3 behave like pg (Promises + result.rows)
export default {
    query: (text, params = []) => {
        return new Promise((resolve, reject) => {
            // Check if it's a SELECT or INSERT/UPDATE with RETURNING
            // SQLite 'all' works for SELECT and INSERT ... RETURNING

            // Log queries for debugging
            // console.log('Query:', text, params);

            db.all(text, params, function (err, rows) {
                if (err) {
                    return reject(err);
                }
                // Simulate pg result object
                resolve({
                    rows: rows,
                    rowCount: rows.length, // approximation
                    // For pure INSERT/UPDATE without returning, rows might be empty, but usage in index.js often expects rows for SELECT
                });
            });
        });
    }
};
