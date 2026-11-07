const places=[
 {id:'port',name:'西角码头',sub:'客运枢纽',icon:'ship',tag:'客流监测',status:'客流平稳',metrics:[['今日到港','4,286','人次'],['候车人数','68','人'],['接驳车辆','12','辆']],note:'到港旅客通过码头接驳区换乘岛内公交与景区网约车。'},
 {id:'lanqiao',name:'蓝桥',sub:'北岸地标',icon:'tower',tag:'观光监测',status:'秩序良好',metrics:[['今日游客','860','人次'],['瞬时人数','42','人'],['通行状态','畅通','']],note:'北岸标志性引桥观光带，重点监测海面风浪与游客驻留安全。'},
 {id:'shell',name:'贝壳沙滩',sub:'生态海岸',icon:'wave',tag:'海岸监管',status:'游览适宜',metrics:[['今日客流','1,520','人次'],['沿线车辆','18','辆'],['潮位状态','退潮中','']],note:'东北部沿海原生海岸带，接驳环岛观光线及自驾电单车。'},
 {id:'church',name:'天主教堂',sub:'核心景区',icon:'pin',tag:'景区监测',status:'运行正常',metrics:[['今日客流','1,642','人次'],['候车人数','16','人'],['平均候车','4','分钟']],note:'盛塘天主教堂百年文化景区，车辆按班次循环发车。'},
 {id:'east',name:'五彩滩',sub:'地质景观',icon:'bus',tag:'日出监测',status:'运行正常',metrics:[['今日客流','986','人次'],['候车人数','12','人'],['平均候车','6','分钟']],note:'东部火山岩地质景观区，衔接岛内公交与景区步行入口。'},
 {id:'sports',name:'南湾运动公园',sub:'休闲枢纽',icon:'parking',tag:'运力调度',status:'运力充沛',metrics:[['在园人数','520','人次'],['在席车辆','8','辆'],['充电空闲','4','桩']],note:'南湾片区运动休闲枢纽，兼备观光车换乘与快速充电补给功能。'},
 {id:'bay',name:'南湾海鲜市场',sub:'商业中心',icon:'alert',tag:'路况监测',status:'客流密集',metrics:[['实时客流','2,180','人次'],['车流速度','18','km/h'],['通行指数','2.1','']],note:'全岛餐饮商贸核心聚集区，人车流密集，重点防范局部缓行。'},
 {id:'park',name:'鳄鱼山景区',sub:'5A核心区',icon:'parking',tag:'泊位监测',status:'车位充足',metrics:[['停车泊位','120','个'],['空余车位','46','个'],['使用率','62','%']],note:'火山国家地质公园核心景区，承接自驾换乘与景交车接驳。'},
 {id:'beach',name:'石螺口景区',sub:'海滨浴场',icon:'bus',tag:'日落监测',status:'运行正常',metrics:[['今日客流','1,208','人次'],['候车人数','22','人'],['平均候车','5','分钟']],note:'西海岸海滨浴场与日落观赏区，重点监测傍晚离场返程运力。'}
];
const lines=[
 {name:'环岛观光线',id:'L01',stops:['port','church','east','bay','park','beach'],color:'#5cf1d1',vehicles:24,people:3862,headway:8},
 {name:'码头接驳线',id:'L02',stops:['port','beach','bay'],color:'#68b7ff',vehicles:18,people:2706,headway:5},
 {name:'东岸景区线',id:'L03',stops:['church','east','bay'],color:'#f0b765',vehicles:12,people:1848,headway:10}
];
const events=[
 {id:'E-031',name:'南湾街车速偏低',time:'14:32',place:'bay',level:'路况预警',severity:'amber',detail:'南湾街监测断面平均车速降至 18 km/h，已达到本场景的缓行预警阈值。'},
 {id:'E-030',name:'码头接驳客流上升',time:'14:18',place:'port',level:'客流提醒',severity:'blue',detail:'到港旅客集中进入接驳区，候车人数达到 68 人，需关注接驳班次。'},
 {id:'E-029',name:'石螺口接驳车到站',time:'14:06',place:'beach',level:'调度动态',severity:'mint',detail:'接驳车辆已驶入石螺口站点，本轮运力补充完成。',done:true}
];
