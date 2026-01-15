-- Seed Data
INSERT INTO users (ad, soyad, kullanici_adi, e_posta, parola_hash, rol, okul, sinif_duzeyi) VALUES
('Ahmet', 'Yılmaz', 'ahmethoca', 'ahmet@okul.com', 'hash123', 'ogretmen', 'Atatürk Lisesi', '9-A'),
('Ali', 'Veli', 'aliveli', 'ali@okul.com', 'hash123', 'ogrenci', 'Atatürk Lisesi', '9-A'),
('Ayşe', 'Fatma', 'aysefatma', 'ayse@okul.com', 'hash123', 'ogrenci', 'Atatürk Lisesi', '9-A'),
('Mehmet', 'Öz', 'mehmetoz', 'mehmet@okul.com', 'hash123', 'ogrenci', 'Atatürk Lisesi', '9-A');

INSERT INTO books (kitap_adi, yazar, edebi_tur, yayinevi) VALUES
('Sefiller', 'Victor Hugo', 'Roman', 'İş Bankası Yayınları'),
('Çalıkuşu', 'Reşat Nuri Güntekin', 'Roman', 'İnkılap Kitabevi'),
('Suç ve Ceza', 'Fyodor Dostoyevski', 'Roman', 'Can Yayınları');

INSERT INTO quotes (book_id, user_id, alinti_metin, sayfa_numarasi, durum) VALUES
(1, 2, 'Hayatta en büyük mutluluk, sevildiğimizi bilmektir.', 150, 'beklemede'),
(2, 3, 'İnsanlar hayal ettikleri sürece yaşarlar.', 45, 'beklemede'),
(3, 4, 'Önce biraz ağladılar, ama alıştılar şimdi. Aşağılık insanoğlu her şeye alışır!', 200, 'onaylandi');
