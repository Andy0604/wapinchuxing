const byId=id=>document.getElementById(id);
const xy={port:[197,279],lanqiao:[426,185],shell:[716,198],church:[678,224],east:[693,480],sports:[417,440],bay:[520,465],park:[371,585],beach:[213,489]};
const palette={port:'#78caff',lanqiao:'#64f1d1',shell:'#ffd269',church:'#69f2cd',east:'#77d4ff',sports:'#52ffc9',bay:'#ffbe52',park:'#8de9ce',beach:'#71d7ff'};
const routeIds=['loop','shuttle','east'];
const state={mode:'overview',period:'今日',line:0,view3:true,place:null,event:null,bus:null,follow:false,tour:false,tourStep:0, layers:{places:true,cars:true,roads:true,buildings:true}};
const handled=new Set(events.filter(e=>e.done).map(e=>e.id));
try{for(const id of JSON.parse(localStorage.getItem('wz-demo-events-v1')||'[]'))if(events.some(e=>e.id===id))handled.add(id)}catch{}
const camera={x:450,y:355,z:1.18,angle:0,tilt:.86};
let tourStart=0,tourYaw=0;
let target={...camera},dirty=true,lastTimestamp=0,tourTimer=0,toastTimer=0,hasCity=false;
const motionReduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const markerEls={},runs=[],routeSamples=[],tourOrder=['port','lanqiao','church','shell','east','bay','sports','park','beach'];
function project(x,y){const a=camera.angle*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return [450+camera.z*((x-camera.x)*c-(y-camera.y)*s),370+camera.z*camera.tilt*((x-camera.x)*s+(y-camera.y)*c)]}
function home(){target={x:450,y:355,z:1.18,angle:0,tilt:state.view3?.86:1};dirty=true}
function makeMap(){
  const orbits=[260,335,420,505].map((r,i)=>'<circle cx="450" cy="355" r="'+r+'" fill="none" stroke="#6195a5" stroke-opacity="'+(i===3?.14:.16)+'" stroke-width=".8" stroke-dasharray="'+(i%2?'3 8':'110 3 1 3')+'"/>').join('');
  const ticks=Array.from({length:120},(_,i)=>'<path transform="rotate('+i*3+' 450 355)" d="M450 -65v'+(i%5?4:9)+'" stroke="#4c8093" opacity="'+(i%5?.3:.6)+'"/>').join('');
  byId('ocean').innerHTML=orbits+ticks+'<g fill="#6e9aa9" opacity=".53" font-family="sans-serif" text-anchor="middle"><text x="125" y="529" font-size="14" transform="rotate(-16 125 529)" letter-spacing="6">北部湾</text><text x="590" y="610" font-size="13" letter-spacing="6">南湾</text></g>';
  byId('seaRoute').innerHTML='<path id="ferryPath" d="M-95 23Q-7 73 48 135T142 235Q166 262 197 279" fill="none" stroke="#72c2ff" stroke-width="1.7" stroke-dasharray="7 7" opacity=".8"/><text x="25" y="120" transform="rotate(37 25 120)" fill="#75b1d6" font-size="11" letter-spacing="2">北海 ↔ 涠洲岛</text>';
  byId('routes').insertAdjacentHTML('beforeend','<g id="traffic-hotspot"><circle cx="493" cy="465" r="60" fill="url(#attentionGlow)"/><g fill="none" stroke="#ffbd6c" stroke-width=".9"><circle cx="493" cy="465" r="18" opacity=".68"/><circle cx="493" cy="465" r="30" opacity=".6" stroke-dasharray="3 5"/><circle cx="493" cy="465" r="41" opacity=".2"/></g></g>');
  const pins=byId('pins');
  places.forEach((p,i)=>{
    const right=['port','beach','park','lanqiao','sports'].includes(p.id),labelColor=palette[p.id],width=40+p.name.length*15;
    const x=right?-width-4:4,y=-42;
    const label='<g transform="translate('+x+' '+y+')"><rect class="label-bg" width="'+width+'" height="28" rx="3"/><rect width="2.5" height="17" y="5" fill="'+labelColor+'"/><g transform="translate(7 6) scale(.69)" stroke="'+labelColor+'" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" fill="none">'+icons[p.icon]+'</g><text x="29" y="19">'+p.name+'</text></g>';
    const markup='<g data-place="'+p.id+'" class="map-pin" tabindex="0" role="button" aria-label="查看'+p.name+'"><ellipse rx="15" ry="6" fill="'+labelColor+'" opacity=".13"/><ellipse class="ring" rx="10" ry="4.8" fill="none" stroke="'+labelColor+'" stroke-width="1.1"/><ellipse rx="6" ry="2.5" fill="none" stroke="'+labelColor+'"/><path d="M0 -1v-22l'+(right?'-':'')+'5 -5" stroke="'+labelColor+'" fill="none"/><circle cy="-1" r="2.5" fill="'+labelColor+'"/>'+label+'</g>';
    pins.insertAdjacentHTML('beforeend',markup);markerEls[p.id]=pins.lastElementChild;
  });
  routeIds.forEach((id,idx)=>{
    const path=byId('route-'+id),len=path.getTotalLength(),n=Math.ceil(len/1.2);
    if(idx===2){const pts=path.getAttribute('d').split(' '); const idxStart=pts.findIndex(p=>p.startsWith('583.2,467.6')); const d='M'+pts.slice(idxStart).join(' ');byId('routes').insertAdjacentHTML('beforeend','<path id="slow-road" d="'+d+'" fill="none" stroke="#ffc06d" stroke-width="3.6" stroke-linecap="round"/>')}
    routeSamples.push(Array.from({length:n+1},(_,i)=>{const pt=path.getPointAtLength(len*i/n);return [pt.x,pt.y]}));
    const sweep=document.createElementNS('http://www.w3.org/2000/svg','path');
    sweep.setAttribute('d',path.getAttribute('d'));sweep.setAttribute('fill','none');sweep.setAttribute('stroke','#e6fff9');sweep.setAttribute('stroke-width','1.6');sweep.setAttribute('stroke-linecap','round');sweep.setAttribute('stroke-dasharray','6 92');sweep.setAttribute('opacity','.6');sweep.setAttribute('id','flow-'+idx);sweep.innerHTML='<animate attributeName="stroke-dashoffset" from="98" to="0" dur="5s" repeatCount="indefinite"/>';byId('routes').append(sweep);
  });
  setupFleet();
  pins.insertAdjacentHTML('beforeend','<g id="ship-mark" fill="#86d8ff" pointer-events="none"><path d="m-8 0 4-3h9l5 3-5 3h-9z"/><path d="m-11-3-8-1m8 7-10 2" stroke="#60a6db" opacity=".7"/></g>');
}
function updatePlaceLayers(){
  const trip=state.bus?currentSample(fleetVehicle()):null;
  for(const place of places){
    const intermediate=!trip||(trip.stops.includes(place.id)&&place.id!==trip.from&&place.id!==trip.to);
    const el=markerEls[place.id];
    el.style.display=state.layers.places&&intermediate?'':'none';
    el.classList.toggle('active',state.place===place.id);
  }
}
function renderMapLayers(){
  updatePlaceLayers();
  routeIds.forEach((r,i)=>{
    byId('route-'+r+'-layer').setAttribute('stroke',state.mode==='routes'?lines[i].color:['#64f1d1','#6ad8e2','#72e4ce'][i]);
    byId('route-'+r+'-layer').style.opacity=!state.layers.roads?'0':state.mode==='fleet'?'.23':state.mode==='routes'&&state.line!==i?'.10':'1';
    byId('flow-'+i).style.display=state.layers.roads&&state.mode!=='fleet'&&(state.mode!=='routes'||state.line===i)?'':'none';
  });
  fleetLayers();
  byId('slow-road').style.display=state.layers.roads&&state.mode!=='routes'&&state.mode!=='fleet'?'':'none';
  byId('traffic-hotspot').style.display=state.layers.places&&state.mode!=='routes'&&state.mode!=='fleet'?'':'none';
  byId('city').hidden=!state.layers.buildings;
  if(byId('wz-buildings'))byId('wz-buildings').style.display=hasCity||!state.layers.buildings?'none':'';
  byId('seaRoute').style.display=state.layers.roads?'':'none';byId('ship-mark').style.display=state.layers.cars&&state.layers.roads?'':'none';
}
function tick(t){
  const interval=lastTimestamp?Math.min(500,t-lastTimestamp):0;
  const dt=Math.min(60,interval);lastTimestamp=t;
  const fleetChanged=advanceFleet(t,interval);
  if(state.tour&&!motionReduced){const u=clamp((t-tourStart)/6800,0,1);target.angle=tourYaw+u*17;target.z=3.65+u*.57}
  let movement=dirty;const gain=motionReduced?1:1-Math.exp(-dt/180);
  for(const k of Object.keys(target)){const d=target[k]-camera[k];if(Math.abs(d)>.0001){camera[k]+=d*gain;movement=true}}
  if(movement){
    const a=camera.angle*Math.PI/180,c=Math.cos(a),s=Math.sin(a),z=camera.z,k=camera.tilt;
    const e=450-z*(c*camera.x-s*camera.y),f=370-z*k*(s*camera.x+c*camera.y);
    byId('world').setAttribute('transform','matrix('+[z*c,z*k*s,-z*s,z*k*c,e,f].join(' ')+')');
    const viewport=byId('viewport');const factor=Math.min(viewport.clientWidth/900,viewport.clientHeight/740);
    const vw=viewport.clientWidth/factor,vh=viewport.clientHeight/factor;
    for(const p of places){
      const pos=project(...xy[p.id]),el=markerEls[p.id],sc=Math.max(.82,Math.min(1.75, .98/Math.max(.55,factor)));
      // Keep labels attached to their point, flipping to the inside near screen edges.
      const label=el.lastElementChild,w=40+p.name.length*15,preferLeft=['port','beach','park','lanqiao','sports'].includes(p.id);
      const edgeL=450-vw/2,edgeR=450+vw/2;
      const left=pos[0]+(w+6)*sc>edgeR?true:pos[0]-(w+6)*sc<edgeL?false:preferLeft;
      label.setAttribute('transform','translate('+(left?-w-4:4)+' -42)');
      el.setAttribute('transform','translate('+pos.join(' ')+') scale('+sc+')');
      el.style.visibility=(pos[0]<edgeL-10||pos[0]>edgeR+10||pos[1]<370-vh/2||pos[1]>370+vh/2+20)?'hidden':'visible';
    }
    document.querySelector('.compass svg').style.transform='rotate('+(camera.angle-14)+'deg)';
    if(hasCity&&state.layers.buildings)drawCity(camera);
    dirty=false;
  }
  if(!tick.last||t-tick.last>65){
    tick.last=t;
    const ferry=byId('ferryPath'),d=motionReduced?.6:((t/170000+.52)%1),pt=ferry.getPointAtLength(ferry.getTotalLength()*d),q=project(pt.x,pt.y);byId('ship-mark').setAttribute('transform','translate('+q.join(' ')+') rotate('+(34+camera.angle)+')');
  }
  if(movement||fleetChanged)placeFleetSymbols();
  requestAnimationFrame(tick);
}
function pointCamera(id,close=false){
  const p=xy[id],i=places.findIndex(o=>o.id===id);
  target={x:p[0],y:p[1]+(close?20:28),z:close?3.65:2.45,angle:state.view3?[-15,16,-23,20,-10,15][i]:0,tilt:state.view3?(close?.49:.64):1};dirty=true;
}
function cameraPointers(){
  const el=byId('viewport'),active=new Map();let origin=null,start=null,moved=false,suppress=0,pinchDist=0,pinchZoom=1;
  el.addEventListener('contextmenu',e=>e.preventDefault());
  el.addEventListener('pointerdown',e=>{active.set(e.pointerId,[e.clientX,e.clientY]);if(active.size===2){const [a,b]=[...active.values()];pinchDist=Math.max(1,Math.hypot(a[0]-b[0],a[1]-b[1]));pinchZoom=target.z;moved=true;return}origin=[e.clientX,e.clientY];start={...camera};moved=false});
  el.addEventListener('pointermove',e=>{if(!active.has(e.pointerId))return;active.set(e.pointerId,[e.clientX,e.clientY]);
    if(active.size===2){stopTour();const [a,b]=[...active.values()];target.z=clamp(pinchZoom*Math.hypot(a[0]-b[0],a[1]-b[1])/pinchDist,.75,5.5);return}
    if(!origin||!start)return;const dx=e.clientX-origin[0],dy=e.clientY-origin[1];if(!moved&&Math.hypot(dx,dy)<4)return;
    moved=true;el.setPointerCapture(e.pointerId);el.classList.add('dragging');stopTour();state.follow=false;
    const f=Math.min(el.clientWidth/900,el.clientHeight/740);
    if(e.buttons===2||e.shiftKey){target.angle=start.angle+dx*.22;target.tilt=state.view3?clamp(start.tilt+dy*.003,.32,.96):1}
    else{const u=dx/(f*start.z),v=dy/(f*start.z*start.tilt),r=start.angle*Math.PI/180;target.x=clamp(start.x-u*Math.cos(r)-v*Math.sin(r),-250,1150);target.y=clamp(start.y+u*Math.sin(r)-v*Math.cos(r),-170,930)}
  });
  const end=e=>{active.delete(e.pointerId);if(!active.size){if(moved)suppress=performance.now()+200;origin=null;el.classList.remove('dragging')}else if(active.size===1){origin=[...active.values()][0];start={...camera}}};
  window.addEventListener('pointerup',end);window.addEventListener('pointercancel',end);
  el.addEventListener('click',e=>{if(performance.now()<suppress){e.preventDefault();e.stopPropagation()}},true);
  el.addEventListener('wheel',e=>{e.preventDefault();stopTour();target.z=clamp(target.z*Math.exp(-e.deltaY*.0015),.75,5.5)},{passive:false});
  new ResizeObserver(()=>{dirty=true}).observe(el);
}
function clamp(v,a,b){return Math.min(b,Math.max(a,v))}
