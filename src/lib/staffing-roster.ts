/**
 * 就労者名簿（紹介簿用整理）の HTML / Excel 互換 HTML を生成する。
 * - HTML プレビュー: 管理画面で「印刷 → PDF 保存」も可能
 * - Excel 添付: HTML mime を application/vnd.ms-excel にすると Excel が直接開ける
 */

export interface RosterWorker {
  id: string;
  name: string;
  name_kana: string | null;
  gender: string | null;
  birth_date: string | null;
  attribute: string | null;
  phone: string | null;
}

export interface RosterShift {
  id: string;
  shift_date: string;       // YYYY-MM-DD
  start_time: string;       // HH:MM:SS
  end_time: string;
}

export interface RosterAssignment {
  worker_id: string;
  shift_id: string;
}

export interface RosterPayload {
  jobTitle: string;
  clientName: string;
  issueDate: string;        // 発行日（YYYY/MM/DD）
  workers: RosterWorker[];
  shifts: RosterShift[];
  assignments: RosterAssignment[];
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

function formatShiftHeader(shift: RosterShift): string {
  const date = new Date(`${shift.shift_date}T00:00:00`);
  const w = WEEKDAYS[date.getDay()];
  const start = shift.start_time.slice(0, 5);
  const end = shift.end_time.slice(0, 5);
  return `${shift.shift_date}(${w})<br>${start}-${end}`;
}

function calcAge(birthDate: string | null, asOf: Date = new Date()): string {
  if (!birthDate) return '';
  const b = new Date(`${birthDate}T00:00:00`);
  let age = asOf.getFullYear() - b.getFullYear();
  const m = asOf.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && asOf.getDate() < b.getDate())) age--;
  return String(age);
}

function formatBirthDate(birthDate: string | null): string {
  if (!birthDate) return '';
  return birthDate.replace(/-/g, '/');
}

export function buildRosterHtml(payload: RosterPayload): string {
  const { workers, shifts, assignments, jobTitle, clientName, issueDate } = payload;

  const assignedSet = new Set(assignments.map((a) => `${a.worker_id}:${a.shift_id}`));

  const headerCells = shifts
    .map((s) => `<th class="shift-col">${formatShiftHeader(s)}</th>`)
    .join('');

  const rows = workers
    .map((w) => {
      const shiftCells = shifts
        .map((s) => {
          const has = assignedSet.has(`${w.id}:${s.id}`);
          return `<td class="shift-cell ${has ? 'marked' : ''}">${has ? '○' : ''}</td>`;
        })
        .join('');
      return `<tr>
        <td>${escapeHtml(w.name)}</td>
        <td>${escapeHtml(w.name_kana ?? '')}</td>
        <td class="center">${escapeHtml(w.gender ?? '')}</td>
        <td class="center">${calcAge(w.birth_date)}</td>
        <td class="center">${formatBirthDate(w.birth_date)}</td>
        <td class="center">${escapeHtml(w.attribute ?? '')}</td>
        <td>${escapeHtml(w.phone ?? '')}</td>
        ${shiftCells}
      </tr>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>就労者名簿 - ${escapeHtml(jobTitle)}</title>
<style>
  body { font-family: 'Hiragino Kaku Gothic Pro', 'Meiryo', sans-serif; padding: 24px; color: #1a202c; }
  .header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px; }
  .title { font-size: 14px; color: #555; }
  .subtitle { font-size: 12px; color: #888; }
  table { border-collapse: collapse; width: 100%; font-size: 12px; }
  th { background: #DDEBF7; border: 1px solid #4472C4; padding: 8px 6px; font-weight: bold; text-align: left; vertical-align: middle; }
  td { border: 1px solid #4472C4; padding: 6px; vertical-align: middle; }
  .center { text-align: center; }
  .shift-col { background: #C6EFCE; text-align: center; }
  .shift-cell { background: #FFF2CC; text-align: center; font-size: 14px; font-weight: bold; }
  .shift-cell.marked { color: #1a202c; }
  .footer { display: flex; justify-content: space-between; margin-top: 24px; font-size: 11px; color: #666; }
  .print-bar {
    position: fixed; top: 12px; right: 12px; z-index: 9999;
    background: #ef4444; color: white; padding: 10px 16px;
    border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 13px;
    border: none; box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }
  .print-bar:hover { background: #dc2626; }
  @media print {
    body { padding: 0; }
    .print-bar { display: none !important; }
  }
  @page { size: A4 landscape; margin: 12mm; }
</style>
</head>
<body>
  <button class="print-bar" onclick="window.print()">📄 PDFで保存 / 印刷</button>
  <div class="header">
    <div>
      <div class="title">${escapeHtml(clientName)} - ${escapeHtml(jobTitle)} 就労者名簿</div>
    </div>
    <div class="subtitle">紹介簿用整理</div>
  </div>
  <table>
    <thead>
      <tr>
        <th>名前</th>
        <th>フリガナ</th>
        <th>性別</th>
        <th>年齢</th>
        <th>生年月日</th>
        <th>属性</th>
        <th>電話番号</th>
        ${headerCells}
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
  <div class="footer">
    <div>${escapeHtml(issueDate)}</div>
    <div>1</div>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function todayJP(): string {
  const d = new Date();
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}
