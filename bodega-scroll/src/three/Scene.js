import * as THREE from 'three'

/* ============================================================================
   BodegaScene — a deterministic, scroll-driven 3D scene.
   Everything visual is a pure function of `progress` (0..1) via setProgress(),
   so the same moment renders identically whether you SCROLL there or snap()/?cap=
   jump there. No raw scroll listeners inside; the GSAP timeline calls setProgress.
   All geometry is procedural + canvas textures (no external binaries).
   ============================================================================ */

// ---- small math helpers -----------------------------------------------------
const clamp01 = (x) => Math.min(1, Math.max(0, x))
const lerp = (a, b, t) => a + (b - a) * t
// remap v in [a,b] -> [0,1], clamped
const range = (v, a, b) => clamp01((v - a) / (b - a))
// smoothstep for gentler transitions
const smooth = (t) => t * t * (3 - 2 * t)

// Camera keyframes: dolly off the street, through the door, into the boutique,
// then pull back to resolve. Position + lookAt are lerped between neighbours.
const CAM = [
  { p: 0.0, pos: [0, 1.6, 9.5], look: [0, 1.5, 0] },
  { p: 0.2, pos: [0, 1.5, 5.0], look: [0, 1.4, 0] },
  { p: 0.33, pos: [0, 1.45, 2.4], look: [0, 1.4, -1] },
  { p: 0.48, pos: [0, 1.4, 0.2], look: [0, 1.4, -4] },
  { p: 0.6, pos: [0, 1.4, -2.6], look: [0, 1.25, -7] },
  { p: 0.7, pos: [0.2, 1.35, -4.2], look: [0, 1.1, -7] },
  { p: 0.84, pos: [2.4, 1.6, -4.6], look: [0, 1.1, -7] },
  { p: 1.0, pos: [0, 2.4, -1.5], look: [0, 1.2, -6.5] },
]

function sampleKeyframes(frames, p, out) {
  // find bracketing keyframes
  let a = frames[0]
  let b = frames[frames.length - 1]
  for (let i = 0; i < frames.length - 1; i++) {
    if (p >= frames[i].p && p <= frames[i + 1].p) {
      a = frames[i]
      b = frames[i + 1]
      break
    }
  }
  const t = smooth(range(p, a.p, b.p))
  for (let i = 0; i < 3; i++) {
    out.pos[i] = lerp(a.pos[i], b.pos[i], t)
    out.look[i] = lerp(a.look[i], b.look[i], t)
  }
}

// ---- canvas textures (cheap "designed" detail) ------------------------------
function makeCanvas(w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')]
}

function neonSignTexture() {
  const [c, ctx] = makeCanvas(1024, 320)
  ctx.clearRect(0, 0, 1024, 320)
  ctx.fillStyle = '#0b0d14'
  ctx.fillRect(0, 0, 1024, 320)
  ctx.font = '900 180px Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  // glow pass
  ctx.shadowColor = '#ffc83d'
  ctx.shadowBlur = 48
  ctx.fillStyle = '#ffd95e'
  ctx.fillText('BODEGA', 512, 160)
  ctx.shadowBlur = 0
  ctx.strokeStyle = 'rgba(255,236,170,0.9)'
  ctx.lineWidth = 3
  ctx.strokeText('BODEGA', 512, 160)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

function coolerDoorTexture() {
  const [c, ctx] = makeCanvas(512, 1024)
  // metal frame
  const g = ctx.createLinearGradient(0, 0, 512, 0)
  g.addColorStop(0, '#3a3f4a')
  g.addColorStop(0.5, '#6b7280')
  g.addColorStop(1, '#2b2f38')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 1024)
  // glass panel
  ctx.fillStyle = '#0e1726'
  ctx.fillRect(40, 60, 432, 904)
  // cold interior glow
  const gg = ctx.createLinearGradient(0, 60, 0, 964)
  gg.addColorStop(0, 'rgba(120,180,220,0.35)')
  gg.addColorStop(1, 'rgba(40,80,120,0.15)')
  ctx.fillStyle = gg
  ctx.fillRect(40, 60, 432, 904)
  // shelves
  ctx.strokeStyle = 'rgba(180,210,230,0.45)'
  ctx.lineWidth = 6
  for (let y = 200; y < 960; y += 180) {
    ctx.beginPath()
    ctx.moveTo(48, y)
    ctx.lineTo(464, y)
    ctx.stroke()
  }
  // "COLD DRINKS" label
  ctx.fillStyle = '#e4322b'
  ctx.fillRect(120, 92, 272, 52)
  ctx.fillStyle = '#fff'
  ctx.font = '800 30px Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('COLD DRINKS', 256, 128)
  // handle
  ctx.fillStyle = '#c8ccd2'
  ctx.fillRect(70, 460, 18, 120)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function brickTexture() {
  const [c, ctx] = makeCanvas(512, 512)
  ctx.fillStyle = '#161821'
  ctx.fillRect(0, 0, 512, 512)
  ctx.fillStyle = '#1c1f2a'
  const bw = 96
  const bh = 40
  for (let y = 0; y < 512; y += bh + 6) {
    const off = (y / (bh + 6)) % 2 ? bw / 2 : 0
    for (let x = -bw; x < 512; x += bw + 8) {
      ctx.fillRect(x + off, y, bw, bh)
    }
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(3, 2)
  return t
}

export default class BodegaScene {
  constructor(canvas, opts = {}) {
    this.canvas = canvas
    this.lowPower = !!opts.lowPower
    this.reducedMotion = !!opts.reducedMotion
    this.progress = 0
    this.needsRender = true
    this._raf = null
    this._disposables = []
    this._camOut = { pos: [0, 0, 0], look: [0, 0, 0] }
    this._tmpLook = new THREE.Vector3()

    this._initRenderer()
    this._initScene()
    this._build()
    this.setProgress(0)
  }

  _initRenderer() {
    const r = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: !this.lowPower,
      powerPreference: 'high-performance',
    })
    r.setPixelRatio(Math.min(window.devicePixelRatio, this.lowPower ? 1.5 : 2))
    r.setSize(window.innerWidth, window.innerHeight, false)
    r.toneMapping = THREE.ACESFilmicToneMapping
    r.toneMappingExposure = 1.05
    this.renderer = r
  }

  _initScene() {
    this.scene = new THREE.Scene()
    this.nightFog = new THREE.Color(0x14100a)
    this.galleryFog = new THREE.Color(0xe7e8ec)
    this.scene.fog = new THREE.Fog(this.nightFog.getHex(), 6, 26)
    this.scene.background = this.nightFog.clone()

    this.camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 100)
    this.camera.position.set(0, 1.6, 9.5)
  }

  _track(obj) {
    this._disposables.push(obj)
    return obj
  }

  _build() {
    const s = this.scene

    // ---- lights ----
    this.ambient = new THREE.AmbientLight(0xffffff, 0.25)
    s.add(this.ambient)

    // warm street light out front (fades as we go inside)
    this.streetLight = new THREE.PointLight(0xffb347, 1.6, 40, 1.4)
    this.streetLight.position.set(0, 3.2, 5)
    s.add(this.streetLight)

    // cool gallery spotlight on the pedestal (ramps up inside)
    this.interiorLight = new THREE.SpotLight(0xeaf2ff, 0.0, 24, Math.PI / 5, 0.4, 1.2)
    this.interiorLight.position.set(0, 5.5, -6)
    this.interiorLight.target.position.set(0, 0.8, -7)
    s.add(this.interiorLight, this.interiorLight.target)

    // ---- ground ----
    const ground = new THREE.Mesh(
      this._track(new THREE.PlaneGeometry(60, 60)),
      this._track(new THREE.MeshStandardMaterial({ color: 0x0a0b10, roughness: 0.85, metalness: 0.1 })),
    )
    ground.rotation.x = -Math.PI / 2
    s.add(ground)

    // ---- facade wall (with a doorway opening) built from 3 boxes ----
    const wallMat = this._track(new THREE.MeshStandardMaterial({ map: brickTexture(), roughness: 0.9 }))
    const doorW = 1.6
    const wallH = 5
    const mkWall = (w, x) => {
      const m = new THREE.Mesh(this._track(new THREE.BoxGeometry(w, wallH, 0.3)), wallMat)
      m.position.set(x, wallH / 2, 0)
      s.add(m)
      return m
    }
    mkWall(4, -doorW / 2 - 2) // left of door
    mkWall(4, doorW / 2 + 2) // right of door
    // lintel above door
    const lintel = new THREE.Mesh(this._track(new THREE.BoxGeometry(doorW + 0.4, 1.4, 0.3)), wallMat)
    lintel.position.set(0, wallH - 0.7, 0)
    s.add(lintel)

    // awning (red)
    const awning = new THREE.Mesh(
      this._track(new THREE.BoxGeometry(9, 0.18, 1.6)),
      this._track(new THREE.MeshStandardMaterial({ color: 0xe4322b, roughness: 0.6 })),
    )
    awning.position.set(0, 3.7, 0.9)
    awning.rotation.x = -0.32
    s.add(awning)

    // ---- neon sign (emissive plane, additive glow) ----
    const signTex = neonSignTexture()
    this.signMat = this._track(
      new THREE.MeshBasicMaterial({ map: signTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
    )
    this.neonSign = new THREE.Mesh(this._track(new THREE.PlaneGeometry(4.6, 1.44)), this.signMat)
    this.neonSign.position.set(0, 4.35, 0.95)
    s.add(this.neonSign)

    // ---- cooler door (the secret door) on a hinge pivot ----
    this.doorPivot = new THREE.Group()
    this.doorPivot.position.set(-doorW / 2, 0, 0.16) // hinge at left edge
    s.add(this.doorPivot)
    const doorMat = this._track(
      new THREE.MeshStandardMaterial({ map: coolerDoorTexture(), roughness: 0.4, metalness: 0.5, emissive: 0x10202e, emissiveIntensity: 0.6 }),
    )
    const door = new THREE.Mesh(this._track(new THREE.BoxGeometry(doorW, 3.4, 0.12)), doorMat)
    door.position.set(doorW / 2, 1.7, 0) // offset so it swings around the hinge
    this.doorPivot.add(door)
    this.doorMat = doorMat

    // glow that leaks from inside as the door opens
    this.leak = new THREE.Mesh(
      this._track(new THREE.PlaneGeometry(doorW, 3.4)),
      this._track(new THREE.MeshBasicMaterial({ color: 0xbfe0ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })),
    )
    this.leak.position.set(0, 1.7, -0.4)
    s.add(this.leak)

    // ---- interior: floor light pool + shelving silhouettes ----
    const shelfMat = this._track(new THREE.MeshStandardMaterial({ color: 0x20242e, roughness: 0.7 }))
    const mkShelf = (x) => {
      const m = new THREE.Mesh(this._track(new THREE.BoxGeometry(0.5, 3.4, 2.4)), shelfMat)
      m.position.set(x, 1.7, -7)
      s.add(m)
    }
    mkShelf(-3.2)
    mkShelf(3.2)
    // back wall
    const back = new THREE.Mesh(
      this._track(new THREE.BoxGeometry(12, 6, 0.3)),
      this._track(new THREE.MeshStandardMaterial({ color: 0xd9dadf, roughness: 0.95 })),
    )
    back.position.set(0, 3, -9)
    s.add(back)

    // ---- pedestal + product (rotates deterministically with progress) ----
    const ped = new THREE.Mesh(
      this._track(new THREE.CylinderGeometry(0.7, 0.8, 0.9, 48)),
      this._track(new THREE.MeshStandardMaterial({ color: 0x101218, roughness: 0.5, metalness: 0.2 })),
    )
    ped.position.set(0, 0.45, -7)
    s.add(ped)

    this.product = new THREE.Mesh(
      this._track(new THREE.IcosahedronGeometry(0.62, 0)),
      this._track(new THREE.MeshStandardMaterial({ color: 0xf4ecdd, roughness: 0.35, metalness: 0.3, flatShading: true, emissive: 0xffc83d, emissiveIntensity: 0.06 })),
    )
    this.product.position.set(0, 1.35, -7)
    s.add(this.product)
  }

  // The single source of truth: position the whole scene for progress p (0..1).
  setProgress(p) {
    this.progress = clamp01(p)
    const P = this.progress

    // camera dolly + look
    sampleKeyframes(CAM, P, this._camOut)
    this.camera.position.set(this._camOut.pos[0], this._camOut.pos[1], this._camOut.pos[2])
    this._tmpLook.set(this._camOut.look[0], this._camOut.look[1], this._camOut.look[2])
    this.camera.lookAt(this._tmpLook)

    // door swings open between p .14 and .36
    const open = smooth(range(P, 0.14, 0.36))
    this.doorPivot.rotation.y = lerp(0, -2.05, open)
    this.leak.material.opacity = lerp(0, 0.5, open) * (1 - range(P, 0.5, 0.62))

    // palette grade: night street -> gallery white between .35 and .62
    const grade = smooth(range(P, 0.35, 0.62))
    const fogCol = this.nightFog.clone().lerp(this.galleryFog, grade)
    this.scene.fog.color.copy(fogCol)
    this.scene.background.copy(fogCol)
    this.scene.fog.near = lerp(6, 2, grade)
    this.scene.fog.far = lerp(26, 18, grade)

    // lights cross-fade
    this.streetLight.intensity = lerp(1.6, 0.08, grade)
    this.interiorLight.intensity = lerp(0, 2.4, smooth(range(P, 0.3, 0.58)))
    this.ambient.intensity = lerp(0.25, 0.55, grade)

    // neon sign fades out once inside
    this.signMat.opacity = 1 - range(P, 0.3, 0.5)

    // product spins + rises as you reach the drop
    this.product.rotation.y = P * Math.PI * 6
    this.product.position.y = 1.35 + Math.sin(range(P, 0.55, 0.8) * Math.PI) * 0.18

    // hero-only neon flicker keeps the rAF "alive"; elsewhere we render on demand
    this._atmosphere = !this.reducedMotion && P < 0.18

    this.needsRender = true
  }

  render(time = 0) {
    // subtle neon flicker (atmosphere) — only computed while in hero range
    if (this._atmosphere && this.signMat.opacity > 0.01) {
      const f = 0.86 + Math.sin(time * 0.02) * 0.06 + (Math.random() < 0.04 ? -0.25 : 0)
      this.neonSign.scale.setScalar(1)
      this.signMat.opacity = Math.max(0, (1 - range(this.progress, 0.3, 0.5)) * f)
      this.needsRender = true
    }
    this.renderer.render(this.scene, this.camera)
  }

  start() {
    const loop = (t) => {
      this._raf = requestAnimationFrame(loop)
      if (this.needsRender || this._atmosphere) {
        this.needsRender = false
        this.render(t)
      }
    }
    this._raf = requestAnimationFrame(loop)
  }

  stop() {
    if (this._raf) cancelAnimationFrame(this._raf)
    this._raf = null
  }

  resize() {
    const w = window.innerWidth
    const h = window.innerHeight
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h, false)
    this.needsRender = true
  }

  dispose() {
    this.stop()
    for (const d of this._disposables) {
      if (d.dispose) d.dispose()
      if (d.map && d.map.dispose) d.map.dispose()
    }
    this.renderer.dispose()
  }
}
