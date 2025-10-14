'use strict';

document.addEventListener('DOMContentLoaded', () => {
  console.log('ポモドーロタイマー開始');

  const sheet = document.querySelector('.sheet-bg');
  const countdown = document.getElementById('countdown');

  // -------- JST取得を安全に ----------
  const jstFmt = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    hour12: false,
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
  const getJST = () => {
    const parts = jstFmt.formatToParts(new Date());
    const map = Object.fromEntries(parts.map(p => [p.type, p.value]));
    return {
      h: parseInt(map.hour, 10),
      m: parseInt(map.minute, 10),
      s: parseInt(map.second, 10)
    };
  };

  // -------- 開発用テストモード --------
  // true にすると常に 11:00 扱いで動作確認可能（夜でも動く）
  const TEST_MODE = true;  // true or false
  const TEST_HOUR = 11;

  // -------- 画像プリロード --------
  (function preloadImages() {
    const hours = Array.from({ length: 12 }, (_, i) => 11 + i); // 11〜22
    const mins = ['00', '30'];
    hours.forEach(h => mins.forEach(m => {
      const img = new Image();
      img.src = `images/sheet_${String(h).padStart(2, '0')}${m}.png`;
    }));
  })();

  function render() {
    let { h, m, s } = getJST();
    if (TEST_MODE) h = TEST_HOUR; // ← テスト時に固定（例: 11時）

    // === 11:00〜22:00 まで動作 ===
    if (h < 11 || (h === 22 && m > 0) || h > 22) {
      sheet.src = 'images/sheet_2130.png'; // 最後の画像
      countdown.textContent = '--:--';
      countdown.classList.remove('work', 'break');
      return;
    }

    // === 表示画像 ===
    const startMin = m < 30 ? '00' : '30';
    const fileName = `sheet_${String(h).padStart(2, '0')}${startMin}.png`;
    if (!sheet.src.endsWith(fileName)) {
      sheet.src = `images/${fileName}`;
    }

    // === 残り時間計算 ===
    const secOfCycle = (m % 30) * 60 + s;
    const isWork = secOfCycle < 25 * 60;
    const remain = isWork ? 25 * 60 - secOfCycle : 30 * 60 - secOfCycle;
    const mm = String(Math.floor(remain / 60)).padStart(2, '0');
    const ss = String(remain % 60).padStart(2, '0');

    countdown.textContent = `${mm}:${ss}`;
    countdown.classList.toggle('work', isWork);
    countdown.classList.toggle('break', !isWork);
  }

  render();
  setInterval(render, 1000);
});
