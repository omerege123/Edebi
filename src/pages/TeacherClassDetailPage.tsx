import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import DashboardLayout from '../components/Layout/DashboardLayout';

// Subcomponent for Weekly Tasks - Defined BEFORE usage
const WeeklyTasksManager: React.FC<{ classId: string }> = ({ classId }) => {
    const [tasks, setTasks] = useState<any[]>([]);
    const [newTask, setNewTask] = useState('');
    const [loading, setLoading] = useState(false);

    // Modal State
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [completions, setCompletions] = useState<any[]>([]);
    const [loadingCompletions, setLoadingCompletions] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, [classId]);

    const fetchTasks = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/tasks/class/${classId}`);
            if (res.ok) {
                const data = await res.json();
                setTasks(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ class_id: Number(classId), content: newTask })
            });

            if (res.ok) {
                setNewTask('');
                fetchTasks();
            } else {
                const errData = await res.json();
                alert('Görev eklenirken hata oluştu: ' + (errData.error || 'Bilinmeyen hata'));
            }
        } catch (err: any) {
            console.error(err);
            alert('Sunucu hatası: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        if (!confirm('Bu görevi silmek istediğinize emin misiniz?')) return;
        try {
            await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, { method: 'DELETE' });
            setTasks(tasks.filter(t => t.task_id !== taskId));
        } catch (err) {
            console.error(err);
        }
    };

    const handleViewResponses = async (task: any) => {
        setSelectedTask(task);
        setLoadingCompletions(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/tasks/${task.task_id}/completions`);
            if (res.ok) {
                const data = await res.json();
                setCompletions(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingCompletions(false);
        }
    };

    const handleRate = async (studentId: number, rating: number) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/tasks/${selectedTask.task_id}/grade`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ student_id: studentId, rating })
            });
            if (res.ok) {
                setCompletions(prev => prev.map(c =>
                    c.student_id === studentId ? { ...c, rating } : c
                ));
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--neutral-100)', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Haftalık Görevler 📅
                <span className="badge" style={{ backgroundColor: 'var(--color-primary)', color: '#fff', fontSize: '0.8rem' }}>{tasks.length}</span>
            </h3>

            <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Yeni görev ekle..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? '...' : '+'}
                </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {tasks.length === 0 ? (
                    <p style={{ color: 'var(--neutral-400)', textAlign: 'center', fontSize: '0.9rem' }}>Henüz görev eklenmemiş.</p>
                ) : (
                    tasks.map(task => (
                        <div key={task.task_id} style={{
                            padding: '0.75rem',
                            backgroundColor: '#fff',
                            border: '1px solid var(--neutral-200)',
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.95rem'
                        }}>
                            <span>{task.content}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <button
                                    onClick={() => handleViewResponses(task)}
                                    className="btn btn-outline"
                                    style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                                >
                                    Yanıtlar ({task.completion_count})
                                </button>

                                <button
                                    onClick={() => handleDeleteTask(task.task_id)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--neutral-400)',
                                        fontSize: '1.1rem'
                                    }}
                                    title="Sil"
                                >
                                    &times;
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal for Responses */}
            {selectedTask && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }} onClick={() => setSelectedTask(null)}>
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        padding: '2rem',
                        width: '90%',
                        maxWidth: '600px',
                        maxHeight: '80vh',
                        overflowY: 'auto'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>"{selectedTask.content}" Yanıtları</h3>
                            <button onClick={() => setSelectedTask(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>

                        {loadingCompletions ? (
                            <p>Yükleniyor...</p>
                        ) : completions.length === 0 ? (
                            <p style={{ color: 'var(--neutral-400)' }}>Henüz yanıt yok.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {completions.map(c => (
                                    <div key={c.completion_id} style={{
                                        padding: '1rem',
                                        backgroundColor: 'var(--neutral-50)',
                                        borderRadius: '8px',
                                        border: '1px solid var(--neutral-200)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <strong>{c.ad} {c.soyad}</strong>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--neutral-400)' }}>
                                                {new Date(c.completed_at).toLocaleDateString("tr-TR")}
                                            </span>
                                        </div>
                                        <p style={{
                                            margin: '0 0 1rem 0',
                                            fontSize: '0.95rem',
                                            whiteSpace: 'pre-wrap',
                                            color: c.response_text ? 'inherit' : 'var(--neutral-400)',
                                            fontStyle: c.response_text ? 'normal' : 'italic'
                                        }}>
                                            {c.response_text || 'Metin girilmedi (Sadece tamamlandı işaretlendi)'}
                                        </p>

                                        {/* Star Rating */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '0.9rem', color: 'var(--neutral-500)' }}>Değerlendirme:</span>
                                            <div style={{ display: 'flex' }}>
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <span
                                                        key={star}
                                                        onClick={() => handleRate(c.student_id, star)}
                                                        style={{
                                                            cursor: 'pointer',
                                                            fontSize: '1.25rem',
                                                            color: star <= (c.rating || 0) ? '#f59e0b' : '#ddd',
                                                            transition: 'color 0.2s'
                                                        }}
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const TeacherClassDetailPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [classInfo, setClassInfo] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            fetchClassData(user.id);
        }
    }, [id]);

    const fetchClassData = async (teacherId: number) => {
        try {
            setLoading(true);

            // Fetch class info
            const classesRes = await fetch(`${API_BASE_URL}/api/classes/teacher/${teacherId}`);
            if (classesRes.ok) {
                const classesData = await classesRes.json();
                const currentCls = classesData.find((c: any) => c.class_id === parseInt(id || '0'));
                setClassInfo(currentCls);
            }

            // Fetch students in class
            const studentsRes = await fetch(`${API_BASE_URL}/api/classes/${id}/students`);
            if (studentsRes.ok) {
                const studentsData = await studentsRes.json();
                setStudents(studentsData);
            }

            // Fetch all assignments linked to this class
            const assignmentsRes = await fetch(`${API_BASE_URL}/api/teacher/class/${id}/assignments`);
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

    if (loading) return <DashboardLayout role="teacher"><div className="container" style={{ padding: '2rem' }}>Yükleniyor...</div></DashboardLayout>;
    if (!classInfo) return <DashboardLayout role="teacher"><div className="container" style={{ padding: '2rem' }}>Sınıf bulunamadı.</div></DashboardLayout>;

    return (
        <DashboardLayout role="teacher">
            <div className="container" style={{ padding: '2rem 0' }}>
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={() => navigate('/dashboard/teacher/students')} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                            ← Geri
                        </button>
                        <div>
                            <h1 style={{ fontSize: '2rem', margin: 0 }}>{classInfo.sinif_adi} Sınıf Detayı 🏫</h1>
                            <p style={{ color: 'var(--neutral-500)', margin: 0 }}>Sınıf Kodu: <code>{classInfo.sinif_kodu}</code></p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/dashboard/assign-book', { state: { classId: id, assignType: 'class' } })} className="btn btn-primary">
                        + Sınıfa Ödev Ver
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                    {/* Left: Students List and Weekly Tasks */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--neutral-100)', paddingBottom: '0.5rem' }}>
                                Öğrenciler ({students.length})
                            </h3>
                            {students.length === 0 ? (
                                <p style={{ color: 'var(--neutral-400)', textAlign: 'center' }}>Sınıf boş.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {students.map(s => (
                                        <div key={s.user_id} style={{
                                            padding: '0.75rem',
                                            backgroundColor: 'var(--neutral-50)',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <span style={{ fontWeight: 600 }}>{s.ad} {s.soyad}</span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--neutral-400)' }}>@{s.kullanici_adi}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Weekly Tasks Section */}
                        <WeeklyTasksManager classId={id!} />
                    </div>

                    {/* Right: Class Assignments Progress */}
                    <div className="card" style={{ padding: '1.5rem', height: 'fit-content' }}>
                        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--neutral-100)', paddingBottom: '0.5rem' }}>
                            Sınıf Ödev Takibi 📊
                        </h3>

                        {assignments.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--neutral-400)' }}>
                                Bu sınıfa henüz ödev verilmemiş.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {/* Group assignments by Book/Title to show summary progress */}
                                {Array.from(new Set(assignments.map(a => a.assignment_type === 'writing' ? a.title : a.kitap_adi))).map(taskName => {
                                    const taskAssignments = assignments.filter(a => (a.assignment_type === 'writing' ? a.title : a.kitap_adi) === taskName);
                                    const completedCount = taskAssignments.filter(a => a.status === 'completed').length;
                                    const submittedCount = taskAssignments.filter(a => a.status === 'submitted').length;
                                    const totalCount = taskAssignments.length;
                                    const percent = Math.round((completedCount / totalCount) * 100);

                                    return (
                                        <div key={taskName} style={{
                                            padding: '1.25rem',
                                            border: '1px solid var(--neutral-100)',
                                            borderRadius: '12px',
                                            backgroundColor: '#fff'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                <div>
                                                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{taskName}</h4>
                                                    <span style={{ fontSize: '0.85rem', color: 'var(--neutral-500)' }}>
                                                        {taskAssignments[0].assignment_type === 'writing' ? '✍️ Yazı Ödevi' : '📖 Kitap Okuma'}
                                                    </span>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>%{percent}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--neutral-400)' }}>TAMAMLANDI</div>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div style={{
                                                height: '8px',
                                                backgroundColor: 'var(--neutral-100)',
                                                borderRadius: '4px',
                                                overflow: 'hidden',
                                                marginBottom: '1rem'
                                            }}>
                                                <div style={{
                                                    width: `${percent}%`,
                                                    height: '100%',
                                                    backgroundColor: 'var(--color-success)',
                                                    transition: 'width 0.5s ease-in-out'
                                                }} />
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                                                <div style={{ display: 'flex', gap: '1rem' }}>
                                                    <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>✅ {completedCount} Tamamlandı</span>
                                                    <span style={{ color: '#f59e0b', fontWeight: 600 }}>⏳ {submittedCount} Beklemede</span>
                                                    <span style={{ color: 'var(--neutral-400)' }}>👤 {totalCount - (completedCount + submittedCount)} Yapmadı</span>
                                                </div>
                                                <button
                                                    onClick={() => navigate('/dashboard/teacher/reports', { state: { classId: id } })}
                                                    className="btn btn-outline"
                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                                                >
                                                    Tümünü Gör ➔
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default TeacherClassDetailPage;
