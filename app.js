const implementedPages = new Set(['home', 'detail']);

const routeMeta = {
  travel: ['准备旅行', '第 3 页：旅行方向、携带物品、Halo 影响与出发按钮。'],
  collection: ['收藏柜', '第 7 页：纪念品、照片、明信片、材料与 Halo 收藏。'],
  memory: ['Memory', '第 6 页：时间线、旅行照片、纪念节点和详情。'],
  diary: ['日志', '旅行过程消息与归来记录会在这里呈现。'],
  mypixo: ['我的 PiXO', '第 9 页：PiXO 列表、状态、Trait 和当前 Halo。'],
  shop: ['商店', '第 11 页：旅行用品、Halo、装饰与主题票。']
};

const pageNotes = {
  home: ['PAGE 01 / HOME', '首页 · 像素生活场景', '点击左上 Mochi 资料卡进入第 2 页。其他未完成页面先显示下一页提示，不伪装成已实现。'],
  detail: ['PAGE 02 / PIXO DETAIL', 'PiXO 详情 · 个体信息', 'Form / Face / Trait / Halo 可以切换；三件携带物品可以选择；底部按钮进入第 3 页准备旅行。']
};

const toast = document.getElementById('toast');
const preview = document.getElementById('routePreview');
const previewTitle = document.getElementById('previewTitle');
const previewText = document.getElementById('previewText');
const buildPage = document.getElementById('buildPage');
const buildTitle = document.getElementById('buildTitle');
const buildText = document.getElementById('buildText');
let toastTimer;
let currentPage = 'home';

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1600);
}

function setBuildNote(page) {
  const note = pageNotes[page] || pageNotes.home;
  buildPage.textContent = note[0];
  buildTitle.textContent = note[1];
  buildText.textContent = note[2];
}

function showPage(page, pushHash = true) {
  if (!implementedPages.has(page)) return openPreview(page);
  currentPage = page;
  document.querySelectorAll('.page-view').forEach(view => {
    view.hidden = view.dataset.page !== page;
  });
  setBuildNote(page);
  if (pushHash) history.replaceState(null, '', `#${page}`);
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function openPreview(route) {
  const [title, text] = routeMeta[route] || ['下一页', '该页面将在后续步骤实现。'];
  previewTitle.textContent = title;
  previewText.textContent = text;
  preview.classList.add('open');
  preview.setAttribute('aria-hidden', 'false');
}

function closePreview() {
  preview.classList.remove('open');
  preview.setAttribute('aria-hidden', 'true');
}

function playTapWave(screen, event) {
  const wave = screen.querySelector('.tap-wave');
  const rect = screen.getBoundingClientRect();
  wave.style.left = `${event.clientX - rect.left}px`;
  wave.style.top = `${event.clientY - rect.top}px`;
  wave.classList.remove('show');
  void wave.offsetWidth;
  wave.classList.add('show');
}

document.querySelectorAll('.pixo-screen').forEach(screen => {
  screen.addEventListener('pointerdown', event => playTapWave(screen, event));
});

document.querySelectorAll('[data-route]').forEach(button => {
  button.addEventListener('click', () => {
    const route = button.dataset.route;
    if (implementedPages.has(route)) showPage(route);
    else openPreview(route);
  });
});

document.querySelectorAll('[data-action]').forEach(button => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;
    const messages = {
      coin: '金币 12,560 · 商店与旅行用品使用',
      gem: '钻石 385 · 稀有内容与盲盒使用',
      energy: '体力 28 / 30 · 会随时间恢复',
      activity: '活动入口 · 后续加入季节与限定 Halo',
      event: '今日事件：心情很好 · +15 EXP',
      'edit-pixo': '编辑功能：名称、展示偏好等后续接入'
    };
    showToast(messages[action] || action);
  });
});

// PAGE 02 - 详情 Tab
const detailTabs = [...document.querySelectorAll('[data-detail-tab]')];
detailTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    detailTabs.forEach(item => item.classList.remove('selected'));
    tab.classList.add('selected');
    const name = tab.dataset.detailTab;
    const copy = {
      Form: 'Form：猫系 · 决定 PiXO 的本体形态',
      Face: 'Face：好奇 · 决定表情与行为气质',
      Trait: 'Trait：路痴 · 更容易发现隐藏地点',
      Halo: 'Halo：探索环 · 提高发现新地点概率'
    };
    showToast(copy[name]);
  });
});

// PAGE 02 - 携带物品选择，至少保留 1 件
const itemSlots = [...document.querySelectorAll('[data-item]')];
itemSlots.forEach(slot => {
  slot.addEventListener('click', () => {
    const selected = itemSlots.filter(item => item.classList.contains('selected'));
    if (slot.classList.contains('selected') && selected.length === 1) {
      return showToast('至少给 Mochi 带 1 件东西吧');
    }
    slot.classList.toggle('selected');
    const now = itemSlots.filter(item => item.classList.contains('selected')).map(item => item.dataset.item);
    localStorage.setItem('pixo:travel-items', JSON.stringify(now));
    showToast(`已携带：${now.join('、')}`);
  });
});

function restoreDetailItems() {
  try {
    const saved = JSON.parse(localStorage.getItem('pixo:travel-items') || 'null');
    if (!Array.isArray(saved) || saved.length === 0) return;
    itemSlots.forEach(item => item.classList.toggle('selected', saved.includes(item.dataset.item)));
  } catch (_) {}
}
restoreDetailItems();

document.getElementById('previewClose').addEventListener('click', closePreview);
document.getElementById('previewBack').addEventListener('click', closePreview);
preview.addEventListener('click', event => { if (event.target === preview) closePreview(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closePreview(); });

const initialRoute = location.hash.replace('#', '') || 'home';
showPage(implementedPages.has(initialRoute) ? initialRoute : 'home', false);
history.replaceState(null, '', `#${implementedPages.has(initialRoute) ? initialRoute : 'home'}`);
