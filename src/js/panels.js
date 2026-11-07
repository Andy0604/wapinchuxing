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
      <div class="order-box">
        <strong class="font-num">8</strong>
        <small>已取消</small>
      </div>
      <div class="order-box">
        <strong class="font-num c-mint">286</strong>
        <small>已完成</small>
      </div>
      <div class="order-box">
        <strong class="font-num c-blue">26</strong>
        <small>服务中</small>
      </div>
      <div class="order-box highlight-amber">
        <strong class="font-num c-amber">32</strong>
        <small>待接单</small>
      </div>
    </div>
  </section>`;
}

/* --------------------------------------------------------------------------
   左侧模块 3: 服务监控
   -------------------------------------------------------------------------- */
function serviceMonitorPanel() {
  const badge = `<span class="tag-badge mint-tag"><i class="live-dot"></i>实时</span>`;
  const queues = [
    { from: '石螺口', to: '南湾运动公园', pax: '6 人', wait: '11:49', hot: true },
    { from: '南湾运动公园', to: '五彩滩', pax: '4 人', wait: '10:17', hot: true },
    { from: '西角码头', to: '盛塘天主教堂', pax: '3 人', wait: '08:42', hot: false },
    { from: '五彩滩', to: '鳄鱼山景区', pax: '2 人', wait: '07:55', hot: false }
  ];

  const rows = queues.map(q => `
    <div class="queue-row">
      <div class="queue-route">
        <span class="q-stop from">${q.from}</span>
        <span class="q-stop to">${q.to}</span>
      </div>
      <div class="queue-meta">
        <span class="q-pax">${q.pax}</span>
        <span class="q-time ${q.hot ? 'warn' : ''}">${q.wait}</span>
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
    <div class="queue-header">
      <span>出发地 / 目的地</span>
      <span>人数 / 等待时长</span>
    </div>
    <div class="queue-list">${rows}</div>
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
      <div class="cap-box">
        <strong>31</strong>
        <small>车辆总数</small>
      </div>
      <div class="cap-box">
        <strong class="c-mint">21</strong>
        <small>运营中</small>
      </div>
      <div class="cap-box">
        <strong class="c-blue">7</strong>
        <small>空驶</small>
      </div>
      <div class="cap-box">
        <strong class="c-sub">3</strong>
        <small>充电/维修</small>
      </div>
    </div>
    <div class="cap-bar-info">
      <span>车辆在线率 <b>90.3%</b></span>
      <span class="cap-sep">|</span>
      <span>平均满载率 <b>86%</b></span>
    </div>
  </section>`;
}

/* --------------------------------------------------------------------------
   右侧模块 2: 车辆监控 (驾驶员异常 + ADAS 行车辅助统计)
   -------------------------------------------------------------------------- */
function vehicleMonitorPanel() {
  const badge = `<span class="tag-badge">今日预警 59 起</span>`;
  const adasLeft = [
    { name: '向前碰撞', val: 2, c: '#3ba9ff', hot: false },
    { name: '车道偏离报警', val: 16, c: '#3ba9ff', hot: true },
    { name: '车距过近报警', val: 6, c: '#3ba9ff', hot: false },
    { name: '行人碰撞报警', val: 24, c: '#55f1cd', hot: true },
    { name: '频繁变道报警', val: 0, c: '#f5b842', hot: false }
  ];

  const adasRight = [
    { name: '道路标识超限报警', val: 0, c: '#ff9d42', hot: false },
    { name: '障碍物报警', val: 0, c: '#ff5c5c', hot: false },
    { name: '道路标识识别事件', val: 0, c: '#b562ff', hot: false },
    { name: '主动抓拍事件', val: 0, c: '#b562ff', hot: false }
  ];

  const renderItem = item => `
    <div class="adas-item">
      <span class="adas-dot" style="--c:${item.c}"></span>
      <span class="adas-name">${item.name}</span>
      <strong class="adas-val ${item.hot ? 'hot' : ''}">${item.val}</strong>
    </div>
  `;

  return `<section class="panel panel-vehicles">
    ${panelHeader('车辆监控', badge)}
    <div class="driver-alert-box">
      <span class="alert-dot amber-bg"></span>
      <span class="alert-lbl">驾驶员异常</span>
      <strong class="alert-val">2</strong>
    </div>
    <div class="adas-section">
      <div class="adas-header">${ico('dish')} <span>ADAS 统计</span></div>
      <div class="adas-grid">
        <div class="adas-col">${adasLeft.map(renderItem).join('')}</div>
        <div class="adas-col">${adasRight.map(renderItem).join('')}</div>
      </div>
    </div>
  </section>`;
}

/* --------------------------------------------------------------------------
   右侧模块 3: 事件监控 (异常/预警/已处理 + 告警处置卡片)
   -------------------------------------------------------------------------- */
function incidentMonitorPanel(handled = new Set()) {
  const badge = `<span class="tag-badge">今日 6 起 · 最新3条</span>`;
  const incidents = [
    {
      time: '15:20',
      type: 'warn',
      tag: '预警',
      title: '船舶 15:20 分到达，客流上升',
      status: '未处理',
      action: '通知调度，增派车辆'
    },
    {
      time: '15:08',
      type: 'err',
      tag: '异常',
      title: 'WZ-102 车辆超速，最高时速 70km/h',
      status: '未处理',
      action: '提醒司机注意安全'
    }
  ];

  const cards = incidents.map(item => `
    <div class="inc-v2-card ${item.type}">
      <div class="inc-v2-top">
        <span class="inc-v2-time">${item.time}</span>
        <span class="inc-v2-badge ${item.type}">${item.tag}</span>
        <strong class="inc-v2-title">${item.title}</strong>
        <span class="inc-v2-status">${item.status}</span>
      </div>
      <div class="inc-v2-bottom">
        <span class="inc-v2-act-lbl">处理方式：</span>
        <span class="inc-v2-act-val">${item.action}</span>
      </div>
    </div>
  `).join('');

  return `<section class="panel panel-incidents">
    ${panelHeader('事件监控', badge)}
    <div class="inc-stats-row">
      <div class="inc-stat-box err">
        <strong>2</strong>
        <small>异常</small>
      </div>
      <div class="inc-stat-box warn">
        <strong>4</strong>
        <small>预警</small>
      </div>
      <div class="inc-stat-box ok">
        <strong>0</strong>
        <small>已处理</small>
      </div>
    </div>
    <div class="incident-list-v2">${cards}</div>
  </section>`;
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
