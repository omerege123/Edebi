import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer style={{
            backgroundColor: 'var(--neutral-900)',
            color: 'var(--neutral-400)',
            padding: '3rem 0',
            marginTop: 'auto',
            borderTop: '1px solid var(--color-border)'
        }}>
            <div className="container" style={{ textAlign: 'center' }}>
                <h3 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.75rem',
                    background: 'linear-gradient(135deg, var(--color-secondary), white)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '1rem'
                }}>
                    Edebi Kıvılcım
                </h3>
                <p style={{ marginBottom: '2rem' }}>
                    Satır Arasında Kalanı Yeniden Düşünmek
                </p>
                <div style={{ fontSize: '0.875rem' }}>
                    &copy; {new Date().getFullYear()} Tüm hakları saklıdır.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
