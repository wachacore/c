// === Игровое состояние ===
let score = 0;
let clickPower = 1;
let clickLevel = 0;
let autoLevel = 0;
let autoInterval = null;
let clickCounter = 0; // для экономичного сохранения при клике

// DOM
const scoreEl = document.getElementById('score');
const clickLevelEl = document.getElementById('clickLevel');
const autoLevelEl = document.getElementById('autoLevel');
const clickPriceEl = document.getElementById('clickPrice');
const autoPriceEl = document.getElementById('autoPrice');
const autoSpeedEl = document.getElementById('autoSpeed');
const clickBtn = document.getElementById('clickBtn');

// === Обновление UI ===
function updateUI() {
  scoreEl.textContent = Math.floor(score);
  clickLevelEl.textContent = clickLevel;
  autoLevelEl.textContent = autoLevel;

  // Цены
  const clickPrice = Math.floor(20 * Math.pow(1.4, clickLevel));
  const autoPrice = Math.floor(50 * Math.pow(1.4, autoLevel));
  clickPriceEl.textContent = clickPrice;
  autoPriceEl.textContent = autoPrice;

  // Скорость автокликера
  if (autoLevel === 0) {
    autoSpeedEl.textContent = '—';
  } else {
    const baseDelay = 2000; // 2 сек
    const delay = Math.max(20, baseDelay / Math.pow(1.22, autoLevel - 1));
    const clicksPerSec = (1000 / delay).toFixed(1);
    autoSpeedEl.textContent = `${clicksPerSec} кликов/сек`;
  }

  // Кнопки
  document.querySelectorAll('.upgrade-btn').forEach(btn => {
    const id = btn.closest('.upgrade').id;
    const price = id === 'upgrade-click' ? clickPrice : autoPrice;
    btn.disabled = score < price;
  });
}

// === Клик ===
function handleClick() {
  score += clickPower;
  clickCounter++;

  // Сохраняем каждые 20 кликов (экономим запись)
  if (clickCounter % 20 === 0) saveGame();

  updateUI();

  // Анимация
  clickBtn.classList.add('clicked');
  setTimeout(() => clickBtn.classList.remove('clicked'), 600);
}

// === Покупка улучшения ===
function buyUpgrade(type) {
  let price;
  if (type === 'click') {
    price = Math.floor(20 * Math.pow(1.4, clickLevel));
    if (score < price) {
      shakeEl('upgrade-click');
      return;
    }
    score -= price;
    clickPower += 1;
    clickLevel += 1;
  } else if (type === 'auto') {
    price = Math.floor(50 * Math.pow(1.4, autoLevel));
    if (score < price) {
      shakeEl('upgrade-auto');
      return;
    }
    score -= price;
    autoLevel += 1;

    // Перезапуск автокликера
    if (autoInterval) clearInterval(autoInterval);
    if (autoLevel > 0) {
      const baseDelay = 2000;
      const delay = Math.max(20, baseDelay / Math.pow(1.22, autoLevel - 1));
      autoInterval = setInterval(() => {
        score += 1;
        updateUI();
      }, delay);
    }
  }

  saveGame(); // Сохраняем сразу после покупки
  updateUI();
}

// === Эффект тряски при ошибке ===
function shakeEl(id) {
  const el = document.getElementById(id);
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 500);
}

// === Сохранение ===
function saveGame() {
  try {
    const state = {
      score,
      clickPower,
      clickLevel,
      autoLevel,
      timestamp: Date.now()
    };
    localStorage.setItem('clickerHZDR_save_v2', JSON.stringify(state));
    // console.log('💾 Сохранено:', state);
  } catch (e) {
    console.warn('Не удалось сохранить игру:', e);
  }
}

// === Загрузка ===
function loadGame() {
  try {
    const saved = localStorage.getItem('clickerHZDR_save_v2');
    if (saved) {
      const state = JSON.parse(saved);
      score = state.score || 0;
      clickPower = state.clickPower || 1;
      clickLevel = state.clickLevel || 0;
      autoLevel = state.autoLevel || 0;

      // Восстанавливаем автокликер
      if (autoInterval) clearInterval(autoInterval);
      if (autoLevel > 0) {
        const baseDelay = 2000;
        const delay = Math.max(20, baseDelay / Math.pow(1.22, autoLevel - 1));
        autoInterval = setInterval(() => {
          score += 1;
          updateUI();
        }, delay);
      }

      updateUI();
      // console.log('✅ Загружено:', state);
    }
  } catch (e) {
    console.warn('Не удалось загрузить игру:', e);
  }
}

// === Инициализация ===
clickBtn.addEventListener('click', handleClick);
loadGame(); // ← сначала загружаем!

// === Фоновый автосейв каждые 30 секунд + при выходе ===
setInterval(saveGame, 30_000); // каждые 30 сек
window.addEventListener('beforeunload', saveGame);

// === Поддержка Telegram WebApp ===
if (window.Telegram?.WebApp) {
  const tg = window.Telegram.WebApp;
  tg.expand();
  tg.ready();
}
