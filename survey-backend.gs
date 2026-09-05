const SPREADSHEET_ID = '1lQHX1ieNTGlv8heXT6yqlXER220M8kfbwTsiUYLYAy0';
const SHEET_NAME = '問卷回覆';
const SCHEMA_VERSION = '2026-09-06-v3';

const HEADERS = [
  '提交時間',
  '通訊處',
  '姓名',
  '講師授課內容的專業度',
  '講師授課內容對通訊處經營實務的幫助程度',
  '整體而言，您對本次講師授課的滿意程度',
  '這兩天課程中，您的主要學習收穫或建議是什麼？',
  '後續 Workshop，您期待以什麼樣的方式進行，或希望加入哪些內容？'
];

function doGet() {
  return json_({
    ok: true,
    service: '企業家經營班課後滿意度調查',
    schemaVersion: SCHEMA_VERSION,
    columns: HEADERS.length
  });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('找不到工作表：' + SHEET_NAME);

    ensureHeaders_(sheet);

    const p = (e && e.parameter) ? e.parameter : {};
    const unit = cleanText_(p.unit, 100);
    const name = cleanText_(p.name, 100);
    const q1 = normalizeScore_(p.q1);
    const q2 = normalizeScore_(p.q2);
    const q3 = normalizeScore_(p.q3);
    const courseFeedback = cleanText_(p.courseFeedback, 2000);
    const workshop = cleanText_(p.workshop, 2000);

    if (!unit || !name || !q1 || !q2 || !q3) {
      return json_({
        ok: false,
        schemaVersion: SCHEMA_VERSION,
        message: '請完成通訊處、姓名及三題評分後再送出。'
      });
    }

    const row = [
      new Date(),
      unit,
      name,
      q1,
      q2,
      q3,
      courseFeedback,
      workshop
    ];

    // 明確指定 A:H，避免欄位因表頭調整而錯位。
    sheet.getRange(sheet.getLastRow() + 1, 1, 1, HEADERS.length).setValues([row]);

    return json_({
      ok: true,
      schemaVersion: SCHEMA_VERSION,
      message: '謝謝您的回饋！'
    });
  } catch (err) {
    console.error(err);
    return json_({
      ok: false,
      schemaVersion: SCHEMA_VERSION,
      message: '資料儲存失敗，請稍後再試。'
    });
  } finally {
    lock.releaseLock();
  }
}

function ensureHeaders_(sheet) {
  const current = sheet.getRange(1, 1, 1, HEADERS.length).getDisplayValues()[0];
  const mismatch = HEADERS.some((header, i) => current[i] !== header);
  if (mismatch) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
}

function normalizeScore_(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 10) return null;
  return n;
}

function cleanText_(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
