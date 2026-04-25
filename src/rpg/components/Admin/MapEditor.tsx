"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import Link from 'next/link';

type MapData = {
    id: string;
    key: string;
    name: string;
    width: number;
    height: number;
    base_image_url: string;
    encounters_enabled: boolean;
    tile_data?: TilePlacement[];
};

type Tile = {
    id: string;
    name: string;
    url: string;
    is_obstacle?: boolean;
};

type TilePlacement = {
    x: number;
    y: number;
    tileId: string;
};

type Collision = {
    x: number;
    y: number;
};

type MapObject = {
    id: string;
    type: string;
    x: number;
    y: number;
    name: string;
    sprite_url?: string;
    width?: number;
    height?: number;
};

interface MapEditorProps {
    initialMap: MapData;
    initialCollisions: Collision[];
    initialObjects: MapObject[];
    isNewMap?: boolean;
}

const TILE_SIZE = 32;

export default function MapEditor({ initialMap, initialCollisions, initialObjects, isNewMap = false }: MapEditorProps) {
    const [mapData, setMapData] = useState(initialMap);
    const [collisions, setCollisions] = useState<Collision[]>(initialCollisions);
    const [objects, setObjects] = useState<MapObject[]>(initialObjects);
    const router = useRouter();

    // Tile State
    const [tiles, setTiles] = useState<Tile[]>([]);
    const [tileData, setTileData] = useState<TilePlacement[]>(initialMap.tile_data || []);
    const [selectedTileId, setSelectedTileId] = useState<string | null>(null);

    const [scale, setScale] = useState(1);
    const [mode, setMode] = useState<'collision' | 'object' | 'view' | 'tile'>('view');
    const [isSaving, setIsSaving] = useState(false);
    const [isNew, setIsNew] = useState(isNewMap); // NEW: 新規作成フラグ
    const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [hoverPos, setHoverPos] = useState<{ x: number, y: number } | null>(null);

    // Initial Draw & Redraw
    useEffect(() => {
        drawMap();
    }, [mapData, collisions, objects, tileData, scale, selectedObjectId, hoverPos, tiles]);

    // Fetch Tiles
    useEffect(() => {
        const fetchTiles = async () => {
            const supabase = createClient();
            const { data } = await supabase.from('rpg_tiles').select('*').order('created_at', { ascending: false });
            if (data) setTiles(data);
        };
        fetchTiles();
    }, []);

    // Image Cache to avoid flickering and async issues
    const imageCache = useRef<Record<string, HTMLImageElement>>({});

    const getCachedImage = (url: string, callback: () => void) => {
        if (!url) return null;
        if (imageCache.current[url]) {
            if (imageCache.current[url].complete) return imageCache.current[url];
            // Already loading, just add callback
            const existingOnload = imageCache.current[url].onload;
            imageCache.current[url].onload = () => {
                if (typeof existingOnload === 'function') (existingOnload as any)();
                callback();
            };
            return null;
        }
        const img = new Image();
        img.src = url;
        img.onload = () => callback();
        imageCache.current[url] = img;
        return null;
    };

    const drawMap = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = mapData.width * TILE_SIZE * scale;
        const height = mapData.height * TILE_SIZE * scale;

        if (canvas.width !== width) canvas.width = width;
        if (canvas.height !== height) canvas.height = height;

        ctx.clearRect(0, 0, width, height);
        ctx.save();
        ctx.scale(scale, scale);

        // 1. Draw Background
        const bgImg = getCachedImage(mapData.base_image_url, () => drawMap());
        if (bgImg) {
            ctx.drawImage(bgImg, 0, 0, mapData.width * TILE_SIZE, mapData.height * TILE_SIZE);
        } else if (!mapData.base_image_url) {
            ctx.fillStyle = '#064e3b'; // emerald-950
            ctx.fillRect(0, 0, mapData.width * TILE_SIZE, mapData.height * TILE_SIZE);
        }

        // 2. Draw Tiles
        tileData.forEach(t => {
            const tile = tiles.find(tile => tile.id === t.tileId);
            if (tile) {
                const tileImg = getCachedImage(tile.url, () => drawMap());
                if (tileImg) {
                    ctx.drawImage(tileImg, t.x * TILE_SIZE, t.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                } else {
                    ctx.fillStyle = 'rgba(100, 200, 255, 0.3)';
                    ctx.fillRect(t.x * TILE_SIZE, t.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
            }
        });

        // 3. Draw Overlays
        drawOverlays(ctx);

        ctx.restore();
    };

    const drawOverlays = (ctx: CanvasRenderingContext2D) => {
        // 2. Draw Grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;

        // Draw vertical lines
        for (let x = 0; x <= mapData.width; x++) {
            ctx.beginPath();
            ctx.moveTo(x * TILE_SIZE, 0);
            ctx.lineTo(x * TILE_SIZE, mapData.height * TILE_SIZE);
            ctx.stroke();
        }
        // Draw horizontal lines
        for (let y = 0; y <= mapData.height; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * TILE_SIZE);
            ctx.lineTo(mapData.width * TILE_SIZE, y * TILE_SIZE);
            ctx.stroke();
        }

        // 3. Draw Collisions
        ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
        collisions.forEach(c => {
            ctx.fillRect(c.x * TILE_SIZE, c.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        });

        // 4. Draw Objects
        objects.forEach(obj => {
            const isSelected = obj.id === selectedObjectId;

            // Draw circle for object or rectangle if sized
            ctx.beginPath();
            if (obj.width && obj.height && (obj.width > 1 || obj.height > 1)) {
                // Multi-tile object rendering
                // Highlight if selected
                if (isSelected) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.fillRect(obj.x * TILE_SIZE, obj.y * TILE_SIZE, obj.width * TILE_SIZE, obj.height * TILE_SIZE);
                    ctx.strokeStyle = '#00ff00';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(obj.x * TILE_SIZE, obj.y * TILE_SIZE, obj.width * TILE_SIZE, obj.height * TILE_SIZE);
                }

                // Draw Sprite if available
                const spriteImg = getCachedImage(obj.sprite_url || '', () => drawMap());
                if (spriteImg) {
                    ctx.drawImage(spriteImg, obj.x * TILE_SIZE, obj.y * TILE_SIZE, obj.width * TILE_SIZE, obj.height * TILE_SIZE);
                } else {
                    // Fallback placeholder
                    ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
                    ctx.fillRect(obj.x * TILE_SIZE, obj.y * TILE_SIZE, obj.width * TILE_SIZE, obj.height * TILE_SIZE);
                }
            } else {
                // Single tile (Standard) rendering
                // Highlight if selected
                if (isSelected) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.fillRect(obj.x * TILE_SIZE, obj.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                    ctx.strokeStyle = '#00ff00';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(obj.x * TILE_SIZE, obj.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }

                // Object Color
                ctx.fillStyle = obj.type === 'portal' ? 'rgba(0, 255, 255, 0.7)' :
                    obj.type === 'company' ? 'rgba(0, 255, 0, 0.7)' :
                        'rgba(255, 255, 0, 0.7)'; // npc/item

                ctx.arc(
                    obj.x * TILE_SIZE + TILE_SIZE / 2,
                    obj.y * TILE_SIZE + TILE_SIZE / 2,
                    TILE_SIZE / 2.5, 0, Math.PI * 2
                );
                ctx.fill();
            }

            // Label
            ctx.fillStyle = 'white';
            ctx.font = '10px sans-serif';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;

            const text = obj.name?.substring(0, 8) || obj.type;
            ctx.strokeText(text, obj.x * TILE_SIZE, obj.y * TILE_SIZE - 2);
            ctx.fillText(text, obj.x * TILE_SIZE, obj.y * TILE_SIZE - 2);
        });

        // 5. Draw Hover Highlight
        if (hoverPos) {
            ctx.fillStyle = 'rgba(100, 149, 237, 0.5)'; // CornflowerBlue
            ctx.fillRect(hoverPos.x * TILE_SIZE, hoverPos.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.strokeRect(hoverPos.x * TILE_SIZE, hoverPos.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    };

    const getGridPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 }; // Should not happen in handler

        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Note: CSS size matches attribute size (no CSS scaling on canvas element itself other than max-width)
        // But if there is CSS scaling, we need to account for it.
        // rect.width is the displayed width. canvas.width is the internal width.
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const actualX = clickX * scaleX;
        const actualY = clickY * scaleY;

        // Since canvas.width includes `scale`, we divide by `scale` to get raw map coords
        const gridX = Math.floor(actualX / (scale * TILE_SIZE));
        const gridY = Math.floor(actualY / (scale * TILE_SIZE));

        return { x: gridX, y: gridY };
    };

    const [isDragging, setIsDragging] = useState(false);
    const [dragMode, setDragMode] = useState<'paint' | 'erase' | null>(null);

    const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDragging(true);
        const { x, y } = getGridPos(e);

        if (mode === 'collision') {
            const exists = collisions.some(c => c.x === x && c.y === y);
            setDragMode(exists ? 'erase' : 'paint');
            handleCollisionEdit(x, y, exists ? 'erase' : 'paint');
        } else if (mode === 'tile') {
            const exists = tileData.some(t => t.x === x && t.y === y);
            // If dragging, we use the selected tile. If clicking on existing, we might replace or erase.
            // Right click logic isn't here, so let's assume left click always paints selected, 
            // unless we add an specific eraser tool. For now, let's say:
            // Paint if selectedTileId is set. Erase if not?
            // Or simplified: Paint. To erase, maybe select "Erase" tool (null tile).
            setDragMode(selectedTileId ? 'paint' : 'erase');
            handleTileEdit(x, y, selectedTileId ? 'paint' : 'erase');
        } else if (mode === 'object') {
            handleObjectClick(x, y);
        }
    };

    const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const { x, y } = getGridPos(e);

        // Update hover
        if (x >= 0 && x < mapData.width && y >= 0 && y < mapData.height) {
            setHoverPos({ x, y });
        } else {
            setHoverPos(null);
        }

        // Handle Dragging
        if (isDragging) {
            if (mode === 'collision' && dragMode) {
                handleCollisionEdit(x, y, dragMode);
            } else if (mode === 'tile' && dragMode) {
                handleTileEdit(x, y, dragMode);
            }
        }

        // Handle Object Dragging (if we implemented that, but simple click-move for now)
    };

    const handleCanvasMouseUp = () => {
        setIsDragging(false);
        setDragMode(null);
    };

    const handleCanvasMouseLeave = () => {
        setHoverPos(null);
        setIsDragging(false);
        setDragMode(null);
    };

    const handleTileEdit = (x: number, y: number, action: 'paint' | 'erase') => {
        if (x < 0 || x >= mapData.width || y < 0 || y >= mapData.height) return;

        const selectedTile = selectedTileId ? tiles.find(t => t.id === selectedTileId) : null;

        setTileData(prev => {
            // Remove existing tile at this position
            const filtered = prev.filter(t => !(t.x === x && t.y === y));

            if (action === 'paint' && selectedTileId) {
                // 自動衝突設定
                if (selectedTile?.is_obstacle) {
                    handleCollisionEdit(x, y, 'paint');
                }
                return [...filtered, { x, y, tileId: selectedTileId }];
            }

            // 消去時は衝突も消す？ ユーザー要望的には「後で編集できる」なので、
            // タイルを消したときは一旦衝突も消すのが自然（地面に戻る想定）
            if (action === 'erase') {
                const existingPlacement = prev.find(t => t.x === x && t.y === y);
                if (existingPlacement) {
                    const existingTile = tiles.find(t => t.id === existingPlacement.tileId);
                    if (existingTile?.is_obstacle) {
                        handleCollisionEdit(x, y, 'erase');
                    }
                }
            }

            return filtered;
        });
    };

    const handleCollisionEdit = (x: number, y: number, action: 'paint' | 'erase') => {
        if (x < 0 || x >= mapData.width || y < 0 || y >= mapData.height) return;

        setCollisions(prev => {
            const exists = prev.some(c => c.x === x && c.y === y);
            if (action === 'paint' && !exists) {
                return [...prev, { x, y }];
            } else if (action === 'erase' && exists) {
                return prev.filter(c => !(c.x === x && c.y === y));
            }
            return prev;
        });
    };

    // ... object handlers ...
    const handleObjectClick = (x: number, y: number) => {
        const existingObj = objects.find(o => o.x === x && o.y === y);
        if (existingObj) {
            setSelectedObjectId(existingObj.id);
        } else {
            if (selectedObjectId) {
                setObjects(prev => prev.map(o => o.id === selectedObjectId ? { ...o, x, y } : o));
            }
        }
    };

    const handleAddObject = () => {
        const newObj: MapObject = {
            id: crypto.randomUUID(),
            type: 'npc',
            x: Math.floor(mapData.width / 2),
            y: Math.floor(mapData.height / 2),
            name: 'New NPC',
            sprite_url: ''
        };
        setObjects([...objects, newObj]);
        setSelectedObjectId(newObj.id);
        setMode('object');
    };

    const handleDeleteObject = () => {
        if (!selectedObjectId) return;
        setObjects(prev => prev.filter(o => o.id !== selectedObjectId));
        setSelectedObjectId(null);
    };

    const updateSelectedObject = (key: keyof MapObject | 'target_map_id' | 'scenario_id' | 'target_x' | 'target_y' | 'width' | 'height', value: any) => {
        setObjects(prev => prev.map(o => {
            if (o.id === selectedObjectId) {
                return { ...o, [key]: value };
            }
            return o;
        }));
    };

    const selectedObject = objects.find(o => o.id === selectedObjectId);

    const handleNewMap = () => {
        const name = prompt('新しいマップの名前を入力してください', '新マッぷ');
        if (!name) return;

        const newId = crypto.randomUUID();
        const newMap: MapData = {
            id: newId,
            key: `map_${Date.now()}`,
            name: name,
            width: 20,
            height: 15,
            base_image_url: '',
            encounters_enabled: false,
            tile_data: []
        };

        setMapData(newMap);
        setCollisions([]);
        setObjects([]);
        setTileData([]);
        setIsNew(true);
        setSelectedObjectId(null);
        toast.info('新マップを作成しました。保存するまでDBには反映されません。');
    };

    const handleSave = async () => {
        setIsSaving(true);
        const supabase = createClient();

        try {
            // 0. Update or Insert Map Data
            if (isNew) {
                const { error: insError } = await supabase
                    .from('rpg_maps')
                    .insert({
                        id: mapData.id,
                        key: mapData.key,
                        name: mapData.name,
                        width: mapData.width,
                        height: mapData.height,
                        encounters_enabled: mapData.encounters_enabled,
                        base_image_url: mapData.base_image_url,
                        tile_data: tileData
                    });
                if (insError) throw insError;
                setIsNew(false);
                toast.success('新規マップを作成しました！');
                router.replace(`/admin/rpg/maps/${mapData.id}`);
            } else {
                const { error: mapError } = await supabase
                    .from('rpg_maps')
                    .update({
                        name: mapData.name,
                        encounters_enabled: mapData.encounters_enabled,
                        base_image_url: mapData.base_image_url,
                        tile_data: tileData
                    })
                    .eq('id', mapData.id);

                if (mapError) throw mapError;
            }

            // 1. Save Collisions
            // First delete all for this map (simple sync approach)
            await supabase.from('rpg_map_collisions').delete().eq('map_id', mapData.id);

            if (collisions.length > 0) {
                const { error } = await supabase.from('rpg_map_collisions').insert(
                    collisions.map(c => ({ map_id: mapData.id, x: c.x, y: c.y }))
                );
                if (error) throw error;
            }

            // 2. Save Objects
            await supabase.from('rpg_map_objects').delete().eq('map_id', mapData.id);
            if (objects.length > 0) {
                const { error: objError } = await supabase.from('rpg_map_objects').insert(
                    objects.map(o => ({
                        id: o.id.includes('-') ? o.id : undefined, // let DB gen uuid if not valid uuid
                        map_id: mapData.id,
                        type: o.type,
                        x: o.x,
                        y: o.y,
                        name: o.name,
                        sprite_url: o.sprite_url,
                        scenario_id: (o as any).scenario_id,
                        target_map_id: (o as any).target_map_id,
                        target_x: (o as any).target_x,
                        target_y: (o as any).target_y,
                        width: o.width || 1,
                        height: o.height || 1
                    }))
                );
                if (objError) throw objError;
            }

            toast.success('保存しました！');
        } catch (e: any) {
            console.error(e);
            toast.error(`保存に失敗しました: ${e.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadTile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const supabase = createClient();
            const fileExt = file.name.split('.').pop();
            const fileName = `${crypto.randomUUID()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload
            const { error: uploadError } = await supabase.storage
                .from('rpg-tiles')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('rpg-tiles')
                .getPublicUrl(filePath);

            // Insert DB
            const { data, error: dbError } = await supabase
                .from('rpg_tiles')
                .insert({
                    name: file.name,
                    url: publicUrl
                })
                .select()
                .single();

            if (dbError) throw dbError;

            setTiles(prev => [data, ...prev]);
            toast.success('タイルをアップロードしました');
        } catch (error: any) {
            console.error(error);
            toast.error('アップロード失敗: ' + error.message);
        }
    };

    return (
        <div className="flex h-full bg-slate-900 text-white overflow-hidden">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleUploadTile}
            />
            <div className="flex-1 flex flex-col">
                {/* Toolbar */}
                <div className="bg-slate-800 p-4 flex items-center gap-4 justify-between border-b border-slate-700 shrink-0">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/rpg/maps" className="text-slate-400 hover:text-white flex items-center gap-1">
                            ← 一覧
                        </Link>
                        <Button size="sm" variant="ghost" onClick={handleNewMap} title="新規マップ">+</Button>
                        <h2 className="font-bold text-lg">{mapData.name}</h2>
                        <div className="flex bg-slate-700 rounded p-1">
                            <button
                                onClick={() => setMode('view')}
                                className={`px-3 py-1 rounded ${mode === 'view' ? 'bg-slate-500 text-white' : 'text-slate-400 hover:text-white'}`}
                            >View</button>
                            <button
                                onClick={() => setMode('collision')}
                                className={`px-3 py-1 rounded ${mode === 'collision' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            >Collision</button>
                            <button
                                onClick={() => setMode('tile')}
                                className={`px-3 py-1 rounded ${mode === 'tile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            >Tile</button>
                            <button
                                onClick={() => setMode('object')}
                                className={`px-3 py-1 rounded ${mode === 'object' ? 'bg-yellow-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            >Object</button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setScale(s => Math.max(0.5, s - 0.25))}
                            className="p-2 hover:bg-slate-700 rounded"
                        >-</button>
                        <span className="text-sm font-mono">{Math.round(scale * 100)}%</span>
                        <button
                            onClick={() => setScale(s => Math.min(3, s + 0.25))}
                            className="p-2 hover:bg-slate-700 rounded"
                        >+</button>
                        <div className="w-4" />
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? '保存中...' : '保存'}
                        </Button>
                    </div>
                </div>

                {/* Editor Area */}
                <div className="flex-1 overflow-auto p-8 flex justify-center bg-slate-950 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
                    <canvas
                        ref={canvasRef}
                        onMouseDown={handleCanvasMouseDown}
                        onMouseUp={handleCanvasMouseUp}
                        onMouseMove={handleCanvasMouseMove}
                        onMouseLeave={handleCanvasMouseLeave}
                        className="shadow-2xl border border-slate-700 bg-black cursor-crosshair"
                    />
                </div>

                <div className="p-2 text-xs text-slate-500 bg-slate-900 text-center shrink-0">
                    {mode === 'collision' && 'クリックして通行禁止/許可を切り替え'}
                    {mode === 'object' && 'オブジェクトを選択して移動、またはプロパティ編集'}
                    {mode === 'view' && '閲覧モード'}
                    {hoverPos && ` @ (${hoverPos.x}, ${hoverPos.y})`}
                </div>
            </div>

            {/* Properties Panel (Right) */}
            <div className="w-80 bg-slate-800 border-l border-slate-700 p-4 overflow-y-auto shrink-0 flex flex-col gap-6">

                {mode === 'tile' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-300">タイルパレット</h3>
                            <Button size="sm" variant="secondary" className="text-slate-900 border-none hover:bg-slate-200" onClick={() => fileInputRef.current?.click()}>
                                + アップロード
                            </Button>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            <div
                                onClick={() => setSelectedTileId(null)}
                                className={`aspect-square border-2 rounded cursor-pointer flex items-center justify-center bg-slate-900 ${selectedTileId === null ? 'border-red-500' : 'border-transparent hover:border-slate-500'}`}
                                title="消しゴム"
                            >
                                🚫
                            </div>
                            {tiles.map(tile => (
                                <div
                                    key={tile.id}
                                    onClick={() => setSelectedTileId(tile.id)}
                                    className={`relative aspect-square border-2 rounded cursor-pointer overflow-hidden ${selectedTileId === tile.id ? 'border-yellow-400' : 'border-transparent hover:border-slate-500'}`}
                                >
                                    <img src={tile.url} alt={tile.name} className="w-full h-full object-cover pixelated" />
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 space-y-2">
                            <div className="text-xs text-slate-500">
                                モード: {selectedTileId ? 'ペイント' : '消しゴム'}
                            </div>
                            {selectedTileId && (
                                <label className="flex items-center gap-2 py-1 px-2 bg-slate-700/50 rounded cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={tiles.find(t => t.id === selectedTileId)?.is_obstacle || false}
                                        onChange={async (e) => {
                                            const checked = e.target.checked;
                                            const supabase = createClient();
                                            const { error } = await supabase
                                                .from('rpg_tiles')
                                                .update({ is_obstacle: checked })
                                                .eq('id', selectedTileId);
                                            if (!error) {
                                                setTiles(prev => prev.map(t => t.id === selectedTileId ? { ...t, is_obstacle: checked } : t));
                                                toast.success(checked ? '障害物に設定しました' : '通行可能に設定しました');
                                            }
                                        }}
                                    />
                                    <span className="text-xs text-slate-300">デフォルトで通行禁止(障害物)</span>
                                </label>
                            )}
                        </div>
                    </div>
                )}

                {mode !== 'tile' && (
                    <div>
                        <h3 className="font-bold mb-4 text-slate-300">マップ設定</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-slate-400">マップ名</label>
                                <input
                                    className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm"
                                    value={mapData.name}
                                    onChange={(e) => setMapData({ ...mapData, name: e.target.value })}
                                />
                            </div>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={mapData.encounters_enabled}
                                    onChange={(e) => setMapData({ ...mapData, encounters_enabled: e.target.checked })}
                                />
                                ランダムエンカウント有効
                            </label>
                        </div>
                    </div>
                )}

                {mode === 'object' && (
                    <div className="border-t border-slate-700 pt-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-300">オブジェクト</h3>
                            <Button size="sm" variant="secondary" onClick={handleAddObject}>+ 追加</Button>
                        </div>

                        {selectedObject ? (
                            <div className="space-y-3 animation-fade-in">
                                {/* ... Object Inputs ... */}
                                <div>
                                    <label className="text-xs text-slate-400">名前</label>
                                    <input
                                        className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm"
                                        value={selectedObject.name || ''}
                                        onChange={(e) => updateSelectedObject('name', e.target.value)}
                                    />
                                </div>
                                {/* ... Rest of Object inputs ... */}
                                <div>
                                    <label className="text-xs text-slate-400">タイプ</label>
                                    <select
                                        className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm"
                                        value={selectedObject.type}
                                        onChange={(e) => updateSelectedObject('type', e.target.value)}
                                    >
                                        <option value="npc">NPC</option>
                                        <option value="portal">ポータル (移動)</option>
                                        <option value="item">アイテム</option>
                                        <option value="company">企業</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400">座標 (X, Y)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number" className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm"
                                            value={selectedObject.x}
                                            onChange={(e) => updateSelectedObject('x', parseInt(e.target.value))}
                                        />
                                        <input
                                            type="number" className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm"
                                            value={selectedObject.y}
                                            onChange={(e) => updateSelectedObject('y', parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>

                                {selectedObject.type === 'portal' && (
                                    <>
                                        <div className="p-2 bg-slate-900 rounded border border-slate-700">
                                            <div className="text-xs font-bold text-sky-400 mb-2">ポータル設定</div>
                                            <div className="space-y-2">
                                                <div>
                                                    <label className="text-xs text-slate-500">移動先マップID (Key)</label>
                                                    <input
                                                        className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs"
                                                        value={(selectedObject as any).target_map_id || ''}
                                                        onChange={(e) => updateSelectedObject('target_map_id', e.target.value)}
                                                        placeholder="例: town_start"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-slate-500">移動先座標 (X, Y)</label>
                                                    <div className="flex gap-1">
                                                        <input
                                                            type="number" className="w-full bg-slate-800 border border-slate-600 rounded px-1 py-1 text-xs"
                                                            value={(selectedObject as any).target_x || 0}
                                                            onChange={(e) => updateSelectedObject('target_x', parseInt(e.target.value))}
                                                        />
                                                        <input
                                                            type="number" className="w-full bg-slate-800 border border-slate-600 rounded px-1 py-1 text-xs"
                                                            value={(selectedObject as any).target_y || 0}
                                                            onChange={(e) => updateSelectedObject('target_y', parseInt(e.target.value))}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {(selectedObject.type === 'npc' || selectedObject.type === 'company') && (
                                    <div>
                                        <label className="text-xs text-slate-400">シナリオID</label>
                                        <input
                                            className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm"
                                            value={(selectedObject as any).scenario_id || ''}
                                            onChange={(e) => updateSelectedObject('scenario_id', e.target.value)}
                                            placeholder="intro_guide 等"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="text-xs text-slate-400">画像パス (任意)</label>
                                    <input
                                        className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm"
                                        value={selectedObject.sprite_url || ''}
                                        onChange={(e) => updateSelectedObject('sprite_url', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400">サイズ (幅 x 高さ)</label>
                                    <div className="flex gap-2">
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs text-slate-500">W</span>
                                            <input
                                                type="number" className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm"
                                                value={selectedObject.width || 1}
                                                min={1}
                                                onChange={(e) => updateSelectedObject('width', parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs text-slate-500">H</span>
                                            <input
                                                type="number" className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm"
                                                value={selectedObject.height || 1}
                                                min={1}
                                                onChange={(e) => updateSelectedObject('height', parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button variant="destructive" size="sm" className="w-full mt-4" onClick={handleDeleteObject}>
                                    削除
                                </Button>
                            </div>
                        ) : (
                            <div className="text-sm text-slate-500 text-center py-8">
                                オブジェクトMapをクリックするか<br />追加ボタンを押してください
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div >
    );
}
