const travelItems = [
  { id: 'snack', icon: '◒', name: '云朵饼干', effect: '短途倾向' },
  { id: 'ticket', icon: '▤', name: '远行票', effect: '远途倾向' },
  { id: 'charm', icon: '✦', name: '旧幸运符', effect: '事件 +10%' },
  { id: 'lamp', icon: '☾', name: '小夜灯', effect: '夜间事件' },
];

const halos = {
  swift: {
    name: '疾行 Halo', short: 'CD -20%', desc: '它会更快回来，但仍然可能因为路痴绕远路。', icon: './assets/halo-swift.svg', factor: .8
  },
  night: {
    name: '夜行 Halo', short: '夜间事件 +20%', desc: '进入夜间事件池，更容易发现只在深夜出现的东西。', icon: './assets/halo-night.svg', factor: 1
  },
  treasure: {
    name: '寻宝 Halo', short: '隐藏物品 +18%', desc: '每次旅行会额外进行一次隐藏物品判定。', icon: './assets/halo-treasure.svg', factor: 1.08
  }
};

const baseMemories = [
  { date: '2026.08.08', title: '末班车没有终点', text: 'NOA 在月湾车站坐到了最后一站，却说那里“比地图多出了一格”。', rare: true },
  { date: '2026.08.04', title: '第一次看见海', text: '它在岸边待了 47 分钟，回来后口袋里全是沙。' },
  { date: '2026.07.29', title: '和陌生 PiXO 共伞', text: '没有交换名字，只交换了一枚被雨打湿的贴纸。' },
  { date: '2026.07.21', title: 'First Connection', text: 'NOA 成为你的第一只 PiXO。' }
];

const baseCollection = [
  { icon: '◈', name: '月湾旧车票', place: '月湾车站', rarity: 'RARE', featured: true },
  { icon: '◌', name: '蓝色海玻璃', place: '北岸', rarity: 'UNCOMMON' },
  { icon: '✦', name: '湿掉的星星贴纸', place: '雨巷', rarity: 'MEMORY' },
  { icon: '⌂', name: '迷你路牌', place: '不明', rarity: 'COMMON' },
  { icon: '◐', name: '半枚代币', place: '旧游戏厅', rarity: 'COMMON' },
  { icon: '☾', name: '凌晨便利店小票', place: '青禾路', rarity: 'ODD' },
  { icon: '≈', name: '一小瓶海风', place: '北岸', rarity: 'ODD' },
  { icon: '▱', name: '无人认领明信片', place: '邮局', rarity: 'COMMON' }
];

const activities = [
  ['正在整理旧明信片', '它把「月湾车站」那张翻出来看了第三遍。', '好奇'],
  ['趴在窗边看云', '已经保持这个姿势 18 分钟，没有要解释的意思。', '放空'],
  ['偷偷翻旅行包', '看起来像是想出门，但又不想让你知道。', '心虚'],
  ['研究自己的 Halo', '转快了会晕，但它显然不准备停。', '专注']
];

const state = {
  selectedItems: [],
  equippedHalo: localStorage.getItem('pixoHalo') || 'swift',
  traveling: false,
  endAt: 0,
  logs: [],
  tripCount: Number(localStorage.getItem('pixoTrips') || 12),
  newMemory: JSON.parse(localStorage.getItem('pixoNewMemory') || 'null'),
  newCollection: JSON.parse(localStorage.getItem('pixoNewCollection') || 'null')
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove('show'), 1800);
}

function go(screen) {
  $$('.screen').forEach(el => el.classList.toggle('active', el.dataset.screen === screen));
  $$('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.go === screen));
  const subtitles = {
    home: '今天也不知道它会跑去哪。', travel: '你负责准备，它负责失联。', memory: '经历比等级更重要。', collection: '每件东西都有来路。', pixo: '同一种 Form，也不是同一只生命。'
  };
  $('#topSubtitle').textContent = subtitles[screen] || subtitles.home;
}

function renderItems() {
  $('#itemGrid').innerHTML = travelItems.map(item => `
    <button class="travel-item ${state.selectedItems.includes(item.id) ? 'selected' : ''}" data-item="${item.id}">
      <span>${item.icon}</span><b>${item.name}</b>
    </button>`).join('');
  $$('[data-item]').forEach(btn => btn.onclick = () => {
    const id = btn.dataset.item;
    if (state.selectedItems.includes(id)) state.selectedItems = state.selectedItems.filter(x => x !== id);
    else if (state.selectedItems.length < 2) state.selectedItems.push(id);
    else return toast('最多准备 2 件东西');
    renderItems();
  });
}

function renderHalo() {
  const halo = halos[state.equippedHalo];
  $('#equippedHaloName').textContent = halo.name;
  $('#equippedHaloBonus').textContent = halo.short;
  $('#travelHaloName').textContent = halo.name;
  $('#travelHaloDesc').textContent = halo.desc;
  $('#travelHaloIcon').src = halo.icon;
  $('#haloPicker').innerHTML = Object.entries(halos).map(([key, h]) => `
    <button class="halo-option ${key === state.equippedHalo ? 'selected' : ''}" data-halo="${key}">
      ${key === state.equippedHalo ? '<i class="check">✓</i>' : ''}
      <img src="${h.icon}" alt="${h.name}" />
      <b>${h.name}</b><span>${h.short}</span>
    </button>`).join('');
  $$('[data-halo]').forEach(btn => btn.onclick = () => {
    state.equippedHalo = btn.dataset.halo;
    localStorage.setItem('pixoHalo', state.equippedHalo);
    renderHalo();
    toast(`已装备 ${halos[state.equippedHalo].name}`);
  });
}

function renderMemory() {
  const list = state.newMemory ? [state.newMemory, ...baseMemories] : baseMemories;
  $('#memoryTimeline').innerHTML = list.map(m => `
    <div class="memory-row ${m.rare ? 'rare' : ''}">
      <span class="date">${m.date}</span><b>${m.title}</b><p>${m.text}</p>
    </div>`).join('');
  $('#memoryCount').textContent = 7 + (state.newMemory ? 1 : 0);
}

function renderCollection() {
  const list = state.newCollection ? [state.newCollection, ...baseCollection] : baseCollection;
  $('#collectionCount').textContent = list.length;
  $('#collectionShelf').innerHTML = list.map((item, idx) => `
    <div class="collect-card ${item.featured || idx === 0 ? 'featured' : ''}">
      <span class="rarity">${item.rarity}</span>
      <div class="collect-art">${item.image ? `<img src="${item.image}" alt="${item.name}" />` : item.icon}</div>
      <small>${item.place}</small><b>${item.name}</b><p>${idx === 0 && state.newCollection ? '刚刚带回' : '旅行纪念物'}</p>
    </div>`).join('');
}

function startTravel() {
  if (state.traveling) return;
  if (state.selectedItems.length === 0) return toast('至少给 NOA 准备 1 件东西');
  const halo = halos[state.equippedHalo];
  const baseSeconds = 95;
  const seconds = Math.max(35, Math.round(baseSeconds * halo.factor - (state.selectedItems.includes('snack') ? 10 : 0)));
  state.traveling = true;
  state.endAt = Date.now() + seconds * 1000;
  state.logs = [{ time: '现在', text: 'NOA 背上旅行包，没回头就出门了。' }];
  $('#startTravelBtn').classList.add('hidden');
  $('#finishTravelBtn').classList.remove('hidden');
  $('#liveLog').classList.remove('hidden');
  $('#homeStatus').innerHTML = '<span class="pulse"></span>旅行中 · 暂时不在家';
  $('#pixoSpeech').textContent = '房间突然安静了。它甚至没告诉你去哪。';
  $('#ctaTitle').textContent = 'NOA 正在外面乱跑';
  $('#ctaDesc').textContent = '偶尔回来看看，它可能会发消息。';
  $('#ctaButton').textContent = '查看旅途';
  toast('NOA 出发了');
  tickTravel();
}

function tickTravel() {
  if (!state.traveling) return;
  const left = Math.max(0, state.endAt - Date.now());
  const sec = Math.ceil(left / 1000);
  $('#travelStateLabel').textContent = sec > 0 ? 'NOA · TRAVELING' : 'RETURNING';
  $('#travelTimer').textContent = `${String(Math.floor(sec / 60)).padStart(2,'0')}:${String(sec % 60).padStart(2,'0')}`;

  const total = 95 * halos[state.equippedHalo].factor;
  const elapsed = Math.max(0, total - sec);
  if (state.logs.length === 1 && elapsed > 12) addTravelLog('刚刚', '它好像坐上了什么东西，信号变得断断续续。');
  if (state.logs.length === 2 && elapsed > 26) addTravelLog('刚刚', state.selectedItems.includes('lamp') ? '小夜灯亮了。附近出现了一个只在夜里开放的站台。' : '它在一块完全没见过的路牌前停了下来。');
  if (state.logs.length === 3 && elapsed > 42) addTravelLog('刚刚', '收到一张模糊照片：风很大，Halo 被吹得歪了一点。');

  renderLogs();
  if (left <= 0) finishTravel();
}

function addTravelLog(time, text) { state.logs.push({ time, text }); }
function renderLogs() {
  $('#logEntries').innerHTML = state.logs.map(l => `<div class="log-entry"><b>${l.text}</b><span>${l.time}</span></div>`).join('');
}

function finishTravel() {
  if (!state.traveling) return;
  state.traveling = false;
  state.tripCount += 1;
  localStorage.setItem('pixoTrips', state.tripCount);

  const hasCharm = state.selectedItems.includes('charm');
  const halo = state.equippedHalo;
  const result = halo === 'night' || state.selectedItems.includes('lamp')
    ? {
      memory: { date: '2026.08.10', title: '凌晨 01:17 的发光站牌', text: 'NOA 说它只是跟着一圈紫色的光走，结果找到了一条白天不存在的小路。', rare: true },
      item: { image: './assets/souvenir-glassstar.svg', name: '夜光玻璃星', place: '不明站台', rarity: 'RARE', featured: true }
    }
    : halo === 'treasure' || hasCharm
    ? {
      memory: { date: '2026.08.10', title: '它坚持说这不是垃圾', text: '从一堆旧东西里翻出一枚发亮的玻璃星，还认真擦了五分钟。', rare: true },
      item: { image: './assets/souvenir-glassstar.svg', name: '旧玻璃星', place: '旧货巷', rarity: 'RARE', featured: true }
    }
    : {
      memory: { date: '2026.08.10', title: '绕远路也算新路', text: 'NOA 又走错了方向，但带回来一张从没见过的街角照片。', rare: false },
      item: { icon: '↝', name: '歪掉的路标片', place: '陌生街角', rarity: 'ODD', featured: true }
    };

  state.newMemory = result.memory;
  state.newCollection = result.item;
  localStorage.setItem('pixoNewMemory', JSON.stringify(state.newMemory));
  localStorage.setItem('pixoNewCollection', JSON.stringify(state.newCollection));
  state.selectedItems = [];

  $('#travelStateLabel').textContent = 'NOA · HOME';
  $('#travelTimer').textContent = '00:00';
  $('#startTravelBtn').classList.remove('hidden');
  $('#finishTravelBtn').classList.add('hidden');
  $('#startTravelBtn').textContent = '再准备一次旅行';
  $('#homeStatus').innerHTML = '<span class="pulse"></span>回家了 · 正在拆包';
  $('#pixoSpeech').textContent = '“我没迷路。只是那条路比较有自己的想法。”';
  $('#ctaTitle').textContent = '它带回了新东西';
  $('#ctaDesc').textContent = 'Memory 和收藏柜已经更新。';
  $('#ctaButton').textContent = '看看结果';
  $('#ctaButton').dataset.go = 'memory';
  $('#tripCount').textContent = state.tripCount;
  renderItems(); renderMemory(); renderCollection();
  go('home');
  toast('NOA 回来了，还带回了东西');
}

function rotateActivity() {
  const item = activities[Math.floor(Date.now()/15000) % activities.length];
  $('#activityTitle').textContent = item[0];
  $('#activityDesc').textContent = item[1];
  $('#activityMood').textContent = item[2];
}

function updateClock() {
  const now = new Date();
  $('#clockText').textContent = now.toLocaleTimeString('zh-CN', { hour:'2-digit', minute:'2-digit', hour12:false });
}

function init() {
  $$('[data-go]').forEach(btn => btn.addEventListener('click', () => go(btn.dataset.go)));
  $('#startTravelBtn').onclick = startTravel;
  $('#finishTravelBtn').onclick = finishTravel;
  $('#soundBtn').onclick = () => toast('Demo 暂未加入声音，先让它安静旅行。');
  renderItems(); renderHalo(); renderMemory(); renderCollection();
  $('#tripCount').textContent = state.tripCount;
  updateClock(); rotateActivity();
  setInterval(updateClock, 1000);
  setInterval(rotateActivity, 15000);
  setInterval(tickTravel, 1000);
}

init();
