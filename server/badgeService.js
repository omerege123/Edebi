import db from './db.js';

const BadgeRules = [
    {
        name: 'İlk Kıvılcım',
        check: async (userId) => {
            const res = await db.query("SELECT COUNT(*) as count FROM quotes WHERE user_id = ?", [userId]);
            return res.rows[0].count >= 1;
        }
    },
    {
        name: 'Sayfalar Arasında',
        check: async (userId) => {
            const res = await db.query("SELECT COUNT(DISTINCT DATE(paylasim_tarihi)) as count FROM quotes WHERE user_id = ?", [userId]);
            return res.rows[0].count >= 3;
        }
    },
    {
        name: 'Okur Yolculuğu',
        check: async (userId) => {
            const res = await db.query("SELECT COUNT(DISTINCT book_id) as count FROM quotes WHERE user_id = ? AND durum = 'onaylandi'", [userId]);
            return res.rows[0].count >= 3;
        }
    },
    {
        name: 'Güçlü Alıntı',
        check: async (userId) => {
            const res = await db.query(`
                SELECT 1 FROM quote_likes 
                WHERE quote_id IN (SELECT quote_id FROM quotes WHERE user_id = ?) 
                GROUP BY quote_id HAVING COUNT(*) >= 3
            `, [userId]);
            return res.rows.length > 0;
        }
    },
    {
        name: 'Yorum Ustası',
        check: async (userId) => {
            const res = await db.query("SELECT COUNT(*) as count FROM quote_comments WHERE user_id = ?", [userId]);
            return res.rows[0].count >= 5;
        }
    },
    {
        name: 'Tür Kaşifi',
        check: async (userId) => {
            const res = await db.query(`
                SELECT COUNT(DISTINCT b.tur) as count 
                FROM quotes q 
                JOIN books b ON q.book_id = b.book_id 
                WHERE q.user_id = ? AND q.durum = 'onaylandi'
            `, [userId]);
            return res.rows[0].count >= 3;
        }
    },
    {
        name: 'Edebi Etkileşimci',
        check: async (userId) => {
            const res = await db.query("SELECT COUNT(*) as count FROM quote_comments WHERE user_id = ? AND parent_comment_id IS NOT NULL", [userId]);
            return res.rows[0].count >= 1;
        }
    },
    {
        name: 'Satır Avcısı',
        check: async (userId) => {
            const res = await db.query("SELECT COUNT(*) as count FROM quotes WHERE user_id = ? AND is_nitelikli = 1", [userId]);
            return res.rows[0].count >= 1;
        }
    }
];

export const checkAndGrantBadges = async (userId) => {
    if (!userId) return false;
    let anyNew = false;
    try {
        for (const rule of BadgeRules) {
            const earned = await db.query(`
                SELECT * FROM user_badges ub 
                JOIN badges b ON ub.badge_id = b.badge_id 
                WHERE ub.user_id = ? AND b.rozet_adi = ?
            `, [userId, rule.name]);

            if (earned.rows.length === 0) {
                const passed = await rule.check(userId);
                if (passed) {
                    const badgeRes = await db.query("SELECT * FROM badges WHERE rozet_adi = ?", [rule.name]);
                    if (badgeRes.rows.length > 0) {
                        const badge = badgeRes.rows[0];
                        await db.query("INSERT INTO user_badges (user_id, badge_id, is_seen) VALUES (?, ?, 0)", [userId, badge.badge_id]);
                        console.log(`Badge Granted: ${rule.name} to User ID: ${userId}`);
                        anyNew = true;
                    }
                }
            }
        }
    } catch (err) {
        console.error('Badge Service Error:', err);
    }
    return anyNew;
};

export const getUnseenBadges = async (userId) => {
    try {
        // Fetch unseen badges
        const unseen = await db.query(`
            SELECT b.* FROM user_badges ub
            JOIN badges b ON ub.badge_id = b.badge_id
            WHERE ub.user_id = ? AND ub.is_seen = 0
        `, [userId]);

        if (unseen.rows.length > 0) {
            // Mark as seen
            await db.query("UPDATE user_badges SET is_seen = 1 WHERE user_id = ? AND is_seen = 0", [userId]);
            return unseen.rows;
        }
    } catch (err) {
        console.error('Error in getUnseenBadges:', err);
    }
    return [];
};

export default { checkAndGrantBadges, getUnseenBadges };
