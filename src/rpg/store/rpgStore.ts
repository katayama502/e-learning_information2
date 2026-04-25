import { create } from 'zustand';
import { GameMode, Character, Item } from '../types';
import { ITEMS } from '../data/items';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

interface RPGState {
    // 状態
    mode: GameMode;
    player: Character;
    party: Character[];
    inventory: Item[];
    currentMapId: string;
    playerPosition: { x: number; y: number; dir: 'up' | 'down' | 'left' | 'right' };

    // 戦闘状態
    battleState?: {
        enemyId: string;
        turn: number;
        log: string[];
    };

    // フラグ管理
    flags: Record<string, boolean>;

    // アクション
    setMode: (mode: GameMode) => void;
    movePlayer: (x: number, y: number, dir: 'up' | 'down' | 'left' | 'right') => void;
    updatePlayerStats: (updates: Partial<Character>) => void;
    addInventoryItem: (itemId: string) => void;
    equipItem: (slot: 'weapon' | 'armor' | 'accessory', itemId: string) => void;
    setCurrentMap: (mapId: string, startX?: number, startY?: number) => void;
    setFlag: (key: string, value: boolean) => void;
    startBattle: (enemyId: string) => void;
    endBattle: (win: boolean) => void;

    // データ永続化
    loadProgress: (userId: string) => Promise<void>;
    saveProgress: (userId: string) => Promise<void>;

    // Debug
    debugNoEncounter: boolean;
    toggleDebugNoEncounter: () => void;
}

export const useRPGStore = create<RPGState>((set, get) => ({
    mode: 'map',
    player: {
        id: 'hero',
        name: '新人就活生',
        level: 1,
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        attack: 10,
        defense: 10,
        exp: 0,
        nextExp: 100,
        skills: [],
        equipment: {
            weapon: undefined,
            armor: 'recruit_suit',
            accessory: undefined
        },
        avatar: '/rpg/hero_stand.png'
    },
    party: [],
    inventory: [
        { ...ITEMS['recruit_suit'] },
        { ...ITEMS['energy_drink'] }
    ],
    currentMapId: 'town_start',
    playerPosition: { x: 10, y: 10, dir: 'down' },
    flags: {},

    setMode: (mode) => set({ mode }),

    movePlayer: (x, y, dir) => set((state) => ({
        playerPosition: { x, y, dir }
    })),

    updatePlayerStats: (updates) => set((state) => ({
        player: { ...state.player, ...updates }
    })),

    addInventoryItem: (itemId) => {
        const item = ITEMS[itemId];
        if (item) {
            set((state) => ({
                inventory: [...state.inventory, item]
            }));
        }
    },

    equipItem: (slot, itemId) => set((state) => ({
        player: {
            ...state.player,
            equipment: { ...state.player.equipment, [slot]: itemId }
        }
    })),

    setCurrentMap: (mapId, startX, startY) => set((state) => ({
        currentMapId: mapId,
        playerPosition: {
            x: startX ?? state.playerPosition.x,
            y: startY ?? state.playerPosition.y,
            dir: 'down'
        }
    })),

    setFlag: (key, value) => set((state) => ({
        flags: { ...state.flags, [key]: value }
    })),

    startBattle: (enemyId) => set({
        mode: 'battle',
        battleState: {
            enemyId,
            turn: 1,
            log: ['戦闘開始！']
        }
    }),

    endBattle: (win) => set((state) => {
        // 戦闘終了時、HPは回復させない (state.player.hp はそのまま)
        return {
            mode: 'map',
            battleState: undefined
        };
    }),

    loadProgress: async (userId) => {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('rpg_progress')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error("Failed to load progress:", error);
                return;
            }

            if (data) {
                set((state) => ({
                    player: {
                        ...state.player,
                        level: data.level,
                        exp: data.exp,
                        hp: data.hp,
                        maxHp: data.max_hp,
                        mp: data.mp,
                        maxMp: data.max_mp,
                        equipment: data.equipment as any
                    },
                    currentMapId: data.current_map_id,
                    playerPosition: {
                        x: data.position_x,
                        y: data.position_y,
                        dir: state.playerPosition.dir
                    },
                    inventory: data.inventory as any,
                    flags: data.flags as any
                }));
                console.log("Progress loaded!");
            }
        } catch (e) {
            console.error(e);
        }
    },

    saveProgress: async (userId) => {
        const state = get();
        try {
            const supabase = createClient();
            const saveData = {
                user_id: userId,
                level: state.player.level,
                exp: state.player.exp,
                hp: state.player.hp,
                max_hp: state.player.maxHp,
                mp: state.player.mp,
                max_mp: state.player.maxMp,
                current_map_id: state.currentMapId,
                position_x: state.playerPosition.x,
                position_y: state.playerPosition.y,
                inventory: state.inventory,
                equipment: state.player.equipment,
                flags: state.flags,
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('rpg_progress')
                .upsert(saveData);

            if (error) throw error;
            console.log("Progress saved!");
            toast.success("セーブしました！");
        } catch (e) {
            console.error("Failed to save:", e);
            toast.error("セーブに失敗しました");
        }
    },

    // Debug
    debugNoEncounter: true, // デフォルトでエンカウント無効
    toggleDebugNoEncounter: () => set((state) => ({ debugNoEncounter: !state.debugNoEncounter })),
}));
