"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRPGStore } from '@/rpg/store/rpgStore';
import { MAPS } from '@/rpg/data/maps';
import { ENEMIES } from '@/rpg/data/enemies';

const TILE_SIZE = 32;

export default function MapEngine() {
    const {
        playerPosition, movePlayer, setMode, currentMapId, setCurrentMap,
        startBattle, updatePlayerStats,
        debugNoEncounter, toggleDebugNoEncounter
    } = useRPGStore();
    const mapData = MAPS[currentMapId];
    const containerRef = useRef<HTMLDivElement>(null);

    // エフェクト用ステート
    const [effect, setEffect] = useState<string | null>(null);
    // 歩数カウント（アニメーション用）
    const [stepCount, setStepCount] = useState(0);

    // 画面サイズ（仮）
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

    // キー入力制御
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!mapData || effect) return; // エフェクト中は操作無効

            const { x, y } = playerPosition;
            let nextX = x;
            let nextY = y;
            let nextDir = playerPosition.dir;

            if (e.key === 'ArrowUp') { nextY--; nextDir = 'up'; }
            if (e.key === 'ArrowDown') { nextY++; nextDir = 'down'; }
            if (e.key === 'ArrowLeft') { nextX--; nextDir = 'left'; }
            if (e.key === 'ArrowRight') { nextX++; nextDir = 'right'; }

            if (nextX === x && nextY === y) {
                // 移動以外のキー
                if (e.key === 'Enter') {
                    // 目の前のエンティティをチェック
                    const targetX = nextDir === 'up' ? x : nextDir === 'down' ? x : nextDir === 'left' ? x - 1 : x + 1;
                    const targetY = nextDir === 'up' ? y - 1 : nextDir === 'down' ? y + 1 : nextDir === 'left' ? y : y;

                    const entity = mapData.entities.find(e => e.x === targetX && e.y === targetY);
                    if (entity) {
                        if (entity.id === 'dogo_onsen') {
                            updatePlayerStats({ hp: 100, mp: 50 }); // 全回復
                            setEffect('heal');
                            setTimeout(() => setEffect(null), 1000);
                            return;
                        }
                        if (entity.type === 'npc' || entity.type === 'company') {
                            if (!entity.scenarioId) return; // シナリオがない場合は何もしない
                            setMode('novel');
                        }
                    }
                }
                if (e.key === 'm') setMode('menu');
                return;
            }

            // 境界チェック
            if (nextX < 0 || nextX >= mapData.width || nextY < 0 || nextY >= mapData.height) {
                movePlayer(x, y, nextDir);
                return;
            }

            // ポータルチェック (優先) - 衝突していてもポータルなら移動する
            const portal = mapData.portals.find(p => p.x === nextX && p.y === nextY);
            if (portal) {
                setCurrentMap(portal.targetMapId, portal.targetX, portal.targetY);
                return;
            }

            // 衝突判定
            const entity = mapData.entities.find(e => e.x === nextX && e.y === nextY);
            if (entity && (entity.type === 'npc' || entity.type === 'company' || entity.type === 'item')) {
                movePlayer(x, y, nextDir);
                return;
            }

            // 移動実行
            movePlayer(nextX, nextY, nextDir);
            setStepCount(prev => prev + 1);

            // ランダムエンカウント
            if (!debugNoEncounter && mapData.encounters && Math.random() < 0.15) {
                setEffect('encounter');
                setTimeout(() => {
                    const enemyIds = Object.keys(ENEMIES);
                    const randomEnemy = enemyIds[Math.floor(Math.random() * enemyIds.length)];
                    startBattle(randomEnemy);
                    setEffect(null);
                }, 800);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [playerPosition, movePlayer, setMode, mapData, setCurrentMap, startBattle, debugNoEncounter, effect, updatePlayerStats]);


    if (!mapData) return <div>Loading Map...</div>;

    // カメラ座標計算 (マップ端では固定)
    // 画面中央にプレイヤーが来るようにするが、マップ端を超えないようにclampする
    const mapPixelWidth = mapData.width * TILE_SIZE;
    const mapPixelHeight = mapData.height * TILE_SIZE;

    // 理想のカメラ中心位置
    let camX = playerPosition.x * TILE_SIZE + TILE_SIZE / 2 - viewportWidth / 2;
    let camY = playerPosition.y * TILE_SIZE + TILE_SIZE / 2 - viewportHeight / 2;

    // 端の処理 (マップが画面より小さい場合は中央寄せ、大きい場合は端で止める)
    if (mapPixelWidth < viewportWidth) {
        camX = -(viewportWidth - mapPixelWidth) / 2;
    } else {
        camX = Math.max(0, Math.min(camX, mapPixelWidth - viewportWidth));
    }

    if (mapPixelHeight < viewportHeight) {
        camY = -(viewportHeight - mapPixelHeight) / 2;
    } else {
        camY = Math.max(0, Math.min(camY, mapPixelHeight - viewportHeight));
    }

    // プレイヤー画像決定 (歩行アニメーション - ユーザー要望により無効化)
    // const animFrame = stepCount % 4; // 0:stand, 1:walk1, 2:stand, 3:walk2
    const dirSuffix = playerPosition.dir === 'up' ? '_back' :
        playerPosition.dir === 'left' ? '_left' :
            playerPosition.dir === 'right' ? '_right' : '';

    let heroSprite = `hero_stand${dirSuffix}.png`;
    // if (animFrame === 1) heroSprite = `hero_walk1${dirSuffix}.png`;
    // if (animFrame === 3) heroSprite = `hero_walk2${dirSuffix}.png`;

    return (
        <div className="w-full h-full bg-black relative overflow-hidden">
            {/* エフェクトオーバーレイ */}
            {effect === 'encounter' && <div className="absolute inset-0 z-50 bg-white animate-pulse mix-blend-difference" />}
            {effect === 'heal' && <div className="absolute inset-0 z-50 bg-green-500/30 animate-pulse flex items-center justify-center text-white font-bold text-4xl shadow-[inset_0_0_100px_rgba(0,255,0,0.5)]">全回復！</div>}

            {/* マップコンテナ */}
            <div
                ref={containerRef}
                className="absolute top-0 left-0 transition-transform duration-200 ease-out origin-top-left"
                style={{
                    width: mapPixelWidth,
                    height: mapPixelHeight,
                    transform: `translate(${-camX}px, ${-camY}px)`
                }}
            >
                {/* 背景画像 */}
                {mapData.baseImage ? (
                    <img
                        src={mapData.baseImage}
                        alt="Map"
                        className="absolute top-0 left-0 w-full h-full object-cover pixelated"
                        style={{ imageRendering: 'pixelated' }}
                    />
                ) : (
                    <div className="w-full h-full bg-emerald-800" />
                )}

                {/* エンティティ描画 (サイズ自動調整・下揃え) */}
                {mapData.entities.map(entity => (
                    <div
                        key={entity.id}
                        className="absolute w-8 h-8 z-10 pointer-events-none"
                        style={{
                            left: entity.x * TILE_SIZE,
                            top: entity.y * TILE_SIZE
                        }}
                    >
                        {entity.sprite ? (
                            <img
                                src={entity.sprite}
                                alt={entity.name}
                                className="absolute bottom-0 left-1/2 -translate-x-1/2 min-w-full h-auto object-contain pixelated"
                                style={{ maxHeight: '64px' }} // 大きすぎないように制限
                            />
                        ) : (
                            <div className="w-full h-full bg-yellow-400 rounded-full border-2 border-white opacity-80" />
                        )}
                    </div>
                ))}

                {/* プレイヤーキャラ (下揃え・クリップなし) */}
                <div
                    className="absolute w-8 h-8 z-20 transition-all duration-100 pointer-events-none"
                    style={{
                        left: playerPosition.x * TILE_SIZE,
                        top: playerPosition.y * TILE_SIZE,
                    }}
                >
                    <img
                        src={`/rpg/${heroSprite}`}
                        alt="Hero"
                        // 下端を合わせる、サイズはタイル(32px)に合わせる
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[32px] max-w-none h-auto object-contain pixelated"
                        style={{ marginBottom: '0px' }} // 微調整
                    />
                </div>
            </div>

            {/* UI オーバーレイ */}
            <div className="absolute top-4 left-4 bg-black/60 text-white px-4 py-2 rounded-lg border border-white/20 backdrop-blur-md z-30">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    📍 {mapData.name}
                </h2>
                <div className="text-xs text-zinc-300 mt-1">
                    X: {playerPosition.x}, Y: {playerPosition.y}
                </div>
            </div>

            {/* デバッグ操作パネル */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-30">
                <button
                    onClick={toggleDebugNoEncounter}
                    className={`px-3 py-1 rounded text-xs font-bold border ${debugNoEncounter ? 'bg-red-900 border-red-500 text-white' : 'bg-black/50 border-zinc-500 text-zinc-400'}`}
                >
                    {debugNoEncounter ? '🚫 No Encounter' : '✅ Encounter ON'}
                </button>
                <button
                    onClick={() => {
                        updatePlayerStats({ hp: 100, mp: 50 });
                        setEffect('heal');
                        setTimeout(() => setEffect(null), 1000);
                    }}
                    className="px-3 py-1 bg-green-900/80 border border-green-500 rounded text-xs font-bold text-white hover:bg-green-800"
                >
                    ❤️ Full Heal
                </button>
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 text-white p-4 rounded-xl backdrop-blur-md text-center z-30">
                <p className="text-xs font-bold">矢印キー: 移動 / Enter: 調べる / M: メニュー</p>
            </div>
        </div>
    );
}
