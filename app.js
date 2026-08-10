const implementedPages = new Set(['home', 'detail', 'travel', 'traveling']);

const routeMeta = {
  collection: ['收藏柜', '第 7 页会在 1～4 页重构完成后继续实现。'],
  shop: ['商店', '第 11 页：旅行用品、Halo、装饰与主题票。'],
  mypixo: ['我的 PiXO', '第 9 页：PiXO 列表、状态、Trait 和当前 Halo。']
};

const pageNotes = {
  home: ['PAGE 01 / HOME', '首页 · HTML 组件化', '场景图只是内容素材；资源条、角色卡、属性、事件、Memory 和功能按钮全部是真实 DOM。'],
  detail: ['PAGE 02 / PIXO DETAIL', 'PiXO 详情 · HTML 组件化', '角色立绘是图片，Form / Face / Trait / Halo、旅行物品、进度和 CTA 都是可交互组件。'],
  travel: ['PAGE 03 / PREPARE TRAVEL', '准备旅行 · HTML 组件化', '目的地、旅行倾向、物品、Halo 和预计结果全部由 HTML/CSS 构成，并保存真实旅行草稿。'],
  traveling: ['PAGE 04 / TRAVELING', '旅行中 · HTML 组件化', '地图只作为内容图片，路线标记、倒计时、消息流、携带物品和推进按钮均为真实组件。']
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
  if (page === 'detail') renderDetailItems();
  if (page === 'travel') renderTravelConfig(false);
  if (page === 'traveling') renderTraveling();
  if (pushHash) history.replaceState(null, '', `#${page}`);
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function openPreview(route) {
  const [title, text] = routeMeta[route] || ['下一页', '该页面还未实现。'];
  previewTitle.textContent = title;
  previewText.textContent = text;
  preview.classList.add('open');
  preview.setAttribute('aria-hidden', 'false');
}

function closePreview() {
  preview.classList.remove('open');
  preview.setAttribute('aria-hidden', 'true');
}

function readJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    return value ?? fallback;
  } catch (_) {
    return fallback;
  }
}

// ---------------- shared navigation ----------------
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
      coin: '金币 12,560 · 用于普通旅行用品与商店内容',
      gem: '钻石 385 · 用于稀有内容与盲盒',
      energy: '体力 28 / 30 · 会随时间恢复',
      activity: '活动入口 · 后续可接季节活动和限定 Halo',
      event: '今日事件：心情很好 · +15 EXP',
      diary: '日志会记录 Mochi 的旅行过程和归来记录',
      'stat-heart': '温柔 86 · 影响互动与部分 Memory 表现',
      'stat-star': '好奇 78 · 影响探索和特殊事件倾向',
      'stat-drop': '治愈 92 · 影响陪伴类事件和状态文案',
      'edit-pixo': '编辑入口：名称、展示偏好等后续接入',
      'detail-form': 'Form：猫系 · 决定本体外形和动作模板',
      'detail-face': 'Face：好奇 · 决定表情和行为气质',
      'detail-trait': 'Trait：路痴 · 更容易发现隐藏地点',
      'detail-halo': 'Halo：探索环 · 提高新地点和特殊路线概率',
      'travel-help': '旅行规则：你负责准备，Mochi 自己决定途中发生什么。',
      destination: '海边小镇 · 海边 / 市集 / 灯塔事件池',
      'empty-slot': '这里还能再带一件东西，之后可以从背包或商店补充。',
      'traveling-camera': '旅行快照：途中照片会在特定事件发生后出现。'
    };
    showToast(messages[action] || action);
  });
});

// ---------------- PAGE 02 / detail ----------------
const detailTabs = [...document.querySelectorAll('[data-detail-tab]')];
const detailDescription = document.getElementById('detailDescription');
const detailItemButtons = [...document.querySelectorAll('[data-item]')];
const detailItemCount = document.getElementById('detailItemCount');

const detailTabCopy = {
  Form: '猫系 Form 决定 Mochi 的基础外形、动作模板以及部分系列收藏归属。',
  Face: '好奇 Face 会影响待机表情、旅行文案和它面对陌生事件时的反应。',
  Trait: '路痴 Trait 会让旅行时间产生波动，但也更容易意外发现隐藏地点。',
  Halo: '探索环会减少重复地点，提高新地点与特殊路线事件的出现概率。'
};

detailTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    detailTabs.forEach(item => item.classList.toggle('selected', item === tab));
    detailDescription.textContent = detailTabCopy[tab.dataset.detailTab];
  });
});

function getSavedDetailItems() {
  const saved = readJson('pixo:travel-items', ['能量饮料', '探险锤', '旅行票']);
  return Array.isArray(saved) && saved.length ? saved : ['能量饮料', '探险锤', '旅行票'];
}

function renderDetailItems() {
  const saved = getSavedDetailItems();
  detailItemButtons.forEach(button => button.classList.toggle('selected', saved.includes(button.dataset.item)));
  detailItemCount.textContent = `${saved.length} / 3`;
}

detailItemButtons.forEach(button => {
  button.addEventListener('click', () => {
    const selected = detailItemButtons.filter(item => item.classList.contains('selected'));
    if (button.classList.contains('selected') && selected.length === 1) return showToast('至少保留 1 件旅行物品');
    button.classList.toggle('selected');
    const now = detailItemButtons.filter(item => item.classList.contains('selected')).map(item => item.dataset.item);
    localStorage.setItem('pixo:travel-items', JSON.stringify(now));
    detailItemCount.textContent = `${now.length} / 3`;
    syncTravelItemsFromDetail(now);
    showToast(`已携带：${now.join('、')}`);
  });
});
renderDetailItems();

// ---------------- PAGE 03 / prepare ----------------
const durationButtons = [...document.querySelectorAll('[data-duration]')];
const travelItemButtons = [...document.querySelectorAll('[data-travel-item]')];
const travelItemCount = document.getElementById('travelItemCount');
const durationHint = document.getElementById('durationHint');
const estimateTime = document.getElementById('estimateTime');
const estimateEvent = document.getElementById('estimateEvent');
const estimateItems = document.getElementById('estimateItems');
const travelDraft = document.getElementById('travelDraft');
let travelDuration = localStorage.getItem('pixo:travel-duration') || 'normal';

const durationMeta = {
  short: { label: '短途', range: '30 分钟～2 小时', minutes: 105, estimate: '约 1小时45分', event: '轻松 · 高频回家' },
  normal: { label: '普通', range: '2～8 小时', minutes: 208, estimate: '约 3小时28分', event: '均衡 · 探索' },
  long: { label: '长途', range: '8～24 小时', minutes: 720, estimate: '约 12小时', event: '远行 · 稀有事件' }
};

function detailToTravelName(name) {
  return name === '探险锤' ? '寻宝工具' : name;
}
function travelToDetailName(name) {
  return name === '寻宝工具' ? '探险锤' : name;
}

function getSelectedTravelItems() {
  return travelItemButtons.filter(item => item.classList.contains('selected')).map(item => item.dataset.travelItem);
}

function syncTravelItemsFromDetail(detailNames) {
  const mapped = detailNames.map(detailToTravelName);
  travelItemButtons.forEach(item => item.classList.toggle('selected', mapped.includes(item.dataset.travelItem)));
  renderTravelConfig(false);
}

function restoreTravelItems() {
  const detailNames = getSavedDetailItems();
  syncTravelItemsFromDetail(detailNames);
}

function renderTravelConfig(showMessage = true) {
  durationButtons.forEach(button => button.classList.toggle('selected', button.dataset.duration === travelDuration));
  const selected = getSelectedTravelItems();
  const meta = durationMeta[travelDuration];
  travelItemCount.textContent = `${selected.length} / 5`;
  durationHint.textContent = meta.range;
  estimateTime.textContent = meta.estimate;
  estimateEvent.textContent = meta.event;
  estimateItems.textContent = `${selected.length} 件`;
  travelDraft.textContent = `海边小镇 · ${meta.label} · ${selected.length} 件物品 · ${meta.range}`;
  localStorage.setItem('pixo:travel-duration', travelDuration);
  if (showMessage) showToast(`${meta.label} · ${meta.range} · ${meta.event}`);
}

durationButtons.forEach(button => {
  button.addEventListener('click', () => {
    travelDuration = button.dataset.duration;
    renderTravelConfig();
  });
});

travelItemButtons.forEach(button => {
  button.addEventListener('click', () => {
    const selected = getSelectedTravelItems();
    if (button.classList.contains('selected') && selected.length === 1) return showToast('至少携带 1 件物品再出发');
    button.classList.toggle('selected');
    const now = getSelectedTravelItems();
    const detailNames = now.map(travelToDetailName);
    localStorage.setItem('pixo:travel-items', JSON.stringify(detailNames));
    detailItemButtons.forEach(item => item.classList.toggle('selected', detailNames.includes(item.dataset.item)));
    detailItemCount.textContent = `${detailNames.length} / 3`;
    renderTravelConfig(false);
    showToast(`本次携带 ${now.length} 件：${now.join('、')}`);
  });
});
restoreTravelItems();
renderTravelConfig(false);

// ---------------- travel state ----------------
function getTravelDraft() {
  return readJson('pixo:travel-draft', {
    destination: '海边小镇',
    duration: 'normal',
    durationLabel: '普通',
    durationRange: '2～8 小时',
    totalMinutes: 208,
    items: ['能量饮料', '寻宝工具', '旅行票'],
    halo: '探索环'
  });
}

function getTravelState() {
  const draft = getTravelDraft();
  return readJson('pixo:travel-state', {
    remainingMinutes: draft.totalMinutes || 208,
    step: 0,
    finished: false,
    createdAt: new Date().toISOString()
  });
}

function saveTravelState(state) {
  localStorage.setItem('pixo:travel-state', JSON.stringify(state));
}

function formatMinutes(total) {
  total = Math.max(0, total);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h <= 0) return `${m}分钟`;
  return `${h}小时${String(m).padStart(2, '0')}分`;
}

document.getElementById('travelStartBtn').addEventListener('click', () => {
  const items = getSelectedTravelItems();
  if (!items.length) return showToast('先给 Mochi 准备至少 1 件东西');
  const meta = durationMeta[travelDuration];
  const draft = {
    destination: '海边小镇',
    duration: travelDuration,
    durationLabel: meta.label,
    durationRange: meta.range,
    totalMinutes: meta.minutes,
    items,
    halo: '探索环',
    createdAt: new Date().toISOString()
  };
  localStorage.setItem('pixo:travel-draft', JSON.stringify(draft));
  saveTravelState({ remainingMinutes: meta.minutes, step: 0, finished: false, createdAt: new Date().toISOString() });
  showToast('行囊准备好了，Mochi 出发！');
  setTimeout(() => showPage('traveling'), 240);
});

// ---------------- PAGE 04 / traveling ----------------
const travelingRemaining = document.getElementById('travelingRemaining');
const travelingDestination = document.getElementById('travelingDestination');
const travelingType = document.getElementById('travelingType');
const travelingHalo = document.getElementById('travelingHalo');
const travelingItemCount = document.getElementById('travelingItemCount');
const travelingKit = document.getElementById('travelingKit');
const travelingLog = document.getElementById('travelingLog');
const travelingSummary = document.getElementById('travelingSummary');
const travelingFastBtn = document.getElementById('travelingFastBtn');

const travelingMessages = [
  ['10:42', 'Mochi 出发了！'],
  ['11:18', '好像搭上了一辆小车…'],
  ['12:05', '在海边要小心浪花呀～'],
  ['13:21', '捡到一个有趣的贝壳，准备带回来！'],
  ['14:06', '它在灯塔下面停了一会儿。'],
  ['15:02', '回程信号出现了，应该快回来了。']
];

const itemEmoji = {
  '能量饮料': '🧃',
  '寻宝工具': '🔨',
  '旅行票': '🎟️'
};

function renderTraveling() {
  const draft = getTravelDraft();
  const state = getTravelState();
  travelingRemaining.textContent = state.finished ? '已到达' : formatMinutes(state.remainingMinutes);
  travelingDestination.textContent = draft.destination || '海边小镇';
  travelingType.textContent = draft.durationLabel || '普通';
  travelingHalo.textContent = draft.halo || '探索环';
  travelingItemCount.textContent = `${(draft.items || []).length} 件`;
  travelingSummary.textContent = `${draft.durationLabel || '普通'} · ${draft.halo || '探索环'} · ${(draft.items || []).length}件物品`;
  travelingKit.innerHTML = (draft.items || []).map(name => `<span>${itemEmoji[name] || '🎒'} ${name}</span>`).join('');

  const visibleCount = Math.min(3 + state.step, travelingMessages.length);
  const rows = travelingMessages.slice(Math.max(0, visibleCount - 4), visibleCount);
  travelingLog.innerHTML = rows.map((row, index) => `
    <div class="traveling-log-row${index === rows.length - 1 && state.step > 0 ? ' new' : ''}">
      <span class="dot"></span><span>${row[0]}</span><span>${row[1]}</span>
    </div>`).join('');

  travelingFastBtn.textContent = state.finished ? '查看旅行归来' : 'Demo · 快速推进 1 小时';
  travelingFastBtn.classList.toggle('done', state.finished);
}

travelingFastBtn.addEventListener('click', () => {
  const state = getTravelState();
  if (state.finished) return;
  state.remainingMinutes = Math.max(0, state.remainingMinutes - 60);
  state.step += 1;
  if (state.remainingMinutes === 0 || state.step >= 4) {
    state.remainingMinutes = 0;
    state.finished = true;
  }
  saveTravelState(state);
  renderTraveling();
  showToast(state.finished ? 'Mochi 回来了！点击查看旅行归来。' : `时间推进 1 小时 · 剩余 ${formatMinutes(state.remainingMinutes)}`);
});

// ---------------- modal / init ----------------
document.getElementById('previewClose').addEventListener('click', closePreview);
document.getElementById('previewBack').addEventListener('click', closePreview);
preview.addEventListener('click', event => { if (event.target === preview) closePreview(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closePreview(); });

const initialRoute = location.hash.replace('#', '') || 'home';
showPage(implementedPages.has(initialRoute) ? initialRoute : 'home', false);
history.replaceState(null, '', `#${implementedPages.has(initialRoute) ? initialRoute : 'home'}`);
