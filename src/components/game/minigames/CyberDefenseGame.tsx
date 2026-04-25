"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useGameStore } from '@/lib/gameStore';
import { toast } from 'sonner';

import './cyber-defense/index.css';

import GameCanvas from './cyber-defense/components/GameCanvas';
import StageSelect from './cyber-defense/components/StageSelect';
import RulesModal from './cyber-defense/components/RulesModal';
import SkillSelect from './cyber-defense/components/SkillSelect';
import HubScreen from './cyber-defense/components/HubScreen';
import UpgradeScreen from './cyber-defense/components/UpgradeScreen';
import WeaponLoadoutScreen from './cyber-defense/components/WeaponLoadoutScreen';

import type { Skill } from './cyber-defense/components/SkillSelect';
import { 
  type WeaponStats, 
  INITIAL_WEAPONS, 
  type MetaUpgrades, 
  INITIAL_META_UPGRADES, 
  WEAPON_PREREQ, 
  WEAPON_LEVEL_REQ 
} from './cyber-defense/types/game';

type GameState = 'START' | 'HUB' | 'PLAYING' | 'GAMEOVER' | 'VICTORY';
const DATA_VERSION = 'v3_ehime_edition';

const CyberDefenseGame: React.FC = () => {
  const { setGameMode, gainExpFromAction } = useGameStore();
  const supabase = createClient();

  // --- Game Persistence State ---
  const [shards, setShards] = useState(0);
  const [metaUpgrades, setMetaUpgrades] = useState<MetaUpgrades>(INITIAL_META_UPGRADES);
  const [unlockedWeaponIds, setUnlockedWeaponIds] = useState<string[]>([]);
  const [selectedWeaponIds, setSelectedWeaponIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Runtime Game State ---
  const [weapons, setWeapons] = useState<WeaponStats[]>([]);
  const [pendingWeaponPool, setPendingWeaponPool] = useState<WeaponStats[]>([]);
  const [hp, setHp] = useState(100);
  const [level, setLevel] = useState(1);
  const [exp, setExp] = useState(0);
  const [gameState, setGameState] = useState<GameState>('HUB');
  
  const [showSkillSelect, setShowSkillSelect] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showWeaponLoadout, setShowWeaponLoadout] = useState(false);
  
  const [difficulty, setDifficulty] = useState(1);
  const [currentSkills, setCurrentSkills] = useState<Skill[]>([]);
  const [rerollsLeft, setRerollsLeft] = useState(3);
  const [selectAllsLeft, setSelectAllsLeft] = useState(2);
  const [waveProgress, setWaveProgress] = useState(0);
  const [fieldDamageTrigger, setFieldDamageTrigger] = useState(0);
  const [isGamePaused, setIsGamePaused] = useState(false);
  
  const [runShardsEarned, setRunShardsEarned] = useState(0);
  const [runKills, setRunKills] = useState(0);
  const [runRewards, setRunRewards] = useState<string[]>([]);
  const [runStartWeapons, setRunStartWeapons] = useState(0);

  const playerLevel = useMemo(() => (
    1 +
    metaUpgrades.damageLevel +
    metaUpgrades.cooldownLevel +
    metaUpgrades.maxHpLevel +
    metaUpgrades.expGainLevel +
    metaUpgrades.rerollLevel
  ), [metaUpgrades]);

  const validWeaponIds = useMemo(() => INITIAL_WEAPONS.map(w => w.id), []);
  const selectedUnlockedWeaponIds = useMemo(
    () => selectedWeaponIds.filter(id => unlockedWeaponIds.includes(id) && id !== 'bit-01'),
    [selectedWeaponIds, unlockedWeaponIds]
  );

  // --- Data Loading ---
  useEffect(() => {
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('cyber_defense_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading game progress:', error);
        setIsLoading(false);
        return;
      }

      if (data) {
        setShards(data.shards || 0);
        setMetaUpgrades(data.meta_upgrades as MetaUpgrades || INITIAL_META_UPGRADES);
        setUnlockedWeaponIds(data.unlocked_weapon_ids || []);
        setSelectedWeaponIds(data.selected_weapon_ids || []);
      } else {
        // First time initialization
        setShards(100); // Starter shards
        setUnlockedWeaponIds([]);
        setSelectedWeaponIds([]);
      }
      setIsLoading(false);
    };

    initData();
  }, [supabase]);

  // --- Data Saving ---
  const saveProgress = useCallback(async (updates: {
    shards?: number,
    meta_upgrades?: MetaUpgrades,
    unlocked_weapon_ids?: string[],
    selected_weapon_ids?: string[]
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('cyber_defense_progress')
      .upsert({
        user_id: user.id,
        ...updates,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving game progress:', error);
    }
  }, [supabase]);

  // Handle meta normalization
  useEffect(() => {
    if (isLoading) return;
    const normalizedUnlocked = Array.from(new Set(unlockedWeaponIds)).filter(id => validWeaponIds.includes(id));
    if (JSON.stringify(normalizedUnlocked) !== JSON.stringify(unlockedWeaponIds)) {
      setUnlockedWeaponIds(normalizedUnlocked);
    }

    const normalizedSelected = Array.from(new Set(selectedWeaponIds)).filter(
      id => normalizedUnlocked.includes(id) && id !== 'bit-01'
    );
    if (JSON.stringify(normalizedSelected) !== JSON.stringify(selectedWeaponIds)) {
      setSelectedWeaponIds(normalizedSelected);
    }
  }, [unlockedWeaponIds, selectedWeaponIds, validWeaponIds, isLoading]);

  // --- Game Logic ---
  const applyMeta = (w: WeaponStats): WeaponStats => ({
    ...w,
    damage: Math.floor(w.damage * (1 + metaUpgrades.damageLevel * 0.1)),
    cooldown: Math.floor(w.cooldown * (1 - metaUpgrades.cooldownLevel * 0.05)),
  });

  const startStage = (diff: number) => {
    setDifficulty(diff);
    setHp(100 + metaUpgrades.maxHpLevel * 20);
    setLevel(1);
    setExp(0);
    setRerollsLeft(3 + metaUpgrades.rerollLevel);
    setSelectAllsLeft(2);
    setWaveProgress(0);
    setIsGamePaused(false);
    setRunShardsEarned(0);
    setRunKills(0);
    setRunRewards([]);
    setRunStartWeapons(1);

    const defaultWeapon = INITIAL_WEAPONS.find(w => w.id === 'bit-01') ?? INITIAL_WEAPONS[0];
    setWeapons([applyMeta(defaultWeapon)]);

    const stageWeaponPool = selectedWeaponIds
      .filter(id => id !== defaultWeapon.id && unlockedWeaponIds.includes(id))
      .map(id => INITIAL_WEAPONS.find(w => w.id === id))
      .filter((w): w is WeaponStats => Boolean(w))
      .map(applyMeta);

    setPendingWeaponPool(stageWeaponPool);
    setGameState('PLAYING');
  };

  const getRandomSkills = (): Skill[] => {
    const hasSkill = (id: string) => {
      if (id === 'brn') return weapons.some(w => w.hasBurn);
      if (id === 'ltg') return weapons.some(w => w.hasLightning);
      return false;
    };

    const pool: Skill[] = [
      { id: 'pwr', name: '威力アップ', description: '全武器の攻撃力が15%上昇', rarity: 'COMMON', effect: () => setWeapons(ws => ws.map(w => ({ ...w, damage: Math.floor(w.damage * 1.15) }))) },
      { id: 'clk', name: 'クロック加速', description: '全武器の攻撃間隔を15%短縮', rarity: 'RARE', effect: () => setWeapons(ws => ws.map(w => ({ ...w, cooldown: Math.floor(w.cooldown * 0.85) }))) },
      { id: 'pen', name: '貫通プロトコル', description: '全武器の貫通数が +1 増加', rarity: 'EPIC', effect: () => setWeapons(ws => ws.map(w => ({ ...w, penetration: w.penetration + 1 }))) },
      { id: 'siz', name: 'バッファ拡大', description: '弾のサイズが 30% 拡大', rarity: 'COMMON', effect: () => setWeapons(ws => ws.map(w => ({ ...w, sizeMultiplier: w.sizeMultiplier * 1.3 }))) },
      { id: 'bst', name: 'マルチスレッド', description: '同時発射数が +1 増加', rarity: 'RARE', effect: () => setWeapons(ws => ws.map(w => ({ ...w, projectileCount: w.projectileCount + 1 }))) },
      { id: 'omni', name: 'オーバークロック', description: '攻撃力50%増加、発射数+2', rarity: 'LEGENDARY', effect: () => setWeapons(ws => ws.map(w => ({ ...w, damage: Math.floor(w.damage * 1.5), projectileCount: w.projectileCount + 2 }))) },
    ];

    if (!hasSkill('brn')) pool.push({ id: 'brn', name: '延焼プログラム', description: 'ヒットした敵に継続ダメージ', rarity: 'RARE', effect: () => setWeapons(ws => ws.map(w => ({ ...w, hasBurn: true }))) });
    if (!hasSkill('ltg')) pool.push({ id: 'ltg', name: '電磁連鎖', description: 'ヒット時に周囲の敵へ放電', rarity: 'EPIC', effect: () => setWeapons(ws => ws.map(w => ({ ...w, hasLightning: true }))) });
    pool.push({ id: 'god', name: 'システム掌握', description: '画面内全ての敵の現在HPを半減', rarity: 'SUPREME', effect: () => setFieldDamageTrigger(prev => prev + 1) });

    const weights: Record<string, number> = { COMMON: 50, RARE: 30, EPIC: 12, LEGENDARY: 6, SUPREME: 2 };
    const weightedPool: Skill[] = [];
    pool.forEach(skill => {
      const weight = weights[skill.rarity] || 10;
      for (let i = 0; i < weight; i++) weightedPool.push(skill);
    });

    const selected: Skill[] = [];
    while (selected.length < 3 && weightedPool.length > 0) {
      const index = Math.floor(Math.random() * weightedPool.length);
      const skill = weightedPool[index];
      if (!selected.find(s => s.id === skill.id)) selected.push(skill);
      weightedPool.splice(index, 1);
    }

    return selected.length < 3 ? pool.slice(0, 3) : selected;
  };

  const getWeaponChoices = useCallback((): Skill[] => {
    if (pendingWeaponPool.length === 0) return [];
    const shuffled = [...pendingWeaponPool].sort(() => Math.random() - 0.5);
    const weaponChoices = shuffled.slice(0, Math.min(3, shuffled.length));
    return weaponChoices.map((w, index) => ({
      id: `${w.id}-activate-${index}-${Date.now()}`,
      name: `[武器起動] ${w.name}`,
      description: `${w.name} の機能を戦闘へ追加`,
      rarity: 'EPIC' as const,
      effect: () => {
        setWeapons(prev => [...prev, { ...w, id: `${w.id}-active-${Date.now()}-${Math.floor(Math.random() * 1000)}` }]);
        setPendingWeaponPool(prev => {
          const removeIndex = prev.findIndex(p => p.id === w.id);
          if (removeIndex < 0) return prev;
          const next = [...prev];
          next.splice(removeIndex, 1);
          return next;
        });
      }
    }));
  }, [pendingWeaponPool]);

  const handleEnemyKill = useCallback((reward: number, expGain: number, chestType?: 'UPGRADE_CHEST' | 'WEAPON_CHEST') => {
    if (chestType) {
      const roundedReward = Math.round(reward / 10) * 10;
      setShards(prev => {
        const next = prev + roundedReward;
        saveProgress({ shards: next });
        return next;
      });
      setRunShardsEarned(prev => prev + roundedReward);
      setRunRewards(prev => {
        const label = chestType === 'WEAPON_CHEST' ? '武器宝箱' : '強化宝箱';
        const count = prev.filter(r => r === label).length + 1;
        const next = prev.filter(r => r !== label);
        next.push(`${label} x${count}`);
        return next;
      });

      if (chestType === 'WEAPON_CHEST') {
        if (pendingWeaponPool.length > 0) {
          setCurrentSkills(getWeaponChoices());
          setShowSkillSelect(true);
        } else {
          setCurrentSkills(getRandomSkills());
          setShowSkillSelect(true);
        }
      } else {
        setCurrentSkills(getRandomSkills());
        setShowSkillSelect(true);
      }
      return;
    }

    const roundedReward = Math.round(reward / 10) * 10;
    if (roundedReward > 0) {
      setShards(prev => {
        const next = prev + roundedReward;
        saveProgress({ shards: next });
        return next;
      });
      setRunShardsEarned(prev => prev + roundedReward);
    }

    const multiplier = 1 + metaUpgrades.expGainLevel * 0.1;
    setExp(prev => prev + (expGain * multiplier));
    setRunKills(prev => prev + 1);
  }, [metaUpgrades.expGainLevel, pendingWeaponPool, weapons, getWeaponChoices, saveProgress]);

  useEffect(() => {
    if (exp >= 100) {
      setExp(0);
      setCurrentSkills(getRandomSkills());
      setShowSkillSelect(true);
    }
  }, [exp, weapons]);

  const handleSkillSelect = (skill: Skill) => {
    skill.effect();
    setLevel(l => l + 1);
    setShowSkillSelect(false);
  };

  const isWeaponChoice = currentSkills.some(skill => skill.name.startsWith('[武器起動]'));

  const handleReroll = () => {
    if (rerollsLeft > 0) {
      if (isWeaponChoice) {
        if (pendingWeaponPool.length === 0) return;
        setRerollsLeft(r => r - 1);
        setCurrentSkills(getWeaponChoices());
        return;
      }
      setRerollsLeft(r => r - 1);
      setCurrentSkills(getRandomSkills());
    }
  };

  const handleSelectAll = () => {
    if (isWeaponChoice) return;
    if (selectAllsLeft > 0) {
      setSelectAllsLeft(s => s - 1);
      currentSkills.forEach(s => s.effect());
      setLevel(l => l + 1);
      setShowSkillSelect(false);
    }
  };

  const handleCoreDamage = useCallback((damage: number) => {
    setHp(prev => {
      const newHp = Math.max(0, prev - Math.floor(damage));
      if (newHp === 0) setGameState('GAMEOVER');
      return newHp;
    });
  }, []);

  const handleVictory = useCallback(() => {
    setShowSkillSelect(false);
    setIsGamePaused(false);
    setGameState('VICTORY');
    
    // Grant rewards to Ehime Base status
    gainExpFromAction('study');
    toast.success('サイバーディフェンス完了！適応力が向上しました。');
  }, [gainExpFromAction]);

  const handleTogglePause = useCallback(() => {
    setIsGamePaused(p => !p);
  }, []);

  const handleReturnToHub = useCallback(() => {
    setShowSkillSelect(false);
    setIsGamePaused(false);
    setWaveProgress(0);
    setGameState('HUB');
  }, []);

  const handleMetaUpgrade = (type: keyof MetaUpgrades, cost: number) => {
    if (shards >= cost) {
      const nextShards = shards - cost;
      const nextUpgrades = { ...metaUpgrades, [type]: metaUpgrades[type] + 1 };
      setShards(nextShards);
      setMetaUpgrades(nextUpgrades);
      saveProgress({ shards: nextShards, meta_upgrades: nextUpgrades });
    }
  };

  const handleUnlockWeapon = (weaponId: string) => {
    const weapon = INITIAL_WEAPONS.find(w => w.id === weaponId);
    if (!weapon) return;
    const cost = weapon.unlockCost;
    const prereq = WEAPON_PREREQ[weaponId];
    const levelReq = WEAPON_LEVEL_REQ[weaponId] ?? 1;
    if (prereq && !unlockedWeaponIds.includes(prereq)) return;
    if (playerLevel < levelReq) return;
    if (weaponId === 'bit-01' || unlockedWeaponIds.includes(weaponId) || shards < cost) return;
    
    const nextShards = shards - cost;
    const nextUnlocked = [...unlockedWeaponIds, weaponId];
    setShards(nextShards);
    setUnlockedWeaponIds(nextUnlocked);
    saveProgress({ shards: nextShards, unlocked_weapon_id: nextUnlocked } as any);
  };

  const handleToggleSelectWeapon = (weaponId: string) => {
    if (!unlockedWeaponIds.includes(weaponId)) return;
    const nextSelected = selectedWeaponIds.includes(weaponId) 
      ? selectedWeaponIds.filter(id => id !== weaponId)
      : (selectedWeaponIds.length >= 6 ? selectedWeaponIds : [...selectedWeaponIds, weaponId]);
    
    setSelectedWeaponIds(nextSelected);
    saveProgress({ selected_weapon_ids: nextSelected });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#050510] text-blue-400">
        <div className="text-xl font-bold animate-pulse">SYSTEM INITIALIZING...</div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <header className="game-header">
        <div className="stats" style={{ color: 'var(--neon-green)' }}>
          LV: {level} | 進行度: {waveProgress}%
        </div>
        <div className="stats" style={{ color: 'var(--neon-yellow)' }}>
          SHARDS: {shards}
        </div>
        <div className="stats" style={{ color: hp < 30 ? 'var(--neon-pink)' : 'var(--neon-blue)' }}>
          コア: {hp}%
        </div>
      </header>

      <main className="battle-area" style={{ height: 'calc(100% - 60px)' }}>
        {gameState === 'START' && (
          <StageSelect
            onSelect={(selectedDifficulty) => startStage(selectedDifficulty)}
            onShowRules={() => setShowRules(true)}
            onBack={() => setGameState('HUB')}
          />
        )}

        {gameState === 'HUB' && !showUpgrade && !showWeaponLoadout && (
          <HubScreen
            shards={shards}
            difficulty={difficulty}
            selectedWeaponCount={selectedUnlockedWeaponIds.length}
            onStart={() => setGameState('START')}
            onUpgrade={() => { setShowUpgrade(true); setShowWeaponLoadout(false); }}
            onWeaponLoadout={() => { setShowWeaponLoadout(true); setShowUpgrade(false); }}
            onBack={() => setGameMode('action_menu')}
          />
        )}

        {gameState === 'HUB' && showUpgrade && (
          <UpgradeScreen
            shards={shards}
            upgrades={metaUpgrades}
            onUpgrade={handleMetaUpgrade}
            onBack={() => setShowUpgrade(false)}
          />
        )}

        {gameState === 'HUB' && showWeaponLoadout && (
          <WeaponLoadoutScreen
            shards={shards}
            playerLevel={playerLevel}
            unlockedWeaponIds={unlockedWeaponIds}
            selectedWeaponIds={selectedWeaponIds}
            onUnlock={handleUnlockWeapon}
            onToggleSelect={handleToggleSelectWeapon}
            onBack={() => setShowWeaponLoadout(false)}
          />
        )}

        {showRules && <RulesModal onClose={() => setShowRules(false)} />}

        {showSkillSelect && (
          <SkillSelect
            skills={currentSkills}
            onSelect={handleSkillSelect}
            onReroll={handleReroll}
            rerollsLeft={rerollsLeft}
            onSelectAll={isWeaponChoice ? undefined : handleSelectAll}
            selectAllsLeft={isWeaponChoice ? 0 : selectAllsLeft}
          />
        )}

        {gameState === 'PLAYING' && (
          <>
            <GameCanvas
              weapons={weapons}
              onEnemyKill={handleEnemyKill}
              onCoreDamage={handleCoreDamage}
              onWaveProgress={setWaveProgress}
              difficulty={difficulty}
              onVictory={handleVictory}
              isPaused={showSkillSelect || isGamePaused}
              fieldDamageTrigger={fieldDamageTrigger}
            />
            <div className="hud-area">
              {weapons.map((w, i) => (
                <div key={`${w.id}-${i}`} className='weapon-slot'>
                  <img src={`/game/cyber-defense/weapons/${w.id.split('-active-')[0]}.svg`} alt={w.name} className='weapon-slot-icon' />
                </div>
              ))}
            </div>
            <div style={{ position: 'absolute', bottom: 20, right: 18, display: 'flex', gap: 8, zIndex: 10 }}>
              <button className="btn-summon" onClick={handleTogglePause} style={{ padding: '8px 14px', fontSize: '12px' }}>
                {isGamePaused ? '再開' : '一時停止'}
              </button>
              <button className="btn-summon" onClick={handleReturnToHub} style={{ padding: '8px 14px', fontSize: '12px' }}>
                中止
              </button>
            </div>
          </>
        )}

        {gameState === 'GAMEOVER' && (
          <div className="game-over-overlay">
            <h1 style={{ color: 'var(--neon-pink)', fontSize: '1.5rem' }}>システム致命的エラー</h1>
            <p style={{ fontSize: '0.9rem' }}>生存レベル: {level}</p>
            <button className="btn-summon" onClick={() => setGameState('HUB')}>ハブへ戻る</button>
          </div>
        )}

        {gameState === 'VICTORY' && (
          <div className="game-over-overlay">
            <h1 style={{ color: 'var(--neon-green)', fontSize: '1.5rem' }}>クリーンアップ完了</h1>
            <div style={{ marginTop: 16, marginBottom: 20, width: '100%', maxWidth: 300, textAlign: 'left', background: 'rgba(10, 20, 41, 0.8)', border: '1px solid rgba(109, 255, 157, 0.35)', borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--neon-yellow)', marginBottom: 6 }}>獲得リザルト</div>
              <div style={{ fontSize: '0.75rem', color: '#d7e6ff' }}>SHARDS: +{runShardsEarned}</div>
              <div style={{ fontSize: '0.75rem', color: '#d7e6ff' }}>撃破数: {runKills}</div>
              <div style={{ fontSize: '0.75rem', color: '#d7e6ff' }}>最終LV: {level}</div>
              {runRewards.length > 0 && (
                <div style={{ marginTop: 8, fontSize: '0.7rem', color: '#9cc3ff' }}>
                  {runRewards.map((r, i) => (
                    <div key={i}>{r}</div>
                  ))}
                </div>
              )}
            </div>
            <button className="btn-summon" onClick={() => setGameState('HUB')}>拠点へ戻る</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default CyberDefenseGame;
