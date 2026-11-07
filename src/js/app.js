const navItems=[['overview','radar','综合态势'],['routes','route','线路监管'],['fleet','bus','车辆追踪'],['events','alert','事件中心']];
const sceneNames={overview:'全域交通态势',routes:'线路运行监测',fleet:'车辆行驶轨迹',events:'交通事件定位'};
const layerLabels={places:'监管点位',cars:'车辆与船舶',roads:'交通线路',buildings:'立体建筑'};
function updateChrome(){
  byId('app').classList.toggle('tracking-fleet',state.mode==='fleet');
  byId('nav').innerHTML=navItems.map(([id,icon,label])=>'<button class="navbtn '+(state.mode===id?'active':'')+'" aria-pressed="'+(state.mode===id)+'" data-mode="'+id+'">'+ico(icon)+label+'</button>').join('');
  byId('map-title').textContent=sceneNames[state.mode];
  document.querySelector('.legend').innerHTML=state.mode==='routes'?'<span><i class="key" style="background:'+lines[state.line].color+'"></i>'+lines[state.line].name+'</span><span>'+lines[state.line].stops.length+' 站</span>':'<span><i class="key mint"></i>畅通</span><span><i class="key amber"></i>缓行</span><span><i class="key blue dashed"></i>航线</span>';
  if(state.mode==='fleet')document.querySelector('.legend').innerHTML='<span><i class="key mint"></i>已行轨迹</span><span><i class="key blue dashed"></i>待行路线</span>';
  byId('tour').innerHTML=ico(state.tour?'pause':'play')+(state.tour?'停止巡航':'全岛巡航');
  byId('tour').setAttribute('aria-pressed',String(state.tour));
  document.querySelector('[data-action="view3"]').setAttribute('aria-pressed',String(state.view3));
  document.querySelector('[data-action="view2"]').setAttribute('aria-pressed',String(!state.view3));
}
function toast(message){clearTimeout(toastTimer);byId('toast').textContent=message;byId('toast').classList.add('show');toastTimer=setTimeout(()=>byId('toast').classList.remove('show'),2100)}
function resetSelection(){state.place=null;state.event=null;state.bus=null;state.follow=false;byId('detail').hidden=true}
function updatePanels(){
  if(state.mode==='fleet'){renderFleetScreen();return}
  renderPanels(state.mode,state.period,state.line,handled);
  if(state.mode==='routes')byId('right').innerHTML=renderFleetRoster(runs.filter(v=>v.line===state.line),currentSample,null)+trafficEventsPanel(handled);
}
function modeChange(mode){
  if(mode==='fleet'){pickBus((fleetVehicle()||runs.find(v=>v.line===state.line)).id);return}
  stopTour();resetSelection();state.mode=mode;home();
  if(mode==='routes'){state.layers.roads=true;state.layers.cars=true;state.layers.places=true}
  if(mode==='events'){const first=events.find(e=>!handled.has(e.id))||events[0];openEvent(first.id)}
  updateChrome();updatePanels();renderMapLayers();closeLayers();
}
function closeDetail(){if(state.mode==='fleet'){modeChange('overview');return}stopTour();resetSelection();home();renderMapLayers()}
function metrics(data){return '<div class="detail-stats">'+data.map(([label,n,unit])=>'<div><small>'+label+'</small><b>'+n+'</b><em>'+unit+'</em></div>').join('')+'</div>'}
function detailHeader(title,tag){return '<div class="detail-head"><div><div class="detail-kind">'+tag+'</div><h3>'+title+'</h3></div><button class="icbtn" data-action="closeDetail" aria-label="关闭详情">'+ico('close')+'</button></div>'}
function locationDetail(p){
  const event=events.find(e=>e.id===state.event),detail=byId('detail');
  let html=detailHeader(event?event.name:p.name,event?event.id+' / '+event.level:p.tag+' / '+p.sub);
  if(event){
    html+='<div class="detail-state '+(handled.has(event.id)?'':'amber-t')+'">'+ico('pin')+p.name+' · '+event.time+'</div><p class="detail-note">'+event.detail+'</p>'+metrics(p.metrics);
    html+='<div class="detail-act"><small>'+event.id+'</small>'+(handled.has(event.id)?'<span class="tag-static">'+ico('check')+' 已处置</span>':'<button data-action="resolve">标记已处置</button>')+'</div>';
  }else{
    html+='<div class="detail-state" style="color:'+palette[p.id]+'"><i class="live-dot" style="background:currentColor"></i>'+p.status+'</div>'+metrics(p.metrics);
    html+='<div class="detail-act"><small>监测点 '+String(places.indexOf(p)+1).padStart(2,'0')+' / '+String(places.length).padStart(2,'0')+'</small><button data-action="'+(state.tour?'nextTour':'street')+'">'+(state.tour?'下一站 →':'近景巡检')+'</button></div>';
  }
  detail.innerHTML=html;detail.hidden=false;
}
function selectPlace(id,tour=false){
  const p=places.find(v=>v.id===id);if(!p)return;if(state.mode==='fleet')modeChange('overview');if(!tour)stopTour();resetSelection();state.place=id;state.layers.places=true;
  closeLayers();pointCamera(id,tour);locationDetail(p);renderMapLayers();scrollMapOnMobile();
}
function openEvent(id){
  const e=events.find(v=>v.id===id);if(!e)return;
  stopTour();resetSelection();state.event=id;state.place=e.place;state.layers.places=true;closeLayers();pointCamera(e.place,true);locationDetail(places.find(p=>p.id===e.place));renderMapLayers();scrollMapOnMobile();
}
function scrollMapOnMobile(){if(window.innerWidth<=900&&byId('viewport').getBoundingClientRect().bottom<100)document.querySelector('.map-area').scrollIntoView({block:'start',behavior:motionReduced?'instant':'smooth'})}
function stopTour(){if(!state.tour)return;state.tour=false;clearTimeout(tourTimer);updateChrome();if(state.place&&!state.event)locationDetail(places.find(p=>p.id===state.place))}
function stepTour(){
  clearTimeout(tourTimer);if(!state.tour)return;
  if(state.tourStep===tourOrder.length){stopTour();resetSelection();home();renderMapLayers();toast('全岛巡航完成');return}
  selectPlace(tourOrder[state.tourStep++],true);tourStart=performance.now();tourYaw=target.angle;tourTimer=setTimeout(stepTour,6800);
}
function toggleTour(){
  if(state.tour){closeDetail();return}
  if(state.mode!=='overview')modeChange('overview');
  state.tour=true;state.tourStep=0;state.view3=true;updateChrome();stepTour();
}
function closeLayers(){byId('layer-pop').hidden=true;document.querySelector('[data-action="layers"]').setAttribute('aria-expanded','false')}
function toggleLayers(){
  const pop=byId('layer-pop');if(!pop.hidden){closeLayers();return}
  pop.innerHTML='<h3>地图图层</h3>'+Object.entries(layerLabels).map(([id,label])=>'<label>'+label+'<input type="checkbox" data-layer="'+id+'" '+(state.layers[id]?'checked':'')+'></label>').join('');
  pop.hidden=false;document.querySelector('[data-action="layers"]').setAttribute('aria-expanded','true');
}
function setLine(i){if(i<0||i>=lines.length)return;modeChange('routes');state.line=i;target.z=1.28;if(i===1){target.x=320;target.y=388;target.z=1.46}else if(i===2){target.x=580;target.y=375;target.z=1.54}renderMapLayers();updatePanels();updateChrome();scrollMapOnMobile()}
function viewToggle(three){
  stopTour();state.view3=three;
  target.tilt=three?(state.place?.64:.86):1;target.angle=three&&state.place?-12:0;dirty=true;updateChrome();
}
async function toggleFullscreen(){
  try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else toast('此浏览器使用系统全屏控制')}catch{toast('请从浏览器菜单进入全屏')}
}
function onAction(a, d = {}){
  switch(a){
    case 'setDateMode': if(d.date) setDateMode(d.date); break;
    case 'setTimeline': setTimelineMode(d.time); break;
    case 'openOrder': openOrderModal(Number(d.queueIdx || 0)); break;
    case 'openIncident': openIncidentModal(d.incId); break;
    case 'setOrderTrend': setOrderTrendPeriod(d.trendPeriod); break;
    case 'setVehPage': setVehCarouselPage(Number(d.page || 0)); break;
    case 'closeModal': closeModal(); break;
    case 'closeOrderModal': closeModal('order'); break;
    case 'closeIncidentModal': closeModal('incident'); break;
    case 'resolveIncident': resolveIncident(d.incId); break;
    case 'fullscreen':toggleFullscreen();break;
    case 'events':modeChange('events');break;
    case 'openFleet':modeChange('fleet');break;
    case 'busFollow':toggleBusFollow();break;
    case 'pauseFleet':playback.paused=!playback.paused;syncFleetReadouts();break;
    case 'speed':playback.rate=({1:10,10:30,30:1})[playback.rate];document.querySelector('[data-action="speed"]').textContent=playback.rate+'×';break;
    case 'period':state.period=state.period==='今日'?'昨日':'今日';updatePanels();break;
    case 'layers':toggleLayers();break;
    case 'zoomIn':case 'zoomOut':stopTour();target.z=clamp(target.z*(a==='zoomIn'?1.28:1/1.28),.75,5.5);break;
    case 'view3':case 'view2':viewToggle(a==='view3');break;
    case 'rotate':stopTour();target.angle+=30;dirty=true;break;
    case 'reset':if(state.mode==='fleet'){state.follow=false;fitFleetTrip(fleetVehicle());syncFleetReadouts()}else closeDetail();closeLayers();toast('视角已复位');break;
    case 'closeDetail':closeDetail();break;
    case 'tour':toggleTour();break;
    case 'nextTour':stepTour();break;
    case 'street':if(state.place){state.view3=true;pointCamera(state.place,true);target.z=4.9;target.tilt=.39;updateChrome();byId('detail').querySelector('[data-action="street"]').outerHTML='<button data-action="areaView">区域俯瞰</button>'}break;
    case 'areaView':if(state.place)selectPlace(state.place);break;
    case 'resolve':if(state.event){handled.add(state.event);try{localStorage.setItem('wz-demo-events-v1',JSON.stringify([...handled]))}catch{}updatePanels();locationDetail(places.find(p=>p.id===state.place));toast('事件已标记为已处置')}break;
    case 'busRoute':if(state.bus){const v=runs.find(v=>v.id===state.bus);if(v)setLine(v.line)}break;
  }
}
let selectedDateMode = 'auto'; // 'auto' | 'today' | 'tomorrow'

function getActiveDatasetDate() {
  if (selectedDateMode === 'today') return '2026-11-07';
  if (selectedDateMode === 'tomorrow') return '2026-11-08';
  const now = new Date(), z = 'Asia/Shanghai';
  const curDateStr = now.toLocaleDateString('sv-SE', { timeZone: z });
  return curDateStr >= '2026-11-08' ? '2026-11-08' : '2026-11-07';
}

function setDateMode(d) {
  selectedDateMode = d;
  document.querySelectorAll('.tb-date-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.date === d);
  });
  if (typeof updatePanels === 'function') updatePanels();
  setClock();
  const label = d === 'tomorrow' ? '明日模拟数据 (2026-11-08)' : '今日运营数据 (2026-11-07)';
  toast(`已切换至: ${label}`);
}

let currentTimelineMode = 'live';
let lastIncidentCount = -1;
let lastCheckedMinute = -1;

function setTimelineMode(t) {
  currentTimelineMode = t;
  document.querySelectorAll('.tb-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.time === t);
  });
  setClock();
  if (typeof updatePanels === 'function') updatePanels();
  const label = t === 'live' ? '实时监控' : (t === 'all' ? '全天汇总数据' : t.slice(0, 5) + ' 监控快照');
  toast(`已切换至: ${label}`);
}

function getEffectiveTimeStr() {
  if (currentTimelineMode && currentTimelineMode !== 'live' && currentTimelineMode !== 'all') {
    return currentTimelineMode;
  }
  if (currentTimelineMode === 'all') {
    return '23:59:59';
  }
  const now = new Date(), z = 'Asia/Shanghai';
  return now.toLocaleTimeString('en-GB', { timeZone: z, hour12: false });
}

function setClock(){
  const now=new Date(),z='Asia/Shanghai';
  const curTimeStr = now.toLocaleTimeString('en-GB', { timeZone: z, hour12: false });
  const curDateStr = now.toLocaleDateString('sv-SE', { timeZone: z });
  const curMinute = now.getMinutes();

  if (currentTimelineMode === 'live' || currentTimelineMode === 'all') {
    byId('clock').textContent = curTimeStr;
  } else {
    byId('clock').textContent = currentTimelineMode;
  }

  // 顶部日期显示
  const activeDate = getActiveDatasetDate();
  if (activeDate === '2026-11-08') {
    byId('date').textContent = '2026.11.08  周日';
  } else {
    byId('date').textContent = curDateStr.replaceAll('-', '.') + '  ' + now.toLocaleDateString('zh-CN', { timeZone: z, weekday: 'short' });
  }

  // 1. 实时模式下若到达特定预警时间点（如 10:20:00, 10:58:00, 11:20:00, 12:30:00, 13:20:00, 15:00:00），
  //    秒级捕获并自动局部刷新事件面板，无需手动刷新页面，并弹出调度通知
  if (currentTimelineMode === 'live' && typeof getActiveIncidentCount === 'function') {
    const count = getActiveIncidentCount();
    if (lastIncidentCount >= 0 && count > lastIncidentCount) {
      if (typeof updatePanels === 'function') updatePanels();
      if (typeof getLatestIncidentTitle === 'function') {
        toast(`📢 实时预警：${getLatestIncidentTitle()}`);
      }
    }
    lastIncidentCount = count;
  }

  // 2. 实时模式下每分钟自动更新订单与分时指标（无需刷新页面）
  if (currentTimelineMode === 'live' && curMinute !== lastCheckedMinute) {
    lastCheckedMinute = curMinute;
    if (typeof updatePanels === 'function') updatePanels();
  }
}
function updateScreenScale(){
  const isGiant = window.innerWidth >= 3600 || (window.innerWidth >= 2400 && window.innerWidth / window.innerHeight >= 2.5);
  document.documentElement.classList.toggle('giant-screen', isGiant);
  const scale = Math.min(2.2, Math.max(1, window.innerHeight / 1080));
  document.documentElement.style.setProperty('--screen-scale', scale.toFixed(3));
}
window.addEventListener('resize', updateScreenScale);

function launch(){
  updateScreenScale();
  document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=ico(el.dataset.icon));
  makeMap();try{hasCity=initializeCity()}catch(e){console.warn('建筑图层使用矢量模式',e)}
  updatePanels();updateChrome();renderMapLayers();
  const activeDate = getActiveDatasetDate();
  const btnToday = byId('btn-date-today');
  const btnTomorrow = byId('btn-date-tomorrow');
  if (btnToday && btnTomorrow) {
    btnToday.classList.toggle('active', activeDate === '2026-11-07');
    btnTomorrow.classList.toggle('active', activeDate === '2026-11-08');
  }
  setClock();setInterval(setClock,1000);
  cameraPointers();requestAnimationFrame(tick);
  document.addEventListener('click',e=>{
    if(!byId('layer-pop').contains(e.target)&&!e.target.closest('[data-action="layers"]'))closeLayers();
    const el=e.target.closest('[data-action],[data-mode],[data-place],[data-event],[data-line],[data-bus],[data-fleet-line]');
    if(!el)return;const d=el.dataset;
    if(d.action)onAction(d.action,d);else if(d.mode)modeChange(d.mode);else if(d.event)openEvent(d.event);else if(d.place)selectPlace(d.place);else if(d.line!==undefined)setLine(Number(d.line));else if(d.fleetLine!==undefined)pickBus(runs.find(v=>v.line===Number(d.fleetLine)).id);else if(d.bus)pickBus(d.bus);
  });
  document.addEventListener('change',e=>{if(e.target.dataset.layer){if(!e.target.checked&&e.target.dataset.layer==='cars'&&state.mode==='fleet')modeChange('overview');state.layers[e.target.dataset.layer]=e.target.checked;dirty=true;renderMapLayers()}});
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      const modal = byId('event-modal');
      if(modal && !modal.hidden)closeModal();
      else if(!byId('layer-pop').hidden)closeLayers();
      else closeDetail();
    }
    if((e.key==='Enter'||e.key===' ')&&e.target.matches('g[role="button"]')){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}))}
  });
  document.addEventListener('fullscreenchange',()=>{const el=document.querySelector('[data-action="fullscreen"]');el.title=document.fullscreenElement?'退出全屏':'进入全屏';el.setAttribute('aria-label',el.title);dirty=true});
}
launch();
