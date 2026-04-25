import React from 'react';
import { INITIAL_WEAPONS, type Rarity, WEAPON_PREREQ, WEAPON_LEVEL_REQ } from '../types/game';

interface WeaponLoadoutScreenProps {
  shards: number;
  playerLevel: number;
  unlockedWeaponIds: string[];
  selectedWeaponIds: string[];
  onUnlock: (weaponId: string) => void;
  onToggleSelect: (weaponId: string) => void;
  onBack: () => void;
}

const rarityColor: Record<Rarity, string> = {
  COMMON: '#89f57e',
  RARE: '#64c8ff',
  EPIC: '#ca93ff',
  LEGENDARY: '#ffb35f',
  SUPREME: '#ff5a7d'
};

const rarityRank: Record<Rarity, number> = {
  COMMON: 0,
  RARE: 1,
  EPIC: 2,
  LEGENDARY: 3,
  SUPREME: 4
};

const WeaponLoadoutScreen: React.FC<WeaponLoadoutScreenProps> = ({
  shards,
  playerLevel,
  unlockedWeaponIds,
  selectedWeaponIds,
  onUnlock,
  onToggleSelect,
  onBack
}) => {
  const defaultWeaponId = 'bit-01';
  const selectedCount = selectedWeaponIds.filter(id => unlockedWeaponIds.includes(id) && id !== defaultWeaponId).length;
  const canSelectMore = selectedCount < 6;

  const sortedWeapons = [...INITIAL_WEAPONS].sort((a, b) => {
    const rarityDiff = rarityRank[a.rarity] - rarityRank[b.rarity];
    if (rarityDiff !== 0) return rarityDiff;
    return a.unlockCost - b.unlockCost;
  });

  const selectedWeapons = sortedWeapons.filter(w => selectedWeaponIds.includes(w.id));
  const weaponNameMap = new Map(sortedWeapons.map(w => [w.id, w.name]));

  return (
    <div className="loadout-shell">
      <div className="loadout-top">
        <h1>WEAPON ARMORY</h1>
        <p>武器を解放した後、青いボタン「宝箱候補に追加」を押すと候補に入ります。</p>
      </div>

      <div className="loadout-status-row">
        <div className="loadout-status-card">SHARDS: {shards}</div>
        <div className="loadout-status-card">解放レベル: {playerLevel}</div>
        <div className="loadout-status-card">宝箱候補: {selectedCount} / 6</div>
      </div>

      <div className="hub-panel" style={{ padding: '9px 10px', marginBottom: '2px', overflow: 'hidden' }}>
        <p style={{ fontSize: '0.68rem', color: '#9fc0ef', marginBottom: '6px' }}>現在の宝箱候補（ここに表示されればOK）</p>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', maxWidth: '100%', paddingBottom: 4 }}>
          {selectedWeapons.length === 0 && <span style={{ fontSize: '0.7rem', color: '#9ba8be' }}>まだ選択されていません</span>}
          {selectedWeapons.map(weapon => (
            <button
              key={weapon.id}
              className="btn-summon"
              onClick={() => onToggleSelect(weapon.id)}
              style={{
                minWidth: '120px',
                flex: '0 0 auto',
                padding: '6px 8px',
                borderColor: '#6dff9d',
                color: '#6dff9d',
                fontSize: '0.68rem'
              }}
            >
              {weapon.name} 解除
            </button>
          ))}
        </div>
      </div>

      <div className="loadout-grid">
        {sortedWeapons.map((weapon) => {
          const isDefault = weapon.id === defaultWeaponId;
          const isUnlocked = unlockedWeaponIds.includes(weapon.id);
          const isSelected = selectedWeaponIds.includes(weapon.id);
          const prereqId = WEAPON_PREREQ[weapon.id];
          const prereqName = prereqId ? weaponNameMap.get(prereqId) : null;
          const prereqMet = !prereqId || unlockedWeaponIds.includes(prereqId);
          const levelReq = WEAPON_LEVEL_REQ[weapon.id] ?? 1;
          const levelMet = playerLevel >= levelReq;
          const canUnlock = !isDefault && !isUnlocked && shards >= weapon.unlockCost && prereqMet && levelMet;
          const canToggle = isUnlocked && (isSelected || canSelectMore);

          return (
            <article
              key={weapon.id}
              className={`weapon-card ${isSelected ? 'selected' : ''} ${!isUnlocked && !isDefault ? 'locked' : ''}`}
              style={{ borderColor: isSelected ? 'var(--neon-green)' : 'rgba(255,255,255,0.16)' }}
            >
              <div className="weapon-head">
                <img src={`/game/cyber-defense/weapons/${weapon.id}.svg`} alt={weapon.name} className="weapon-icon" />
                <div>
                  <p className="weapon-name">{weapon.name}</p>
                  <p className="weapon-rarity" style={{ color: rarityColor[weapon.rarity] }}>{weapon.rarity}</p>
                </div>
              </div>

              <p className="weapon-description">{weapon.description}</p>
              <p className="weapon-effect">効果: {weapon.effectLabel}</p>
              <p className="weapon-effect">攻撃力: {weapon.damage} / 間隔: {weapon.cooldown}ms</p>
              <p className="weapon-unlock-state">解放条件: Lv {levelReq}</p>
              {prereqId && (
                <p className="weapon-unlock-state">
                  前提解放: {prereqName ?? prereqId}
                </p>
              )}
              <p className="weapon-unlock-state">
                {isDefault ? '初期武器（ステージ開始時のみ有効）' : isUnlocked ? '解放済み' : `未開放 / 必要SHARDS ${weapon.unlockCost}`}
              </p>

              {isDefault && <div className="weapon-default-chip">DEFAULT</div>}

              {!isDefault && !isUnlocked && (
                <button
                  className="btn-summon weapon-action unlock"
                  onClick={() => onUnlock(weapon.id)}
                  disabled={!canUnlock}
                >
                  {canUnlock ? '解放する' : !levelMet ? 'レベル不足' : prereqMet ? 'SHARDS不足' : '前提未解放'}
                </button>
              )}

              {!isDefault && isUnlocked && (
                <button
                  className="btn-summon weapon-action select"
                  onClick={() => onToggleSelect(weapon.id)}
                  disabled={!canToggle}
                  style={{
                    borderColor: isSelected ? '#6dff9d' : '#8edfff',
                    color: isSelected ? '#6dff9d' : '#8edfff',
                    opacity: canToggle ? 1 : 0.5
                  }}
                >
                  {isSelected ? '候補から外す' : '宝箱候補に追加'}
                </button>
              )}
            </article>
          );
        })}
      </div>

      <div className="loadout-footer">
        <button className="btn-summon hub-back-btn" onClick={onBack}>拠点へ戻る</button>
      </div>
    </div>
  );
};

export default WeaponLoadoutScreen;
