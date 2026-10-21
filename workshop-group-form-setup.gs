/**
 * 企業家經營班｜10/30 工作坊分組意願調查
 *
 * 對外問卷僅顯示四大主題；不揭露與談人姓名及對應關係。
 *
 * 【已有 Google 表單】
 * 1. 將該表單「編輯網址」貼進 EXISTING_FORM_URL（不是 Apps Script /exec 網址）。
 * 2. 在 Apps Script 執行 updateWorkshopPreferenceForm。
 * 3. 程式只更新說明文字及指定題目，不會另建表單或試算表。
 *
 * 【尚未建立 Google 表單】
 * 執行 createWorkshopPreferenceForm。執行紀錄會輸出填寫網址。
 * 同一 Apps Script 專案重複執行時，會沿用先前建立的表單。
 */
const EXISTING_FORM_URL = '';

const WORKSHOP = {
  title: '企業家經營班｜10/30 工作坊分組意願調查',
  topics: [
    '人才育成與新人定著',
    '願景領導與增員驅動',
    '經營複製與組織擴張',
    '自律領導與團隊自主'
  ],
  rankings: ['第一順位', '第二順位', '第三順位', '第四順位'],
  description:
    '本次工作坊仍以七週「策略展開與週追蹤表」的實際執行成果為分享主軸。學員不需因分組調整原有案例。\n\n' +
    '為提供更貼近通訊處經營需求的實務回饋，請依您目前最希望強化的能力，將四大主題排出第一至第四順位。' +
    '四個主題皆須排序，每個順位與主題只能使用一次。\n\n' +
    '【分組安排說明】\n' +
    '1. 36位學員分為四組，每組以9人為限。\n' +
    '2. 主辦單位將依學員志願排序及各組名額統籌安排。\n' +
    '3. 如較高順位的組別額滿，將依後續順位安排。\n' +
    '4. 填寫本問卷不代表已確定分組，實際分組以主辦單位公告為準。\n' +
    '5. 主辦單位保留分組調整及最終決定權。',
  agreement:
    '我已了解每組以9人為限，分組將參考志願順位及名額，並以主辦單位最終安排為準。'
};

function getOrAddItem_(form, type, title) {
  const existing = form.getItems(type).find(item => item.getTitle() === title);
  if (existing) return existing;
  if (type === FormApp.ItemType.TEXT) return form.addTextItem();
  if (type === FormApp.ItemType.GRID) return form.addGridItem();
  if (type === FormApp.ItemType.PARAGRAPH_TEXT) return form.addParagraphTextItem();
  if (type === FormApp.ItemType.CHECKBOX) return form.addCheckboxItem();
  throw new Error('不支援的題目類型');
}

function configureWorkshopForm_(form) {
  form.setTitle(WORKSHOP.title);
  form.setDescription(WORKSHOP.description);
  form.setConfirmationMessage('已收到您的分組意願，感謝填寫！最終分組將由主辦單位另行通知。');

  getOrAddItem_(form, FormApp.ItemType.TEXT, '通訊處')
    .asTextItem().setTitle('通訊處').setRequired(true);
  getOrAddItem_(form, FormApp.ItemType.TEXT, '處經理姓名')
    .asTextItem().setTitle('處經理姓名').setRequired(true);

  // 舊版如果已經存在相同的排序題，直接更新選項，不另建題目。
  const grid = getOrAddItem_(form, FormApp.ItemType.GRID,
    '四大主題志願排序（每個順位及主題都只能使用一次）').asGridItem();
  grid.setTitle('四大主題志願排序（每個順位及主題都只能使用一次）')
    .setHelpText('每列選擇一個順位。請在 Google 表單編輯頁開啟「每欄僅限一個回覆」，確保四個順位不重複。')
    .setRows(WORKSHOP.topics).setColumns(WORKSHOP.rankings).setRequired(true);

  getOrAddItem_(form, FormApp.ItemType.PARAGRAPH_TEXT,
    '您最希望透過工作坊獲得哪一項經營協助？（選填）')
    .asParagraphTextItem()
    .setTitle('您最希望透過工作坊獲得哪一項經營協助？（選填）')
    .setRequired(false);

  getOrAddItem_(form, FormApp.ItemType.CHECKBOX, '分組安排確認')
    .asCheckboxItem().setTitle('分組安排確認')
    .setChoiceValues([WORKSHOP.agreement]).setRequired(true);
  form.setAcceptingResponses(true);
}

function logWorkshopForm_(form) {
  Logger.log('表單編輯網址：' + form.getEditUrl());
  Logger.log('學員填寫網址：' + form.getPublishedUrl());
  Logger.log('請手動確認排序題已開啟「每欄僅限一個回覆」。');
}

function updateWorkshopPreferenceForm() {
  if (!EXISTING_FORM_URL.trim()) {
    throw new Error('請先將已存在的 Google 表單「編輯網址」貼入 EXISTING_FORM_URL；不要貼 Apps Script /exec 網址。');
  }
  const form = FormApp.openByUrl(EXISTING_FORM_URL.trim());
  configureWorkshopForm_(form);
  PropertiesService.getScriptProperties().setProperty('WORKSHOP_FORM_ID', form.getId());
  logWorkshopForm_(form);
}

function createWorkshopPreferenceForm() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('WORKSHOP_FORM_ID');
  const form = id ? FormApp.openById(id) : FormApp.create(WORKSHOP.title);
  configureWorkshopForm_(form);
  if (!id) {
    const ss = SpreadsheetApp.create('企業家經營班_1030工作坊_分組志願回覆');
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
    props.setProperty('WORKSHOP_FORM_ID', form.getId());
    Logger.log('回覆試算表：' + ss.getUrl());
  }
  logWorkshopForm_(form);
}
