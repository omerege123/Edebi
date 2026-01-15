import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { useBadges } from '../context/BadgeContext';

const ShareQuotePage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showBadges } = useBadges();
    const [books, setBooks] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Form state
    const [selectedBookId, setSelectedBookId] = useState(location.state?.bookId || '');
    const [bookSearch, setBookSearch] = useState(location.state?.bookName || '');
    const [quoteContent, setQuoteContent] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        // Get user from localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setCurrentUser(JSON.parse(userStr));
        }

        // Fetch books
        const fetchBooks = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/books`);
                if (res.ok) {
                    const data = await res.json();
                    setBooks(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                console.error('Error fetching books:', err);
            }
        };
        fetchBooks();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (!bookSearch || !quoteContent) {
            setMessage({ text: 'Lütfen kitap adı ve alıntı içeriğini doldurun.', type: 'error' });
            return;
        }

        if (!currentUser) {
            setMessage({ text: 'Lütfen önce giriş yapın.', type: 'error' });
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/quotes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: currentUser.id,
                    book_id: selectedBookId,
                    book_name: bookSearch,
                    icerik: quoteContent
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.newlyEarnedBadges && data.newlyEarnedBadges.length > 0) {
                    showBadges(data.newlyEarnedBadges);
                }

                setMessage({ text: 'Alıntı başarıyla paylaşıldı ve onaya gönderildi!', type: 'success' });
                // Reset form
                setSelectedBookId('');
                setBookSearch('');
                setQuoteContent('');
                // Redirect after delay, but keep context for badges
                setTimeout(() => navigate('/dashboard/student'), 2500);
            } else {
                setMessage({ text: 'Paylaşım işlemi başarısız.', type: 'error' });
            }
        } catch (err) {
            console.error(err);
            setMessage({ text: 'Sunucu hatası.', type: 'error' });
        }
    };

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
                        backgroundColor: '#fef3c7',
                        borderRadius: '50%',
                        marginBottom: '1.5rem',
                        fontSize: '2.5rem',
                        boxShadow: 'var(--shadow-md)'
                    }}>
                        ✒️
                    </div>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: 800,
                        marginBottom: '1rem',
                        background: 'linear-gradient(135deg, var(--color-secondary), var(--color-primary))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Edebi Keşiflerini Paylaş
                    </h1>
                    <p style={{ color: 'var(--neutral-500)', fontSize: '1.1rem' }}>
                        Okuduğun kitaplardan seni etkileyen cümleleri arkadaşlarınla paylaş.
                    </p>
                </div>

                <div className="card" style={{
                    padding: '3rem',
                    boxShadow: 'var(--shadow-xl)',
                    border: 'none',
                    borderRadius: '2rem',
                    position: 'relative'
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
                            {message.type === 'success' ? '✨' : '⚠️'} {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ position: 'relative' }}>
                            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 700, color: 'var(--neutral-700)' }}>
                                📚 Hangi Kitaptan?
                            </label>
                            <input
                                type="text"
                                className="input-field"
                                value={bookSearch}
                                onChange={(e) => {
                                    setBookSearch(e.target.value);
                                    setSelectedBookId('');
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                placeholder="Kitap ara veya yeni isim yaz..."
                                style={{
                                    width: '100%',
                                    padding: '1.25rem',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '2px solid var(--neutral-100)',
                                    fontSize: '1.1rem',
                                    backgroundColor: 'var(--neutral-50)'
                                }}
                            />
                            {showSuggestions && bookSearch && (
                                <ul style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 0.5rem)',
                                    left: 0,
                                    right: 0,
                                    backgroundColor: 'white',
                                    border: '1px solid var(--neutral-200)',
                                    borderRadius: 'var(--radius-lg)',
                                    zIndex: 100,
                                    maxHeight: '250px',
                                    overflowY: 'auto',
                                    listStyle: 'none',
                                    padding: '0.5rem',
                                    margin: 0,
                                    boxShadow: 'var(--shadow-xl)'
                                }}>
                                    {filteredBooks.length > 0 ? (
                                        filteredBooks.map(book => (
                                            <li
                                                key={book.book_id}
                                                onClick={() => handleBookSelect(book)}
                                                style={{
                                                    padding: '1rem',
                                                    cursor: 'pointer',
                                                    borderRadius: 'var(--radius-md)',
                                                    transition: 'all 0.2s',
                                                    borderBottom: '1px solid var(--neutral-50)'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'var(--color-secondary-light)';
                                                    e.currentTarget.style.color = 'var(--color-secondary-dark)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                    e.currentTarget.style.color = 'inherit';
                                                }}
                                            >
                                                <div style={{ fontWeight: 700 }}>{book.kitap_adi}</div>
                                                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{book.yazar}</div>
                                            </li>
                                        ))
                                    ) : (
                                        <li style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--neutral-500)' }}>
                                            📖 Bu kitap ilk kez paylaşılıyor olacak.
                                        </li>
                                    )}
                                </ul>
                            )}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 700, color: 'var(--neutral-700)' }}>
                                💬 Seni Etkileyen Alıntı
                            </label>
                            <textarea
                                className="input-field"
                                value={quoteContent}
                                onChange={(e) => setQuoteContent(e.target.value)}
                                placeholder="Buraya kalbinde iz bırakan o satırları dök..."
                                style={{
                                    width: '100%',
                                    minHeight: '200px',
                                    resize: 'vertical',
                                    padding: '1.5rem',
                                    borderRadius: 'var(--radius-xl)',
                                    border: '2px solid var(--neutral-100)',
                                    fontSize: '1.2rem',
                                    lineHeight: '1.6',
                                    backgroundColor: 'var(--neutral-50)',
                                    fontFamily: 'var(--font-serif)',
                                    fontStyle: 'italic'
                                }}
                                required
                            />
                            <div style={{ textAlign: 'right', marginTop: '0.5rem', color: 'var(--neutral-400)', fontSize: '0.85rem' }}>
                                Unutma: Güzel sözler paylaştıkça çoğalır.
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
                            <button
                                type="button"
                                className="btn"
                                onClick={() => navigate('/dashboard/student')}
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
                                Hemen Paylaş ✨
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ShareQuotePage;
