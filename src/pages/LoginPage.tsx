import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState<'ogrenci' | 'ogretmen'>('ogrenci'); // Updated to match DB values
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, rol: role })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Save info to localStorage
                    localStorage.setItem('user', JSON.stringify(data.user));

                    // Redirect based on role
                    if (data.user.rol === 'ogretmen') {
                        navigate('/dashboard/teacher');
                    } else {
                        navigate('/dashboard/student');
                    }
                } else {
                    setError(data.message || 'Giriş başarısız.');
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                setError(errorData.message || 'Giriş başarısız.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Sunucu hatası. Lütfen tekrar deneyin.');
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '80vh',
            padding: '2rem'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Giriş Yap</h2>
                <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                    Edebi serüvenine kaldığın yerden devam et.
                </p>

                {/* Role Switcher */}
                <div style={{
                    display: 'flex',
                    background: 'var(--neutral-100)',
                    padding: '0.25rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '2rem'
                }}>
                    <button
                        type="button"
                        onClick={() => setRole('ogrenci')}
                        style={{
                            flex: 1,
                            padding: '0.5rem',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            background: role === 'ogrenci' ? 'white' : 'transparent',
                            color: role === 'ogrenci' ? 'var(--color-primary)' : 'var(--neutral-600)',
                            fontWeight: role === 'ogrenci' ? 600 : 400,
                            boxShadow: role === 'ogrenci' ? 'var(--shadow-sm)' : 'none',
                            transition: 'all var(--transition-fast)'
                        }}
                    >
                        Öğrenci
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('ogretmen')}
                        style={{
                            flex: 1,
                            padding: '0.5rem',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            background: role === 'ogretmen' ? 'white' : 'transparent',
                            color: role === 'ogretmen' ? 'var(--color-primary)' : 'var(--neutral-600)',
                            fontWeight: role === 'ogretmen' ? 600 : 400,
                            boxShadow: role === 'ogretmen' ? 'var(--shadow-sm)' : 'none',
                            transition: 'all var(--transition-fast)'
                        }}
                    >
                        Öğretmen
                    </button>
                </div>

                {error && (
                    <div style={{ background: '#fef2f2', color: '#991b1b', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                            Kullanıcı Adı veya E-posta
                        </label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                                fontSize: '1rem',
                                outlineColor: 'var(--color-primary)'
                            }}
                            placeholder="Kullanıcı adı"
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                            Parola
                        </label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                                fontSize: '1rem',
                                outlineColor: 'var(--color-primary)'
                            }}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        Giriş Yap
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    Hesabın yok mu? <a href="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Kayıt Ol</a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
