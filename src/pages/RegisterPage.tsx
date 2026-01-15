import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState<'ogrenci' | 'ogretmen'>('ogrenci');
    const [formData, setFormData] = useState({
        ad: '',
        soyad: '',
        kullanici_adi: '',
        e_posta: '',
        parola: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, rol: role })
            });

            const data = await response.json();

            if (data.success) {
                alert('Kayıt başarılı! Giriş yapabilirsiniz.');
                navigate('/login');
            } else {
                setError(data.message || 'Kayıt başarısız.');
            }
        } catch (err) {
            console.error('Registration error:', err);
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
            <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Aramıza Katıl</h2>
                <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                    Edebi Kıvılcım ailesinin bir parçası ol.
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

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Ad</label>
                            <input
                                type="text"
                                required
                                value={formData.ad}
                                onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--color-border)', fontSize: '1rem', outlineColor: 'var(--color-primary)'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Soyad</label>
                            <input
                                type="text"
                                required
                                value={formData.soyad}
                                onChange={(e) => setFormData({ ...formData, soyad: e.target.value })}
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--color-border)', fontSize: '1rem', outlineColor: 'var(--color-primary)'
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Kullanıcı Adı</label>
                        <input
                            type="text"
                            required
                            value={formData.kullanici_adi}
                            onChange={(e) => setFormData({ ...formData, kullanici_adi: e.target.value })}
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)', fontSize: '1rem', outlineColor: 'var(--color-primary)'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>E-posta</label>
                        <input
                            type="email"
                            required
                            value={formData.e_posta}
                            onChange={(e) => setFormData({ ...formData, e_posta: e.target.value })}
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)', fontSize: '1rem', outlineColor: 'var(--color-primary)'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Parola</label>
                        <input
                            type="password"
                            required
                            value={formData.parola}
                            onChange={(e) => setFormData({ ...formData, parola: e.target.value })}
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)', fontSize: '1rem', outlineColor: 'var(--color-primary)'
                            }}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                        Kayıt Ol
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    Hesabın var mı? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Giriş Yap</Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
