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
        <div class="m-val"><strong>738</strong><small>人次</small></div>
        <div class="m-badges">
          <span class="badge-pill">352 单</span>
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
        { t: '06:00', v: 16 },
        { t: '08:00', v: 42 },
        { t: '10:00', v: 85 },
        { t: '12:00', v: 70 },
        { t: '14:00', v: 94 },
        { t: '16:00', v: 62 },
        { t: '18:00', v: 48 },
        { t: '20:00', v: 30 },
        { t: '22:00', v: 18 }
      ]
    : [
        { t: '06:00', v: 12 },
        { t: '08:00', v: 36 },
        { t: '10:00', v: 76 },
        { t: '12:00', v: 62 },
        { t: '14:00', v: 84 },
        { t: '16:00', v: 54 },
        { t: '18:00', v: 40 },
        { t: '20:00', v: 24 },
        { t: '22:00', v: 14 }
      ];

  const coords = points.map((p, i) => {
    const x = 24 + i * 56.5;
    const y = 110 - (p.v / 100) * 88;
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
      <span class="trend-peak-lbl">最高时段: <b>14:00 (${period === '今日' ? '94' : '84'}单)</b></span>
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
  const badge = `<span class="tag-badge">订单总数 352</span>`;
  return `<section class="panel panel-ops">
    ${panelHeader('运营监控', badge)}
    <div class="gmv-dual">
      <div class="gmv-left">
        <span class="m-lbl">今日营收 <small>GMV</small></span>
        <div class="gmv-val">¥12,680</div>
        <div class="m-delta up">较昨日 <span class="c-arrow">▲</span> <b>10%</b></div>
      </div>
      <div class="arpu-card">
        <div class="arpu-val">¥36</div>
        <div class="arpu-lbl">客单价</div>
      </div>
    </div>
    <div class="order-grid">
      <div class="order-box box-cancel">
        <strong class="font-num num-cancel">8</strong>
        <small>已取消</small>
      </div>
      <div class="order-box box-done">
        <strong class="font-num num-done">286</strong>
        <small>已完成</small>
      </div>
      <div class="order-box box-serving">
        <strong class="font-num num-serving">26</strong>
        <small>服务中</small>
      </div>
      <div class="order-box box-pending">
        <strong class="font-num num-pending">32</strong>
        <small>待接单</small>
      </div>
    </div>
    <div class="order-progress-strip" title="订单状态比例分布">
      <span class="seg cancel" style="width: 2.3%;" title="已取消: 8单 (2.3%)"></span>
      <span class="seg done" style="width: 81.2%;" title="已完成: 286单 (81.2%)"></span>
      <span class="seg serving" style="width: 7.4%;" title="服务中: 26单 (7.4%)"></span>
      <span class="seg pending" style="width: 9.1%;" title="待接单: 32单 (9.1%)"></span>
    </div>
  </section>`;
}

/* --------------------------------------------------------------------------
   左侧模块 3: 服务监控 (5个指标 + 左:车辆区域分布 + 右:出发地/目的地)
   -------------------------------------------------------------------------- */
const queueOrderDetails = [
  {
    id: 'WP20261106274',
    status: '服务中',
    passengerPhone: '1886****4562',
    useTime: '今日 08:38',
    driver: '冯雪 (WZ-267)',
    driverPhone: '1356****6498',
    from: '石螺口',
    to: '南湾运动公园',
    route: '石螺口 → 南湾运动公园',
    pax: '6 / 7 人',
    paxCount: '6 人',
    price: '¥49.00',
    wait: '11:49',
    timeline: [
      { name: '叫车时间', time: '08:38' },
      { name: '司机接单时间', time: '08:40' },
      { name: '司机出发时间', time: '08:44' },
      { name: '司机接到乘客时间', time: '08:52' }
    ]
  },
  {
    id: 'WP20261106275',
    status: '服务中',
    passengerPhone: '1597****8823',
    useTime: '今日 10:17',
    driver: '李磊 (WZ-303)',
    driverPhone: '1387****1290',
    from: '南湾运动公园',
    to: '五彩滩',
    route: '南湾运动公园 → 五彩滩',
    pax: '4 / 7 人',
    paxCount: '4 人',
    price: '¥38.00',
    wait: '10:17',
    timeline: [
      { name: '叫车时间', time: '10:17' },
      { name: '司机接单时间', time: '10:19' },
      { name: '司机出发时间', time: '10:22' },
      { name: '司机接到乘客时间', time: '10:28' }
    ]
  },
  {
    id: 'WP20261106276',
    status: '服务中',
    passengerPhone: '1397****5519',
    useTime: '今日 08:42',
    driver: '王海 (WZ-305)',
    driverPhone: '1390****7761',
    from: '西角码头',
    to: '盛塘天主教堂',
    route: '西角码头 → 盛塘天主教堂',
    pax: '3 / 7 人',
    paxCount: '3 人',
    price: '¥35.00',
    wait: '08:42',
    timeline: [
      { name: '叫车时间', time: '08:42' },
      { name: '司机接单时间', time: '08:43' },
      { name: '司机出发时间', time: '08:46' },
      { name: '司机接到乘客时间', time: '08:55' }
    ]
  },
  {
    id: 'WP20261106277',
    status: '服务中',
    passengerPhone: '1770****9932',
    useTime: '今日 07:55',
    driver: '陈飞 (WZ-309)',
    driverPhone: '1361****3452',
    from: '五彩滩',
    to: '鳄鱼山景区',
    route: '五彩滩 → 鳄鱼山景区',
    pax: '2 / 7 人',
    paxCount: '2 人',
    price: '¥28.00',
    wait: '07:55',
    timeline: [
      { name: '叫车时间', time: '07:55' },
      { name: '司机接单时间', time: '07:57' },
      { name: '司机出发时间', time: '08:01' },
      { name: '司机接到乘客时间', time: '08:10' }
    ]
  },
  {
    id: 'WP20261106278',
    status: '服务中',
    passengerPhone: '1827****1039',
    useTime: '今日 07:15',
    driver: '朱浩 (WZ-202)',
    driverPhone: '1378****9921',
    from: '贝壳沙滩',
    to: '盛塘天主教堂',
    route: '贝壳沙滩 → 盛塘天主教堂',
    pax: '3 / 7 人',
    paxCount: '3 人',
    price: '¥32.00',
    wait: '07:15',
    timeline: [
      { name: '叫车时间', time: '07:15' },
      { name: '司机接单时间', time: '07:17' },
      { name: '司机出发时间', time: '07:20' },
      { name: '司机接到乘客时间', time: '07:30' }
    ]
  },
  {
    id: 'WP20261106279',
    status: '服务中',
    passengerPhone: '1368****4427',
    useTime: '今日 06:48',
    driver: '方敏 (WZ-105)',
    driverPhone: '1587****6618',
    from: '盛塘天主教堂',
    to: '南湾海鲜市场',
    route: '盛塘天主教堂 → 南湾海鲜市场',
    pax: '2 / 7 人',
    paxCount: '2 人',
    price: '¥26.00',
    wait: '06:48',
    timeline: [
      { name: '叫车时间', time: '06:48' },
      { name: '司机接单时间', time: '06:50' },
      { name: '司机出发时间', time: '06:54' },
      { name: '司机接到乘客时间', time: '07:02' }
    ]
  }
];

function serviceMonitorPanel() {
  const badge = `<span class="tag-badge mint-tag"><i class="live-dot"></i>实时</span>`;
  const rows = queueOrderDetails.slice(0, 6).map((q, idx) => `
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
    { name: '南湾运动公园', count: 9, pct: 90, color: '#f59e0b' },
    { name: '五彩滩景区', count: 6, pct: 60, color: '#10b981' },
    { name: '石螺口景区', count: 5, pct: 50, color: '#00d8ff' },
    { name: '西角码头', count: 4, pct: 40, color: '#38bdf8' },
    { name: '天主教堂', count: 2, pct: 20, color: '#38bdf8' },
    { name: '鳄鱼山景区', count: 1, pct: 10, color: '#38bdf8' },
    { name: '其他', count: 1, pct: 10, color: '#38bdf8' }
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
        <div class="svc-num"><strong>8</strong><small>分钟</small></div>
        <div class="svc-lbl">平均等待时长</div>
      </div>
      <div class="svc-box">
        <div class="svc-num"><strong>98.2</strong><small>%</small></div>
        <div class="svc-lbl">应答率</div>
      </div>
      <div class="svc-box">
        <div class="svc-num"><strong>2.3</strong><small>%</small></div>
        <div class="svc-lbl">取消率</div>
      </div>
      <div class="svc-box">
        <div class="svc-num"><strong>30</strong><small>%</small></div>
        <div class="svc-lbl">3分钟内接单率</div>
      </div>
      <div class="svc-box">
        <div class="svc-num"><strong>30</strong><small>%</small></div>
        <div class="svc-lbl">1分钟内接单率</div>
      </div>
    </div>

    <!-- 下部双列复合：左侧车辆区域分布 + 右侧排队候车订单 -->
    <div class="svc-composite-body">
      <div class="svc-dist-col">
        <div class="svc-sub-head">
          <span class="ssh-title">车辆区域分布 (实时)</span>
          <span class="ssh-meta">在线 <b>28</b> 辆 · 按数量排序</span>
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
        <strong class="cap-num font-num">31</strong>
        <small>车辆总数</small>
      </div>
      <div class="cap-box running">
        <strong class="cap-num font-num">21</strong>
        <small>运营中</small>
      </div>
      <div class="cap-box idle">
        <strong class="cap-num font-num">7</strong>
        <small>空驶</small>
      </div>
      <div class="cap-box service">
        <strong class="cap-num font-num">3</strong>
        <small>充电/维修</small>
      </div>
    </div>
    <div class="cap-dist-bar" title="运力分布: 运营 21 / 空驶 7 / 充维 3">
      <span class="seg-run" style="width: 67.7%;"></span>
      <span class="seg-idle" style="width: 22.6%;"></span>
      <span class="seg-serv" style="width: 9.7%;"></span>
    </div>
    <div class="cap-metrics-dual">
      <div class="cap-chip">
        <span class="cap-chip-lbl">车辆在线率</span>
        <span class="cap-chip-val font-num c-mint">90.3%</span>
      </div>
      <div class="cap-chip">
        <span class="cap-chip-lbl">平均满载率</span>
        <span class="cap-chip-val font-num c-cyan">86%</span>
      </div>
    </div>
  </section>`;
}

/* --------------------------------------------------------------------------
   右侧模块 2: 车辆监控 (驾驶行为 + ADAS 统计，带今日预警 59 起)
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
    ${panelHeader('车辆监控')}
    <div class="veh-split-grid">
      <!-- 左列: 驾驶行为 -->
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
          <div class="b-item span2"><span class="b-dot amber"></span><span class="b-name">驾驶员异常</span><span class="b-val font-num warn">2</span></div>
        </div>
      </div>

      <!-- 右列: ADAS 统计 -->
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
    { id: 'WZ-307', driver: '张盼', from: '石螺口', to: '南湾运动公园', pax: '3/7人', bat: 78 },
    { id: 'WZ-303', driver: '李强', from: '石螺口', to: '南湾运动公园', pax: '4/7人', bat: 85 },
    { id: 'WZ-305', driver: '王海', from: '石螺口', to: '南湾运动公园', pax: '3/7人', bat: 46 },
    { id: 'WZ-309', driver: '陈飞', from: '石螺口', to: '南湾运动公园', pax: '5/7人', bat: 91 },
    { id: 'WZ-312', driver: '刘洋', from: '西角码头', to: '盛塘天主教堂', pax: '2/7人', bat: 67 }
  ],
  // Page 2
  [
    { id: 'WZ-101', driver: '严旭', from: '西角码头', to: '南湾海鲜市场', pax: '5/7人', bat: 92 },
    { id: 'WZ-102', driver: '魏刚', from: '西角码头', to: '鳄鱼山景区', pax: '4/7人', bat: 80 },
    { id: 'WZ-103', driver: '陆涛', from: '石螺口', to: '贝壳沙滩', pax: '6/7人', bat: 74 },
    { id: 'WZ-104', driver: '姜波', from: '蓝桥', to: '盛塘天主教堂', pax: '2/7人', bat: 63 },
    { id: 'WZ-105', driver: '方敏', from: '南湾海鲜市场', to: '五彩滩', pax: '3/7人', bat: 88 }
  ],
  // Page 3
  [
    { id: 'WZ-201', driver: '薛磊', from: '五彩滩', to: '鳄鱼山景区', pax: '4/7人', bat: 70 },
    { id: 'WZ-202', driver: '朱浩', from: '南湾运动公园', to: '盛塘天主教堂', pax: '5/7人', bat: 82 },
    { id: 'WZ-203', driver: '何彬', from: '西角码头', to: '石螺口', pax: '1/7人', bat: 55 },
    { id: 'WZ-204', driver: '崔杰', from: '贝壳沙滩', to: '西角码头', pax: '3/7人', bat: 79 },
    { id: 'WZ-205', driver: '杜伟', from: '鳄鱼山景区', to: '南湾运动公园', pax: '6/7人', bat: 86 }
  ],
  // Page 4
  [
    { id: 'WZ-301', driver: '胡鹏', from: '石螺口', to: '南湾运动公园', pax: '4/7人', bat: 90 },
    { id: 'WZ-302', driver: '卢亮', from: '南湾海鲜市场', to: '蓝桥', pax: '2/7人', bat: 65 },
    { id: 'WZ-304', driver: '蔡勇', from: '盛塘天主教堂', to: '五彩滩', pax: '5/7人', bat: 72 },
    { id: 'WZ-306', driver: '贾宁', from: '西角码头', to: '南湾运动公园', pax: '3/7人', bat: 81 },
    { id: 'WZ-308', driver: '夏冬', from: '贝壳沙滩', to: '鳄鱼山景区', pax: '4/7人', bat: 58 }
  ],
  // Page 5
  [
    { id: 'WZ-310', driver: '钱坤', from: '五彩滩', to: '石螺口', pax: '6/7人', bat: 84 },
    { id: 'WZ-311', driver: '邹峰', from: '南湾运动公园', to: '蓝桥', pax: '3/7人', bat: 77 },
    { id: 'WZ-106', driver: '顾成', from: '西角码头', to: '盛塘天主教堂', pax: '2/7人', bat: 69 },
    { id: 'WZ-107', driver: '白龙', from: '石螺口', to: '鳄鱼山景区', pax: '5/7人', bat: 93 },
    { id: 'WZ-108', driver: '毛磊', from: '盛塘天主教堂', to: '南湾海鲜市场', pax: '4/7人', bat: 75 }
  ],
  // Page 6
  [
    { id: 'WZ-206', driver: '秦川', from: '蓝桥', to: '西角码头', pax: '1/7人', bat: 60 },
    { id: 'WZ-207', driver: '龚平', from: '南湾运动公园', to: '五彩滩', pax: '4/7人', bat: 89 },
    { id: 'WZ-208', driver: '武强', from: '鳄鱼山景区', to: '石螺口', pax: '5/7人', bat: 73 },
    { id: 'WZ-313', driver: '常青', from: '西角码头', to: '南湾海鲜市场', pax: '3/7人', bat: 86 },
    { id: 'WZ-314', driver: '董健', from: '贝壳沙滩', to: '盛塘天主教堂', pax: '2/7人', bat: 64 }
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
          <span class="vcm-pax font-num">${c.pax}</span>
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
  const badge = `<span class="tag-badge">在线 28/31 · 核载7人</span>`;
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
    id: 'EV202611060015',
    time: '15:20',
    type: 'warn',
    tag: '预警',
    title: '船舶 15:20 分到港，客流上升',
    content: '监测到「北海—涠洲」航线 15:20 班次到港，预计西角码头瞬时客流上升约 260 人，现有候车运力存在缺口。',
    location: '西角码头',
    car: '—',
    action: '通知调度，增派车辆',
    status: '未处理'
  },
  {
    id: 'EV202611060018',
    time: '15:08',
    type: 'err',
    tag: '异常',
    title: 'WZ-102 车辆超速，最高时速 70km/h',
    content: '车辆 WZ-102 在西角码头往南湾街路段行驶速度达到 70km/h，超出限速 40km/h 指标，触发超速警报。',
    location: '西角支线 K2+400',
    car: 'WZ-102',
    action: '提醒司机注意安全',
    status: '未处理'
  }
];

function incidentMonitorPanel(handled = new Set()) {
  const badge = `<span class="tag-badge">今日 6 起 · 最新3条</span>`;
  
  const handledItems = incidentStore.filter(i => i.status === '已处理');
  const warnUnhandled = 4 - incidentStore.filter(i => i.type === 'warn' && i.status === '已处理').length;
  const errUnhandled = 2 - incidentStore.filter(i => i.type === 'err' && i.status === '已处理').length;
  const okTotal = 6; // 对照图3展示

  const cards = incidentStore.map(item => `
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
        <strong class="font-num">${Math.max(0, errUnhandled)}</strong>
        <small>异常</small>
      </div>
      <div class="inc-stat-box warn">
        <strong class="font-num">${Math.max(0, warnUnhandled)}</strong>
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
        <span class="sc-val" style="font-size:14px; line-height:1.5;">${item.content}</span>
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
