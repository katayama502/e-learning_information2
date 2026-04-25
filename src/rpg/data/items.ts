import { Item } from "../types";
import { Book, Zap, Shirt, Briefcase } from 'lucide-react';

export const ITEMS: Record<string, Item> = {
    // 武器・装備
    'recruit_suit': {
        id: 'recruit_suit',
        name: 'リクルートスーツ',
        description: '就活生の基本装備。少しだけ身が引き締まる。',
        type: 'armor',
        stats: { defense: 5, hp: 10 },
        price: 3000
    },
    'antigravity_staff': {
        id: 'antigravity_staff',
        name: 'Antigravityの杖',
        description: '重力に逆らう力を秘めた杖。常識に囚われない発想力が湧いてくる。',
        type: 'weapon',
        stats: { attack: 20, mp: 30 },
        price: 50000
    },
    'dx_bible': {
        id: 'dx_bible',
        name: 'DX推進バイブル',
        description: 'デジタルトランスフォーメーションの奥義が記された書物。知力が大幅に上がる。',
        type: 'accessory',
        stats: { mp: 50 },
        price: 15000
    },

    // 消費アイテム
    'energy_drink': {
        id: 'energy_drink',
        name: 'エナジードリンク',
        description: '疲れた体に染み渡る。HPを50回復する。',
        type: 'consumable',
        effect: (char) => ({ hp: Math.min(char.maxHp, char.hp + 50) }),
        price: 200
    },

    // 大事なもの
    'company_map': {
        id: 'company_map',
        name: '企業攻略マップ',
        description: '愛媛県内の有力企業の位置が記された地図。',
        type: 'key-item',
        price: 0
    }
};
