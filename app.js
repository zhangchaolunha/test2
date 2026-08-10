const implementedPages = new Set(['home', 'detail', 'travel']);

const routeMeta = {
  traveling: ['旅行中', '第 4 页：Mochi 已经出发，展示旅行路线、剩余时间和途中消息。'],
  collection: ['收藏柜', '第 7 页：纪念品、照片、明信片、材料与 Halo 收藏。'],
  memory: ['Memory', '第 6 页：时间线、旅行照片、纪念节点和详情。'],
  diary: ['日志', '旅行过程消息与归来记录会在这里呈现。'],
  mypixo: ['我的 PiXO', '第 9 页：PiXO 列表、状态、Trait 和当前 Halo。'],
  shop: ['商店', '第 11 页：旅行用品、Halo、装饰与主题票。']
};

const pageNotes = {
  home: ['PAGE 01 / HOME', '首页 · 像素生活场景', '点击左上 Mochi 资料卡进入第 2 页；也可以直接点击旅行进入第 3 页。'],
  detail: ['PAGE 02 / PIXO DETAIL', 'PiXO 详情 · 个体信息', 'Form / Face / Trait / Halo 可以切换；携带物品可以选择；底部按钮进入第 3 页准备旅行。'],
  travel: ['PAGE 03 / PREPARE TRAVEL', '准备旅行 · 本次行程配置', '切换短途 / 普通 / 长途，选择要携带的物品；点击“出发”后会保存旅行配置并进入第 4 页流程。']
};

const toast = document.getElementById('toast');
const preview = document.getElementById('routePreview');
const previewTitle = document.getElementById('previewTitle');
const previewText = document.getElementById('previewText');
const buildPage = document.getElementById('buildPage');
const buildTitle = document.getElementById('buildTitle');
const buildText = document.getElementById('buildText');
let toastTimer;
let draftTimer;
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
  if (!wave) return;
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
      'edit-pixo': '编辑功能：名称、展示偏好等后续接入',
      'travel-help': '旅行规则：你负责准备，Mochi 自己决定途中会发生什么。',
      destination: '海边小镇 · 海边 / 市集 / 灯塔事件池',
      'empty-slot': '这里还能再带一件东西，后续可从背包或商店补充。'
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
const detailItemSlots = [...document.querySelectorAll('[data-item]')];
detailItemSlots.forEach(slot => {
  slot.addEventListener('click', () => {
    const selected = detailItemSlots.filter(item => item.classList.contains('selected'));
    if (slot.classList.contains('selected') && selected.length === 1) {
      return showToast('至少给 Mochi 带 1 件东西吧');
    }
    slot.classList.toggle('selected');
    const now = detailItemSlots.filter(item => item.classList.contains('selected')).map(item => item.dataset.item);
    localStorage.setItem('pixo:travel-items', JSON.stringify(now));
    syncTravelItemsFromDetail(now);
    showToast(`已携带：${now.join('、')}`);
  });
});

function restoreDetailItems() {
  try {
    const saved = JSON.parse(localStorage.getItem('pixo:travel-items') || 'null');
    if (!Array.isArray(saved) || saved.length === 0) return;
    detailItemSlots.forEach(item => item.classList.toggle('selected', saved.includes(item.dataset.item)));
  } catch (_) {}
}
restoreDetailItems();

// PAGE 03 - 准备旅行
const durationButtons = [...document.querySelectorAll('[data-duration]')];
const travelItems = [...document.querySelectorAll('[data-travel-item]')];
const travelItemCount = document.getElementById('travelItemCount');
const travelDraft = document.getElementById('travelDraft');
let travelDuration = localStorage.getItem('pixo:travel-duration') || 'normal';

const durationMeta = {
  short: { label: '短途', time: '30 分钟～2 小时', effect: '更容易快速回来' },
  normal: { label: '普通', time: '2～8 小时', effect: '事件与收益最均衡' },
  long: { label: '长途', time: '8～24 小时', effect: '更容易进入远行事件池' }
};

function detailToTravelName(name) {
  if (name === '探险锤') return '寻宝工具';
  return name;
}

function syncTravelItemsFromDetail(detailNames) {
  const mapped = detailNames.map(detailToTravelName);
  travelItems.forEach(item => item.classList.toggle('selected', mapped.includes(item.dataset.travelItem)));
  updateTravelSummary(false);
}

function restoreTravelItems() {
  try {
    const saved = JSON.parse(localStorage.getItem('pixo:travel-items') || 'null');
    if (Array.isArray(saved) && saved.length) syncTravelItemsFromDetail(saved);
  } catch (_) {}
}

function getSelectedTravelItems() {
  return travelItems.filter(item => item.classList.contains('selected')).map(item => item.dataset.travelItem);
}

function updateTravelSummary(animate = true) {
  const selected = getSelectedTravelItems();
  travelItemCount.textContent = `携带物品（${selected.length}/5）`;
  const meta = durationMeta[travelDuration];
  travelDraft.textContent = `海边小镇 · ${meta.label} · ${selected.length} 件物品 · ${meta.time}`;
  if (animate) {
    clearTimeout(draftTimer);
    travelDraft.classList.add('show');
    draftTimer = setTimeout(() => travelDraft.classList.remove('show'), 1300);
  }
}

function applyDuration() {
  durationButtons.forEach(button => button.classList.toggle('selected', button.dataset.duration === travelDuration));
  localStorage.setItem('pixo:travel-duration', travelDuration);
  updateTravelSummary();
}

durationButtons.forEach(button => {
  button.addEventListener('click', () => {
    travelDuration = button.dataset.duration;
    applyDuration();
    const meta = durationMeta[travelDuration];
    showToast(`${meta.label} · ${meta.time} · ${meta.effect}`);
  });
});

travelItems.forEach(item => {
  item.addEventListener('click', () => {
    const selected = getSelectedTravelItems();
    if (item.classList.contains('selected') && selected.length === 1) {
      return showToast('至少携带 1 件物品再出发');
    }
    item.classList.toggle('selected');
    const now = getSelectedTravelItems();
    const detailNames = now.map(name => name === '寻宝工具' ? '探险锤' : name);
    localStorage.setItem('pixo:travel-items', JSON.stringify(detailNames));
    detailItemSlots.forEach(slot => slot.classList.toggle('selected', detailNames.includes(slot.dataset.item)));
    updateTravelSummary();
    showToast(`本次携带 ${now.length} 件：${now.join('、')}`);
  });
});

restoreTravelItems();
durationButtons.forEach(button => button.classList.toggle('selected', button.dataset.duration === travelDuration));
updateTravelSummary(false);

document.getElementById('travelStartBtn').addEventListener('click', () => {
  const items = getSelectedTravelItems();
  if (!items.length) return showToast('先给 Mochi 准备至少 1 件东西');
  const meta = durationMeta[travelDuration];
  const draft = {
    destination: '海边小镇',
    duration: travelDuration,
    durationLabel: meta.label,
    durationRange: meta.time,
    items,
    halo: '探索环',
    createdAt: new Date().toISOString()
  };
  localStorage.setItem('pixo:travel-draft', JSON.stringify(draft));
  showToast('行囊准备好了，Mochi 要出发了！');
  setTimeout(() => openPreview('traveling'), 450);
});

document.getElementById('previewClose').addEventListener('click', closePreview);
document.getElementById('previewBack').addEventListener('click', closePreview);
preview.addEventListener('click', event => { if (event.target === preview) closePreview(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closePreview(); });

const initialRoute = location.hash.replace('#', '') || 'home';
showPage(implementedPages.has(initialRoute) ? initialRoute : 'home', false);
history.replaceState(null, '', `#${implementedPages.has(initialRoute) ? initialRoute : 'home'}`);
