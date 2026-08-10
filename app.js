const implementedPages = new Set(['home', 'detail', 'travel', 'traveling']);

const routeMeta = {
  return: ['旅行回来', '第 5 页：Mochi 回家，展示本次收获、照片、纪念品和新解锁的 Memory。'],
  collection: ['收藏柜', '第 7 页：纪念品、照片、明信片、材料与 Halo 收藏。'],
  memory: ['Memory', '第 6 页：时间线、旅行照片、纪念节点和详情。'],
  diary: ['日志', '旅行过程消息与归来记录会在这里呈现。'],
  mypixo: ['我的 PiXO', '第 9 页：PiXO 列表、状态、Trait 和当前 Halo。'],
  shop: ['商店', '第 11 页：旅行用品、Halo、装饰与主题票。']
};

const pageNotes = {
  home: ['PAGE 01 / HOME', '首页 · 像素生活场景', '点击左上 Mochi 资料卡进入第 2 页；也可以直接点击旅行进入第 3 页。'],
  detail: ['PAGE 02 / PIXO DETAIL', 'PiXO 详情 · 个体信息', 'Form / Face / Trait / Halo 可以切换；携带物品可以选择；底部按钮进入第 3 页准备旅行。'],
  travel: ['PAGE 03 / PREPARE TRAVEL', '准备旅行 · 本次行程配置', '切换短途 / 普通 / 长途，选择要携带的物品；点击“出发”后会保存旅行配置并进入第 4 页。'],
  traveling: ['PAGE 04 / TRAVELING', '旅行中 · 等它自己回来', '地图与途中消息会随 Demo 时间推进；连续点击“快速推进 1 小时”，完成旅行后进入第 5 页流程。']
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
  if (page === 'traveling') renderTraveling();
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
      'empty-slot': '这里还能再带一件东西，后续可从背包或商店补充。',
      'traveling-camera': '旅行快照：Mochi 暂时还没把照片发回来。'
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

const detailItemSlots = [...document.querySelectorAll('[data-item]')];
detailItemSlots.forEach(slot => {
  slot.addEventListener('click', () => {
    const selected = detailItemSlots.filter(item => item.classList.contains('selected'));
    if (slot.classList.contains('selected') && selected.length === 1) return showToast('至少给 Mochi 带 1 件东西吧');
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
  short: { label: '短途', time: '30 分钟～2 小时', effect: '更容易快速回来', minutes: 105 },
  normal: { label: '普通', time: '2～8 小时', effect: '事件与收益最均衡', minutes: 208 },
  long: { label: '长途', time: '8～24 小时', effect: '更容易进入远行事件池', minutes: 720 }
};

function detailToTravelName(name) { return name === '探险锤' ? '寻宝工具' : name; }

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
    if (item.classList.contains('selected') && selected.length === 1) return showToast('至少携带 1 件物品再出发');
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

// PAGE 04 - 旅行中
const travelingRemaining = document.getElementById('travelingRemaining');
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

function formatMinutes(total) {
  total = Math.max(0, total);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h > 0 ? `${h}小时${String(m).padStart(2, '0')}分` : `${m}分钟`;
}

function getTravelState() {
  try {
    const saved = JSON.parse(localStorage.getItem('pixo:travel-state') || 'null');
    if (saved && typeof saved.remainingMinutes === 'number') return saved;
  } catch (_) {}
  const draft = getTravelDraft();
  return {
    remainingMinutes: draft.totalMinutes || 208,
    step: 0,
    finished: false,
    createdAt: new Date().toISOString()
  };
}

function getTravelDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem('pixo:travel-draft') || 'null');
    if (draft) return draft;
  } catch (_) {}
  return {
    destination: '海边小镇', duration: 'normal', durationLabel: '普通', durationRange: '2～8 小时',
    totalMinutes: 208, items: ['能量饮料', '寻宝工具', '旅行票'], halo: '探索环'
  };
}

function saveTravelState(state) {
  localStorage.setItem('pixo:travel-state', JSON.stringify(state));
}

function renderTraveling() {
  const draft = getTravelDraft();
  const state = getTravelState();
  travelingRemaining.textContent = state.finished ? '已到达' : formatMinutes(state.remainingMinutes);
  travelingSummary.textContent = `${draft.durationLabel || '普通'} · ${draft.halo || '探索环'} · ${(draft.items || []).length}件物品`;
  const visibleCount = Math.min(4 + state.step, travelingMessages.length);
  const rows = travelingMessages.slice(Math.max(0, visibleCount - 4), visibleCount);
  travelingLog.innerHTML = rows.map((row, index) => `
    <div class="traveling-log-row${index === rows.length - 1 && state.step > 0 ? ' new' : ''}">
      <span class="dot"></span><span>${row[0]}</span><span>${row[1]}</span>
    </div>`).join('');
  travelingFastBtn.textContent = state.finished ? '查看旅行归来' : 'Demo · 快速推进 1 小时';
  travelingFastBtn.classList.toggle('done', state.finished);
}

document.getElementById('travelStartBtn').addEventListener('click', () => {
  const items = getSelectedTravelItems();
  if (!items.length) return showToast('先给 Mochi 准备至少 1 件东西');
  const meta = durationMeta[travelDuration];
  const draft = {
    destination: '海边小镇',
    duration: travelDuration,
    durationLabel: meta.label,
    durationRange: meta.time,
    totalMinutes: meta.minutes,
    items,
    halo: '探索环',
    createdAt: new Date().toISOString()
  };
  localStorage.setItem('pixo:travel-draft', JSON.stringify(draft));
  localStorage.setItem('pixo:travel-state', JSON.stringify({ remainingMinutes: meta.minutes, step: 0, finished: false, createdAt: new Date().toISOString() }));
  showToast('行囊准备好了，Mochi 出发！');
  setTimeout(() => showPage('traveling'), 260);
});

travelingFastBtn.addEventListener('click', () => {
  const state = getTravelState();
  if (state.finished) return openPreview('return');
  state.remainingMinutes = Math.max(0, state.remainingMinutes - 60);
  state.step += 1;
  if (state.remainingMinutes === 0 || state.step >= 4) {
    state.remainingMinutes = 0;
    state.finished = true;
  }
  saveTravelState(state);
  renderTraveling();
  if (state.finished) showToast('Mochi 回来了！');
  else showToast(`时间推进 1 小时 · 剩余 ${formatMinutes(state.remainingMinutes)}`);
});

document.getElementById('previewClose').addEventListener('click', closePreview);
document.getElementById('previewBack').addEventListener('click', closePreview);
preview.addEventListener('click', event => { if (event.target === preview) closePreview(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closePreview(); });

const initialRoute = location.hash.replace('#', '') || 'home';
showPage(implementedPages.has(initialRoute) ? initialRoute : 'home', false);
history.replaceState(null, '', `#${implementedPages.has(initialRoute) ? initialRoute : 'home'}`);
