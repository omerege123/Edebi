import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import DashboardLayout from '../components/Layout/DashboardLayout';

const StudentBooksPage: React.FC = () => {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            fetchAssignments(user.id);
        }
    }, []);

    const fetchAssignments = async (userId: number) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/assignments/student/${userId}`);
            const data = await response.json();
            console.log('📚 [BooksPage] Fetched assignments:', data);
            console.log('🏫 [BooksPage] Class assignments:', data.filter((a: any) => a.class_id !== null));
            console.log('👤 [BooksPage] Individual assignments:', data.filter((a: any) => a.class_id === null));
            setAssignments(data);
        } catch (error) {
            console.error('Error fetching assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderAssignmentList = (filteredList: any[], title: string, icon: string) => (
        <div style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--neutral-700)' }}>
                {icon} {title}
            </h2>
            {filteredList.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--neutral-400)', fontSize: '0.9rem' }}>
                    Bu kategoride henüz bir ödev bulunmuyor.
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {filteredList.map((assignment) => (
                        <div key={assignment.assignment_id} className="card" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            borderTop: assignment.status === 'completed' ? '4px solid var(--color-success)' : '4px solid var(--color-warning)'
                        }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{
                                    fontSize: '1.5rem',
                                    backgroundColor: assignment.assignment_type === 'writing' ? 'var(--color-secondary-light)' : 'var(--color-primary-light)',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {assignment.assignment_type === 'writing' ? '✍️' : '📖'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem' }}>
                                        {assignment.assignment_type === 'writing' ? (assignment.title || 'Başlıksız Ödev') : assignment.kitap_adi}
                                    </h3>
                                    <p style={{ color: 'var(--neutral-500)', fontSize: '0.85rem', margin: 0 }}>
                                        {assignment.assignment_type === 'writing' ? 'Yazı Ödevi' : assignment.yazar}
                                    </p>
                                    {assignment.sinif_adi && (
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700, marginTop: '0.25rem' }}>
                                            🏫 {assignment.sinif_adi}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: 'auto',
                                paddingTop: '1rem',
                                borderTop: '1px solid var(--neutral-100)'
                            }}>
                                <div style={{ fontSize: '0.85rem' }}>
                                    <span style={{ color: 'var(--neutral-400)' }}>Teslim:</span> <br />
                                    <span style={{ fontWeight: 600 }}>
                                        {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString('tr-TR') : 'Belirtilmedi'}
                                    </span>
                                </div>
                                <span style={{
                                    fontSize: '0.75rem',
                                    padding: '0.25rem 0.6rem',
                                    borderRadius: '6px',
                                    background: assignment.status === 'completed' ? 'var(--color-success-light)' : 'var(--color-warning-light)',
                                    color: assignment.status === 'completed' ? 'var(--color-success)' : 'var(--color-warning)',
                                    fontWeight: 700
                                }}>
                                    {assignment.status === 'completed' ? 'Tamamlandı' : assignment.status === 'submitted' ? 'İncelemede' : assignment.status === 'rejected' ? 'Düzenleme' : 'Devam Ediyor'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <DashboardLayout role="student">
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', margin: 0 }}>Tüm Ödevlerim 📚✍️</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Sana atanan kitapların ve yazı ödevlerinin tam listesi.</p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>Yükleniyor...</div>
            ) : (
                <>
                    {renderAssignmentList(assignments.filter(a => a.class_id !== null), 'Sınıf Ödevleri', '🏫')}
                    {renderAssignmentList(assignments.filter(a => a.class_id === null), 'Bireysel Ödevler', '👤')}
                </>
            )}
        </DashboardLayout>
    );
};

export default StudentBooksPage;
