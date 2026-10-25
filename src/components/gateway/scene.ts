import * as THREE from "three";

export type GatewayData = {
  origin: { name: string; p: [number, number] };
  hubs: { name: string; p: [number, number]; km: number }[];
  zones: { name: string; p: [number, number] }[];
  shapes: { r: string; rings: [number, number][][] }[];
  dots: number[];
};

type Options = {
  reducedMotion: boolean;
  onLabels?: (labels: { name: string; x: number; y: number; visible: boolean }[]) => void;
};

const NAVY = new THREE.Color("#162A4D");
const NAVY_DEEP = new THREE.Color("#0E1D38");
const GOLD = new THREE.Color("#D4AF37");
const CHAMPAGNE = new THREE.Color("#E8D5A8");

// Plane coordinates are [east, north] in degrees; the scene uses x = east, y = up, z = south.
const toV3 = (p: [number, number], h = 0) => new THREE.Vector3(p[0], h, -p[1]);

const LAND_H = 0.16;

/** Camera framings: wide regional view at the top of the page, closer archipelago view after scrolling. */
const SHOTS = {
  wide: { pos: new THREE.Vector3(-3, 25, 19), target: new THREE.Vector3(2.4, 0, -4.2) },
  near: { pos: new THREE.Vector3(-1.6, 13, 11), target: new THREE.Vector3(0.6, 0, -0.4) },
};

export class GatewayScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(34, 1, 0.1, 400);
  private clock = new THREE.Clock();
  private raf = 0;
  private running = false;
  private progress = 0; // scroll progress 0..1
  private pointer = new THREE.Vector2();
  private pointerSmoothed = new THREE.Vector2();
  private arcUniforms: { uTime: { value: number } }[] = [];
  private pulseMats: THREE.ShaderMaterial[] = [];
  private hubPositions: { name: string; v: THREE.Vector3 }[] = [];
  private width = 1;
  private height = 1;
  private offsetX = 0;
  private disposed = false;

  constructor(private canvas: HTMLCanvasElement, private data: GatewayData, private opts: Options) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.scene.background = NAVY_DEEP;
    this.scene.fog = new THREE.Fog(NAVY_DEEP, 42, 95);

    this.buildLights();
    this.buildOcean();
    this.buildDots();
    this.buildArchipelago();
    this.buildArcs();
    this.applyCamera(true);
  }

  // ---------- construction ----------

  private buildLights() {
    this.scene.add(new THREE.HemisphereLight(new THREE.Color("#f3dfae"), NAVY_DEEP, 0.55));
    const key = new THREE.DirectionalLight(new THREE.Color("#ffd98a"), 2.4);
    key.position.set(-14, 12, 8);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(new THREE.Color("#7f9bd6"), 0.6);
    rim.position.set(12, 6, -14);
    this.scene.add(rim);
  }

  private buildOcean() {
    // A soft radial glow under the archipelago so the islands sit in light, not in a void.
    const geo = new THREE.PlaneGeometry(120, 120);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.ShaderMaterial({
      depthWrite: false,
      uniforms: { uNavy: { value: NAVY }, uGold: { value: GOLD } },
      vertexShader: `varying vec2 vXZ; void main(){ vXZ = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `
        uniform vec3 uNavy; uniform vec3 uGold; varying vec2 vXZ;
        void main(){
          float d = length(vXZ - vec2(0.0, 0.5));
          float glow = exp(-d * d / 60.0);
          float grid = 0.0;
          vec2 g = abs(fract(vXZ / 2.0 - 0.5) - 0.5) / fwidth(vXZ / 2.0);
          grid = 1.0 - min(min(g.x, g.y), 1.0);
          vec3 col = mix(uNavy * 0.55, uNavy * 1.15, glow) + uGold * glow * 0.05;
          float a = 0.95;
          col += uGold * grid * 0.035 * smoothstep(40.0, 4.0, d);
          gl_FragColor = vec4(col, a);
        }`,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = -0.02;
    mesh.renderOrder = -10;
    this.scene.add(mesh);
  }

  private buildDots() {
    const n = this.data.dots.length / 2;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = this.data.dots[i * 2];
      pos[i * 3 + 1] = 0.02;
      pos[i * 3 + 2] = -this.data.dots[i * 2 + 1];
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uColor: { value: CHAMPAGNE }, uScale: { value: this.renderer.getPixelRatio() } },
      vertexShader: `
        uniform float uScale; varying float vFade;
        void main(){
          vec4 mv = modelViewMatrix * vec4(position,1.0);
          gl_PointSize = uScale * 95.0 / -mv.z;
          vFade = smoothstep(70.0, 22.0, -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform vec3 uColor; varying float vFade;
        void main(){
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.2, d);
          gl_FragColor = vec4(uColor, a * 0.62 * vFade);
        }`,
    });
    this.scene.add(new THREE.Points(geo, mat));
  }

  private buildArchipelago() {
    // ExtrudeGeometry emits two groups: 0 = top/bottom caps, 1 = sides. Collect each into
    // one buffer so the whole archipelago is two draw calls.
    const caps: number[] = [];
    const sides: number[] = [];
    const edge: number[] = [];
    for (const s of this.data.shapes) {
      const [outer, ...holes] = s.rings;
      const shape = new THREE.Shape(outer.map(([x, y]) => new THREE.Vector2(x, y)));
      for (const h of holes) shape.holes.push(new THREE.Path(h.map(([x, y]) => new THREE.Vector2(x, y))));
      const g = new THREE.ExtrudeGeometry(shape, { depth: LAND_H, bevelEnabled: false, curveSegments: 1 });
      g.rotateX(-Math.PI / 2);
      const flat = g.index ? g.toNonIndexed() : g;
      const pos = flat.getAttribute("position").array as ArrayLike<number>;
      for (const group of flat.groups) {
        const out = group.materialIndex === 0 ? caps : sides;
        for (let i = group.start * 3; i < (group.start + group.count) * 3; i++) out.push(pos[i]);
      }
      g.dispose();
      if (flat !== g) flat.dispose();
      for (const ring of s.rings) {
        for (let i = 0; i < ring.length - 1; i++) {
          edge.push(ring[i][0], LAND_H + 0.002, -ring[i][1], ring[i + 1][0], LAND_H + 0.002, -ring[i + 1][1]);
        }
      }
    }
    const mesh = (arr: number[], mat: THREE.Material) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
      geo.computeVertexNormals();
      this.scene.add(new THREE.Mesh(geo, mat));
    };
    mesh(
      caps,
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#203a66"),
        emissive: new THREE.Color("#1b3360"),
        emissiveIntensity: 0.75,
        metalness: 0.35,
        roughness: 0.55,
      })
    );
    mesh(sides, new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.85, roughness: 0.32, emissive: GOLD, emissiveIntensity: 0.25 }));

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(edge, 3));
    const lineMat = new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
    this.scene.add(new THREE.LineSegments(lineGeo, lineMat));
  }

  private buildArcs() {
    const origin = toV3(this.data.origin.p, LAND_H);
    // Manila beacon
    this.scene.add(this.makePulse(origin, 1.1, 0));

    this.data.hubs.forEach((hub, i) => {
      const end = toV3(hub.p, 0.03);
      const dist = origin.distanceTo(end);
      const mid = origin.clone().lerp(end, 0.5);
      mid.y = 0.6 + dist * 0.28;
      const curve = new THREE.QuadraticBezierCurve3(origin, mid, end);
      const tube = new THREE.TubeGeometry(curve, 96, 0.022, 6, false);
      const uniforms = { uTime: { value: 0 }, uOffset: { value: i * 0.137 }, uGold: { value: GOLD }, uStatic: { value: this.opts.reducedMotion ? 1 : 0 } };
      this.arcUniforms.push(uniforms);
      const mat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms,
        vertexShader: `varying float vT; void main(){ vT = uv.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `
          uniform float uTime; uniform float uOffset; uniform vec3 uGold; uniform float uStatic; varying float vT;
          void main(){
            float base = 0.22;
            float head = fract(uTime * 0.16 + uOffset);
            float trail = smoothstep(head - 0.28, head, vT) * step(vT, head);
            float a = mix(base + trail * 0.9, 0.55, uStatic);
            a *= smoothstep(0.0, 0.04, vT);
            gl_FragColor = vec4(uGold * (1.0 + trail * 0.6), a);
          }`,
      });
      this.scene.add(new THREE.Mesh(tube, mat));
      this.scene.add(this.makePulse(end, 0.55, i * 0.37));
      this.hubPositions.push({ name: hub.name, v: end.clone().setY(0.25) });
    });
  }

  private makePulse(at: THREE.Vector3, size: number, phase: number) {
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uPhase: { value: phase }, uGold: { value: GOLD }, uStatic: { value: this.opts.reducedMotion ? 1 : 0 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `
        uniform float uTime; uniform float uPhase; uniform vec3 uGold; uniform float uStatic; varying vec2 vUv;
        void main(){
          float d = length(vUv - 0.5) * 2.0;
          float core = smoothstep(0.22, 0.0, d);
          float t = fract(uTime * 0.45 + uPhase) * (1.0 - uStatic);
          float ring = smoothstep(0.06, 0.0, abs(d - t)) * (1.0 - t);
          float halo = exp(-d * d * 6.0) * 0.35;
          gl_FragColor = vec4(uGold * 1.4, core + ring * 0.7 + halo);
        }`,
    });
    this.pulseMats.push(mat);
    const geo = new THREE.PlaneGeometry(size, size);
    geo.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(at).setY(at.y + 0.01);
    return m;
  }

  // ---------- runtime ----------

  resize(width: number, height: number) {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.renderer.setSize(this.width, this.height, false);
    this.camera.aspect = this.width / this.height;
    // On wide screens shift the subject right so the headline has room on the left.
    // On narrow screens the copy sits at the bottom, so lift the subject into the top half.
    this.offsetX = this.width > 900 ? -this.width * 0.2 : 0;
    const offsetY = this.width > 900 ? 0 : this.height * 0.27;
    this.camera.setViewOffset(this.width, this.height, this.offsetX, offsetY, this.width, this.height);
    // Pull back on tall, narrow screens so the routes stay in frame.
    this.camera.fov = this.camera.aspect < 0.8 ? 52 : this.camera.aspect < 1.2 ? 42 : 34;
    this.camera.updateProjectionMatrix();
    this.renderOnce();
  }

  setProgress(p: number) {
    this.progress = THREE.MathUtils.clamp(p, 0, 1);
    if (!this.running) this.renderOnce();
  }

  setPointer(x: number, y: number) {
    this.pointer.set(x, y);
  }

  start() {
    if (this.running || this.disposed) return;
    this.running = true;
    this.clock.start();
    const tick = () => {
      if (!this.running) return;
      this.raf = requestAnimationFrame(tick);
      this.frame();
    };
    tick();
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  renderOnce() {
    if (this.disposed) return;
    this.applyCamera(true);
    this.renderer.render(this.scene, this.camera);
    this.emitLabels();
  }

  private frame() {
    const t = this.clock.getElapsedTime();
    for (const u of this.arcUniforms) u.uTime.value = t;
    for (const m of this.pulseMats) m.uniforms.uTime.value = t;
    this.applyCamera(false);
    this.renderer.render(this.scene, this.camera);
    this.emitLabels();
  }

  private applyCamera(snap: boolean) {
    const e = this.progress * this.progress * (3 - 2 * this.progress); // smoothstep
    const pos = SHOTS.wide.pos.clone().lerp(SHOTS.near.pos, e);
    const target = SHOTS.wide.target.clone().lerp(SHOTS.near.target, e);
    if (!this.opts.reducedMotion) {
      const k = snap ? 1 : 0.06;
      this.pointerSmoothed.lerp(this.pointer, k);
      const t = this.clock.getElapsedTime();
      pos.x += this.pointerSmoothed.x * 1.6 + Math.sin(t * 0.12) * 0.6;
      pos.y += -this.pointerSmoothed.y * 0.8;
    }
    this.camera.position.copy(pos);
    this.camera.lookAt(target);
  }

  private v = new THREE.Vector3();
  private emitLabels() {
    if (!this.opts.onLabels) return;
    const labels = this.hubPositions.map(({ name, v }) => {
      this.v.copy(v).project(this.camera);
      // setViewOffset shifts the projection; map NDC back to element coordinates.
      const x = ((this.v.x + 1) / 2) * this.width;
      const y = ((1 - this.v.y) / 2) * this.height;
      const visible = this.v.z < 1 && x > 8 && x < this.width - 8 && y > 70 && y < this.height - 8;
      return { name, x, y, visible };
    });
    this.opts.onLabels(labels);
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
    this.renderer.dispose();
  }
}

export function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}
