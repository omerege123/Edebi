import sqlite3 from 'sqlite3';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const sqliteDb = new sqlite3.Database('database.sqlite');
const pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrateData() {
    const pgClient = await pgPool.connect();

    try {
        console.log('--- REFINED DATA MIGRATION STARTED ---');

        const tables = [
            'users',
            'books',
            'classes',
            'class_enrollments',
            'quotes',
            'quote_likes',
            'quote_comments',
            'assignments',
            'badges',
            'user_badges',
            'weekly_tasks',
            'student_task_completions'
        ];

        for (const table of tables) {
            console.log(`\nMigrating table: ${table}...`);

            // 1. Get PG table info to check columns
            const pgColsRes = await pgClient.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = $1
            `, [table]);
            const pgCols = pgColsRes.rows.map(r => r.column_name);
            console.log(`PG Columns for ${table}: ${pgCols.join(', ')}`);

            // 2. Get data from SQLite
            const rows = await new Promise((resolve, reject) => {
                sqliteDb.all(`SELECT * FROM ${table}`, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });

            if (rows.length === 0) {
                console.log(`Table ${table} is empty, skipping.`);
                continue;
            }

            // 3. Filter SQLite columns that exist in PG
            const sqliteCols = Object.keys(rows[0]);
            const validCols = sqliteCols.filter(c => pgCols.includes(c));
            console.log(`Matching columns: ${validCols.join(', ')}`);

            if (validCols.length === 0) {
                console.log(`No matching columns for ${table}, skipping.`);
                continue;
            }

            const placeholders = validCols.map((_, i) => `$${i + 1}`).join(', ');
            const insertQuery = `INSERT INTO ${table} (${validCols.join(', ')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;

            let count = 0;
            for (const row of rows) {
                const values = validCols.map(col => row[col]);
                await pgClient.query(insertQuery, values);
                count++;
            }

            console.log(`Migrated ${count} rows for ${table}.`);

            // 4. Reset sequences
            const actualIdCol = table === 'classes' ? 'class_id' :
                (table === 'student_task_completions' ? 'completion_id' :
                    (table === 'user_badges' ? 'user_badge_id' :
                        (table === 'class_enrollments' || table === 'quote_likes' ? null : table.slice(0, -1) + '_id')));

            if (actualIdCol) {
                try {
                    const seqRes = await pgClient.query(`SELECT pg_get_serial_sequence($1, $2) as seq`, [table, actualIdCol]);
                    const seqName = seqRes.rows[0]?.seq;
                    if (seqName) {
                        await pgClient.query(`SELECT setval($1, (SELECT MAX(${actualIdCol}) FROM ${table}))`, [seqName]);
                        console.log(`Sequence reset for ${table}.`);
                    }
                } catch (e) {
                    console.warn(`Failed to reset sequence for ${table}: ${e.message}`);
                }
            }
        }

        console.log('\n--- REFINED DATA MIGRATION COMPLETED SUCCESSFULLY ---');
    } catch (err) {
        console.error('Migration Error:', err);
    } finally {
        pgClient.release();
        await pgPool.end();
        sqliteDb.close();
    }
}

migrateData();
