import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AssignBookPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [students, setStudents] = useState<any[]>([]);
    const [books, setBooks] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);

    // Form state
    const [assignType, setAssignType] = useState<'student' | 'class'>('student');
    const [taskType] = useState<'book' | 'writing'>('book');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedBookId, setSelectedBookId] = useState('');
    const [bookSearch, setBookSearch] = useState(''); // Text input for book
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [dueDate, setDueDate] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [currentUser] = useState<any>(() => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    });

    useEffect(() => {
        if (location.state) {
            if (location.state.classId) {
                setSelectedClassId(location.state.classId.toString());
                setAssignType('class');
            }
            if (location.state.assignType) {
                setAssignType(location.state.assignType);
            }
        }
    }, [location.state]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (showSuggestions && !(e.target as HTMLElement).closest('.book-search-container')) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showSuggestions]);

    useEffect(() => {
        if (currentUser && currentUser.rol !== 'ogretmen') {
            navigate('/dashboard/student');
            return;
        }
        if (!currentUser && !localStorage.getItem('user')) {
            navigate('/login');
            return;
        }
        // Fetch students, books, and classes
        const fetchData = async () => {
            try {
                const [studentsRes, booksRes, classesRes] = await Promise.all([
                    fetch('http://localhost:3000/api/students'),
                    fetch('http://localhost:3000/api/books'),
                    fetch(`http://localhost:3000/api/classes/teacher/${currentUser.id}`)
                ]);

                if (!studentsRes.ok || !booksRes.ok || !classesRes.ok) {
                    throw new Error('Veri çekme hatası');
                }

                const studentsData = await studentsRes.json();
                const booksData = await booksRes.json();
                const classesData = await classesRes.json();

                // Ensure data is array
                setStudents(Array.isArray(studentsData) ? studentsData : []);
                setBooks(Array.isArray(booksData) ? booksData : []);
                setClasses(Array.isArray(classesData) ? classesData : []);
            } catch (err) {
                console.error('Error fetching data:', err);
                setMessage({ text: 'Veriler yüklenirken hata oluştu.', type: 'error' });
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        const isStudentAssign = assignType === 'student';
        const targetId = isStudentAssign ? selectedStudent : selectedClassId;

        // Validation for Book task
        if (taskType === 'book') {
            if (!targetId || (!selectedBookId && !bookSearch) || !dueDate) {
                setMessage({ text: `Lütfen ${isStudentAssign ? 'öğrenci' : 'sınıf'}, kitap adı ve tarih bilgilerini doldurun.`, type: 'error' });
                return;
            }
        }
        // Validation for Writing task
        else {
            if (!targetId || !taskTitle || !dueDate) {
                setMessage({ text: `Lütfen ${isStudentAssign ? 'öğrenci' : 'sınıf'}, ödev başlığı ve tarih bilgilerini doldurun.`, type: 'error' });
                return;
            }
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(dueDate);

        if (selectedDate < today) {
            setMessage({ text: 'Teslim tarihi bugünden eski olamaz.', type: 'error' });
            return;
        }

        try {
            const endpoint = isStudentAssign ? 'http://localhost:3000/api/assignments' : 'http://localhost:3000/api/assignments/class';
            const bodyData: any = {
                due_date: dueDate,
                assignment_type: taskType
            };

            if (isStudentAssign) {
                bodyData.user_id = selectedStudent;
            } else {
                bodyData.class_id = selectedClassId;
            }

            if (taskType === 'book') {
                bodyData.book_id = selectedBookId;
                bodyData.book_name = bookSearch;
            } else {
                bodyData.title = taskTitle;
                bodyData.description = taskDescription;
                // Writing tasks can now have books too
                if (selectedBookId || bookSearch) {
                    bodyData.book_id = selectedBookId;
                    bodyData.book_name = bookSearch;
                }
            }

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData)
            });

            if (res.ok) {
                setMessage({ text: 'Görev başarıyla atandı!', type: 'success' });
                // Reset form
                setSelectedStudent('');
                setSelectedClassId('');
                setSelectedBookId('');
                setBookSearch('');
                setDueDate('');
                setTaskTitle('');
                setTaskDescription('');
                // Redirect after short delay
                setTimeout(() => navigate('/dashboard/teacher'), 1500);
            } else {
                const errData = await res.json();
                setMessage({ text: errData.error || 'Atama işlemi başarısız.', type: 'error' });
            }
        } catch (err) {
            console.error(err);
            setMessage({ text: 'Sunucu hatası.', type: 'error' });
        }
    };

    // Filter books based on search input
    const filteredBooks = books.filter(book =>
        book.kitap_adi.toLowerCase().includes(bookSearch.toLowerCase())
    );

    const handleBookSelect = (book: any) => {
        setBookSearch(book.kitap_adi);
        setSelectedBookId(book.book_id);
        setShowSuggestions(false);
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--neutral-50)', padding: '4rem 1rem' }}>
            <div className="container" style={{ maxWidth: '700px' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '80px',
                        height: '80px',
                        backgroundColor: 'var(--color-primary-light)',
                        borderRadius: '50%',
                        marginBottom: '1.5rem',
                        fontSize: '2.5rem',
                        boxShadow: 'var(--shadow-md)'
                    }}>
                        📚
                    </div>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: 800,
                        marginBottom: '1rem',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Yeni Kitap Görevi Ata
                    </h1>
                    <p style={{ color: 'var(--neutral-500)', fontSize: '1.1rem' }}>
                        Öğrencilerinize yeni bir okuma hedefi belirleyin ve takibini yapın.
                    </p>
                </div>

                <div className="card" style={{
                    padding: '3rem',
                    boxShadow: 'var(--shadow-xl)',
                    border: 'none',
                    borderRadius: '2rem',
                    position: 'relative',
                    overflow: 'visible'
                }}>
                    {message.text && (
                        <div style={{
                            padding: '1.25rem',
                            marginBottom: '2rem',
                            borderRadius: 'var(--radius-lg)',
                            backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                            color: message.type === 'success' ? '#166534' : '#991b1b',
                            border: `1px solid ${message.type === 'success' ? '#86efac' : '#fecaca'}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            fontWeight: 600
                        }}>
                            {message.type === 'success' ? '✅' : '⚠️'} {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Assignment Target Toggle */}
                        <div style={{
                            display: 'flex',
                            backgroundColor: 'var(--neutral-100)',
                            padding: '0.4rem',
                            borderRadius: 'var(--radius-lg)',
                            gap: '0.4rem'
                        }}>
                            <button
                                type="button"
                                onClick={() => setAssignType('student')}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: 'none',
                                    backgroundColor: assignType === 'student' ? 'white' : 'transparent',
                                    color: assignType === 'student' ? 'var(--color-primary)' : 'var(--neutral-500)',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    boxShadow: assignType === 'student' ? 'var(--shadow-sm)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                👤 Tek Öğrenciye
                            </button>
                            <button
                                type="button"
                                onClick={() => setAssignType('class')}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: 'none',
                                    backgroundColor: assignType === 'class' ? 'white' : 'transparent',
                                    color: assignType === 'class' ? 'var(--color-primary)' : 'var(--neutral-500)',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    boxShadow: assignType === 'class' ? 'var(--shadow-sm)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                🏫 Tüm Sınıfa
                            </button>
                        </div>



                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 700, color: 'var(--neutral-700)' }}>
                                    {assignType === 'student' ? '🎓 Öğrenci Seçin' : '🏫 Sınıf Seçin'}
                                </label>
                                {assignType === 'student' ? (
                                    <select
                                        className="input-field"
                                        value={selectedStudent}
                                        onChange={(e) => setSelectedStudent(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '1rem',
                                            borderRadius: 'var(--radius-lg)',
                                            border: '2px solid var(--neutral-100)',
                                            fontSize: '1rem',
                                            backgroundColor: 'var(--neutral-50)'
                                        }}
                                    >
                                        <option value="">Öğrenci Seçiniz...</option>
                                        {students.map(s => (
                                            <option key={s.user_id} value={s.user_id}>
                                                {s.ad} {s.soyad}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <select
                                        className="input-field"
                                        value={selectedClassId}
                                        onChange={(e) => setSelectedClassId(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '1rem',
                                            borderRadius: 'var(--radius-lg)',
                                            border: '2px solid var(--neutral-100)',
                                            fontSize: '1rem',
                                            backgroundColor: 'var(--neutral-50)'
                                        }}
                                    >
                                        <option value="">Sınıf Seçiniz...</option>
                                        {classes.map(c => (
                                            <option key={c.class_id} value={c.class_id}>
                                                {c.sinif_adi} ({c.ogrenci_sayisi} Öğrenci)
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 700, color: 'var(--neutral-700)' }}>
                                    📅 Teslim Tarihi
                                </label>
                                <input
                                    type="date"
                                    className="input-field"
                                    min={new Date().toISOString().split('T')[0]}
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '2px solid var(--neutral-100)',
                                        fontSize: '1rem',
                                        backgroundColor: 'var(--neutral-50)'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Book Selection (Always shown or shown for both types) */}
                        <div style={{ position: 'relative' }} className="book-search-container">
                            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 700, color: 'var(--neutral-700)' }}>
                                📖 Kitap Seçimi {taskType === 'writing' && <span style={{ color: 'var(--neutral-400)', fontSize: '0.8rem', fontWeight: 500 }}> (Opsiyonel)</span>} {assignType === 'class' && <span style={{ color: 'var(--color-primary)', fontSize: '0.8rem' }}>(Tüm Sınıf İçin)</span>}
                            </label>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={bookSearch}
                                    onChange={(e) => {
                                        setBookSearch(e.target.value);
                                        setSelectedBookId('');
                                        setShowSuggestions(true);
                                    }}
                                    onFocus={() => {
                                        setShowSuggestions(true);
                                    }}
                                    placeholder="Kitap ara veya yeni isim yaz..."
                                    style={{
                                        flex: 1,
                                        padding: '1rem',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '2px solid var(--neutral-100)',
                                        fontSize: '1rem',
                                        backgroundColor: 'var(--neutral-50)'
                                    }}
                                />
                                {bookSearch && (
                                    <button
                                        type="button"
                                        onClick={() => { setBookSearch(''); setSelectedBookId(''); }}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neutral-400)' }}
                                    >
                                        Temizle ✕
                                    </button>
                                )}
                            </div>

                            {showSuggestions && (
                                <div style={{
                                    position: 'absolute',
                                    top: 'calc(100% - 0.5rem)',
                                    left: 0,
                                    right: 0,
                                    backgroundColor: 'white',
                                    border: '1px solid var(--neutral-200)',
                                    borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
                                    zIndex: 100,
                                    maxHeight: '300px',
                                    overflowY: 'auto',
                                    boxShadow: 'var(--shadow-xl)',
                                    padding: '0.5rem'
                                }}>
                                    {filteredBooks.length > 0 ? (
                                        <>
                                            <div style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--neutral-400)', textTransform: 'uppercase' }}>
                                                {bookSearch ? 'Arama Sonuçları' : 'Kütüphaneden Seç'}
                                            </div>
                                            {filteredBooks.slice(0, 10).map(book => (
                                                <div
                                                    key={book.book_id}
                                                    onClick={() => handleBookSelect(book)}
                                                    style={{
                                                        padding: '1rem',
                                                        cursor: 'pointer',
                                                        borderRadius: 'var(--radius-md)',
                                                        transition: 'all 0.2s',
                                                        backgroundColor: selectedBookId === book.book_id ? 'var(--color-primary-light)' : 'transparent',
                                                        borderLeft: selectedBookId === book.book_id ? '4px solid var(--color-primary)' : '4px solid transparent'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (selectedBookId !== book.book_id) e.currentTarget.style.backgroundColor = 'var(--neutral-50)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (selectedBookId !== book.book_id) e.currentTarget.style.backgroundColor = 'transparent';
                                                    }}
                                                >
                                                    <div style={{ fontWeight: 700, color: selectedBookId === book.book_id ? 'var(--color-primary)' : 'inherit' }}>{book.kitap_adi}</div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--neutral-500)' }}>{book.yazar}</div>
                                                </div>
                                            ))}
                                        </>
                                    ) : (
                                        bookSearch && (
                                            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--neutral-500)' }}>
                                                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✨</div>
                                                <div>"<strong>{bookSearch}</strong>" kütüphanede bulunamadı.</div>
                                                <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Ödev verildiğinde yeni kitap olarak kaydedilecek.</div>
                                            </div>
                                        )
                                    )}
                                    {!bookSearch && books.length === 0 && (
                                        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--neutral-400)' }}>Henüz kitap eklenmemiş.</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {taskType === 'writing' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 700, color: 'var(--neutral-700)' }}>
                                        ✏️ Ödev Başlığı
                                    </label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={taskTitle}
                                        onChange={(e) => setTaskTitle(e.target.value)}
                                        placeholder="Örn: 'Suç ve Ceza Hakkında Kompozisyon' veya 'Haftalık Rapor'"
                                        style={{
                                            width: '100%',
                                            padding: '1rem',
                                            borderRadius: 'var(--radius-lg)',
                                            border: '2px solid var(--neutral-100)',
                                            fontSize: '1rem',
                                            backgroundColor: 'var(--neutral-50)'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 700, color: 'var(--neutral-700)' }}>
                                        📝 Ödev Açıklaması (Opsiyonel)
                                    </label>
                                    <textarea
                                        className="input-field"
                                        value={taskDescription}
                                        onChange={(e) => setTaskDescription(e.target.value)}
                                        placeholder="Ödevle ilgili detayları veya yönergeleri buraya yazabilirsiniz..."
                                        style={{
                                            width: '100%',
                                            padding: '1rem',
                                            borderRadius: 'var(--radius-lg)',
                                            border: '2px solid var(--neutral-100)',
                                            fontSize: '1rem',
                                            minHeight: '120px',
                                            backgroundColor: 'var(--neutral-50)',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
                            <button
                                type="button"
                                className="btn"
                                onClick={() => navigate('/dashboard/teacher')}
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    border: '2px solid var(--neutral-200)',
                                    background: 'none',
                                    borderRadius: 'var(--radius-lg)',
                                    fontWeight: 700,
                                    color: 'var(--neutral-500)',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--neutral-300)';
                                    e.currentTarget.style.backgroundColor = 'var(--neutral-50)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--neutral-200)';
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                Vazgeç
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{
                                    flex: 2,
                                    padding: '1rem',
                                    fontSize: '1.1rem',
                                    fontWeight: 800,
                                    borderRadius: 'var(--radius-lg)',
                                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))',
                                    boxShadow: '0 10px 15px -3px rgba(var(--primary-hue), 0.3)'
                                }}
                            >
                                Görevi Tanımla 🚀
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AssignBookPage;
