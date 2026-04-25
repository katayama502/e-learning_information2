"use client";

import React, { useState, useEffect } from 'react';
import { useRPGStore } from '@/rpg/store/rpgStore';
import { ENEMIES } from '@/rpg/data/enemies';
import { Sword, Shield, Zap, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

type BattlePhase =
    | 'player_choice'       // コマンド選択
    | 'player_quiz'         // 攻撃クイズ中
    | 'player_action'       // 攻撃アニメーション/メッセージ
    | 'enemy_turn_start'    // 敵のターン開始 (溜め)
    | 'defense_quiz'        // 防御クイズ中
    | 'enemy_action'        // 敵の攻撃実行
    | 'win'
    | 'lose';

export default function BattleEngine() {
    const { player, battleState, updatePlayerStats, endBattle, addInventoryItem } = useRPGStore();

    const [enemyHp, setEnemyHp] = useState(0);
    const [message, setMessage] = useState("");
    const [quiz, setQuiz] = useState<any>(null);
    const [phase, setPhase] = useState<BattlePhase>('player_choice');

    // アクションの種類（攻撃クイズ用か防御クイズ用かを区別するためなど）
    const [selectedAction, setSelectedAction] = useState<'attack' | 'defend' | 'item' | null>(null);

    const enemy = battleState ? ENEMIES[battleState.enemyId] : null;

    useEffect(() => {
        if (!enemy) return;
        setEnemyHp(enemy.hp);
        setMessage(`野生の「${enemy.name}」が現れた！`);
    }, [enemy]);

    // クイズ生成 (攻撃用、防御用でカテゴリ分けも可能だが一旦共通またはランダム)
    const generateQuiz = (type: 'attack' | 'defend') => {
        // 将来的には type によって問題を出し分ける
        const questions = [
            { q: "愛媛県の県庁所在地は？", a: "松山市", c: ["松山市", "今治市", "新居浜市", "西条市"] },
            { q: "面接で入室する時のノック回数は？", a: "3回", c: ["2回", "3回", "4回", "ノックしない"] },
            { q: "DXは何の略？", a: "Digital Transformation", c: ["Digital Transformation", "Deluxe Xylophone", "Daily Exercise", "Digital X-ray"] },
            { q: "御社の強みは何ですか？と聞かれたら？", a: "企業研究に基づき答える", c: ["知らないと答える", "逆に質問する", "企業研究に基づき答える", "給料を聞く"] },
            { q: "チーム開発で重要なツールは？", a: "Git", c: ["Git", "Excel", "PowerPoint", "メモ帳"] },
            { q: "報連相の「相」は？", a: "相談", c: ["相談", "相撲", "相対", "相続"] }
        ];

        // 防御時は少し簡単な問題にする...などの調整もここで可能
        const q = questions[Math.floor(Math.random() * questions.length)];
        setQuiz({ question: q.q, answer: q.a, choices: q.c });
    };

    // プレイヤーのアクション選択
    const selectAction = (type: 'attack' | 'learn') => {
        if (phase !== 'player_choice') return;

        if (type === 'attack') {
            setSelectedAction('attack');
            setPhase('player_quiz');
            generateQuiz('attack');
            setMessage("攻撃チャンス！クイズに正解してダメージを与えろ！");
        } else if (type === 'learn') {
            // 回復系は即時発動（または回復クイズにするか？一旦即時）
            setPhase('player_action');
            handleLearn();
        }
    };

    // クイズ回答処理
    const handleAnswer = (choice: string) => {
        const isCorrect = choice === quiz.answer;

        if (phase === 'player_quiz') {
            // 攻撃フェーズ
            setPhase('player_action');
            if (isCorrect) {
                const damage = player.attack * 2; // クイズ正解ボーパス
                setEnemyHp(prev => Math.max(0, prev - damage));
                setMessage(`正解！ ${damage}のダメージを与えた！`);

                // 勝利判定チェック（state更新は非同期なので計算値で）
                if (enemyHp - damage <= 0) {
                    setTimeout(winBattle, 1000);
                    return;
                }
            } else {
                const damage = Math.floor(player.attack / 2); // 失敗でも少しは通る
                setEnemyHp(prev => Math.max(0, prev - damage));
                setMessage(`不正解... 攻撃が浅い！ ${damage}のダメージ。`);

                if (enemyHp - damage <= 0) {
                    setTimeout(winBattle, 1000);
                    return;
                }
            }
            // 敵のターンへ
            setTimeout(startEnemyTurn, 1500);

        } else if (phase === 'defense_quiz') {
            // 防御フェーズ
            setPhase('enemy_action'); // すぐにダメージ処理へ
            resolveEnemyAttack(isCorrect);
        }
    };

    const handleLearn = () => {
        const recovery = 20;
        updatePlayerStats({ mp: Math.min(player.maxMp, player.mp + recovery) });
        setMessage(`e-ラーニングで復習した！ MPが${recovery}回復！`);
        // 敵のターンへ
        setTimeout(startEnemyTurn, 1500);
    };

    // 敵のターン開始（防御クイズへの誘導）
    const startEnemyTurn = () => {
        if (!enemy) return;
        setPhase('enemy_turn_start');
        setMessage(`${enemy.name} が攻撃の構えをとった！`);

        setTimeout(() => {
            setPhase('defense_quiz');
            setSelectedAction('defend'); // UI表示用
            generateQuiz('defend');
            setMessage("防御チャンス！ クイズに正解して身を守れ！");
        }, 1500);
    };

    // 敵の攻撃処理実行
    const resolveEnemyAttack = (isPerfectGuard: boolean) => {
        if (!enemy) return;

        let damage = enemy.attack;

        if (isPerfectGuard) {
            damage = Math.floor(damage / 5); // 大幅軽減
            setMessage("正解！ 攻撃を見切った！");
        } else {
            // 不正解＝直撃
            damage = Math.max(1, damage - Math.floor(player.defense / 4)); // 素の防御力による軽減のみ
            setMessage("不正解...！ 攻撃をまともに食らった！");
        }

        // ダメージ適用
        // メッセージ表示後にHP減らす演出のため少し遅らせる？いや、即時反映でOK
        setTimeout(() => {
            updatePlayerStats({ hp: Math.max(0, player.hp - damage) });
            setMessage(prev => `${prev} ${damage}のダメージを受けた！`);

            if (player.hp - damage <= 0) {
                setTimeout(loseBattle, 1500);
            } else {
                setTimeout(() => {
                    setPhase('player_choice');
                    setSelectedAction(null);
                    setMessage("コマンドを選択してください");
                }, 2000);
            }
        }, 800);
    };

    const winBattle = () => {
        if (!enemy) return;
        setPhase('win');
        setMessage(`${enemy.name}を倒した！`);

        updatePlayerStats({
            exp: (player.exp || 0) + enemy.exp
        });

        if (enemy.dropItem && Math.random() < 0.5) {
            addInventoryItem(enemy.dropItem);
            toast.success(`${enemy.dropItem}を手に入れた！`);
        }

        setTimeout(() => endBattle(true), 1500);
    };

    const loseBattle = () => {
        setPhase('lose');
        setMessage("目の前が真っ暗になった...");
        setTimeout(() => endBattle(false), 1500);
    };

    if (!enemy) return <div className="text-white">Loading Battle...</div>;

    return (
        <div className="w-full h-full bg-slate-950 flex flex-col p-6 items-center justify-center relative overflow-hidden">
            {/* Battle Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-black z-0" />
            <div className="absolute inset-0 opacity-20 z-0 bg-[url('/rpg/world.png')] bg-cover blur-sm" />

            <div className="flex-1 w-full max-w-2xl flex items-center justify-around relative z-10">
                {/* プレイヤー */}
                <div className="flex flex-col items-center gap-4">
                    <div className={`w-32 h-32 bg-blue-900/80 border-4 border-blue-400 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all ${player.hp < player.maxHp * 0.3 ? 'animate-pulse border-red-500' : ''} ${phase === 'player_action' ? 'translate-x-10' : ''} ${phase === 'defense_quiz' ? 'scale-90 border-yellow-400' : ''}`}>
                        <img src="/rpg/hero_battle.png" className="w-full h-full object-contain scale-150" />
                    </div>
                    <div className="w-40">
                        <div className="flex justify-between text-white text-xs font-bold mb-1">
                            <span>{player.name} (Lv.{player.level})</span>
                            <span>{player.hp}/{player.maxHp}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                            <div className="bg-green-500 h-full transition-all" style={{ width: `${(player.hp / player.maxHp) * 100}%` }} />
                        </div>
                    </div>
                </div>

                {/* VS / Status Info */}
                <div className="flex flex-col items-center justify-center">
                    {phase === 'defense_quiz' && <div className="text-red-500 font-black text-2xl animate-pulse whitespace-nowrap mb-4">CAUTION!!</div>}
                    <div className="text-white/20 font-black text-6xl italic">VS</div>
                </div>

                {/* 敵 */}
                <div className="flex flex-col items-center gap-4">
                    <div className={`w-48 h-48 flex items-center justify-center ${phase === 'enemy_action' ? '-translate-x-10' : 'animate-bounce-slow'}`}>
                        <img src={enemy.image} className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] pixelated" />
                    </div>
                    <div className="w-40">
                        <div className="text-center text-white text-xs font-bold mb-1 uppercase tracking-widest">{enemy.name}</div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                            <div className="bg-red-500 h-full transition-all" style={{ width: `${(enemyHp / enemy.maxHp) * 100}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* コマンド/クイズエリア */}
            <div className={`w-full max-w-3xl bg-slate-900/95 border-t-4 p-6 rounded-t-3xl shadow-2xl z-20 transition-colors ${phase === 'defense_quiz' ? 'border-yellow-500/50 shadow-yellow-900/20' : 'border-slate-700'}`}>
                <p className="text-blue-300 font-bold mb-4 h-6 text-center animate-pulse">{message}</p>

                {/* 1. コマンド選択フェーズ */}
                {phase === 'player_choice' && (
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => selectAction('attack')}
                            className="bg-red-900/50 hover:bg-red-800 border-2 border-red-500 p-4 rounded-xl flex items-center justify-center gap-4 transition-all hover:scale-105 group"
                        >
                            <div className="p-3 bg-red-500 rounded-full group-hover:bg-red-400 transition-colors">
                                <Sword className="text-white w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <span className="text-white font-bold text-xl block">攻撃</span>
                                <span className="text-red-300 text-xs">Attack Quiz</span>
                            </div>
                        </button>
                        {/* 防御ボタンは削除（敵ターンで自動発生するため）。代わりにスキルやアイテムを配置可能 */}
                        <button
                            onClick={() => selectAction('learn')}
                            className="bg-yellow-900/50 hover:bg-yellow-800 border-2 border-yellow-500 p-4 rounded-xl flex items-center justify-center gap-4 transition-all hover:scale-105 group"
                        >
                            <div className="p-3 bg-yellow-500 rounded-full group-hover:bg-yellow-400 transition-colors">
                                <BookOpen className="text-white w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <span className="text-white font-bold text-xl block">学習</span>
                                <span className="text-yellow-300 text-xs">MP Recovery</span>
                            </div>
                        </button>
                    </div>
                )}

                {/* 2. クイズフェーズ (攻撃 or 防御) */}
                {(phase === 'player_quiz' || phase === 'defense_quiz') && quiz && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className={`flex items-center gap-3 mb-2 p-3 rounded-lg border ${phase === 'defense_quiz' ? 'bg-yellow-900/30 border-yellow-500' : 'bg-slate-800 border-slate-600'}`}>
                            <span className={`text-white text-xs px-2 py-1 rounded font-bold uppercase tracking-wider ${phase === 'defense_quiz' ? 'bg-yellow-600' : 'bg-red-500'}`}>
                                {phase === 'defense_quiz' ? 'DEFEND QUIZ' : 'ATTACK QUIZ'}
                            </span>
                            <p className="text-white font-bold text-lg flex-1">{quiz.question}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {quiz.choices.map((c: string) => (
                                <button
                                    key={c}
                                    onClick={() => handleAnswer(c)}
                                    className="bg-slate-700 hover:bg-slate-600 hover:border-white border border-slate-500 p-4 rounded-xl text-white font-bold text-md transition-all text-left relative overflow-hidden active:scale-95"
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. 待機/実行中フェーズ (ローディング表示) */}
                {(phase === 'player_action' || phase === 'enemy_turn_start' || phase === 'enemy_action') && (
                    <div className="text-center py-8 text-zinc-400 animate-pulse flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                )}
            </div>
        </div>
    );
}

