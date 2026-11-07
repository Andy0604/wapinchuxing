const playback={seconds:0,rate:10,paused:motionReduced};
let fleetSimulation, lastSampleMs=-1;
const fleetView=new Map();
function fleetVehicle(){return runs.find(v=>v.id===state.bus)}
function currentSample(v){return fleetView.get(v.id).sample}
function fleetPoints(points){return points.map(p=>p[0].toFixed(2)+','+p[1].toFixed(2)).join(' ')}
function setupFleet(){
  fleetSimulation=createFleetSimulation(routeSamples,xy,lines);
  runs.push(...fleetSimulation.vehicles);
  const world=byId('objects');
  world.innerHTML='<g id="recent-trails"></g><g id="trip-lines" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline id="trip-bed" stroke="#031924" stroke-width="8"/><polyline id="trip-future" stroke="#a0d2f8" stroke-width="3.3" stroke-dasharray="5 6"/><polyline id="trip-past-glow" stroke="#72ffd5" stroke-width="8" opacity=".24"/><polyline id="trip-past" stroke="#73ffce" stroke-width="4.1"/></g>';
  world.querySelectorAll('polyline').forEach(p=>p.setAttribute('vector-effect','non-scaling-stroke'));
  byId('labels').insertAdjacentHTML('beforeend','<g id="trip-stop-labels"></g><g id="fleet-markers"></g>');
  for(const v of runs){
    const color=lines[v.line].color;
    byId('recent-trails').insertAdjacentHTML('beforeend','<polyline fill="none" stroke="'+color+'" stroke-width="4" vector-effect="non-scaling-stroke" opacity=".72" stroke-linecap="round" stroke-linejoin="round"/>');
    const markup='<g class="fleet-marker bus" tabindex="0" role="button" data-bus="'+v.id+'"><title></title><circle class="pick-radius" r="13" fill="transparent"/><g class="bus-bearing"><ellipse cy="1" rx="14" ry="7.2" fill="#020f1c" opacity=".78"/><path d="m11 -3 4.5 3-4.5 3" fill="'+color+'"/><rect x="-10.5" y="-4.9" width="21" height="9.8" rx="2.5" fill="'+color+'" stroke="#efffff" stroke-width="1.15"/><rect x="5" y="-3.6" width="3.3" height="7.2" rx=".7" fill="#193545"/><rect x="-8.3" y="-3.2" width="2.1" height="6.4" rx=".6" fill="#2a4652"/><rect x="-4.7" y="-2.3" width="7.8" height="4.6" rx="1.1" fill="#f1fffc"/><path d="M-3.1 -1v2m1.4-2v2m1.4-2v2" stroke="#8fb4c2" stroke-width=".6"/></g><g class="bus-badge"><rect height="17.5" rx="4"/><text y="12.2" x="5"></text></g></g>';
    byId('fleet-markers').insertAdjacentHTML('beforeend',markup);
    v.el=byId('fleet-markers').lastElementChild;
    fleetView.set(v.id,{sample:fleetSimulation.sample(v,0),trail:byId('recent-trails').lastElementChild,bearing:v.el.querySelector('.bus-bearing'),badge:v.el.querySelector('.bus-badge')});
  }
}
function fleetVisible(v){return state.layers.cars&&((state.mode!=='routes'&&state.mode!=='fleet')||v.line===state.line)}
function fleetLayers(){
  for(const v of runs){const visible=fleetVisible(v);v.el.style.display=visible?'':'none';fleetView.get(v.id).trail.style.display=visible&&(!state.bus||state.bus===v.id)?'':'none';v.el.classList.toggle('tracked',v.id===state.bus)}
  const show=state.bus&&state.layers.cars;
  byId('trip-lines').style.display=show?'':'none';byId('trip-stop-labels').style.display=show?'':'none';
  if(state.bus)byId('fleet-markers').append(fleetVehicle().el);
  lastSampleMs=-1;
}
function renderTripStops(v,s){
  const parent=byId('trip-stop-labels');
  if(parent.dataset.trip===s.tripId)return;
  const bottom=s.trail[0],end=s.remaining.at(-1);
  parent.dataset.trip=s.tripId;
  parent.innerHTML=[[s.from,'起','#74f9c8',bottom],[s.to,'终','#a8d9ff',end]].map(([id,tag,color,pos])=>{
    const name=busPlaceName(id),w=28+name.length*12;
    return '<g class="trip-stop" data-x="'+pos[0]+'" data-y="'+pos[1]+'" data-width="'+w+'"><circle r="7.5" fill="#112d3a" stroke="'+color+'" stroke-width="2"/><circle r="2.6" fill="'+color+'"/><g class="end-flag"><rect x="0" y="0" width="'+w+'" height="21" rx="3" fill="#0c2735" stroke="'+color+'"/><rect x="1" y="1" width="17" height="19" rx="2" fill="'+color+'"/><text x="3.5" y="14.5" fill="#103039">'+tag+'</text><text x="22" y="14.5" fill="#f0fbff">'+name+'</text></g></g>';
  }).join('');
}
function fitFleetTrip(v){
  const s=currentSample(v),pts=s.trail.concat(s.remaining);
  let xmin=Infinity,ymin=Infinity,xmax=-Infinity,ymax=-Infinity;
  for(const [x,y] of pts){xmin=Math.min(xmin,x);xmax=Math.max(xmax,x);ymin=Math.min(ymin,y);ymax=Math.max(ymax,y)}
  const el=byId('viewport'),f=Math.min(el.clientWidth/900,el.clientHeight/740);
  const tilt=state.view3?.83:1;
  const sidePadding=el.clientWidth < 400 ? 78 : 128;
  const z=clamp(Math.min((el.clientWidth-sidePadding)/(f*Math.max(1,xmax-xmin)),(el.clientHeight-155)/(f*tilt*Math.max(1,ymax-ymin))),.78,2.8);
  target={x:(xmax+xmin)/2,y:(ymax+ymin)/2-8,z,tilt,angle:0};dirty=true;
}
function advanceFleet(t,wallDelta){
  if(!playback.paused)playback.seconds+=wallDelta*playback.rate/1000;
  if(lastSampleMs>=0&&t-lastSampleMs<90)return false;
  lastSampleMs=t;
  for(const v of runs){
    const view=fleetView.get(v.id);
    const sample=fleetSimulation.sample(v,playback.seconds);view.sample=sample;v.xy=sample.xy;
    if(fleetVisible(v))view.trail.setAttribute('points',fleetPoints(sample.recentTrail));
    if(v.id!==state.bus)continue;
    const changed=byId('trip-stop-labels').dataset.trip!==sample.tripId;
    if(changed){updatePlaceLayers();renderTripStops(v,sample);byId('trip-bed').setAttribute('points',fleetPoints([...sample.trail,...sample.remaining]));if(!state.follow)fitFleetTrip(v)}
    const traveled=fleetPoints(sample.trail);
    byId('trip-past').setAttribute('points',traveled);byId('trip-past-glow').setAttribute('points',traveled);
    byId('trip-future').setAttribute('points',fleetPoints(sample.remaining));
    if(state.follow){target.x=sample.xy[0];target.y=sample.xy[1]}
  }
  syncFleetReadouts();
  return true;
}
function placeFleetSymbols(){
  const view=byId('viewport'),f=Math.min(view.clientWidth/900,view.clientHeight/740);
  if(!f)return;
  // Draw upright labels at screen scale, independent of map zoom or tilt.
  const scale=1/f, width=view.clientWidth,height=view.clientHeight;
  const toScreen=([x,y])=>[(x-450)*f+width/2,(y-370)*f+height/2];
  const occupied=[];
  const viewportBox=view.getBoundingClientRect();
  function addBox(x,y,w,h){occupied.push([x,y,x+w,y+h])}
  if(state.layers.places){
    for(const el of Object.values(markerEls)){
      if(el.style.display==='none'||el.style.visibility==='hidden')continue;
      const lab=el.lastElementChild,box=lab.getBoundingClientRect();
      addBox(box.x-viewportBox.x,box.y-viewportBox.y,box.width,box.height)
    }
  }
  if(state.bus&&state.layers.cars){
    for(const el of byId('trip-stop-labels').children){
      const p=project(+el.dataset.x,+el.dataset.y),[x,y]=toScreen(p),w=+el.dataset.width;
      const dx=clamp(-w/2,14-x,width-14-x-w),dy=y<52?13:-33;
      el.setAttribute('transform','translate('+p.join(' ')+') scale('+scale+')');
      el.querySelector('.end-flag').setAttribute('transform','translate('+dx+' '+dy+')');
      addBox(x+dx,y+dy,w,21);
    }
  }
  const set=runs.filter(fleetVisible).sort((a,b)=>Number(b.id===state.bus)-Number(a.id===state.bus));
  const points=set.map(v=>project(...currentSample(v).xy));
  points.forEach(p=>{const [x,y]=toScreen(p);addBox(x-10,y-6,20,12)});
  for(let i=0;i<set.length;i++){
    const v=set[i],d=fleetView.get(v.id),s=d.sample,pt=points[i],[x,y]=toScreen(pt),selected=state.bus===v.id;
    const el=v.el;
    el.setAttribute('transform','translate('+pt.join(' ')+') scale('+scale+')');
    const angle=(s.heading+camera.angle)*Math.PI/180;
    d.bearing.setAttribute('transform','rotate('+Math.atan2(Math.sin(angle)*camera.tilt,Math.cos(angle))*180/Math.PI+')');
    const t=(selected?v.id+' · ':'')+s.passengers+'人',w=(selected?63:0)+(s.passengers>=10?31:24);
    const offsets=[[11,-21],[-w-11,-19],[12,5],[-w-12,6],[-w/2,-32],[-w/2,14]];
    const match=offsets.find(([dx,dy])=>{const l=x+dx,u=y+dy;return l>=2&&u>=3&&l+w<width-2&&u+18<height-2&&!occupied.some(([a,b,c,e])=>c>l&&a<l+w&&e>u&&b<u+18)});
    const offset=match||(selected?offsets[4]:null);
    d.badge.style.display=offset?'':'none';
    if(offset){
      d.badge.setAttribute('transform','translate('+offset.join(' ')+')');
      d.badge.querySelector('rect').setAttribute('width',w);d.badge.querySelector('text').textContent=t;
      addBox(x+offset[0]-1,y+offset[1]-1,w+2,20);
    }
    const desc='哇品出行 '+v.id+'，'+busPlaceName(s.from)+'至'+busPlaceName(s.to)+'，实载'+s.passengers+'人';
    if(el.getAttribute('aria-label')!==desc){el.setAttribute('aria-label',desc);el.querySelector('title').textContent=desc}
  }
}
