import { Company } from "../types";

export const COMPANIES: Record<string, Company> = {
    'toyota_lf': {
        id: 'toyota_lf',
        name: 'トヨタL&F西四国',
        industry: '物流・機械',
        description: '物流のプロフェッショナル。フォークリフトや物流システムで愛媛の産業を支える。',
        location: 'matsuyama',
        npcId: 'npc_mechanic'
    },
    'daiki_axis': {
        id: 'daiki_axis',
        name: 'ダイキアクシス',
        industry: '環境・住設',
        description: '「環境を守る」をテーマに、水処理事業などをグローバルに展開する企業。',
        location: 'matsuyama',
        npcId: 'npc_manager'
    },
    'ehime_mente': {
        id: 'ehime_mente',
        name: '愛媛メンテナンス',
        industry: '設備・保守',
        description: 'エレベーター保守点検のスペシャリスト。安全と安心を守る技術集団。',
        location: 'matsuyama',
        npcId: 'npc_tech'
    },
    'fudo': {
        id: 'fudo',
        name: '風土',
        industry: '飲食・サービス',
        description: '愛媛の食文化を大切にし、地域に根ざしたサービスを提供する。',
        location: 'matsuyama',
        npcId: 'npc_chef'
    },
    'kaneshiro': {
        id: 'kaneshiro',
        name: 'カネシロ',
        industry: 'リサイクル・環境',
        description: '古紙リサイクルを通じて循環型社会の実現に貢献する企業。',
        location: 'shikokuchuo',
        npcId: 'npc_recycler'
    },
    'lady_drug': {
        id: 'lady_drug',
        name: 'レデイ薬局',
        industry: 'ドラッグストア・調剤',
        description: '地域の健康を支える「かかりつけ薬局」。中四国を中心に展開。',
        location: 'matsuyama',
        npcId: 'npc_pharmacist'
    }
};
