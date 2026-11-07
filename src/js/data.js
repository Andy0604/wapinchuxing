const places=[
 {id:'port',name:'西角码头',sub:'客运枢纽',icon:'ship',tag:'客流监测',status:'客流平稳',metrics:[['今日到港','4,286','人次'],['候车人数','68','人'],['接驳车辆','12','辆']],note:'到港旅客通过码头接驳区换乘岛内公交。'},
 {id:'church',name:'盛塘天主教堂',sub:'景区站点',icon:'pin',tag:'站点监测',status:'运行正常',metrics:[['今日客流','1,642','人次'],['候车人数','16','人'],['平均候车','4','分钟']],note:'景区接驳站覆盖盛塘片区，车辆按班次循环发车。'},
 {id:'bay',name:'南湾街',sub:'重点路段',icon:'alert',tag:'路况监测',status:'缓行',metrics:[['车流速度','18','km/h'],['当前流量','42','辆/小时'],['通行指数','2.1','']],note:'商街沿线路段车速下降，可联动车辆调度关注通行情况。'},
 {id:'beach',name:'石螺口',sub:'景区站点',icon:'bus',tag:'站点监测',status:'运行正常',metrics:[['今日客流','1,208','人次'],['候车人数','22','人'],['平均候车','5','分钟']],note:'西海岸接驳站服务石螺口景区，可换乘环岛观光线。'},
 {id:'park',name:'鳄鱼山',sub:'景区停车场',icon:'parking',tag:'泊位监测',status:'车位充足',metrics:[['停车泊位','120','个'],['空余车位','46','个'],['使用率','62','%']],note:'停车场承接景区自驾与接驳换乘，空余泊位随车辆进出更新。'},
 {id:'east',name:'五彩滩',sub:'东岸接驳点',icon:'bus',tag:'站点监测',status:'运行正常',metrics:[['今日客流','986','人次'],['候车人数','12','人'],['平均候车','6','分钟']],note:'东部海岸接驳点衔接岛内公交与景区步行入口。'}
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
