import React, { useEffect, useMemo, useRef } from 'react';
import type { EnemyData, SegmentType, WeaponStats, WeaponType } from '../types/game';

interface GameCanvasProps {
    weapons: WeaponStats[];
    onEnemyKill: (reward: number, exp: number, chestType?: 'UPGRADE_CHEST' | 'WEAPON_CHEST') => void;
    onCoreDamage: (damage: number) => void;
    difficulty: number;
    onVictory: () => void;
    isPaused?: boolean;
    onWaveProgress?: (progress: number) => void;
    fieldDamageTrigger?: number;
}

type RuntimeSegment = {
    id: string;
    type: SegmentType;
    x: number;
    y: number;
    hp: number;
    maxHp: number;
    hitFlash: number;
    burn: number;
    pathDist: number;
};

type RuntimeEnemy = Omit<EnemyData, 'segments'> & {
    segments: RuntimeSegment[];
};

type Projectile = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    damage: number;
    penetration: number;
    hitIds: string[];
    size: number;
    color: string;
    weaponType: WeaponType;
    hasBurn?: boolean;
    hasLightning?: boolean;
    life: number;
};

type Orb = {
    id: string;
    x: number;
    y: number;
    exp: number;
    reward: number;
    vx: number;
    vy: number;
    isMagnetized: boolean;
};

type Vfx =
    | { type: 'lightning'; x1: number; y1: number; x2: number; y2: number; life: number }
    | { type: 'chest_open'; x: number; y: number; life: number }
    | { type: 'nova'; x: number; y: number; radius: number; life: number; color?: string; width?: number; glow?: number }
    | { type: 'hit'; x: number; y: number; life: number; weaponType: WeaponType; color: string }
    | { type: 'trail'; x: number; y: number; life: number; weaponType: WeaponType; color: string; angle: number; size: number };

type RuntimeState = {
    mouseX: number;
    mouseY: number;
    dragStartX: number;
    dragStartY: number;
    isDragging: boolean;
    enemies: RuntimeEnemy[];
    wave: number;
    enemiesSpawnedInWave: number;
    enemiesKilledInWave: number;
    waveSegmentsTotal: number;
    waveSegmentsDestroyed: number;
    nextSpawnAt: number;
    waveWeaponChestSpawned: number;
    waveUpgradeChestSpawned: number;
    firstChestSpawned: boolean;
    weaponTimers: Record<string, number>;
    projectiles: Projectile[];
    orbs: Orb[];
    vfx: Vfx[];
};

const LINK_GAP = 22;

const GameCanvas: React.FC<GameCanvasProps> = ({ weapons, onEnemyKill, onCoreDamage, difficulty, onVictory, isPaused = false, onWaveProgress, fieldDamageTrigger = 0 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const stateRef = useRef<RuntimeState>({
        mouseX: 0,
        mouseY: 0,
        dragStartX: 0,
        dragStartY: 0,
        isDragging: false,
        enemies: [],
        wave: 1,
        enemiesSpawnedInWave: 0,
        enemiesKilledInWave: 0,
        waveSegmentsTotal: 0,
        waveSegmentsDestroyed: 0,
        nextSpawnAt: 0,
        waveWeaponChestSpawned: 0,
        waveUpgradeChestSpawned: 0,
        firstChestSpawned: false,
        weaponTimers: {},
        projectiles: [],
        orbs: [],
        vfx: []
    });

    const weaponsRef = useRef(weapons);
    useEffect(() => {
        weaponsRef.current = weapons;
    }, [weapons]);

    const prevFieldDamageTriggerRef = useRef(fieldDamageTrigger);

    const globalPath = useMemo(() => {
        const w = canvasRef.current?.width || 400;
        const h = canvasRef.current?.height || 600;
        const cellH = h / 8;
        return [
            { x: 0, y: cellH * 0.5 },
            { x: w * 0.9, y: cellH * 0.5 },
            { x: w * 0.9, y: cellH * 1.5 },
            { x: w * 0.1, y: cellH * 1.5 },
            { x: w * 0.1, y: cellH * 2.5 },
            { x: w * 0.9, y: cellH * 2.5 },
            { x: w * 0.9, y: cellH * 3.5 },
            { x: w * 0.1, y: cellH * 3.5 },
            { x: w * 0.1, y: cellH * 4.5 },
            { x: w * 0.9, y: cellH * 4.5 },
            { x: w / 2, y: h / 2 }
        ];
    }, [canvasRef.current?.width, canvasRef.current?.height]);

    const totalPathLength = useMemo(() => {
        let total = 0;
        for (let i = 0; i < globalPath.length - 1; i++) {
            const p1 = globalPath[i];
            const p2 = globalPath[i + 1];
            total += Math.hypot(p2.x - p1.x, p2.y - p1.y);
        }
        return Math.max(total, 1);
    }, [globalPath]);

    const getPointOnPath = (dist: number, path: Array<{ x: number; y: number }>) => {
        if (dist < 0) return { x: path[0].x, y: path[0].y + dist, isEnd: false };

        let currentDist = 0;
        for (let i = 0; i < path.length - 1; i++) {
            const p1 = path[i];
            const p2 = path[i + 1];
            const segLen = Math.hypot(p2.x - p1.x, p2.y - p1.y);
            if (dist <= currentDist + segLen) {
                const r = (dist - currentDist) / segLen;
                return {
                    x: p1.x + (p2.x - p1.x) * r,
                    y: p1.y + (p2.y - p1.y) * r,
                    isEnd: false
                };
            }
            currentDist += segLen;
        }

        return { ...path[path.length - 1], isEnd: true };
    };

    const formatHp = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return Math.ceil(num).toString();
    };

    const isSegmentVisible = (seg: RuntimeSegment, canvas: HTMLCanvasElement) => {
        const margin = 18;
        return seg.x >= -margin && seg.x <= canvas.width + margin && seg.y >= -margin && seg.y <= canvas.height + margin;
    };

    const spawnEnemy = (state: typeof stateRef.current) => {
        const enemiesPerWave = 1;
        if (state.enemies.length > 0) return;
        if (state.enemiesSpawnedInWave >= enemiesPerWave) return;

        const hasSpawnBlock = state.enemies.some(e => e.segments.some(seg => seg.pathDist > -25 && seg.pathDist < 25));
        if (hasSpawnBlock) return;

        const segmentCount = 60 + difficulty * 20;
        const weaponChestTarget = 1;
        const upgradeChestTarget = Math.min(6, 2 + difficulty);
        const totalChests = Math.min(segmentCount - 2, weaponChestTarget + upgradeChestTarget);
        const chestPowerScale = 1 + upgradeChestTarget * 0.05 + weaponChestTarget * 0.03;
        const waveHpScale = (1 + state.wave * 0.06 + difficulty * 0.08) * chestPowerScale;
        const baseHp = (14 + Math.pow(1.18, state.wave) * difficulty * 7) * waveHpScale;
        const segments: RuntimeSegment[] = [];

        const chestIndexMap = new Map<number, SegmentType>();
        if (totalChests > 0) {
            const usableSlots = Math.max(1, segmentCount - 3);
            const used = new Set<number>();
            const firstChestIndex = Math.min(5, segmentCount - 2);
            used.add(firstChestIndex);
            for (let k = 0; k < totalChests; k++) {
                const slot = 2 + Math.floor(((k + 1) * usableSlots) / (totalChests + 1));
                if (!used.has(slot)) used.add(slot);
            }
            const chestIndices = Array.from(used).sort((a, b) => a - b);
            let weaponLeft = weaponChestTarget;
            let upgradeLeft = upgradeChestTarget;
            chestIndices.forEach((idx) => {
                if (weaponLeft > 0) {
                    chestIndexMap.set(idx, 'WEAPON_CHEST');
                    weaponLeft -= 1;
                    return;
                }
                if (upgradeLeft > 0) {
                    chestIndexMap.set(idx, 'UPGRADE_CHEST');
                    upgradeLeft -= 1;
                }
            });
        }

        for (let i = 0; i < segmentCount; i++) {
            let type: SegmentType = i === 0 ? 'HEAD' : 'BODY';
            const tailScale = i === 0 ? 2.1 : 1 + (i / Math.max(1, segmentCount - 1)) * 0.9;
            let hp = baseHp * tailScale;

            const forcedType = chestIndexMap.get(i);
            if (forcedType) {
                type = forcedType;
                const chestHpMul = state.firstChestSpawned ? 2.4 + state.wave * 0.12 : 1.3;
                hp = baseHp * chestHpMul * tailScale;
                state.firstChestSpawned = true;
            }

            if (type === 'WEAPON_CHEST') state.waveWeaponChestSpawned += 1;
            if (type === 'UPGRADE_CHEST') state.waveUpgradeChestSpawned += 1;

            segments.push({
                id: Math.random().toString(),
                type,
                x: 0,
                y: 0,
                hp,
                maxHp: hp,
                hitFlash: 0,
                burn: 0,
                pathDist: -(i * 22)
            });
        }

        state.enemies.push({
            id: Math.random().toString(),
            type: 'CENTIPEDE',
            segments,
            speed: 0.42 + state.wave * 0.032 + difficulty * 0.03,
            reward: 30 * difficulty,
            exp: 66
        });
        state.enemiesSpawnedInWave += 1;
        state.waveSegmentsTotal = Math.max(0, segmentCount - 1);
        state.waveSegmentsDestroyed = 0;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const state = stateRef.current;
        let animationId = 0;

        const resize = () => {
            const parent = canvas.parentElement;
            if (!parent) return;
            canvas.width = parent.clientWidth || 400;
            canvas.height = parent.clientHeight || 600;

            if (!state.mouseX && !state.mouseY) {
                state.mouseX = canvas.width / 2;
                state.mouseY = canvas.height / 2 - 120;
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!state.isDragging) return;
            const rect = canvas.getBoundingClientRect();
            state.mouseX = e.clientX - rect.left;
            state.mouseY = e.clientY - rect.top;
        };

        const handleMouseDown = (e: MouseEvent) => {
            state.isDragging = true;
            const rect = canvas.getBoundingClientRect();
            state.mouseX = e.clientX - rect.left;
            state.mouseY = e.clientY - rect.top;
            state.dragStartX = state.mouseX;
            state.dragStartY = state.mouseY;
        };

        const handleMouseUp = () => {
            state.isDragging = false;
        };

        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 0) return;
            e.preventDefault();
            const t = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            state.mouseX = t.clientX - rect.left;
            state.mouseY = t.clientY - rect.top;
            state.dragStartX = state.mouseX;
            state.dragStartY = state.mouseY;
            state.isDragging = true;
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!state.isDragging || e.touches.length === 0) return;
            e.preventDefault();
            const t = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            state.mouseX = t.clientX - rect.left;
            state.mouseY = t.clientY - rect.top;
        };

        const handleTouchEnd = (e: TouchEvent) => {
            e.preventDefault();
            state.isDragging = false;
        };

        const killSegment = (enemy: RuntimeEnemy, segIndex: number) => {
            const seg = enemy.segments[segIndex];
            if (!seg) return;
            if (segIndex === 0) return;

            if (seg.type === 'UPGRADE_CHEST' || seg.type === 'WEAPON_CHEST') {
                onEnemyKill(80, 120, seg.type);
                state.vfx.push({ type: 'chest_open', x: seg.x, y: seg.y, life: 28 });
            } else {
                state.orbs.push({
                    id: Math.random().toString(),
                    x: seg.x,
                    y: seg.y,
                    exp: enemy.exp / Math.max(enemy.segments.length, 1),
                    reward: enemy.reward / Math.max(enemy.segments.length, 1),
                    vx: (Math.random() - 0.5) * 4,
                    vy: (Math.random() - 0.5) * 4,
                    isMagnetized: false
                });
            }
            enemy.segments.splice(segIndex, 1);
            state.waveSegmentsDestroyed = Math.min(state.waveSegmentsTotal, state.waveSegmentsDestroyed + 1);
            // Pull the chain backward so the tail stays anchored when a segment is removed.
            if (enemy.segments.length > 0) {
                enemy.segments.forEach(s => {
                    s.pathDist -= LINK_GAP;
                });
            }
        };

        const update = (time: number) => {
            const coreX = canvas.width / 2;
            const coreY = canvas.height / 2;

            if (fieldDamageTrigger > prevFieldDamageTriggerRef.current) {
                state.enemies.forEach(e => e.segments.forEach((seg, index) => {
                    if (index === 0) return;
                    seg.hp *= 0.5;
                    seg.hitFlash = 1;
                }));
                prevFieldDamageTriggerRef.current = fieldDamageTrigger;
            }

            if (!isPaused) {
                if (time >= state.nextSpawnAt) {
                    spawnEnemy(state);
                    const spawnInterval = Math.max(520, 1500 - state.wave * 65 - difficulty * 100);
                    state.nextSpawnAt = time + spawnInterval;
                }
            }

            let aimX = state.mouseX;
            let aimY = state.mouseY;
            if (!state.isDragging) {
                let minDist = Number.POSITIVE_INFINITY;
                state.enemies.forEach(e => e.segments.forEach(seg => {
                    const d = Math.hypot(seg.x - coreX, seg.y - coreY);
                    if (d < minDist) {
                        minDist = d;
                        aimX = seg.x;
                        aimY = seg.y;
                    }
                }));
            }
            const aimAngle = Math.atan2(aimY - coreY, aimX - coreX);

            if (!isPaused) {
                weaponsRef.current.forEach(w => {
                    const next = state.weaponTimers[w.id] ?? 0;
                    if (time < next) return;

                    if (w.type === 'AREA') {
                        const radius = w.range * w.sizeMultiplier;
                        if (w.id === 'area-03') {
                            state.vfx.push({ type: 'nova', x: coreX, y: coreY, radius: radius * 0.8, life: 24, color: '#9efcff', width: 6, glow: 18 });
                            state.vfx.push({ type: 'nova', x: coreX, y: coreY, radius: radius * 1.05, life: 22, color: '#ffd37a', width: 4, glow: 14 });
                            state.vfx.push({ type: 'nova', x: coreX, y: coreY, radius: radius * 1.25, life: 20, color: '#66f2ff', width: 3, glow: 10 });
                        } else {
                            state.vfx.push({ type: 'nova', x: coreX, y: coreY, radius, life: 20 });
                        }
                        state.enemies.forEach(enemy => {
                            for (let i = enemy.segments.length - 1; i >= 0; i--) {
                                if (i === 0) continue;
                                const seg = enemy.segments[i];
                                if (!isSegmentVisible(seg, canvas)) continue;
                                if (Math.hypot(seg.x - coreX, seg.y - coreY) <= radius) {
                                    seg.hp -= w.damage * 1.15;
                                    seg.hitFlash = 1;
                                    if (seg.hp <= 0) killSegment(enemy, i);
                                }
                            }
                        });
                        state.weaponTimers[w.id] = time + w.cooldown;
                        return;
                    }

                    const isLaser = w.type === 'LASER';
                    const isOrbit = w.type === 'ORBIT';
                    const isBeam = w.type === 'BEAM';
                    const speed = isLaser ? 10.5 : isOrbit ? 4.2 : isBeam ? 8.8 : 7.2;
                    const color = isLaser
                        ? '#ff4d6d'
                        : isOrbit
                            ? '#39ff14'
                            : isBeam
                                ? '#b68cff'
                                : '#00f2ff';
                    const damage = isLaser ? Math.floor(w.damage * 1.25) : isOrbit ? Math.floor(w.damage * 0.85) : w.damage;
                    const penetration = isLaser ? Math.max(w.penetration, 8) : isOrbit ? Math.max(w.penetration, 4) : w.penetration;

                    for (let i = 0; i < w.projectileCount; i++) {
                        const spread = (i - (w.projectileCount - 1) / 2) * 0.11;
                        const baseAngle = isOrbit ? (time * 0.004) + (Math.PI * 2 * i) / Math.max(1, w.projectileCount) : aimAngle;
                        const angle = baseAngle + spread;
                        const spawnRadius = isOrbit ? w.range * 0.35 : 0;

                        state.projectiles.push({
                            x: coreX + Math.cos(angle) * spawnRadius,
                            y: coreY + Math.sin(angle) * spawnRadius,
                            vx: Math.cos(angle) * speed,
                            vy: Math.sin(angle) * speed,
                            damage,
                            penetration,
                            hitIds: [],
                            size: (isLaser ? 6 : isOrbit ? 5 : 4) * w.sizeMultiplier,
                            color,
                            weaponType: w.type,
                            hasBurn: w.hasBurn,
                            hasLightning: w.hasLightning,
                            life: 0
                        });
                    }

                    state.weaponTimers[w.id] = time + (isOrbit ? Math.max(280, Math.floor(w.cooldown * 0.45)) : w.cooldown);
                });
            }

            if (!isPaused) {
                for (let i = state.projectiles.length - 1; i >= 0; i--) {
                    const p = state.projectiles[i];
                    p.x += p.vx;
                    p.y += p.vy;
                    p.life += 1;
                    const ang = Math.atan2(p.vy, p.vx);

                    if (p.weaponType === 'LASER' && p.life % 2 === 0) {
                        state.vfx.push({ type: 'trail', x: p.x, y: p.y, life: 14, weaponType: p.weaponType, color: p.color, angle: ang, size: p.size });
                    } else if (p.weaponType === 'BEAM' && p.life % 2 === 0) {
                        state.vfx.push({ type: 'trail', x: p.x, y: p.y, life: 16, weaponType: p.weaponType, color: p.color, angle: ang, size: p.size });
                    } else if (p.weaponType === 'BIT' && p.life % 3 === 0) {
                        state.vfx.push({ type: 'trail', x: p.x, y: p.y, life: 10, weaponType: p.weaponType, color: p.color, angle: ang, size: p.size });
                    }

                    let removed = false;
                    for (const enemy of state.enemies) {
                        if (p.hitIds.includes(enemy.id)) continue;

                        let hit = false;
                        for (let s = 0; s < enemy.segments.length; s++) {
                            const seg = enemy.segments[s];
                            if (!isSegmentVisible(seg, canvas)) continue;
                            if (Math.hypot(seg.x - p.x, seg.y - p.y) < 20 + p.size) {
                                hit = true;
                                if (s !== 0) {
                                    seg.hp -= p.damage;
                                    seg.hitFlash = 1;
                                    if (p.hasBurn) seg.burn = 180;
                                    state.vfx.push({ type: 'hit', x: seg.x, y: seg.y, life: 12, weaponType: p.weaponType, color: p.color });
                                    if (seg.hp <= 0) {
                                        killSegment(enemy, s);
                                        s--;
                                    }
                                }
                                break;
                            }
                        }

                        if (!hit) continue;

                        p.hitIds.push(enemy.id);
                        if (p.hasLightning && enemy.segments.length > 0) {
                            const source = enemy.segments[0];
                            state.enemies.forEach(other => {
                                if (other.id === enemy.id || other.segments.length === 0) return;
                                const targetIndex = other.segments.length > 1 ? 1 : 0;
                                if (targetIndex === 0) return;
                                const target = other.segments[targetIndex];
                                if (!isSegmentVisible(target, canvas)) return;
                                if (Math.hypot(target.x - source.x, target.y - source.y) <= 100) {
                                    target.hp -= p.damage * 0.5;
                                    target.hitFlash = 0.8;
                                    if (target.hp <= 0) killSegment(other, targetIndex);
                                    state.vfx.push({ type: 'lightning', x1: source.x, y1: source.y, x2: target.x, y2: target.y, life: 10 });
                                }
                            });
                        }

                        p.penetration -= 1;
                        if (p.penetration < 0) {
                            state.projectiles.splice(i, 1);
                            removed = true;
                            break;
                        }
                    }

                    if (removed) continue;
                    if (p.life > 280 || p.x < -220 || p.x > canvas.width + 220 || p.y < -220 || p.y > canvas.height + 220) {
                        state.projectiles.splice(i, 1);
                    }
                }

                for (let i = state.enemies.length - 1; i >= 0; i--) {
                    const enemy = state.enemies[i];
                    if (enemy.segments.length === 0 || enemy.segments.length === 1) {
                        state.enemies.splice(i, 1);
                        state.enemiesKilledInWave += 1;
                        continue;
                    }

                    let coreHit = false;
                    const head = enemy.segments[0];
                    const headProgress = Math.max(0, Math.min(1, head.pathDist / totalPathLength));
                    const headSpeedMul = 1 + headProgress * 0.35;
                    head.pathDist += enemy.speed * headSpeedMul;

                    // Rebuild chain spacing every frame so gaps are immediately closed.
                    for (let s = 1; s < enemy.segments.length; s++) {
                        enemy.segments[s].pathDist = enemy.segments[s - 1].pathDist - LINK_GAP;
                    }

                    for (let s = 0; s < enemy.segments.length; s++) {
                        const seg = enemy.segments[s];
                        const pos = getPointOnPath(seg.pathDist, globalPath);
                        seg.x = pos.x;
                        seg.y = pos.y;

                        if (pos.isEnd && (s !== 0 ? seg.hp > 0 : true)) {
                            coreHit = true;
                            if (s !== 0) seg.hp = 0;
                        }

                        if (seg.burn > 0 && s !== 0) {
                            seg.burn -= 1;
                            if (isSegmentVisible(seg, canvas)) {
                                seg.hp -= 0.07;
                            }
                        }
                        seg.hitFlash = Math.max(0, seg.hitFlash - 0.08);
                    }

                    if (coreHit) onCoreDamage(10 + difficulty * 2);

                    for (let s = enemy.segments.length - 1; s >= 0; s--) {
                        if (enemy.segments[s].hp <= 0) killSegment(enemy, s);
                    }
                }

                for (let i = state.orbs.length - 1; i >= 0; i--) {
                    const orb = state.orbs[i];
                    orb.vx *= 0.9;
                    orb.vy *= 0.9;

                    const dx = coreX - orb.x;
                    const dy = coreY - orb.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < 160 + difficulty * 10) orb.isMagnetized = true;

                    if (orb.isMagnetized && dist > 0.01) {
                        orb.vx += (dx / dist) * 0.9;
                        orb.vy += (dy / dist) * 0.9;
                    }

                    orb.x += orb.vx;
                    orb.y += orb.vy;

                    if (Math.hypot(coreX - orb.x, coreY - orb.y) < 35) {
                        onEnemyKill(orb.reward, orb.exp);
                        state.orbs.splice(i, 1);
                    }
                }

                for (let i = state.vfx.length - 1; i >= 0; i--) {
                    state.vfx[i].life -= 1;
                    if (state.vfx[i].life <= 0) state.vfx.splice(i, 1);
                }

                const enemiesPerWave = 1;
                const totalWaves = 1;
                const waveRatio = state.enemies.length === 0 && state.enemiesKilledInWave >= enemiesPerWave
                    ? 1
                    : state.waveSegmentsTotal > 0
                        ? Math.min(1, state.waveSegmentsDestroyed / state.waveSegmentsTotal)
                        : Math.min(1, state.enemiesKilledInWave / Math.max(1, enemiesPerWave));
                const stageProgress = Math.min(100, Math.floor(((state.wave - 1 + waveRatio) / totalWaves) * 100));
                onWaveProgress?.(stageProgress);

                if (state.enemiesKilledInWave >= enemiesPerWave && state.enemies.length === 0) {
                    onVictory();
                    return;
                }
            }

            ctx.fillStyle = '#050510';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = '#1a1a40';
            ctx.lineWidth = 1;
            for (let x = 0; x < canvas.width; x += 40) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += 40) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00f2ff';
            ctx.strokeStyle = '#00f2ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(coreX, coreY, 15, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;

            ctx.save();
            ctx.translate(coreX, coreY);
            ctx.rotate(aimAngle);
            ctx.fillStyle = '#00f2ff';
            ctx.beginPath();
            ctx.moveTo(25, 0);
            ctx.lineTo(15, 6);
            ctx.lineTo(15, -6);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            state.orbs.forEach(orb => {
                ctx.fillStyle = orb.isMagnetized ? '#f0ffff' : '#00ffff';
                ctx.shadowBlur = orb.isMagnetized ? 15 : 5;
                ctx.shadowColor = '#00ffff';
                ctx.beginPath();
                ctx.moveTo(orb.x, orb.y - 6);
                ctx.lineTo(orb.x + 6, orb.y);
                ctx.lineTo(orb.x, orb.y + 6);
                ctx.lineTo(orb.x - 6, orb.y);
                ctx.closePath();
                ctx.fill();
                ctx.shadowBlur = 0;
            });

            state.projectiles.forEach(p => {
                const ang = Math.atan2(p.vy, p.vx);
                if (p.weaponType === 'LASER') {
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(ang);
                    ctx.shadowBlur = 14;
                    ctx.shadowColor = p.color;
                    ctx.strokeStyle = p.color;
                    ctx.lineWidth = p.size * 0.6;
                    ctx.beginPath();
                    ctx.moveTo(-p.size * 2.2, 0);
                    ctx.lineTo(p.size * 2.8, 0);
                    ctx.stroke();
                    ctx.restore();
                    ctx.shadowBlur = 0;
                } else if (p.weaponType === 'BEAM') {
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(ang);
                    ctx.shadowBlur = 18;
                    ctx.shadowColor = p.color;
                    ctx.strokeStyle = p.color;
                    ctx.lineWidth = p.size * 0.9;
                    ctx.beginPath();
                    ctx.moveTo(-p.size * 2.6, 0);
                    ctx.lineTo(p.size * 3.2, 0);
                    ctx.stroke();
                    ctx.restore();
                    ctx.shadowBlur = 0;
                } else if (p.weaponType === 'ORBIT') {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = p.color;
                    ctx.strokeStyle = p.color;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                } else {
                    ctx.shadowBlur = 8;
                    ctx.shadowColor = p.color;
                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y - p.size);
                    ctx.lineTo(p.x + p.size, p.y);
                    ctx.lineTo(p.x, p.y + p.size);
                    ctx.lineTo(p.x - p.size, p.y);
                    ctx.closePath();
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            });

            state.enemies.forEach(enemy => {
                enemy.segments.forEach((seg, index) => {
                    if (seg.x < -30 || seg.x > canvas.width + 30 || seg.y < -30 || seg.y > canvas.height + 30) return;

                    const isChest = seg.type === 'UPGRADE_CHEST' || seg.type === 'WEAPON_CHEST';
                    if (seg.hitFlash > 0 && Math.random() < seg.hitFlash) ctx.fillStyle = '#fff';
                    else if (seg.burn > 0 && Math.random() < 0.3) ctx.fillStyle = '#ff5100';
                    else if (seg.type === 'UPGRADE_CHEST') ctx.fillStyle = '#ffd700';
                    else if (seg.type === 'WEAPON_CHEST') ctx.fillStyle = '#00f2ff';
                    else ctx.fillStyle = '#ff00ff';

                    const radius = isChest ? 22 : index === 0 ? 18 : 15;
                    if (isChest) {
                        ctx.fillRect(seg.x - (radius - 4), seg.y - (radius - 4), (radius - 4) * 2, (radius - 4) * 2);
                        ctx.strokeStyle = '#fff';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(seg.x - (radius - 4), seg.y - (radius - 4), (radius - 4) * 2, (radius - 4) * 2);
                    } else {
                        ctx.beginPath();
                        ctx.arc(seg.x, seg.y, radius, 0, Math.PI * 2);
                        ctx.fill();
                    }

                    if (index !== 0) {
                        ctx.fillStyle = '#fff';
                        ctx.font = 'bold 10px monospace';
                        ctx.textAlign = 'center';
                        ctx.fillText(formatHp(seg.hp), seg.x, seg.y + (isChest ? 6 : 0));
                    }
                });
            });

            state.vfx.forEach(v => {
                if (v.type === 'lightning') {
                    ctx.strokeStyle = '#fff200';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(v.x1, v.y1);
                    ctx.lineTo(v.x2, v.y2);
                    ctx.stroke();
                }
                if (v.type === 'trail') {
                    ctx.save();
                    ctx.globalAlpha = Math.max(0, v.life / 16);
                    ctx.translate(v.x, v.y);
                    ctx.rotate(v.angle);
                    if (v.weaponType === 'LASER') {
                        ctx.strokeStyle = v.color;
                        ctx.lineWidth = v.size * 0.5;
                        ctx.beginPath();
                        ctx.moveTo(-v.size * 3, 0);
                        ctx.lineTo(v.size * 3.2, 0);
                        ctx.stroke();
                    } else if (v.weaponType === 'BEAM') {
                        ctx.strokeStyle = v.color;
                        ctx.lineWidth = v.size * 0.85;
                        ctx.beginPath();
                        ctx.moveTo(-v.size * 3.4, 0);
                        ctx.lineTo(v.size * 3.6, 0);
                        ctx.stroke();
                    } else {
                        ctx.fillStyle = v.color;
                        ctx.beginPath();
                        ctx.arc(0, 0, v.size * 0.7, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    ctx.restore();
                }
                if (v.type === 'hit') {
                    ctx.save();
                    ctx.globalAlpha = Math.max(0, v.life / 12);
                    ctx.shadowBlur = 14;
                    ctx.shadowColor = v.color;
                    if (v.weaponType === 'LASER') {
                        ctx.strokeStyle = v.color;
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.arc(v.x, v.y, 8 + (12 - v.life) * 1.2, 0, Math.PI * 2);
                        ctx.stroke();
                    } else if (v.weaponType === 'BEAM') {
                        ctx.fillStyle = v.color;
                        ctx.beginPath();
                        ctx.arc(v.x, v.y, 6 + (12 - v.life) * 1.6, 0, Math.PI * 2);
                        ctx.fill();
                    } else if (v.weaponType === 'ORBIT') {
                        ctx.strokeStyle = v.color;
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.moveTo(v.x - 6, v.y);
                        ctx.lineTo(v.x + 6, v.y);
                        ctx.moveTo(v.x, v.y - 6);
                        ctx.lineTo(v.x, v.y + 6);
                        ctx.stroke();
                    } else {
                        ctx.fillStyle = v.color;
                        ctx.beginPath();
                        ctx.moveTo(v.x, v.y - 6);
                        ctx.lineTo(v.x + 6, v.y);
                        ctx.lineTo(v.x, v.y + 6);
                        ctx.lineTo(v.x - 6, v.y);
                        ctx.closePath();
                        ctx.fill();
                    }
                    ctx.restore();
                }
                if (v.type === 'chest_open') {
                    ctx.fillStyle = `rgba(255, 215, 0, ${v.life / 28})`;
                    ctx.beginPath();
                    ctx.arc(v.x, v.y, (28 - v.life) * 1.9, 0, Math.PI * 2);
                    ctx.fill();
                }
                if (v.type === 'nova') {
                    const baseAlpha = Math.min(1, v.life / 20);
                    const color = v.color ?? '#00f2ff';
                    ctx.shadowBlur = v.glow ?? 8;
                    ctx.shadowColor = color;
                    ctx.strokeStyle = `rgba(0, 0, 0, 0)`;
                    ctx.lineWidth = v.width ?? 4;
                    ctx.strokeStyle = color;
                    ctx.globalAlpha = baseAlpha;
                    ctx.beginPath();
                    ctx.arc(v.x, v.y, v.radius * (1 - (v.life / 20) * 0.2), 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                    ctx.shadowBlur = 0;
                }
            });

            if (state.isDragging) {
                const dx = state.mouseX - state.dragStartX;
                const dy = state.mouseY - state.dragStartY;
                const dist = Math.min(Math.hypot(dx, dy), 56);
                const ang = Math.atan2(dy, dx);
                const knobX = state.dragStartX + Math.cos(ang) * dist;
                const knobY = state.dragStartY + Math.sin(ang) * dist;

                ctx.globalAlpha = 0.24;
                ctx.fillStyle = '#00f2ff';
                ctx.beginPath();
                ctx.arc(state.dragStartX, state.dragStartY, 40, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 0.62;
                ctx.beginPath();
                ctx.arc(knobX, knobY, 16, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            if (isPaused) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#00f2ff';
                ctx.font = 'bold 36px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('SYSTEM PAUSED', canvas.width / 2, canvas.height / 2 - 40);
            }

            animationId = requestAnimationFrame(update);
        };

        window.addEventListener('resize', resize);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mouseleave', handleMouseUp);
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
        canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });

        resize();
        animationId = requestAnimationFrame(update);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mouseleave', handleMouseUp);
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchmove', handleTouchMove);
            canvas.removeEventListener('touchend', handleTouchEnd);
            canvas.removeEventListener('touchcancel', handleTouchEnd);
        };
    }, [difficulty, fieldDamageTrigger, globalPath, isPaused, onCoreDamage, onEnemyKill, onVictory, onWaveProgress, totalPathLength]);

    return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
};

export default GameCanvas;











