import React from 'react';
import type { MetaUpgrades } from '../types/game';

interface UpgradeScreenProps {
  shards: number;
  upgrades: MetaUpgrades;
  onUpgrade: (type: keyof MetaUpgrades, cost: number) => void;
  onBack: () => void;
}

export const UPGRADE_CONFIGS: Record<keyof MetaUpgrades, {
  name: string;
  description: string;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  effect: string;
}> = {
  damageLevel: { name: '攻撃最適化', description: '全武器の攻撃力を恒常強化', maxLevel: 10, baseCost: 100, costMultiplier: 1.5, effect: '+10% / Lv' },
  cooldownLevel: { name: 'クロック加速', description: '全武器のクールダウン短縮', maxLevel: 10, baseCost: 150, costMultiplier: 1.6, effect: '-5% / Lv' },
  maxHpLevel: { name: 'コア増幅', description: '初期コア耐久を上昇', maxLevel: 5, baseCost: 200, costMultiplier: 2, effect: '+20 / Lv' },
  expGainLevel: { name: '学習効率化', description: '戦闘中の獲得EXPを増加', maxLevel: 5, baseCost: 300, costMultiplier: 2.5, effect: '+10% / Lv' },
  rerollLevel: { name: '再抽選拡張', description: 'スキル再抽選回数を追加', maxLevel: 3, baseCost: 500, costMultiplier: 3, effect: '+1 / Lv' }
};

const UpgradeScreen: React.FC<UpgradeScreenProps> = ({ shards, upgrades, onUpgrade, onBack }) => {
  const getCost = (type: keyof MetaUpgrades, currentLevel: number) => {
    const config = UPGRADE_CONFIGS[type];
    if (currentLevel >= config.maxLevel) return Infinity;
    return Math.floor(config.baseCost * Math.pow(config.costMultiplier, currentLevel));
  };

  return (
    <div className="game-over-overlay" style={{ background: 'rgba(4, 8, 22, 0.96)', justifyContent: 'flex-start', paddingTop: '22px' }}>
      <div style={{ width: '94%', maxWidth: '700px' }}>
        <h1 style={{ color: 'var(--neon-pink)', marginBottom: '8px', fontSize: '1.65rem', letterSpacing: '0.4px' }}>SYSTEM UPGRADE</h1>
        <p style={{ color: '#9fb9e8', marginBottom: '12px', fontSize: '0.76rem' }}>SHARDSを消費して恒常アップグレードを実行します。</p>

        <div style={{
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '12px',
          padding: '10px 12px',
          marginBottom: '12px',
          background: 'rgba(13, 22, 47, 0.82)',
          color: '#ffd987',
          fontWeight: 700,
          fontSize: '0.9rem'
        }}>
          所持SHARDS: {shards}
        </div>

        <div style={{ display: 'grid', gap: '9px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '2px' }}>
          {(Object.keys(UPGRADE_CONFIGS) as Array<keyof MetaUpgrades>).map((key) => {
            const cfg = UPGRADE_CONFIGS[key];
            const level = upgrades[key];
            const cost = getCost(key, level);
            const isMax = level >= cfg.maxLevel;
            const canBuy = !isMax && shards >= cost;

            return (
              <article key={key} style={{
                border: `1px solid ${isMax ? 'rgba(109,255,157,0.6)' : 'rgba(255,255,255,0.18)'}`,
                borderRadius: '12px',
                background: 'linear-gradient(150deg, rgba(12, 22, 50, 0.9), rgba(7, 13, 30, 0.95))',
                padding: '10px',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '10px',
                alignItems: 'center'
              }}>
                <div>
                  <p style={{ color: '#e7f1ff', fontWeight: 700, fontSize: '0.88rem' }}>{cfg.name} <span style={{ color: '#a9c8ff', fontSize: '0.75rem' }}>Lv.{level}/{cfg.maxLevel}</span></p>
                  <p style={{ color: '#98b5df', fontSize: '0.7rem', marginTop: '2px' }}>{cfg.description}</p>
                  <p style={{ color: '#86f2b8', fontSize: '0.68rem', marginTop: '2px' }}>効果: {cfg.effect}</p>
                </div>

                <button
                  className="btn-summon"
                  onClick={() => onUpgrade(key, cost)}
                  disabled={!canBuy}
                  style={{
                    minWidth: '106px',
                    padding: '7px 8px',
                    fontSize: '0.72rem',
                    color: isMax ? '#89f57e' : canBuy ? '#8edfff' : '#9aa0aa',
                    borderColor: isMax ? '#89f57e' : canBuy ? '#8edfff' : '#596070'
                  }}
                >
                  {isMax ? 'MAX' : `強化 ${cost}`}
                </button>
              </article>
            );
          })}
        </div>

        <button className="btn-summon" onClick={onBack} style={{ width: '100%', marginTop: '12px', padding: '10px' }}>
          拠点へ戻る
        </button>
      </div>
    </div>
  );
};

export default UpgradeScreen;

