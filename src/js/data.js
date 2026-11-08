const places=[
 {id:'port',name:'西角码头',sub:'客运枢纽',icon:'ship',tag:'客流监测',status:'客流平稳',metrics:[['今日单量','127','单'],['占总单量','35.0','%'],['接驳车辆','12','辆']],note:'进出岛客运总枢纽，到港旅客通过接驳区换乘景区观光车。'},
 {id:'lanqiao',name:'蓝桥',sub:'北岸地标',icon:'tower',tag:'观光监测',status:'秩序良好',metrics:[['今日单量','18','单'],['瞬时人数','42','人'],['通行状态','畅通','']],note:'北岸标志性引桥观光带，重点监测海面风浪与游客驻留安全。'},
 {id:'shell',name:'贝壳沙滩',sub:'生态海岸',icon:'wave',tag:'海岸监管',status:'游览适宜',metrics:[['今日单量','16','单'],['沿线车辆','18','辆'],['潮位状态','退潮中','']],note:'东北部沿海原生海岸带，接驳环岛观光线及自驾电单车。'},
 {id:'church',name:'天主教堂',sub:'核心景区',icon:'pin',tag:'景区监测',status:'运行正常',metrics:[['今日单量','77','单'],['占总单量','21.2','%'],['候车人数','16','人']],note:'盛塘天主教堂百年文化景区，观光车按班次高频循环发车。'},
 {id:'east',name:'五彩滩',sub:'地质景观',icon:'bus',tag:'日出监测',status:'运行正常',metrics:[['今日单量','103','单'],['占总单量','28.4','%'],['平均候车','4','分钟']],note:'东部火山岩地质景观区，衔接岛内观光车与景区步行入口。'},
 {id:'sports',name:'南湾运动公园',sub:'休闲枢纽',icon:'parking',tag:'运力调度',status:'运力充沛',metrics:[['今日单量','167','单'],['占总单量','46.0','%'],['在席车辆','12','辆']],note:'南湾片区运动休闲枢纽，兼备观光车换乘与快速充电补给功能。'},
 {id:'bay',name:'南湾海鲜市场',sub:'商业中心',icon:'alert',tag:'路况监测',status:'客流密集',metrics:[['今日单量','167','单'],['车流速度','18','km/h'],['通行指数','2.1','']],note:'全岛餐饮商贸核心聚集区，人车流密集，重点防范局部缓行。'},
 {id:'park',name:'鳄鱼山景区',sub:'5A核心区',icon:'parking',tag:'泊位监测',status:'车位充足',metrics:[['今日单量','95','单'],['占总单量','26.2','%'],['使用率','62','%']],note:'火山国家地质公园核心景区，承接自驾换乘与景交车接驳。'},
 {id:'beach',name:'石螺口景区',sub:'海滨浴场',icon:'bus',tag:'日落监测',status:'运行正常',metrics:[['今日单量','123','单'],['占总单量','33.9','%'],['候车人数','22','人']],note:'西海岸海滨浴场与日落观赏区，重点监测傍晚离场返程运力。'}
];
const lines=[
 {name:'环岛观光线',id:'L01',stops:['port','church','east','bay','park','beach'],color:'#5cf1d1',vehicles:24,people:3862,headway:8},
 {name:'码头接驳线',id:'L02',stops:['port','beach','bay'],color:'#68b7ff',vehicles:18,people:2706,headway:5},
 {name:'东岸景区线',id:'L03',stops:['church','east','bay'],color:'#f0b765',vehicles:12,people:1848,headway:10}
];
const events=[
 {id:'EV-001',name:'船舶10:50分到港客流上升',time:'10:20',exactTime:'10:20:00',place:'port',level:'客流预警',severity:'amber',detail:'船舶10:50分到港，客流上升，处理方式：通知调度，增派车辆。',action:'通知调度，增派车辆',done:true},
 {id:'EV-002',name:'南湾海鲜市场拥堵预警',time:'10:58',exactTime:'10:58:00',place:'bay',level:'路况预警',severity:'amber',detail:'南湾海鲜市场，多辆车速偏低，拥堵预警，处理方式：通知司机注意绕行。',action:'通知司机注意绕行',done:true},
 {id:'EV-003',name:'船舶11:50分到港客流上升',time:'11:20',exactTime:'11:20:00',place:'port',level:'客流预警',severity:'amber',detail:'船舶11:50分到港，客流上升，处理方式：通知调度，增派车辆。',action:'通知调度，增派车辆',done:true},
 {id:'EV-004',name:'仙人掌基地施工绕行',time:'12:30',exactTime:'12:30:00',place:'east',level:'施工预警',severity:'amber',detail:'涠洲岛仙人掌基地路段施工，请绕行，处理方式：通知司机注意绕行。',action:'通知司机注意绕行',done:true},
 {id:'EV-005',name:'船舶13:50分到港客流上升',time:'13:20',exactTime:'13:20:00',place:'port',level:'客流预警',severity:'amber',detail:'船舶13:50分到港，客流上升，处理方式：通知调度，增派车辆。',action:'通知调度，增派车辆',done:true},
 {id:'EV-006',name:'船舶15:30分到港客流上升',time:'15:00',exactTime:'15:00:00',place:'port',level:'客流预警',severity:'amber',detail:'船舶15:30分到港，客流上升，处理方式：通知调度，增派车辆。',action:'通知调度，增派车辆',done:false}
];
