import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const navigate = useNavigate();

    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

    const NavLinks = () => (
        <>
            <Link to="/" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--neutral-600)', fontWeight: 500 }}>Keşfet</Link>
            {user ? (
                <>
                    {user.rol === 'ogrenci' && (
                        <>
                            <Link to="/dashboard/student" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--neutral-600)', fontWeight: 500 }}>Panelim</Link>
                            <Link to="/dashboard/tasks" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--neutral-600)', fontWeight: 500 }}>Haftalık Görevler</Link>
                            <Link to="/share-quote" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Paylaşım Yap</Link>
                        </>
                    )}
                    {user.rol === 'ogretmen' && (
                        <>
                            <Link to="/dashboard/teacher" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--neutral-600)', fontWeight: 500 }}>Panelim</Link>
                            <Link to="/dashboard/reports" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--neutral-600)', fontWeight: 500 }}>Onaylar</Link>
                        </>
                    )}
                    <button
                        className="btn btn-outline"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                        onClick={() => {
                            localStorage.removeItem('user');
                            setIsMenuOpen(false);
                            navigate('/login');
                        }}
                    >
                        Çıkış Yap
                    </button>
                </>
            ) : (
                <div style={{ display: 'flex', gap: '1rem', flexDirection: 'inherit' }}>
                    <button
                        className="btn btn-outline"
                        style={{ padding: '0.5rem 1.25rem' }}
                        onClick={() => { setIsMenuOpen(false); navigate('/login'); }}
                    >
                        Giriş Yap
                    </button>
                    <button
                        className="btn btn-primary"
                        style={{ padding: '0.5rem 1.25rem' }}
                        onClick={() => { setIsMenuOpen(false); navigate('/register'); }}
                    >
                        Kayıt Ol
                    </button>
                </div>
            )}
        </>
    );

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
                height: '4.5rem'
            }}>
                {/* Logo Section */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                    <img
                        src="/src/assets/logo.png"
                        alt="Logo"
                        style={{
                            height: '2.5rem',
                            borderRadius: '50%'
                        }}
                    />
                    <span style={{
                        fontSize: 'clamp(1.1rem, 4vw, 1.3rem)',
                        fontWeight: 700,
                        fontFamily: 'var(--font-serif)',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--neutral-800))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Edebi Kıvılcım
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="mobile-hidden" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <NavLinks />
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="desktop-hidden"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '0.5rem' }}
                >
                    {isMenuOpen ? '✕' : '☰'}
                </button>
            </div>

            {/* Mobile Nav Overlay */}
            {isMenuOpen && (
                <div className="desktop-hidden" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    borderBottom: '1px solid var(--color-border)',
                    padding: '1.5rem',
                    flexDirection: 'column',
                    display: 'flex',
                    gap: '1.25rem',
                    boxShadow: 'var(--shadow-lg)'
                }}>
                    <NavLinks />
                </div>
            )}
        </nav>
    );
};

export default Navbar;
