import React, { useState } from 'react';
import { API_BASE_URL } from '../config';
import DashboardLayout from '../components/Layout/DashboardLayout';

const TeacherDashboard: React.FC = () => {
    const [stats, setStats] = useState({
        studentCount: 0,
        pendingCount: 0,
        completionRate: 0,
        studentSummary: [] as any[]
    });
    const [pendingQuotes, setPendingQuotes] = React.useState<any[]>([]);

    const [selectedClass, setSelectedClass] = React.useState<string>('all');
    const [classes, setClasses] = React.useState<any[]>([]);

    const fetchData = React.useCallback(async () => {
        try {
            const statsUrl = selectedClass === 'all'
                ? `${API_BASE_URL}/api/dashboard/teacher/stats`
                : `${API_BASE_URL}/api/dashboard/teacher/stats?class_id=${selectedClass}`;

            const [statsRes, quotesRes, classesRes] = await Promise.all([
                fetch(statsUrl),
                fetch(`${API_BASE_URL}/api/quotes/pending`),
                fetch(`${API_BASE_URL}/api/classes/teacher/${JSON.parse(localStorage.getItem('user') || '{}').id}`)
            ]);

            const statsData = await statsRes.json();
            setStats(statsData);

            const quotesData = await quotesRes.json();
            setPendingQuotes(quotesData);

            if (classesRes.ok) {
                const classesData = await classesRes.json();
                setClasses(classesData);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    }, [selectedClass]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleApproval = async (id: number, status: 'onaylandi' | 'reddedildi') => {
        try {
            await fetch(`${API_BASE_URL}/api/quotes/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            // Refresh data
            fetchData();
        } catch (error) {
            console.error('Error updating quote status:', error);
        }
    };

    return (
        <DashboardLayout role="teacher">
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', margin: 0 }}>Merhaba, Hocam! 👋</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Sınıfınızın okuma durumunu buradan takip edebilirsiniz.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ marginRight: '1rem' }}>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
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
                            <option value="all">Tüm Sınıflar</option>
                            {classes.map(c => (
                                <option key={c.class_id} value={c.class_id}>{c.sinif_adi}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        className="btn btn-outline"
                        style={{ border: '2px solid var(--color-primary)', color: 'var(--color-primary)', fontWeight: 600 }}
                        onClick={() => window.location.href = '/dashboard/reports'}
                    >
                        📝 Ödevleri İncele
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => window.location.href = '/dashboard/assign-book'}
                    >
                        + Yeni Kitap Ata
                    </button>
                </div>
            </div>

            {/* Notification Alert if summaries pending */}
            {stats.pendingCount > 0 && (
                <div style={{
                    background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                    border: '1px solid #fb923c',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontSize: '2rem' }}>📢</div>
                        <div>
                            <div style={{ fontWeight: 700, color: '#9a3412', fontSize: '1.1rem' }}>Kontrol Edilecek Ödevler Var!</div>
                            <div style={{ color: '#c2410c' }}>Şu an <strong>{stats.pendingCount}</strong> öğrenci kitabını bitirip özetini gönderdi.</div>
                        </div>
                    </div>
                    <button
                        className="btn btn-primary"
                        style={{ backgroundColor: '#f97316', borderColor: '#f97316', width: 'auto', padding: '0.6rem 1.5rem' }}
                        onClick={() => window.location.href = '/dashboard/reports'}
                    >
                        Hemen İncele →
                    </button>
                </div>
            )}

            {/* Overview Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2.5rem'
            }}>
                <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ color: 'var(--neutral-500)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>ÖĞRENCİ SAYISI</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.studentCount}</div>
                </div>
                <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ color: 'var(--color-warning)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>ONAY BEKLEYEN</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.pendingCount} <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--neutral-400)' }}>kitap</span></div>
                </div>
                <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ color: 'var(--color-success)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>TAMAMLANAN GÖREV</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>%{stats.completionRate}</div>
                </div>
            </div>

            {/* Pending Approvals Section */}
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Onay Bekleyen Paylaşımlar</h2>
            <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
                {pendingQuotes.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--neutral-500)' }}>
                        Onay bekleyen paylaşım yok.
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'var(--neutral-50)', borderBottom: '1px solid var(--color-border)' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--neutral-600)' }}>Öğrenci</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--neutral-600)' }}>Kitap</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--neutral-600)' }}>İçerik</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--neutral-600)' }}>Tarih</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--neutral-600)' }}>İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingQuotes.map((quote) => (
                                <tr key={quote.quote_id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td style={{ padding: '1rem' }}>{quote.ogrenci_adi}</td>
                                    <td style={{ padding: '1rem' }}>{quote.kitap_adi}</td>
                                    <td style={{ padding: '1rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>"{quote.alinti_metin}"</td>
                                    <td style={{ padding: '1rem', color: 'var(--neutral-500)' }}>
                                        {new Date(quote.paylasim_tarihi).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => handleApproval(quote.quote_id, 'onaylandi')}
                                            className="btn btn-primary"
                                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', width: 'auto' }}
                                        >
                                            Onayla
                                        </button>
                                        <button
                                            onClick={() => handleApproval(quote.quote_id, 'reddedildi')}
                                            className="btn"
                                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', width: 'auto', background: 'var(--color-error)', color: 'white', border: 'none' }}
                                        >
                                            Red
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            {/* Student Badge Summary Section */}
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', marginTop: '3rem' }}>Öğrenci Rozet Durumu</h2>
            <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
                {stats.studentSummary && stats.studentSummary.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--neutral-500)' }}>
                        Öğrenci verisi bulunamadı.
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'var(--neutral-50)', borderBottom: '1px solid var(--color-border)' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--neutral-600)' }}>Öğrenci</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--neutral-600)' }}>Toplam Rozet</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--neutral-600)' }}>Onaylı Alıntı</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--neutral-600)' }}>Son Başarı</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.studentSummary && stats.studentSummary.map((student: any, idx: number) => (
                                <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td style={{ padding: '1rem', fontWeight: 600 }}>{student.ad} {student.soyad}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            background: 'var(--neutral-100)',
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '999px',
                                            fontWeight: 700,
                                            color: 'var(--color-primary)'
                                        }}>
                                            🏅 {student.rozet_sayisi}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>{student.onayli_alinti}</td>
                                    <td style={{ padding: '1rem', color: 'var(--neutral-500)', fontSize: '0.85rem' }}>
                                        {student.son_rozet_tarihi ? new Date(student.son_rozet_tarihi).toLocaleDateString('tr-TR') : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </DashboardLayout>
    );
};

export default TeacherDashboard;
