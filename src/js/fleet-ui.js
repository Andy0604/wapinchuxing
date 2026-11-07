function busPlaceName(id) {
  return places.find(place => place.id === id)?.name || '—';
}

function busLineName(vehicle) {
  return (lines[vehicle.line] || lines.find(line => line.id === vehicle.line))?.name || '';
}

function busPercentage(sample) {
  return Math.round(100 * Math.max(0, Math.min(1, sample.progress)));
}

function busMinutes(value) {
  return Math.max(0, Math.ceil(Number(value)));
}

function busStatusClass(status) {
  return status === '停靠中' ? 'at-stop' : 'on-road';
}

function renderFleetRoster(vehicles, sampleOf, selectedId) {
  const rows = vehicles.map(vehicle => {
    const sample = sampleOf(vehicle);
    const selected = vehicle.id === selectedId;
    return `<button type="button" class="bus-roster-row" data-bus="${vehicle.id}" aria-pressed="${selected}">
      <span class="bus-roster-top"><span class="bus-roster-brand">哇品出行</span><b class="bus-roster-id">${vehicle.id}</b><span class="bus-state ${busStatusClass(sample.status)}" data-field="state">${sample.status === '停靠中' ? '停靠中' : '在线'}</span></span>
      <span class="bus-roster-bottom"><span class="bus-roster-direction"><span data-field="from">${busPlaceName(sample.from)}</span><i>→</i><span data-field="to">${busPlaceName(sample.to)}</span></span><span class="bus-roster-load">${ico('people')} <b data-field="passengers">${sample.passengers}</b>人</span></span>
    </button>`;
  }).join('');
  return `<section class="panel fleet-roster"><div class="panel-head"><h3 class="panel-title">${ico('bus')}车辆监控</h3><span class="tag-static">${vehicles.length} 辆监管</span></div><div class="bus-roster-list">${rows}</div></section>`;
}

function renderBusCard(vehicle, sample, follow) {
  const pct = busPercentage(sample);
  return `<article class="bus-card" data-bus-card="${vehicle.id}">
    <div class="detail-head"><div><div class="bus-card-brand">${ico('bus')} 哇品出行<span>${busLineName(vehicle)}</span></div><h3 class="bus-card-id">${vehicle.id} <span class="bus-state ${busStatusClass(sample.status)}" data-field="state">${sample.status}</span></h3></div><button class="icbtn" type="button" data-action="closeDetail" aria-label="关闭车辆详情">${ico('close')}</button></div>
    <div class="bus-itinerary"><span><small>始发站</small><strong data-field="from">${busPlaceName(sample.from)}</strong></span>${ico('arrow')}<span><small>终点站</small><strong data-field="to">${busPlaceName(sample.to)}</strong></span></div>
    <div class="bus-trip-track" role="progressbar" aria-label="本程进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" style="--trip-position:${pct}%"><i></i><b></b></div>
    <div class="bus-trip-key"><span><i></i>已行 <b data-field="traveledKm">${sample.traveledKm.toFixed(1)}</b> km</span><span><i></i>待行 <b data-field="remainingKm">${Math.max(0,sample.totalKm-sample.traveledKm).toFixed(1)}</b> km</span></div>
    <div class="bus-segment"><div><small data-field="prevLabel">${sample.status === '停靠中' ? '停靠站' : '上一站'}</small><span data-field="prevStop">${busPlaceName(sample.prevStop)}</span></div><div><small>下一站</small><span data-field="nextStop">${busPlaceName(sample.nextStop)}</span></div></div>
    <div class="bus-telemetry"><div><small>实载 / 核载</small><div><b data-field="passengers">${sample.passengers}</b><em> / <span data-field="capacity">${sample.capacity}</span> 人</em></div></div><div><small>车速</small><div><b data-field="speed">${Math.round(sample.speed)}</b><em> km/h</em></div></div><div><small>距下一站</small><div><b data-field="etaMinutes">${busMinutes(sample.etaMinutes)}</b><em> 分钟</em></div></div></div>
    ${Number.isFinite(sample.terminalEtaMinutes) ? `<div class="bus-end-eta"><span>预计抵达终点</span><strong><b data-field="terminalEtaMinutes">${busMinutes(sample.terminalEtaMinutes)}</b> 分钟后</strong></div>` : ''}
    <div class="bus-card-actions"><button type="button" data-action="busFollow" aria-pressed="${!!follow}">${ico('location')}<span data-field="followLabel">${follow?'取消跟随':'跟随车辆'}</span></button><button type="button" data-action="busRoute">${ico('route')}查看线路</button></div>
  </article>`;
}

/* The simulation updates only the text and attributes of the current component.
   Its interactive buttons keep their focus and pointer targets during each tick. */
function setBusField(root, key, value) {
  const field = root.querySelector('[data-field="' + key + '"]');
  const text = String(value);
  if (field && field.textContent !== text) field.textContent = text;
}

function updateFleetRoster(root, vehicles, sampleOf, selectedId) {
  const roster = root?.matches('.fleet-roster') ? root : root?.querySelector('.fleet-roster');
  if (!roster) return;
  const byId = new Map(vehicles.map(vehicle => [vehicle.id, vehicle]));
  for (const row of roster.querySelectorAll('[data-bus]')) {
    const vehicle = byId.get(row.dataset.bus);
    if (!vehicle) continue;
    const sample = sampleOf(vehicle);
    row.setAttribute('aria-pressed', String(vehicle.id === selectedId));
    setBusField(row, 'state', sample.status === '停靠中' ? '停靠中' : '在线');
    row.querySelector('.bus-state').className = 'bus-state ' + busStatusClass(sample.status);
    setBusField(row, 'from', busPlaceName(sample.from));
    setBusField(row, 'to', busPlaceName(sample.to));
    setBusField(row, 'passengers', sample.passengers);
  }
}

function updateBusCard(root, vehicle, sample, follow) {
  const card = root?.matches('.bus-card') ? root : root?.querySelector('.bus-card');
  if (!card || card.dataset.busCard !== vehicle.id) return;
  for (const key of ['from', 'to', 'prevStop', 'nextStop']) setBusField(card, key, busPlaceName(sample[key]));
  for (const key of ['passengers', 'capacity']) setBusField(card, key, sample[key]);
  setBusField(card, 'etaMinutes', busMinutes(sample.etaMinutes));
  if (Number.isFinite(sample.terminalEtaMinutes)) setBusField(card, 'terminalEtaMinutes', busMinutes(sample.terminalEtaMinutes));
  setBusField(card, 'prevLabel', sample.status === '停靠中' ? '停靠站' : '上一站');
  setBusField(card, 'speed', Math.round(sample.speed));
  setBusField(card, 'state', sample.status);
  setBusField(card, 'followLabel', follow ? '取消跟随' : '跟随车辆');
  setBusField(card, 'traveledKm', sample.traveledKm.toFixed(1));
  setBusField(card, 'remainingKm', Math.max(0, sample.totalKm-sample.traveledKm).toFixed(1));
  const pct = busPercentage(sample);
  const track = card.querySelector('.bus-trip-track');
  track.style.setProperty('--trip-position', pct + '%');
  track.setAttribute('aria-valuenow', String(pct));
  card.querySelector('.bus-state').className = 'bus-state ' + busStatusClass(sample.status);
  card.querySelector('[data-action="busFollow"]').setAttribute('aria-pressed', String(!!follow));
}
