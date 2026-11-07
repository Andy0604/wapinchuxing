# 涠洲岛地图与立体建筑生成器

项目已带有可编辑的成品资源。修改地图样式或建筑分布后，可以从本目录的公开地理数据重新生成这两份资源。

| 资源 | 内容 |
| --- | --- |
| `src/assets/island.svg` | 900 × 740 地图坐标系中的海岸、地形等高线、道路、滨海设施、演示线路和静态建筑 |
| `src/assets/buildings.json` | 建筑基底多边形、示意高度、屋顶颜色。三维渲染器从基底实时生成屋顶和立面 |

## 生成

在项目根目录执行下列命令。复现环境为 Python 3.12.14，依赖版本见同目录的 requirements.txt。首次配置 Python 环境需要安装这些依赖。

```sh
python -m venv .venv-geo
# macOS / Linux
. .venv-geo/bin/activate
# Windows PowerShell 可改用 .\.venv-geo\Scripts\Activate.ps1
python -m pip install -r tools/geo/requirements.txt
python tools/geo/generate.py --output-dir generated-map
```

检查生成目录中的岛形和道路后，运行 `python tools/geo/generate.py` 将输出写入项目的 `src/assets/`。随后按项目说明重新构建网页。依赖已安装时，生成过程完全使用包内资料，可在断网环境运行。

## 编辑位置

- 在 `generate.py` 的 `points` 字典中调整六个监管点位的经纬度。脚本运行时会打印投影后的整数坐标，可用来同步前端地图配置中的 `xy`。
- 在 `route_defs` 中调整三条线路的途经点。程序会在道路连通图上寻找路径，绘制线路，并赋予 `route-loop`、`route-shuttle`、`route-east` 三个 ID。改动线路后，应同步前端站序与缓行路段的定位。
- 在 `zones` 和 `palettes` 中调整街区颜色，在生成 `z` 的代码处调整楼高。建筑数据包含公开地图的建筑轮廓以及为演示补充的建筑，所有高度为示意值。公交线路、色彩、模拟地块及近岸线纹用于可视化展示。
- 固定随机种子用于复现外观。地形明暗和陆地等高线来自高程瓦片，近岸线纹按海岸向外偏移绘制。

## 输入数据与署名

- 路网、建筑轮廓、地物及海岸线源自 OpenStreetMap，快照时间为 2026-09-08 08:28:40 UTC。`geodata/osm.json` 只保留 952 个参与绘制的 way、经纬度及分类字段，`coastline.geojson` 保存岛屿轮廓。随包分发的 OSM 派生数据沿用 ODbL 1.0，地图应保留可见署名 © OpenStreetMap contributors。[OSM 版权说明](https://www.openstreetmap.org/copyright) · [ODbL 1.0 许可全文](https://opendatacommons.org/licenses/odbl/1-0/)
- 地形来自 2026-09-08 获取的 Mapzen Terrain Tiles，采用 Terrarium 编码。12 张 z13 瓦片的原始地址见 `geodata/dem_manifest.json`。全球 GMTED2010 及 SRTM 高程数据致谢美国地质调查局，全球 ETOPO1 数据致谢美国国家海洋和大气管理局。上游供应商和完整署名文本随包保存在 `geodata/dem_attribution.md`。[数据集和来源](https://registry.opendata.aws/terrain-tiles/) · [上游署名说明](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)

## 初始版本校验

在原环境、固定版本依赖下生成 963 条建筑记录。首版资源的 SHA-256 如下，修改数据或配色后它们会改变。

```text
b95c581ad8d6eca6e10a8b6ac6e61179fa6c096bdda39fe3f24386de57e937a5  island.svg
905e2b6271f438dd363b31d0c3f9ede97078a17dd0d119a3e484cb9636c443ec  buildings.json
```
