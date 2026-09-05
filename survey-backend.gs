const SPREADSHEET_ID = '1lQHX1ieNTGlv8heXT6yqlXER220M8kfbwTsiUYLYAy0';
const SHEET_NAME = '問卷回覆';

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: '企業家經營班課後滿意度調查' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('找不到工作表：' + SHEET_NAME);

    const p = (e && e.parameter) ? e.parameter : {};
    const q1 = normalizeScore_(p.q1);
    const q2 = normalizeScore_(p.q2);
    const q3 = normalizeScore_(p.q3);
    const workshop = String(p.workshop || '').trim().slice(0, 1200);

    if (!q1 || !q2 || !q3) {
      return json_({ ok: false, message: '三題評分皆為必填，請確認後再送出。' });
    }

    sheet.appendRow([
      new Date(),
      q1,
      q2,
      q3,
      workshop
    ]);

    return json_({ ok: true, message: '謝謝您的回饋！' });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, message: '資料儲存失敗，請稍後再試。' });
  } finally {
    lock.releaseLock();
  }
}

function normalizeScore_(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 10) return null;
  return n;
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
