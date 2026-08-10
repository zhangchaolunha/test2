const routeMeta = {
  travel: ['准备旅行', '下一页会实现旅行方向、携带物品、Halo 影响与出发按钮。'],
  collection: ['收藏柜', '会按第二张总流程中的收藏柜页面继续实现。'],
  memory: ['Memory', '会实现时间线、旅行照片、纪念节点和详情展开。'],
  diary: ['日志', '日志页会承接旅行过程中的途中消息与归来记录。'],
  mypixo: ['我的 PiXO', '会实现 PiXO 列表、状态、Trait 与当前 Halo。'],
  shop: ['商店', '会实现旅行用品、Halo、装饰与主题票等商品。']
};

const toast = document.getElementById('toast');
const preview = document.getElementById('routePreview');
const previewTitle = document.getElementById('previewTitle');
const previewText = document.getElementById('previewText');
const screen = document.getElementById('pixoScreen');
const wave = document.getElementById('tapWave');
let toastTimer;

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1600);
}

function openPreview(route) {
  const [title, text] = routeMeta[route] || ['下一页', '这个页面将在后续步骤实现。'];
  previewTitle.textContent = title;
  previewText.textContent = text;
  preview.classList.add('open');
  preview.setAttribute('aria-hidden', 'false');
  history.replaceState(null, '', `#${route}`);
}

function closePreview() {
  preview.classList.remove('open');
  preview.setAttribute('aria-hidden', 'true');
  history.replaceState(null, '', '#home');
}

function playTapWave(event) {
  const rect = screen.getBoundingClientRect();
  wave.style.left = `${event.clientX - rect.left}px`;
  wave.style.top = `${event.clientY - rect.top}px`;
  wave.classList.remove('show');
  void wave.offsetWidth;
  wave.classList.add('show');
}

screen.addEventListener('pointerdown', playTapWave);

document.querySelectorAll('[data-route]').forEach(button => {
  button.addEventListener('click', () => openPreview(button.dataset.route));
});

document.querySelectorAll('[data-action]').forEach(button => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;
    if (action === 'profile') showToast('Mochi · Lv.12 · 正在休息中');
    if (action === 'coin') showToast('金币 12,560 · 商店与旅行用品使用');
    if (action === 'gem') showToast('钻石 385 · 稀有内容与盲盒使用');
    if (action === 'energy') showToast('体力 28 / 30 · 会随时间恢复');
    if (action === 'activity') showToast('活动入口 · 后续加入季节与限定 Halo');
    if (action === 'event') showToast('今日事件：心情很好 · +15 EXP');
  });
});

document.getElementById('previewClose').addEventListener('click', closePreview);
document.getElementById('previewBack').addEventListener('click', closePreview);
preview.addEventListener('click', event => {
  if (event.target === preview) closePreview();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closePreview();
});

// 刷新时保持首页。后续页面完成后，这里会替换成真正的路由切换。
if (!location.hash) history.replaceState(null, '', '#home');
