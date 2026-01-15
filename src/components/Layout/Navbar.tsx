import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
    // const [isMenuOpen, setIsMenuOpen] = useState(false); // Mobile menu to be implemented
    const navigate = useNavigate();

    return (
        <nav style={{
            backgroundColor: 'var(--color-bg-card)',
            borderBottom: '1px solid var(--color-border)',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            boxShadow: 'var(--shadow-sm)'
        }}>
            <div className="container" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '4rem'
            }}>
                {/* Logo Section */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                    <img
                        src="/src/assets/logo.png"
                        alt="Edebi Kıvılcım"
                        style={{
                            height: '3.5rem',
                            borderRadius: '50%'
                        }}
                    />
                    <span style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-serif)',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--neutral-800))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.02em'
                    }}>
                        Edebi Kıvılcım
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden-mobile" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <Link to="/" style={{ color: 'var(--neutral-600)', fontWeight: 500, textDecoration: 'none' }}>Keşfet</Link>

                    {localStorage.getItem('user') ? (
                        <>
                            {JSON.parse(localStorage.getItem('user')!).rol === 'ogrenci' && (
                                <>
                                    <Link to="/dashboard/student" style={{ color: 'var(--neutral-600)', fontWeight: 500, textDecoration: 'none' }}>Panelim</Link>
                                    <Link to="/dashboard/tasks" style={{ color: 'var(--neutral-600)', fontWeight: 500, textDecoration: 'none' }}>Haftalık Görevler</Link>
                                    <Link to="/share-quote" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>Paylaşım Yap</Link>
                                </>
                            )}
                            {JSON.parse(localStorage.getItem('user')!).rol === 'ogretmen' && (
                                <>
                                    <Link to="/dashboard/teacher" style={{ color: 'var(--neutral-600)', fontWeight: 500, textDecoration: 'none' }}>Panelim</Link>
                                    <Link to="/dashboard/reports" style={{ color: 'var(--neutral-600)', fontWeight: 500, textDecoration: 'none' }}>Onaylar</Link>
                                </>
                            )}
                            <button
                                className="btn btn-outline"
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                                onClick={() => {
                                    localStorage.removeItem('user');
                                    navigate('/login');
                                }}
                            >
                                Çıkış Yap
                            </button>
                        </>
                    ) : (
                        <div style={{ display: 'flex', gap: '1rem', marginLeft: '1rem' }}>
                            <button
                                className="btn btn-outline"
                                style={{ padding: '0.5rem 1rem' }}
                                onClick={() => navigate('/login')}
                            >
                                Giriş Yap
                            </button>
                            <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }} onClick={() => navigate('/register')}>
                                Kayıt Ol
                            </button>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button - for future responsiveness */}
                {/* Placeholder for now */}
            </div>
        </nav>
    );
};

export default Navbar;
