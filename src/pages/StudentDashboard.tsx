import React from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { useBadges } from '../context/BadgeContext';

const StudentDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { showBadges } = useBadges();
    const [assignments, setAssignments] = React.useState<any[]>([]);
    const [feedQuotes, setFeedQuotes] = React.useState<any[]>([]);
    const [realStats, setRealStats] = React.useState({ totalQuotes: 0, totalBooks: 0, totalBadges: 0, totalSummaries: 0 });
    const [currentUser, setCurrentUser] = React.useState<any>(null);
    const [activeComments, setActiveComments] = React.useState<number | null>(null);
    const [comments, setComments] = React.useState<any[]>([]);
    const [newComment, setNewComment] = React.useState('');
    const [myClasses, setMyClasses] = React.useState<any[]>([]);
    const [classCode, setClassCode] = React.useState('');
    const [joinMessage, setJoinMessage] = React.useState({ text: '', type: '' });

    React.useEffect(() => {
        // Get user from localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.rol === 'ogretmen') {
                navigate('/dashboard/teacher');
                return;
            }
            setCurrentUser(user);
            fetchAssignments(user.id);
            fetchFeed(user.id);
            fetchStats(user.id);
            fetchMyClasses(user.id);
        } else {
            navigate('/login');
        }
    }, []);

    const fetchMyClasses = async (userId: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/classes/student/${userId}`);
            const data = await response.json();
            setMyClasses(data);
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    const handleJoinClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!classCode.trim()) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/classes/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ student_id: currentUser.id, sinif_kodu: classCode })
            });
            const data = await res.json();
            if (res.ok) {
                setJoinMessage({ text: `"${data.sinif_adi}" sınıfına başarıyla katıldınız!`, type: 'success' });
                setClassCode('');
                fetchMyClasses(currentUser.id);
            } else {
                setJoinMessage({ text: data.error || 'Bir hata oluştu.', type: 'error' });
            }
            setTimeout(() => setJoinMessage({ text: '', type: '' }), 4000);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAssignments = async (userId: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/assignments/student/${userId}`);
            const data = await response.json();
            setAssignments(data);
        } catch (error) {
            console.error('Error fetching assignments:', error);
        }
    };


    const fetchFeed = async (userId?: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/quotes/approved?user_id=${userId || 0}`);
            const data = await response.json();
            setFeedQuotes(data);
        } catch (error) {
            console.error('Error fetching feed:', error);
        }
    };

    const fetchStats = async (userId: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/dashboard/student/stats/${userId}`);
            const data = await response.json();
            setRealStats(data);
            if (data.newlyEarnedBadges && data.newlyEarnedBadges.length > 0) {
                showBadges(data.newlyEarnedBadges);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleLike = async (quoteId: number) => {
        if (!currentUser) return;
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

                setFeedQuotes(prev => prev.map(q => {
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
        if (!currentUser) return;
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
                setFeedQuotes(prev => prev.map(q => q.quote_id === quoteId ? { ...q, yorum_sayisi: q.yorum_sayisi + 1 } : q));
            } else {
                const errData = await res.json().catch(() => ({}));
                alert('Yorum yapılamadı: ' + (errData.error || res.statusText));
            }
        } catch (err) {
            console.error(err);
            alert('Bağlantı hatası: Yorum gönderilemedi.');
        }
    };

    return (
        <DashboardLayout role="student">
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', margin: 0 }}>Hoş Geldin, {currentUser?.name || 'Ömer'}! 👋</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Bugün okuma hedeflerine bir adım daha yaklaş.</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate('/share-quote')}
                    style={{ whiteSpace: 'nowrap' }}
                >
                    + Paylaşım Yap
                </button>
            </div>

            {/* Sınıfa Katıl ve Sınıflarım Bölümü */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', marginBottom: '2.5rem' }}>
                <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #ffffff, #f0f9ff)' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        🏫 Sınıfa Katıl
                    </h3>
                    <form onSubmit={handleJoinClass} style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="text"
                            placeholder="Sınıf Kodu (6 Haneli)"
                            className="input-field"
                            value={classCode}
                            onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                            maxLength={6}
                            style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)' }}
                        />
                        <button type="submit" className="btn btn-secondary">Katıl</button>
                    </form>
                    {joinMessage.text && (
                        <p style={{
                            marginTop: '0.75rem',
                            fontSize: '0.9rem',
                            color: joinMessage.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
                            fontWeight: 600
                        }}>
                            {joinMessage.text}
                        </p>
                    )}
                </div>

                <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--neutral-100)' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        📚 Sınıflarım
                    </h3>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {myClasses.length === 0 ? (
                            <p style={{ color: 'var(--neutral-400)', fontSize: '0.9rem' }}>Henüz bir sınıfa katılmamışsınız.</p>
                        ) : (
                            myClasses.map(c => (
                                <div
                                    key={c.class_id}
                                    onClick={() => navigate(`/dashboard/class/${c.class_id}`)}
                                    style={{
                                        backgroundColor: 'white',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '12px',
                                        border: '1px solid var(--neutral-100)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        boxShadow: 'var(--shadow-sm)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-primary)' }}>{c.sinif_adi}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>{c.hoca_adi}</span>
                                    </div>
                                    <button
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            if (window.confirm(`${c.sinif_adi} sınıfından ayrılmak istediğinize emin misiniz?`)) {
                                                try {
                                                    const res = await fetch(`${API_BASE_URL}/api/classes/leave`, {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ class_id: c.class_id, student_id: currentUser.id })
                                                    });
                                                    if (res.ok) {
                                                        fetchMyClasses(currentUser.id);
                                                    }
                                                } catch (err) {
                                                    console.error(err);
                                                }
                                            }
                                        }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem',
                                            padding: '0.2rem',
                                            borderRadius: '4px',
                                            color: 'var(--neutral-400)'
                                        }}
                                        title="Sınıftan Ayrıl"
                                    >
                                        ❌
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2.5rem'
            }}>
                <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ color: 'var(--color-primary)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>TOPLAM ALINTI</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>{realStats.totalQuotes}</div>
                </div>
                <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ color: 'var(--color-secondary)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>ROZETLER</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>{realStats.totalBadges}</div>
                </div>
                <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ color: 'var(--color-success)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>OKUNAN KİTAP</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>{realStats.totalBooks}</div>
                </div>
                <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ color: 'var(--color-secondary-dark)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>KİTAP ÖZETLERİ</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>{realStats.totalSummaries}</div>
                </div>
            </div>

            {/* Assignments Section */}
            <div style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--neutral-100)', paddingBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Ödevlerim</h2>
                </div>

                {/* Sınıf Ödevleri Section */}
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--neutral-600)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🏫 Sınıf Ödevleri
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    {(() => {
                        const classAssignments = assignments.filter(a => a.class_id !== null);

                        if (classAssignments.length === 0) {
                            return (
                                <div className="card" style={{ textAlign: 'center', color: 'var(--neutral-500)', padding: '2rem', gridColumn: '1/-1' }}>
                                    Atanmış bir sınıf ödevi bulunmuyor.
                                </div>
                            );
                        }


                        return classAssignments.map((assignment) => (
                            <div
                                key={assignment.assignment_id}
                                className="card"
                                style={{
                                    borderLeft: `4px solid ${assignment.status === 'completed' ? 'var(--color-success)' :
                                        assignment.status === 'submitted' ? 'var(--color-secondary)' :
                                            assignment.status === 'rejected' ? 'var(--color-error)' : 'var(--color-primary)'
                                        }`,
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                }}
                                onClick={() => navigate(`/assignment/${assignment.assignment_id}`)}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                    <div style={{
                                        fontSize: '1.5rem',
                                        backgroundColor: assignment.assignment_type === 'writing' ? 'var(--color-secondary-light)' : 'var(--color-primary-light)',
                                        width: '45px',
                                        height: '45px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {assignment.assignment_type === 'writing' ? '✍️' : '📖'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.25rem' }}>
                                            {assignment.assignment_type === 'writing' ? (assignment.title || 'Başlıksız Ödev') : assignment.kitap_adi}
                                        </div>
                                        <div style={{ color: 'var(--neutral-600)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                            {assignment.assignment_type === 'writing' ? (assignment.description?.substring(0, 60) + (assignment.description?.length > 60 ? '...' : '')) : assignment.yazar}
                                        </div>
                                        {assignment.sinif_adi && (
                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                                                📌 {assignment.sinif_adi}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                                    <span style={{ color: 'var(--color-error)', fontWeight: 500 }}>
                                        📅 {new Date(assignment.due_date).toLocaleDateString('tr-TR')}
                                    </span>
                                    <span style={{
                                        background: assignment.status === 'completed' ? 'var(--color-success-light)' :
                                            assignment.status === 'submitted' ? 'var(--color-secondary-light)' :
                                                assignment.status === 'rejected' ? '#fee2e2' : 'var(--neutral-100)',
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '6px',
                                        color: assignment.status === 'completed' ? 'var(--color-success)' :
                                            assignment.status === 'submitted' ? 'var(--color-secondary)' :
                                                assignment.status === 'rejected' ? 'var(--color-error)' : 'inherit',
                                        fontWeight: 700
                                    }}>
                                        {assignment.status === 'completed' ? 'Tamamlandı' : assignment.status === 'submitted' ? 'İncelemede' : assignment.status === 'rejected' ? 'Düzenleme' : 'Devam Ediyor'}
                                    </span>
                                </div>
                            </div>
                        ))
                    })()}
                </div>

                {/* Bireysel Ödevler Section */}
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--neutral-600)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    👤 Bireysel Ödevler
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {assignments.filter(a => a.class_id === null).length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', color: 'var(--neutral-500)', padding: '2rem', gridColumn: '1/-1' }}>
                            Atanmış bireysel bir ödev bulunmuyor.
                        </div>
                    ) : (
                        assignments.filter(a => a.class_id === null).map((assignment) => (
                            <div
                                key={assignment.assignment_id}
                                className="card"
                                style={{
                                    borderLeft: `4px solid ${assignment.status === 'completed' ? 'var(--color-success)' :
                                        assignment.status === 'submitted' ? 'var(--color-secondary)' :
                                            assignment.status === 'rejected' ? 'var(--color-error)' : 'var(--color-primary)'
                                        }`,
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                }}
                                onClick={() => navigate(`/assignment/${assignment.assignment_id}`)}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                    <div style={{
                                        fontSize: '1.5rem',
                                        backgroundColor: assignment.assignment_type === 'writing' ? 'var(--color-secondary-light)' : 'var(--color-primary-light)',
                                        width: '45px',
                                        height: '45px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {assignment.assignment_type === 'writing' ? '✍️' : '📖'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.25rem' }}>
                                            {assignment.assignment_type === 'writing' ? (assignment.title || 'Başlıksız Ödev') : assignment.kitap_adi}
                                        </div>
                                        <div style={{ color: 'var(--neutral-600)', fontSize: '0.9rem' }}>
                                            {assignment.assignment_type === 'writing' ? (assignment.description?.substring(0, 60) + (assignment.description?.length > 60 ? '...' : '')) : assignment.yazar}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                                    <span style={{ color: 'var(--color-error)', fontWeight: 500 }}>
                                        📅 {new Date(assignment.due_date).toLocaleDateString('tr-TR')}
                                    </span>
                                    <span style={{
                                        background: assignment.status === 'completed' ? 'var(--color-success-light)' :
                                            assignment.status === 'submitted' ? 'var(--color-secondary-light)' :
                                                assignment.status === 'rejected' ? '#fee2e2' : 'var(--neutral-100)',
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '6px',
                                        color: assignment.status === 'completed' ? 'var(--color-success)' :
                                            assignment.status === 'submitted' ? 'var(--color-secondary)' :
                                                assignment.status === 'rejected' ? 'var(--color-error)' : 'inherit',
                                        fontWeight: 700
                                    }}>
                                        {assignment.status === 'completed' ? 'Tamamlandı' : assignment.status === 'submitted' ? 'İncelemede' : assignment.status === 'rejected' ? 'Düzenleme' : 'Devam Ediyor'}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Feed Section */}
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Edebi Akış (Tüm Paylaşımlar)</h2>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {feedQuotes.length === 0 ? (
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
                                background: quote.is_nitelikli ? 'linear-gradient(to right, #fff, #fefce8)' : 'white',
                                position: 'relative'
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
                                                    fontSize: '0.7rem',
                                                    backgroundColor: 'var(--color-secondary)',
                                                    color: 'white',
                                                    padding: '0.1rem 0.4rem',
                                                    borderRadius: '8px',
                                                    fontWeight: 700
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
                                <div style={{ fontSize: '0.85rem', color: 'var(--neutral-400)' }}>
                                    {new Date(quote.paylasim_tarihi).toLocaleDateString('tr-TR')}
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

                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--neutral-100)', paddingTop: '0.75rem' }}>
                                <button
                                    onClick={() => handleLike(quote.quote_id)}
                                    style={{
                                        background: 'none', border: 'none', display: 'flex', gap: '0.4rem',
                                        color: quote.is_liked ? 'var(--color-error)' : 'var(--neutral-600)',
                                        alignItems: 'center', cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem'
                                    }}
                                >
                                    {quote.is_liked ? '❤️' : '🤍'} {quote.begeni_sayisi}
                                </button>
                                <button
                                    onClick={() => fetchComments(quote.quote_id)}
                                    style={{
                                        background: 'none', border: 'none', display: 'flex', gap: '0.4rem',
                                        color: 'var(--neutral-600)', alignItems: 'center', cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem'
                                    }}
                                >
                                    💬 {quote.yorum_sayisi}
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
                    ))
                )}
            </div>
        </DashboardLayout >
    );
};

export default StudentDashboard;
