import React from 'react';

interface StageSelectProps {
    onSelect: (difficulty: number) => void;
    onShowRules: () => void;
    onBack?: () => void;
}

const StageSelect: React.FC<StageSelectProps> = ({ onSelect, onShowRules, onBack }) => {
    return (
        <div className="game-over-overlay" style={{ background: 'var(--bg-dark)' }}>
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <h1 style={{ color: 'var(--neon-blue)', marginBottom: '10px', fontSize: '2.5rem' }}>CYBER DEFENSE</h1>
                <p style={{ color: 'var(--neon-pink)', marginBottom: '30px', letterSpacing: '2px' }}>ステージ選択</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '280px', margin: '0 auto' }}>
                    <button className="btn-summon" onClick={() => onSelect(1)}>
                        ステージ 1 : 初級
                    </button>
                    <button className="btn-summon" onClick={() => onSelect(2)} style={{ borderColor: 'var(--neon-yellow)', color: 'var(--neon-yellow)' }}>
                        ステージ 2 : 中級
                    </button>
                    <button className="btn-summon" onClick={() => onSelect(3)} style={{ borderColor: 'var(--neon-pink)', color: 'var(--neon-pink)' }}>
                        ステージ 3 : 上級
                    </button>

                    {onBack && (
                        <button className="btn-summon" onClick={onBack} style={{ borderColor: '#999', color: '#ddd' }}>
                            拠点へ戻る
                        </button>
                    )}

                    <button
                        onClick={onShowRules}
                        style={{
                            marginTop: '16px',
                            background: 'none',
                            border: '1px solid #444',
                            color: '#888',
                            padding: '10px',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                        }}
                    >
                        ルール（遊び方）を確認
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StageSelect;
