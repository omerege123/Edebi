import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';

const TeacherQuotesPage: React.FC = () => {
    const [feedQuotes, setFeedQuotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFeed = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/quotes/approved`);
            const data = await response.json();
            setFeedQuotes(data);
        } catch (error) {
            console.error('Error fetching feed:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeed();
    }, []);

    const toggleNitelikli = async (quoteId: number) => {
        try {
            const res = await fetch(`http://localhost:3000/api/quotes/${quoteId}/toggle-nitelikli`, {
                method: 'POST'
            });
            if (res.ok) {
                const data = await res.json();
                setFeedQuotes(prev => prev.map(q =>
                    q.quote_id === quoteId ? { ...q, is_nitelikli: data.is_nitelikli } : q
                ));
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <DashboardLayout role="teacher">
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Edebi Akış 🌟</h1>
                <p style={{ color: 'var(--neutral-500)' }}>
                    Öğrencilerin paylaştığı alıntıları inceleyin ve nitelikli olanları seçerek en üste taşıyın.
                </p>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {loading ? (
                    <div>Yükleniyor...</div>
                ) : feedQuotes.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', color: 'var(--neutral-500)', padding: '2rem' }}>
                        Henüz paylaşılan bir alıntı yok.
                    </div>
                ) : (
                    feedQuotes.map((quote) => (
                        <div
                            key={quote.quote_id}
                            className="card"
                            style={{
                                border: quote.is_nitelikli ? '2px solid var(--color-secondary)' : '1px solid var(--neutral-200)',
                                background: quote.is_nitelikli ? 'linear-gradient(to right, #fff, #fefce8)' : 'white'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '1.1rem',
                                        fontWeight: 600
                                    }}>
                                        {quote.ogrenci_adi.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {quote.ogrenci_adi}
                                            {quote.is_nitelikli === 1 && (
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    backgroundColor: 'var(--color-secondary)',
                                                    color: 'white',
                                                    padding: '0.1rem 0.5rem',
                                                    borderRadius: '10px'
                                                }}>
                                                    🌟 NİTELİKLİ
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--neutral-500)' }}>
                                            "{quote.kitap_adi}" — {quote.yazar}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--neutral-400)' }}>
                                        {new Date(quote.paylasim_tarihi).toLocaleDateString('tr-TR')}
                                    </div>
                                    <button
                                        onClick={() => toggleNitelikli(quote.quote_id)}
                                        className={quote.is_nitelikli ? "btn" : "btn btn-outline"}
                                        style={{
                                            marginTop: '0.5rem',
                                            fontSize: '0.8rem',
                                            padding: '0.25rem 0.75rem',
                                            backgroundColor: quote.is_nitelikli ? 'var(--color-secondary)' : 'transparent',
                                            color: quote.is_nitelikli ? 'white' : 'var(--color-secondary)',
                                            borderColor: 'var(--color-secondary)'
                                        }}
                                    >
                                        {quote.is_nitelikli ? '⭐ Seçimi Kaldır' : '🌟 Nitelikli Seç'}
                                    </button>
                                </div>
                            </div>

                            <div style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: '1.1rem',
                                lineHeight: '1.6',
                                color: 'var(--neutral-800)',
                                paddingLeft: '1rem',
                                borderLeft: '4px solid var(--color-secondary)',
                                marginBottom: '1rem',
                                fontStyle: 'italic'
                            }}>
                                "{quote.icerik}"
                            </div>

                            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--neutral-500)' }}>
                                <span>❤️ {quote.begeni_sayisi} Beğeni</span>
                                <span>💬 {quote.yorum_sayisi} Yorum</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </DashboardLayout>
    );
};

export default TeacherQuotesPage;
