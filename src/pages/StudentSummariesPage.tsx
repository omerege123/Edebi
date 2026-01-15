
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import DashboardLayout from '../components/Layout/DashboardLayout';

interface Assignment {
    assignment_id: number;
    kitap_adi: string;
    yazar: string;
    status: string;
    summary_text: string;
    feedback: string | null;
    score: number | null;
    sinif_adi?: string;
    title?: string;
    assignment_type?: string;
    class_id?: number | null;
    assignment_class_id?: number | null;
}

const StudentSummariesPage: React.FC = () => {
    const navigate = useNavigate();
    const [summaries, setSummaries] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSummaries = async () => {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                navigate('/login');
                return;
            }
            const user = JSON.parse(userStr);

            try {
                const res = await fetch(`${API_BASE_URL}/api/assignments/student/${user.id}`);
                if (res.ok) {
                    const data = await res.json();
                    console.log('Fetched summaries:', data); // Debug logging
                    // Filter: Only show assignments that have a summary
                    const filtered = data.filter((a: any) => a.summary_text && a.summary_text.trim() !== '');
                    setSummaries(filtered);
                } else {
                    setError('Özetler yüklenirken bir hata oluştu.');
                }
            } catch (err) {
                console.error(err);
                setError('Sunucu bağlantı hatası.');
            } finally {
                setLoading(false);
            }
        };

        fetchSummaries();
    }, [navigate]);

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'completed':
                return { label: 'Onaylandı', color: 'var(--color-success)', bg: 'var(--color-success-light)' };
            case 'submitted':
                return { label: 'İncelemede', color: 'var(--color-secondary)', bg: 'var(--color-secondary-light)' };
            case 'rejected':
                return { label: 'Düzeltme Gerekli', color: 'var(--color-error)', bg: '#fee2e2' };
            default:
                return { label: 'Taslak', color: 'var(--neutral-500)', bg: 'var(--neutral-100)' };
        }
    };

    const renderAssignmentCard = (s: Assignment) => {
        const statusInfo = getStatusInfo(s.status);
        const titleToDisplay = s.kitap_adi || s.title || 'Başlıksız Ödev';

        return (
            <div key={s.assignment_id} className="card" style={{ padding: '2rem', borderLeft: `6px solid ${statusInfo.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>{titleToDisplay}</h3>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {s.kitap_adi && (
                                <p style={{ color: 'var(--neutral-600)', fontWeight: 500, margin: 0 }}>
                                    {s.yazar}
                                </p>
                            )}
                            {(s.sinif_adi || s.assignment_class_id || s.class_id) && (
                                <span style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--color-primary)',
                                    backgroundColor: 'var(--color-primary-light)',
                                    padding: '0.1rem 0.5rem',
                                    borderRadius: '4px',
                                    fontWeight: 700
                                }}>
                                    {s.sinif_adi || 'Sınıf Ödevi'}
                                </span>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {s.status === 'completed' && s.score !== null && (
                            <div style={{
                                padding: '0.5rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: s.score >= 70 ? 'var(--color-success-light)' :
                                    s.score >= 40 ? 'var(--color-secondary-light)' : '#fee2e2',
                                color: s.score >= 70 ? 'var(--color-success)' :
                                    s.score >= 40 ? 'var(--color-secondary)' : 'var(--color-error)',
                                fontWeight: 800,
                                fontSize: '1.2rem',
                                border: '1px solid currentColor'
                            }}>
                                {s.score}
                            </div>
                        )}
                        <div style={{
                            padding: '0.5rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: statusInfo.bg,
                            color: statusInfo.color,
                            fontWeight: 700,
                            fontSize: '0.9rem'
                        }}>
                            {statusInfo.label}
                        </div>
                    </div>
                </div>

                <div style={{
                    backgroundColor: 'var(--neutral-50)',
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.5rem',
                    maxHeight: '150px',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    {s.status === 'completed' && s.score !== null && (
                        <div style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            backgroundColor: s.score >= 70 ? 'var(--color-success)' :
                                s.score >= 40 ? 'var(--color-secondary)' : 'var(--color-error)',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: 800,
                            fontSize: '1.5rem',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <span>{s.score}</span>
                            <span style={{ fontSize: '1rem' }}>🏆</span>
                        </div>
                    )}
                    <p style={{ margin: 0, color: 'var(--neutral-700)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                        {s.summary_text}
                    </p>
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '40px',
                        background: 'linear-gradient(transparent, var(--neutral-50))'
                    }} />
                </div>

                {s.status === 'rejected' && s.feedback && (
                    <div style={{
                        padding: '1.25rem',
                        backgroundColor: '#fff7ed',
                        border: '1px solid #fb923c',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1.5rem'
                    }}>
                        <div style={{ fontWeight: 700, color: '#c2410c', marginBottom: '0.5rem' }}>🛠️ Öğretmen Notu:</div>
                        <p style={{ margin: 0, color: '#9a3412', fontWeight: 500 }}>{s.feedback}</p>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button
                        className="btn btn-outline"
                        onClick={() => navigate(`/assignment/${s.assignment_id}`)}
                    >
                        Detayları Gör
                    </button>
                    {s.status === 'rejected' && (
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate(`/assignment/${s.assignment_id}/write-summary`)}
                        >
                            Düzelt ve Tekrar Gönder
                        </button>
                    )}
                </div>
            </div>
        );
    };

    // Filter using new explicit assignment_type from backend
    const classAssignments = summaries.filter(s => s.assignment_type === 'class');
    const individualAssignments = summaries.filter(s => s.assignment_type === 'individual');

    return (
        <DashboardLayout role="student">
            <div className="container">
                <div style={{ marginBottom: '2.5rem' }}>
                    <h1 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>Kitap Özetlerim</h1>
                    <p style={{ color: 'var(--neutral-600)', fontSize: '1.1rem' }}>
                        Okuduğun kitaplar hakkında yazdığın tüm değerlendirmeleri buradan takip edebilirsin.
                    </p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>Yükleniyor...</div>
                ) : error ? (
                    <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-error)' }}>{error}</div>
                ) : summaries.length === 0 ? (
                    <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>📝</div>
                        <h2 style={{ marginBottom: '1rem' }}>Henüz bir özetin yok.</h2>
                        <p style={{ color: 'var(--neutral-500)', marginBottom: '2rem' }}>
                            Okumaya başladığın kitaplar için özet yazarak rozetler kazanabilirsin!
                        </p>
                        <button className="btn btn-primary" onClick={() => navigate('/dashboard/books')}>
                            Kitaplarıma Göz At
                        </button>
                    </div>
                ) : (
                    <>
                        {classAssignments.length > 0 && (
                            <section style={{ marginBottom: '3rem' }}>
                                <h2 style={{
                                    fontSize: '1.5rem',
                                    marginBottom: '1.5rem',
                                    color: 'var(--neutral-800)',
                                    paddingBottom: '0.5rem',
                                    borderBottom: '2px solid var(--neutral-200)'
                                }}>
                                    🏫 Sınıf Ödevleri
                                </h2>
                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                    {classAssignments.map(renderAssignmentCard)}
                                </div>
                            </section>
                        )}

                        {individualAssignments.length > 0 && (
                            <section>
                                <h2 style={{
                                    fontSize: '1.5rem',
                                    marginBottom: '1.5rem',
                                    color: 'var(--neutral-800)',
                                    paddingBottom: '0.5rem',
                                    borderBottom: '2px solid var(--neutral-200)'
                                }}>
                                    👤 Bireysel Ödevler
                                </h2>
                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                    {individualAssignments.map(renderAssignmentCard)}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default StudentSummariesPage;
