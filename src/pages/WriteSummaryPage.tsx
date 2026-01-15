import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import DashboardLayout from '../components/Layout/DashboardLayout';

const WriteSummaryPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState<any>(null);
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchAssignment = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const res = await fetch(`${API_BASE_URL}/api/assignments/student/${user.id}`);
                if (res.ok) {
                    const data = await res.json();
                    const item = data.find((a: any) => a.assignment_id === parseInt(id || '0'));
                    setAssignment(item);
                    if (item?.summary_text) setSummary(item.summary_text);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAssignment();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!summary.trim()) return;
        setSubmitting(true);
        setMessage({ text: '', type: '' });

        try {
            const res = await fetch(`${API_BASE_URL}/api/assignments/${id}/summary`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ summary_text: summary })
            });

            if (res.ok) {
                setMessage({ text: 'Özetiniz başarıyla gönderildi! Öğretmeniniz onayladığında ödeviniz tamamlanmış sayılacaktır.', type: 'success' });
                setTimeout(() => navigate(`/assignment/${id}`), 3000);
            } else {
                const errorData = await res.json().catch(() => ({}));
                setMessage({ text: `Gönderim sırasında bir hata oluştu: ${errorData.error || errorData.details || res.statusText}`, type: 'error' });
            }
        } catch (err) {
            console.error(err);
            setMessage({ text: 'Sunucu hatası.', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <DashboardLayout role="student"><div className="container">Yükleniyor...</div></DashboardLayout>;
    if (!assignment) return <DashboardLayout role="student"><div className="container">Ödev bulunamadı.</div></DashboardLayout>;

    return (
        <DashboardLayout role="student">
            <div className="container" style={{ maxWidth: '800px' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <button className="btn btn-outline" onClick={() => navigate(`/assignment/${id}`)} style={{ marginBottom: '1rem' }}>
                        ← Geri Dön
                    </button>
                    <h1>
                        {assignment.assignment_type === 'writing' ? `"${assignment.title}" Yanıtı` : `"${assignment.kitap_adi}" Özeti`}
                    </h1>
                    <p style={{ color: 'var(--neutral-600)' }}>
                        {assignment.assignment_type === 'writing'
                            ? 'Ödevle ilgili düşüncülerini veya istenen metni buraya yaz.'
                            : 'Düşüncelerini ve kitabın temel noktalarını buraya yaz.'}
                    </p>
                </div>

                {assignment.description && assignment.assignment_type === 'writing' && (
                    <div style={{
                        padding: '1.25rem',
                        backgroundColor: '#f0f9ff',
                        border: '1px solid #bae6fd',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem'
                    }}>
                        <div style={{ fontWeight: 700, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>📝</span> Ödev Talimatı:
                        </div>
                        <p style={{ margin: 0, color: '#075985', fontSize: '0.95rem' }}>
                            {assignment.description}
                        </p>
                    </div>
                )}

                {assignment.feedback && (
                    <div style={{
                        padding: '1.25rem',
                        backgroundColor: '#fff7ed',
                        border: '1px solid #fb923c',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                    }}>
                        <div style={{ fontWeight: 700, color: '#9a3412', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>💡</span> Öğretmeninizin Düzenleme İsteği:
                        </div>
                        <p style={{ margin: 0, color: '#c2410c', fontWeight: 500, lineHeight: '1.5' }}>
                            {assignment.feedback}
                        </p>
                    </div>
                )}

                {message.text && (
                    <div style={{
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: message.type === 'success' ? 'var(--color-success-light)' : '#fee2e2',
                        color: message.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
                        border: `1px solid ${message.type === 'success' ? 'var(--color-success)' : 'var(--color-error)'}`
                    }}>
                        {message.text}
                    </div>
                )}

                <div className="card" style={{ padding: '2rem' }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 600, fontSize: '1.1rem' }}>
                                {assignment.assignment_type === 'writing' ? 'Ödev Yanıtınız' : 'Kitap Özeti ve Değerlendirmesi'}
                            </label>
                            <textarea
                                className="input-field"
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                placeholder={assignment.assignment_type === 'writing'
                                    ? "Ödev yanıtınızı buraya detaylıca yazınız..."
                                    : "Bu kitap sana ne hissettirdi? Karakterler ve olay örgüsü hakkında neler düşünüyorsun?.."
                                }
                                style={{ width: '100%', minHeight: '400px', lineHeight: '1.6', fontSize: '1.1rem', padding: '1.5rem' }}
                                required
                                disabled={submitting}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => navigate(`/assignment/${id}`)}
                                disabled={submitting}
                            >
                                Vazgeç
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={submitting || !summary.trim()}
                                style={{ padding: '0.75rem 2.5rem' }}
                            >
                                {submitting ? 'Gönderiliyor...' : 'Ödevi Teslim Et'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default WriteSummaryPage;
