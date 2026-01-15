-- Edebi Kıvılcım Project - PostgreSQL Database Schema

-- Users Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    ad VARCHAR(50) NOT NULL,
    soyad VARCHAR(50) NOT NULL,
    kullanici_adi VARCHAR(50) UNIQUE NOT NULL,
    e_posta VARCHAR(100) UNIQUE NOT NULL,
    parola_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) CHECK (rol IN ('ogrenci', 'ogretmen', 'admin')) NOT NULL,
    okul VARCHAR(100),
    sinif_duzeyi VARCHAR(20),
    profil_foto VARCHAR(255),
    kayit_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    aktif_mi BOOLEAN DEFAULT TRUE
);

-- Books Table
CREATE TABLE books (
    book_id SERIAL PRIMARY KEY,
    kitap_adi VARCHAR(255) NOT NULL,
    yazar VARCHAR(100) NOT NULL,
    edebi_tur VARCHAR(50),
    yayinevi VARCHAR(100),
    yayin_yili INTEGER,
    aciklama TEXT,
    kapak_gorseli VARCHAR(255),
    eklenme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quotes Table
CREATE TABLE quotes (
    quote_id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(book_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    alinti_metin TEXT NOT NULL,
    sayfa_numarasi INTEGER,
    paylasim_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    gorunurluk VARCHAR(20) DEFAULT 'herkese_acik', -- 'herkese_acik', 'sinif_ici'
    durum VARCHAR(20) DEFAULT 'beklemede', -- 'beklemede', 'onaylandi', 'reddedildi'
    begeni_sayisi INTEGER DEFAULT 0
);

-- Quote Comments Table
CREATE TABLE quote_comments (
    comment_id SERIAL PRIMARY KEY,
    quote_id INTEGER REFERENCES quotes(quote_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    yorum_metin TEXT NOT NULL,
    yorum_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    elestirel_etiket VARCHAR(50) -- 'analiz', 'yorum', 'metinlerarasi'
);

-- Tags (Skills/Kazanımlar)
CREATE TABLE tags (
    tag_id SERIAL PRIMARY KEY,
    etiket_adi VARCHAR(100) NOT NULL,
    aciklama TEXT
);

-- Quote Tags Junction Table
CREATE TABLE quote_tags (
    quote_id INTEGER REFERENCES quotes(quote_id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (quote_id, tag_id)
);

-- Badges
CREATE TABLE badges (
    badge_id SERIAL PRIMARY KEY,
    rozet_adi VARCHAR(100) NOT NULL,
    rozet_aciklamasi TEXT,
    kazanim_kriteri TEXT,
    ikon VARCHAR(255),
    aktif_mi BOOLEAN DEFAULT TRUE
);

-- User Badges
CREATE TABLE user_badges (
    user_badge_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    badge_id INTEGER REFERENCES badges(badge_id) ON DELETE CASCADE,
    kazanim_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reading Tasks
CREATE TABLE reading_tasks (
    task_id SERIAL PRIMARY KEY,
    gorev_adi VARCHAR(255) NOT NULL,
    gorev_aciklamasi TEXT,
    baslangic_tarihi TIMESTAMP,
    bitis_tarihi TIMESTAMP,
    hedef_tur VARCHAR(100),
    aktif_mi BOOLEAN DEFAULT TRUE
);

-- Task Participation
CREATE TABLE task_participation (
    participation_id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES reading_tasks(task_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    tamamlandi_mi BOOLEAN DEFAULT FALSE,
    katki_sayisi INTEGER DEFAULT 0
);

-- Book Recommendations
CREATE TABLE book_recommendations (
    recommendation_id SERIAL PRIMARY KEY,
    oneren_user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(book_id) ON DELETE CASCADE,
    oneri_notu TEXT,
    oneri_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teacher Feedback
CREATE TABLE teacher_feedback (
    feedback_id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    quote_id INTEGER REFERENCES quotes(quote_id) ON DELETE SET NULL,
    geri_bildirim_metin TEXT NOT NULL,
    tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity Log
CREATE TABLE activity_log (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    islem_turu VARCHAR(50), -- 'alinti_paylasti', 'yorum_yapti', 'rozet_kazandi'
    tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    detay TEXT
);
