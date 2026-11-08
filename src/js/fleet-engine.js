/* Coordinates share the island SVG's rotated local-metre projection. Its x and y
   axes were scaled independently to fit the display, so measure each separately. */
function createFleetSimulation(routeSamples, xy, lines) {
  const metresX=8.630090862, metresY=14.061206786;
  const capacity=7, cruiseKph=[26,30,23];
  // Most simulated departures carry two to five passengers, with occasional full trips.
  const departureLoads=[1,1,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,6,6,7];
  const vehicles=[], timetables=new Map();
  const distance=(a,b)=>Math.hypot((a[0]-b[0])*metresX,(a[1]-b[1])*metresY);
  const mod=(n,d)=>((n%d)+d)%d;
  // The dense equal-arc samples are already ordered along real roads, including
  // out-and-back spurs. Match successive stops in that same order.
  function stopIndices(path, stops) {
    let start=0;
    return stops.map((id,i)=>{
      if(i===0)return 0;
      if(i===stops.length-1)return path.length-1;
      let best=start+1, bestDistance=Infinity;
      for(let j=start+1;j<path.length-1;j++){
        const gap=distance(path[j],xy[id]);
        if(gap<bestDistance){bestDistance=gap;best=j;}
      }
      start=best;
      return best;
    });
  }
  function trip(path, stops, direction, lineIndex) {
    const stopIndex=stopIndices(path,stops);
    const metres=[0];
    for(let i=1;i<path.length;i++)metres.push(metres[i-1]+distance(path[i-1],path[i]));
    const stages=[];
    let time=0;
    for(let i=0;i<stops.length-1;i++){
      const from=stops[i],to=stops[i+1];
      const start=metres[stopIndex[i]],end=metres[stopIndex[i+1]];
      const length=end-start;
      const nearBay=from==='bay'||to==='bay';
      const speed=(nearBay ? cruiseKph[lineIndex]-.8-3.5 : cruiseKph[lineIndex])/3.6;
      // Accelerate and brake over the same interval, with a cruise phase between.
      const ramp=Math.min(12,length/(speed*1.7));
      const travelSeconds=length/speed+ramp;
      const dwell=i===0?45:from==='port'?42:from==='bay'?36:27+(i*7)%11;
      stages.push({from,to,start,end,startTime:time,departure:time+dwell,
        arrival:time+dwell+travelSeconds,speed,ramp,dwell});
      time+=dwell+travelSeconds;
    }
    return {path,metres,stops,stages,direction,duration:time,total:metres[metres.length-1]};
  }
  function atDistance(run,target) {
    let low=0,high=run.path.length-1;
    while(low+1<high){
      const mid=(low+high)>>1;
      if(run.metres[mid]<=target)low=mid;else high=mid;
    }
    const a=run.path[low],b=run.path[high],span=run.metres[high]-run.metres[low];
    const f=span?Math.max(0,Math.min(1,(target-run.metres[low])/span)):0;
    return {index:low,xy:[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f],
      heading:Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI};
  }
  function lineTrips(raw,stops,index,reverseRing) {
    const path=raw.filter((p,i)=>!i || p[0]!==raw[i-1][0] || p[1]!==raw[i-1][1]);
    if(distance(path[0],path[path.length-1])<20 && stops.length>3) {
      const ringStops=[...stops,stops[0]];
      const middle=stops.includes('bay')?stops.indexOf('bay'):Math.floor(stops.length/2);
      const turn=stopIndices(path,ringStops)[middle];
      const west=path.slice(turn),east=path.slice(0,turn+1);
      const westStops=ringStops.slice(middle),eastStops=ringStops.slice(0,middle+1);
      return reverseRing
        ? [trip(west.reverse(),westStops.reverse(),'逆时针',index),
           trip(east.reverse(),eastStops.reverse(),'逆时针',index)]
        : [trip(east,eastStops,'顺时针',index),trip(west,westStops,'顺时针',index)];
    }
    return [trip(path,stops,'去程',index),
      trip([...path].reverse(),[...stops].reverse(),'返程',index)];
  }
  routeSamples.forEach((path,line)=>{
    if(!lines[line] || !Array.isArray(path) || path.length<2)return;
    const forward=lineTrips(path,lines[line].stops,line,false);
    const reverse=line===0?lineTrips(path,lines[line].stops,line,true):forward;
    const slotsCount = line === 0 ? 5 : 4;
    for(let slot=0;slot<slotsCount;slot++){
      const journeys=slot%2?reverse:forward;
      const cycle=journeys[0].duration+journeys[1].duration;
      // Start the first demonstration trip mid-journey so both parts of its route are visible.
      const initialPhase=line===0&&slot===0?.18:.035;
      const offset=cycle*((initialPhase+slot*(1/slotsCount)+line*.087)%1);
      const vehicle={id:'WZ-'+((line+1)*100+slot+1),line,lineId:lines[line].id,
        lineName:lines[line].name,capacity,type:['观光车','接驳车','公交车'][line]};
      vehicles.push(vehicle);
      timetables.set(vehicle.id,{journeys,cycle,offset,seed:17+slot*7+line*11,capacity});
    }
  });
  // Repeatable loads for each vehicle, journey and stop. At terminals everyone
  // alights first; the next trip boards progressively during its origin dwell.
  function occupancy(seed, journeyNumber, stopNumber) {
    const index=mod(seed*41+journeyNumber*23+stopNumber*31,departureLoads.length);
    return Math.min(capacity,departureLoads[index]);
  }
  function sample(vehicle,elapsedSeconds) {
    const spec=timetables.get(vehicle.id);
    if(!spec)throw new RangeError('未知演示车辆 '+vehicle.id);
    const t=spec.offset+(Number.isFinite(elapsedSeconds)?elapsedSeconds:0);
    const phase=mod(t,spec.cycle), cycleNumber=Math.floor(t/spec.cycle);
    const outbound=phase<spec.journeys[0].duration, leg=outbound?0:1;
    const run=spec.journeys[leg];
    const time=outbound?phase:phase-spec.journeys[0].duration;
    const journeyNumber=cycleNumber*2+leg;
    let i=run.stages.findIndex(s=>time<s.arrival);
    if(i<0)i=run.stages.length-1;
    const s=run.stages[i], dwell=time<s.departure;
    const drive=Math.max(0,time-s.departure);
    const timeLeft=Math.max(0,s.arrival-time);
    let meters=s.start, speed=0;
    if(!dwell) {
      if(drive<s.ramp){
        speed=s.speed*drive/s.ramp;
        meters+=speed*drive/2;
      }else if(timeLeft<s.ramp){
        speed=s.speed*timeLeft/s.ramp;
        meters=s.end-speed*timeLeft/2;
      }else{
        speed=s.speed;
        meters+=speed*(drive-s.ramp/2);
      }
    }
    const position=atDistance(run,meters),j=position.index,point=position.xy;
    const {seed,capacity}=spec;
    const departLoad=occupancy(seed,journeyNumber,i);
    let passengers=departLoad;
    if(dwell) {
      const prev=spec.journeys[1-leg];
      const arrivalLoad=i?occupancy(seed,journeyNumber,i-1)
        :occupancy(seed,journeyNumber-1,prev.stages.length-1);
      const stay=i?Math.max(0,Math.min(arrivalLoad,departLoad)-mod(seed+i+journeyNumber,2)):0;
      const f=(time-s.startTime)/s.dwell;
      passengers=Math.round(f<.42?arrivalLoad+(stay-arrivalLoad)*f/.42
        :stay+(departLoad-stay)*(f-.42)/.58);
    }
    const recentStart=atDistance(run,Math.max(0,meters-245));
    // Compute the long route arrays lazily. Most dots only consume the pose.
    return {xy:point,heading:position.heading,passengers,capacity,
      from:run.stops[0],to:run.stops[run.stops.length-1],prevStop:s.from,nextStop:s.to,
      currentStop:dwell?s.from:null,progress:meters/run.total,
      traveledKm:meters/1000,totalKm:run.total/1000,speed:speed*3.6,
      etaMinutes:timeLeft/60,terminalEtaMinutes:Math.max(0,run.duration-time)/60,
      status:dwell?'停靠中':'行驶中',direction:run.direction,
      tripId:vehicle.id+'-'+(journeyNumber+1),stops:run.stops,
      get trail(){return [...run.path.slice(0,j+1),point]},
      get remaining(){return [point,...run.path.slice(j+1)]},
      get recentTrail(){return [recentStart.xy,...run.path.slice(recentStart.index+1,j+1),point]}
    };
  }
  return {vehicles,sample};
}
