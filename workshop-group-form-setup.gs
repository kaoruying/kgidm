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
    '請依目前最希望強化的經營主題，填寫第一至第四順位，每個主題及順位不可重複。\\n' +
    '工作坊仍以七週策略執行成果分享為主，依分組主題提供不同角度的實務回饋。\\n\\n' +
    '每組限9人；如優先順位額滿，將依後續順位安排。實際分組由主辦單位統籌決定。'
};

function getOrAddItem_(form, type, title) {
  const existing = form.getItems(type).find(item => item.getTitle() === title);
  if (existing) return existing;
  // 轉回通用 Item，讓呼叫端可安全使用 asTextItem() / asGridItem()。
  if (type === FormApp.ItemType.TEXT) return form.getItemById(form.addTextItem().getId());
  if (type === FormApp.ItemType.GRID) return form.getItemById(form.addGridItem().getId());
  if (type === FormApp.ItemType.PARAGRAPH_TEXT) return form.getItemById(form.addParagraphTextItem().getId());
  if (type === FormApp.ItemType.CHECKBOX) return form.getItemById(form.addCheckboxItem().getId());
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
    .setHelpText('每項主題請選擇不同順位。')
    .setRows(WORKSHOP.topics).setColumns(WORKSHOP.rankings).setRequired(true);

  // 精簡問卷：移除舊版多餘的開放題、同意勾選題。
  const unnecessaryTitles = ['您最希望透過工作坊獲得哪一項經營協助？（選填）', '分組安排確認'];
  form.getItems().filter(item => unnecessaryTitles.includes(item.getTitle()))
    .forEach(item => form.deleteItem(item));

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
