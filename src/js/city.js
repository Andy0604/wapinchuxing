/* Extrude island building footprints once. Camera changes only update GPU uniforms. */
const islandCity = (() => {
  let canvas, gl, program, vertexBuffer, vertexCount;
  let uniforms, attributes, lastCamera, contextHandlersBound = false;
  const vertexSource = `
    attribute vec3 position;
    attribute vec3 color;
    attribute vec2 facade;
    attribute float wall;
    uniform vec2 center;
    uniform vec4 orientation;
    uniform vec2 scale;
    varying vec3 vColor;
    varying vec2 vFacade;
    varying float vWall;
    void main(){
      vec2 p=position.xy-center;
      float x=dot(p,vec2(orientation.x,-orientation.y));
      float y=dot(p,orientation.yx);
      float v=orientation.z*y-orientation.w*position.z;
      float depth=orientation.w*y+orientation.z*position.z;
      gl_Position=vec4(x*scale.x,-v*scale.y,-depth/2400.0,1.0);
      vColor=color;
      vFacade=facade;
      vWall=wall;
    }
  `;
  const fragmentSource = `
    precision mediump float;
    varying vec3 vColor;
    varying vec2 vFacade;
    varying float vWall;
    uniform float detail;
    void main(){
      vec3 tint=vColor;
      if(vWall>.5){
        vec2 cell=fract(vFacade/vec2(1.75,2.35));
        float window=smoothstep(.13,.22,cell.x)*(1.-smoothstep(.61,.73,cell.x))
                    *smoothstep(.27,.42,cell.y)*(1.-smoothstep(.66,.77,cell.y));
        tint+=vec3(.10,.16,.17)*window*detail;
      }
      gl_FragColor=vec4(tint,1.);
    }
  `;
  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(message);
    }
    return shader;
  }
  function cross(a, b, c) {
    return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  }
  // Footprints include a few L-shaped buildings. Clip ears to retain their recesses.
  function roofFaces(ring) {
    const idx = ring.map((_, i) => i);
    const triangles = [];
    while (idx.length > 3) {
      let clipped = false;
      for (let i=0; i<idx.length; i++) {
        const ia=idx[(i+idx.length-1)%idx.length], ib=idx[i], ic=idx[(i+1)%idx.length];
        const a=ring[ia], b=ring[ib], c=ring[ic];
        if (Math.abs(cross(a,b,c)) < .0001) {
          idx.splice(i,1); clipped=true; break;
        }
        if (cross(a,b,c)<0) continue;
        const occupied=idx.some(j => j!==ia && j!==ib && j!==ic &&
          cross(a,b,ring[j])>=0 && cross(b,c,ring[j])>=0 && cross(c,a,ring[j])>=0);
        if (occupied) continue;
        triangles.push([ia,ib,ic]);
        idx.splice(i,1); clipped=true; break;
      }
      if (!clipped) break;
    }
    if (idx.length===3) triangles.push(idx);
    return triangles;
  }
  function buildVertices(data) {
    const mesh=[];
    const vertex=(point,height,color,u,v,wall) =>
      mesh.push(point[0],point[1],height,color[0],color[1],color[2],u,v,wall);
    for (const [footprint,height,hex] of data) {
      let ring=footprint.filter((p,i) => {
        const next=footprint[(i+1)%footprint.length];
        return p[0]!==next[0] || p[1]!==next[1];
      });
      if (ring.length<3) continue;
      const area=ring.reduce((sum,p,i) => {
        const next=ring[(i+1)%ring.length];
        return sum+p[0]*next[1]-p[1]*next[0];
      },0);
      if (area<0) ring=ring.reverse();
      const n=parseInt(hex.slice(1),16);
      const base=[(n>>16)/255,((n>>8)&255)/255,(n&255)/255];
      const top=height*1.75;
      const roof=base.map(value => Math.min(1,value*1.09+.012));
      for (const face of roofFaces(ring)) for (const i of face) vertex(ring[i],top,roof,0,0,0);
      for (let i=0;i<ring.length;i++) {
        const a=ring[i],b=ring[(i+1)%ring.length];
        const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);
        const sun=(dy*(-.75)+dx*.66)/len;
        const shade=.48+.23*sun;
        const foot=base.map(v=>v*shade*.71), eave=base.map(v=>v*shade+.025);
        vertex(a,0,foot,0,0,1);vertex(b,0,foot,len,0,1);vertex(b,top,eave,len,top,1);
        vertex(a,0,foot,0,0,1);vertex(b,top,eave,len,top,1);vertex(a,top,eave,0,top,1);
      }
    }
    return new Float32Array(mesh);
  }
  function fallback() {
    const fixed=document.getElementById('wz-buildings');
    if (fixed) fixed.style.display='';
    if (canvas) canvas.style.visibility='hidden';
    program=null;
  }
  function initialize() {
    if (program) return true;
    canvas=document.getElementById('city');
    if (!canvas || typeof buildingData==='undefined' || !buildingData.length) return false;
    try {
      gl=canvas.getContext('webgl',{alpha:true,antialias:true,depth:true,powerPreference:'low-power'});
      if (!gl) { fallback(); return false; }
      if (!contextHandlersBound) {
        canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();fallback();});
        canvas.addEventListener('webglcontextrestored',()=>{if(initialize() && lastCamera) draw(lastCamera);});
        contextHandlersBound=true;
      }
      const vs=compile(gl.VERTEX_SHADER,vertexSource),fs=compile(gl.FRAGMENT_SHADER,fragmentSource);
      program=gl.createProgram();
      gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
      gl.deleteShader(vs);gl.deleteShader(fs);
      if (!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
      const vertices=buildVertices(buildingData);
      vertexBuffer=gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);
      vertexCount=vertices.length/9;
      gl.useProgram(program);
      uniforms={};
      for (const name of ['center','orientation','scale','detail']) uniforms[name]=gl.getUniformLocation(program,name);
      attributes=[['position',3,0],['color',3,3],['facade',2,6],['wall',1,8]];
      for (const [name,size,offset] of attributes) {
        const location=gl.getAttribLocation(program,name);
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location,size,gl.FLOAT,false,36,offset*4);
      }
      gl.clearColor(0,0,0,0);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      canvas.style.visibility='visible';
      const fixed=document.getElementById('wz-buildings');
      if (fixed) fixed.style.display='none';
      return true;
    } catch (error) {
      console.warn('使用静态建筑图层',error);
      fallback();
      return false;
    }
  }
  function draw(cam) {
    lastCamera={...cam};
    if (!program || !canvas.clientWidth || !canvas.clientHeight) return;
    // Sky and terrain can bleed under the HUD. The label viewport still owns
    // the camera fit; the larger canvas only expands its visible world.
    const labels=canvas.parentElement;
    const maxPixels=7_000_000;
    const ratio=Math.min(window.devicePixelRatio||1,2,
      Math.sqrt(maxPixels/(canvas.clientWidth*canvas.clientHeight)));
    const w=Math.round(canvas.clientWidth*ratio),h=Math.round(canvas.clientHeight*ratio);
    if (canvas.width!==w || canvas.height!==h) {canvas.width=w;canvas.height=h;}
    const fit=Math.min(labels.clientWidth/900,labels.clientHeight/740)*ratio;
    const angle=cam.angle*Math.PI/180,tilt=Math.max(0,Math.min(1,cam.tilt));
    gl.viewport(0,0,w,h);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.uniform2f(uniforms.center,cam.x,cam.y);
    gl.uniform4f(uniforms.orientation,Math.cos(angle),Math.sin(angle),tilt,Math.sqrt(1-tilt*tilt));
    gl.uniform2f(uniforms.scale,2*fit*cam.z/w,2*fit*cam.z/h);
    gl.uniform1f(uniforms.detail,Math.max(0,Math.min(1,(cam.z*fit/ratio-1.2)*.6)));
    gl.drawArrays(gl.TRIANGLES,0,vertexCount);
  }
  return { initialize, draw };
})();
function initializeCity() { return islandCity.initialize(); }
function drawCity(cam) { islandCity.draw(cam); }
