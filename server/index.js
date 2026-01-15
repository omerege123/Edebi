import express from 'express';
import cors from 'cors';
import db from './db.js';
import { checkAndGrantBadges, getUnseenBadges } from './badgeService.js';

const app = express();
export { app };
const port = 3000;

app.use(cors());
app.use(express.json());

const router = express.Router();

// Request logging middleware
router.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log('Body:', req.body);
    }
    next();
});

// Test Endpoint
router.get('/health', async (req, res) => {
    try {
        const result = await db.query('SELECT CURRENT_DATE as now');
        res.json({
            status: 'ok',
            message: 'Database connected successfully',
            time: result.rows[0].now
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: 'error',
            message: 'Database connection failed',
            error: err.message
        });
    }
});

// Teacher Dashboard Stats
router.get('/dashboard/teacher/stats', async (req, res) => {
    const { class_id } = req.query;
    try {
        let studentCountQuery = "SELECT COUNT(*) as count FROM users WHERE rol = 'ogrenci'";
        let studentSummaryQuery = `
            SELECT 
                u.ad, 
                u.soyad, 
                COUNT(DISTINCT ub.badge_id) as rozet_sayisi, 
                MAX(ub.kazanim_tarihi) as son_rozet_tarihi,
                (SELECT COUNT(*) FROM quotes WHERE user_id = u.user_id AND durum = 'onaylandi') as onayli_alinti
            FROM users u
            LEFT JOIN user_badges ub ON u.user_id = ub.user_id
            WHERE u.rol = 'ogrenci'
        `;
        let params = [];

        if (class_id && class_id !== 'all') {
            studentCountQuery = "SELECT COUNT(*) as count FROM class_enrollments WHERE class_id = ?";
            studentSummaryQuery = `
                SELECT 
                    u.ad, 
                    u.soyad, 
                    COUNT(DISTINCT ub.badge_id) as rozet_sayisi, 
                    MAX(ub.kazanim_tarihi) as son_rozet_tarihi,
                    (SELECT COUNT(*) FROM quotes WHERE user_id = u.user_id AND durum = 'onaylandi') as onayli_alinti
                FROM class_enrollments ce
                JOIN users u ON ce.student_id = u.user_id
                LEFT JOIN user_badges ub ON u.user_id = ub.user_id
                WHERE ce.class_id = ?
            `;
            params.push(class_id);
        }

        const studentCount = await db.query(studentCountQuery, params);

        // Count both pending quotes and submitted summaries
        // For simplicity, pending items are global or could be filtered by class if we join assignments with class_enrollments
        // Let's filter pending items by class too if class_id is provided
        let pendingQuotesQuery = "SELECT COUNT(*) as count FROM quotes WHERE durum = 'beklemede'";
        let pendingSummariesQuery = "SELECT COUNT(*) as count FROM assignments WHERE status = 'submitted'";
        let approvedCountQuery = "SELECT COUNT(*) as count FROM quotes WHERE durum = 'onaylandi'";
        let totalQuotesQuery = "SELECT COUNT(*) as count FROM quotes";

        if (class_id && class_id !== 'all') {
            pendingQuotesQuery = "SELECT COUNT(*) as count FROM quotes q JOIN class_enrollments ce ON q.user_id = ce.student_id WHERE q.durum = 'beklemede' AND ce.class_id = ?";
            pendingSummariesQuery = "SELECT COUNT(*) as count FROM assignments a JOIN class_enrollments ce ON a.user_id = ce.student_id WHERE a.status = 'submitted' AND ce.class_id = ?";
            approvedCountQuery = "SELECT COUNT(*) as count FROM quotes q JOIN class_enrollments ce ON q.user_id = ce.student_id WHERE q.durum = 'onaylandi' AND ce.class_id = ?";
            totalQuotesQuery = "SELECT COUNT(*) as count FROM quotes q JOIN class_enrollments ce ON q.user_id = ce.student_id WHERE ce.class_id = ?";
        }

        const pendingQuotes = await db.query(pendingQuotesQuery, params);
        const pendingSummaries = await db.query(pendingSummariesQuery, params);
        const approvedCount = await db.query(approvedCountQuery, params);
        const totalQuotes = await db.query(totalQuotesQuery, params);

        const pendingTotal = parseInt(pendingQuotes.rows[0].count) + parseInt(pendingSummaries.rows[0].count);

        const studentSummary = await db.query(
            studentSummaryQuery + " GROUP BY u.user_id ORDER BY rozet_sayisi DESC",
            params
        );

        const total = parseInt(totalQuotes.rows[0].count);
        const approved = parseInt(approvedCount.rows[0].count);
        const completionRate = total > 0 ? Math.round((approved / total) * 100) : 0;

        res.json({
            studentCount: parseInt(studentCount.rows[0].count),
            pendingCount: pendingTotal,
            completionRate: completionRate,
            studentSummary: studentSummary.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Pending Quotes
router.get('/quotes/pending', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT q.*, u.ad || ' ' || u.soyad as ogrenci_adi, b.kitap_adi 
            FROM quotes q
            JOIN users u ON q.user_id = u.user_id
            JOIN books b ON q.book_id = b.book_id
            WHERE q.durum = 'beklemede'
            ORDER BY q.paylasim_tarihi DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Approve/Reject Quote
router.put('/quotes/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'onaylandi' or 'reddedildi'

    try {
        // SQLite supports RETURNING in newer versions. 
        // If it fails, we might need a separate SELECT, but we'll try RETURNING first.
        const result = await db.query(
            "UPDATE quotes SET durum = ? WHERE quote_id = ? RETURNING *",
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Quote not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Toggle Nitelikli (Qualified) status
router.post('/quotes/:id/toggle-nitelikli', async (req, res) => {
    const { id } = req.params;
    try {
        const quoteRes = await db.query("SELECT is_nitelikli, user_id FROM quotes WHERE quote_id = ?", [id]);
        if (quoteRes.rows.length === 0) {
            return res.status(404).json({ error: 'Quote not found' });
        }

        const quote = quoteRes.rows[0];
        const newValue = quote.is_nitelikli ? 0 : 1;
        await db.query("UPDATE quotes SET is_nitelikli = ? WHERE quote_id = ?", [newValue, id]);

        // Trigger badge check only (don't mark as seen, student will see it later)
        if (newValue === 1) {
            await checkAndGrantBadges(quote.user_id);
        }

        res.json({
            success: true,
            is_nitelikli: newValue
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Auth Routes
router.post('/register', async (req, res) => {
    const { ad, soyad, kullanici_adi, e_posta, parola, rol } = req.body;
    try {
        // Check if user exists
        const checkUser = await db.query(
            "SELECT * FROM users WHERE kullanici_adi = ? OR e_posta = ?",
            [kullanici_adi, e_posta]
        );

        if (checkUser.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Kullanıcı adı veya e-posta zaten kayıtlı.'
            });
        }

        // Insert new user
        // WARNING: Storing passwords as plain text/simple hash for this demo. 
        // In production, use bcrypt/argon2.
        const newUser = await db.query(
            `INSERT INTO users (ad, soyad, kullanici_adi, e_posta, parola_hash, rol) 
             VALUES (?, ?, ?, ?, ?, ?) RETURNING user_id, ad, soyad, rol`,
            [ad, soyad, kullanici_adi, e_posta, parola, rol]
        );

        res.json({
            success: true,
            message: 'Kayıt başarılı!',
            user: newUser.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password, rol } = req.body;

    try {
        console.log('Login attempt:', { username, rol });
        const result = await db.query(
            "SELECT * FROM users WHERE (kullanici_adi = ? OR e_posta = ?) AND rol = ?",
            [username, username, rol]
        );
        console.log('Login query result rows:', result.rows.length);

        if (result.rows.length === 0) {
            // Check if user exists at all without role
            const userCheck = await db.query("SELECT * FROM users WHERE kullanici_adi = ? OR e_posta = ?", [username, username]);
            console.log('User exists check (any role):', userCheck.rows.length);
            if (userCheck.rows.length > 0) {
                console.log('Actual roles found for this user:', userCheck.rows.map(u => u.rol));
            }
            return res.status(401).json({ success: false, message: 'Kullanıcı bulunamadı veya rol hatalı.' });
        }

        const user = result.rows[0];

        // Check password
        if (password !== user.parola_hash) {
            return res.status(401).json({ success: false, message: 'Hatalı parola.' });
        }

        res.json({
            success: true,
            user: {
                id: user.user_id,
                username: user.kullanici_adi,
                rol: user.rol,
                name: `${user.ad} ${user.soyad}`
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
});

// --- Class Management Endpoints ---

// Create Class (Teacher)
router.post('/classes', async (req, res) => {
    const { teacher_id, sinif_adi } = req.body;
    if (!teacher_id || !sinif_adi) return res.status(400).json({ error: 'Eksik bilgi.' });

    try {
        // Generate a random 6-character code
        const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing chars like 0/O, 1/I
        let sinif_kodu = '';
        for (let i = 0; i < 6; i++) {
            sinif_kodu += charset.charAt(Math.floor(Math.random() * charset.length));
        }

        const result = await db.query(
            "INSERT INTO classes (teacher_id, sinif_adi, sinif_kodu) VALUES (?, ?, ?) RETURNING *",
            [teacher_id, sinif_adi, sinif_kodu]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete Class (Teacher)
router.delete('/classes/:id', async (req, res) => {
    const { id } = req.params;
    const { teacher_id } = req.body;

    try {
        // Verify ownership
        const classRes = await db.query("SELECT teacher_id FROM classes WHERE class_id = ?", [id]);
        if (classRes.rows.length === 0) return res.status(404).json({ error: 'Sınıf bulunamadı.' });
        if (classRes.rows[0].teacher_id !== parseInt(teacher_id)) return res.status(403).json({ error: 'Bu sınıfı silme yetkiniz yok.' });

        await db.query("DELETE FROM class_enrollments WHERE class_id = ?", [id]);
        await db.query("DELETE FROM classes WHERE class_id = ?", [id]);
        res.json({ success: true, message: 'Sınıf silindi.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// List Classes for a Teacher
router.get('/classes/teacher/:teacherId', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT c.*, (SELECT COUNT(*) FROM class_enrollments WHERE class_id = c.class_id) as ogrenci_sayisi
            FROM classes c
            WHERE c.teacher_id = ?
            ORDER BY c.created_at DESC
        `, [req.params.teacherId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Join Class (Student)
router.post('/classes/join', async (req, res) => {
    const { student_id, sinif_kodu } = req.body;
    if (!student_id || !sinif_kodu) return res.status(400).json({ error: 'Eksik bilgi.' });

    try {
        // Find class by code
        const classRes = await db.query("SELECT * FROM classes WHERE sinif_kodu = ?", [sinif_kodu.toUpperCase()]);
        if (classRes.rows.length === 0) {
            return res.status(404).json({ error: 'Hatalı sınıf kodu.' });
        }

        const classId = classRes.rows[0].class_id;

        // Check if already enrolled
        const enrollCheck = await db.query("SELECT * FROM class_enrollments WHERE class_id = ? AND student_id = ?", [classId, student_id]);
        if (enrollCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Bu sınıfa zaten katılmışsınız.' });
        }

        await db.query("INSERT INTO class_enrollments (class_id, student_id) VALUES (?, ?)", [classId, student_id]);
        res.json({ success: true, sinif_adi: classRes.rows[0].sinif_adi });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// List Students in a Class
router.get('/classes/:classId/students', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT u.user_id, u.ad, u.soyad, u.kullanici_adi, u.e_posta, ce.enrolled_at
            FROM class_enrollments ce
            JOIN users u ON ce.student_id = u.user_id
            WHERE ce.class_id = ?
            ORDER BY u.ad, u.soyad
        `, [req.params.classId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Remove Student from Class (Teacher)
router.delete('/classes/:classId/students/:studentId', async (req, res) => {
    const { classId, studentId } = req.params;
    const { teacher_id } = req.body;

    try {
        // Verify ownership
        const classRes = await db.query("SELECT teacher_id FROM classes WHERE class_id = ?", [classId]);
        if (classRes.rows.length === 0) return res.status(404).json({ error: 'Sınıf bulunamadı.' });
        if (classRes.rows[0].teacher_id !== parseInt(teacher_id)) return res.status(403).json({ error: 'Yetkiniz yok.' });

        await db.query("DELETE FROM class_enrollments WHERE class_id = ? AND student_id = ?", [classId, studentId]);
        res.json({ success: true, message: 'Öğrenci sınıftan çıkarıldı.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Leave Class (Student)
router.post('/classes/leave', async (req, res) => {
    const { class_id, student_id } = req.body;
    try {
        await db.query("DELETE FROM class_enrollments WHERE class_id = ? AND student_id = ?", [class_id, student_id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get student's enrolled classes
router.get('/classes/student/:studentId', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT c.*, u.ad || ' ' || u.soyad as hoca_adi
            FROM class_enrollments ce
            JOIN classes c ON ce.class_id = c.class_id
            JOIN users u ON c.teacher_id = u.user_id
            WHERE ce.student_id = ?
        `, [req.params.studentId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- End Class Management Endpoints ---

// Teacher: Get all assignments for a specific class
router.get('/teacher/class/:classId/assignments', async (req, res) => {
    try {
        const { classId } = req.params;
        const result = await db.query(`
            SELECT a.*, u.ad, u.soyad, u.kullanici_adi, b.kitap_adi, b.yazar
            FROM assignments a
            JOIN users u ON a.user_id = u.user_id
            LEFT JOIN books b ON a.book_id = b.book_id
            WHERE a.class_id = ?
            ORDER BY a.assigned_date DESC
        `, [classId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Books Endpoint
router.get('/books', async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM books ORDER BY kitap_adi");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Students Endpoint
router.get('/students', async (req, res) => {
    try {
        const result = await db.query("SELECT user_id, ad, soyad FROM users WHERE rol = 'ogrenci' ORDER BY ad, soyad");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create Assignment Endpoint
router.post('/assignments', async (req, res) => {
    let { user_id, book_id, book_name, due_date, assignment_type = 'book', title, description } = req.body;

    try {
        if (assignment_type === 'book') {
            // If no book_id provided but book_name is, find or create the book
            if (!book_id && book_name) {
                const existingBook = await db.query(
                    "SELECT book_id FROM books WHERE LOWER(kitap_adi) = LOWER(?)",
                    [book_name.trim()]
                );
                if (existingBook.rows.length > 0) {
                    book_id = existingBook.rows[0].book_id;
                } else {
                    const newBook = await db.query(
                        "INSERT INTO books (kitap_adi, yazar) VALUES (?, 'Bilinmiyor') RETURNING book_id",
                        [book_name.trim()]
                    );
                    book_id = newBook.rows[0].book_id;
                }
            }
            if (!book_id) return res.status(400).json({ error: 'Kitap bilgisi eksik.' });
        }

        const result = await db.query(
            "INSERT INTO assignments (user_id, book_id, due_date, assignment_type, title, description) VALUES (?, ?, ?, ?, ?, ?) RETURNING *",
            [user_id, book_id || null, due_date, assignment_type, title || null, description || null]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create Class Assignment Endpoint
router.post('/assignments/class', async (req, res) => {
    let { class_id, book_id, book_name, due_date, assignment_type = 'book', title, description } = req.body;

    // Handle empty strings from frontend
    if (book_id === '') book_id = null;

    try {
        if (assignment_type === 'book') {
            if (!book_id && book_name) {
                const existingBook = await db.query("SELECT book_id FROM books WHERE LOWER(kitap_adi) = LOWER(?)", [book_name.trim()]);
                if (existingBook.rows.length > 0) book_id = existingBook.rows[0].book_id;
                else {
                    const newBook = await db.query("INSERT INTO books (kitap_adi, yazar) VALUES (?, 'Bilinmiyor') RETURNING book_id", [book_name.trim()]);
                    book_id = newBook.rows[0].book_id;
                }
            }
            if (!book_id) return res.status(400).json({ error: 'Kitap bilgisi eksik.' });
        }

        const students = await db.query("SELECT student_id FROM class_enrollments WHERE class_id = ?", [class_id]);
        if (students.rows.length === 0) return res.status(400).json({ error: 'Sınıfta öğrenci yok.' });

        const studentsRows = students.rows;
        const newValues = [];
        const newPlaceholders = [];
        studentsRows.forEach((s) => {
            newPlaceholders.push(`(?, ?, ?, ?, ?, ?, ?)`);
            newValues.push(s.student_id, book_id || null, due_date, assignment_type, title || null, description || null, class_id);
        });

        const newQuery = `INSERT INTO assignments (user_id, book_id, due_date, assignment_type, title, description, class_id) VALUES ${newPlaceholders.join(', ')}`;
        await db.query(newQuery, newValues);

        res.json({ success: true, count: students.rows.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Student Assignments Endpoint
router.get('/assignments/student/:userId', async (req, res) => {
    const { userId } = req.params;
    const { class_id } = req.query;
    try {
        let queryStr = `
            SELECT a.*, 
                   a.class_id as assignment_class_id,
                   (CASE 
                       WHEN a.class_id IS NOT NULL THEN 'class' 
                       ELSE 'individual' 
                   END) as assignment_type,
                   b.kitap_adi, b.yazar, c.sinif_adi
            FROM assignments a
            LEFT JOIN books b ON a.book_id = b.book_id
            LEFT JOIN classes c ON a.class_id = c.class_id
            WHERE a.user_id = ?
        `;
        const params = [userId];

        if (class_id) {
            if (class_id === 'null') {
                queryStr += " AND a.class_id IS NULL";
            } else {
                queryStr += " AND a.class_id = ?";
                params.push(class_id);
            }
        }

        queryStr += " ORDER BY a.due_date ASC";

        const result = await db.query(queryStr, params);

        // Debug: Log class assignments
        const classAssignments = result.rows.filter(a => a.class_id !== null);
        if (classAssignments.length > 0) {
            console.log('📚 [API] Class assignments found:', classAssignments.map(a => ({
                id: a.assignment_id,
                class_id: a.class_id,
                sinif_adi: a.sinif_adi
            })));
        }

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Submit Summary for Assignment
router.post('/assignments/:id/summary', async (req, res) => {
    const { id } = req.params;
    const { summary_text } = req.body;
    const assId = parseInt(id);

    try {
        // Update the assignment
        await db.query(
            "UPDATE assignments SET summary_text = ?, status = 'submitted' WHERE assignment_id = ?",
            [summary_text, assId]
        );

        // Fetch the updated row to confirm
        const result = await db.query("SELECT * FROM assignments WHERE assignment_id = ?", [assId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Teacher: Get Pending Summaries (Assignments)
router.get('/teacher/pending-summaries', async (req, res) => {
    const { class_id } = req.query;
    try {
        let query = `
            SELECT a.*, u.ad || ' ' || u.soyad as ogrenci_adi, b.kitap_adi, b.yazar, c.sinif_adi
            FROM assignments a
            JOIN users u ON a.user_id = u.user_id
            LEFT JOIN books b ON a.book_id = b.book_id
            LEFT JOIN classes c ON a.class_id = c.class_id
            WHERE a.status = 'submitted'
        `;
        const params = [];

        if (class_id) {
            if (class_id === 'null') {
                query += " AND a.class_id IS NULL";
            } else if (class_id !== 'all') {
                query += " AND a.class_id = ?";
                params.push(class_id);
            }
        }

        query += " ORDER BY a.assigned_date DESC";
        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Teacher: Get all graded summaries (assignments with 'completed' or 'rejected' status)
router.get('/teacher/graded-summaries', async (req, res) => {
    const { class_id } = req.query;
    try {
        let query = `
            SELECT a.*, u.ad || ' ' || u.soyad as ogrenci_adi, b.kitap_adi, b.yazar, c.sinif_adi
            FROM assignments a
            JOIN users u ON a.user_id = u.user_id
            LEFT JOIN books b ON a.book_id = b.book_id
            LEFT JOIN classes c ON a.class_id = c.class_id
            WHERE (a.status = 'completed' OR a.status = 'rejected')
        `;
        const params = [];

        if (class_id) {
            if (class_id === 'null') {
                query += " AND a.class_id IS NULL";
            } else if (class_id !== 'all') {
                query += " AND a.class_id = ?";
                params.push(class_id);
            }
        }

        query += " ORDER BY a.assigned_date DESC LIMIT 50";
        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Teacher: Approve Assignment
router.post('/assignments/:id/approve', async (req, res) => {
    const { id } = req.params;
    const { score } = req.body;
    const assId = parseInt(id);
    console.log('========================================');
    console.log('🔍 APPROVE ENDPOINT CALLED');
    console.log('Assignment ID:', assId);
    console.log('Request body:', JSON.stringify(req.body));
    console.log('Score received:', score);
    console.log('Score type:', typeof score);
    console.log('========================================');
    try {
        const finalScore = score && score !== '' ? parseInt(score) : null;
        console.log('💾 Final score after processing:', finalScore);
        console.log('💾 Final score type:', typeof finalScore);

        const updateResult = await db.query(
            "UPDATE assignments SET status = 'completed', score = ? WHERE assignment_id = ?",
            [finalScore, assId]
        );
        console.log('✅ Update query executed');

        const result = await db.query(`
            SELECT a.*, u.ad || ' ' || u.soyad as ogrenci_adi, b.kitap_adi, b.yazar
            FROM assignments a
            JOIN users u ON a.user_id = u.user_id
            LEFT JOIN books b ON a.book_id = b.book_id
            WHERE a.assignment_id = ?
        `, [assId]);

        console.log('📊 Updated assignment:', JSON.stringify(result.rows[0]));
        console.log('========================================\n');
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Teacher: Reject Assignment
router.post('/assignments/:id/reject', async (req, res) => {
    const { id } = req.params;
    const { feedback } = req.body;
    const assId = parseInt(id);
    try {
        await db.query(
            "UPDATE assignments SET status = 'rejected', feedback = ? WHERE assignment_id = ?",
            [feedback, assId]
        );
        const result = await db.query("SELECT * FROM assignments WHERE assignment_id = ?", [assId]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Student Dashboard Stats Endpoint
router.get('/dashboard/student/stats/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        // Global retroactive badge check and fetch unseen
        await checkAndGrantBadges(userId);
        const newlyEarnedBadges = await getUnseenBadges(userId);

        const quotesCount = await db.query(
            "SELECT COUNT(*) as count FROM quotes WHERE user_id = ? AND durum = 'onaylandi'",
            [userId]
        );
        const booksCount = await db.query(
            "SELECT COUNT(DISTINCT book_id) as count FROM quotes WHERE user_id = ? AND durum = 'onaylandi'",
            [userId]
        );
        const badgesCount = await db.query(
            "SELECT COUNT(*) as count FROM user_badges WHERE user_id = ?",
            [userId]
        );
        const summariesCount = await db.query(
            "SELECT COUNT(*) as count FROM assignments WHERE user_id = ? AND summary_text IS NOT NULL AND summary_text != ''",
            [userId]
        );

        res.json({
            totalQuotes: Number(quotesCount.rows[0].count),
            totalBooks: Number(booksCount.rows[0].count),
            totalBadges: Number(badgesCount.rows[0].count),
            totalSummaries: Number(summariesCount.rows[0].count),
            newlyEarnedBadges: newlyEarnedBadges
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// All Badges Endpoint
router.get('/badges', async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM badges ORDER BY kategori");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// User Earned Badges Endpoint
router.get('/badges/user/:userId', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT b.*, ub.kazanim_tarihi 
            FROM user_badges ub
            JOIN badges b ON ub.badge_id = b.badge_id
            WHERE ub.user_id = ?
            ORDER BY ub.kazanim_tarihi DESC
        `, [req.params.userId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- Weekly Tasks Endpoints ---

// Get Tasks for Class
router.get('/tasks/class/:classId', async (req, res) => {
    const { classId } = req.params;
    const { student_id } = req.query; // Optional, to check completion status

    try {
        let query = `
            SELECT t.*, 
            (SELECT COUNT(*) FROM student_task_completions WHERE task_id = t.task_id) as completion_count
            FROM weekly_tasks t
            WHERE t.class_id = ?
            ORDER BY t.created_at DESC
        `;

        let params = [classId];

        if (student_id) {
            query = `
                SELECT t.*, 
                       CASE WHEN stc.completed_at IS NOT NULL THEN 1 ELSE 0 END as is_completed,
                       stc.rating
                FROM weekly_tasks t
                LEFT JOIN student_task_completions stc ON t.task_id = stc.task_id AND stc.student_id = ?
                WHERE t.class_id = ?
                ORDER BY t.created_at DESC
            `;
            params = [student_id, classId];
        }

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create Task
router.post('/tasks', async (req, res) => {
    const { class_id, content } = req.body;
    if (!class_id || !content) return res.status(400).json({ error: 'Eksik bilgi.' });

    try {
        const result = await db.query(
            "INSERT INTO weekly_tasks (class_id, content) VALUES (?, ?) RETURNING *",
            [class_id, content]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete Task
router.delete('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM student_task_completions WHERE task_id = ?", [id]);
        await db.query("DELETE FROM weekly_tasks WHERE task_id = ?", [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Toggle Task Completion (Student)

// Toggle Task Completion (Student) - Supports optional response text
router.post('/tasks/:id/toggle', async (req, res) => {
    const { id } = req.params;
    const { student_id, response_text } = req.body;

    if (!student_id) return res.status(400).json({ error: 'Öğrenci ID gerekli.' });

    try {
        const check = await db.query(
            "SELECT * FROM student_task_completions WHERE task_id = ? AND student_id = ?",
            [id, student_id]
        );

        let isCompleted = false;

        if (check.rows.length > 0) {
            // Already completed. If sending text, update it. If not, uncheck (delete) IF the user explicitly wants to toggle off. 
            // BUT, for better UX with text input: 
            // If request has response_text (even empty string), we treat it as an UPDATE or CONFIRM completion.
            // If request has NO response_text payload (undefined), we treat it as a TOGGLE (remove if exists).

            if (response_text !== undefined) {
                // Update text
                await db.query(
                    "UPDATE student_task_completions SET response_text = ?, completed_at = CURRENT_TIMESTAMP WHERE task_id = ? AND student_id = ?",
                    [response_text, id, student_id]
                );
                isCompleted = true;
            } else {
                // Delete (Toggle Off)
                await db.query(
                    "DELETE FROM student_task_completions WHERE task_id = ? AND student_id = ?",
                    [id, student_id]
                );
                isCompleted = false;
            }
        } else {
            // Check (Insert)
            await db.query(
                "INSERT INTO student_task_completions (task_id, student_id, response_text) VALUES (?, ?, ?)",
                [id, student_id, response_text || null]
            );
            isCompleted = true;

            // Check for potential badge (e.g. First Task Completed)
            // Ideally we'd have a badge check logic here
        }

        res.json({ success: true, is_completed: isCompleted });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Task Completions (Teacher)
router.get('/tasks/:id/completions', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(`
            SELECT stc.*, u.ad, u.soyad, u.kullanici_adi
            FROM student_task_completions stc
            JOIN users u ON stc.student_id = u.user_id
            WHERE stc.task_id = ?
            ORDER BY stc.completed_at DESC
        `, [id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Grade Task Completion (Teacher)
router.post('/tasks/:id/grade', async (req, res) => {
    const { id } = req.params;
    const { student_id, rating } = req.body;

    if (!student_id || rating === undefined) {
        return res.status(400).json({ error: 'Missing information' });
    }

    try {
        await db.query(
            "UPDATE student_task_completions SET rating = ? WHERE task_id = ? AND student_id = ?",
            [rating, id, student_id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});



// Create Quote Endpoint
router.post('/quotes', async (req, res) => {
    let { user_id, book_id, book_name, icerik } = req.body;

    try {
        // If no book_id provided but book_name is, find or create the book
        if (!book_id && book_name) {
            const existingBook = await db.query(
                "SELECT book_id FROM books WHERE LOWER(kitap_adi) = LOWER(?)",
                [book_name.trim()]
            );

            if (existingBook.rows.length > 0) {
                book_id = existingBook.rows[0].book_id;
            } else {
                const newBook = await db.query(
                    "INSERT INTO books (kitap_adi, yazar) VALUES (?, 'Bilinmiyor') RETURNING book_id",
                    [book_name.trim()]
                );
                book_id = newBook.rows[0].book_id;
            }
        }

        if (!book_id) {
            return res.status(400).json({ error: 'Book ID or Book Name is required' });
        }

        const result = await db.query(
            "INSERT INTO quotes (user_id, book_id, icerik, durum) VALUES (?, ?, ?, 'beklemede') RETURNING *",
            [user_id, book_id, icerik]
        );

        // Trigger badge check
        await checkAndGrantBadges(user_id);
        const newlyEarnedBadges = await getUnseenBadges(user_id);

        res.json({ ...result.rows[0], newlyEarnedBadges });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Leaderboard Endpoint
router.get('/quotes/leaderboard', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT u.user_id, u.ad || ' ' || u.soyad as ogrenci_adi, COUNT(q.quote_id) as alinti_sayisi
            FROM users u
            JOIN quotes q ON u.user_id = q.user_id
            WHERE u.rol = 'ogrenci' AND q.durum = 'onaylandi'
            GROUP BY u.user_id
            ORDER BY alinti_sayisi DESC
            LIMIT 20
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Approved Quotes Endpoint (Global Feed)
router.get('/quotes/approved', async (req, res) => {
    const { user_id } = req.query; // Optional: check if current user liked
    try {
        const result = await db.query(`
            SELECT 
                q.*, 
                b.kitap_adi, 
                b.yazar, 
                u.ad || ' ' || u.soyad as ogrenci_adi,
                (SELECT COUNT(*) FROM quote_likes WHERE quote_id = q.quote_id) as begeni_sayisi,
                (SELECT COUNT(*) FROM quote_comments WHERE quote_id = q.quote_id) as yorum_sayisi,
                (SELECT COUNT(*) FROM quote_likes WHERE quote_id = q.quote_id AND user_id = ?) as is_liked
            FROM quotes q
            JOIN books b ON q.book_id = b.book_id
            JOIN users u ON q.user_id = u.user_id
            WHERE q.durum = 'onaylandi'
            ORDER BY q.is_nitelikli DESC, q.paylasim_tarihi DESC
            LIMIT 50
        `, [user_id || 0]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Like/Unlike Toggle
router.post('/quotes/:id/like', async (req, res) => {
    const quote_id = parseInt(req.params.id);
    const user_id = parseInt(req.body.user_id);

    if (!user_id) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const checkLike = await db.query(
            "SELECT * FROM quote_likes WHERE user_id = ? AND quote_id = ?",
            [user_id, quote_id]
        );

        if (checkLike.rows.length > 0) {
            await db.query("DELETE FROM quote_likes WHERE user_id = ? AND quote_id = ?", [user_id, quote_id]);
            res.json({ liked: false });
        } else {
            await db.query("INSERT INTO quote_likes (user_id, quote_id) VALUES (?, ?)", [user_id, quote_id]);

            // Check badges for the person who liked
            await checkAndGrantBadges(user_id);
            const newlyEarnedBadges = await getUnseenBadges(user_id);

            // Check badges for the author of the quote (don't consume them, they show up for author later)
            const authorRes = await db.query("SELECT user_id FROM quotes WHERE quote_id = ?", [quote_id]);
            if (authorRes.rows.length > 0) {
                await checkAndGrantBadges(authorRes.rows[0].user_id);
            }

            res.json({
                liked: true,
                newlyEarnedBadges: newlyEarnedBadges
            });
        }
    } catch (err) {
        console.error('Like error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add Comment
router.post('/quotes/:id/comments', async (req, res) => {
    const quote_id = parseInt(req.params.id);
    const user_id = parseInt(req.body.user_id);
    const { content, parent_id } = req.body;

    if (!user_id) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const result = await db.query(
            "INSERT INTO quote_comments (user_id, quote_id, yorum_metin, parent_comment_id) VALUES (?, ?, ?, ?) RETURNING *",
            [user_id, quote_id, content, parent_id || null]
        );

        // Check badges for the person who commented
        await checkAndGrantBadges(user_id);
        const newlyEarnedBadges = await getUnseenBadges(user_id);

        res.json({ ...result.rows[0], newlyEarnedBadges });
    } catch (err) {
        console.error('Comment error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Comments
router.get('/quotes/:id/comments', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(`
            SELECT 
                c.*, 
                u.ad || ' ' || u.soyad as kullanici_adi, 
                u.rol,
                pu.ad || ' ' || pu.soyad as parent_author
            FROM quote_comments c
            JOIN users u ON c.user_id = u.user_id
            LEFT JOIN quote_comments pc ON c.parent_comment_id = pc.comment_id
            LEFT JOIN users pu ON pc.user_id = pu.user_id
            WHERE c.quote_id = ?
            ORDER BY c.created_at ASC
        `, [id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete Comment (Teacher only)
router.delete('/comments/:id', async (req, res) => {
    const { id } = req.params;
    const { teacher_id } = req.body;

    try {
        const user = await db.query("SELECT rol FROM users WHERE user_id = ?", [teacher_id]);
        if (!user.rows.length || user.rows[0].rol !== 'ogretmen') {
            return res.status(403).json({ error: 'Yetkiniz yok' });
        }

        await db.query("DELETE FROM quote_comments WHERE comment_id = ?", [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Report Quote
router.post('/quotes/:id/report', async (req, res) => {
    const { id } = req.params;
    const { user_id, reason } = req.body;

    if (!user_id) return res.status(401).json({ error: 'Unauthorized' });

    try {
        await db.query(
            "INSERT INTO quote_reports (user_id, quote_id, reason) VALUES (?, ?, ?)",
            [user_id, id, reason]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Reports
router.get('/reports', async (req, res) => {
    const { class_id } = req.query;
    try {
        let query = `
            SELECT r.*, u.ad || ' ' || u.soyad as reporter_name, q.icerik as quote_content, q.book_id
            FROM quote_reports r
            JOIN users u ON r.user_id = u.user_id
            JOIN quotes q ON r.quote_id = q.quote_id
            WHERE r.status = 'pending'
        `;
        let params = [];
        if (class_id && class_id !== 'all') {
            query += " AND q.user_id IN (SELECT student_id FROM class_enrollments WHERE class_id = ?)";
            params.push(class_id);
        }
        query += " ORDER BY r.created_at DESC";
        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user's own quotes sorted by latest comment
router.get('/quotes/user/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId);
    try {
        const result = await db.query(`
            SELECT 
                q.*, 
                b.kitap_adi, 
                b.yazar,
                (SELECT COUNT(*) FROM quote_likes WHERE quote_id = q.quote_id) as begeni_sayisi,
                (SELECT COUNT(*) FROM quote_comments WHERE quote_id = q.quote_id) as yorum_sayisi,
                (SELECT MAX(created_at) FROM quote_comments WHERE quote_id = q.quote_id) as last_comment_at
            FROM quotes q
            JOIN books b ON q.book_id = b.book_id
            WHERE q.user_id = ?
            ORDER BY COALESCE(last_comment_at, q.paylasim_tarihi) DESC
        `, [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Teacher: Get Student Badge Summary
router.get('/teacher/student-summary', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                u.ad, 
                u.soyad, 
                COUNT(ub.badge_id) as rozet_sayisi, 
                MAX(ub.kazanim_tarihi) as son_rozet_tarihi,
                (SELECT COUNT(*) FROM quotes WHERE user_id = u.user_id AND durum = 'onaylandi') as onayli_alinti
            FROM users u
            LEFT JOIN user_badges ub ON u.user_id = ub.user_id
            WHERE u.rol = 'ogrenci'
            GROUP BY u.user_id
            ORDER BY rozet_sayisi DESC, son_rozet_tarihi DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Teacher: Get Recent Badge Activity
router.get('/teacher/badge-activity', async (req, res) => {
    const { class_id } = req.query;
    try {
        let query = `
            SELECT ub.*, u.ad || ' ' || u.soyad as ogrenci_adi, b.rozet_adi, b.ikon, b.kategori
            FROM user_badges ub
            JOIN users u ON ub.user_id = u.user_id
            JOIN badges b ON ub.badge_id = b.badge_id
        `;
        let params = [];
        if (class_id && class_id !== 'all') {
            query += " JOIN class_enrollments ce ON ub.user_id = ce.student_id WHERE ce.class_id = ?";
            params.push(class_id);
        }
        query += " ORDER BY ub.kazanim_tarihi DESC LIMIT 20";
        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Teacher: Get all assignments for a specific class
router.get('/teacher/class/:classId/assignments', async (req, res) => {
    try {
        const { classId } = req.params;
        const result = await db.query(`
            SELECT a.*, u.ad, u.soyad, u.kullanici_adi, b.kitap_adi, b.yazar
            FROM assignments a
            JOIN users u ON a.user_id = u.user_id
            LEFT JOIN books b ON a.book_id = b.book_id
            WHERE a.class_id = ?
            ORDER BY a.assigned_date DESC
        `, [classId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.use('/api', router);
app.use('/', router);

// Error handler
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

if (process.env.NODE_ENV !== 'production' || !process.env.NETLIFY) {
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}
