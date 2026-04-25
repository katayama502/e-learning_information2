import { MapData } from "../types";

export const MAPS: Record<string, MapData> = {
    'town_start': {
        id: 'town_start',
        name: 'はじまりの町',
        width: 20, // 640px / 32px = 20
        height: 20,
        baseImage: '/rpg/town.png',
        collisions: [], // To be implemented: define non-walkable areas based on image
        portals: [
            // 町の出口（下） -> ワールドマップ
            { x: 9, y: 19, targetMapId: 'world_ehime', targetX: 22, targetY: 17 },
            { x: 10, y: 19, targetMapId: 'world_ehime', targetX: 22, targetY: 17 }
        ],
        encounters: false,
        entities: [
            {
                id: 'npc_guide',
                name: '案内人',
                x: 10,
                y: 15, // 入口付近に移動
                type: 'npc',
                sprite: '/rpg/npc_pharmacist.png',
                scenarioId: 'intro_guide'
            },
            {
                id: 'company_lady',
                name: 'レデイ薬局',
                x: 4,
                y: 8, // 左側の建物付近
                type: 'company',
                companyId: 'lady_drug',
                sprite: '/rpg/npc_pharmacist.png'
            },
            {
                id: 'company_lf',
                name: 'トヨタL&F',
                x: 16,
                y: 8, // 右側の建物付近
                type: 'company',
                companyId: 'toyota_lf',
                sprite: '/rpg/npc_mechanic.png'
            }
        ]
    },
    'city_matsuyama': {
        id: 'city_matsuyama',
        name: '松山市',
        width: 20,
        height: 20,
        baseImage: '/rpg/matsuyama_city.png', // この後上書きします
        collisions: [],
        encounters: false,
        portals: [
            // 下端の道路 -> ワールドマップ
            { x: 9, y: 19, targetMapId: 'world_ehime', targetX: 18, targetY: 15 },
            { x: 10, y: 19, targetMapId: 'world_ehime', targetX: 18, targetY: 15 },
            { x: 11, y: 19, targetMapId: 'world_ehime', targetX: 18, targetY: 15 }
        ],
        entities: [
            {
                id: 'dogo_onsen',
                name: '道後温泉',
                x: 10, // 画像中央上付近（仮）
                y: 4,
                type: 'company',
                sprite: '',
                scenarioId: 'dogo_onsen_heal'
            },
            {
                id: 'restaurant_taimeshi',
                name: '鯛めし屋',
                x: 16, // 右側（仮）
                y: 10,
                type: 'company',
                sprite: '',
                scenarioId: 'restaurant_buff'
            }
        ]
    },
    'world_ehime': {
        id: 'world_ehime',
        name: '愛媛フィールド',
        width: 50,
        height: 29,
        baseImage: '/rpg/world.png',
        collisions: [],
        encounters: true,
        portals: [
            // 松山市（松山城） - マップ上の城の入口へ配置
            { x: 18, y: 14, targetMapId: 'city_matsuyama', targetX: 10, targetY: 18 },
            // はじまりの町 (城の東側へ移動)
            { x: 22, y: 16, targetMapId: 'town_start', targetX: 10, targetY: 18 }
        ],
        entities: [
            // 松山城
            {
                id: 'matsuyama_castle',
                name: '松山城',
                x: 18,
                y: 14,
                type: 'npc', // 衝突あり
                sprite: '', // マップ画像に含まれるため透明
                scenarioId: ''
            },
            // はじまりの町シンボル
            {
                id: 'town_start_symbol',
                name: 'はじまりの町',
                x: 22,
                y: 16,
                type: 'npc',
                sprite: '/rpg/town_icon.png',
                scenarioId: ''
            }
        ]
    }
};
