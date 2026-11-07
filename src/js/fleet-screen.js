function renderFleetScreen(){
  const v=fleetVehicle();
  const filters=lines.map((l,i)=>'<button data-fleet-line="'+i+'" aria-pressed="'+(i===state.line)+'"><span>'+l.id+'</span>'+l.name+'</button>').join('');
  const roster=renderFleetRoster(runs.filter(b=>b.line===state.line),currentSample,state.bus);
  byId('left').innerHTML='<section class="panel fleet-summary">'+panelHeader('哇品出行车队','bus','<span class="tag-static">演示车队</span>')+'<div class="fleet-totals"><div><strong>'+runs.length+'</strong><small>监测车辆 / 辆</small></div><div><strong data-fleet-total></strong><small>车上乘客 / 人</small></div></div><div class="fleet-clock"><span>模拟播放</span><button data-action="speed" title="切换车辆演示倍速">'+playback.rate+'×</button><button data-action="pauseFleet"></button></div></section>'+
    '<section class="panel fleet-filter">'+panelHeader('选择线路','route')+'<div class="fleet-line-filter">'+filters+'</div></section>'+roster;
  byId('right').innerHTML='<section class="panel trip-panel">'+panelHeader('单车行程','location')+'<div id="fleet-trip-card">'+renderBusCard(v,currentSample(v),state.follow)+'</div></section>'+roadPanel();
}
function syncFleetReadouts(){
  const total=runs.reduce((n,v)=>n+currentSample(v).passengers,0);
  document.querySelectorAll('[data-fleet-total]').forEach(el=>{if(el.textContent!==String(total))el.textContent=total});
  const toggle=document.querySelector('[data-action="pauseFleet"]');
  if(toggle&&toggle.dataset.paused!==String(playback.paused)){toggle.dataset.paused=String(playback.paused);toggle.innerHTML=ico(playback.paused?'play':'pause')+(playback.paused?'继续':'暂停');toggle.setAttribute('aria-label',playback.paused?'继续车辆演示':'暂停车辆演示')}
  if(state.mode==='fleet'||state.mode==='routes')updateFleetRoster(document.querySelector('.fleet-roster'),runs,currentSample,state.bus);
  const v=fleetVehicle();if(v)updateBusCard(byId('fleet-trip-card'),v,currentSample(v),state.follow);
}
function toggleBusFollow(){
  const v=fleetVehicle();if(!v)return;
  state.follow=!state.follow;
  if(state.follow){const s=currentSample(v);target={x:s.xy[0],y:s.xy[1],z:3.35,angle:-9,tilt:state.view3?.63:1};dirty=true}
  else fitFleetTrip(v);
  syncFleetReadouts();bringFleetMapIntoView();
}
function pickBus(id){
  const v=runs.find(o=>o.id===id);if(!v)return;
  stopTour();closeLayers();resetSelection();state.mode='fleet';state.line=v.line;
  state.bus=v.id;state.layers.cars=true;state.layers.roads=true;
  fitFleetTrip(v);updatePanels();updateChrome();renderMapLayers();syncFleetReadouts();
  bringFleetMapIntoView();
}

function bringFleetMapIntoView(){
  const map=document.querySelector('.map-area');
  if(window.innerWidth<=900&&map.getBoundingClientRect().top < -40){
    map.scrollIntoView({block:'start',behavior:motionReduced?'instant':'smooth'});
  }
}
