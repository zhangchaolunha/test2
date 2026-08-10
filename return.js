const toast = document.getElementById('returnToast');
let toastTimer;

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1600);
}

function readJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    return value ?? fallback;
  } catch (_) {
    return fallback;
  }
}

const defaultDraft = {
  destination: '海边小镇',
  duration: 'normal',
  durationLabel: '普通',
  durationRange: '2～8 小时',
  totalMinutes: 208,
  items: ['能量饮料', '寻宝工具', '旅行票'],
  halo: '探索环'
};

const draft = readJson('pixo:travel-draft', defaultDraft);
const state = readJson('pixo:travel-state', { remainingMinutes: 0, step: 4, finished: true });

const lootByDuration = {
  short: { shell: 2, photo: 1, bottle: 0, shard: 2 },
  normal: { shell: 3, photo: 1, bottle: 1, shard: 5 },
  long: { shell: 5, photo: 2, bottle: 1, shard: 8 }
};

const loot = lootByDuration[draft.duration] || lootByDuration.normal;

document.getElementById('returnRouteChip').textContent = `${draft.destination || '海边小镇'} · ${draft.durationLabel || '普通'}旅行`;
document.getElementById('returnDuration').textContent = draft.duration === 'short' ? '1小时45分' : draft.duration === 'long' ? '12小时00分' : '3小时28分';
document.getElementById('returnItems').textContent = `${(draft.items || []).length} 件`;
document.getElementById('returnHalo').textContent = draft.halo || '探索环';
document.getElementById('rewardShellCount').textContent = `×${loot.shell}`;
document.getElementById('rewardPhotoCount').textContent = `×${loot.photo}`;
document.getElementById('rewardBottleCount').textContent = `×${loot.bottle}`;
document.getElementById('rewardShardCount').textContent = `×${loot.shard}`;
document.getElementById('rewardTotal').textContent = `${Object.values(loot).filter(v => v > 0).length} 类`;

const quotes = {
  short: '“只是出去晃了一圈，但我还是偷偷带东西回来了。”',
  normal: '“海风把围巾吹得乱七八糟，不过我找到好东西啦。”',
  long: '“我走了好远好远。回来以后，家里的地毯都变得特别亲切。”'
};
document.getElementById('returnQuote').textContent = quotes[draft.duration] || quotes.normal;

const memory = {
  id: 'first-sea',
  title: '第一次看见大海',
  destination: draft.destination || '海边小镇',
  createdAt: new Date().toISOString(),
  text: 'Mochi 第一次真正走到海岸边。浪花很吵，它却在那里坐了很久。'
};

const lastReturn = {
  destination: draft.destination || '海边小镇',
  duration: draft.duration || 'normal',
  durationLabel: draft.durationLabel || '普通',
  items: draft.items || [],
  halo: draft.halo || '探索环',
  loot,
  memory,
  finishedAt: new Date().toISOString()
};
localStorage.setItem('pixo:last-return', JSON.stringify(lastReturn));

const memories = readJson('pixo:memories', []);
if (!memories.some(item => item.id === memory.id)) {
  memories.unshift(memory);
  localStorage.setItem('pixo:memories', JSON.stringify(memories));
}

document.querySelectorAll('[data-reward]').forEach(button => {
  button.addEventListener('click', () => {
    showToast(`${button.dataset.reward} · 已加入收藏记录`);
  });
});

document.getElementById('memoryUnlock').addEventListener('click', () => {
  showToast('Memory 已保存 · 第 6 页会展示完整时间线');
});

document.getElementById('returnInfo').addEventListener('click', () => {
  showToast('旅行归来会结算收获、Memory 和 PiXO 的细微变化');
});

document.getElementById('returnBack').addEventListener('click', () => {
  location.href = './index.html#traveling';
});

document.getElementById('shareTrip').addEventListener('click', async () => {
  const text = `PiXO · Mochi 从${draft.destination || '海边小镇'}回来了！带回蓝色贝壳×${loot.shell}，并解锁 Memory「第一次看见大海」。`;
  try {
    await navigator.clipboard.writeText(text);
    showToast('旅程文案已经复制');
  } catch (_) {
    showToast(text);
  }
});

document.getElementById('finishReturn').addEventListener('click', () => {
  localStorage.setItem('pixo:travel-state', JSON.stringify({
    remainingMinutes: 0,
    step: 4,
    finished: true,
    acknowledged: true,
    finishedAt: new Date().toISOString()
  }));
  showToast('Mochi 已经回家休息了');
  setTimeout(() => location.href = './index.html#home', 320);
});

if (!state.finished) {
  showToast('这趟旅行还没有真正结束，当前以 Demo 结果预览');
}
