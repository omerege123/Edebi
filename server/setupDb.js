import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../database.sqlite');

const db = new sqlite3.Database(dbPath);

const schema = `
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    ad TEXT NOT NULL,
    soyad TEXT NOT NULL,
    kullanici_adi TEXT UNIQUE NOT NULL,
    e_posta TEXT UNIQUE NOT NULL,
    parola_hash TEXT NOT NULL,
    rol TEXT CHECK(rol IN ('ogrenci', 'ogretmen')) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS books (
    book_id INTEGER PRIMARY KEY AUTOINCREMENT,
    kitap_adi TEXT NOT NULL,
    yazar TEXT,
    tur TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quotes (
    quote_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    icerik TEXT,
    durum TEXT CHECK(durum IN ('beklemede', 'onaylandi', 'reddedildi')) DEFAULT 'beklemede',
    is_nitelikli INTEGER DEFAULT 0,
    paylasim_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
    begeni_sayisi INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (book_id) REFERENCES books(book_id)
);

CREATE TABLE IF NOT EXISTS quote_likes (
    user_id INTEGER NOT NULL,
    quote_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, quote_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (quote_id) REFERENCES quotes(quote_id)
);

CREATE TABLE IF NOT EXISTS quote_comments (
    comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    quote_id INTEGER NOT NULL,
    parent_comment_id INTEGER,
    yorum_metin TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (quote_id) REFERENCES quotes(quote_id),
    FOREIGN KEY (parent_comment_id) REFERENCES quote_comments(comment_id)
);

CREATE TABLE IF NOT EXISTS assignments (
    assignment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    assigned_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    due_date DATETIME,
    status TEXT CHECK(status IN ('assigned', 'completed')) DEFAULT 'assigned',
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (book_id) REFERENCES books(book_id)
);

CREATE TABLE IF NOT EXISTS badges (
    badge_id INTEGER PRIMARY KEY AUTOINCREMENT,
    rozet_adi TEXT NOT NULL,
    kategori TEXT,
    kazanim_kriteri TEXT,
    ogm_materyal TEXT,
    ikon TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_badges (
    user_badge_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    badge_id INTEGER NOT NULL,
    kazanim_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (badge_id) REFERENCES badges(badge_id)
);
 
CREATE TABLE IF NOT EXISTS quote_reports (
    report_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    quote_id INTEGER NOT NULL,
    reason TEXT NOT NULL,
    status TEXT CHECK(status IN ('pending', 'resolved')) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (quote_id) REFERENCES quotes(quote_id)
);

CREATE TABLE IF NOT EXISTS classes (
    class_id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER NOT NULL,
    sinif_adi TEXT NOT NULL,
    sinif_kodu TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS class_enrollments (
    class_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (class_id, student_id),
    FOREIGN KEY (class_id) REFERENCES classes(class_id),
    FOREIGN KEY (student_id) REFERENCES users(user_id)
);
 
-- Seed data check
INSERT OR IGNORE INTO books (book_id, kitap_adi, yazar) VALUES 
(1, 'Suç ve Ceza', 'Fyodor Dostoyevski'),
(2, 'Sefiller', 'Victor Hugo'),
(3, '1984', 'George Orwell');

INSERT OR IGNORE INTO users (user_id, ad, soyad, kullanici_adi, e_posta, parola_hash, rol) VALUES
(1, 'Ali', 'Yılmaz', 'ali123', 'ali@example.com', 'hash123', 'ogrenci'),
(2, 'Ayşe', 'Demir', 'ayse123', 'ayse@example.com', 'hash123', 'ogrenci'),
(3, 'Mehmet', 'Hoca', 'mehmet_hoca', 'mehmet@example.com', 'hash123', 'ogretmen');
`;

db.serialize(() => {
    db.exec(schema, (err) => {
        if (err) {
            console.error('Error creating schema:', err);
        } else {
            console.log('Schema created successfully.');
        }
    });
});

db.close();
