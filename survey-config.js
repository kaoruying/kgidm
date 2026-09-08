window.SURVEY_ENDPOINT = 'https://script.google.com/macros/s/AKfycbw2FGvqlBXC63c8jlFHKgbnYODHGQoQYzI3JA2rf0uTzxa_T_Gnx4QYZtThNVoRxa4tsg/exec';

(() => {
  const questions = document.querySelectorAll('.question');

  if (questions[2]) {
    const title = questions[2].querySelector('.q-copy h3');
    const scale = questions[2].querySelector('.score-scale');
    if (title) title.innerHTML = '整體而言，您對本次課程滿意程度 <span class="required">＊</span>';
    if (scale) scale.setAttribute('aria-label', '整體而言，您對本次課程滿意程度');
  }

  if (questions[3]) {
    const title = questions[3].querySelector('.q-copy h3');
    if (title) title.textContent = '本次課程您的主要學習收穫是什麼？您預計如何帶回通訊處實際運用？';
  }

  if (questions[4]) {
    const title = questions[4].querySelector('.q-copy h3');
    if (title) title.textContent = '針對本次課程，您是否有其他回饋建議或希望調整的地方？';
  }
})();
