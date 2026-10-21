/**
 * 企業家經營班｜10/30 工作坊分組志願後台（完整替換版）
 * 1. 全部貼入原本的 Apps Script 專案。
 * 2. 執行 setupWorkshopSheet() 一次，並完成授權。
 * 3. 執行 testWorkshopBackend() 查看後台試算表。
 * 4. 部署 > 管理部署作業 > 編輯 > 新版本 > 部署。
 *    執行身分：我；存取權：任何人（依公司政策允許的設定）。
 * 5. 將 /exec 網址更新到 GitHub 問卷（若網址不變則不用）。
 */
const CONFIG = {
  key: 'WORKSHOP_RANK_SHEET_ID',
  tab: '分組志願回覆',
  headers: [
    '填寫時間', '通訊處', '處經理姓名',
    '第一順位', '第二順位', '第三順位', '第四順位', '送出識別碼'
  ],
  topics: [
    '人才育成與新人定著',
    '願景領導與增員驅動',
    '經營複製與組織擴張',
    '自律領導與團隊自主'
  ],
  origin: 'https://kaoruying.github.io'
};

function getSheet_() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty(CONFIG.key);
  let ss;
  if (id) {
    ss = SpreadsheetApp.openById(id);
  } else {
    ss = SpreadsheetApp.create('企業家經營班_1030工作坊_分組意願回覆');
    props.setProperty(CONFIG.key, ss.getId());
  }
  let sheet = ss.getSheetByName(CONFIG.tab);
  if (!sheet) sheet = ss.insertSheet(CONFIG.tab);
  if (sheet.getLastRow() === 0) sheet.getRange(1, 1, 1, 8).setValues([CONFIG.headers]);
  if (!sheet.getRange(1, 8).getValue()) sheet.getRange(1, 8).setValue('送出識別碼');
  sheet.setFrozenRows(1);
  return sheet;
}

function setupWorkshopSheet() {
  const sheet = getSheet_();
  Logger.log('後台試算表：' + sheet.getParent().getUrl());
}

function testWorkshopBackend() {
  const sheet = getSheet_();
  Logger.log('連線成功：' + sheet.getParent().getUrl());
  Logger.log('已收件：' + Math.max(0, sheet.getLastRow() - 1) + ' 筆');
}

function doGet(e) {
  const params = (e && e.parameter) || {};
  const token = String(params.receipt || '');
  if (params.callback === 'workshopReceipt' && /^[a-zA-Z0-9._-]{12,100}$/.test(token)) {
    const sheet = getSheet_();
    const last = sheet.getLastRow();
    let found = false;
    if (last > 1) {
      found = sheet.getRange(2, 8, last - 1, 1).getValues()
        .some(row => String(row[0]) === token);
    }
    const payload = JSON.stringify({token: token, ok: found});
    return ContentService.createTextOutput('window.workshopReceipt(' + payload + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return HtmlService.createHtmlOutput('企業家經營班分組系統已啟用。');
}

function doPost(e) {
  const p = (e && e.parameter) || {};
  const token = String(p.token || '');
  try {
    const unit = String(p.unit || '').trim();
    const name = String(p.name || '').trim();
    const ranks = [p.rank1, p.rank2, p.rank3, p.rank4]
      .map(value => String(value || '').trim());

    if (!unit || !name || unit.length > 70 || name.length > 70) {
      throw new Error('請先選擇通訊處與處經理。');
    }
    if (!/^[a-zA-Z0-9._-]{12,100}$/.test(token)) {
      throw new Error('送出識別碼無效，請重新整理頁面。');
    }
    if (ranks.some(value => !CONFIG.topics.includes(value)) ||
        new Set(ranks).size !== 4) {
      throw new Error('四個經營主題的順位不得重複。');
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      const sheet = getSheet_();
      const last = sheet.getLastRow();
      let rowIndex = last + 1;
      if (last > 1) {
        const current = sheet.getRange(2, 2, last - 1, 2).getValues();
        const match = current.findIndex(row =>
          String(row[0]).trim() === unit && String(row[1]).trim() === name
        );
        if (match !== -1) rowIndex = match + 2;
      }
      const safe = value => /^[=+@-]/.test(value) ? "'" + value : value;
      sheet.getRange(rowIndex, 1, 1, 8).setValues([[
        new Date(), safe(unit), safe(name), ...ranks, token
      ]]);
      SpreadsheetApp.flush();
    } finally {
      lock.releaseLock();
    }
    return response_(token, true, '已成功儲存分組志願！');
  } catch (error) {
    return response_(token, false, String(error.message || error));
  }
}

function response_(token, ok, message) {
  const payload = JSON.stringify({
    source: 'workshop-ranking', token: token, ok: ok, message: message
  }).replace(/</g, '\\u003c');
  const origin = JSON.stringify(CONFIG.origin);
  return HtmlService.createHtmlOutput(
    '<!doctype html><html><body><script>' +
    'window.parent.postMessage(' + payload + ',' + origin + ');' +
    '</script><p>' + (ok ? '已儲存' : '儲存失敗') + '</p></body></html>'
  ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
