import * as THREE from "three";

/**
 * The home-page globe: navy glass with gold continents, a gold graticule, twinkling city
 * lights, orbit rings and trade routes out of Manila. It is drawn with an orthographic camera
 * in the pixel space of the client's globe render (1536 × 1024) so it sits exactly over the
 * globe in that image.
 */

export const PLATE = { w: 1536, h: 1024, cx: 757, cy: 476, r: 458 };

const GOLD = new THREE.Color("#D4AF37");
const CHAMPAGNE = new THREE.Color("#E8D5A8");

const MANILA = { lon: 120.98, lat: 14.6 };
const ROUTES = [
  { lon: 139.65, lat: 35.68 }, // Tokyo
  { lon: 126.98, lat: 37.57 }, // Seoul
  { lon: 121.47, lat: 31.23 }, // Shanghai
  { lon: 114.17, lat: 22.32 }, // Hong Kong
  { lon: 103.82, lat: 1.35 }, // Singapore
  { lon: 106.85, lat: -6.21 }, // Jakarta
  { lon: 151.21, lat: -33.87 }, // Sydney
  { lon: 55.27, lat: 25.2 }, // Dubai
  { lon: -0.13, lat: 51.51 }, // London
  { lon: -118.24, lat: 34.05 }, // Los Angeles
];

/** Unit vector for a longitude/latitude, matching THREE.SphereGeometry's UV layout. */
export function lonLat(lon: number, lat: number, r = 1) {
  const phi = ((lon + 180) * Math.PI) / 180;
  const theta = ((90 - lat) * Math.PI) / 180;
  return new THREE.Vector3(-Math.cos(phi) * Math.sin(theta) * r, Math.cos(theta) * r, Math.sin(phi) * Math.sin(theta) * r);
}

export type Layout = { width: number; height: number; scale: number; ox: number; oy: number };

type Options = { reducedMotion: boolean };

export class GlobeScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(0, 1, 0, -1, -4000, 4000);
  private clock = new THREE.Clock();
  private raf = 0;
  private running = false;
  private disposed = false;

  private root = new THREE.Group(); // positioned over the plate's globe
  private tilt = new THREE.Group(); // axial tilt + pointer parallax
  private spin = new THREE.Group(); // daily rotation + drag
  private rings: { group: THREE.Group; bead: THREE.Object3D; radius: number; speed: number; phase: number }[] = [];
  private timeUniforms: { value: number }[] = [];
  private hover = { value: 0 };
  private hoverTarget = 0;

  private spinAngle = 0;
  private spinVel = 0;
  private dragging = false;
  private lastX = 0;
  private pitch = 0;
  private pointer = new THREE.Vector2();
  private pointerSmoothed = new THREE.Vector2();
  private layout: Layout = { width: 1, height: 1, scale: 1, ox: 0, oy: 0 };

  constructor(canvas: HTMLCanvasElement, private landTexture: THREE.Texture, private opts: Options) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, premultipliedAlpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.camera.position.z = 2000;

    this.root.position.set(PLATE.cx, -PLATE.cy, 0);
    this.root.scale.setScalar(PLATE.r);
    this.scene.add(this.root);
    this.root.add(this.tilt);
    this.tilt.add(this.spin);
    this.tilt.rotation.set(0.32, 0, -0.18);

    // Face East Asia toward the viewer, as in the reference render.
    const front = lonLat(128, 8);
    this.spinAngle = -Math.atan2(front.x, front.z);

    this.scene.add(new THREE.AmbientLight(0xfff1d6, 0.55));
    const key = new THREE.DirectionalLight(0xffe2a8, 2.2);
    key.position.set(-0.6, 0.7, 1);
    this.scene.add(key);
    const back = new THREE.DirectionalLight(0xfff4dc, 1.4);
    back.position.set(1, 0.3, -0.4);
    this.scene.add(back);

    this.buildGlobe();
    this.buildAtmosphere();
    this.buildRoutes();
    this.buildRings();
    this.buildSparkles();
  }

  // ---------- construction ----------

  private time() {
    const u = { value: 0 };
    this.timeUniforms.push(u);
    return u;
  }

  private buildGlobe() {
    this.landTexture.colorSpace = THREE.NoColorSpace;
    this.landTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    const mat = new THREE.ShaderMaterial({
      uniforms: { uLand: { value: this.landTexture }, uTime: this.time(), uHover: this.hover },
      vertexShader: /* glsl */ `
        varying vec2 vUv; varying vec3 vN;
        void main(){
          vUv = uv;
          vN = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D uLand; uniform float uTime; uniform float uHover;
        varying vec2 vUv; varying vec3 vN;
        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noise(vec2 p){
          vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
        }
        float fbm(vec2 p){ float v = 0.0; float a = 0.5; for (int k = 0; k < 4; k++){ v += a * noise(p); p *= 2.1; a *= 0.5; } return v; }
        void main(){
          vec3 n = normalize(vN);
          vec3 V = vec3(0.0, 0.0, 1.0);
          vec3 L = normalize(vec3(-0.55, 0.6, 0.7));
          vec3 B = normalize(vec3(0.9, 0.25, -0.2));
          float ndl = max(dot(n, L), 0.0);
          float fres = pow(1.0 - max(dot(n, V), 0.0), 2.4);
          float land = smoothstep(0.35, 0.65, texture2D(uLand, vUv).r);

          // Ocean: deep navy glass with a soft specular highlight
          vec3 ocean = mix(vec3(0.035, 0.07, 0.15), vec3(0.11, 0.2, 0.37), ndl);
          float spec = pow(max(dot(reflect(-L, n), V), 0.0), 36.0);
          ocean += vec3(1.0, 0.9, 0.7) * spec * 0.45;

          // Land: brushed gold, brighter toward the light
          vec3 goldDark = vec3(0.28, 0.19, 0.05);
          vec3 goldLight = vec3(0.93, 0.74, 0.36);
          float terrain = fbm(vUv * vec2(160.0, 80.0));
          float lit = clamp(pow(ndl, 1.1) * (0.55 + 0.75 * terrain) + 0.08, 0.0, 1.0);
          vec3 gold = mix(goldDark, goldLight, lit);
          gold += vec3(1.0, 0.9, 0.6) * pow(max(dot(reflect(-L, n), V), 0.0), 18.0) * 0.35;

          vec3 col = mix(ocean, gold, land * 0.9);

          // Graticule every 15 degrees
          vec2 g = vec2(vUv.x * 24.0, vUv.y * 12.0);
          vec2 gd = abs(fract(g - 0.5) - 0.5) / fwidth(g);
          float grid = 1.0 - min(min(gd.x, gd.y), 1.0);
          col += vec3(0.85, 0.68, 0.3) * grid * (0.18 + 0.2 * uHover) * (1.0 - land * 0.7);

          // City lights: sparse twinkling points, mostly on land
          vec2 cells = vec2(720.0, 360.0);
          vec2 cell = floor(vUv * cells);
          float h = hash(cell);
          vec2 f = fract(vUv * cells) - 0.5;
          float threshold = mix(0.995, 0.93, land);
          float lights = step(threshold, h) * smoothstep(0.45, 0.0, length(f));
          float tw = 0.55 + 0.45 * sin(uTime * (1.5 + h * 3.0) + h * 60.0);
          col += vec3(1.0, 0.88, 0.55) * lights * tw * (1.2 + uHover);

          // Rims: warm key on the upper left, sunlit edge on the right
          col += vec3(0.95, 0.78, 0.4) * fres * (0.55 + 0.3 * uHover);
          col += vec3(1.0, 0.85, 0.55) * pow(max(dot(n, B), 0.0), 3.0) * fres * 1.3;

          gl_FragColor = vec4(col, 1.0);
        }`,
    });
    this.spin.add(new THREE.Mesh(new THREE.SphereGeometry(1, 160, 96), mat));
  }

  private buildAtmosphere() {
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      uniforms: { uHover: this.hover },
      vertexShader: /* glsl */ `varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: /* glsl */ `
        uniform float uHover; varying vec3 vN;
        void main(){
          float i = pow(max(0.6 - dot(vN, vec3(0.0, 0.0, 1.0)), 0.0), 3.0);
          gl_FragColor = vec4(vec3(1.0, 0.82, 0.45) * i * (1.1 + 0.8 * uHover), i);
        }`,
    });
    const halo = new THREE.Mesh(new THREE.SphereGeometry(1.05, 96, 64), mat);
    this.root.add(halo);
  }

  private buildRoutes() {
    const origin = lonLat(MANILA.lon, MANILA.lat);
    const pulseUniforms = { uTime: this.time(), uStatic: { value: this.opts.reducedMotion ? 1 : 0 } };
    const points: number[] = [];
    ROUTES.forEach((dest, i) => {
      const end = lonLat(dest.lon, dest.lat);
      const angle = origin.angleTo(end);
      const lift = 0.04 + angle * 0.12;
      const pts: THREE.Vector3[] = [];
      for (let k = 0; k <= 64; k++) {
        const t = k / 64;
        // Great-circle interpolation (slerp)
        const s = Math.sin(angle);
        const v = origin.clone().multiplyScalar(Math.sin((1 - t) * angle) / s).add(end.clone().multiplyScalar(Math.sin(t * angle) / s));
        pts.push(v.multiplyScalar(1 + lift * Math.sin(Math.PI * t)));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      const mat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { ...pulseUniforms, uOffset: { value: i * 0.173 } },
        vertexShader: /* glsl */ `varying float vT; void main(){ vT = uv.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: /* glsl */ `
          uniform float uTime; uniform float uOffset; uniform float uStatic; varying float vT;
          void main(){
            float head = fract(uTime * 0.11 + uOffset);
            float trail = smoothstep(head - 0.3, head, vT) * step(vT, head);
            float a = mix(0.2 + trail * 0.85, 0.5, uStatic);
            gl_FragColor = vec4(vec3(1.0, 0.8, 0.4) * (0.8 + trail * 0.6), a);
          }`,
      });
      this.spin.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 96, 0.0032, 5, false), mat));
      points.push(end.x * 1.003, end.y * 1.003, end.z * 1.003);
    });
    points.push(origin.x * 1.004, origin.y * 1.004, origin.z * 1.004);

    // Hub markers
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    const sizes = new Float32Array(points.length / 3).fill(1);
    sizes[sizes.length - 1] = 1.8; // Manila
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: this.time(), uPx: { value: 1 } },
      vertexShader: /* glsl */ `
        attribute float aSize; uniform float uTime; uniform float uPx; varying float vPulse;
        void main(){
          vPulse = 0.6 + 0.4 * sin(uTime * 2.4 + position.x * 9.0);
          gl_PointSize = 14.0 * aSize * uPx;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }`,
      fragmentShader: /* glsl */ `
        varying float vPulse;
        void main(){
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float a = smoothstep(1.0, 0.0, d) * 0.55 + smoothstep(0.3, 0.0, d);
          gl_FragColor = vec4(vec3(1.0, 0.86, 0.5) * vPulse, a);
        }`,
    });
    this.hubMaterial = mat;
    this.spin.add(new THREE.Points(geo, mat));
  }
  private hubMaterial?: THREE.ShaderMaterial;

  private buildRings() {
    const specs = [
      { radius: 1.22, tilt: [1.25, 0.35, 0.2], speed: 0.05, phase: 0 },
      { radius: 1.36, tilt: [1.05, -0.5, -0.35], speed: -0.035, phase: 2.1 },
      { radius: 1.52, tilt: [1.45, 0.15, 0.6], speed: 0.025, phase: 4.2 },
    ];
    const ringMat = new THREE.MeshStandardMaterial({ color: GOLD, emissive: GOLD, emissiveIntensity: 0.55, metalness: 0.7, roughness: 0.28 });
    const beadMat = new THREE.MeshStandardMaterial({ color: CHAMPAGNE, emissive: GOLD, emissiveIntensity: 0.9, metalness: 0.6, roughness: 0.2 });
    for (const sp of specs) {
      const group = new THREE.Group();
      group.rotation.set(sp.tilt[0], sp.tilt[1], sp.tilt[2]);
      group.add(new THREE.Mesh(new THREE.TorusGeometry(sp.radius, 0.0032, 8, 360), ringMat));
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.022, 24, 16), beadMat);
      const glow = this.glowSprite(0.16);
      bead.add(glow);
      group.add(bead);
      this.root.add(group);
      this.rings.push({ group, bead, radius: sp.radius, speed: sp.speed, phase: sp.phase });
    }
  }

  private glowSprite(size: number) {
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(0.0,0.0,0.0,1.0); mv.xy += position.xy * vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz)); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: /* glsl */ `varying vec2 vUv; void main(){ vec2 p = vUv - 0.5; float d = length(p) * 2.0; float a = exp(-d * d * 7.0) + 0.5 * exp(-abs(p.x) * 60.0) * smoothstep(0.5, 0.0, abs(p.y)) + 0.5 * exp(-abs(p.y) * 60.0) * smoothstep(0.5, 0.0, abs(p.x)); gl_FragColor = vec4(vec3(1.0, 0.88, 0.55), a); }`,
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
    return m;
  }

  private buildSparkles() {
    const n = 140;
    const pos = new Float32Array(n * 3);
    const seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      // Mostly in a band around the globe's edge, like light catching the rings
      const a = Math.random() * Math.PI * 2;
      const r = 1.02 + Math.pow(Math.random(), 1.6) * 0.65;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = Math.sin(a) * r * 0.92;
      pos[i * 3 + 2] = 1.2;
      seed[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: this.time(), uPx: { value: 1 }, uStatic: { value: this.opts.reducedMotion ? 1 : 0 } },
      vertexShader: /* glsl */ `
        attribute float aSeed; uniform float uTime; uniform float uPx; uniform float uStatic; varying float vA;
        void main(){
          float tw = mix(pow(0.5 + 0.5 * sin(uTime * (0.8 + aSeed * 2.2) + aSeed * 40.0), 6.0), 0.5, uStatic);
          vA = tw;
          gl_PointSize = (10.0 + aSeed * 22.0) * uPx * (0.4 + tw);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        varying float vA;
        void main(){
          vec2 p = gl_PointCoord - 0.5;
          float core = exp(-dot(p, p) * 60.0);
          float flare = exp(-abs(p.x) * 40.0) * smoothstep(0.5, 0.0, abs(p.y)) + exp(-abs(p.y) * 40.0) * smoothstep(0.5, 0.0, abs(p.x));
          gl_FragColor = vec4(vec3(1.0, 0.9, 0.6), (core + flare * 0.6) * vA);
        }`,
    });
    this.sparkleMaterial = mat;
    this.root.add(new THREE.Points(geo, mat));
  }
  private sparkleMaterial?: THREE.ShaderMaterial;

  // ---------- runtime ----------

  setLayout(l: Layout) {
    this.layout = l;
    this.renderer.setSize(l.width, l.height, false);
    // Plate pixel space: x right, y down → world y = -imageY
    this.camera.left = -l.ox / l.scale;
    this.camera.right = (l.width - l.ox) / l.scale;
    this.camera.top = l.oy / l.scale;
    this.camera.bottom = -(l.height - l.oy) / l.scale;
    this.camera.updateProjectionMatrix();
    const px = l.scale * this.renderer.getPixelRatio();
    if (this.hubMaterial) this.hubMaterial.uniforms.uPx.value = px;
    if (this.sparkleMaterial) this.sparkleMaterial.uniforms.uPx.value = px;
    this.renderOnce();
  }

  /** Is a point (in canvas CSS px) over the globe? */
  hit(x: number, y: number) {
    const { scale, ox, oy } = this.layout;
    const dx = x - (ox + PLATE.cx * scale);
    const dy = y - (oy + PLATE.cy * scale);
    return Math.hypot(dx, dy) < PLATE.r * scale * 1.02;
  }

  setPointer(nx: number, ny: number) {
    this.pointer.set(nx, ny);
  }

  setHover(on: boolean) {
    this.hoverTarget = on ? 1 : 0;
    if (!this.running) this.renderOnce();
  }

  dragStart(x: number) {
    this.dragging = true;
    this.lastX = x;
    this.spinVel = 0;
  }

  dragMove(x: number, dy = 0) {
    if (!this.dragging) return;
    const dx = x - this.lastX;
    this.lastX = x;
    const k = 1 / (PLATE.r * this.layout.scale);
    this.spinAngle += dx * k * 1.4;
    this.spinVel = dx * k * 1.4 * 60;
    this.pitch = THREE.MathUtils.clamp(this.pitch + dy * k * 0.6, -0.35, 0.35);
    if (!this.running) this.renderOnce();
  }

  dragEnd() {
    this.dragging = false;
  }

  start() {
    if (this.running || this.disposed) return;
    this.running = true;
    this.clock.getDelta();
    const tick = () => {
      if (!this.running) return;
      this.raf = requestAnimationFrame(tick);
      this.frame(Math.min(this.clock.getDelta(), 0.05));
    };
    tick();
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  renderOnce() {
    if (this.disposed) return;
    this.frame(0);
  }

  private frame(dt: number) {
    const t = this.clock.elapsedTime;
    for (const u of this.timeUniforms) u.value = t;

    this.hover.value += (this.hoverTarget - this.hover.value) * Math.min(1, dt * 6);

    if (!this.dragging) {
      const auto = this.opts.reducedMotion ? 0 : 0.06 + this.hover.value * 0.05;
      this.spinVel *= Math.pow(0.04, dt); // inertia decays
      this.spinAngle += (auto + this.spinVel) * dt;
      this.pitch *= Math.pow(0.3, dt);
    }
    this.spin.rotation.y = this.spinAngle;

    this.pointerSmoothed.lerp(this.pointer, Math.min(1, dt * 3));
    this.tilt.rotation.x = 0.32 + this.pitch + this.pointerSmoothed.y * 0.06;
    this.tilt.rotation.y = this.pointerSmoothed.x * 0.08;

    for (const r of this.rings) {
      const a = r.phase + t * r.speed * 6;
      r.bead.position.set(Math.cos(a) * r.radius, Math.sin(a) * r.radius, 0);
      if (!this.opts.reducedMotion) r.group.rotation.z += r.speed * dt * 0.6;
    }
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.disposed = true;
    this.stop();
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose();
    });
    this.landTexture.dispose();
    this.renderer.dispose();
  }
}
