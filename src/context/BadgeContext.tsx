import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface Badge {
    badge_id: number;
    rozet_adi: string;
    ikon: string;
    kategori: string;
    kazanim_kriteri: string;
}

interface BadgeContextType {
    showBadges: (badges: Badge[]) => void;
}

const BadgeContext = createContext<BadgeContextType | undefined>(undefined);

export const useBadges = () => {
    const context = useContext(BadgeContext);
    if (!context) {
        throw new Error('useBadges must be used within a BadgeProvider');
    }
    return context;
};

export const BadgeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeBadges, setActiveBadges] = useState<Badge[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const showBadges = (badges: Badge[]) => {
        if (badges && badges.length > 0) {
            setActiveBadges(prev => [...prev, ...badges]);
        }
    };

    const closeCurrent = () => {
        if (currentIndex < activeBadges.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setActiveBadges([]);
            setCurrentIndex(0);
        }
    };

    const currentBadge = activeBadges[currentIndex];

    return (
        <BadgeContext.Provider value={{ showBadges }}>
            {children}
            {currentBadge && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'fadeIn 0.3s ease-out'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '3rem',
                        borderRadius: '2rem',
                        textAlign: 'center',
                        maxWidth: '450px',
                        width: '90%',
                        position: 'relative',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        animation: 'popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}>
                        <div style={{
                            fontSize: '6rem',
                            marginBottom: '1.5rem',
                            display: 'block'
                        }}>
                            {currentBadge.ikon}
                        </div>
                        <h2 style={{
                            fontSize: '2rem',
                            color: 'var(--color-primary)',
                            marginBottom: '0.5rem',
                            fontFamily: 'var(--font-serif)'
                        }}>
                            Tebrikler! 🎉
                        </h2>
                        <h3 style={{
                            fontSize: '1.5rem',
                            marginBottom: '1rem',
                            fontWeight: 700
                        }}>
                            "{currentBadge.rozet_adi}"
                        </h3>
                        <p style={{
                            color: 'var(--neutral-600)',
                            marginBottom: '2rem',
                            lineHeight: 1.6
                        }}>
                            {currentBadge.kazanim_kriteri}
                        </p>
                        <button
                            className="btn btn-primary"
                            onClick={closeCurrent}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                fontSize: '1.1rem'
                            }}
                        >
                            Harika!
                        </button>

                        {/* Confetti-like effect (CSS only approximation) */}
                        <div className="confetti-container"></div>
                    </div>

                    <style>{`
                        @keyframes fadeIn {
                            from { opacity: 0; }
                            to { opacity: 1; }
                        }
                        @keyframes popIn {
                            from { transform: scale(0.8); opacity: 0; }
                            to { transform: scale(1); opacity: 1; }
                        }
                    `}</style>
                </div>
            )}
        </BadgeContext.Provider>
    );
};
