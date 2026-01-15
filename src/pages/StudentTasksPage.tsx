import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';

// Task Item Component for better organization and state management
const TaskItem: React.FC<{ task: any, onToggle: (id: number, text?: string) => Promise<void> }> = ({ task, onToggle }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [responseText, setResponseText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleComplete = async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            await onToggle(task.task_id, responseText);
            setIsExpanded(false); // Collapse after success
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{
            marginBottom: '1rem',
            backgroundColor: task.is_completed ? 'var(--neutral-50)' : '#fff',
            border: `1px solid ${task.is_completed ? 'var(--neutral-200)' : 'var(--color-primary-light)'}`,
            borderRadius: '8px',
            overflow: 'hidden',
            transition: 'all 0.2s',
            boxShadow: isExpanded ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
        }}>
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    cursor: 'pointer',
                    userSelect: 'none'
                }}
            >
                <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: `2px solid ${task.is_completed ? 'var(--color-success)' : 'var(--neutral-300)'}`,
                    backgroundColor: task.is_completed ? 'var(--color-success)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: '#fff',
                    fontSize: '14px'
                }}>
                    {task.is_completed && '✓'}
                </div>
                <div style={{ flex: 1 }}>
                    <span style={{
                        textDecoration: task.is_completed ? 'line-through' : 'none',
                        color: task.is_completed ? 'var(--neutral-400)' : 'var(--neutral-800)',
                        fontWeight: task.is_completed ? 400 : 500
                    }}>
                        {task.content}
                    </span>
                    {isExpanded && !task.is_completed && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', marginTop: '0.25rem' }}>
                            Cevap yazmak için tıklayın 👇
                        </div>
                    )}
                </div>
                <div style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: 'var(--neutral-400)' }}>
                    ▼
                </div>
            </div>

            {isExpanded && (
                <div style={{
                    padding: '0 1rem 1rem 1rem',
                    borderTop: '1px solid var(--neutral-100)',
                    backgroundColor: task.is_completed ? 'var(--neutral-50)' : '#fff'
                }}>
                    <div style={{ marginTop: '1rem' }}>
                        {task.is_completed ? (
                            <div>
                                <p style={{ fontWeight: 600, color: 'var(--color-success)', marginBottom: '0.5rem' }}>✅ Görev Tamamlandı</p>
                                <button
                                    onClick={() => onToggle(task.task_id)} // Toggle off
                                    className="btn btn-outline"
                                    style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
                                >
                                    Tamamlanmadı Olarak İşaretle
                                </button>
                                {task.rating && (
                                    <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '0.9rem', color: 'var(--neutral-600)' }}>Değerlendirme:</span>
                                        <div style={{ display: 'flex' }}>
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <span key={star} style={{
                                                    fontSize: '1.25rem',
                                                    color: star <= task.rating ? '#f59e0b' : '#ddd',
                                                }}>★</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--neutral-600)' }}>
                                    Cevabınız (İsteğe bağlı):
                                </label>
                                <textarea
                                    className="form-control"
                                    rows={3}
                                    value={responseText}
                                    onChange={(e) => setResponseText(e.target.value)}
                                    placeholder="Görevle ilgili not veya cevabınızı buraya yazabilirsiniz..."
                                    style={{ marginBottom: '1rem', width: '100%', resize: 'vertical' }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                    <button
                                        onClick={() => setIsExpanded(false)}
                                        className="btn btn-ghost"
                                        style={{ color: 'var(--neutral-500)' }}
                                    >
                                        Vazgeç
                                    </button>
                                    <button
                                        onClick={handleComplete}
                                        className="btn btn-primary"
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Kaydediliyor...' : 'Gönder ve Tamamla'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )
            }
        </div >
    );
};

const StudentTasksPage: React.FC = () => {
    const [classes, setClasses] = useState<any[]>([]);
    const [tasksByClass, setTasksByClass] = useState<{ [key: number]: any[] }>({});
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<number | null>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setUserId(user.id);
            fetchClasses(user.id);
        }
    }, []);

    const fetchClasses = async (studentId: number) => {
        try {
            const res = await fetch(`http://localhost:3000/api/classes/student/${studentId}`);
            if (res.ok) {
                const data = await res.json();
                setClasses(data);

                // Fetch tasks for each class
                data.forEach((cls: any) => {
                    fetchTasksForClass(cls.class_id, studentId);
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTasksForClass = async (classId: number, studentId: number) => {
        try {
            const res = await fetch(`http://localhost:3000/api/tasks/class/${classId}?student_id=${studentId}`);
            if (res.ok) {
                const data = await res.json();
                setTasksByClass(prev => ({
                    ...prev,
                    [classId]: data
                }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleTask = async (taskId: number, textResponse?: string) => {
        if (!userId) return;

        try {
            const res = await fetch(`http://localhost:3000/api/tasks/${taskId}/toggle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    student_id: userId,
                    response_text: textResponse
                })
            });

            if (res.ok) {
                const data = await res.json();

                // Update local state
                setTasksByClass(prev => {
                    const newState = { ...prev };
                    Object.keys(newState).forEach(clsId => {
                        const classIdNum = parseInt(clsId);
                        newState[classIdNum] = newState[classIdNum].map(t => {
                            if (t.task_id === taskId) {
                                return { ...t, is_completed: data.is_completed ? 1 : 0 };
                            }
                            return t;
                        });
                    });
                    return newState;
                });
            }
        } catch (err) {
            console.error(err);
            alert('İşlem başarısız oldu.');
        }
    };

    if (loading && classes.length === 0) return (
        <DashboardLayout role="student">
            <div className="container" style={{ padding: '2rem' }}>Yükleniyor...</div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout role="student">
            <div className="container" style={{ padding: '2rem 0' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Haftalık Görevlerim 📅</h1>

                {classes.length === 0 ? (
                    <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--neutral-500)' }}>
                        Henüz bir sınıfa üye değilsiniz.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {classes.map(cls => (
                            <div key={cls.class_id} className="card" style={{ padding: '1.5rem' }}>
                                <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--neutral-100)', paddingBottom: '1rem' }}>
                                    <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{cls.sinif_adi}</h2>
                                    <span style={{ color: 'var(--neutral-500)', fontSize: '0.9rem' }}>{cls.hoca_adi}</span>
                                </div>

                                {(!tasksByClass[cls.class_id] || tasksByClass[cls.class_id].length === 0) ? (
                                    <p style={{ color: 'var(--neutral-400)', fontStyle: 'italic' }}>Bu sınıf için henüz görev eklenmemiş.</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        {tasksByClass[cls.class_id].map(task => (
                                            <TaskItem
                                                key={task.task_id}
                                                task={task}
                                                onToggle={handleToggleTask}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default StudentTasksPage;
