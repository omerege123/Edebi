import db from './db.js';

async function check() {
    const res = await db.query("SELECT * FROM badges WHERE rozet_adi LIKE '%Satır%'");
    console.log(JSON.stringify(res.rows, null, 2));
}

check();
