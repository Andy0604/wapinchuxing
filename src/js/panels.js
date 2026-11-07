function panelHeader(name, icon, action = '') {
  return `<div class="panel-head"><h3 class="panel-title">${ico(icon)}${name}</h3>${action}</div>`;
}

function overviewPanels(period) {
  const today = period !== '昨日';
  const day = today ? '今日' : '昨日';
  const prior = today ? '昨日' : '前日';
  const selector = `<button class="microbtn" data-action="period" aria-label="切换今日或昨日客流">${day}${ico('down')}</button>`;
  const fleet = [['公交车',56,'#55f1cd'],['观光车',42,'#3ba9ff'],['接驳车',30,'#8d87fc']];
  return `<section class="panel overview">${panelHeader('全岛出行总览','grid',selector)}
    <div class="overview-total"><div><div class="klabel">累计运送客流</div><div class="total-num">${today?'8,416':'7,620'}<small>人次</small></div><div class="delta">较${prior}<b>↗ ${today?'10.4':'6.2'}%</b></div></div><div class="mini-hist">${overviewChart(day)}</div></div>
    <div class="mini-stats"><div><b>3</b><small>运营线路</small></div><div><b>6</b><small>监测点位</small></div><div><b>128</b><small>监管车辆</small></div></div></section>
    <section class="panel trend">${panelHeader('客流趋势','chart')}
    <div class="chart-info"><span class="chart-unit">人次 / 10 分钟</span><div class="chart-keys"><span><i></i>${day}</span><span><i class="key dashed"></i>${prior}</span></div></div>
    <div class="flow-chart">${flowChart(day)}</div></section>
    <section class="panel fleet">${panelHeader('运力分布','bus','<span class="mini-head">车队构成</span>')}
    <div class="fleet-main">${fleetChart()}<ul class="fleet-list">${fleet.map(([name,n,color])=>`<li style="--c:${color}"><span>${name}</span><b>${n}<small> 辆</small></b></li>`).join('')}</ul></div></section>`;
}

function roadPanel() {
  const roads = [
    ['port','码头接驳区','畅通',7],
    ['beach','石螺口路段','畅通',6],
    ['bay','南湾街','缓行',3]
  ];
  const rows = roads.map(([place,name,status,n]) => {
    const color = status==='缓行'?'amber':'mint';
    const bar = Array.from({length:8},(_,i)=>i<n?`<i style="background:var(--${color})"></i>`:'<i></i>').join('');
    return `<button class="road-row" data-place="${place}"><span class="roadname">${name}</span><span class="bar" aria-hidden="true">${bar}</span><b class="${color}-t">${status}</b>${ico('chevron')}</button>`;
  }).join('');
  return `<section class="panel health">${panelHeader('道路运行指数','signal','<span class="tag-static"><i class="live-dot"></i> 监测中</span>')}<div class="gauge-box">${gaugeChart()}</div><div class="road-list">${rows}</div></section>`;
}

function eventRows(items,handled) {
  return items.map(event => {
    const place = places.find(p=>p.id===event.place);
    const done = handled.has(event.id);
    const icon = done ? 'check' : event.severity==='amber'?'alert':'people';
    return `<button class="event-row" data-event="${event.id}" style="--c:var(--${done?'mint':event.severity})"><span class="event-symbol">${ico(icon)}</span><span class="event-text"><strong>${event.name}</strong><small><em>${done?'已处置':event.level}</em><i>·</i>${place.name}</small></span><time>${event.time}</time></button>`;
  }).join('');
}

function trafficEventsPanel(handled) {
  const all = `<button class="mini-head" data-action="events">查看全部 ${ico('chevron')}</button>`;
  return `<section class="panel events">${panelHeader('交通事件','alert',all)}<div class="event-list">${eventRows(events,handled)}</div></section>`;
}

function routePanels(selectedLine) {
  const active = lines[selectedLine] || lines[0];
  const entries = lines.map((line,i)=>`<button class="line-choice${line===active?' chosen':''}" style="--c:${line.color}" data-line="${i}" aria-pressed="${line===active}"><span class="line-code">${line.id}</span><span>${line.name}</span>${ico('chevron')}</button>`).join('');
  const stops = active.stops.map((key,i)=>{
    const place = places.find(p=>p.id===key);
    return `<button data-place="${key}" class="stop-item"><span class="stop-dot"></span><strong>${place.name}</strong><small>${i===0?'始发':i===active.stops.length-1?'末站':place.sub}</small></button>`;
  }).join('');
  return `<section class="panel routes-list">${panelHeader('运营线路','route','<span class="tag-static">3 条在线</span>')}<div class="line-choices">${entries}</div></section>
    <section class="panel route-detail" style="--c:${active.color}">${panelHeader(active.name,'bus',`<span class="line-code">${active.id}</span>`)}
    <div class="klabel">今日运送客流</div><div class="total-num">${active.people.toLocaleString('en-US')}<small>人次</small></div>
    <div class="route-stats"><span><b>${active.vehicles}</b> 辆在运</span><span>每 <b>${active.headway}</b> 分钟一班</span></div>
    <div class="stop-list">${stops}</div></section>`;
}

function eventModePanels(handled) {
  const total = events.length;
  const closed = events.filter(e=>handled.has(e.id));
  const open = total - closed.length;
  const pct = Math.round(100 * closed.length / total);
  const progress = `<section class="panel event-overview">${panelHeader('事件概况','alert','<span class="mini-head">今日</span>')}<div class="event-metrics"><div><strong>${open}</strong><small>待处置</small></div><div><strong>${closed.length}</strong><small>已处置</small></div><div><strong>${total}</strong><small>事件总数</small></div></div><div class="closure"><span>处置完成率</span><b>${pct}%</b></div><div class="closure-bar"><i style="width:${pct}%"></i></div></section>`;
  const list = `<section class="panel event-feed">${panelHeader('事件列表','list')}<div class="event-list">${eventRows(events,handled)}</div></section>`;
  const resolved = [...handled].reverse().map(id=>events.find(e=>e.id===id)).filter(Boolean);
  const history = `<section class="panel recent-events">${panelHeader('最近处置','check',`<span class="mini-head">${closed.length} 条</span>`)}<div class="event-list handled-list">${resolved.length ? eventRows(resolved,handled) : '<div class="empty-state">暂无已处置事件</div>'}</div></section>`;
  return [progress+list,roadPanel()+history];
}

function renderPanels(mode, period = '今日', selectedLine = 0, handled = new Set(events.filter(e=>e.done).map(e=>e.id))) {
  const pair = mode==='events' ? eventModePanels(handled)
    : [mode==='routes' ? routePanels(selectedLine) : overviewPanels(period),roadPanel()+trafficEventsPanel(handled)];
  document.getElementById('left').innerHTML = pair[0];
  document.getElementById('right').innerHTML = pair[1];
}
