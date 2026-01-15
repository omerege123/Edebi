import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';

const ClassDetailPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [classInfo, setClassInfo] = useState<any>(null);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            fetchClassData(user.id);
        }
    }, [id]);

    const fetchClassData = async (userId: number) => {
        try {
            setLoading(true);

            // Fetch student's classes to find this specific one (or a dedicated endpoint)
            const classesRes = await fetch(`http://localhost:3000/api/classes/student/${userId}`);
            if (classesRes.ok) {
                const classesData = await classesRes.json();
                const currentCls = classesData.find((c: any) => c.class_id === parseInt(id || '0'));
                setClassInfo(currentCls);
            }

            // Fetch assignments filtered by class
            const assignmentsRes = await fetch(`http://localhost:3000/api/assignments/student/${userId}?class_id=${id}`);
            if (assignmentsRes.ok) {
                const assignmentsData = await assignmentsRes.json();
                setAssignments(assignmentsData);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <DashboardLayout role="student"><div className="container" style={{ padding: '2rem' }}>Yükleniyor...</div></DashboardLayout>;
    if (!classInfo) return <DashboardLayout role="student"><div className="container" style={{ padding: '2rem' }}>Sınıf bulunamadı.</div></DashboardLayout>;

    return (
        <DashboardLayout role="student">
            <div className="container" style={{ padding: '2rem 0' }}>
                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate('/dashboard/student')} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                        ← Geri
                    </button>
                    <div>
                        <h1 style={{ fontSize: '2rem', margin: 0 }}>{classInfo.sinif_adi} 🏫</h1>
                        <p style={{ color: 'var(--neutral-500)', margin: 0 }}>Öğretmen: {classInfo.hoca_adi}</p>
                    </div>
                </div>

                <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--neutral-100)', paddingBottom: '0.5rem' }}>
                        Sınıf Ödevleri 📝
                    </h2>

                    {assignments.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--neutral-400)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                            Bu sınıf için henüz atanmış bir ödev yok.
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {assignments.map(ass => (
                                <div
                                    key={ass.assignment_id}
                                    className="card"
                                    style={{
                                        padding: '1.5rem',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s',
                                        borderLeft: `6px solid ${ass.status === 'completed' ? 'var(--color-success)' : 'var(--color-primary)'}`
                                    }}
                                    onClick={() => navigate(`/assignment/${ass.assignment_id}`)}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            color: ass.status === 'completed' ? 'var(--color-success)' : 'var(--color-primary)',
                                            textTransform: 'uppercase'
                                        }}>
                                            {ass.assignment_type === 'writing' ? 'YAZI ÖDEVİ' : 'KİTAP OKUMA'}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--neutral-400)' }}>
                                            {new Date(ass.due_date).toLocaleDateString('tr-TR')}
                                        </span>
                                    </div>
                                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                                        {ass.assignment_type === 'writing' ? ass.title : ass.kitap_adi}
                                    </h3>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--neutral-500)', margin: 0 }}>
                                        {ass.assignment_type === 'writing' ? 'Ödev talimatlarını görmek için tıklayın.' : `Yazar: ${ass.yazar}`}
                                    </p>
                                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                                        <span style={{
                                            fontSize: '0.8rem',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '1rem',
                                            backgroundColor: ass.status === 'completed' ? 'var(--color-success-light)' : 'var(--neutral-100)',
                                            color: ass.status === 'completed' ? 'var(--color-success)' : 'var(--neutral-600)',
                                            fontWeight: 600
                                        }}>
                                            {ass.status === 'completed' ? 'Tamamlandı' : ass.status === 'submitted' ? 'İncelemede' : 'Devam Ediyor'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ClassDetailPage;
