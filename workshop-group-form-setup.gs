/**
 * 企業家經營班 10/30｜網頁分組志願登記後台
 * 1. 整份取代原本 Apps Script 程式碼。
 * 2. 執行 setupWorkshopSheet() 一次，授權後查看執行紀錄的試算表網址。
 * 3. 先執行 testWorkshopBackend()，確認工作表能正常開啟。\n * 4. 「部署 > 管理部署作業 > 編輯 > 版本選新版本 > 部署」。
 * 4. 學員從 GitHub 網頁填寫，資料直接寫到你的 Google 試算表。
 * 不需要 Google 表單，且對外不揭露與談人姓名。
 */
const SETTINGS = {
  propertyKey: 'WORKSHOP_RANK_SHEET_ID',
  tab: '分組志願回覆',
  headings: ['填寫時間','通訊處','處經理姓名','第一順位','第二順位','第三順位','第四順位'],
  topics: [
    '人才育成與新人定著',
    '願景領導與增員驅動',
    '經營複製與組織擴張',
    '自律領導與團隊自主'
  ],
  parentOrigin: 'https://kaoruying.github.io'
};

function testWorkshopBackend() {
  const sh = getSheet_();
  Logger.log('試算表網址：' + sh.getParent().getUrl());
  Logger.log('目前資料筆數：' + Math.max(0, sh.getLastRow() - 1));
}

function setupWorkshopSheet() {
  const sheet = getSheet_();
  Logger.log('後台試算表：https://docs.google.com/spreadsheets/d/' + sheet.getParent().getId() + '/edit');
}

function getSheet_() {
  const properties = PropertiesService.getScriptProperties();
  let id = properties.getProperty(SETTINGS.propertyKey);
  const spreadsheet = id
    ? SpreadsheetApp.openById(id)
    : SpreadsheetApp.create('企業家經營班_1030工作坊_分組意願回覆');
  if (!id) {
    id = spreadsheet.getId();
    properties.setProperty(SETTINGS.propertyKey, id);
  }
  let sheet = spreadsheet.getSheetByName(SETTINGS.tab);
  if (!sheet) sheet = spreadsheet.insertSheet(SETTINGS.tab);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(SETTINGS.headings);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Google Apps Script 網頁部署必須含 doGet，可顯示服務狀態。
function doGet(e) {
  const p = (e && e.parameter) || {};
  // 只以隨機識別碼核對送出結果，不透過公開網址揭露學員資料。
  if (p.receipt && p.callback === 'workshopReceipt') {
    const token = String(p.receipt).slice(0, 100);
    const found = CacheService.getScriptCache().get('receipt:' + token) === '1';
    const payload = JSON.stringify({token:token,ok:found}).replace(/</g,'\\u003c');
    return ContentService.createTextOutput('window.workshopReceipt(' + payload + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return HtmlService.createHtmlOutput('企業家經營班分組回覆服務已啟用。');
}

function testWorkshopBackend() {
  const sheet = getSheet_();
  const spreadsheet = sheet.getParent();
  Logger.log('後台已連線：' + spreadsheet.getUrl());
  Logger.log('工作表：' + sheet.getName());
  Logger.log('目前資料筆數：' + Math.max(0,sheet.getLastRow()-1));
}

// 使用原生 HTML 表單跨網域 POST，不需使用者登入 Google 表單。
function doPost(e) {
  const p = (e && e.parameter) || {};
  const token = String(p.token || '').slice(0, 100);
  try {
    const unit = String(p.unit || '').trim();
    const name = String(p.name || '').trim();
    const ranks = [p.rank1,p.rank2,p.rank3,p.rank4].map(v => String(v || '').trim());
    if (!unit || !name || unit.length > 70 || name.length > 70) {
      throw new Error('請填寫通訊處及姓名。');
    }
    if (ranks.some(v => !SETTINGS.topics.includes(v)) || new Set(ranks).size !== 4) {
      throw new Error('請將四個主題排出不重複的第一至第四順位。');
    }
    const lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try {
      const sheet = getSheet_();
      // 同一位學員重複提交，以最後一次填寫的志願為準。
      let targetRow = sheet.getLastRow() + 1;
      if (targetRow > 2) {
        const records = sheet.getRange(2,2,targetRow-2,2).getValues();
        for (let i=0;i<records.length;i++) {
          if (String(records[i][0]).trim() === unit &&
              String(records[i][1]).trim() === name) {
            targetRow = i + 2;
            break;
          }
        }
      }
      // 避免 Google 試算表將以 =,+,-,@ 開頭的輸入當成公式。
      const safeText = value => /^[=+\-@]/.test(value) ? "'" + value : value;
      sheet.getRange(targetRow,1,1,7).setValues([[
        new Date(),safeText(unit),safeText(name),...ranks
      ]]);
      SpreadsheetApp.flush();
      if (token && /^[A-Za-z0-9._-]{8,100}$/.test(token)) {
        CacheService.getScriptCache().put('receipt:' + token, '1', 600);
      }
    } finally {
      lock.releaseLock();
    }
    return respond_(token,true,'已成功送出分組志願。');
  } catch (err) {
    return respond_(token,false,err.message || '送出失敗，請稍後再試。');
  }
}

function respond_(token,ok,message) {
  const data = JSON.stringify({source:'workshop-ranking',token:token,ok:ok,message:message})
    .replace(/</g,'\\u003c');
  return HtmlService.createHtmlOutput(
    '<!doctype html><html><body><script>' +
    'window.parent.postMessage(' + data + ',' + JSON.stringify(SETTINGS.parentOrigin) + ');' +
    '</script><p>' + (ok ? '填寫完成' : '填寫失敗') + '</p></body></html>'
  );
}
