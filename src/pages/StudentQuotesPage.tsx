import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import DashboardLayout from '../components/Layout/DashboardLayout';

const StudentQuotesPage: React.FC = () => {
    const [quotes, setQuotes] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [activeComments, setActiveComments] = useState<number | null>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState<{ id: number, author: string } | null>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.rol === 'ogretmen') {
                window.location.href = '/dashboard/teacher';
                return;
            }
            setCurrentUser(user);
            fetchMyQuotes(user.id);
        } else {
            window.location.href = '/login';
        }
    }, []);

    const fetchMyQuotes = async (userId: number) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/quotes/user/${userId}`);
            if (res.ok) {
                const data = await res.json();
                setQuotes(data);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        }
    };

    const fetchComments = async (quoteId: number) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/quotes/${quoteId}/comments`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
                setActiveComments(quoteId);
                setReplyTo(null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleComment = async (quoteId: number) => {
        if (!currentUser || !newComment.trim()) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/quotes/${quoteId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: currentUser.id,
                    content: newComment,
                    parent_id: replyTo?.id
                })
            });
            if (res.ok) {
                setNewComment('');
                setReplyTo(null);
                fetchComments(quoteId);
                setQuotes(prev => prev.map(q => q.quote_id === quoteId ? { ...q, yorum_sayisi: q.yorum_sayisi + 1 } : q));
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Helper to organize comments into a threaded list
    const getThreadedComments = (flatComments: any[]) => {
        const threaded: any[] = [];
        const map = new Map();

        // Pass 1: Add all top-level comments and map everything
        flatComments.forEach(c => {
            map.set(c.comment_id, { ...c, replies: [] });
        });

        flatComments.forEach(c => {
            if (c.parent_comment_id && map.has(c.parent_comment_id)) {
                map.get(c.parent_comment_id).replies.push(map.get(c.comment_id));
            } else if (!c.parent_comment_id) {
                threaded.push(map.get(c.comment_id));
            }
        });

        // Flatten the tree for linear rendering with indentation
        const result: any[] = [];
        const flatten = (nodes: any[], depth: number) => {
            nodes.forEach(node => {
                result.push({ ...node, depth });
                if (node.replies.length > 0) {
                    flatten(node.replies, depth + 1);
                }
            });
        };
        flatten(threaded, 0);
        return result;
    };

    const threadedComments = getThreadedComments(comments);

    return (
        <DashboardLayout role="student">
            <h1 style={{ marginBottom: '2rem' }}>Paylaşımlarım</h1>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                Burada kendi yaptığın alıntıları görebilirsin. Son yorum alan paylaşımların en üstte listelenir.
            </p>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {quotes.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <p style={{ color: 'var(--neutral-500)' }}>Henüz bir alıntı paylaşmamışsın.</p>
                    </div>
                ) : (
                    quotes.map(quote => (
                        <div key={quote.quote_id} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                                    {quote.kitap_adi} — {quote.yazar}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--neutral-400)' }}>
                                    {new Date(quote.paylasim_tarihi).toLocaleDateString('tr-TR')}
                                </div>
                            </div>

                            <div style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: '1.1rem',
                                lineHeight: '1.6',
                                paddingLeft: '1rem',
                                borderLeft: '4px solid var(--color-secondary)',
                                marginBottom: '1rem',
                                fontStyle: 'italic'
                            }}>
                                "{quote.icerik}"
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: '1.5rem',
                                fontSize: '0.9rem',
                                color: 'var(--neutral-600)',
                                borderTop: '1px solid var(--neutral-100)',
                                paddingTop: '0.75rem'
                            }}>
                                <span style={{ cursor: 'pointer' }}>❤️ {quote.begeni_sayisi} Beğeni</span>
                                <span
                                    style={{ cursor: 'pointer', fontWeight: activeComments === quote.quote_id ? 600 : 400, color: activeComments === quote.quote_id ? 'var(--color-primary)' : 'var(--neutral-600)' }}
                                    onClick={() => activeComments === quote.quote_id ? setActiveComments(null) : fetchComments(quote.quote_id)}
                                >
                                    💬 {quote.yorum_sayisi} Yorum (Gör/Yanıtla)
                                </span>
                                {quote.last_comment_at && (
                                    <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--neutral-400)' }}>
                                        Son Yorum: {new Date(quote.last_comment_at).toLocaleString('tr-TR')}
                                    </span>
                                )}
                            </div>

                            {activeComments === quote.quote_id && (
                                <div style={{ marginTop: '1rem', background: 'var(--neutral-50)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
                                        {threadedComments.length === 0 ? (
                                            <div style={{ textAlign: 'center', color: 'var(--neutral-400)', padding: '1rem' }}>Henüz yorum yok.</div>
                                        ) : (
                                            threadedComments.map(c => (
                                                <div key={c.comment_id} style={{
                                                    marginBottom: '0.75rem',
                                                    padding: '0.75rem',
                                                    background: 'white',
                                                    borderRadius: 'var(--radius-sm)',
                                                    boxShadow: 'var(--shadow-sm)',
                                                    marginLeft: `${c.depth * 1.5}rem`,
                                                    borderLeft: c.depth > 0 ? '2px solid var(--neutral-200)' : 'none'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                                        <span style={{ fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.85rem' }}>
                                                            {c.kullanici_adi} {c.parent_author && <span style={{ color: 'var(--neutral-400)', fontWeight: 400 }}> &gt; {c.parent_author}</span>}
                                                        </span>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--neutral-400)' }}>
                                                            {new Date(c.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{c.yorum_metin}</div>
                                                    <button
                                                        onClick={() => setReplyTo({ id: c.comment_id, author: c.kullanici_adi })}
                                                        style={{ background: 'none', border: 'none', color: 'var(--color-secondary)', fontSize: '0.75rem', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                                                    >
                                                        ↩ Yanıtla
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <div style={{ borderTop: '1px solid var(--neutral-200)', paddingTop: '1rem' }}>
                                        {replyTo && (
                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                                <span><strong>{replyTo.author}</strong> kullanıcısına yanıt veriliyor...</span>
                                                <button onClick={() => setReplyTo(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-error)' }}>Vazgeç</button>
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <input
                                                type="text"
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder={replyTo ? "Yanıtınızı yazın..." : "Bir yorum yazın..."}
                                                style={{ flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--neutral-300)', fontSize: '0.9rem' }}
                                                onKeyPress={(e) => e.key === 'Enter' && handleComment(quote.quote_id)}
                                            />
                                            <button
                                                onClick={() => handleComment(quote.quote_id)}
                                                className="btn btn-primary"
                                                style={{ padding: '0.5rem 1rem' }}
                                            >
                                                Gönder
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </DashboardLayout>
    );
};

export default StudentQuotesPage;
