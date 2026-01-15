import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const schema = `
-- Drop existing tables if needed (uncomment if you want a fresh start)
-- DROP TABLE IF EXISTS student_task_completions CASCADE;
-- DROP TABLE IF EXISTS weekly_tasks CASCADE;
-- DROP TABLE IF EXISTS class_enrollments CASCADE;
-- DROP TABLE IF EXISTS classes CASCADE;
-- DROP TABLE IF EXISTS quote_reports CASCADE;
-- DROP TABLE IF EXISTS user_badges CASCADE;
-- DROP TABLE IF EXISTS badges CASCADE;
-- DROP TABLE IF EXISTS assignments CASCADE;
-- DROP TABLE IF EXISTS quote_comments CASCADE;
-- DROP TABLE IF EXISTS quote_likes CASCADE;
-- DROP TABLE IF EXISTS quotes CASCADE;
-- DROP TABLE IF EXISTS books CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- Tables
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    ad TEXT NOT NULL,
    soyad TEXT NOT NULL,
    kullanici_adi TEXT UNIQUE NOT NULL,
    e_posta TEXT UNIQUE NOT NULL,
    parola_hash TEXT NOT NULL,
    rol TEXT CHECK(rol IN ('ogrenci', 'ogretmen')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS books (
    book_id SERIAL PRIMARY KEY,
    kitap_adi TEXT NOT NULL,
    yazar TEXT,
    tur TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quotes (
    quote_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL REFERENCES books(book_id) ON DELETE CASCADE,
    icerik TEXT,
    durum TEXT CHECK(durum IN ('beklemede', 'onaylandi', 'reddedildi')) DEFAULT 'beklemede',
    is_nitelikli INTEGER DEFAULT 0,
    paylasim_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    begeni_sayisi INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS quote_likes (
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    quote_id INTEGER NOT NULL REFERENCES quotes(quote_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, quote_id)
);

CREATE TABLE IF NOT EXISTS quote_comments (
    comment_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    quote_id INTEGER NOT NULL REFERENCES quotes(quote_id) ON DELETE CASCADE,
    parent_comment_id INTEGER REFERENCES quote_comments(comment_id) ON DELETE CASCADE,
    yorum_metin TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS classes (
    class_id SERIAL PRIMARY KEY,
    teacher_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    sinif_adi TEXT NOT NULL,
    sinif_kodu TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS class_enrollments (
    class_id INTEGER NOT NULL REFERENCES classes(class_id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (class_id, student_id)
);

CREATE TABLE IF NOT EXISTS assignments (
    assignment_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(book_id) ON DELETE SET NULL,
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP,
    status TEXT DEFAULT 'assigned',
    summary_text TEXT,
    score INTEGER,
    feedback TEXT,
    class_id INTEGER REFERENCES classes(class_id) ON DELETE SET NULL,
    assignment_type TEXT DEFAULT 'book'
);

CREATE TABLE IF NOT EXISTS badges (
    badge_id SERIAL PRIMARY KEY,
    rozet_adi TEXT NOT NULL,
    kategori TEXT,
    kazanim_kriteri TEXT,
    ogm_materyal TEXT,
    ikon TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_badges (
    user_badge_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    badge_id INTEGER NOT NULL REFERENCES badges(badge_id) ON DELETE CASCADE,
    kazanim_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_seen INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS quote_reports (
    report_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    quote_id INTEGER NOT NULL REFERENCES quotes(quote_id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT CHECK(status IN ('pending', 'resolved')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS weekly_tasks (
    task_id SERIAL PRIMARY KEY,
    class_id INTEGER NOT NULL REFERENCES classes(class_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_task_completions (
    completion_id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES weekly_tasks(task_id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rating INTEGER,
    response_text TEXT,
    UNIQUE(task_id, student_id)
);
`;

const badgesData = [
    ['İlk Kıvılcım', 'OKUMA & SÜREKLİLİK', 'İlk alıntıyı paylaşmak', 'Okuma Becerisi', '🔥'],
    ['Sayfalar Arasında', 'OKUMA & SÜREKLİLİK', '3 farklı gün okuma etkileşimi', 'Okuma Sürekliliği', '📖'],
    ['Okur Yolculuğu', 'OKUMA & SÜREKLİLİK', '3 farklı kitapla etkileşim', 'Okuma Kültürü', '🛤️'],
    ['Düzenli Okur', 'OKUMA & SÜREKLİLİK', '2 hafta üst üste etkinlik', 'Okuma Alışkanlığı', '📅'],
    ['Sessiz Okuma Ustası', 'OKUMA & SÜREKLİLİK', 'Metni yorum yapmadan analiz etme', 'Anlama', '🤫'],
    ['Metinle Buluşma', 'OKUMA & SÜREKLİLİK', 'İlk kitap–alıntı eşleşmesi', 'Metni Anlama', '🤝'],
    ['Okuma Disiplini', 'OKUMA & SÜREKLİLİK', 'Haftalık görevi tamamlama', 'Öz Düzenleme', '📏'],
    ['Derin Okur', 'OKUMA & SÜREKLİLİK', 'Uzun analizli alıntı paylaşımı', 'Derin Okuma', '🕳️'],
    ['Satır Avcısı', 'ALINTI & YORUM', 'Nitelikli alıntı seçimi', 'Metni Anlama', '🏹'],
    ['Anlamı Yakalayan', 'ALINTI & YORUM', 'Alıntının ana düşüncesini açıklama', 'Ana Fikir', '🎣'],
    ['Güçlü Alıntı', 'ALINTI & YORUM', 'En az 3 beğeni alan alıntı', 'Etkili İfade', '💪'],
    ['Metnin Kalbi', 'ALINTI & YORUM', 'Temayı yansıtan alıntı', 'Tema Belirleme', '❤️'],
    ['Düşünce İzleri', 'ALINTI & YORUM', 'Alıntıya kişisel yorum ekleme', 'Yorumlama', '👣'],
    ['Satır Arası Sezgisi', 'ALINTI & YORUM', 'Örtük anlam açıklaması', 'Çıkarım Yapma', '🔮'],
    ['Metni Konuşturan', 'ALINTI & YORUM', 'Alıntıyı tartışmaya açma', 'Sözlü/Yazılı İfade', '🗣️'],
    ['Eleştirel Bakış', 'ELEŞTİREL DÜŞÜNME', 'Metni sorgulayan yorum', 'Eleştirel Düşünme', '🧐'],
    ['Yorum Ustası', 'ELEŞTİREL DÜŞÜNME', '5 anlamlı yorum', 'Yorumlama', '✍️'],
    ['Derin Anlam', 'ELEŞTİREL DÜŞÜNME', 'Alt anlam katmanı çözümleme', 'Çıkarım', '🧠'],
    ['Metni Sorgulayan', 'ELEŞTİREL DÜŞÜNME', 'Yazarın tutumunu tartışma', 'Eleştirel Okuma', '❓'],
    ['Çok Katmanlı Okur', 'ELEŞTİREL DÜŞÜNME', 'Metni bağlamıyla ele alma', 'Bağlam Analizi', '🍰'],
    ['Metin Dedektifi', 'ELEŞTİREL DÜŞÜNME', 'Sebep–sonuç ilişkisi', 'Analiz', '🕵️'],
    ['Düşünce Mimarı', 'ELEŞTİREL DÜŞÜNME', 'Yapılandırılmış analiz', 'Üst Düzey Düşünme', '🏗️'],
    ['Metinlerarası Köprü', 'METİNLERARASI', 'İki metin bağlantısı', 'Metinlerarası İlişki', '🌉'],
    ['Anlam Ağları', 'METİNLERARASI', 'Ortak tema tespiti', 'Tema Analizi', '🕸️'],
    ['Edebi Bağlantılar', 'METİNLERARASI', 'Yazar–dönem ilişkisi', 'Edebî Bağlam', '🔗'],
    ['Yazarlar Arası Yolculuk', 'METİNLERARASI', 'Farklı yazar karşılaştırma', 'Karşılaştırma', '🚢'],
    ['Tema Avcısı', 'METİNLERARASI', 'Aynı temalı 3 alıntı', 'Tema Belirleme', '🎯'],
    ['Bağlam Kurucu', 'METİNLERARASI', 'Tarihsel/sosyal bağ', 'Bağlam Bilgisi', '🏠'],
    ['Edebi Paylaşımcı', 'SOSYAL ETKİLEŞİM', 'Düzenli paylaşım', 'Sosyal Öğrenme', '📤'],
    ['Okuma Topluluğu Üyesi', 'SOSYAL ETKİLEŞİM', 'Görev katılımı', 'İş Birliği', '👥'],
    ['Yorum Destekçisi', 'SOSYAL ETKİLEŞİM', '5 yapıcı yorum', 'Akran Etkileşimi', '🤝'],
    ['Akran Küratörü', 'SOSYAL ETKİLEŞİM', 'Kitap önerisi', 'Okuma Kültürü', '🏛️'],
    ['İlham Veren Okur', 'SOSYAL ETKİLEŞİM', 'Tavsiye edilen kitap okunması', 'Motivasyon', '✨'],
    ['Edebi Etkileşimci', 'SOSYAL ETKİLEŞİM', 'Tartışma başlatma', 'İletişim', '💬'],
    ['Ortak Hedef', 'GÖREV & OYUNLAŞTIRMA', 'Sınıf görevi tamamlama', 'İş Birliği', '⚽'],
    ['Görev Tamamlayıcı', 'GÖREV & OYUNLAŞTIRMA', 'Bireysel görev', 'Sorumluluk', '✅'],
    ['Sınıf Katkıcısı', 'GÖREV & OYUNLAŞTIRMA', 'Grup katkısı', 'Sosyal Katılım', '🎁'],
    ['Kolektif Okur', 'GÖREV & OYUNLAŞTIRMA', 'Takım başarısı', 'Ortak Öğrenme', '🏫'],
    ['Okuma Elçisi', 'GÖREV & OYUNLAŞTIRMA', 'Sınıfı temsil', 'Liderlik', '🚩'],
    ['Tür Kaşifi', 'KEŞİF & ÇEŞİTLİLİK', '3 farklı tür', 'Tür Bilgisi', '🧭'],
    ['Yazar Keşifçisi', 'KEŞİF & ÇEŞİTLİLİK', 'Yeni yazar', 'Edebi Çeşitlilik', '🔎'],
    ['Edebi Cesaret', 'KEŞİF & ÇEŞİTLİLİK', 'Zor metin', 'Okuma Gelişimi', '🦁'],
    ['Farklı Sesler', 'KEŞİF & ÇEŞİTLİLİK', 'Alternatif bakış', 'Empati', '🌈'],
    ['Okuma Ufku', 'KEŞİF & ÇEŞİTLİLİK', 'Tür dışı okuma', 'Geniş Okuma', '🌅'],
    ['Edebi Kıvılcım', 'PRESTİJ ROZETLER', 'Sürekli nitelikli katılım', 'Okuma Kültürü', '💎'],
    ['Anlam Ustası', 'PRESTİJ ROZETLER', 'Çoklu beceri', 'Üst Düzey', '🎓'],
    ['Okuma Kültürü Taşıyıcısı', 'PRESTİJ ROZETLER', 'Örnek öğrenci', 'Değerler', '🏆'],
    ['Edebi Rehber', 'PRESTİJ ROZETLER', 'Akran yönlendirme', 'Sosyal Liderlik', '🗺️'],
    ['Düşünce Öncüsü', 'PRESTİJ ROZETLER', 'Derin tartışmalar', 'Eleştirel Düşünme', '💡'],
    ['Satır Arasında Kalanı Gören', 'PRESTİJ ROZETLER', 'Örtük anlam ustalığı', 'Çıkarım & Yorum', '🔭']
];

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Starting migration...');
        await client.query(schema);
        console.log('Tables created successfully.');

        // Seed Badges
        console.log('Seeding badges...');
        for (const badge of badgesData) {
            await client.query(
                'INSERT INTO badges (rozet_adi, kategori, kazanim_kriteri, ogm_materyal, ikon) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
                badge
            );
        }
        console.log('Badges seeded successfully.');

        // Seed Books
        console.log('Seeding initial books...');
        await client.query(`
            INSERT INTO books (book_id, kitap_adi, yazar) VALUES 
            (1, 'Suç ve Ceza', 'Fyodor Dostoyevski'),
            (2, 'Sefiller', 'Victor Hugo'),
            (3, '1984', 'George Orwell')
            ON CONFLICT (book_id) DO NOTHING
        `);

        // Seed Users
        console.log('Seeding initial users...');
        await client.query(`
            INSERT INTO users (user_id, ad, soyad, kullanici_adi, e_posta, parola_hash, rol) VALUES
            (1, 'Ali', 'Yılmaz', 'ali123', 'ali@example.com', 'hash123', 'ogrenci'),
            (2, 'Ayşe', 'Demir', 'ayse123', 'ayse@example.com', 'hash123', 'ogrenci'),
            (3, 'Mehmet', 'Hoca', 'mehmet_hoca', 'mehmet@example.com', 'hash123', 'ogretmen')
            ON CONFLICT (user_id) DO NOTHING
        `);

        // Fix sequence for SERIAL keys
        await client.query("SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users))");
        await client.query("SELECT setval('books_book_id_seq', (SELECT MAX(book_id) FROM books))");
        await client.query("SELECT setval('badges_badge_id_seq', (SELECT MAX(badge_id) FROM badges))");

        console.log('Migration completed successfully!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
