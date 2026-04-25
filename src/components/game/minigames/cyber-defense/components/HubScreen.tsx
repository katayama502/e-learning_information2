import React from 'react';

interface HubScreenProps {
  shards: number;
  difficulty: number;
  selectedWeaponCount: number;
  onStart: () => void;
  onUpgrade: () => void;
  onWeaponLoadout: () => void;
  onBack?: () => void;
}

const difficultyLabel: Record<number, string> = {
  1: 'ステージ1: 初級',
  2: 'ステージ2: 中級',
  3: 'ステージ3: 上級'
};

const showcaseWeapons = [
  { id: 'laser-03', name: 'インフェルノ・レーザー', rarity: 'LEGENDARY' },
  { id: 'orbit-04', name: 'カオス・コロナ', rarity: 'SUPREME' },
  { id: 'beam-04', name: 'シンギュラ・ビーム', rarity: 'SUPREME' }
];

const incomingEnemies = [
  { name: 'ワーム・ヘッド', tone: 'enemy-red' },
  { name: 'アーマー節', tone: 'enemy-blue' },
  { name: '武器宝箱', tone: 'enemy-gold' }
];

const HubScreen: React.FC<HubScreenProps> = ({
  shards,
  difficulty,
  selectedWeaponCount,
  onStart,
  onUpgrade,
  onWeaponLoadout,
  onBack
}) => {
  return (
    <div className="hub-shell">
      <div className="hub-bg-glow hub-bg-glow-a" />
      <div className="hub-bg-glow hub-bg-glow-b" />

      <section className="hub-panel hero-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p className="hub-subtitle">CYBER DEFENSE // OPERATION HUB</p>
            <h1 className="hub-title">TACTICAL COMMAND</h1>
          </div>
          {onBack && (
            <button className="btn-summon" onClick={onBack} style={{ padding: '4px 12px', fontSize: '0.7rem' }}>EXIT</button>
          )}
        </div>
        <p className="hub-caption">拠点で武器を解放・選択し、ステージへ出撃します。</p>

        <div className="hub-pill-row">
          <div className="hub-pill shard-pill">SHARDS {shards}</div>
          <div className="hub-pill stage-pill">前回: {difficultyLabel[difficulty] ?? difficultyLabel[1]}</div>
          <div className="hub-pill weapon-pill">宝箱候補 {selectedWeaponCount} / 6</div>
        </div>
      </section>

      <section className="hub-panel command-panel">
        <button className="btn-summon hub-btn primary" onClick={onStart}>
          ミッション開始
          <span className="hub-btn-sub">ステージ選択へ進む</span>
        </button>

        <button className="btn-summon hub-btn weapon" onClick={onWeaponLoadout}>
          武器解放・装備
          <span className="hub-btn-sub">20種の武器を管理</span>
        </button>

        <button className="btn-summon hub-btn upgrade" onClick={onUpgrade}>
          プログラム強化
          <span className="hub-btn-sub">永続アップグレード</span>
        </button>
      </section>

      <section className="hub-panel feed-panel">
        <div className="hub-feed-column">
          <h2>注目武器</h2>
          <div className="hub-mini-grid">
            {showcaseWeapons.map((weapon) => (
              <article key={weapon.id} className="hub-mini-card">
                <img src={`/game/cyber-defense/weapons/${weapon.id}.svg`} alt={weapon.name} />
                <div>
                  <p className="hub-mini-name">{weapon.name}</p>
                  <p className="hub-mini-rarity">{weapon.rarity}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="hub-feed-column">
          <h2>脅威ログ</h2>
          <div className="hub-mini-grid">
            {incomingEnemies.map((enemy) => (
              <article key={enemy.name} className={`hub-mini-card ${enemy.tone}`}>
                <div className="enemy-dot" />
                <div>
                  <p className="hub-mini-name">{enemy.name}</p>
                  <p className="hub-mini-rarity">接近中</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HubScreen;

