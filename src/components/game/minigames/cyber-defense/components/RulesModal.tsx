import React from 'react';

interface RulesModalProps {
    onClose: () => void;
}

const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
    return (
        <div className="rules-overlay">
            <div
                style={{
                    background: 'var(--bg-panel)',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '2px solid var(--neon-blue)',
                    maxWidth: '90%',
                    maxHeight: '90%',
                    overflowY: 'auto'
                }}
            >
                <h2 style={{ color: 'var(--neon-blue)', marginBottom: '20px' }}>システム・マニュアル</h2>

                <div style={{ textAlign: 'left', fontSize: '0.9rem', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <section>
                        <h3 style={{ color: 'var(--neon-pink)', fontSize: '1rem' }}>1. ミッション</h3>
                        <p>中心の「コア」を守りながら、ウェーブごとに押し寄せるマルウェア群を殲滅します。規定ウェーブを突破すると勝利です。</p>
                    </section>

                    <section>
                        <h3 style={{ color: 'var(--neon-pink)', fontSize: '1rem' }}>2. 操作</h3>
                        <p>画面ドラッグ中は照準を手動でコントロールします。未操作時は最も近い敵をオート照準するため、スマホでも遊びやすくなっています。</p>
                    </section>

                    <section>
                        <h3 style={{ color: 'var(--neon-pink)', fontSize: '1rem' }}>3. 武器特性</h3>
                        <p>BITは標準弾、LASERは高貫通高威力、ORBITは周回弾、AREAは周辺へノヴァ衝撃波を発生。状況に応じて強化を選ぶのが重要です。</p>
                    </section>

                    <section>
                        <h3 style={{ color: 'var(--neon-pink)', fontSize: '1rem' }}>4. 成長と報酬</h3>
                        <p>敵撃破で経験値を獲得し、レベルアップ時に強化チップを選択。チェスト破壊時には即時報酬と特別選択が発生します。</p>
                    </section>
                </div>

                <button className="btn-summon" onClick={onClose} style={{ marginTop: '25px', width: '100%' }}>
                    了解した
                </button>
            </div>
        </div>
    );
};

export default RulesModal;
