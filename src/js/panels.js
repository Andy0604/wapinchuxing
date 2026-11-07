function panelHeader(name, badge = '', icon = '') {
  const icoHtml = icon ? ico(icon) : '';
  return `<div class="panel-head"><h3 class="panel-title">${icoHtml}${name}</h3>${badge}</div>`;
}

/* --------------------------------------------------------------------------
   左侧模块 1: 全岛出行总览
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
    <div class="overview-extra-block">
      <div class="sub-section-title"><span>24小时客流时段分布走势</span><small>峰值 14:00 (1,280 人/h) · 实时 860 人/h</small></div>
      <div class="flow-mini-chart">
        <svg viewBox="0 0 500 58" preserveAspectRatio="none">
          <defs>
            <linearGradient id="flowWaveGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#38efbd" stop-opacity="0.38"/>
              <stop offset="100%" stop-color="#38efbd" stop-opacity="0.02"/>
            </linearGradient>
          </defs>
          <path d="M0 46 Q 60 48, 120 38 T 240 22 T 350 12 T 500 30 L 500 58 L 0 58 Z" fill="url(#flowWaveGrad)"/>
          <path d="M0 46 Q 60 48, 120 38 T 240 22 T 350 12 T 500 30" fill="none" stroke="#38efbd" stroke-width="2.6"/>
          <circle cx="350" cy="12" r="4" fill="#38efbd" filter="drop-shadow(0 0 6px #38efbd)"/>
        </svg>
        <div class="flow-chart-axis">
          <span>02:00</span><span>06:00</span><span>10:00</span><span class="c-mint">14:00 (峰)</span><span>18:00</span><span>22:00</span>
        </div>
      </div>
      <div class="hub-flow-strip">
        <div class="hub-chip"><span class="h-dot port"></span>西角码头 <b>50.3%</b></div>
        <div class="hub-chip"><span class="h-dot sports"></span>南湾运动公园 <b>26.6%</b></div>
        <div class="hub-chip"><span class="h-dot beach"></span>石螺口 <b>14.0%</b></div>
        <div class="hub-chip"><span class="h-dot east"></span>五彩滩 <b>9.1%</b></div>
      </div>
    </div>
  </section>`;
}

/* --------------------------------------------------------------------------
   左侧模块 2: 运营监控
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
    <div class="ops-extra-block">
      <div class="sub-section-title"><span>近7日营运收益走势</span><small>达标率 106.8% · 运营超额</small></div>
      <div class="ops-mini-bars">
        <div class="bar-col"><div class="bar-fill" style="height: 64%;"></div><span class="bar-lbl">11-01</span></div>
        <div class="bar-col"><div class="bar-fill" style="height: 69%;"></div><span class="bar-lbl">11-02</span></div>
        <div class="bar-col"><div class="bar-fill" style="height: 74%;"></div><span class="bar-lbl">11-03</span></div>
        <div class="bar-col"><div class="bar-fill" style="height: 80%;"></div><span class="bar-lbl">11-04</span></div>
        <div class="bar-col"><div class="bar-fill" style="height: 88%;"></div><span class="bar-lbl">11-05</span></div>
        <div class="bar-col"><div class="bar-fill" style="height: 98%;"></div><span class="bar-lbl">11-06</span></div>
        <div class="bar-col active"><div class="bar-fill" style="height: 85%;"></div><span class="bar-lbl">今日</span></div>
      </div>
      <div class="ops-foot-summary">
        <span>🔥 热门呼叫区间: <b>西角码头 ⇄ 南湾海鲜市场</b></span>
        <span>⚡ 派单响应均速: <b>2.4s</b></span>
      </div>
    </div>
  </section>`;
}

/* --------------------------------------------------------------------------
   左侧模块 3: 服务监控 (排队路线与订单明细 - 每行展示两条，共 8 条)
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
    id: 'WP20261106279',
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
    id: 'WP20261106280',
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
    id: 'WP20261106281',
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
  }
];

function serviceMonitorPanel() {
  const badge = `<span class="tag-badge mint-tag"><i class="live-dot"></i>实时</span>`;
  const rows = queueOrderDetails.map((q, idx) => `
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

  return `<section class="panel panel-service">
    ${panelHeader('服务监控', badge)}
    <div class="svc-grid">
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
    </div>
    <div class="queue-header-grid">
      <div class="q-hdr-cell"><span>出发地 / 目的地</span><span>人数 / 等待时长</span></div>
      <div class="q-hdr-cell"><span>出发地 / 目的地</span><span>人数 / 等待时长</span></div>
    </div>
    <div class="queue-grid-2col">${rows}</div>
    <div class="svc-foot-note">
      <span>全岛当前排队候车 <b>30 人</b> · 平均调度响应 <b>4.8 分钟</b> · 运力储备充足</span>
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
        <small class="cap-label">车辆总数</small>
      </div>
      <div class="cap-box running">
        <strong class="cap-num font-num">21</strong>
        <small class="cap-label">运营中</small>
      </div>
      <div class="cap-box idle">
        <strong class="cap-num font-num">7</strong>
        <small class="cap-label">空驶</small>
      </div>
      <div class="cap-box service">
        <strong class="cap-num font-num">3</strong>
        <small class="cap-label">充电/维修</small>
      </div>
    </div>
    <div class="cap-dist-bar" title="运力分布: 运营中 67.7%, 空驶 22.6%, 充电/维修 9.7%">
      <i class="seg-run" style="width: 67.7%"></i>
      <i class="seg-idle" style="width: 22.6%"></i>
      <i class="seg-serv" style="width: 9.7%"></i>
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
    <div class="cap-extra-block">
      <div class="sub-section-title"><span>示范路线实时运力分配</span><small>全岛 12 辆示范车</small></div>
      <div class="route-cap-list">
        <div class="route-cap-item">
          <div class="rc-info">
            <span class="rc-name"><i style="background:#5cf1d1"></i>环岛观光线 (L01)</span>
            <span class="rc-meta font-num"><b>4 辆在线</b> · 满载率 88%</span>
          </div>
          <div class="rc-bar"><i style="width:88%; background:#5cf1d1"></i></div>
        </div>
        <div class="route-cap-item">
          <div class="rc-info">
            <span class="rc-name"><i style="background:#68b7ff"></i>码头接驳线 (L02)</span>
            <span class="rc-meta font-num"><b>4 辆在线</b> · 满载率 92%</span>
          </div>
          <div class="rc-bar"><i style="width:92%; background:#68b7ff"></i></div>
        </div>
        <div class="route-cap-item">
          <div class="rc-info">
            <span class="rc-name"><i style="background:#f0b765"></i>东岸景区线 (L03)</span>
            <span class="rc-meta font-num"><b>3 辆在线 / 1 充维</b> · 满载率 76%</span>
          </div>
          <div class="rc-bar"><i style="width:76%; background:#f0b765"></i></div>
        </div>
      </div>
    </div>
  </section>`;
}

/* --------------------------------------------------------------------------
   右侧模块 2: 车辆监控 (驾驶员异常 + ADAS 行车辅助统计)
   -------------------------------------------------------------------------- */
function vehicleMonitorPanel() {
  const badge = `<span class="tag-badge">今日预警 59 起</span>`;
  const adasLeft = [
    { name: '向前碰撞', val: 2, c: '#38bdf8', level: 'warn' },
    { name: '车道偏离报警', val: 16, c: '#ff5e6a', level: 'danger' },
    { name: '车距过近报警', val: 6, c: '#f59e0b', level: 'warn' },
    { name: '行人碰撞报警', val: 24, c: '#ff5e6a', level: 'danger' },
    { name: '频繁变道报警', val: 0, c: '#627d98', level: 'zero' }
  ];

  const adasRight = [
    { name: '道路标识超限', val: 0, c: '#627d98', level: 'zero' },
    { name: '障碍物报警', val: 0, c: '#627d98', level: 'zero' },
    { name: '标识识别事件', val: 0, c: '#627d98', level: 'zero' },
    { name: '主动抓拍事件', val: 0, c: '#627d98', level: 'zero' }
  ];

  const renderItem = item => `
    <div class="adas-item ${item.level}">
      <span class="adas-dot" style="--c:${item.c}"></span>
      <span class="adas-name">${item.name}</span>
      <strong class="adas-val font-num ${item.level}">${item.val}</strong>
    </div>
  `;

  return `<section class="panel panel-vehicles">
    ${panelHeader('车辆监控', badge)}
    <div class="driver-alert-box">
      <div class="alert-left">
        <span class="alert-pulse amber"></span>
        <span class="alert-lbl">驾驶员异常</span>
        <span class="alert-tag">今日监测</span>
      </div>
      <div class="alert-right">
        <strong class="alert-val font-num">2</strong>
        <small class="alert-unit">起</small>
      </div>
    </div>
    <div class="adas-section">
      <div class="adas-header">${ico('dish')} <span>ADAS 统计</span></div>
      <div class="adas-grid">
        <div class="adas-col">${adasLeft.map(renderItem).join('')}</div>
        <div class="adas-col">${adasRight.map(renderItem).join('')}</div>
      </div>
    </div>
    <div class="veh-extra-block">
      <div class="veh-safety-strip">
        <div class="safety-chip"><span class="s-lbl">限速符合率</span><b class="s-val c-mint">99.4%</b></div>
        <div class="safety-chip"><span class="s-lbl">全岛平均时速</span><b class="s-val font-num">28.6 km/h</b></div>
        <div class="safety-chip"><span class="s-lbl">主动防撞避险</span><b class="s-val c-amber">2 次化解</b></div>
        <div class="safety-chip"><span class="s-lbl">设备在线率</span><b class="s-val font-num c-mint">100%</b></div>
      </div>
    </div>
  </section>`;
}

/* --------------------------------------------------------------------------
   右侧模块 3: 事件监控 (异常/预警/已处理 + 告警处置卡片及状态管理)
   -------------------------------------------------------------------------- */
const incidentStore = [
  {
    id: 'EV202611060015',
    time: '15:20',
    type: 'warn',
    tag: '预警',
    title: '船舶 15:20 分到港，客流瞬时上升',
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
  },
  {
    id: 'EV202611060012',
    time: '14:45',
    type: 'warn',
    tag: '预警',
    title: '南湾运动公园充电桩 03 号桩离线',
    content: '运动公园快充桩 03 号通信断开，已通知现场运维人员检查配电与网络线缆。',
    location: '南湾运动公园充电站',
    car: '—',
    action: '派单现场运维巡检',
    status: '已处理'
  },
  {
    id: 'EV202611060009',
    time: '14:15',
    type: 'warn',
    tag: '预警',
    title: '蓝桥引桥风力达 6 级，提醒减速慢行',
    content: '受冷空气影响北部湾瞬时阵风达到 6 级，已向沿线运营车辆发送限速与防风驾驶提示。',
    location: '蓝桥观光路段',
    car: '全岛车辆',
    action: '车载广播与调度提醒',
    status: '已处理'
  }
];

function incidentMonitorPanel(handled = new Set()) {
  const badge = `<span class="tag-badge">今日 6 起 · 最新4条</span>`;
  
  // 实时统计各状态数量
  const handledItems = incidentStore.filter(i => i.status === '已处理');
  const warnUnhandled = 4 - incidentStore.filter(i => i.type === 'warn' && i.status === '已处理').length;
  const errUnhandled = 2 - incidentStore.filter(i => i.type === 'err' && i.status === '已处理').length;
  const okTotal = handledItems.length;

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
        <span class="inc-v2-act-lbl">处理方式</span>
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
    <div class="inc-foot-summary">
      <span>⏱ 平均处置用时: <b>3.8 分钟</b></span>
      <span>✓ 今日闭环率: <b>95.8%</b></span>
    </div>
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
   主渲染导出
   -------------------------------------------------------------------------- */
function renderPanels(mode, period = '今日', selectedLine = 0, handled = new Set(events.filter(e=>e.done).map(e=>e.id))) {
  let leftHtml = '';
  let rightHtml = '';

  if (mode === 'routes') {
    leftHtml = routePanels(selectedLine);
    rightHtml = capacityOverviewPanel() + vehicleMonitorPanel();
  } else if (mode === 'events') {
    const pair = eventModePanels(handled);
    leftHtml = pair[0];
    rightHtml = pair[1];
  } else {
    // 默认综合监控大屏模式：左 3 模块，右 3 模块
    leftHtml = islandOverviewPanel(period) + operationsMonitorPanel() + serviceMonitorPanel();
    rightHtml = capacityOverviewPanel() + vehicleMonitorPanel() + incidentMonitorPanel(handled);
  }

  const leftEl = document.getElementById('left');
  const rightEl = document.getElementById('right');
  if (leftEl) leftEl.innerHTML = leftHtml;
  if (rightEl) rightEl.innerHTML = rightHtml;
}
