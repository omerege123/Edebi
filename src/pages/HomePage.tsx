import React from 'react';
import { API_BASE_URL } from '../config';
import { useBadges } from '../context/BadgeContext';

const HomePage: React.FC = () => {
    const { showBadges } = useBadges();
    const [exploreQuotes, setExploreQuotes] = React.useState<any[]>([]);
    const [leaderboard, setLeaderboard] = React.useState<any[]>([]);
    const [currentUser, setCurrentUser] = React.useState<any>(null);
    const [activeComments, setActiveComments] = React.useState<number | null>(null);
    const [comments, setComments] = React.useState<any[]>([]);
    const [newComment, setNewComment] = React.useState('');

    React.useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) setCurrentUser(JSON.parse(user));

        const fetchExplore = async () => {
            try {
                const userId = user ? JSON.parse(user).id : 0;
                const res = await fetch(`${API_BASE_URL}/api/quotes/approved?user_id=${userId}`);
                if (res.ok) {
                    const data = await res.json();
                    setExploreQuotes(data);
                }
            } catch (err) {
                console.error(err);
            }
        };

        const fetchLeaderboard = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/quotes/leaderboard`);
                if (res.ok) {
                    const data = await res.json();
                    setLeaderboard(data);
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchExplore();
        fetchLeaderboard();
    }, []);

    const handleLike = async (quoteId: number) => {
        if (!currentUser) return alert('Beğenmek için giriş yapmalısın!');
        try {
            const res = await fetch(`${API_BASE_URL}/api/quotes/${quoteId}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: currentUser.id })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.newlyEarnedBadges && data.newlyEarnedBadges.length > 0) {
                    showBadges(data.newlyEarnedBadges);
                }

                // Refresh specific quote
                setExploreQuotes(prev => prev.map(q => {
                    if (q.quote_id === quoteId) {
                        const liked = !q.is_liked;
                        return {
                            ...q,
                            is_liked: liked ? 1 : 0,
                            begeni_sayisi: liked ? q.begeni_sayisi + 1 : q.begeni_sayisi - 1
                        };
                    }
                    return q;
                }));
            } else {
                const errData = await res.json().catch(() => ({}));
                alert('Beğeni işlemi başarısız: ' + (errData.error || res.statusText));
            }
        } catch (err) {
            console.error(err);
            alert('Bağlantı hatası: Sunucuya ulaşılamıyor.');
        }
    };

    const fetchComments = async (quoteId: number) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/quotes/${quoteId}/comments`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
                setActiveComments(quoteId);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleComment = async (quoteId: number) => {
        if (!currentUser) return alert('Yorum yapmak için giriş yapmalısın!');
        if (!newComment.trim()) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/quotes/${quoteId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: currentUser.id, content: newComment })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.newlyEarnedBadges && data.newlyEarnedBadges.length > 0) {
                    showBadges(data.newlyEarnedBadges);
                }

                setNewComment('');
                fetchComments(quoteId);
                // Update comment count in list
                setExploreQuotes(prev => prev.map(q => q.quote_id === quoteId ? { ...q, yorum_sayisi: q.yorum_sayisi + 1 } : q));
            } else {
                const errData = await res.json().catch(() => ({}));
                alert('Yorum yapılamadı: ' + (errData.error || res.statusText));
            }
        } catch (err) {
            console.error(err);
            alert('Bağlantı hatası: Yorum gönderilemedi.');
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        if (!window.confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teacher_id: currentUser.id })
            });
            if (res.ok) {
                setComments(prev => prev.filter(c => c.comment_id !== commentId));
                // Optionally update comment count in list (visual approximation)
                setExploreQuotes(prev => prev.map(q => q.quote_id === activeComments ? { ...q, yorum_sayisi: Math.max(0, q.yorum_sayisi - 1) } : q));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleReport = async (quoteId: number) => {
        if (!currentUser) return alert('Bildirmek için giriş yapmalısın!');
        const reason = prompt('Neden bildiriyorsunuz? (Uygunsuz içerik, spam vb.)');
        if (!reason) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/quotes/${quoteId}/report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: currentUser.id, reason })
            });
            if (res.ok) {
                alert('Bildiriminiz alındı. Teşekkürler.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            {/* Hero Section */}
            <section style={{
                background: 'linear-gradient(to bottom, var(--neutral-50), white)',
                padding: 'clamp(3rem, 10vw, 6rem) 0',
                textAlign: 'center'
            }}>
                <div className="container">
                    <h1 style={{
                        fontSize: 'clamp(2rem, 8vw, 3.5rem)',
                        marginBottom: '1.5rem',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--neutral-800))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        display: 'inline-block',
                        lineHeight: 1.2
                    }}>
                        Satır Arasında Kalanı <br className="mobile-hidden" /> Yeniden Düşünmek
                    </h1>
                    <p style={{
                        fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                        color: 'var(--neutral-600)',
                        maxWidth: '700px',
                        margin: '0 auto 2.5rem',
                        padding: '0 1rem'
                    }}>
                        Edebi Kıvılcım ile okuduğun kitaplardan alıntılar paylaş, rozetler kazan ve okul arkadaşlarınla edebi bir yolculuğa çık.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexDirection: 'row', flexWrap: 'wrap' }}>
                        <button className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }} onClick={() => window.location.href = '/register'}>
                            Hemen Başla
                        </button>
                        <button className="btn btn-outline" style={{ padding: '0.75rem 1.5rem' }}>
                            Platformu Keşfet
                        </button>
                    </div>
                </div>
            </section>

            {/* Leaderboard Section */}
            {leaderboard.length > 0 && (
                <section style={{ padding: '3rem 0', backgroundColor: 'var(--neutral-50)' }}>
                    <div className="container">
                        <div style={{
                            background: 'white',
                            borderRadius: 'var(--radius-xl)',
                            padding: '2.5rem',
                            boxShadow: 'var(--shadow-lg)',
                            border: '1px solid var(--neutral-100)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2rem'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--neutral-900)' }}>🏆 Haftanın Okurları</h2>
                                <p style={{ color: 'var(--neutral-500)', fontSize: '0.95rem' }}>Edebiyat dünyasına en çok katkı sağlayan öğrencilerimiz</p>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '1.5rem'
                            }}>
                                {leaderboard.map((student, index) => (
                                    <div key={student.user_id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '1rem',
                                        background: index < 3 ? 'linear-gradient(to right, var(--color-primary-light), white)' : 'white',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--neutral-100)',
                                        transition: 'transform 0.2s ease'
                                    }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: index === 0 ? 'var(--color-secondary)' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'var(--neutral-100)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                            color: index < 3 ? 'white' : 'var(--neutral-600)',
                                            fontSize: '0.9rem'
                                        }}>
                                            {index + 1}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--neutral-800)' }}>{student.ogrenci_adi}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--neutral-500)' }}>{student.alinti_sayisi} Alıntı</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Explore Feed Section */}
            <section style={{ padding: '5rem 0', backgroundColor: 'white' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>Edebi Keşifler</h2>
                        <p style={{ color: 'var(--neutral-600)', maxWidth: '600px', margin: '0 auto' }}>
                            Öğrencilerimizin paylaştığı en etkileyici satırlara göz atın.
                        </p>
                    </div>

                    {exploreQuotes.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--neutral-400)' }}>
                            Keşfedilecek alıntı bulunamadı. İlk adımı sen at!
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                            gap: '2rem'
                        }}>
                            {exploreQuotes.map((quote) => (
                                <div key={quote.quote_id} className="card" style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    borderTop: '4px solid var(--color-primary)'
                                }}>
                                    <div>
                                        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <span style={{
                                                fontSize: '2rem',
                                                lineHeight: 1,
                                                color: 'var(--color-primary)',
                                                fontFamily: 'var(--font-serif)',
                                                opacity: 0.3
                                            }}>“</span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--neutral-400)' }}>
                                                {new Date(quote.paylasim_tarihi).toLocaleDateString('tr-TR')}
                                            </span>
                                        </div>
                                        <p style={{
                                            fontFamily: 'var(--font-serif)',
                                            fontSize: '1.1rem',
                                            lineHeight: '1.6',
                                            fontStyle: 'italic',
                                            marginBottom: '1.5rem',
                                            color: 'var(--neutral-800)'
                                        }}>
                                            {quote.icerik}
                                        </p>
                                    </div>
                                    <div style={{ borderTop: '1px solid var(--neutral-100)', paddingTop: '1rem', marginTop: 'auto' }}>
                                        <div style={{ fontWeight: 600, color: 'var(--neutral-900)' }}>{quote.kitap_adi}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--neutral-500)', display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <span>{quote.yazar}</span>
                                            <span style={{ fontWeight: 500, color: 'var(--color-secondary)' }}>— {quote.ogrenci_adi}</span>
                                        </div>

                                        {/* Social Actions */}
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', borderTop: '1px solid var(--neutral-50)', paddingTop: '0.75rem' }}>
                                            <button
                                                onClick={() => handleLike(quote.quote_id)}
                                                style={{
                                                    background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem',
                                                    color: quote.is_liked ? 'var(--color-error)' : 'var(--neutral-500)', fontSize: '0.9rem', fontWeight: 500
                                                }}
                                            >
                                                {quote.is_liked ? '❤️' : '🤍'} {quote.begeni_sayisi}
                                            </button>
                                            <button
                                                onClick={() => fetchComments(quote.quote_id)}
                                                style={{
                                                    background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem',
                                                    color: 'var(--neutral-500)', fontSize: '0.9rem', fontWeight: 500
                                                }}
                                            >
                                                💬 {quote.yorum_sayisi}
                                            </button>
                                            <button
                                                onClick={() => handleReport(quote.quote_id)}
                                                style={{
                                                    background: 'none', border: 'none', marginLeft: 'auto',
                                                    color: 'var(--neutral-300)', fontSize: '0.8rem'
                                                }}
                                                title="Şikayet Et"
                                            >
                                                🚩
                                            </button>
                                        </div>

                                        {/* Comments Section */}
                                        {activeComments === quote.quote_id && (
                                            <div style={{ marginTop: '1rem', background: 'var(--neutral-50)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
                                                <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem' }}>
                                                    {comments.length === 0 ? (
                                                        <div style={{ color: 'var(--neutral-400)', textAlign: 'center' }}>Henüz yorum yok.</div>
                                                    ) : (
                                                        comments.map(c => (
                                                            <div key={c.comment_id} style={{
                                                                marginBottom: '0.5rem', borderBottom: '1px solid var(--neutral-100)', paddingBottom: '0.25rem',
                                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                                            }}>
                                                                <div>
                                                                    <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{c.kullanici_adi}: </span>
                                                                    <span>{c.yorum_metin}</span>
                                                                </div>
                                                                {currentUser?.rol === 'ogretmen' && (
                                                                    <button
                                                                        onClick={() => handleDeleteComment(c.comment_id)}
                                                                        style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', fontSize: '0.75rem' }}
                                                                    >
                                                                        Sil
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <input
                                                        type="text"
                                                        placeholder="Yorum yap..."
                                                        value={newComment}
                                                        onChange={(e) => setNewComment(e.target.value)}
                                                        style={{
                                                            flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--neutral-200)',
                                                            fontSize: '0.85rem'
                                                        }}
                                                    />
                                                    <button onClick={() => handleComment(quote.quote_id)} className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>Gönder</button>
                                                </div>
                                                <button
                                                    onClick={() => setActiveComments(null)}
                                                    style={{ display: 'block', width: '100%', marginTop: '0.5rem', border: 'none', background: 'none', color: 'var(--neutral-400)', fontSize: '0.75rem' }}
                                                >
                                                    Kapat
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default HomePage;
