
import db from './db.js';
try {
    const result = await db.query("PRAGMA table_info(assignments)");
    console.log(JSON.stringify(result.rows, null, 2));
} catch (e) {
    console.error(e);
} finally {
    process.exit();
}
