export type WeaponType = 'BIT' | 'LASER' | 'ORBIT' | 'AREA' | 'BEAM';
export type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'SUPREME';

export const RARITY_LEVEL_REQ: Record<Rarity, number> = {
    COMMON: 1,
    RARE: 3,
    EPIC: 5,
    LEGENDARY: 7,
    SUPREME: 9
};

export interface WeaponStats {
    id: string;
    name: string;
    rarity: Rarity;
    unlockCost: number;
    effectLabel: string;
    level: number;
    damage: number;
    cooldown: number; // ms
    range: number;
    projectileCount: number;
    penetration: number;
    sizeMultiplier: number;
    hasBurn?: boolean;
    hasLightning?: boolean;
    description: string;
    type: WeaponType;
}

export interface UpgradeCard {
    id: string;
    weaponId: string;
    name: string;
    description: string;
    rarity: Rarity;
    effect: (stats: WeaponStats) => WeaponStats;
}

export const INITIAL_WEAPONS: WeaponStats[] = [
    {
        id: 'bit-01',
        name: 'パルス・ビット',
        rarity: 'COMMON',
        unlockCost: 0,
        effectLabel: '標準連射',
        level: 1,
        damage: 10,
        cooldown: 760,
        range: 420,
        projectileCount: 1,
        penetration: 1,
        sizeMultiplier: 1,
        description: '標準パルス弾で安定した迎撃を行う初期武器。',
        type: 'BIT'
    },
    {
        id: 'bit-02',
        name: 'デュアル・ビット',
        rarity: 'COMMON',
        unlockCost: 180,
        effectLabel: '2連射',
        level: 1,
        damage: 8,
        cooldown: 690,
        range: 420,
        projectileCount: 2,
        penetration: 1,
        sizeMultiplier: 0.95,
        description: '低威力だが2連射で手数を稼ぐ。',
        type: 'BIT'
    },
    {
        id: 'bit-03',
        name: 'スパイク・ビット',
        rarity: 'RARE',
        unlockCost: 340,
        effectLabel: '高貫通弾',
        level: 1,
        damage: 14,
        cooldown: 860,
        range: 450,
        projectileCount: 1,
        penetration: 3,
        sizeMultiplier: 1.05,
        description: '貫通特化のビット。列に並ぶ敵に強い。',
        type: 'BIT'
    },
    {
        id: 'bit-04',
        name: 'サンダー・ビット',
        rarity: 'EPIC',
        unlockCost: 760,
        effectLabel: '初期連鎖',
        level: 1,
        damage: 13,
        cooldown: 780,
        range: 440,
        projectileCount: 1,
        penetration: 2,
        sizeMultiplier: 1.1,
        hasLightning: true,
        description: '初期状態から電磁連鎖を内蔵した上位ビット。',
        type: 'BIT'
    },
    {
        id: 'laser-01',
        name: 'レーザー・キャノン',
        rarity: 'RARE',
        unlockCost: 320,
        effectLabel: '高威力直線',
        level: 1,
        damage: 16,
        cooldown: 1180,
        range: 640,
        projectileCount: 1,
        penetration: 10,
        sizeMultiplier: 1.4,
        description: '高威力・高貫通の直線レーザー。',
        type: 'LASER'
    },
    {
        id: 'laser-02',
        name: 'プリズム・レーザー',
        rarity: 'EPIC',
        unlockCost: 820,
        effectLabel: '扇状3本',
        level: 1,
        damage: 13,
        cooldown: 1260,
        range: 620,
        projectileCount: 3,
        penetration: 8,
        sizeMultiplier: 1.15,
        description: '3本同時照射で前方制圧力が高い。',
        type: 'LASER'
    },
    {
        id: 'laser-03',
        name: 'インフェルノ・レーザー',
        rarity: 'LEGENDARY',
        unlockCost: 1480,
        effectLabel: '灼熱貫通',
        level: 1,
        damage: 24,
        cooldown: 1350,
        range: 700,
        projectileCount: 1,
        penetration: 14,
        sizeMultiplier: 1.6,
        hasBurn: true,
        description: '着弾時に延焼を与える灼熱レーザー。',
        type: 'LASER'
    },
    {
        id: 'laser-04',
        name: 'ゼロデイ・レール',
        rarity: 'SUPREME',
        unlockCost: 2600,
        effectLabel: '極貫通極速',
        level: 1,
        damage: 30,
        cooldown: 1240,
        range: 760,
        projectileCount: 2,
        penetration: 20,
        sizeMultiplier: 1.8,
        hasLightning: true,
        description: '極めて高い制圧力を持つ最上位レール砲。',
        type: 'LASER'
    },
    {
        id: 'orbit-01',
        name: 'オービット・コア',
        rarity: 'RARE',
        unlockCost: 350,
        effectLabel: '周回防衛',
        level: 1,
        damage: 9,
        cooldown: 1400,
        range: 170,
        projectileCount: 2,
        penetration: 999,
        sizeMultiplier: 1.2,
        description: 'コア周囲を回転する防衛ビット。',
        type: 'ORBIT'
    },
    {
        id: 'orbit-02',
        name: 'リング・スウォーム',
        rarity: 'EPIC',
        unlockCost: 860,
        effectLabel: '多段周回',
        level: 1,
        damage: 8,
        cooldown: 1200,
        range: 190,
        projectileCount: 4,
        penetration: 999,
        sizeMultiplier: 1.05,
        description: '周回体を増やし接近敵を削る。',
        type: 'ORBIT'
    },
    {
        id: 'orbit-03',
        name: 'ヴォイド・リング',
        rarity: 'LEGENDARY',
        unlockCost: 1540,
        effectLabel: '重周回',
        level: 1,
        damage: 14,
        cooldown: 1500,
        range: 220,
        projectileCount: 3,
        penetration: 999,
        sizeMultiplier: 1.4,
        description: '1発が重い高出力オービット群。',
        type: 'ORBIT'
    },
    {
        id: 'orbit-04',
        name: 'カオス・コロナ',
        rarity: 'SUPREME',
        unlockCost: 2550,
        effectLabel: '電熱周回',
        level: 1,
        damage: 16,
        cooldown: 1320,
        range: 240,
        projectileCount: 5,
        penetration: 999,
        sizeMultiplier: 1.5,
        hasBurn: true,
        hasLightning: true,
        description: '延焼と連鎖を伴う最上位周回兵装。',
        type: 'ORBIT'
    },
    {
        id: 'area-01',
        name: 'エリア・ノヴァ',
        rarity: 'RARE',
        unlockCost: 380,
        effectLabel: '範囲衝撃波',
        level: 1,
        damage: 13,
        cooldown: 2000,
        range: 260,
        projectileCount: 1,
        penetration: 999,
        sizeMultiplier: 2.0,
        description: 'コア周辺に衝撃波を放つ範囲兵装。',
        type: 'AREA'
    },
    {
        id: 'area-02',
        name: 'EMP・ノヴァ',
        rarity: 'EPIC',
        unlockCost: 900,
        effectLabel: '広域麻痺圧',
        level: 1,
        damage: 15,
        cooldown: 1900,
        range: 300,
        projectileCount: 1,
        penetration: 999,
        sizeMultiplier: 2.2,
        description: 'やや広い半径で敵群をまとめて削る。',
        type: 'AREA'
    },
    {
        id: 'area-03',
        name: 'クエイク・ノヴァ',
        rarity: 'LEGENDARY',
        unlockCost: 1620,
        effectLabel: '超広域',
        level: 1,
        damage: 19,
        cooldown: 2120,
        range: 340,
        projectileCount: 1,
        penetration: 999,
        sizeMultiplier: 2.5,
        description: '超広域の衝撃波で前線を押し戻す。',
        type: 'AREA'
    },
    {
        id: 'area-04',
        name: 'アルマゲドン・ノヴァ',
        rarity: 'SUPREME',
        unlockCost: 2700,
        effectLabel: '終末波動',
        level: 1,
        damage: 26,
        cooldown: 2180,
        range: 390,
        projectileCount: 1,
        penetration: 999,
        sizeMultiplier: 2.8,
        hasBurn: true,
        description: '極大範囲に終末波動を放つ最終兵装。',
        type: 'AREA'
    },
    {
        id: 'beam-01',
        name: 'アーク・ビーム',
        rarity: 'EPIC',
        unlockCost: 840,
        effectLabel: '太径ビーム',
        level: 1,
        damage: 18,
        cooldown: 1480,
        range: 560,
        projectileCount: 1,
        penetration: 5,
        sizeMultiplier: 2.0,
        description: '太いビームを射出する制圧型。',
        type: 'BEAM'
    },
    {
        id: 'beam-02',
        name: 'ヘリックス・ビーム',
        rarity: 'LEGENDARY',
        unlockCost: 1680,
        effectLabel: '二重螺旋',
        level: 1,
        damage: 17,
        cooldown: 1360,
        range: 580,
        projectileCount: 2,
        penetration: 7,
        sizeMultiplier: 1.9,
        description: '2本螺旋ビームで中距離を制圧する。',
        type: 'BEAM'
    },
    {
        id: 'beam-03',
        name: 'ネビュラ・ビーム',
        rarity: 'SUPREME',
        unlockCost: 2480,
        effectLabel: '多段反応',
        level: 1,
        damage: 23,
        cooldown: 1420,
        range: 640,
        projectileCount: 2,
        penetration: 10,
        sizeMultiplier: 2.2,
        hasLightning: true,
        description: '命中時に高確率で連鎖反応を起こす。',
        type: 'BEAM'
    },
    {
        id: 'beam-04',
        name: 'シンギュラ・ビーム',
        rarity: 'SUPREME',
        unlockCost: 2950,
        effectLabel: '特異点砲',
        level: 1,
        damage: 28,
        cooldown: 1600,
        range: 700,
        projectileCount: 1,
        penetration: 16,
        sizeMultiplier: 2.6,
        hasBurn: true,
        hasLightning: true,
        description: '圧倒的な単発火力を誇る特異点兵装。',
        type: 'BEAM'
    }
];

export const WEAPON_LEVEL_REQ: Record<string, number> = Object.fromEntries(
    INITIAL_WEAPONS.map(w => [w.id, RARITY_LEVEL_REQ[w.rarity]])
) as Record<string, number>;

export const WEAPON_PREREQ: Record<string, string | null> = {
    'bit-01': null,
    'bit-02': 'bit-01',
    'bit-03': 'bit-02',
    'bit-04': 'bit-03',
    'laser-01': null,
    'laser-02': 'laser-01',
    'laser-03': 'laser-02',
    'laser-04': 'laser-03',
    'orbit-01': null,
    'orbit-02': 'orbit-01',
    'orbit-03': 'orbit-02',
    'orbit-04': 'orbit-03',
    'area-01': null,
    'area-02': 'area-01',
    'area-03': 'area-02',
    'area-04': 'area-03',
    'beam-01': null,
    'beam-02': 'beam-01',
    'beam-03': 'beam-02',
    'beam-04': 'beam-03'
};

export type SegmentType = 'HEAD' | 'BODY' | 'UPGRADE_CHEST' | 'WEAPON_CHEST';

export interface EnemySegment {
    id: string;
    type: SegmentType;
    x: number;
    y: number;
    hp: number;
    maxHp: number;
    hitFlash: number;
    burn: number;
}

export interface EnemyData {
    id: string;
    type: 'CENTIPEDE';
    segments: EnemySegment[];
    speed: number;
    reward: number;
    exp: number;
    pathPoints?: { x: number, y: number }[];
    pathIndex?: number;
}

export interface MetaUpgrades {
    damageLevel: number;
    cooldownLevel: number;
    maxHpLevel: number;
    expGainLevel: number;
    rerollLevel: number;
}

export const INITIAL_META_UPGRADES: MetaUpgrades = {
    damageLevel: 0,
    cooldownLevel: 0,
    maxHpLevel: 0,
    expGainLevel: 0,
    rerollLevel: 0
};


