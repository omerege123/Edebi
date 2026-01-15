import React, { type ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

interface DashboardLayoutProps {
    children: ReactNode;
    role: 'student' | 'teacher';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const menuItems = role === 'student' ? [
        { label: 'Akış', path: '/dashboard/student', icon: '🏠' },
        { label: 'Paylaşımlarım', path: '/dashboard/my-quotes', icon: '💬' },
        { label: 'Özetlerim', path: '/dashboard/summaries', icon: '📝' },
        { label: 'Rozetlerim', path: '/dashboard/badges', icon: '🏅' },
        { label: 'Kitaplarım', path: '/dashboard/books', icon: '📚' },
        { label: 'Paylaşım Yap', path: '/share-quote', icon: '✍️' },
    ] : [
        { label: 'Genel Bakış', path: '/dashboard/teacher', icon: '📊' },
        { label: 'Edebi Akış', path: '/dashboard/teacher/quotes', icon: '🌟' },
        { label: 'Sınıf Yönetimi', path: '/dashboard/teacher/students', icon: '👥' },
        { label: 'Ödev Atama', path: '/dashboard/assign-book', icon: '📝' },
        { label: 'İnceleme & Onay', path: '/dashboard/reports', icon: '✅' },
    ];

    const sidebarContent = (
        <>
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img
                    src="/logo.png"
                    alt="EK"
                    style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: '50%'
                    }}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}>
                        Edebi Kıvılcım
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', fontWeight: 500 }}>
                        {role === 'student' ? 'Öğrenci Paneli' : 'Öğretmen Paneli'}
                    </span>
                </div>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            color: location.pathname === item.path ? 'var(--color-primary)' : 'var(--neutral-600)',
                            backgroundColor: location.pathname === item.path ? 'var(--neutral-100)' : 'transparent',
                            fontWeight: location.pathname === item.path ? 600 : 400,
                            textDecoration: 'none',
                            transition: 'all var(--transition-fast)'
                        }}
                    >
                        <span>{item.icon}</span>
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-primary-light)',
                        color: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 700
                    }}>
                        {JSON.parse(localStorage.getItem('user') || '{}').ad?.[0] || 'U'}
                    </div>
                    <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                            {JSON.parse(localStorage.getItem('user') || '{}').ad} {JSON.parse(localStorage.getItem('user') || '{}').soyad}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--neutral-500)', textTransform: 'capitalize' }}>
                            {JSON.parse(localStorage.getItem('user') || '{}').rol === 'ogretmen' ? 'Öğretmen' : 'Öğrenci'}
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => {
                        localStorage.removeItem('user');
                        navigate('/login');
                    }}
                    style={{
                        width: '100%',
                        padding: '0.6rem',
                        border: '1px solid #fee2e2',
                        borderRadius: 'var(--radius-md)',
                        background: '#fff',
                        color: 'var(--color-error)',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Güvenli Çıkış
                </button>
            </div>
        </>
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--neutral-50)', flexDirection: 'column' }}>
            {/* Mobile Header */}
            <header className="desktop-hidden" style={{
                height: '60px',
                backgroundColor: 'var(--color-bg-card)',
                borderBottom: '1px solid var(--color-border)',
                padding: '0 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 40
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <img src="/src/assets/logo.png" style={{ width: '2rem', height: '2rem', borderRadius: '50%' }} alt="Logo" />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}>
                        Edebi Kıvılcım
                    </span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: 'var(--neutral-700)' }}
                >
                    {isMobileMenuOpen ? '✕' : '☰'}
                </button>
            </header>

            <div style={{ display: 'flex', flex: 1 }}>
                {/* Desktop Sidebar */}
                <aside className="mobile-hidden" style={{
                    width: '260px',
                    backgroundColor: 'var(--color-bg-card)',
                    borderRight: '1px solid var(--color-border)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'sticky',
                    top: 0,
                    height: '100vh'
                }}>
                    {sidebarContent}
                </aside>

                {/* Mobile Sidebar Overlay */}
                {isMobileMenuOpen && (
                    <div
                        className="desktop-hidden"
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            zIndex: 45
                        }}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <aside
                            style={{
                                width: '280px',
                                height: '100%',
                                backgroundColor: 'var(--color-bg-card)',
                                padding: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                overflowY: 'auto'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {sidebarContent}
                        </aside>
                    </div>
                )}

                {/* Main Content Area */}
                <main style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
                    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        {children}
                    </div>
                </main>
            </div>
            {/* Added breakpoint adjustments to main padding via a style tag for simplicity in this React structure */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media (min-width: 768px) {
                    main { padding: 2rem !important; }
                }
            `}} />
        </div>
    );
};

export default DashboardLayout;
