from pathlib import Path
import argparse
import base64
import io
import json
import math
import random
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, map_coordinates
from shapely.geometry import Polygon,Point,LineString
import cv2,networkx as nx
from scipy.spatial import cKDTree,Voronoi
rng=random.Random(32)
tool_dir = Path(__file__).resolve().parent
parser = argparse.ArgumentParser(description="Rebuild Weizhou Island's map and building assets.")
parser.add_argument("--output-dir", type=Path, default=tool_dir.parents[1] / "src" / "assets",
                    help="Output directory (defaults to this project's src/assets)")
output_dir = parser.parse_args().output_dir
S = tool_dir / "geodata"
source=json.loads((S/'osm.json').read_text(encoding='utf-8'))['elements']
outline=json.loads((S/'coastline.geojson').read_text(encoding='utf-8'))['features'][0]['geometry']['coordinates'][0]
def raw(lon,lat):
    e=(lon-109.111)*103900
    n=(21.04-lat)*111319
    a=math.radians(-14)
    return (math.cos(a)*e-math.sin(a)*n, math.sin(a)*e+math.cos(a)*n)
bounds=Polygon([raw(*p) for p in outline]).bounds
x0,y0,x1,y1=bounds
def xy(lon,lat):
    x,y=raw(lon,lat)
    return (120+(x-x0)/(x1-x0)*660,95+(y-y0)/(y1-y0)*535)
def ll(x,y):
    xx=x0+(x-120)/660*(x1-x0);yy=y0+(y-95)/535*(y1-y0)
    a=math.radians(14)
    return 109.111+(math.cos(a)*xx-math.sin(a)*yy)/103900,21.04-(math.sin(a)*xx+math.cos(a)*yy)/111319
land=Polygon([xy(*p) for p in outline])
points={'port':(109.0915,21.05575),'church':(109.1321,21.0535),'bay':(109.1093,21.02745),'beach':(109.0859,21.0298),'park':(109.0955,21.0150),'east':(109.1249,21.0218)}
print({k:tuple(round(t) for t in xy(*p)) for k,p in points.items()})
def shape(coords,closed=False,precision=1):
    s="M"+" ".join(f"{x:.{precision}f},{y:.{precision}f}" for x,y in coords)
    return s+("Z" if closed else "")
coast=shape(land.simplify(.33).exterior.coords,True)
a=[]
def out(t):a.append(t)
out(f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 900 740" width="900" height="740" role="img" aria-label="涠洲岛海岸地形与交通路网示意"><metadata>Coastline, roads and mapped buildings © OpenStreetMap contributors, ODbL 1.0 (https://www.openstreetmap.org/copyright). Terrain derived from Mapzen terrain tiles; elevation data contains SRTM information courtesy of NASA and partners. Monitoring colors, additional structures, routes and heights are illustrative.</metadata><defs>
<path id="wz-shore" d="{coast}"/><clipPath id="wz-land"><use href="#wz-shore"/></clipPath>
<filter id="wz-blur" x="-.5" y="-.5" width="2" height="2"><feGaussianBlur stdDeviation="4"/></filter>
<filter id="wz-halo" x="-.5" y="-.5" width="2" height="2"><feGaussianBlur stdDeviation="11"/></filter>
<radialGradient id="wz-zone"><stop stop-color="#35efd1" stop-opacity=".32"/><stop offset=".6" stop-color="#21aaad" stop-opacity=".11"/><stop offset="1" stop-color="#21a6a1" stop-opacity="0"/></radialGradient>
<linearGradient id="wz-side" x2="0" y2="1"><stop stop-color="#26474f"/><stop offset="1" stop-color="#0a1c29"/></linearGradient>
</defs>''')
# Subtle nearshore bands and contour lines derived from the coastline buffers.
for i in range(18,0,-1):
    poly=land.buffer(i*3.8,quad_segs=4).simplify(1.0)
    alpha=.013+(18-i)/18*.115
    out(f'<path d="{shape(poly.exterior.coords,True)}" fill="none" stroke="#57b0b4" stroke-width="{.62 if i%4 else 1.0}" opacity="{alpha:.3f}"/>')
out('<use href="#wz-shore" fill="#133440" transform="translate(0 8)" stroke="#40a9a6" stroke-width="1" opacity=".6"/>')
out('<use href="#wz-shore" fill="#15313d" transform="translate(0 5)" stroke="#153d4a" stroke-width="3"/>')
out('<use href="#wz-shore" fill="#193844" stroke="#239187" stroke-width="8" opacity=".28" filter="url(#wz-blur)"/>')
out('<g clip-path="url(#wz-land)">')
# DEM hillshade, faceted surface, subdued parcel texture all consolidated as raster so pan remains fast.
dem=np.zeros((1024,768),dtype=np.float32)
for tx in range(6577,6580):
    for ty in range(3604,3608):
        c=np.asarray(Image.open(S/f'dem_13_{tx}_{ty}.png').convert('RGB'),dtype=np.float32)
        dem[(ty-3604)*256:(ty-3603)*256,(tx-6577)*256:(tx-6576)*256]=c[:,:,0]*256+c[:,:,1]+c[:,:,2]/256-32768
iy,ix=np.mgrid[0:740,0:900];lon,lat=ll(ix,iy)
gx=((lon+180)/360*8192-6577)*256;gy=((1-np.arcsinh(np.tan(np.radians(lat)))/np.pi)/2*8192-3604)*256
h=map_coordinates(dem,[gy,gx],order=1,mode='nearest')
h=gaussian_filter(np.clip(h,-15,95),1.2)
dy,dx=np.gradient(h)
s=np.clip((-dx*.6-dy*.9)*6,-13,22)
noise=np.random.default_rng(21).normal(0,.95,h.shape)
b=np.asarray([22,44,54])+s[:,:,None]*np.array([.75,.98,1.2])+h[:,:,None]*np.array([.04,.07,.09])+noise[:,:,None]
surface=np.uint8(np.clip(b,0,255))
features=[]
for f in source:
    if f['type']=='way' and f.get('geometry'):
        coords=[xy(p['lon'],p['lat']) for p in f['geometry']]
        features.append((f.get('tags',{}),coords,f))
for tags,cs,f in features:
    use=tags.get('landuse');nat=tags.get('natural')
    if use=='forest' or nat in ('wood','scrub'):
        mask=np.uint8(np.zeros(h.shape));cv2.fillPoly(mask,[np.int32(cs)],255)
        surface[mask>0,:]=np.clip(surface[mask>0,:]+np.asarray([-4,3,-3],dtype='int16'),0,255)
    if use=='residential':
        mask=np.uint8(np.zeros(h.shape));cv2.fillPoly(mask,[np.int32(cs)],255)
        surface[mask>0,:]=np.clip(surface[mask>0,:]+np.asarray([2,4,4],dtype='int16'),0,255)
# Naturalistic agriculture pattern from jittered Voronoi cells, landcover only.
sites=[(x+rng.uniform(-12,12),y+rng.uniform(-11,11)) for x in range(60,870,22) for y in range(30,690,18)]
v=Voronoi(sites)
for region in v.regions:
    if not region or -1 in region:continue
    p=np.int32([v.vertices[j] for j in region]);cx,cy=p.mean(axis=0)
    if not (0<cx<900 and 0<cy<740) or rng.random()>.53:continue
    if h[int(cy),int(cx)]>58:continue
    tint=np.int16(surface[int(cy),int(cx)])+rng.randint(-5,6)
    c=tuple(map(int,np.clip(tint,0,255)));cv2.fillPoly(surface,[p],c)
    if rng.random()<.5:
        cv2.polylines(surface,[p],True,tuple(int(k*.79) for k in c),1,cv2.LINE_AA)
buf=io.BytesIO();Image.fromarray(surface[88:642,113:786]).save(buf,format="WEBP",quality=86,method=5)
bitmap=base64.b64encode(buf.getvalue()).decode()
out(f'<image x="113" y="88" width="673" height="554" href="data:image/webp;base64,{bitmap}"/>')
# True elevation contour lines.
out('<g fill="none" stroke-linejoin="round">')
for level in range(2,88,3):
    contours,_=cv2.findContours(np.uint8(h>=level)*255,cv2.RETR_LIST,cv2.CHAIN_APPROX_SIMPLE)
    ds=[]
    for poly in contours:
        if cv2.arcLength(poly,True)<22:continue
        p=cv2.approxPolyDP(poly,.75,True).reshape(-1,2)
        if len(p)>3:ds.append(shape(p,True,0))
    if ds:out(f'<path d="{"".join(ds)}" stroke="#77aeb0" stroke-width="{.85 if level%9==2 else .45}" opacity="{.42 if level%9==2 else .28}"/>')
out('</g>')
# Lake, beaches, parks, and piers.
for t,cs,f in features:
    if t.get('natural') in ('water','beach'):
        c='#0e2b37' if t['natural']=='water' else '#446268'
        out(f'<path d="{shape(cs,True)}" fill="{c}" stroke="#51797b" stroke-width=".6"/>')
out('</g>')
out('<use href="#wz-shore" fill="none" stroke="#6eaaa9" stroke-width="1.3" opacity=".85"/>')
# Road network.
roadgraph=nx.Graph(); primary=[];minor=[];service=[]
for t,coords,f in features:
    cls=t.get('highway')
    if cls:
        keylist=[(round(x,2),round(y,2)) for x,y in coords]
        if cls not in ('steps','disused','footway','path'):
            for p,q in zip(keylist,keylist[1:]):
                if p!=q:roadgraph.add_edge(p,q,weight=math.dist(p,q)*({'service':1.7,'track':3.0}.get(cls,1.0)))
        group=primary if cls=='primary' else minor if cls in ('unclassified','residential') else service
        group.append(shape(coords))
    if t.get('man_made') in ('pier','bridge','quay'):
        closed=coords[0]==coords[-1]
        out(f'<path d="{shape(coords,closed)}" fill="{("#466977" if closed else "none")}" stroke="#72a6a8" stroke-width="{(.9 if closed else 2.5)}"/>')
out('<g fill="none" stroke-linecap="round" stroke-linejoin="round">')
for group,colors,widths in [(service,['#142c37','#507079'],[2.0,.66]),(minor,['#172931','#71959f'],[3.6,1.4]),(primary,['#22333c','#7aacb1'],[4.7,1.8])]:
    for c,w in zip(colors,widths):out(f'<path d="{"".join(group)}" stroke="{c}" stroke-width="{w}"/>')
out('</g>')
# Road-following demonstration transit routes.
largest=max(nx.connected_components(roadgraph),key=len);g=roadgraph.subgraph(largest)
nodes=list(g.nodes);tree=cKDTree(nodes)
def snap(lonlat):
    _,i=tree.query(xy(*lonlat));return nodes[i]
def routed(stops):
    coords=[]
    for start,end in zip(stops,stops[1:]):coords.extend(nx.shortest_path(g,snap(start),snap(end),weight='weight')[int(bool(coords)):])
    return shape(LineString(coords).simplify(.4).coords)
north=(109.1138,21.0666);south=(109.0968,21.027)
route_defs={'loop':([points['port'],north,points['church'],points['east'],points['bay'],south,points['park'],points['beach'],points['port']],'#61eed1'), 'shuttle':([points['port'],points['beach'],south,points['bay']],'#69b5ff'),'east':([points['church'],points['east'],points['bay']],'#efad61')}
for name,(stops,c) in route_defs.items():
    d=routed(stops)
    out(f'<g id="route-{name}-layer" class="route-{name} wz-route" fill="none" stroke="{c}" stroke-linecap="round" stroke-linejoin="round"><path d="{d}" stroke-width="7" opacity=".14"/><path id="route-{name}" d="{d}" stroke-width="{2.3 if name=="loop" else 1.7}" opacity=".98"/></g>')
# Mapped buildings and reversible schematic infill within mapped village parcels.
building_base=[];known=[]
for t,coords,f in features:
    if 'building' not in t:continue
    p=Polygon(coords).buffer(0)
    if p.geom_type!='Polygon' or p.area<.28:continue
    known.append(p);building_base.append((p,t,True))
from shapely.strtree import STRtree
mapped_index=STRtree(known)
for t,coords,f in features:
    if t.get('landuse') not in ('residential','industrial','commercial'):continue
    region=Polygon(coords).buffer(0)
    if region.is_empty or region.area<35:continue
    x,y=region.centroid.coords[0];angle=rng.choice([-0.65,-0.45,-.32,.15,.24,.42,.62]);ca=math.cos(angle);sa=math.sin(angle)
    maxr=math.hypot(region.bounds[2]-region.bounds[0],region.bounds[3]-region.bounds[1])*.73
    for i in range(-int(maxr),int(maxr)+1,6):
        for j in range(-int(maxr),int(maxr)+1,7):
            if rng.random()<.30:continue
            xq=x+i*ca-j*sa+rng.uniform(-.8,.8);yq=y+i*sa+j*ca+rng.uniform(-.8,.8)
            if not region.contains(Point(xq,yq)):continue
            w=rng.uniform(2.0,4.6);hgt=rng.uniform(2.6,5.5)
            p=Polygon([(xq+dx*ca-dy*sa,yq+dx*sa+dy*ca) for dx,dy in [(-w/2,-hgt/2),(w/2,-hgt/2),(w/2,hgt/2),(-w/2,hgt/2)]])
            if mapped_index.query(p,predicate='intersects').size:continue
            building_base.append((p,{},False))
zones=[(xy(*points['port']),33,'blue'),(xy(*points['church']),46,'mint'),(xy(*points['bay']),48,'amber'),(xy(*points['beach']),40,'blue'),(xy(*points['east']),34,'blue'),(xy(109.105,21.047),33,'mint'),(xy(109.098,21.03),35,'mint'),(xy(109.098,21.055),32,'blue')]
out('<g clip-path="url(#wz-land)">')
for (x,y),r,_ in zones:out(f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="{r*1.6:.1f}" ry="{r:.1f}" fill="url(#wz-zone)"/>')
out('</g><g id="wz-buildings" stroke-linejoin="round">')
palettes={'blue':((89,185,217),(29,108,143),(33,77,107)), 'mint':((103,223,190),(38,141,131),(31,90,99)),'amber':((211,173,104),(132,108,69),(88,77,64)),'cool':((104,143,154),(58,98,111),(42,72,88))}
exported=[]
building_base.sort(key=lambda it:it[0].centroid.y)
for p,t,ismapped in building_base:
    x,y=p.centroid.coords[0]
    nearby=[(math.dist((x,y),center)/radius,col) for center,radius,col in zones];dist,col=min(nearby)
    if dist>1.14:col='cool'
    intens=rng.uniform(.69,1.08)
    if col!='cool' and rng.random()<.13:intens=1.28
    colors=['#' + ''.join(f'{min(255,int(k*intens)):02x}' for k in rgb) for rgb in palettes[col]]
    footprint=list(p.simplify(.18).exterior.coords)[:-1]
    if len(footprint)<3:continue
    z=rng.uniform(1.4,4.6)
    if dist<1.18 and rng.random()<.18:z*=rng.uniform(1.4,2.0)
    if '教堂' in t.get('name',''):z=10
    exported.append([[[round(xx,1),round(yy,1)] for xx,yy in footprint],round(z,1),colors[0]])
    lift=(z*.20,-z)
    roof=[(xx+lift[0],yy+lift[1]) for xx,yy in footprint]
    # Draw only side faces looking toward the eye, then place the roof over the base edges.
    out(f'<path d="{shape([(xx+1.3,yy+1.0) for xx,yy in footprint],True)}" fill="#071b28" opacity=".64"/>')
    for n,start in enumerate(footprint):
        end=footprint[(n+1)%len(footprint)];A=roof[n];B=roof[(n+1)%len(roof)]
        c=colors[1] if end[0]-start[0]>0 else colors[2]
        out(f'<path d="{shape([start,end,B,A],True)}" fill="{c}"/>')
    out(f'<path d="{shape(roof,True)}" fill="{colors[0]}" stroke="{colors[1]}" stroke-width=".23"/>')
out('</g></svg>')
output_dir.mkdir(parents=True, exist_ok=True)
(output_dir / 'buildings.json').write_text(json.dumps(exported,separators=(',',':')), encoding='utf-8')
(output_dir / 'island.svg').write_text(''.join(a), encoding='utf-8')
print('building count',len(building_base),'svg bytes',(output_dir / 'island.svg').stat().st_size)
