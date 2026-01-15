import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import DashboardLayout from '../components/Layout/DashboardLayout';

interface ClassData {
    class_id: number;
    sinif_adi: string;
    sinif_kodu: string;
    ogrenci_sayisi: number;
    created_at: string;
}

interface StudentInClass {
    user_id: number;
    ad: string;
    soyad: string;
    kullanici_adi: string;
    e_posta: string;
    enrolled_at: string;
}

const TeacherStudentsPage: React.FC = () => {
    const navigate = useNavigate();
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
    const [students, setStudents] = useState<StudentInClass[]>([]);
    const [newClassName, setNewClassName] = useState('');
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setCurrentUser(user);
            fetchClasses(user.id);
        }
    }, []);

    const fetchClasses = async (teacherId: number) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/classes/teacher/${teacherId}`);
            if (res.ok) {
                const data = await res.json();
                setClasses(data);
                if (data.length > 0 && !selectedClassId) {
                    setSelectedClassId(data[0].class_id);
                    fetchStudents(data[0].class_id);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStudents = async (classId: number) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/classes/${classId}/students`);
            if (res.ok) {
                const data = await res.json();
                setStudents(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newClassName.trim()) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/classes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teacher_id: currentUser.id,
                    sinif_adi: newClassName
                })
            });

            if (res.ok) {
                setNewClassName('');
                setMessage('Sınıf başarıyla oluşturuldu!');
                fetchClasses(currentUser.id);
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleClassSelect = (id: number) => {
        setSelectedClassId(id);
        fetchStudents(id);
    };

    const handleDeleteClass = async (classId: number) => {
        if (!window.confirm('Bu sınıfı silmek istediğinize emin misiniz? Sınıf içindeki tüm kayıtlar silinecektir.')) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/classes/${classId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teacher_id: currentUser.id })
            });

            if (res.ok) {
                setMessage('Sınıf başarıyla silindi.');
                setSelectedClassId(null);
                setStudents([]);
                fetchClasses(currentUser.id);
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleRemoveStudent = async (studentId: number) => {
        if (!selectedClassId) return;
        if (!window.confirm('Öğrenciyi sınıftan çıkarmak istediğinize emin misiniz?')) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/classes/${selectedClassId}/students/${studentId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teacher_id: currentUser.id })
            });

            if (res.ok) {
                setMessage('Öğrenci sınıftan çıkarıldı.');
                fetchStudents(selectedClassId);
                fetchClasses(currentUser.id);
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        alert('Sınıf kodu kopyalandı: ' + code);
    };

    return (
        <DashboardLayout role="teacher">
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Sınıf Yönetimi 👥</h1>
                <p style={{ color: 'var(--neutral-500)' }}>
                    Sınıflarınızı oluşturun, öğrencileri davet edin ve gelişimlerini takip edin.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
                {/* Left Sidebar: Classes List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{ padding: '1.5rem', borderRadius: '1.5rem', border: '1px solid var(--neutral-100)' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 700 }}>Yeni Sınıf Oluştur</h3>
                        <form onSubmit={handleCreateClass}>
                            <input
                                type="text"
                                placeholder="Sınıf Adı (örn: 10-A)"
                                value={newClassName}
                                onChange={(e) => setNewClassName(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '12px',
                                    border: '1px solid var(--neutral-200)',
                                    marginBottom: '1rem',
                                    fontSize: '0.9rem',
                                    outline: 'none'
                                }}
                            />
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', borderRadius: '12px' }}>Oluştur</button>
                        </form>
                        {message && <p style={{ color: 'var(--color-primary)', fontSize: '0.85rem', marginTop: '1rem', textAlign: 'center', fontWeight: 600 }}>{message}</p>}
                    </div>

                    <div className="card" style={{ padding: '0', overflow: 'hidden', borderRadius: '1.5rem', border: '1px solid var(--neutral-100)' }}>
                        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--neutral-100)', fontWeight: 700, background: 'var(--neutral-50)' }}>Sınıflarım</div>
                        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                            {classes.length === 0 ? (
                                <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--neutral-400)', fontSize: '0.9rem' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏫</div>
                                    Henüz sınıf yok.
                                </div>
                            ) : (
                                classes.map(c => (
                                    <div
                                        key={c.class_id}
                                        onClick={() => handleClassSelect(c.class_id)}
                                        style={{
                                            padding: '1.25rem',
                                            cursor: 'pointer',
                                            backgroundColor: selectedClassId === c.class_id ? 'var(--neutral-50)' : 'transparent',
                                            borderLeft: selectedClassId === c.class_id ? '4px solid var(--color-primary)' : '4px solid transparent',
                                            transition: 'all 0.2s',
                                            borderBottom: '1px solid var(--neutral-50)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 600, color: selectedClassId === c.class_id ? 'var(--color-primary)' : 'inherit' }}>{c.sinif_adi}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--neutral-500)', marginTop: '0.25rem' }}>{c.ogrenci_sayisi} Öğrenci</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            {selectedClassId === c.class_id && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/teacher/class/${c.class_id}`); }}
                                                    className="btn btn-outline"
                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '8px' }}
                                                >
                                                    Detaylar ➔
                                                </button>
                                            )}
                                            {selectedClassId === c.class_id && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteClass(c.class_id); }}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, padding: '0.5rem' }}
                                                    onMouseEnter={(e) => (e.currentTarget as any).style.opacity = 1}
                                                    onMouseLeave={(e) => (e.currentTarget as any).style.opacity = 0.5}
                                                    title="Sınıfı Sil"
                                                >
                                                    🗑️
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Content: Selected Class Students */}
                <div>
                    {selectedClassId ? (
                        <>
                            <div className="card" style={{
                                padding: '2rem',
                                marginBottom: '1.5rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                                borderRadius: '1.5rem',
                                border: '1px solid var(--neutral-100)',
                                boxShadow: 'var(--shadow-sm)'
                            }}>
                                <div>
                                    <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: 800 }}>{classes.find(c => c.class_id === selectedClassId)?.sinif_adi}</h2>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ color: 'var(--neutral-500)', fontSize: '0.9rem', fontWeight: 500 }}>Sınıf Katılım Kodu:</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <code style={{
                                                backgroundColor: 'white',
                                                padding: '0.4rem 0.75rem',
                                                borderRadius: '8px',
                                                fontWeight: 800,
                                                color: 'var(--color-primary)',
                                                fontSize: '1.1rem',
                                                letterSpacing: '1px',
                                                border: '2px dashed var(--color-primary-light)'
                                            }}>
                                                {classes.find(c => c.class_id === selectedClassId)?.sinif_kodu}
                                            </code>
                                            <button
                                                onClick={() => copyCode(classes.find(c => c.class_id === selectedClassId)?.sinif_kodu || '')}
                                                style={{ background: 'var(--neutral-100)', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '0.4rem', borderRadius: '8px' }}
                                                title="Kodu Kopyala"
                                            >
                                                📋
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>{students.length}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--neutral-500)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', marginTop: '0.5rem' }}>Öğrenci</div>
                                </div>
                            </div>

                            <div className="card" style={{ padding: '0', overflow: 'hidden', borderRadius: '1.5rem', border: '1px solid var(--neutral-100)' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead style={{ backgroundColor: 'var(--neutral-50)', borderBottom: '1px solid var(--neutral-100)' }}>
                                        <tr>
                                            <th style={{ padding: '1.25rem 1rem', color: 'var(--neutral-600)', fontWeight: 700, fontSize: '0.9rem' }}>Öğrenci Adı Soyadı</th>
                                            <th style={{ padding: '1.25rem 1rem', color: 'var(--neutral-600)', fontWeight: 700, fontSize: '0.9rem' }}>Kullanıcı Adı</th>
                                            <th style={{ padding: '1.25rem 1rem', color: 'var(--neutral-600)', fontWeight: 700, fontSize: '0.9rem' }}>E-Posta</th>
                                            <th style={{ padding: '1.25rem 1rem', color: 'var(--neutral-600)', fontWeight: 700, fontSize: '0.9rem' }}>Katılım</th>
                                            <th style={{ padding: '1.25rem 1rem', color: 'var(--neutral-600)', fontWeight: 700, fontSize: '0.9rem' }}>İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} style={{ padding: '5rem', textAlign: 'center', color: 'var(--neutral-400)' }}>
                                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👋</div>
                                                    Sınıfa henüz öğrenci katılmamış.
                                                </td>
                                            </tr>
                                        ) : (
                                            students.map(s => (
                                                <tr key={s.user_id} style={{ borderBottom: '1px solid var(--neutral-50)', transition: 'background-color 0.2s' }}>
                                                    <td style={{ padding: '1rem', fontWeight: 600 }}>{s.ad} {s.soyad}</td>
                                                    <td style={{ padding: '1rem', color: 'var(--neutral-600)' }}>@{s.kullanici_adi}</td>
                                                    <td style={{ padding: '1rem', color: 'var(--neutral-600)' }}>{s.e_posta}</td>
                                                    <td style={{ padding: '1rem', color: 'var(--neutral-500)', fontSize: '0.85rem' }}>
                                                        {new Date(s.enrolled_at).toLocaleDateString('tr-TR')}
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <button
                                                            onClick={() => handleRemoveStudent(s.user_id)}
                                                            className="btn"
                                                            style={{
                                                                padding: '0.4rem 0.75rem',
                                                                fontSize: '0.75rem',
                                                                backgroundColor: '#fee2e2',
                                                                color: '#b91c1c',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                fontWeight: 700
                                                            }}
                                                        >
                                                            Çıkar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="card" style={{ textAlign: 'center', padding: '5rem', color: 'var(--neutral-400)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏫</div>
                            <p>Yönetmek istediğiniz sınıfı soldaki listeden seçin veya yeni bir sınıf oluşturun.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default TeacherStudentsPage;
