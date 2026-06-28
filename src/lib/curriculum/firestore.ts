'use client';

// ============================================================
//  カリキュラム（ユニット・教材）の Firestore 読み書き
//  - units    コレクション: { title, order }
//  - materials コレクション: { unitId, title, slide_ref, starter_code, questions, order }
//  読み込みは units と materials を結合して Unit[] に組み立てる。
// ============================================================

import {
  collection, doc, getDocs, onSnapshot, addDoc, updateDoc, deleteDoc,
  setDoc, query, where, writeBatch, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Unit, Material } from './types';

const UNITS = 'units';
const MATERIALS = 'materials';

// ---- 組み立て ----
function assemble(
  unitDocs: { id: string; data: Record<string, unknown> }[],
  materialDocs: { id: string; data: Record<string, unknown> }[],
): Unit[] {
  const materialsByUnit = new Map<string, Material[]>();
  for (const m of materialDocs) {
    const unitId = (m.data.unitId as string) ?? '';
    const mat: Material = {
      id: m.id,
      title: (m.data.title as string) ?? '',
      slide_ref: (m.data.slide_ref as string | null) ?? null,
      starter_code: (m.data.starter_code as string) ?? '',
      questions: (m.data.questions as Material['questions']) ?? [],
      unitId,
      order: (m.data.order as number) ?? 0,
    };
    const list = materialsByUnit.get(unitId) ?? [];
    list.push(mat);
    materialsByUnit.set(unitId, list);
  }

  return unitDocs
    .map((u) => ({
      id: u.id,
      title: (u.data.title as string) ?? '',
      order: (u.data.order as number) ?? 0,
      materials: (materialsByUnit.get(u.id) ?? []).sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
      ),
    }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// ---- 一度だけ読み込み ----
export async function loadCurriculum(): Promise<Unit[]> {
  const [unitsSnap, matsSnap] = await Promise.all([
    getDocs(collection(db, UNITS)),
    getDocs(collection(db, MATERIALS)),
  ]);
  return assemble(
    unitsSnap.docs.map((d) => ({ id: d.id, data: d.data() })),
    matsSnap.docs.map((d) => ({ id: d.id, data: d.data() })),
  );
}

// ---- リアルタイム購読（管理ボードの即時反映用）----
export function subscribeCurriculum(
  cb: (units: Unit[]) => void,
  onError?: (err: Error) => void,
): () => void {
  let latestUnits: { id: string; data: Record<string, unknown> }[] = [];
  let latestMats: { id: string; data: Record<string, unknown> }[] = [];
  let haveUnits = false;
  let haveMats = false;

  const emit = () => {
    if (haveUnits && haveMats) cb(assemble(latestUnits, latestMats));
  };

  const handleError = (err: Error) => {
    console.error('[subscribeCurriculum] snapshot error:', err);
    onError?.(err);
  };
  const unsubU = onSnapshot(collection(db, UNITS),
    (snap) => { latestUnits = snap.docs.map((d) => ({ id: d.id, data: d.data() })); haveUnits = true; emit(); },
    handleError,
  );
  const unsubM = onSnapshot(collection(db, MATERIALS),
    (snap) => { latestMats = snap.docs.map((d) => ({ id: d.id, data: d.data() })); haveMats = true; emit(); },
    handleError,
  );

  return () => { unsubU(); unsubM(); };
}

// ---- 検索ヘルパー ----
export function findMaterialInUnits(units: Unit[], materialId: string) {
  const allMaterials = units.flatMap((u) => u.materials);
  const index = allMaterials.findIndex((m) => m.id === materialId);
  if (index === -1) return null;
  return { material: allMaterials[index], index, allMaterials };
}

// ============================================================
//  ユニット CRUD
// ============================================================
export async function createUnit(title: string, order: number): Promise<string> {
  const ref = await addDoc(collection(db, UNITS), { title, order, createdAt: serverTimestamp() });
  return ref.id;
}

export async function updateUnit(id: string, patch: { title?: string; order?: number }): Promise<void> {
  await updateDoc(doc(db, UNITS, id), patch);
}

export async function deleteUnit(id: string): Promise<void> {
  // 配下の教材も一括削除
  const mats = await getDocs(query(collection(db, MATERIALS), where('unitId', '==', id)));
  const batch = writeBatch(db);
  mats.forEach((m) => batch.delete(m.ref));
  batch.delete(doc(db, UNITS, id));
  await batch.commit();
}

// ============================================================
//  教材 CRUD
// ============================================================
export async function createMaterial(m: Omit<Material, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, MATERIALS), {
    unitId: m.unitId ?? '',
    title: m.title,
    slide_ref: m.slide_ref ?? null,
    starter_code: m.starter_code ?? '',
    questions: m.questions ?? [],
    order: m.order ?? 0,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateMaterial(id: string, patch: Partial<Omit<Material, 'id'>>): Promise<void> {
  await updateDoc(doc(db, MATERIALS, id), patch as Record<string, unknown>);
}

export async function deleteMaterial(id: string): Promise<void> {
  await deleteDoc(doc(db, MATERIALS, id));
}

// 教材IDを指定して作成・上書き（シード用に外部からも利用可）
export async function setMaterialWithId(id: string, m: Omit<Material, 'id'>): Promise<void> {
  await setDoc(doc(db, MATERIALS, id), {
    unitId: m.unitId ?? '',
    title: m.title,
    slide_ref: m.slide_ref ?? null,
    starter_code: m.starter_code ?? '',
    questions: m.questions ?? [],
    order: m.order ?? 0,
  });
}
