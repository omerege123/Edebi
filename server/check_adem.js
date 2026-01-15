
import db from './db.js';

async function checkAdem() {
    try {
        const result = await db.query("SELECT * FROM users WHERE kullanici_adi = 'adem'");
        console.log('User adem data:', JSON.stringify(result.rows, null, 2));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

checkAdem();
