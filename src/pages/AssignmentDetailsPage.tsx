import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';

const AssignmentDetailsPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssignment = async () => {
            try {
                // Find this specific assignment from the user's list
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const res = await fetch(`http://localhost:3000/api/assignments/student/${user.id}`);
                if (res.ok) {
                    const data = await res.json();
                    const item = data.find((a: any) => a.assignment_id === parseInt(id || '0'));
                    setAssignment(item);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAssignment();
    }, [id]);

    if (loading) return <DashboardLayout role="student"><div className="container">Yükleniyor...</div></DashboardLayout>;
    if (!assignment) return <DashboardLayout role="student"><div className="container">Ödev bulunamadı.</div></DashboardLayout>;

    return (
        <DashboardLayout role="student">
            <div className="container" style={{ maxWidth: '800px' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <button className="btn btn-outline" onClick={() => navigate('/dashboard/student')} style={{ marginBottom: '1rem' }}>
                        ← Dashboard'a Dön
                    </button>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                        {assignment.assignment_type === 'writing' ? assignment.title : assignment.kitap_adi}
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--neutral-600)' }}>
                        {assignment.assignment_type === 'writing' ? '📅 Serbest Yazı Ödevi' : assignment.yazar}
                    </p>
                    {assignment.sinif_adi && (
                        <div style={{
                            display: 'inline-block',
                            marginTop: '0.5rem',
                            padding: '0.25rem 0.75rem',
                            backgroundColor: 'var(--color-primary-light)',
                            color: 'var(--color-primary)',
                            borderRadius: '4px',
                            fontSize: '0.9rem',
                            fontWeight: 700
                        }}>
                            🏫 Sınıf: {assignment.sinif_adi}
                        </div>
                    )}
                </div>

                <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Ödev Durumu</h2>
                            <div style={{
                                display: 'inline-block',
                                padding: '0.5rem 1rem',
                                borderRadius: '2rem',
                                fontWeight: 600,
                                backgroundColor: assignment.status === 'completed' ? 'var(--color-success-light)' :
                                    assignment.status === 'submitted' ? 'var(--color-secondary-light)' :
                                        assignment.status === 'rejected' ? '#fee2e2' : 'var(--neutral-100)',
                                color: assignment.status === 'completed' ? 'var(--color-success)' :
                                    assignment.status === 'submitted' ? 'var(--color-secondary)' :
                                        assignment.status === 'rejected' ? 'var(--color-error)' : 'var(--neutral-600)'
                            }}>
                                {(() => {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const dueDate = new Date(assignment.due_date);
                                    dueDate.setHours(0, 0, 0, 0);

                                    if (assignment.status === 'completed') return '✅ Tamamlandı';
                                    if (assignment.status === 'submitted') {
                                        return dueDate < today ? '⏳ Geç Teslim Edildi' : '⏳ İncelemede';
                                    }
                                    if (assignment.status === 'rejected') return '❌ Düzenleme Gerekli';

                                    return dueDate < today ? '⚠️ Teslim Edilmedi' : '📖 Devam Ediyor';
                                })()}
                            </div>
                        </div>

                        {assignment.status === 'completed' && assignment.score !== null && (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ color: 'var(--neutral-500)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Başarı Puanı</div>
                                <div style={{
                                    fontSize: '2.5rem',
                                    fontWeight: 800,
                                    color: assignment.score >= 70 ? 'var(--color-success)' :
                                        assignment.score >= 40 ? 'var(--color-secondary)' : 'var(--color-error)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    lineHeight: 1
                                }}>
                                    <span>{assignment.score}</span>
                                    <span style={{ fontSize: '1.25rem' }}>🏆</span>
                                </div>
                            </div>
                        )}

                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: 'var(--neutral-500)', fontSize: '0.9rem' }}>Son Teslim Tarihi</div>
                            <div style={{ fontWeight: 600, color: 'var(--color-error)' }}>
                                {new Date(assignment.due_date).toLocaleDateString('tr-TR')}
                            </div>
                        </div>
                    </div>

                    {assignment.feedback && (
                        <div style={{
                            padding: '1.5rem',
                            backgroundColor: '#fff7ed',
                            border: '1px solid #fb923c',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '2rem',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                <span style={{ fontSize: '1.25rem' }}>📢</span>
                                <div style={{ fontWeight: 700, color: '#9a3412', fontSize: '1rem' }}>Öğretmeninizden Mesaj Var (Revize İsteği):</div>
                            </div>
                            <p style={{ margin: 0, color: '#c2410c', lineHeight: '1.6', fontSize: '1.05rem', fontWeight: 500 }}>
                                {assignment.feedback}
                            </p>
                        </div>
                    )}

                    {assignment.description && assignment.assignment_type === 'writing' && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--neutral-600)' }}>Ödev Açıklaması:</h3>
                            <div style={{
                                padding: '1.5rem',
                                backgroundColor: '#f0f9ff',
                                border: '1px solid #bae6fd',
                                borderRadius: 'var(--radius-md)',
                                color: '#0369a1',
                                fontSize: '1.05rem',
                                lineHeight: '1.6',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {assignment.description}
                            </div>
                        </div>
                    )}

                    {assignment.summary_text && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--neutral-600)' }}>
                                {assignment.assignment_type === 'writing' ? 'Gönderdiğin Yanıt:' : 'Daha Önce Yazdığın Özet:'}
                            </h3>
                            <div style={{
                                padding: '1.5rem',
                                backgroundColor: 'var(--neutral-50)',
                                border: '1px solid var(--neutral-200)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--neutral-700)',
                                fontSize: '0.95rem',
                                lineHeight: '1.6',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {assignment.summary_text}
                            </div>
                        </div>
                    )}

                    <div style={{
                        display: assignment.assignment_type === 'writing' ? 'block' : 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1.5rem'
                    }}>
                        {assignment.assignment_type !== 'writing' && (
                            <div style={{
                                padding: '1.5rem',
                                border: '2px dashed var(--neutral-200)',
                                borderRadius: 'var(--radius-lg)',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✍️</div>
                                <h3 style={{ marginBottom: '0.5rem' }}>Alıntı Paylaş</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--neutral-500)', marginBottom: '1.5rem' }}>
                                    Kitaptan sevdiğin bir cümleyi arkadaşlarınla paylaş.
                                </p>
                                <button
                                    className="btn btn-outline"
                                    style={{ width: '100%' }}
                                    onClick={() => navigate('/share-quote', {
                                        state: { bookId: assignment.book_id, bookName: assignment.kitap_adi }
                                    })}
                                >
                                    Hemen Paylaş
                                </button>
                            </div>
                        )}

                        <div style={{
                            padding: '1.5rem',
                            border: `2px solid ${assignment.assignment_type === 'writing' ? 'var(--color-secondary-light)' : 'var(--color-primary-light)'}`,
                            borderRadius: 'var(--radius-lg)',
                            backgroundColor: 'var(--color-bg-card)',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                                {assignment.assignment_type === 'writing' ? '✍️' : '📝'}
                            </div>
                            <h3 style={{ marginBottom: '0.5rem' }}>
                                {assignment.assignment_type === 'writing' ? 'Ödevi Tamamla' : 'Özet Gönder'}
                            </h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--neutral-500)', marginBottom: '1.5rem' }}>
                                {assignment.assignment_type === 'writing' ? 'Cevabını yaz ve hocana gönder.' : 'Kitabı bitirdiysen özetini yaz ve ödevini tamamla.'}
                            </p>
                            <button
                                className="btn btn-primary"
                                style={{
                                    width: '100%',
                                    background: assignment.assignment_type === 'writing' ? 'linear-gradient(135deg, var(--color-secondary), var(--color-secondary-dark))' : undefined
                                }}
                                onClick={() => navigate(`/assignment/${id}/write-summary`)}
                                disabled={assignment.status === 'completed' || assignment.status === 'submitted'}
                            >
                                {assignment.status === 'completed' ? 'Tamamlandı' :
                                    assignment.status === 'submitted' ? 'İncelemede' :
                                        assignment.status === 'rejected' ? (assignment.assignment_type === 'writing' ? 'Yanıtı Düzenle' : 'Özeti Düzenle') :
                                            (assignment.assignment_type === 'writing' ? 'Yanıt Yaz' : 'Özet Yaz')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AssignmentDetailsPage;
