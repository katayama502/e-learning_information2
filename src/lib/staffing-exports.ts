/**
 * 有料職業紹介事業の労働局提出用書類を HTML / Excel 互換 HTML で生成。
 *
 * - 求職者票 (workerForm)         ... 1人1枚の登録票
 * - 求職者管理簿 (workerMasterList) ... 全求職者一覧
 * - 求人票 (jobForm)               ... 1案件1枚の求人票
 * - 求人管理簿 (jobMasterList)      ... 全求人一覧
 */

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

export interface WorkerFormData {
  id: string;
  registration_number?: string | null;
  registration_date?: string | null;
  name: string;
  name_kana: string | null;
  gender: string | null;
  birth_date: string | null;
  attribute: string | null;
  phone: string | null;
  email: string | null;
  postal_code: string | null;
  address: string | null;
  occupation: string | null;
  emergency_contact: string | null;
  source: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  // 紹介履歴
  assignments?: Array<{
    job_title: string;
    client_name: string;
    shift_date: string;
    shift_time: string;
    status: string;
  }>;
}

export interface JobFormData {
  id: string;
  registration_number?: string | null;
  registration_date?: string | null;
  client_name: string;
  title: string;
  work_type: string | null;
  description: string | null;
  location: string | null;
  meeting_place_address: string | null;
  hourly_wage: number | null;
  status: string;
  created_at: string;
  shifts?: Array<{
    shift_date: string;
    start_time: string;
    end_time: string;
    capacity: number;
    assigned: number;
  }>;
  assignments?: Array<{
    worker_name: string;
    shift_date: string;
    status: string;
  }>;
}

const STYLE = `
  body { font-family: 'Hiragino Kaku Gothic Pro', 'Meiryo', sans-serif; padding: 24px; color: #1a202c; font-size: 12px; }
  h1 { font-size: 18px; text-align: center; margin: 0 0 16px; }
  table { border-collapse: collapse; width: 100%; margin-bottom: 16px; }
  th, td { border: 1px solid #4472C4; padding: 6px 8px; vertical-align: middle; }
  th { background: #DDEBF7; font-weight: bold; text-align: left; }
  th.label { background: #F2F2F2; width: 25%; }
  .header-row { background: #4472C4; color: white; }
  .center { text-align: center; }
  .footer { display: flex; justify-content: space-between; margin-top: 24px; font-size: 10px; color: #666; }
  .meta { font-size: 11px; color: #555; margin-bottom: 8px; }
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
    table { page-break-inside: auto; }
    tr { page-break-inside: avoid; page-break-after: auto; }
  }
  @page { size: A4; margin: 12mm; }
`;

const PRINT_BUTTON = `<button class="print-bar" onclick="window.print()">📄 PDFで保存 / 印刷</button>`;

function html(parts: TemplateStringsArray, ...values: unknown[]): string {
  return parts.reduce((acc, str, i) => acc + str + (values[i] !== undefined ? String(values[i]) : ''), '');
}

export function escapeHtml(str: string | null | undefined): string {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function calcAge(birthDate: string | null, asOf: Date = new Date()): string {
  if (!birthDate) return '';
  const b = new Date(`${birthDate}T00:00:00`);
  let age = asOf.getFullYear() - b.getFullYear();
  const m = asOf.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && asOf.getDate() < b.getDate())) age--;
  return String(age);
}

export function formatDateJP(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export function formatDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  return dateStr.replace(/^(\d{4})-(\d{2})-(\d{2}).*$/, '$1/$2/$3');
}

export function formatDateWithWeekday(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const d = new Date(`${dateStr.slice(0, 10)}T00:00:00`);
  return `${dateStr.slice(0, 10)} (${WEEKDAYS[d.getDay()]})`;
}

export function todayJP(): string {
  const d = new Date();
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

/** 求職者票（1人1枚） */
export function buildWorkerFormHtml(worker: WorkerFormData): string {
  const regDate = worker.registration_date ?? worker.created_at;
  const regNumber = worker.registration_number ?? worker.id.slice(0, 8).toUpperCase();
  const assignments = worker.assignments ?? [];

  const introHistory = assignments.length === 0
    ? `<tr><td colSpan="5" class="center" style="color:#999;">紹介履歴なし</td></tr>`
    : assignments.map((a) => `<tr>
        <td>${escapeHtml(a.client_name)}</td>
        <td>${escapeHtml(a.job_title)}</td>
        <td>${escapeHtml(a.shift_date)}</td>
        <td>${escapeHtml(a.shift_time)}</td>
        <td class="center">${escapeHtml(a.status)}</td>
      </tr>`).join('');

  return html`<!DOCTYPE html>
<html lang="ja"><head><meta charset="UTF-8"><title>求職者票 - ${escapeHtml(worker.name)}</title>
<style>${STYLE}</style></head><body>
  ${PRINT_BUTTON}
  <h1>求 職 者 票</h1>
  <div class="meta">
    受付番号：${escapeHtml(regNumber)}　／　受付年月日：${escapeHtml(formatDateJP(regDate))}
  </div>
  <table>
    <tr><th class="label">氏名</th><td>${escapeHtml(worker.name)}</td><th class="label">フリガナ</th><td>${escapeHtml(worker.name_kana)}</td></tr>
    <tr><th class="label">性別</th><td>${escapeHtml(worker.gender)}</td><th class="label">年齢</th><td>${escapeHtml(calcAge(worker.birth_date))}歳</td></tr>
    <tr><th class="label">生年月日</th><td>${escapeHtml(formatDateJP(worker.birth_date))}</td><th class="label">属性</th><td>${escapeHtml(worker.attribute)}</td></tr>
    <tr><th class="label">電話番号</th><td>${escapeHtml(worker.phone)}</td><th class="label">メール</th><td>${escapeHtml(worker.email)}</td></tr>
    <tr><th class="label">郵便番号</th><td>${escapeHtml(worker.postal_code)}</td><th class="label">住所</th><td>${escapeHtml(worker.address)}</td></tr>
    <tr><th class="label">職業 / 学校</th><td colSpan="3">${escapeHtml(worker.occupation)}</td></tr>
    <tr><th class="label">緊急連絡先</th><td colSpan="3">${escapeHtml(worker.emergency_contact)}</td></tr>
    <tr><th class="label">登録経路</th><td>${escapeHtml(worker.source)}</td><th class="label">ステータス</th><td>${escapeHtml(worker.status)}</td></tr>
    <tr><th class="label">備考</th><td colSpan="3">${escapeHtml(worker.notes)}</td></tr>
  </table>

  <h2 style="font-size:14px; margin:16px 0 8px;">紹介履歴</h2>
  <table>
    <thead><tr class="header-row"><th>紹介先（求人企業）</th><th>業務内容</th><th>就労日</th><th>就労時間</th><th class="center">状況</th></tr></thead>
    <tbody>${introHistory}</tbody>
  </table>

  <div class="footer">
    <div>発行日：${todayJP()}</div>
    <div>合同会社EIS（有料職業紹介事業）</div>
  </div>
</body></html>`;
}

/** 求職者管理簿（全件一覧） */
export function buildWorkerMasterListHtml(workers: WorkerFormData[]): string {
  const rows = workers.map((w, i) => `<tr>
    <td class="center">${i + 1}</td>
    <td>${escapeHtml(w.registration_number ?? w.id.slice(0, 8).toUpperCase())}</td>
    <td>${escapeHtml(formatDateShort(w.registration_date ?? w.created_at))}</td>
    <td>${escapeHtml(w.name)}</td>
    <td>${escapeHtml(w.name_kana)}</td>
    <td class="center">${escapeHtml(w.gender)}</td>
    <td class="center">${calcAge(w.birth_date)}</td>
    <td>${escapeHtml(w.attribute)}</td>
    <td>${escapeHtml(w.phone)}</td>
    <td>${escapeHtml(w.address)}</td>
    <td class="center">${escapeHtml(w.status)}</td>
  </tr>`).join('');

  return html`<!DOCTYPE html>
<html lang="ja"><head><meta charset="UTF-8"><title>求職者管理簿</title>
<style>${STYLE}</style></head><body>
  ${PRINT_BUTTON}
  <h1>求職者管理簿</h1>
  <div class="meta">発行日：${todayJP()}　／　合計：${workers.length}名</div>
  <table>
    <thead><tr class="header-row">
      <th class="center">No.</th><th>受付番号</th><th>受付日</th><th>氏名</th><th>フリガナ</th>
      <th class="center">性別</th><th class="center">年齢</th><th>属性</th><th>電話番号</th>
      <th>住所</th><th class="center">状態</th>
    </tr></thead>
    <tbody>${rows || `<tr><td colSpan="11" class="center" style="color:#999;">データなし</td></tr>`}</tbody>
  </table>
  <div class="footer"><div>合同会社EIS</div></div>
</body></html>`;
}

/** 求人票（1案件1枚） */
export function buildJobFormHtml(job: JobFormData): string {
  const regDate = job.registration_date ?? job.created_at;
  const regNumber = job.registration_number ?? job.id.slice(0, 8).toUpperCase();
  const shifts = job.shifts ?? [];
  const assignments = job.assignments ?? [];

  const totalCapacity = shifts.reduce((sum, s) => sum + s.capacity, 0);
  const totalAssigned = shifts.reduce((sum, s) => sum + s.assigned, 0);

  const shiftRows = shifts.length === 0
    ? `<tr><td colSpan="4" class="center" style="color:#999;">シフトなし</td></tr>`
    : shifts.map((s) => `<tr>
        <td>${escapeHtml(formatDateWithWeekday(s.shift_date))}</td>
        <td class="center">${escapeHtml(s.start_time.slice(0, 5))}〜${escapeHtml(s.end_time.slice(0, 5))}</td>
        <td class="center">${s.capacity}</td>
        <td class="center">${s.assigned}</td>
      </tr>`).join('');

  const assignmentRows = assignments.length === 0
    ? `<tr><td colSpan="3" class="center" style="color:#999;">紹介実績なし</td></tr>`
    : assignments.map((a) => `<tr>
        <td>${escapeHtml(a.worker_name)}</td>
        <td>${escapeHtml(a.shift_date)}</td>
        <td class="center">${escapeHtml(a.status)}</td>
      </tr>`).join('');

  return html`<!DOCTYPE html>
<html lang="ja"><head><meta charset="UTF-8"><title>求人票 - ${escapeHtml(job.title)}</title>
<style>${STYLE}</style></head><body>
  ${PRINT_BUTTON}
  <h1>求 人 票</h1>
  <div class="meta">受付番号：${escapeHtml(regNumber)}　／　受付年月日：${escapeHtml(formatDateJP(regDate))}</div>
  <table>
    <tr><th class="label">求人企業</th><td colSpan="3">${escapeHtml(job.client_name)}</td></tr>
    <tr><th class="label">案件名</th><td colSpan="3">${escapeHtml(job.title)}</td></tr>
    <tr><th class="label">業務内容</th><td>${escapeHtml(job.work_type)}</td><th class="label">勤務地</th><td>${escapeHtml(job.location)}</td></tr>
    <tr><th class="label">集合場所</th><td colSpan="3">${escapeHtml(job.meeting_place_address)}</td></tr>
    <tr><th class="label">時給</th><td>${job.hourly_wage ? `¥${job.hourly_wage.toLocaleString()}` : ''}</td><th class="label">必要人数</th><td>${totalCapacity}名</td></tr>
    <tr><th class="label">案件詳細</th><td colSpan="3">${escapeHtml(job.description)}</td></tr>
    <tr><th class="label">状態</th><td>${escapeHtml(job.status)}</td><th class="label">紹介済</th><td>${totalAssigned}名 / ${totalCapacity}名</td></tr>
  </table>

  <h2 style="font-size:14px; margin:16px 0 8px;">シフト一覧</h2>
  <table>
    <thead><tr class="header-row"><th>就労日</th><th class="center">時間</th><th class="center">必要</th><th class="center">紹介済</th></tr></thead>
    <tbody>${shiftRows}</tbody>
  </table>

  <h2 style="font-size:14px; margin:16px 0 8px;">紹介実績</h2>
  <table>
    <thead><tr class="header-row"><th>氏名</th><th>就労日</th><th class="center">状況</th></tr></thead>
    <tbody>${assignmentRows}</tbody>
  </table>

  <div class="footer">
    <div>発行日：${todayJP()}</div>
    <div>合同会社EIS（有料職業紹介事業）</div>
  </div>
</body></html>`;
}

/** 求人管理簿（全件一覧） */
export function buildJobMasterListHtml(jobs: JobFormData[]): string {
  const rows = jobs.map((j, i) => {
    const totalCapacity = (j.shifts ?? []).reduce((sum, s) => sum + s.capacity, 0);
    const totalAssigned = (j.shifts ?? []).reduce((sum, s) => sum + s.assigned, 0);
    return `<tr>
      <td class="center">${i + 1}</td>
      <td>${escapeHtml(j.registration_number ?? j.id.slice(0, 8).toUpperCase())}</td>
      <td>${escapeHtml(formatDateShort(j.registration_date ?? j.created_at))}</td>
      <td>${escapeHtml(j.client_name)}</td>
      <td>${escapeHtml(j.title)}</td>
      <td>${escapeHtml(j.work_type)}</td>
      <td>${escapeHtml(j.location)}</td>
      <td class="center">${j.hourly_wage ? `¥${j.hourly_wage.toLocaleString()}` : '—'}</td>
      <td class="center">${totalAssigned}/${totalCapacity}</td>
      <td class="center">${escapeHtml(j.status)}</td>
    </tr>`;
  }).join('');

  return html`<!DOCTYPE html>
<html lang="ja"><head><meta charset="UTF-8"><title>求人管理簿</title>
<style>${STYLE}</style></head><body>
  ${PRINT_BUTTON}
  <h1>求人管理簿</h1>
  <div class="meta">発行日：${todayJP()}　／　合計：${jobs.length}件</div>
  <table>
    <thead><tr class="header-row">
      <th class="center">No.</th><th>受付番号</th><th>受付日</th><th>求人企業</th><th>案件名</th>
      <th>業務内容</th><th>勤務地</th><th class="center">時給</th><th class="center">紹介済/必要</th><th class="center">状態</th>
    </tr></thead>
    <tbody>${rows || `<tr><td colSpan="10" class="center" style="color:#999;">データなし</td></tr>`}</tbody>
  </table>
  <div class="footer"><div>合同会社EIS</div></div>
</body></html>`;
}
