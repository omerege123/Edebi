import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

const badges = [
    // OKUMA & SÜREKLİLİK
    ['İlk Kıvılcım', 'OKUMA & SÜREKLİLİK', 'İlk alıntıyı paylaşmak', 'Okuma Becerisi', '🔥'],
    ['Sayfalar Arasında', 'OKUMA & SÜREKLİLİK', '3 farklı gün okuma etkileşimi', 'Okuma Sürekliliği', '📖'],
    ['Okur Yolculuğu', 'OKUMA & SÜREKLİLİK', '3 farklı kitapla etkileşim', 'Okuma Kültürü', '🛤️'],
    ['Düzenli Okur', 'OKUMA & SÜREKLİLİK', '2 hafta üst üste etkinlik', 'Okuma Alışkanlığı', '📅'],
    ['Sessiz Okuma Ustası', 'OKUMA & SÜREKLİLİK', 'Metni yorum yapmadan analiz etme', 'Anlama', '🤫'],
    ['Metinle Buluşma', 'OKUMA & SÜREKLİLİK', 'İlk kitap–alıntı eşleşmesi', 'Metni Anlama', '🤝'],
    ['Okuma Disiplini', 'OKUMA & SÜREKLİLİK', 'Haftalık görevi tamamlama', 'Öz Düzenleme', '📏'],
    ['Derin Okur', 'OKUMA & SÜREKLİLİK', 'Uzun analizli alıntı paylaşımı', 'Derin Okuma', '🕳️'],

    // ALINTI & YORUM
    ['Satır Avcısı', 'ALINTI & YORUM', 'Nitelikli alıntı seçimi', 'Metni Anlama', '🏹'],
    ['Anlamı Yakalayan', 'ALINTI & YORUM', 'Alıntının ana düşüncesini açıklama', 'Ana Fikir', '🎣'],
    ['Güçlü Alıntı', 'ALINTI & YORUM', 'En az 3 beğeni alan alıntı', 'Etkili İfade', '💪'],
    ['Metnin Kalbi', 'ALINTI & YORUM', 'Temayı yansıtan alıntı', 'Tema Belirleme', '❤️'],
    ['Düşünce İzleri', 'ALINTI & YORUM', 'Alıntıya kişisel yorum ekleme', 'Yorumlama', '👣'],
    ['Satır Arası Sezgisi', 'ALINTI & YORUM', 'Örtük anlam açıklaması', 'Çıkarım Yapma', '🔮'],
    ['Metni Konuşturan', 'ALINTI & YORUM', 'Alıntıyı tartışmaya açma', 'Sözlü/Yazılı İfade', '🗣️'],

    // ELEŞTİREL DÜŞÜNME
    ['Eleştirel Bakış', 'ELEŞTİREL DÜŞÜNME', 'Metni sorgulayan yorum', 'Eleştirel Düşünme', '🧐'],
    ['Yorum Ustası', 'ELEŞTİREL DÜŞÜNME', '5 anlamlı yorum', 'Yorumlama', '✍️'],
    ['Derin Anlam', 'ELEŞTİREL DÜŞÜNME', 'Alt anlam katmanı çözümleme', 'Çıkarım', '🧠'],
    ['Metni Sorgulayan', 'ELEŞTİREL DÜŞÜNME', 'Yazarın tutumunu tartışma', 'Eleştirel Okuma', '❓'],
    ['Çok Katmanlı Okur', 'ELEŞTİREL DÜŞÜNME', 'Metni bağlamıyla ele alma', 'Bağlam Analizi', '🍰'],
    ['Metin Dedektifi', 'ELEŞTİREL DÜŞÜNME', 'Sebep–sonuç ilişkisi', 'Analiz', '🕵️'],
    ['Düşünce Mimarı', 'ELEŞTİREL DÜŞÜNME', 'Yapılandırılmış analiz', 'Üst Düzey Düşünme', '🏗️'],

    // METİNLERARASI
    ['Metinlerarası Köprü', 'METİNLERARASI', 'İki metin bağlantısı', 'Metinlerarası İlişki', '🌉'],
    ['Anlam Ağları', 'METİNLERARASI', 'Ortak tema tespiti', 'Tema Analizi', '🕸️'],
    ['Edebi Bağlantılar', 'METİNLERARASI', 'Yazar–dönem ilişkisi', 'Edebî Bağlam', '🔗'],
    ['Yazarlar Arası Yolculuk', 'METİNLERARASI', 'Farklı yazar karşılaştırma', 'Karşılaştırma', '🚢'],
    ['Tema Avcısı', 'METİNLERARASI', 'Aynı temalı 3 alıntı', 'Tema Belirleme', '🎯'],
    ['Bağlam Kurucu', 'METİNLERARASI', 'Tarihsel/sosyal bağ', 'Bağlam Bilgisi', '🏠'],

    // SOSYAL ETKİLEŞİM
    ['Edebi Paylaşımcı', 'SOSYAL ETKİLEŞİM', 'Düzenli paylaşım', 'Sosyal Öğrenme', '📤'],
    ['Okuma Topluluğu Üyesi', 'SOSYAL ETKİLEŞİM', 'Görev katılımı', 'İş Birliği', '👥'],
    ['Yorum Destekçisi', 'SOSYAL ETKİLEŞİM', '5 yapıcı yorum', 'Akran Etkileşimi', '🤝'],
    ['Akran Küratörü', 'SOSYAL ETKİLEŞİM', 'Kitap önerisi', 'Okuma Kültürü', '🏛️'],
    ['İlham Veren Okur', 'SOSYAL ETKİLEŞİM', 'Tavsiye edilen kitap okunması', 'Motivasyon', '✨'],
    ['Edebi Etkileşimci', 'SOSYAL ETKİLEŞİM', 'Tartışma başlatma', 'İletişim', '💬'],

    // GÖREV & OYUNLAŞTIRMA
    ['Ortak Hedef', 'GÖREV & OYUNLAŞTIRMA', 'Sınıf görevi tamamlama', 'İş Birliği', '⚽'],
    ['Görev Tamamlayıcı', 'GÖREV & OYUNLAŞTIRMA', 'Bireysel görev', 'Sorumluluk', '✅'],
    ['Sınıf Katkıcısı', 'GÖREV & OYUNLAŞTIRMA', 'Grup katkısı', 'Sosyal Katılım', '🎁'],
    ['Kolektif Okur', 'GÖREV & OYUNLAŞTIRMA', 'Takım başarısı', 'Ortak Öğrenme', '🏫'],
    ['Okuma Elçisi', 'GÖREV & OYUNLAŞTIRMA', 'Sınıfı temsil', 'Liderlik', '🚩'],

    // KEŞİF & ÇEŞİTLİLİK
    ['Tür Kaşifi', 'KEŞİF & ÇEŞİTLİLİK', '3 farklı tür', 'Tür Bilgisi', '🧭'],
    ['Yazar Keşifçisi', 'KEŞİF & ÇEŞİTLİLİK', 'Yeni yazar', 'Edebi Çeşitlilik', '🔎'],
    ['Edebi Cesaret', 'KEŞİF & ÇEŞİTLİLİK', 'Zor metin', 'Okuma Gelişimi', '🦁'],
    ['Farklı Sesler', 'KEŞİF & ÇEŞİTLİLİK', 'Alternatif bakış', 'Empati', '🌈'],
    ['Okuma Ufku', 'KEŞİF & ÇEŞİTLİLİK', 'Tür dışı okuma', 'Geniş Okuma', '🌅'],

    // PRESTİJ ROZETLER
    ['Edebi Kıvılcım', 'PRESTİJ ROZETLER', 'Sürekli nitelikli katılım', 'Okuma Kültürü', '💎'],
    ['Anlam Ustası', 'PRESTİJ ROZETLER', 'Çoklu beceri', 'Üst Düzey', '🎓'],
    ['Okuma Kültürü Taşıyıcısı', 'PRESTİJ ROZETLER', 'Örnek öğrenci', 'Değerler', '🏆'],
    ['Edebi Rehber', 'PRESTİJ ROZETLER', 'Akran yönlendirme', 'Sosyal Liderlik', '🗺️'],
    ['Düşünce Öncüsü', 'PRESTİJ ROZETLER', 'Derin tartışmalar', 'Eleştirel Düşünme', '💡'],
    ['Satır Arasında Kalanı Gören', 'PRESTİJ ROZETLER', 'Örtük anlam ustalığı', 'Çıkarım & Yorum', '🔭']
];

db.serialize(() => {
    db.run('DELETE FROM badges'); // Clear existing
    const stmt = db.prepare('INSERT INTO badges (rozet_adi, kategori, kazanim_kriteri, ogm_materyal, ikon) VALUES (?, ?, ?, ?, ?)');
    badges.forEach(badge => {
        stmt.run(badge);
    });
    stmt.finalize(() => {
        console.log('50 badges seeded successfully.');
        db.close();
    });
});
