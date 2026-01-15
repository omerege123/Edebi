import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { useBadges } from '../context/BadgeContext';

interface Badge {
    badge_id: number;
    rozet_adi: string;
    kategori: string;
    kazanim_kriteri: string;
    ogm_materyal: string;
    ikon: string;
}

const BadgesPage: React.FC = () => {
    const { showBadges } = useBadges();
    const [badges, setBadges] = useState<Badge[]>([]);
    const [userBadges, setUserBadges] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'my-badges' | 'how-to-earn'>('my-badges');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            fetchData(user.id);
        }
    }, []);

    const fetchData = async (userId: number) => {
        try {
            // First trigger global check and get unseen badges via stats or specific endpoint
            // We'll use the stats call as it's the standard way we've set up for students
            const statsRes = await fetch(`http://localhost:3000/api/dashboard/student/stats/${userId}`);
            const statsData = await statsRes.json();
            if (statsData.newlyEarnedBadges && statsData.newlyEarnedBadges.length > 0) {
                showBadges(statsData.newlyEarnedBadges);
            }

            const [badgesRes, userBadgesRes] = await Promise.all([
                fetch('http://localhost:3000/api/badges'),
                fetch(`http://localhost:3000/api/badges/user/${userId}`)
            ]);

            if (badgesRes.ok && userBadgesRes.ok) {
                const badgesData = await badgesRes.json();
                const userBadgesData = await userBadgesRes.json();
                setBadges(badgesData);
                setUserBadges(userBadgesData.map((ub: any) => ub.badge_id));
            }
        } catch (error) {
            console.error('Error fetching badges:', error);
        } finally {
            setLoading(false);
        }
    };

    const categories = Array.from(new Set(badges.map(b => b.kategori)));

    if (loading) return <DashboardLayout role="student"><div>Yükleniyor...</div></DashboardLayout>;

    return (
        <DashboardLayout role="student">
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>Rozet Koleksiyonu</h1>
                <p style={{ color: 'var(--neutral-500)', fontSize: '1.1rem' }}>
                    Okuma yolculuğunda kazandığın başarılar ve yeni hedeflerin.
                </p>
            </div>

            {/* Navigation Tabs */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '2.5rem',
                borderBottom: '1px solid var(--neutral-200)',
                paddingBottom: '0.5rem'
            }}>
                <button
                    onClick={() => setActiveTab('my-badges')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        fontSize: '1rem',
                        fontWeight: 600,
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderBottom: activeTab === 'my-badges' ? '3px solid var(--color-primary)' : '3px solid transparent',
                        color: activeTab === 'my-badges' ? 'var(--color-primary)' : 'var(--neutral-500)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                >
                    🏅 Rozetlerim
                </button>
                <button
                    onClick={() => setActiveTab('how-to-earn')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        fontSize: '1rem',
                        fontWeight: 600,
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderBottom: activeTab === 'how-to-earn' ? '3px solid var(--color-primary)' : '3px solid transparent',
                        color: activeTab === 'how-to-earn' ? 'var(--color-primary)' : 'var(--neutral-500)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                >
                    🎯 Nasıl Kazanılır?
                </button>
            </div>

            {activeTab === 'my-badges' ? (
                /* MY BADGES CONTENT */
                <div className="animate-fade-in">
                    {categories.map(category => (
                        <div key={category} style={{ marginBottom: '3rem' }}>
                            <h2 style={{
                                fontSize: '1.25rem',
                                marginBottom: '1.5rem',
                                paddingBottom: '0.5rem',
                                borderLeft: '4px solid var(--color-primary)',
                                paddingLeft: '1rem',
                                color: 'var(--neutral-800)'
                            }}>
                                {category}
                            </h2>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                gap: '1.5rem'
                            }}>
                                {badges.filter(b => b.kategori === category).map(badge => {
                                    const isEarned = userBadges.includes(badge.badge_id);
                                    return (
                                        <div
                                            key={badge.badge_id}
                                            className="card"
                                            style={{
                                                opacity: isEarned ? 1 : 0.7,
                                                transform: isEarned ? 'none' : 'scale(0.98)',
                                                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                                position: 'relative',
                                                border: isEarned ? '2px solid var(--color-success-light)' : '1px solid var(--neutral-200)',
                                                backgroundColor: isEarned ? 'white' : 'var(--neutral-50)',
                                                boxShadow: isEarned ? '0 10px 20px rgba(0,0,0,0.05)' : 'none'
                                            }}
                                        >
                                            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'start' }}>
                                                <div style={{
                                                    fontSize: '2.5rem',
                                                    background: isEarned ? 'linear-gradient(135deg, #f0f7ff, #e0efff)' : 'var(--neutral-100)',
                                                    width: '70px',
                                                    height: '70px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderRadius: '20px',
                                                    filter: isEarned ? 'none' : 'grayscale(100%) brightness(0.9)',
                                                    boxShadow: isEarned ? '0 4px 10px rgba(0,0,0,0.1)' : 'none'
                                                }}>
                                                    {badge.ikon}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <h3 style={{
                                                        fontSize: '1.15rem',
                                                        marginBottom: '0.5rem',
                                                        color: isEarned ? 'var(--neutral-900)' : 'var(--neutral-600)'
                                                    }}>
                                                        {badge.rozet_adi}
                                                    </h3>
                                                    <div style={{ fontSize: '0.9rem', color: 'var(--neutral-600)', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                                                        <strong>Hedef:</strong> {badge.kazanim_kriteri}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        color: 'var(--color-primary)',
                                                        background: 'var(--neutral-100)',
                                                        padding: '0.3rem 0.6rem',
                                                        borderRadius: '6px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.4rem'
                                                    }}>
                                                        <span>📘</span> OGM: {badge.ogm_materyal}
                                                    </div>
                                                </div>
                                            </div>
                                            {!isEarned && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '0.75rem',
                                                    right: '0.75rem',
                                                    fontSize: '0.65rem',
                                                    backgroundColor: 'var(--neutral-200)',
                                                    color: 'var(--neutral-500)',
                                                    padding: '0.2rem 0.5rem',
                                                    borderRadius: '10px',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em'
                                                }}>
                                                    KİLİTLİ
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* HOW TO EARN CONTENT (INTEGRATED) */
                <div className="animate-fade-in" style={{ maxWidth: '850px' }}>
                    <div className="card" style={{
                        marginBottom: '3rem',
                        background: 'linear-gradient(135deg, var(--color-primary), #6366f1)',
                        color: 'white',
                        padding: '2.5rem',
                        borderRadius: '24px',
                        boxShadow: '0 20px 40px rgba(79, 70, 229, 0.2)'
                    }}>
                        <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: 'white' }}>🎯 Başarıya Giden Yol</h2>
                        <p style={{ fontSize: '1.15rem', lineHeight: '1.7', opacity: 0.9 }}>
                            Edebi Kıvılcım'da rozetler, sadece birer ikon değil; okuma, anlama ve ifade becerilerini ne kadar geliştirdiğinin birer kanıtıdır.
                            Her adımın seni daha derin bir edebiyat sever yapacak.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gap: '2rem', marginBottom: '4rem' }}>
                        <div className="card" style={{ display: 'flex', gap: '2rem', alignItems: 'center', padding: '2rem' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: 'var(--neutral-100)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                fontWeight: 800,
                                color: 'var(--color-primary)',
                                flexShrink: 0
                            }}>1</div>
                            <div>
                                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Aktif ve Analitik Okuma</h3>
                                <p style={{ color: 'var(--neutral-600)', fontSize: '1.05rem', lineHeight: '1.5' }}>
                                    Övdevlendirildiğin veya kendi seçtiğin kitapları satır aralarını okuyarak incele.
                                    Karakter gelişimleri ve tema değişimleri rozet kazanımının temelidir.
                                </p>
                            </div>
                        </div>

                        <div className="card" style={{ display: 'flex', gap: '2rem', alignItems: 'center', padding: '2rem' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: 'var(--neutral-100)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                fontWeight: 800,
                                color: 'var(--color-primary)',
                                flexShrink: 0
                            }}>2</div>
                            <div>
                                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Derinlikli Paylaşımlar</h3>
                                <p style={{ color: 'var(--neutral-600)', fontSize: '1.05rem', lineHeight: '1.5' }}>
                                    Alıntı paylaşırken sadece metni kopyalama. O metnin neden değerli olduğunu,
                                    duygularını ve çıkarımlarını ekle. Nitelikli yorumlar rozetleri hızlandırır.
                                </p>
                            </div>
                        </div>

                        <div className="card" style={{ display: 'flex', gap: '2rem', alignItems: 'center', padding: '2rem' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: 'var(--neutral-100)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                fontWeight: 800,
                                color: 'var(--color-primary)',
                                flexShrink: 0
                            }}>3</div>
                            <div>
                                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Edebi Etkileşim</h3>
                                <p style={{ color: 'var(--neutral-600)', fontSize: '1.05rem', lineHeight: '1.5' }}>
                                    Arkadaşlarının paylaşımlarını incele, beğeni gönder ve yapıcı yorumlar yap.
                                    Edebi topluluğun bir parçası olmak sana sosyal başarı rozetleri kazandırır.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        padding: '2rem',
                        backgroundColor: 'var(--neutral-50)',
                        borderRadius: '20px',
                        border: '1px dashed var(--neutral-300)'
                    }}>
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>📘</span> OGM Materyal Nedir?
                        </h3>
                        <p style={{ color: 'var(--neutral-600)', lineHeight: '1.6' }}>
                            Rozetlerimizin tamamı Milli Eğitim Bakanlığı Türk Dili ve Edebiyatı müfredatındaki
                            <strong> OGM Materyal</strong> kazanımları ile doğrudan ilişkilidir. Kazandığın her rozet,
                            aslında akademik bir beceriyi (analiz, sentez, yorumlama vb.) başarıyla sergilediğin anlamına gelir.
                        </p>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default BadgesPage;

