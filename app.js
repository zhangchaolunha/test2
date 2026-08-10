const implementedPages = new Set(['home','detail','travel','traveling']);
const routeMeta = {
  collection:['收藏柜','第 7 页：旅行带回来的纪念品、照片、材料和 Halo 会在这里统一管理。'],
  shop:['商店','第 11 页：旅行用品、Halo、装饰与主题票。'],
  mypixo:['我的 PiXO','第 9 页：PiXO 列表、状态、Trait 和当前 Halo。']
};
const pageNotes = {
  home:['PAGE 01 / HOME','首页 · 真切图版','Logo、资源条、头像、礼物、主场景、右侧按钮、属性图标、事件、Memory 和底部入口全部来自 ImageGen 页面素材切片。'],
  detail:['PAGE 02 / PIXO DETAIL','PiXO 详情 · 真切图版','主视觉、Trait 区、旅行物品和 CTA 使用实际图片资源，HTML 只负责布局与点击状态。'],
  travel:['PAGE 03 / PREPARE TRAVEL','准备旅行 · 真切图版','目的地、物品卡和出发按钮全部从准备旅行大图中裁切，旅行倾向与状态由 HTML/JS 控制。'],
  traveling:['PAGE 04 / TRAVELING','旅行中 · 真切图版','地图、顶部按钮和操作按钮使用实际切图，消息、倒计时和旅行数据由 JS 实时渲染。']
};

const toast=document.getElementById('toast');
const preview=document.getElementById('routePreview');
const previewTitle=document.getElementById('previewTitle');
const previewText=document.getElementById('previewText');
const buildPage=document.getElementById('buildPage');
const buildTitle=document.getElementById('buildTitle');
const buildText=document.getElementById('buildText');
let toastTimer;

function showToast(message){clearTimeout(toastTimer);toast.textContent=message;toast.classList.add('show');toastTimer=setTimeout(()=>toast.classList.remove('show'),1500)}
function readJson(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v??fallback}catch(_){return fallback}}
function setBuildNote(page){const note=pageNotes[page]||pageNotes.home;buildPage.textContent=note[0];buildTitle.textContent=note[1];buildText.textContent=note[2]}
function showPage(page,pushHash=true){if(!implementedPages.has(page))return openPreview(page);document.querySelectorAll('.page-view').forEach(v=>v.hidden=v.dataset.page!==page);setBuildNote(page);if(page==='detail')renderDetailItems();if(page==='travel')renderTravelConfig(false);if(page==='traveling')renderTraveling();if(pushHash)history.replaceState(null,'',`#${page}`);scrollTo({top:0,behavior:'instant'})}
function openPreview(route){const [title,text]=routeMeta[route]||['下一页','该页面还未实现。'];previewTitle.textContent=title;previewText.textContent=text;preview.classList.add('open');preview.setAttribute('aria-hidden','false')}
function closePreview(){preview.classList.remove('open');preview.setAttribute('aria-hidden','true')}

// ---------- Runtime image cutting ----------
// 大图只作为素材源。这里通过 canvas 真正裁出按钮/图标/图片局部，页面从不显示整张大图。
const imageCache=new Map();
function loadImage(src){if(imageCache.has(src))return imageCache.get(src);const promise=new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src});imageCache.set(src,promise);return promise}
async function renderSliceCanvas(canvas){
  if(canvas.dataset.rendered==='1')return;
  const img=await loadImage(canvas.dataset.src);
  const x=Number(canvas.dataset.x||0),y=Number(canvas.dataset.y||0),w=Number(canvas.dataset.w||1),h=Number(canvas.dataset.h||1);
  const sx=Math.round(img.naturalWidth*x),sy=Math.round(img.naturalHeight*y),sw=Math.max(1,Math.round(img.naturalWidth*w)),sh=Math.max(1,Math.round(img.naturalHeight*h));
  canvas.width=sw;canvas.height=sh;canvas.getContext('2d').drawImage(img,sx,sy,sw,sh,0,0,sw,sh);canvas.dataset.rendered='1';
}
function renderSliceCanvases(root=document){root.querySelectorAll('canvas.slice-canvas').forEach(c=>renderSliceCanvas(c).catch(()=>{}))}
renderSliceCanvases();

// ---------- Shared navigation/actions ----------
document.addEventListener('click',event=>{
  const route=event.target.closest('[data-route]');
  if(route){event.preventDefault();const page=route.dataset.route;implementedPages.has(page)?showPage(page):openPreview(page);return}
  const action=event.target.closest('[data-action]');
  if(!action)return;
  const messages={
    coin:'金币 12,560 · 用于普通旅行用品与商店内容',gem:'钻石 385 · 用于稀有内容与盲盒',energy:'体力 28 / 30 · 会随时间恢复',activity:'活动入口 · 后续可接季节活动和限定 Halo',event:'今日事件：心情很好 · +15 EXP',diary:'日志会记录 Mochi 的旅行过程和归来记录','stat-heart':'温柔 86 · 影响互动与部分 Memory 表现','stat-star':'好奇 78 · 影响探索和特殊事件倾向','stat-drop':'治愈 92 · 影响陪伴类事件和状态文案','edit-pixo':'编辑入口：名称、展示偏好等后续接入','travel-help':'旅行规则：你负责准备，Mochi 自己决定途中发生什么。',destination:'海边小镇 · 海边 / 市集 / 灯塔事件池','empty-slot':'这里还能再放一件旅行物品。','traveling-camera':'旅行快照会在特殊事件发生后出现。',boost:'使用 1 点能量，加速旅行 1 小时。'};
  if(action.dataset.action==='boost'){advanceTravel(60,true);return}
  showToast(messages[action.dataset.action]||action.dataset.action)
});

// ---------- PAGE 02 ----------
const detailTabs=[...document.querySelectorAll('[data-detail-tab]')];
const detailDescription=document.getElementById('detailDescription');
const detailItemButtons=[...document.querySelectorAll('[data-item]')];
const detailItemCount=document.getElementById('detailItemCount');
const detailCopy={Form:'猫系 Form 决定 Mochi 的基础外形、动作模板以及系列收藏归属。',Face:'好奇 Face 会影响待机表情、旅行文案和面对陌生事件时的反应。',Trait:'路痴 Trait 会让旅行时间产生波动，但更容易意外发现隐藏地点。',Halo:'探索环会减少重复地点，提高新地点与特殊路线事件的出现概率。'};
detailTabs.forEach(tab=>tab.addEventListener('click',()=>{const name=tab.dataset.detailTab;detailTabs.forEach(t=>t.classList.toggle('selected',t.dataset.detailTab===name));detailDescription.textContent=detailCopy[name]}));
function getSavedDetailItems(){const saved=readJson('pixo:travel-items',['能量饮料','探险锤','旅行票']);return Array.isArray(saved)&&saved.length?saved:['能量饮料','探险锤','旅行票']}
function renderDetailItems(){const saved=getSavedDetailItems();detailItemButtons.forEach(btn=>btn.classList.toggle('selected',saved.includes(btn.dataset.item)));detailItemCount.textContent=`${saved.length} / 3`}
detailItemButtons.forEach(btn=>btn.addEventListener('click',()=>{const selected=detailItemButtons.filter(x=>x.classList.contains('selected'));if(btn.classList.contains('selected')&&selected.length===1)return showToast('至少保留 1 件旅行物品');btn.classList.toggle('selected');const now=detailItemButtons.filter(x=>x.classList.contains('selected')).map(x=>x.dataset.item);localStorage.setItem('pixo:travel-items',JSON.stringify(now));detailItemCount.textContent=`${now.length} / 3`;syncTravelItemsFromDetail(now);showToast(`已携带：${now.join('、')}`)}));
renderDetailItems();

// ---------- PAGE 03 ----------
const durationButtons=[...document.querySelectorAll('[data-duration]')];
const travelItemButtons=[...document.querySelectorAll('[data-travel-item]')];
const travelItemCount=document.getElementById('travelItemCount');
const durationHint=document.getElementById('durationHint');
const estimateTime=document.getElementById('estimateTime');
const estimateEvent=document.getElementById('estimateEvent');
const estimateItems=document.getElementById('estimateItems');
const travelDraft=document.getElementById('travelDraft');
let travelDuration=localStorage.getItem('pixo:travel-duration')||'normal';
const durationMeta={short:{label:'短途',range:'30 分钟～2 小时',minutes:105,estimate:'约 1小时45分',event:'轻松 · 高频回家'},normal:{label:'普通',range:'2～8 小时',minutes:208,estimate:'约 3小时28分',event:'均衡 · 探索'},long:{label:'长途',range:'8～24 小时',minutes:720,estimate:'约 12小时',event:'远行 · 稀有事件'}};
function detailToTravelName(name){return name==='探险锤'?'寻宝工具':name}function travelToDetailName(name){return name==='寻宝工具'?'探险锤':name}
function getSelectedTravelItems(){return travelItemButtons.filter(x=>x.classList.contains('selected')).map(x=>x.dataset.travelItem)}
function syncTravelItemsFromDetail(detailNames){const mapped=detailNames.map(detailToTravelName);travelItemButtons.forEach(x=>x.classList.toggle('selected',mapped.includes(x.dataset.travelItem)));renderTravelConfig(false)}
function renderTravelConfig(showMessage=true){durationButtons.forEach(b=>b.classList.toggle('selected',b.dataset.duration===travelDuration));const items=getSelectedTravelItems();const meta=durationMeta[travelDuration];travelItemCount.textContent=`${items.length} / 5`;durationHint.textContent=meta.range;estimateTime.textContent=meta.estimate;estimateEvent.textContent=meta.event;estimateItems.textContent=`${items.length} 件`;travelDraft.textContent=`海边小镇 · ${meta.label} · ${items.length} 件物品 · ${meta.range}`;localStorage.setItem('pixo:travel-duration',travelDuration);if(showMessage)showToast(`${meta.label} · ${meta.range} · ${meta.event}`)}
durationButtons.forEach(b=>b.addEventListener('click',()=>{travelDuration=b.dataset.duration;renderTravelConfig()}));
travelItemButtons.forEach(btn=>btn.addEventListener('click',()=>{const selected=getSelectedTravelItems();if(btn.classList.contains('selected')&&selected.length===1)return showToast('至少携带 1 件物品再出发');btn.classList.toggle('selected');const now=getSelectedTravelItems();const detailNames=now.map(travelToDetailName);localStorage.setItem('pixo:travel-items',JSON.stringify(detailNames));detailItemButtons.forEach(x=>x.classList.toggle('selected',detailNames.includes(x.dataset.item)));detailItemCount.textContent=`${detailNames.length} / 3`;renderTravelConfig(false);showToast(`本次携带 ${now.length} 件：${now.join('、')}`)}));
syncTravelItemsFromDetail(getSavedDetailItems());renderTravelConfig(false);

function getTravelDraft(){return readJson('pixo:travel-draft',{destination:'海边小镇',duration:'normal',durationLabel:'普通',durationRange:'2～8 小时',totalMinutes:208,items:['能量饮料','寻宝工具','旅行票'],halo:'探索环'})}
function getTravelState(){const d=getTravelDraft();return readJson('pixo:travel-state',{remainingMinutes:d.totalMinutes||208,step:0,finished:false,createdAt:new Date().toISOString()})}
function saveTravelState(state){localStorage.setItem('pixo:travel-state',JSON.stringify(state))}
function formatMinutes(total){total=Math.max(0,total);const h=Math.floor(total/60),m=total%60;return h?`${h}小时${String(m).padStart(2,'0')}分`:`${m}分钟`}
document.getElementById('travelStartBtn').addEventListener('click',()=>{const items=getSelectedTravelItems();if(!items.length)return showToast('先给 Mochi 准备至少 1 件东西');const meta=durationMeta[travelDuration];const draft={destination:'海边小镇',duration:travelDuration,durationLabel:meta.label,durationRange:meta.range,totalMinutes:meta.minutes,items,halo:'探索环',createdAt:new Date().toISOString()};localStorage.setItem('pixo:travel-draft',JSON.stringify(draft));saveTravelState({remainingMinutes:meta.minutes,step:0,finished:false,createdAt:new Date().toISOString()});showToast('行囊准备好了，Mochi 出发！');setTimeout(()=>showPage('traveling'),220)});

// ---------- PAGE 04 ----------
const travelingRemaining=document.getElementById('travelingRemaining');
const travelingDestination=document.getElementById('travelingDestination');
const travelingType=document.getElementById('travelingType');
const travelingHalo=document.getElementById('travelingHalo');
const travelingItemCount=document.getElementById('travelingItemCount');
const travelingKit=document.getElementById('travelingKit');
const travelingLog=document.getElementById('travelingLog');
const travelingSummary=document.getElementById('travelingSummary');
const travelingFastBtn=document.getElementById('travelingFastBtn');
const travelingMessages=[['10:42','Mochi 出发了！'],['11:18','在海边遇到了一只小海龟！'],['12:05','找到一个彩色的贝壳海滩！'],['13:20','正在探索灯塔附近…'],['14:06','在灯塔下面停了一会儿。'],['15:02','回程信号出现了，应该快回来了。']];
const kitSlices={
  '能量饮料':{x:.071,y:.461,w:.174,h:.131},
  '寻宝工具':{x:.257,y:.461,w:.174,h:.131},
  '旅行票':{x:.446,y:.461,w:.174,h:.131}
};
function renderTraveling(){const draft=getTravelDraft(),state=getTravelState();travelingRemaining.textContent=state.finished?'已到达':formatMinutes(state.remainingMinutes);travelingDestination.textContent=draft.destination||'海边小镇';travelingType.textContent=draft.durationLabel||'普通';travelingHalo.textContent=draft.halo||'探索环';travelingItemCount.textContent=`${(draft.items||[]).length} 件`;travelingSummary.textContent=`${draft.durationLabel||'普通'} · ${draft.halo||'探索环'} · ${(draft.items||[]).length}件物品`;travelingKit.innerHTML=(draft.items||[]).map(name=>{const s=kitSlices[name]||kitSlices['旅行票'];return `<div class="trip-cut-item"><canvas class="slice-canvas" data-src="./assets/travel/prepare-page.webp" data-x="${s.x}" data-y="${s.y}" data-w="${s.w}" data-h="${s.h}"></canvas></div>`}).join('');renderSliceCanvases(travelingKit);const visible=Math.min(4+state.step,travelingMessages.length);const rows=travelingMessages.slice(Math.max(0,visible-4),visible);travelingLog.innerHTML=rows.map((r,i)=>`<div class="traveling-log-row${i===rows.length-1&&state.step>0?' new':''}"><time>${r[0]}</time><span>${r[1]}</span></div>`).join('');travelingFastBtn.title=state.finished?'查看旅行归来':'Demo：快速推进 1 小时';travelingFastBtn.classList.toggle('done',state.finished)}
function advanceTravel(minutes=60,boost=false){const state=getTravelState();if(state.finished){location.href='./return.html';return}state.remainingMinutes=Math.max(0,state.remainingMinutes-minutes);state.step+=1;if(state.remainingMinutes===0||state.step>=4){state.remainingMinutes=0;state.finished=true}saveTravelState(state);renderTraveling();showToast(state.finished?'Mochi 回来了！':`${boost?'加速成功':'时间推进'} · 剩余 ${formatMinutes(state.remainingMinutes)}`)}
travelingFastBtn.addEventListener('click',()=>advanceTravel(60,false));

// ---------- Overlay ----------
document.getElementById('previewClose').addEventListener('click',closePreview);document.getElementById('previewBack').addEventListener('click',closePreview);preview.addEventListener('click',e=>{if(e.target===preview)closePreview()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closePreview()});
const initial=location.hash.replace('#','')||'home';showPage(implementedPages.has(initial)?initial:'home',false);history.replaceState(null,'',`#${implementedPages.has(initial)?initial:'home'}`);
