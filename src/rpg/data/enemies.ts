import { Enemy } from "../types";

export const ENEMIES: Record<string, Enemy> = {
    'resume_slime': {
        id: 'resume_slime',
        name: 'レジュメスライム',
        hp: 30,
        maxHp: 30,
        attack: 5,
        defense: 2,
        exp: 10,
        gold: 50,
        image: '/rpg/monster_resume.png',
        dropItem: 'energy_drink',
        quizCategory: 'general'
    },
    'interview_demon': {
        id: 'interview_demon',
        name: '圧迫面接官',
        hp: 80,
        maxHp: 80,
        attack: 15,
        defense: 10,
        exp: 50,
        gold: 200,
        image: '/rpg/monster_resume.png', // 仮画像
        dropItem: 'dx_bible',
        quizCategory: 'business_manners'
    },
    'black_company_cloud': {
        id: 'black_company_cloud',
        name: 'ブラック企業の陰',
        hp: 50,
        maxHp: 50,
        attack: 10,
        defense: 5,
        exp: 25,
        gold: 100,
        image: '/rpg/monster_resume.png', // 仮画像
        quizCategory: 'labor_law'
    }
};
