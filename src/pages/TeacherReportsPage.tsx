import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const TeacherReportsPage: React.FC = () => {
    const location = useLocation();
    const [reports, setReports] = useState<any[]>([]);
    const [badgeActivity, setBadgeActivity] = useState<any[]>([]);
    const [summaries, setSummaries] = useState<any[]>([]);
    const [gradedSummaries, setGradedSummaries] = useState<any[]>([]);
    const [currentUser] = useState<any>(() => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    });
    const [activeTab, setActiveTab] = useState<'reports' | 'notifications' | 'summaries' | 'graded'>('summaries');
    const [selectedSummary, setSelectedSummary] = useState<any>(null);
    const [isEditingGraded, setIsEditingGraded] = useState(false);
    const [scoreInput, setScoreInput] = useState('100');
    const [selectedClassId, setSelectedClassId] = useState<string>('all');
    const [classes, setClasses] = useState<any[]>([]);

    useEffect(() => {
        if (location.state && (location.state as any).classId) {
            setSelectedClassId((location.state as any).classId.toString());
        }
    }, [location]);

    useEffect(() => {
        fetchData();
    }, [selectedClassId]);

    const fetchData = async () => {
        try {
            const baseUrl = 'http://localhost:3000/api';
            const filterParam = selectedClassId !== 'all' ? `?class_id=${selectedClassId}` : '';

            const [reportsRes, activityRes, summariesRes, classesRes] = await Promise.all([
                fetch(`${baseUrl}/reports${filterParam}`),
                fetch(`${baseUrl}/teacher/badge-activity${filterParam}`),
                fetch(`${baseUrl}/teacher/pending-summaries${filterParam}`),
                fetch(`${baseUrl}/api/classes/teacher/${currentUser.id}`)
            ]);

            if (reportsRes.ok) setReports(await reportsRes.json());
            if (activityRes.ok) setBadgeActivity(await activityRes.json());
            if (summariesRes.ok) setSummaries(await summariesRes.json());
            if (classesRes.ok) setClasses(await classesRes.json());

            const gradedRes = await fetch(`${baseUrl}/teacher/graded-summaries${filterParam}`);
            if (gradedRes.ok) setGradedSummaries(await gradedRes.json());
        } catch (err) {
            console.error('Fetch error:', err);
        }
    };

    const handleAction = async (quoteId: number, reportId: number, action: 'delete' | 'resolve') => {
        if (!window.confirm(`${action === 'delete' ? 'Silmek' : 'Çözüldü olarak işaretlemek'} istediğinize emin misiniz?`)) return;

        try {
            if (action === 'delete') {
                await fetch(`http://localhost:3000/api/quotes/${quoteId}/status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'reddedildi' })
                });
            }
            setReports(prev => prev.filter(r => r.report_id !== reportId));
            alert('İşlem başarılı.');
        } catch (err) {
            console.error(err);
        }
    };

    const handleSummaryDecision = async (assignmentId: number, action: 'approve' | 'reject') => {
        let feedback = null;
        let score = null;

        if (action === 'reject') {
            feedback = window.prompt('Lütfen reddetme nedeninizi/ feedbackinizi yazın:');
            if (feedback === null) return;
        } else {
            score = parseInt(scoreInput);
            if (isNaN(score) || score < 0 || score > 100) {
                alert('Lütfen 0 ile 100 arasında geçerli bir puan girin.');
                return;
            }
        }

        console.log('🚀 Sending approval request:');
        console.log('  Assignment ID:', assignmentId);
        console.log('  Action:', action);
        console.log('  Score:', score);
        console.log('  Feedback:', feedback);

        try {
            const res = await fetch(`http://localhost:3000/api/assignments/${assignmentId}/${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ feedback, score })
            });
            if (res.ok) {
                const updatedItem = await res.json();
                if (!isEditingGraded) {
                    setSummaries(prev => prev.filter(s => s.assignment_id !== assignmentId));
                }
                setGradedSummaries(prev => isEditingGraded
                    ? prev.map(s => s.assignment_id === assignmentId ? updatedItem : s)
                    : [updatedItem, ...prev]
                );
                setSelectedSummary(null);
                setIsEditingGraded(false);
                setScoreInput('100'); // Reset score input
            } else {
                const errorData = await res.json().catch(() => ({}));
                alert(`İşlem sırasında bir hata oluştu: ${errorData.error || errorData.details || res.statusText}`);
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (currentUser && currentUser.rol !== 'ogretmen') {
        return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>Bu sayfaya erişim yetkiniz yok.</div>;
    }

    if (!currentUser) {
        return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>Lütfen giriş yapın.</div>;
    }

    return (
        <div className="container" style={{ padding: '4rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>Öğretmen Yönetim Paneli</h1>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: 'var(--neutral-500)' }}>Sınıf Filtresi:</span>
                    <select
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        style={{
                            padding: '0.6rem 1rem',
                            borderRadius: '12px',
                            border: '1px solid var(--neutral-200)',
                            background: 'white',
                            fontWeight: 600,
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="all">Hepsi</option>
                        <option value="null">Bireysel Ödevler</option>
                        {classes.map(c => (
                            <option key={c.class_id} value={c.class_id}>{c.sinif_adi}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--neutral-200)', overflowX: 'auto' }}>
                <button
                    onClick={() => setActiveTab('summaries')}
                    style={{
                        padding: '1.25rem 2rem',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'summaries' ? '4px solid var(--color-primary)' : '4px solid transparent',
                        color: activeTab === 'summaries' ? 'var(--color-primary)' : 'var(--neutral-500)',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s'
                    }}
                >
                    📝 Bekleyen Özetler ({summaries.length})
                </button>
                <button
                    onClick={() => setActiveTab('graded')}
                    style={{
                        padding: '1.25rem 2rem',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'graded' ? '4px solid var(--color-primary)' : '4px solid transparent',
                        color: activeTab === 'graded' ? 'var(--color-primary)' : 'var(--neutral-500)',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s'
                    }}
                >
                    🎓 Puanlanan Özetler ({gradedSummaries.length})
                </button>
                <button
                    onClick={() => setActiveTab('reports')}
                    style={{
                        padding: '1.25rem 2rem',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'reports' ? '4px solid var(--color-primary)' : '4px solid transparent',
                        color: activeTab === 'reports' ? 'var(--color-primary)' : 'var(--neutral-500)',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s'
                    }}
                >
                    🚩 Alıntı Raporları ({reports.length})
                </button>
                <button
                    onClick={() => setActiveTab('notifications')}
                    style={{
                        padding: '1.25rem 2rem',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'notifications' ? '4px solid var(--color-primary)' : '4px solid transparent',
                        color: activeTab === 'notifications' ? 'var(--color-primary)' : 'var(--neutral-500)',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s'
                    }}
                >
                    🔔 Yeni Rozetler ({badgeActivity.length})
                </button>
            </div>

            {activeTab === 'summaries' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                    {summaries.length === 0 ? (
                        <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                            <h3 style={{ color: 'var(--neutral-700)' }}>Harika Haber!</h3>
                            <p style={{ color: 'var(--neutral-500)' }}>Şu an kontrol edilmeyi bekleyen özet bulunmuyor.</p>
                        </div>
                    ) : (
                        summaries.map(s => (
                            <div key={s.assignment_id} className="card" style={{
                                padding: '2rem',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                border: '1px solid var(--neutral-100)',
                                transition: 'transform 0.2s',
                                cursor: 'pointer'
                            }} onClick={() => setSelectedSummary(s)}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <div style={{
                                                background: 'var(--color-primary-light)',
                                                color: 'var(--color-primary)',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '2rem',
                                                fontSize: '0.8rem',
                                                fontWeight: 700
                                            }}>
                                                YENİ GÖNDERİM
                                            </div>
                                            {(() => {
                                                const today = new Date();
                                                today.setHours(0, 0, 0, 0);
                                                const dueDate = new Date(s.due_date);
                                                dueDate.setHours(0, 0, 0, 0);
                                                if (dueDate < today) {
                                                    return (
                                                        <div style={{
                                                            background: '#fee2e2',
                                                            color: 'var(--color-error)',
                                                            padding: '0.25rem 0.75rem',
                                                            borderRadius: '2rem',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 700
                                                        }}>
                                                            ⚠️ GEÇ TESLİM
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--neutral-400)' }}>
                                            {new Date(s.assigned_date).toLocaleDateString('tr-TR')}
                                        </span>
                                    </div>
                                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem' }}>{s.ogrenci_adi}</h3>
                                    <div style={{ fontWeight: 600, color: 'var(--neutral-600)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span>{s.assignment_type === 'writing' ? '✍️' : '📖'}</span>
                                        {s.sinif_adi && <span style={{ color: 'var(--color-primary)', fontSize: '0.8rem', marginRight: '0.25rem' }}>[{s.sinif_adi}]</span>}
                                        {s.assignment_type === 'writing' ? s.title : s.kitap_adi}
                                    </div>
                                    <p style={{
                                        color: 'var(--neutral-500)',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.5',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        marginBottom: '1.5rem'
                                    }}>
                                        {s.summary_text}
                                    </p>
                                </div>
                                <button className="btn btn-outline" style={{ width: '100%', fontWeight: 600 }}> Özetini Oku & Değerlendir</button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'graded' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                    {gradedSummaries.length === 0 ? (
                        <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
                            <h3 style={{ color: 'var(--neutral-700)' }}>Henüz Puanlanan Özet Yok</h3>
                            <p style={{ color: 'var(--neutral-500)' }}>Öğrencilerin özetlerini değerlendirdikçe burada görebilirsiniz.</p>
                        </div>
                    ) : (
                        gradedSummaries.map(s => (
                            <div key={s.assignment_id} className="card" style={{
                                padding: '2rem',
                                borderLeft: `6px solid ${s.score >= 70 ? 'var(--color-success)' : s.score >= 40 ? 'var(--color-secondary)' : 'var(--color-error)'}`
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <h3 style={{ margin: 0 }}>{s.ogrenci_adi}</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                        <div style={{
                                            backgroundColor: s.score >= 70 ? 'var(--color-success)' : s.score >= 40 ? 'var(--color-secondary)' : 'var(--color-error)',
                                            color: 'white',
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: 'var(--radius-md)',
                                            fontWeight: 800,
                                            fontSize: '1.2rem'
                                        }}>
                                            {s.score}
                                        </div>
                                        {(() => {
                                            const dueDate = new Date(s.due_date);
                                            dueDate.setHours(0, 0, 0, 0);
                                            const assignedDate = new Date(s.assigned_date); // This is likely the submission date in this context
                                            // More accurately, let's use the current date or assigned_date check if backend updated it
                                            if (dueDate < assignedDate) {
                                                return <span style={{ fontSize: '0.7rem', color: 'var(--color-error)', fontWeight: 700 }}>⚠️ GEÇ TESLİM</span>;
                                            }
                                            return null;
                                        })()}
                                    </div>
                                </div>
                                <div style={{ fontWeight: 600, color: 'var(--neutral-600)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>{s.assignment_type === 'writing' ? '✍️' : '📖'}</span>
                                    {s.assignment_type === 'writing' ? s.title : s.kitap_adi}
                                </div>
                                <p style={{
                                    color: 'var(--neutral-500)',
                                    fontSize: '0.9rem',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    marginBottom: '1rem'
                                }}>
                                    {s.summary_text}
                                </p>
                                <div style={{ fontSize: '0.8rem', color: 'var(--neutral-400)', textAlign: 'right', marginBottom: '1rem' }}>
                                    {new Date(s.assigned_date).toLocaleDateString('tr-TR')} tarihinde verildi
                                </div>
                                <button
                                    className="btn btn-outline"
                                    style={{ width: '100%', fontSize: '0.9rem', padding: '0.5rem' }}
                                    onClick={() => {
                                        setSelectedSummary(s);
                                        setScoreInput(s.score.toString());
                                        setIsEditingGraded(true);
                                    }}
                                >
                                    ✏️ Notu Düzenle
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Selected Summary Modal */}
            {selectedSummary && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '2rem'
                }} onClick={() => {
                    setSelectedSummary(null);
                    setIsEditingGraded(false);
                    setScoreInput('100'); // Reset score when closing modal
                }}>
                    <div className="card" style={{
                        width: '100%',
                        maxWidth: '800px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        padding: '3rem',
                        position: 'relative'
                    }} onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => {
                                setSelectedSummary(null);
                                setIsEditingGraded(false);
                                setScoreInput('100'); // Reset score when closing modal
                            }}
                            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--neutral-400)' }}
                        >
                            ✕
                        </button>

                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                {isEditingGraded ? 'Not Düzenleme' : (selectedSummary.assignment_type === 'writing' ? 'Ödev Değerlendirmesi' : 'Kitap Özeti Değerlendirmesi')}
                            </div>
                            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{selectedSummary.ogrenci_adi}</h2>
                            <div style={{ fontSize: '1.2rem', color: 'var(--neutral-600)' }}>
                                <strong>{selectedSummary.assignment_type === 'writing' ? selectedSummary.title : selectedSummary.kitap_adi}</strong>
                                {selectedSummary.assignment_type !== 'writing' && ` — ${selectedSummary.yazar}`}
                            </div>
                        </div>

                        <div style={{
                            padding: '2rem',
                            backgroundColor: 'var(--neutral-50)',
                            borderRadius: 'var(--radius-lg)',
                            lineHeight: '1.8',
                            fontSize: '1.1rem',
                            marginBottom: '2rem',
                            whiteSpace: 'pre-wrap',
                            border: '1px solid var(--neutral-100)'
                        }}>
                            {selectedSummary.summary_text}
                        </div>

                        <div style={{ marginBottom: '2.5rem' }}>
                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.75rem', fontSize: '1.1rem', color: 'var(--neutral-700)' }}>
                                Başarı Puanı (0-100):
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={scoreInput}
                                    onChange={(e) => setScoreInput(e.target.value)}
                                    style={{
                                        flex: 1,
                                        height: '8px',
                                        cursor: 'pointer'
                                    }}
                                />
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={scoreInput}
                                    onChange={(e) => setScoreInput(e.target.value)}
                                    className="input-field"
                                    style={{
                                        width: '100px',
                                        padding: '0.75rem 1rem',
                                        fontSize: '1.5rem',
                                        fontWeight: 800,
                                        textAlign: 'center',
                                        border: '3px solid var(--color-primary)',
                                        borderRadius: 'var(--radius-md)',
                                        backgroundColor: scoreInput >= '70' ? '#dcfce7' :
                                            scoreInput >= '40' ? '#fef3c7' : '#fee2e2'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', borderTop: '1px solid var(--neutral-100)', paddingTop: '2.5rem' }}>
                            <button
                                onClick={() => handleSummaryDecision(selectedSummary.assignment_id, 'approve')}
                                className="btn btn-primary"
                                style={{ flex: 2, padding: '1rem', fontSize: '1.1rem', backgroundColor: 'var(--color-success)', borderColor: 'var(--color-success)' }}
                            >
                                {isEditingGraded ? '💾 Yeni Notu Kaydet' : '✅ Özeti Onayla ve Ödevi Tamamla'}
                            </button>
                            {!isEditingGraded && (
                                <button
                                    onClick={() => handleSummaryDecision(selectedSummary.assignment_id, 'reject')}
                                    className="btn btn-outline"
                                    style={{ flex: 1, padding: '1rem', fontSize: '1.1rem', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                                >
                                    ✍️ Revize İste / Geri Gönder
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'notifications' && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {badgeActivity.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                            <p style={{ color: 'var(--neutral-500)' }}>Henüz bir rozet bildirimi yok.</p>
                        </div>
                    ) : (
                        badgeActivity.map((activity, idx) => (
                            <div key={idx} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
                                <div style={{ fontSize: '2.5rem', background: 'var(--neutral-50)', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                                    {activity.ikon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.1rem' }}>{activity.ogrenci_adi}</div>
                                    <div style={{ fontSize: '1rem' }}>
                                        <strong>{activity.rozet_adi}</strong> rozetini kazandı!
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--neutral-400)', marginTop: '0.5rem' }}>
                                        Kategori: {activity.kategori} | Tarih: {new Date(activity.kazanim_tarihi).toLocaleString('tr-TR')}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'reports' && (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {reports.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '5rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
                            <h3 style={{ color: 'var(--neutral-700)' }}>Sakin Bir Gün</h3>
                            <p style={{ color: 'var(--neutral-500)' }}>Şu an için raporlanmış uygunsuz bir içerik bulunmuyor.</p>
                        </div>
                    ) : (
                        reports.map(report => (
                            <div key={report.report_id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '40px', height: '40px', background: '#fee2e2', color: '#dc2626', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>!</div>
                                        <div>
                                            <div style={{ fontWeight: 700 }}>Raporlayan: {report.reporter_name}</div>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--neutral-400)' }}>
                                                {new Date(report.created_at).toLocaleString('tr-TR')}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ background: '#fef2f2', color: '#991b1b', padding: '0.4rem 1rem', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: 700 }}>
                                        Acil İnceleme
                                    </div>
                                </div>

                                <div style={{ padding: '1.5rem', background: 'var(--neutral-50)', borderRadius: 'var(--radius-md)', fontStyle: 'italic', borderLeft: '5px solid var(--color-error)' }}>
                                    "{report.quote_content}"
                                </div>

                                <div style={{ fontSize: '1rem', backgroundColor: '#fff7ed', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #ffedd5' }}>
                                    <span style={{ fontWeight: 700, color: '#9a3412' }}>ŞİKAYET NEDENİ: </span>
                                    {report.reason}
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                    <button
                                        onClick={() => handleAction(report.quote_id, report.report_id, 'delete')}
                                        className="btn btn-primary"
                                        style={{ background: 'var(--color-error)', borderColor: 'var(--color-error)', flex: 1 }}
                                    >
                                        İçeriği Sil (Onayla)
                                    </button>
                                    <button
                                        onClick={() => handleAction(report.quote_id, report.report_id, 'resolve')}
                                        className="btn btn-outline"
                                        style={{ flex: 1 }}
                                    >
                                        Raporu Kapat (Reddet)
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default TeacherReportsPage;
