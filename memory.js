const memoryToast = document.getElementById('memoryToast');
const memoryList = document.getElementById('memoryList');
const memoryTotal = document.getElementById('memoryTotal');
const memoryModal = document.getElementById('memoryModal');
const modalImage = document.getElementById('modalImage');
const modalDate = document.getElementById('modalDate');
const modalTitle = document.getElementById('modalTitle');
const modalText = document.getElementById('modalText');
const modalTags = document.getElementById('modalTags');
let toastTimer;
let currentFilter = 'all';

function showToast(message) {
  clearTimeout(toastTimer);
  memoryToast.textContent = message;
  memoryToast.classList.add('show');
  toastTimer = setTimeout(() => memoryToast.classList.remove('show'), 1500);
}

function readJson(key, fallback) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || 'null');
    return data ?? fallback;
  } catch (_) {
    return fallback;
  }
}

function dayText(value) {
  if (!value) return '2026-08-10';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replaceAll('/', '-');
}

const seedMemories = [
  {
    id: 'first-sea',
    type: 'explore',
    title: '第一次看见大海',
    date: '2026-08-10',
    text: 'Mochi 第一次真正走到海岸边。浪花很吵，它却在那里坐了很久。',
    image: './assets/memory/memory-first-sea.webp',
    tags: ['海边', '灯塔', '首次']
  },
  {
    id: 'blue-shell',
    type: 'collect',
    title: '捡到蓝色贝壳',
    date: '2026-08-06',
    text: '它把一枚蓝色贝壳藏进背包最里面，回家后才肯拿出来。',
    image: './assets/memory/memory-shell.webp',
    tags: ['贝壳', '收藏', '海边']
  },
  {
    id: 'meet-pixo',
    type: 'explore',
    title: '遇见陌生 PiXO',
    date: '2026-07-29',
    text: '在一段没有名字的小路旁，Mochi 和另一只 PiXO 一起坐了一会儿。',
    image: './assets/pixo-portrait.svg',
    tags: ['相遇', 'PiXO', '偶然']
  },
  {
    id: 'familiar-sea',
    type: 'explore',
    title: '熟悉的海',
    date: '2026-07-18',
    text: '第三次回到相似的海岸后，它开始会自己跑到灯塔下面等日落。',
    image: './assets/traveling/traveling-map.webp',
    tags: ['重复到访', '灯塔', '成长']
  }
];

function mergeMemoryData() {
  const persisted = readJson('pixo:memories', []);
  const normalized = Array.isArray(persisted) ? persisted.map(item => ({
    id: item.id || `memory-${Date.now()}-${Math.random()}`,
    type: item.type || 'explore',
    title: item.title || '未命名 Memory',
    date: item.date || item.createdAt || new Date().toISOString(),
    text: item.text || '这是一段 Mochi 留下来的经历。',
    image: item.image || './assets/memory/memory-first-sea.webp',
    tags: item.tags || ['旅行']
  })) : [];

  const byId = new Map();
  [...normalized, ...seedMemories].forEach(item => {
    if (!byId.has(item.id)) byId.set(item.id, item);
  });
  return [...byId.values()].sort((a, b) => new Date(b.date) - new Date(a.date));
}

let memories = mergeMemoryData();

function filteredMemories() {
  if (currentFilter === 'all') return memories;
  return memories.filter(item => item.type === currentFilter);
}

function renderMemories() {
  const data = filteredMemories();
  memoryTotal.textContent = memories.length;

  if (!data.length) {
    memoryList.innerHTML = '<div class="empty-state"><b>这里还是空的</b><span>等 Mochi 多出去走走吧。</span></div>';
    return;
  }

  memoryList.innerHTML = data.map(item => `
    <article class="memory-row">
      <span class="memory-dot"></span>
      <button class="memory-card" data-memory-id="${item.id}">
        <img class="memory-thumb" src="${item.image}" alt="${item.title}" />
        <div class="memory-copy">
          <small>${dayText(item.date)}</small>
          <strong>「${item.title}」</strong>
          <p>${item.text}</p>
          <div class="memory-tags">${item.tags.map(tag => `<span>${tag}</span>`).join('')}</div>
        </div>
        <span class="memory-arrow">›</span>
      </button>
    </article>
  `).join('');

  document.querySelectorAll('[data-memory-id]').forEach(button => {
    button.addEventListener('click', () => openMemory(button.dataset.memoryId));
  });
}

function openMemory(id) {
  const item = memories.find(memory => memory.id === id);
  if (!item) return;
  modalImage.src = item.image;
  modalImage.alt = item.title;
  modalDate.textContent = dayText(item.date);
  modalTitle.textContent = `「${item.title}」`;
  modalText.textContent = item.text;
  modalTags.innerHTML = item.tags.map(tag => `<span>${tag}</span>`).join('');
  memoryModal.classList.add('open');
  memoryModal.setAttribute('aria-hidden', 'false');
}

function closeMemory() {
  memoryModal.classList.remove('open');
  memoryModal.setAttribute('aria-hidden', 'true');
}

document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(tab => tab.classList.toggle('active', tab === button));
    renderMemories();
  });
});

document.getElementById('memoryBack').addEventListener('click', () => {
  if (document.referrer.includes('return.html')) location.href = './return.html';
  else location.href = './index.html#home';
});

document.getElementById('memoryInfo').addEventListener('click', () => {
  showToast('Memory 不是等级，而是 Mochi 真正经历过的事情');
});

document.getElementById('modalClose').addEventListener('click', closeMemory);
memoryModal.addEventListener('click', event => { if (event.target === memoryModal) closeMemory(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMemory(); });

renderMemories();
