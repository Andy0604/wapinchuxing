/* Compact SVG charts for the offline monitoring screen. */
let chartSerial = 0;
function chartId(prefix) {
  return prefix + '-' + (++chartSerial);
}
function chartCurve(points) {
  return points.reduce((path, point, i) => {
    if (i === 0) return 'M' + point.join(' ');
    const previous = points[i - 1];
    const middle = (previous[0] + point[0]) / 2;
    return path + ' C' + middle + ' ' + previous[1] + ' ' + middle + ' ' + point[1] + ' ' + point.join(' ');
  }, '');
}
function overviewChart(period = '今日') {
  const values = period === '昨日'
    ? [9, 16, 13, 19, 22, 16, 25, 29, 20, 24, 31, 26, 18, 21, 27, 22, 25, 32]
    : [7, 13, 10, 17, 15, 24, 21, 28, 19, 23, 29, 26, 21, 31, 27, 36, 30, 39];
  const id = chartId('bar');
  const bars = values.map((v, i) => '<rect x="' + (2 + i * 6.55) + '" y="' + (42-v) + '" width="3.6" height="' + v + '" rx=".8"/>').join('');
  return `<svg class="overview-chart" viewBox="0 0 120 45" width="120" height="45" role="img" aria-label="${period}交通量变化"><defs><linearGradient id="${id}" x2="0" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="#55f1cd"/><stop offset="1" stop-color="#20897f" stop-opacity=".2"/></linearGradient></defs><path d="M0 42.5H120" stroke="#23505a"/><g fill="url(#${id})">${bars}</g></svg>`;
}
function flowChart(period = '今日') {
  const id = chartId('flow');
  const current = period === '昨日'
    ? [14,12,17,23,32,29,55,51,48,69,64,73,57,53,43,35,46]
    : [14,18,12,20,24,41,36,62,51,47,68,59,76,52,61,46,55];
  const comparison = period === '昨日'
    ? [12,11,14,22,24,36,26,44,41,51,46,61,42,38,40,31,36]
    : [14,12,17,23,32,29,55,51,48,69,64,73,57,53,43,35,46];
  const pathFor = values => chartCurve(values.map((v,i) => [26 + i * 14.75, +(83 - v * .91).toFixed(2)]));
  const line = pathFor(current), baseline = pathFor(comparison);
  const grid = [0, 40, 80].map(v => {
    const y = 83 - v * .91;
    return `<path d="M26 ${y}H263" stroke="#577789" stroke-opacity=".27" stroke-dasharray="2 4"/><text x="19" y="${y + 3}" text-anchor="end">${v}</text>`;
  }).join('');
  const ticks = ['00:00', '06:00', '12:00', '18:00', '24:00'].map((t,i) => `<text x="${26 + 59 * i}" y="100" text-anchor="${i===0?'start':i===4?'end':'middle'}">${t}</text>`).join('');
  return `<svg class="flow-chart" viewBox="0 0 270 105" width="100%" height="105" role="img" aria-label="${period}与前日各时段客流趋势"><defs><linearGradient id="${id}" x2="0" y2="1"><stop stop-color="#55f1cd" stop-opacity=".34"/><stop offset="1" stop-color="#55f1cd" stop-opacity=".015"/></linearGradient></defs><g font-family="monospace" font-size="8.5" fill="#8ca9bb">${grid}${ticks}</g><path d="${line} L262 83H26Z" fill="url(#${id})"/><path d="${baseline}" stroke="#3ba9ff" stroke-width="1.6" stroke-dasharray="4 3" fill="none"/><path d="${line}" stroke="#55f1cd" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`;
}
function fleetChart() {
  const segments = [[56,'#55f1cd'],[42,'#3ba9ff'],[30,'#8d87fc']];
  let offset = 0;
  const arcs = segments.map(([n,color]) => {
    const start = offset;
    offset += 100 * n / 128;
    return `<circle cx="50" cy="50" r="40" pathLength="100" transform="rotate(-90 50 50)" fill="none" stroke="${color}" stroke-width="7" stroke-dasharray="${(100*n/128-1.65).toFixed(2)} 100" stroke-dashoffset="${-start}"/>`;
  }).join('');
  return `<svg class="fleet-chart" viewBox="0 0 100 100" width="100" height="100" role="img" aria-label="三类车队共128辆"><circle cx="50" cy="50" r="47" fill="none" stroke="#36515f" stroke-width=".7" stroke-dasharray="1 3"/>${arcs}<circle cx="50" cy="50" r="33" fill="none" stroke="#34515f" stroke-width=".65"/><g text-anchor="middle"><text x="50" y="53" font-family="ui-monospace,monospace" font-size="23" font-weight="600" fill="#eefaff">128</text><text x="50" y="67" font-size="9" fill="#9ab4c1">辆</text></g></svg>`;
}
function gaugeChart() {
  const id = chartId('gauge');
  const arc = 'M20 81 A70 70 0 0 1 160 81';
  const ticks = Array.from({length: 29}, (_,i) => {
    const angle = Math.PI * (1 + i / 28);
    const polar = r => [(90 + Math.cos(angle)*r).toFixed(2),(81 + Math.sin(angle)*r).toFixed(2)].join(' ');
    return `<path d="M${polar(i%7===0?57:60)}L${polar(63)}" stroke="${i<=24?'#72c8c2':'#435769'}" stroke-width="${i%7===0?1.6:.8}"/>`;
  }).join('');
  return `<svg class="gauge-chart" viewBox="0 0 180 100" width="180" height="100" role="img" aria-label="交通畅通指数86.4"><defs><linearGradient id="${id}"><stop stop-color="#3ba9ff"/><stop offset=".85" stop-color="#55f1cd"/></linearGradient><filter id="${id}-b" x="-20%" width="140%" y="-50%" height="200%"><feGaussianBlur stdDeviation="2.5"/></filter></defs><path d="${arc}" stroke="#1a3543" stroke-width="6" fill="none"/><g fill="none" stroke="url(#${id})" stroke-linecap="round"><path d="${arc}" pathLength="100" stroke-dasharray="86.4 100" stroke-width="8" opacity=".4" filter="url(#${id}-b)"/><path d="${arc}" pathLength="100" stroke-dasharray="86.4 100" stroke-width="5"/></g>${ticks}<g text-anchor="middle"><text x="90" y="70" fill="#ecfffa" font-size="28" font-weight="600" font-family="ui-monospace,monospace">86.4</text><text x="90" y="87" fill="#55f1cd" font-size="10">畅通</text></g><g font-size="8" fill="#7896a7" font-family="monospace"><text x="17" y="96">0</text><text x="151" y="96">100</text></g></svg>`;
}
