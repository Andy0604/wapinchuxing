function panelHeader(name, badge = '', icon = '') {
  const icoHtml = icon ? ico(icon) : '';
  return `<div class="panel-head"><h3 class="panel-title">${icoHtml}${name}</h3>${badge}</div>`;
}

/* --------------------------------------------------------------------------
   左侧模块 1A: 未来客流预测 (基于船票预售 - 柱状图)
   -------------------------------------------------------------------------- */
function forecastFlowPanel() {
  const badge = `<span class="tag-badge">基于船票预售</span>`;
  const days = [
    { day: '明日 周六', val: '12,000', h: 72, highlight: false },
    { day: '周日', val: '13,500', h: 90, highlight: false },
    { day: '周一', val: '9,800', h: 58, highlight: false },
    { day: '周二', val: '7,200', h: 42, highlight: true },
    { day: '周三', val: '8,500', h: 52, highlight: false }
  ];

  const bars = days.map(d => `
    <div class="forecast-col ${d.highlight ? 'is-gold' : ''}">
      <span class="f-val font-num">${d.val}</span>
      <div class="f-bar-wrap">
        <div class="f-bar-fill" style="height: ${d.h}%;"></div>
      </div>
      <span class="f-day">${d.day}</span>
    </div>
  `).join('');

  return `<section class="panel panel-forecast">
    ${panelHeader('未来客流预测', badge)}
    <div class="forecast-bars-grid">${bars}</div>
  </section>`;
}

/* --------------------------------------------------------------------------
   左侧模块 1B: 全岛出行总览 (客流大指标 + 4格天气海况)
   -------------------------------------------------------------------------- */
function islandOverviewPanel(period = '今日') {
  const badge = `<button class="tag-badge" data-action="period">${period}</button>`;
  return `<section class="panel panel-overview">
    ${panelHeader('全岛出行总览', badge)}
    <div class="overview-dual">
      <div class="metric-card">
        <span class="m-lbl">今日上岛客流</span>
        <div class="m-val"><strong>7,000</strong><small>人次</small></div>
        <div class="m-delta up">较昨日 <span class="c-arrow">▲</span> <b>10.4%</b></div>
      </div>
      <div class="metric-card">
        <span class="m-lbl">今日运送客流</span>
        <div class="m-val"><strong>1,320</strong><small>人次</small></div>
        <div class="m-badges">
          <span class="badge-pill">363 单</span>
          <span class="m-delta up">较昨日 <span class="c-arrow">▲</span> <b>10%</b></span>
        </div>
      </div>
    </div>
    <div class="env-grid">
      <div class="env-box">
        <span class="env-ico c-sun">${ico('sun')}</span>
        <strong class="env-val">26°C</strong>
        <small class="env-lbl">天气</small>
      </div>
      <div class="env-box">
        <span class="env-ico c-wind">${ico('wind')}</span>
        <strong class="env-val">5级</strong>
        <small class="env-lbl">东北风</small>
      </div>
      <div class="env-box">
        <span class="env-ico c-wave">${ico('wave')}</span>
        <strong class="env-val">1.2m</strong>
        <small class="env-lbl">浪高</small>
      </div>
      <div class="env-box">
        <span class="env-ico c-anchor">${ico('anchor')}</span>
        <strong class="env-val c-mint">通航</strong>
        <small class="env-lbl">航线状态</small>
      </div>
    </div>
  </section>`;
}

/* --------------------------------------------------------------------------
   左侧模块 2A: 订单趋势 (平滑折线图 - 06:00-22:00 每两小时)
   -------------------------------------------------------------------------- */
let orderTrendPeriod = '今日';

function setOrderTrendPeriod(p) {
  orderTrendPeriod = p;
  const pnl = document.querySelector('.panel-order-trend');
  if (pnl) {
    pnl.outerHTML = orderTrendPanel(orderTrendPeriod);
  } else if (typeof updatePanels === 'function') {
    updatePanels();
  }
}

function orderTrendPanel(period = orderTrendPeriod) {
  const badge = `
    <div class="trend-tabs">
      <button class="tag-badge ${period === '今日' ? 'active' : ''}" data-action="setOrderTrend" data-trend-period="今日">今日</button>
      <button class="tag-badge ${period === '昨日' ? 'active' : ''}" data-action="setOrderTrend" data-trend-period="昨日">昨日</button>
    </div>
  `;

  const points = period === '今日'
    ? [
        { t: '06:00', v: 0 },
        { t: '08:00', v: 68 },
        { t: '10:00', v: 102 },
        { t: '12:00', v: 68 },
        { t: '14:00', v: 85 },
        { t: '16:00', v: 40 },
        { t: '18:00', v: 0 },
        { t: '20:00', v: 0 },
        { t: '22:00', v: 0 }
      ]
    : [
        { t: '06:00', v: 0 },
        { t: '08:00', v: 54 },
        { t: '10:00', v: 88 },
        { t: '12:00', v: 60 },
        { t: '14:00', v: 76 },
        { t: '16:00', v: 35 },
        { t: '18:00', v: 0 },
        { t: '20:00', v: 0 },
        { t: '22:00', v: 0 }
      ];

  const coords = points.map((p, i) => {
    const x = 24 + i * 56.5;
    const y = 110 - (p.v / 115) * 88;
    return { x, y, v: p.v, t: p.t };
  });

  let pathD = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i];
    const p1 = coords[i + 1];
    const mx = (p0.x + p1.x) / 2;
    pathD += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  const areaD = `${pathD} L ${coords[coords.length - 1].x} 122 L ${coords[0].x} 122 Z`;

  const circles = coords.map(c => `
    <circle cx="${c.x}" cy="${c.y}" r="3.5" class="trend-pt" filter="drop-shadow(0 0 5px #00d8ff)"/>
  `).join('');

  const xLabels = points.map(p => `<span>${p.t}</span>`).join('');

  return `<section class="panel panel-order-trend">
    ${panelHeader('订单趋势', badge)}
    <div class="trend-sub-bar">
      <span class="trend-unit">订单 / 2小时</span>
      <span class="trend-peak-lbl">最高时段: <b>10:00 (${period === '今日' ? '102' : '88'}单)</b></span>
    </div>
    <div class="trend-svg-wrap">
      <svg viewBox="0 0 500 128" preserveAspectRatio="none">
        <defs>
          <linearGradient id="orderTrendAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#00d8ff" stop-opacity="0.38"/>
            <stop offset="100%" stop-color="#00d8ff" stop-opacity="0.01"/>
          </linearGradient>
        </defs>
        <line x1="24" y1="22" x2="476" y2="22" stroke="rgba(125,185,245,0.12)" stroke-dasharray="3,3"/>
        <line x1="24" y1="66" x2="476" y2="66" stroke="rgba(125,185,245,0.12)" stroke-dasharray="3,3"/>
        <line x1="24" y1="110" x2="476" y2="110" stroke="rgba(125,185,245,0.16)"/>
        <path d="${areaD}" fill="url(#orderTrendAreaGrad)"/>
        <path d="${pathD}" fill="none" stroke="#00d8ff" stroke-width="2.6" stroke-linecap="round"/>
        ${circles}
      </svg>
      <div class="trend-axis-x">${xLabels}</div>
    </div>
  </section>`;
}

/* --------------------------------------------------------------------------
   左侧模块 2B: 运营监控 (GMV + 客单价 + 订单状态格)
   -------------------------------------------------------------------------- */
function operationsMonitorPanel() {
  const badge = `<span class="tag-badge">订单总数 363</span>`;
  return `<section class="panel panel-ops">
    ${panelHeader('运营监控', badge)}
    <div class="gmv-dual">
      <div class="gmv-left">
        <span class="m-lbl">今日营收 <small>GMV</small></span>
        <div class="gmv-val">¥13,068</div>
        <div class="m-delta up">较昨日 <span class="c-arrow">▲</span> <b>10%</b></div>
      </div>
      <div class="arpu-card">
        <div class="arpu-val">¥36</div>
        <div class="arpu-lbl">客单价</div>
      </div>
    </div>
    <div class="order-grid">
      <div class="order-box box-cancel">
        <strong class="font-num num-cancel">45</strong>
        <small>已取消</small>
      </div>
      <div class="order-box box-done">
        <strong class="font-num num-done">289</strong>
        <small>已完成</small>
      </div>
      <div class="order-box box-serving">
        <strong class="font-num num-serving">17</strong>
        <small>服务中</small>
      </div>
      <div class="order-box box-pending">
        <strong class="font-num num-pending">12</strong>
        <small>待接单</small>
      </div>
    </div>
    <div class="order-progress-strip" title="订单状态比例分布: 已完成 289单 (79.6%) / 已取消 45单 (12.4%) / 服务中 17单 (4.7%) / 待接单 12单 (3.3%)">
      <span class="seg cancel" style="width: 12.4%;" title="已取消: 45单 (12.4%)"></span>
      <span class="seg done" style="width: 79.6%;" title="已完成: 289单 (79.6%)"></span>
      <span class="seg serving" style="width: 4.7%;" title="服务中: 17单 (4.7%)"></span>
      <span class="seg pending" style="width: 3.3%;" title="待接单: 12单 (3.3%)"></span>
    </div>
  </section>`;
}

/* --------------------------------------------------------------------------
   左侧模块 3: 服务监控 (5个指标 + 左:车辆区域分布 + 右:出发地/目的地)
   -------------------------------------------------------------------------- */
const queueOrderDetails = [
  {
    id: 'WZ202611070347',
    status: '服务中',
    passengerPhone: '1886****4562',
    useTime: '今日 16:31',
    driver: '杨其静 (WZ-129)',
    driverPhone: '1356****6498',
    from: '鳄鱼山景区',
    to: '南湾街',
    route: '鳄鱼山景区 火山口 → 南湾街 餐饮一条街',
    pax: '5 / 7 人',
    paxCount: '5 人',
    price: '¥38.00',
    wait: '02:00',
    timeline: [
      { name: '叫车时间', time: '16:31' },
      { name: '司机接单时间', time: '16:32' },
      { name: '司机出发时间', time: '16:32' },
      { name: '司机接到乘客时间', time: '16:34' }
    ]
  },
  {
    id: 'WZ202611070348',
    status: '服务中',
    passengerPhone: '1597****8823',
    useTime: '今日 16:32',
    driver: '谢荣锋 (WZ-128)',
    driverPhone: '1387****1290',
    from: '盛塘天主教堂',
    to: '斜阳岛码头',
    route: '盛塘天主教堂 → 斜阳岛码头',
    pax: '2 / 7 人',
    paxCount: '2 人',
    price: '¥32.00',
    wait: '05:00',
    timeline: [
      { name: '叫车时间', time: '16:32' },
      { name: '司机接单时间', time: '16:33' },
      { name: '司机出发时间', time: '16:34' },
      { name: '司机接到乘客时间', time: '16:38' }
    ]
  },
  {
    id: 'WZ202611070349',
    status: '服务中',
    passengerPhone: '1397****5519',
    useTime: '今日 16:33',
    driver: '陈纲 (WZ-132)',
    driverPhone: '1390****7761',
    from: '东安村',
    to: '西角码头',
    route: '东安村 → 西角码头（客运码头）',
    pax: '2 / 7 人',
    paxCount: '2 人',
    price: '¥35.00',
    wait: '08:00',
    timeline: [
      { name: '叫车时间', time: '16:33' },
      { name: '司机接单时间', time: '16:34' },
      { name: '司机出发时间', time: '16:35' },
      { name: '司机接到乘客时间', time: '16:42' }
    ]
  },
  {
    id: 'WZ202611070350',
    status: '服务中',
    passengerPhone: '1770****9932',
    useTime: '今日 16:33',
    driver: '杨晶红 (WZ-112)',
    driverPhone: '1361****3452',
    from: '西角码头',
    to: '北港村',
    route: '西角码头（客运码头） → 北港村',
    pax: '4 / 7 人',
    paxCount: '4 人',
    price: '¥36.00',
    wait: '02:00',
    timeline: [
      { name: '叫车时间', time: '16:33' },
      { name: '司机接单时间', time: '16:34' },
      { name: '司机出发时间', time: '16:35' },
      { name: '司机接到乘客时间', time: '16:36' }
    ]
  },
  {
    id: 'WZ202611070351',
    status: '服务中',
    passengerPhone: '1827****1039',
    useTime: '今日 16:35',
    driver: '刘晓云 (WZ-101)',
    driverPhone: '1378****9921',
    from: '滴水村',
    to: '南湾海鲜市场',
    route: '滴水村 民宿区 → 南湾街 海鲜市场',
    pax: '5 / 7 人',
    paxCount: '5 人',
    price: '¥36.00',
    wait: '02:00',
    timeline: [
      { name: '叫车时间', time: '16:35' },
      { name: '司机接单时间', time: '16:36' },
      { name: '司机出发时间', time: '16:37' },
      { name: '司机接到乘客时间', time: '16:38' }
    ]
  },
  {
    id: 'WZ202611070352',
    status: '服务中',
    passengerPhone: '1368****4427',
    useTime: '今日 16:37',
    driver: '李景 (WZ-126)',
    driverPhone: '1587****6618',
    from: '盛塘天主教堂',
    to: '西角码头',
    route: '盛塘天主教堂 → 西角码头（客运码头）',
    pax: '4 / 7 人',
    paxCount: '4 人',
    price: '¥42.00',
    wait: '02:00',
    timeline: [
      { name: '叫车时间', time: '16:37' },
      { name: '司机接单时间', time: '16:38' },
      { name: '司机出发时间', time: '16:39' },
      { name: '司机接到乘客时间', time: '16:40' }
    ]
  }
];

function serviceMonitorPanel() {
  const badge = `<span class="tag-badge mint-tag"><i class="live-dot"></i>实时</span>`;
  const rows = queueOrderDetails.slice(0, 5).map((q, idx) => `
    <div class="queue-row" data-action="openOrder" data-queue-idx="${idx}" role="button" tabindex="0" title="点击查看车辆订单详情">
      <div class="queue-route">
        <span class="q-stop from">${q.from}</span>
        <span class="q-stop to">${q.to}</span>
      </div>
      <div class="queue-meta">
        <span class="q-pax font-num">${q.paxCount}</span>
        <span class="q-time font-num">${q.wait}</span>
      </div>
    </div>
  `).join('');

  const areaDistItems = [
    { name: '南湾运动公园', count: 12, pct: 100, color: '#f59e0b' },
    { name: '西角码头', count: 5, pct: 42, color: '#10b981' },
    { name: '鳄鱼山景区', count: 5, pct: 42, color: '#00d8ff' },
    { name: '五彩滩景区', count: 4, pct: 33, color: '#38bdf8' },
    { name: '石螺口景区', count: 3, pct: 25, color: '#38bdf8' },
    { name: '天主教堂', count: 2, pct: 17, color: '#38bdf8' },
    { name: '其他', count: 1, pct: 8, color: '#38bdf8' }
  ];

  const distRows = areaDistItems.map(item => `
    <div class="dist-row">
      <span class="dist-name">${item.name}</span>
      <div class="dist-bar"><i style="width: ${item.pct}%; background: ${item.color};"></i></div>
      <span class="dist-val font-num">${item.count}</span>
    </div>
  `).join('');

  return `<section class="panel panel-service">
    ${panelHeader('服务监控', badge)}
    <!-- 顶部 5 个业务指标 -->
    <div class="svc-5grid">
      <div class="svc-box">
        <div class="svc-num"><strong>4</strong><small>分钟</small></div>
        <div class="svc-lbl">平均等待时长</div>
      </div>
      <div class="svc-box">
        <div class="svc-num"><strong>84.3</strong><small>%</small></div>
        <div class="svc-lbl">应答率</div>
      </div>
      <div class="svc-box">
        <div class="svc-num"><strong>12.4</strong><small>%</small></div>
        <div class="svc-lbl">取消率</div>
      </div>
      <div class="svc-box">
        <div class="svc-num"><strong>78.2</strong><small>%</small></div>
        <div class="svc-lbl">2分钟内接单率</div>
      </div>
      <div class="svc-box">
        <div class="svc-num"><strong>22.9</strong><small>%</small></div>
        <div class="svc-lbl">1分钟内接单率</div>
      </div>
    </div>

    <!-- 下部双列复合：左侧车辆区域分布 + 右侧排队候车订单 -->
    <div class="svc-composite-body">
      <div class="svc-dist-col">
        <div class="svc-sub-head">
          <span class="ssh-title">车辆区域分布 (实时)</span>
          <span class="ssh-meta">在线 <b>32</b> 辆 · 按数量排序</span>
        </div>
        <div class="area-dist-list">${distRows}</div>
      </div>

      <div class="svc-queue-col">
        <div class="queue-header-row">
          <span>出发地 / 目的地</span>
          <span>人数 / 等候时长</span>
        </div>
        <div class="queue-list">${rows}</div>
      </div>
    </div>
  </section>`;
}

/* --------------------------------------------------------------------------
   右侧模块 1: 运力总览
   -------------------------------------------------------------------------- */
function capacityOverviewPanel() {
  const badge = `<span class="tag-badge mint-tag"><i class="live-dot"></i>实时</span>`;
  return `<section class="panel panel-capacity">
    ${panelHeader('运力总览', badge)}
    <div class="cap-grid">
      <div class="cap-box total">
        <strong class="cap-num font-num">32</strong>
        <small>车辆总数</small>
      </div>
      <div class="cap-box running">
        <strong class="cap-num font-num">20</strong>
        <small>运营中</small>
      </div>
      <div class="cap-box idle">
        <strong class="cap-num font-num">6</strong>
        <small>空驶</small>
      </div>
      <div class="cap-box service">
        <strong class="cap-num font-num">6</strong>
        <small>充电/维修</small>
      </div>
    </div>
    <div class="cap-dist-bar" title="运力分布: 运营 20 / 空驶 6 / 充维 6">
      <span class="seg-run" style="width: 62.5%;"></span>
      <span class="seg-idle" style="width: 18.75%;"></span>
      <span class="seg-serv" style="width: 18.75%;"></span>
    </div>
    <div class="cap-metrics-dual">
      <div class="cap-chip">
        <span class="cap-chip-lbl">车辆在线率</span>
        <span class="cap-chip-val font-num c-mint">100%</span>
      </div>
      <div class="cap-chip">
        <span class="cap-chip-lbl">平均满载率</span>
        <span class="cap-chip-val font-num c-cyan">86%</span>
      </div>
    </div>
  </section>`;
}

/* --------------------------------------------------------------------------
   右侧模块 2: 驾驶监控 (驾驶行为 + ADAS 统计，带今日预警 59 起)
   -------------------------------------------------------------------------- */
function vehicleBehaviorAndAdasPanel() {
  const adasLeft = [
    { name: '向前碰撞', val: 2, c: '#38bdf8', level: 'warn' },
    { name: '车道偏离报警', val: 16, c: '#ff5e6a', level: 'danger' },
    { name: '车距过近报警', val: 6, c: '#f59e0b', level: 'warn' },
    { name: '行人碰撞报警', val: 24, c: '#ff5e6a', level: 'danger' },
    { name: '频繁变道报警', val: 0, c: '#627d98', level: 'zero' }
  ];

  const adasRight = [
    { name: '道路标识超限报警', val: 0, c: '#627d98', level: 'zero' },
    { name: '障碍物报警', val: 0, c: '#627d98', level: 'zero' },
    { name: '盲区监测报警', val: 0, c: '#627d98', level: 'zero' },
    { name: '道路标识识别事件', val: 0, c: '#627d98', level: 'zero' },
    { name: '主动抓拍事件', val: 0, c: '#627d98', level: 'zero' }
  ];

  const renderAdas = item => `
    <div class="adas-item ${item.level}">
      <span class="adas-dot" style="--c:${item.c}"></span>
      <span class="adas-name">${item.name}</span>
      <strong class="adas-val font-num ${item.level}">${item.val}</strong>
    </div>
  `;

  return `<section class="panel panel-veh-behavior-adas">
    ${panelHeader('驾驶监控')}
    <div class="veh-split-grid">
      <!-- 左列: 驾驶行为 (10项) -->
      <div class="behavior-side">
        <div class="veh-sec-title">
          <div class="vst-left">${ico('bus')} <span>驾驶行为</span></div>
        </div>
        <div class="behavior-grid">
          <div class="b-item"><span class="b-dot blue"></span><span class="b-name">疲劳驾驶</span><span class="b-val font-num zero">0</span></div>
          <div class="b-item"><span class="b-dot amber"></span><span class="b-name">自动抓拍</span><span class="b-val font-num zero">0</span></div>
          <div class="b-item"><span class="b-dot blue"></span><span class="b-name">接打电话</span><span class="b-val font-num warn">1</span></div>
          <div class="b-item"><span class="b-dot red"></span><span class="b-name">驾驶员变更事件</span><span class="b-val font-num zero">0</span></div>
          <div class="b-item"><span class="b-dot blue"></span><span class="b-name">抽烟</span><span class="b-val font-num zero">0</span></div>
          <div class="b-item"><span class="b-dot red"></span><span class="b-name">未系安全带</span><span class="b-val font-num zero">0</span></div>
          <div class="b-item"><span class="b-dot blue"></span><span class="b-name">分神驾驶</span><span class="b-val font-num danger">8</span></div>
          <div class="b-item"><span class="b-dot red"></span><span class="b-name">摄像头遮挡</span><span class="b-val font-num zero">0</span></div>
          <div class="b-item"><span class="b-dot amber"></span><span class="b-name">驾驶员异常</span><span class="b-val font-num warn">2</span></div>
          <div class="b-item"><span class="b-dot blue"></span><span class="b-name">视线偏离</span><span class="b-val font-num zero">0</span></div>
        </div>
      </div>

      <!-- 右列: ADAS 统计 (10项，每列5项撑满) -->
      <div class="adas-side">
        <div class="veh-sec-title">
          <div class="vst-left">${ico('dish')} <span>ADAS 统计</span></div>
          <span class="tag-badge adas-badge">今日预警 59 起</span>
        </div>
        <div class="adas-grid">
          <div class="adas-col">${adasLeft.map(renderAdas).join('')}</div>
          <div class="adas-col">${adasRight.map(renderAdas).join('')}</div>
        </div>
      </div>
    </div>
  </section>`;
}

/* --------------------------------------------------------------------------
   右侧模块 3A: 车辆监控 (可轮播车辆列表卡片)
   -------------------------------------------------------------------------- */
const carouselVehicles = [
  // Page 1
  [
    { id: 'WZ-101', driver: '刘晓云', from: '滴水村', to: '南湾街', pax: '5人', bat: 92 },
    { id: 'WZ-102', driver: '卢献蜜', from: '井仔村', to: '北港村', pax: '6人', bat: 88 },
    { id: 'WZ-103', driver: '张红宇', from: '南湾街', to: '南湾街', pax: '6人', bat: 74 },
    { id: 'WZ-104', driver: '金洛林', from: '南湾街', to: '五彩滩', pax: '2人', bat: 63 },
    { id: 'WZ-105', driver: '于海洋', from: '蓝桥', to: '滴水丹屏', pax: '6人', bat: 85 }
  ],
  // Page 2
  [
    { id: 'WZ-106', driver: '陈红', from: '滴水村', to: '南湾街', pax: '6人', bat: 78 },
    { id: 'WZ-107', driver: '胡瀚文', from: '西角码头', to: '南湾运动公园', pax: '6人', bat: 90 },
    { id: 'WZ-108', driver: '钟永轩', from: '滴水村', to: '五彩滩', pax: '2人', bat: 68 },
    { id: 'WZ-109', driver: '陈义', from: '幕崖', to: '西角码头', pax: '6人', bat: 82 },
    { id: 'WZ-110', driver: '刘扬', from: '滴水丹屏', to: '南湾', pax: '4人', bat: 75 }
  ],
  // Page 3
  [
    { id: 'WZ-111', driver: '吴昊江', from: '石螺口海滩', to: '西角码头', pax: '2人', bat: 94 },
    { id: 'WZ-112', driver: '杨晶红', from: '西角码头', to: '北港村', pax: '4人', bat: 71 },
    { id: 'WZ-113', driver: '杨荣', from: '盛塘天主教堂', to: '斜阳岛码头', pax: '3人', bat: 86 },
    { id: 'WZ-114', driver: '周青青', from: '南湾', to: '石螺口', pax: '1人', bat: 65 },
    { id: 'WZ-115', driver: '张雷', from: '石螺口', to: '滴水村', pax: '4人', bat: 80 }
  ],
  // Page 4
  [
    { id: 'WZ-116', driver: '刘红君', from: '石螺口', to: '南湾', pax: '4人', bat: 77 },
    { id: 'WZ-117', driver: '邹勇', from: '南湾街', to: '西角码头', pax: '2人', bat: 89 },
    { id: 'WZ-118', driver: '余仁智', from: '贝壳沙滩', to: '地质博物馆', pax: '6人', bat: 59 },
    { id: 'WZ-119', driver: '罗传霞', from: '盛塘天主教堂', to: '西角码头', pax: '1人', bat: 83 },
    { id: 'WZ-120', driver: '李世伟', from: '五彩滩', to: '南湾街', pax: '4人', bat: 91 }
  ],
  // Page 5
  [
    { id: 'WZ-121', driver: '孙雄伟', from: '北港村', to: '南湾', pax: '4人', bat: 66 },
    { id: 'WZ-122', driver: '朱娇娇', from: '西角码头', to: '滴水村', pax: '4人', bat: 79 },
    { id: 'WZ-123', driver: '赵县平', from: '南湾街', to: '贝壳沙滩', pax: '4人', bat: 84 },
    { id: 'WZ-124', driver: '翟测试', from: '石螺口海滩', to: '南湾运动公园', pax: '5人', bat: 72 },
    { id: 'WZ-125', driver: '罗卿卿', from: '五彩滩', to: '南湾港', pax: '4人', bat: 88 }
  ],
  // Page 6
  [
    { id: 'WZ-126', driver: '李景', from: '盛塘天主教堂', to: '西角码头', pax: '4人', bat: 69 },
    { id: 'WZ-127', driver: '刘继超', from: '西角码头', to: '后背塘', pax: '2人', bat: 85 },
    { id: 'WZ-128', driver: '谢荣锋', from: '石螺口海滩', to: '西角码头', pax: '1人', bat: 62 },
    { id: 'WZ-129', driver: '杨其静', from: '鳄鱼山景区', to: '南湾街', pax: '5人', bat: 93 },
    { id: 'WZ-130', driver: '张锋', from: '五彩滩', to: '南湾港', pax: '2人', bat: 76 }
  ],
  // Page 7
  [
    { id: 'WZ-131', driver: '陈小合', from: '地质博物馆', to: '南湾', pax: '2人', bat: 81 },
    { id: 'WZ-132', driver: '陈纲', from: '东安村', to: '西角码头', pax: '2人', bat: 87 }
  ]
];

let currentVehPage = 0;
let vehCarouselTimer = null;

function renderVehRosterInner() {
  const pageCars = carouselVehicles[currentVehPage] || carouselVehicles[0];
  const totalPages = carouselVehicles.length;

  const carRows = pageCars.map(c => {
    const batClass = c.bat >= 70 ? 'bat-good' : c.bat >= 40 ? 'bat-mid' : 'bat-low';
    return `
      <div class="veh-card-mini" data-bus="${c.id}" role="button" tabindex="0" title="点击定位车辆 ${c.id}">
        <div class="vcm-left">
          <div class="vcm-id-row">
            <span class="vcm-dot"></span>
            <strong class="vcm-id font-num">${c.id}</strong>
          </div>
          <span class="vcm-driver">${c.driver}</span>
        </div>
        <div class="vcm-mid">
          <div class="vcm-stop"><i class="s-dot from"></i><span>${c.from}</span></div>
          <div class="vcm-stop"><i class="s-dot to"></i><span>${c.to}</span></div>
        </div>
        <div class="vcm-right">
          <span class="vcm-pax font-num">${c.pax.replace(/\/7/, '')}</span>
          <div class="vcm-bat ${batClass}">
            <span class="bat-icon"></span>
            <span class="font-num">${c.bat}%</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const dots = Array.from({ length: totalPages }, (_, i) => `
    <button class="pager-dot ${i === currentVehPage ? 'active' : ''}" data-action="setVehPage" data-page="${i}" aria-label="第 ${i + 1} 页"></button>
  `).join('');

  return `
    <div class="veh-roster-list">${carRows}</div>
    <div class="veh-roster-pager">
      <span class="pager-num font-num">${currentVehPage + 1}/${totalPages}</span>
      <div class="pager-dots">${dots}</div>
    </div>
  `;
}

function setVehCarouselPage(p) {
  currentVehPage = p;
  const el = document.getElementById('veh-roster-body');
  if (el) el.innerHTML = renderVehRosterInner();
}

function startVehCarousel() {
  if (vehCarouselTimer) clearInterval(vehCarouselTimer);
  vehCarouselTimer = setInterval(() => {
    currentVehPage = (currentVehPage + 1) % carouselVehicles.length;
    const el = document.getElementById('veh-roster-body');
    if (el) el.innerHTML = renderVehRosterInner();
  }, 4500);
}

function vehicleRosterCarouselPanel() {
  const badge = `<span class="tag-badge">在线 32/32 · 核载7人</span>`;
  return `<section class="panel panel-veh-carousel">
    ${panelHeader('车辆监控', badge)}
    <div id="veh-roster-body" class="veh-roster-body-wrap">
      ${renderVehRosterInner()}
    </div>
  </section>`;
}

/* --------------------------------------------------------------------------
   右侧模块 3B: 事件监控 (异常/预警/已处理 + 告警处置卡片及状态管理)
   -------------------------------------------------------------------------- */
const incidentStore = [
  {
    id: 'EV202611070006',
    time: '15:00',
    type: 'warn',
    tag: '预警',
    title: '船舶 15:30 分到港，客流上升',
    content: '监测到「北海—涠洲」航线 15:30 班次即将到港，预计客流大幅上升，西角码头候车运力需提前储备。',
    location: '西角码头',
    car: '—',
    action: '通知调度，增派车辆',
    status: '未处理'
  },
  {
    id: 'EV202611070005',
    time: '13:20',
    type: 'warn',
    tag: '预警',
    title: '船舶 13:50 分到港，客流上升',
    content: '监测到「北海—涠洲」航线 13:50 班次即将到港，预计客流上升，西角码头候车运力需调度补充。',
    location: '西角码头',
    car: '—',
    action: '通知调度，增派车辆',
    status: '未处理'
  },
  {
    id: 'EV202611070004',
    time: '12:30',
    type: 'warn',
    tag: '预警',
    title: '涠洲岛仙人掌基地路段施工，请绕行',
    content: '涠洲岛仙人掌基地周边路段施工，通行效率受阻，存在缓行拥堵风险。',
    location: '仙人掌基地路段',
    car: '—',
    action: '通知司机注意绕行',
    status: '已处理'
  },
  {
    id: 'EV202611070003',
    time: '11:20',
    type: 'warn',
    tag: '预警',
    title: '船舶 11:50 分到港，客流上升',
    content: '监测到「北海—涠洲」航线 11:50 班次到港，西角码头客流集中上升，调度增派车辆接驳。',
    location: '西角码头',
    car: '—',
    action: '通知调度，增派车辆',
    status: '已处理'
  },
  {
    id: 'EV202611070002',
    time: '10:58',
    type: 'warn',
    tag: '预警',
    title: '南湾海鲜市场多辆车速偏低，拥堵预警',
    content: '南湾海鲜市场路段多辆观光车实时车速偏低，道路拥挤，建议周边车辆绕行。',
    location: '南湾海鲜市场',
    car: 'WZ-103等',
    action: '通知司机注意绕行',
    status: '已处理'
  },
  {
    id: 'EV202611070001',
    time: '10:20',
    type: 'warn',
    tag: '预警',
    title: '船舶 10:50 分到港，客流上升',
    content: '监测到「北海—涠洲」航线 10:50 班次到港，客流显著上升，调度已增派接运车辆。',
    location: '西角码头',
    car: '—',
    action: '通知调度，增派车辆',
    status: '已处理'
  }
];

function incidentMonitorPanel(handled = new Set()) {
  const badge = `<span class="tag-badge">今日 6 起 · 待办 2 起</span>`;
  
  const unhandledWarn = incidentStore.filter(i => i.type === 'warn' && i.status !== '已处理').length;
  const unhandledErr = incidentStore.filter(i => i.type === 'err' && i.status !== '已处理').length;
  const okTotal = incidentStore.filter(i => i.status === '已处理').length;

  const displayCards = incidentStore.slice(0, 2);
  const cards = displayCards.map(item => `
    <div class="inc-v2-card ${item.type} ${item.status === '已处理' ? 'is-handled' : ''}" data-action="openIncident" data-inc-id="${item.id}" role="button" tabindex="0" title="点击查看事件详情">
      <div class="inc-v2-header">
        <div class="inc-v2-meta">
          <span class="inc-v2-badge ${item.type}">${item.tag}</span>
          <span class="inc-v2-time font-num">${item.time}</span>
        </div>
        <span class="inc-v2-status ${item.status === '已处理' ? 'ok' : ''}">${item.status}</span>
      </div>
      <div class="inc-v2-title">${item.title}</div>
      <div class="inc-v2-footer">
        <span class="inc-v2-act-lbl">处理方式:</span>
        <span class="inc-v2-act-val">${item.action}</span>
      </div>
    </div>
  `).join('');

  return `<section class="panel panel-incidents">
    ${panelHeader('事件监控', badge)}
    <div class="inc-stats-row">
      <div class="inc-stat-box err">
        <strong class="font-num">${unhandledErr}</strong>
        <small>异常</small>
      </div>
      <div class="inc-stat-box warn">
        <strong class="font-num">${unhandledWarn}</strong>
        <small>预警</small>
      </div>
      <div class="inc-stat-box ok">
        <strong class="font-num">${okTotal}</strong>
        <small>已处理</small>
      </div>
    </div>
    <div class="incident-list-v2">${cards}</div>
  </section>`;
}

/* --------------------------------------------------------------------------
   弹窗展示与处理函数
   -------------------------------------------------------------------------- */
function openOrderModal(idx) {
  const data = queueOrderDetails[idx] || queueOrderDetails[0];
  const modal = document.getElementById('order-modal') || document.getElementById('event-modal');
  if (!modal) return;
  modal.classList.remove('align-right');
  modal.innerHTML = `
    <div class="modal-head">
      <h3 class="modal-title">车辆订单详情</h3>
      <div class="modal-head-actions">
        <button class="modal-collapse-btn" data-action="closeOrderModal">收起</button>
      </div>
    </div>
    <div class="modal-dashed-card">
      <span class="modal-code font-num">${data.id}</span>
      <span class="modal-pill serving">${data.status}</span>
    </div>
    <div class="modal-grid-2">
      <div class="modal-sub-card">
        <span class="sc-label">乘客电话</span>
        <span class="sc-val font-num">${data.passengerPhone}</span>
      </div>
      <div class="modal-sub-card">
        <span class="sc-label">用车时间</span>
        <span class="sc-val font-num">${data.useTime}</span>
      </div>
      <div class="modal-sub-card">
        <span class="sc-label">司机 · 车牌</span>
        <span class="sc-val">${data.driver}</span>
      </div>
      <div class="modal-sub-card">
        <span class="sc-label">司机电话</span>
        <span class="sc-val font-num">${data.driverPhone}</span>
      </div>
      <div class="modal-sub-card full">
        <span class="sc-label">行程路线</span>
        <span class="sc-val">${data.route}</span>
      </div>
      <div class="modal-sub-card">
        <span class="sc-label">乘车人数</span>
        <span class="sc-val font-num">${data.pax}</span>
      </div>
      <div class="modal-sub-card">
        <span class="sc-label">订单金额</span>
        <span class="sc-val amber font-num">${data.price}</span>
      </div>
    </div>
    <div class="modal-section-title">订单流转明细</div>
    <div class="modal-timeline">
      ${data.timeline.map(t => `
        <div class="timeline-item">
          <span class="timeline-name">${t.name}</span>
          <span class="timeline-time">${t.time}</span>
        </div>
      `).join('')}
    </div>
  `;
  modal.hidden = false;
}

function openIncidentModal(id) {
  const item = incidentStore.find(i => i.id === id) || incidentStore[0];
  const modal = document.getElementById('incident-modal') || document.getElementById('event-modal');
  if (!modal) return;
  const isHandled = item.status === '已处理';
  modal.classList.add('align-right');
  modal.innerHTML = `
    <div class="modal-head">
      <h3 class="modal-title">事件详情</h3>
      <div class="modal-head-actions">
        <button class="modal-collapse-btn" data-action="closeIncidentModal">收起</button>
      </div>
    </div>
    <div class="modal-dashed-card">
      <span class="modal-code font-num">${item.id}</span>
      <span class="modal-pill ${isHandled ? 'handled' : 'unhandled'}">${item.status}</span>
    </div>
    <div class="modal-grid-2">
      <div class="modal-sub-card">
        <span class="sc-label">事件时间</span>
        <span class="sc-val font-num">今日 ${item.time}</span>
      </div>
      <div class="modal-sub-card">
        <span class="sc-label">事件等级</span>
        <span class="sc-val ${item.type === 'err' ? 'c-red' : 'warn'}">${item.tag}</span>
      </div>
      <div class="modal-sub-card full">
        <span class="sc-label">${item.tag}内容</span>
        <span class="sc-val sc-content">${item.content}</span>
      </div>
      <div class="modal-sub-card">
        <span class="sc-label">发生位置</span>
        <span class="sc-val">${item.location}</span>
      </div>
      <div class="modal-sub-card">
        <span class="sc-label">关联车辆</span>
        <span class="sc-val">${item.car}</span>
      </div>
      <div class="modal-sub-card full">
        <span class="sc-label">建议处理方式</span>
        <span class="sc-val blue">${item.action}</span>
      </div>
    </div>
    <div class="modal-actions">
      <button class="modal-btn cancel" data-action="closeIncidentModal">关闭</button>
      <button class="modal-btn primary" data-action="resolveIncident" data-inc-id="${item.id}" ${isHandled ? 'disabled' : ''}>
        ${isHandled ? '✓ 已处理' : '✓ 标记已处理'}
      </button>
    </div>
  `;
  modal.hidden = false;
}

function closeModal(target) {
  if (target === 'order') {
    const m = document.getElementById('order-modal');
    if (m) m.hidden = true;
  } else if (target === 'incident') {
    const m = document.getElementById('incident-modal');
    if (m) m.hidden = true;
  } else {
    ['order-modal', 'incident-modal', 'event-modal'].forEach(id => {
      const m = document.getElementById(id);
      if (m) m.hidden = true;
    });
  }
}

function resolveIncident(id) {
  const item = incidentStore.find(i => i.id === id);
  if (item && item.status !== '已处理') {
    item.status = '已处理';
    closeModal();
    if (typeof updatePanels === 'function') {
      updatePanels();
    } else if (typeof renderPanels === 'function') {
      renderPanels('overview');
    }
    if (typeof toast === 'function') {
      toast(`事件 ${item.id} 已标记为已处理`);
    }
  }
}

/* --------------------------------------------------------------------------
   保留原有线路监管与事件中心模式辅助视图
   -------------------------------------------------------------------------- */
function routePanels(selectedLine) {
  const active = lines[selectedLine] || lines[0];
  const entries = lines.map((line,i)=>`<button class="line-choice${line===active?' chosen':''}" style="--c:${line.color}" data-line="${i}" aria-pressed="${line===active}"><span class="line-code">${line.id}</span><span>${line.name}</span>${ico('chevron')}</button>`).join('');
  const stops = active.stops.map((key,i)=>{
    const place = places.find(p=>p.id===key);
    return `<button data-place="${key}" class="stop-item"><span class="stop-dot"></span><strong>${place.name}</strong><small>${i===0?'始发':i===active.stops.length-1?'末站':place.sub}</small></button>`;
  }).join('');
  return `<section class="panel routes-list">${panelHeader('运营线路','<span class="tag-badge mint-tag">3 条在线</span>')}<div class="line-choices">${entries}</div></section>
    <section class="panel route-detail" style="--c:${active.color}">${panelHeader(active.name,`<span class="line-code">${active.id}</span>`)}
    <div class="klabel">今日运送客流</div><div class="total-num">${active.people.toLocaleString('en-US')}<small>人次</small></div>
    <div class="route-stats"><span><b>${active.vehicles}</b> 辆在运</span><span>每 <b>${active.headway}</b> 分钟一班</span></div>
    <div class="stop-list">${stops}</div></section>`;
}

function eventModePanels(handled) {
  const total = events.length;
  const closed = events.filter(e=>handled.has(e.id));
  const open = total - closed.length;
  const pct = Math.round(100 * closed.length / total);
  const progress = `<section class="panel event-overview">${panelHeader('事件概况','<span class="tag-badge">今日</span>')}<div class="event-metrics"><div><strong>${open}</strong><small>待处置</small></div><div><strong>${closed.length}</strong><small>已处置</small></div><div><strong>${total}</strong><small>事件总数</small></div></div><div class="closure"><span>处置完成率</span><b>${pct}%</b></div><div class="closure-bar"><i style="width:${pct}%"></i></div></section>`;
  return [progress + operationsMonitorPanel(), capacityOverviewPanel() + incidentMonitorPanel(handled)];
}

/* --------------------------------------------------------------------------
   主渲染导出: 左右翼复合横向平行结构
   -------------------------------------------------------------------------- */
function renderPanels(mode, period = '今日', selectedLine = 0, handled = new Set(events.filter(e=>e.done).map(e=>e.id))) {
  let leftHtml = '';
  let rightHtml = '';

  if (mode === 'routes') {
    leftHtml = routePanels(selectedLine);
    rightHtml = capacityOverviewPanel() + vehicleBehaviorAndAdasPanel();
  } else if (mode === 'events') {
    const pair = eventModePanels(handled);
    leftHtml = pair[0];
    rightHtml = pair[1];
  } else {
    // 默认综合监控大屏模式:
    // 左翼:
    // 1行: 未来客流预测 (左) + 全岛出行总览 (右)
    // 2行: 订单趋势 (左) + 运营监控 (右)
    // 3行: 服务监控 (全宽复合: 5个指标 + 左:车辆区域分布 + 右:排队候车)
    leftHtml = `
      <div class="panel-row-dual">
        ${forecastFlowPanel()}
        ${islandOverviewPanel(period)}
      </div>
      <div class="panel-row-dual">
        ${orderTrendPanel(orderTrendPeriod)}
        ${operationsMonitorPanel()}
      </div>
      ${serviceMonitorPanel()}
    `;

    // 右翼:
    // 1行: 运力总览 (全宽)
    // 2行: 车辆监控 (驾驶行为 + ADAS统计)
    // 3行: 车辆监控(可轮播列表) (左) + 事件监控 (右)
    rightHtml = `
      ${capacityOverviewPanel()}
      ${vehicleBehaviorAndAdasPanel()}
      <div class="panel-row-dual">
        ${vehicleRosterCarouselPanel()}
        ${incidentMonitorPanel(handled)}
      </div>
    `;
  }

  const leftEl = document.getElementById('left');
  const rightEl = document.getElementById('right');
  if (leftEl) leftEl.innerHTML = leftHtml;
  if (rightEl) rightEl.innerHTML = rightHtml;

  // 启动车辆轮播
  startVehCarousel();
}
