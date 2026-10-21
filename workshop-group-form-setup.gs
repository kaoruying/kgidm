/**
 * 企業家經營班｜10/30 工作坊分組意願調查
 * 使用：前往 https://script.google.com 建立 Apps Script 專案，
 * 貼上本檔內容、執行 createWorkshopPreferenceForm 並授權。
 * 執行紀錄會印出表單編輯及填寫網址。
 */
function createWorkshopPreferenceForm() {
  const title = '企業家經營班｜10/30 工作坊分組意願調查';
  const form = FormApp.create(title);
  form.setDescription(
    '本次工作坊持續以七週「策略展開與週追蹤表」的實際執行成果為分享主軸。\n' +
    '四位與談人將依各自經營專長，提供不同角度的專業回饋。請依目前最希望強化的經營主題，填寫第一至第四順位。\n\n' +
    '【分組原則】36位學員分為四組，每組至多9人。主辦單位將參考個人排序及組別名額安排；如優先順位已滿，依後續順位調整。填寫不代表最終分組，實際分組以主辦單位通知為準；主辦單位保留最終分組調整及決定權。'
  );
  form.setConfirmationMessage('已收到您的分組意願，感謝填寫！實際分組以主辦單位後續通知為準。');
  form.addTextItem().setTitle('通訊處').setRequired(true);
  form.addTextItem().setTitle('處經理姓名').setRequired(true);
  const topics = [
    '人才育成與新人定著｜林靜香 總監',
    '願景領導與增員驅動｜汪東森 副總',
    '經營複製與組織擴張｜李郁馨 副總',
    '自律領導與團隊自主｜楊玲芳 資深副總'
  ];
  form.addGridItem()
    .setTitle('四大主題志願排序（每個順位及主題都只能使用一次）')
    .setHelpText('每列選一個順位；請務必在表單編輯頁手動開啟「每欄僅限一個回覆」，避免重複排序。')
    .setRows(topics)
    .setColumns(['第一順位','第二順位','第三順位','第四順位'])
    .setRequired(true);
  form.addParagraphTextItem().setTitle('您最希望透過工作坊獲得哪一項經營協助？（選填）').setRequired(false);
  form.addCheckboxItem().setTitle('分組安排確認')
    .setChoiceValues(['我已了解每組至多9人，實際分組依志願排序、名額及主辦單位最終安排為準。'])
    .setRequired(true);
  const ss = SpreadsheetApp.create('企業家經營班_1030工作坊_分組志願回覆');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  Logger.log('表單編輯網址：' + form.getEditUrl());
  Logger.log('學員填寫網址：' + form.getPublishedUrl());
  Logger.log('回覆試算表：' + ss.getUrl());
}
