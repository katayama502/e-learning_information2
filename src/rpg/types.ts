export type GameMode = 'map' | 'novel' | 'battle' | 'menu';

export interface Character {
    id: string;
    name: string;
    level: number;
    hp: number;
    maxHp: number;
    mp: number; // 知力 (Knowledge)
    maxMp: number;
    attack: number; // 就活戦闘力
    defense: number; // ストレス耐性
    exp: number;
    nextExp: number;
    skills: string[];
    equipment: {
        weapon?: string;
        armor?: string;
        accessory?: string;
    };
    avatar: string;
}

export interface Item {
    id: string;
    name: string;
    description: string;
    type: 'weapon' | 'armor' | 'accessory' | 'consumable' | 'key-item';
    stats?: {
        attack?: number;
        defense?: number;
        hp?: number;
        mp?: number;
    };
    effect?: (char: Character) => Partial<Character>;
    price: number;
    icon?: React.ReactNode;
}

export interface Skill {
    id: string;
    name: string;
    description: string;
    mpCost: number;
    power: number; // 攻撃倍率や回復量
    type: 'attack' | 'heal' | 'buff';
    learningId?: string; // 関連するe-ラーニングID
}

export interface Enemy {
    id: string;
    name: string;
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    exp: number;
    gold: number;
    image: string;
    dropItem?: string;
    quizCategory?: string; // 出題カテゴリ
}

export interface Company {
    id: string;
    name: string;
    industry: string;
    description: string;
    location: string; // 'matsuyama' | 'imabari' etc.
    logo?: string;
    npcId?: string;
}

export interface ScenarioNode {
    id: string;
    speaker: string;
    text: string;
    choices?: { text: string; nextId: string; action?: () => void }[];
    nextId?: string;
    background?: string;
    onEnd?: string; // アクション発火用
}

export interface MapData {
    id: string;
    name: string;
    width: number;
    height: number;
    baseImage?: string; // 背景画像URL
    collisions: { x: number; y: number }[]; // 通行不可タイル
    portals: { x: number; y: number; targetMapId: string; targetX: number; targetY: number }[];
    entities: MapEntity[];
    encounters?: boolean; // ランダムエンカウント有無
}

export interface MapEntity {
    id: string;
    name: string;
    x: number;
    y: number;
    type: 'npc' | 'portal' | 'item' | 'company' | 'enemy';
    sprite?: string;
    scenarioId?: string;
    companyId?: string;
}
