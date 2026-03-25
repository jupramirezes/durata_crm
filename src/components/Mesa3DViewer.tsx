import { useRef, useEffect, useCallback, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { ConfigMesa } from '../types'
import { Eye, RotateCcw, ArrowUp, ArrowRight } from 'lucide-react'

/* ── Material presets ──────────────────────────── */
const MATERIAL_PRESETS: Record<string, { color: number; metalness: number; roughness: number }> = {
  '304_mate':      { color: 0xc0c8d0, metalness: 0.7, roughness: 0.4 },
  '304_satinado':  { color: 0xccd4dc, metalness: 0.8, roughness: 0.25 },
  '304_brillante': { color: 0xd8dfe6, metalness: 0.9, roughness: 0.15 },
  '430_mate':      { color: 0xb0b8c0, metalness: 0.6, roughness: 0.5 },
  '430_satinado':  { color: 0xbcc4cc, metalness: 0.7, roughness: 0.35 },
  '430_brillante': { color: 0xc8d0d8, metalness: 0.85, roughness: 0.15 },
}

const LEG_MAT_PROPS   = { color: 0x888888, metalness: 0.8, roughness: 0.3 }
const DARK_MAT_PROPS  = { color: 0x333333, metalness: 0.3, roughness: 0.7 }
const CHROME_MAT_PROPS = { color: 0xe0e8f0, metalness: 0.95, roughness: 0.05 }
const POZUELO_MAT_PROPS = { color: 0x1a1a2e, metalness: 0.4, roughness: 0.6 }

interface Props {
  config: ConfigMesa
}

export default function Mesa3DViewer({ config }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const meshGroupRef = useRef<THREE.Group | null>(null)
  const rafRef = useRef<number>(0)
  const needsRenderRef = useRef(true)
  const [webglSupported] = useState(() => !!window.WebGLRenderingContext)

  /* ── Build/rebuild mesa geometry ─────────────── */
  const buildMesa = useCallback((cfg: ConfigMesa, group: THREE.Group) => {
    // Clear existing
    while (group.children.length) {
      const child = group.children[0] as THREE.Mesh
      child.geometry?.dispose()
      ;(child.material as THREE.Material)?.dispose?.()
      group.remove(child)
    }

    const matKey = `${cfg.tipo_acero}_${cfg.acabado}`
    const preset = MATERIAL_PRESETS[matKey] || MATERIAL_PRESETS['304_mate']
    const steelMat = new THREE.MeshStandardMaterial({ ...preset })
    const legMat = new THREE.MeshStandardMaterial({ ...LEG_MAT_PROPS })
    const darkMat = new THREE.MeshStandardMaterial({ ...DARK_MAT_PROPS })
    const chromeMat = new THREE.MeshStandardMaterial({ ...CHROME_MAT_PROPS })
    const pozMat = new THREE.MeshStandardMaterial({ ...POZUELO_MAT_PROPS })

    const L = cfg.largo, W = cfg.ancho, H = cfg.alto

    // ── Surface (mesón) ──
    const surface = new THREE.Mesh(new THREE.BoxGeometry(L, 0.02, W), steelMat)
    surface.position.set(0, H, 0)
    surface.castShadow = true
    surface.receiveShadow = true
    group.add(surface)

    // Edge highlight
    const edges = new THREE.EdgesGeometry(surface.geometry)
    const edgeLine = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x8899aa, transparent: true, opacity: 0.3 }))
    edgeLine.position.copy(surface.position)
    group.add(edgeLine)

    // ── Patas ──
    const legW = 0.038
    const legH = H - 0.02
    const offset = 0.05
    const legPositions: [number, number][] = [
      [-L / 2 + offset, -W / 2 + offset],
      [-L / 2 + offset,  W / 2 - offset],
      [ L / 2 - offset, -W / 2 + offset],
      [ L / 2 - offset,  W / 2 - offset],
    ]
    if (cfg.patas >= 6) {
      legPositions.push([0, -W / 2 + offset], [0, W / 2 - offset])
    }
    for (const [x, z] of legPositions) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(legW, legH, legW), legMat)
      leg.position.set(x, legH / 2, z)
      leg.castShadow = true
      group.add(leg)

      if (cfg.ruedas) {
        // Wheel
        const wheelGroup = new THREE.Group()
        const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.06, 8), darkMat)
        wheelGroup.add(axle)
        const plate = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.004, 0.03), darkMat)
        plate.position.y = 0.03
        wheelGroup.add(plate)
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.018, 16), darkMat)
        wheel.rotation.z = Math.PI / 2
        wheel.position.y = -0.025
        wheelGroup.add(wheel)
        wheelGroup.position.set(x, -0.01, z)
        group.add(wheelGroup)
      } else {
        // Nivelador
        const niv = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.012, 16), darkMat)
        niv.position.set(x, 0.006, z)
        group.add(niv)
      }
    }

    // ── Entrepaños ──
    if (cfg.entrepaños > 0) {
      for (let i = 0; i < cfg.entrepaños; i++) {
        const yFrac = cfg.entrepaños === 1 ? 0.25 : (i + 1) / (cfg.entrepaños + 1)
        const ent = new THREE.Mesh(
          new THREE.BoxGeometry(L - 0.12, 0.018, W - 0.12),
          steelMat.clone()
        )
        ent.position.set(0, H * yFrac, 0)
        ent.castShadow = true
        ent.receiveShadow = true
        group.add(ent)
      }
    }

    // ── Salpicadero ──
    if (cfg.salp_long > 0 && cfg.alto_salp > 0) {
      const salpH = cfg.alto_salp
      const salp = new THREE.Mesh(
        new THREE.BoxGeometry(L, salpH, 0.018),
        steelMat.clone()
      )
      salp.position.set(0, H + salpH / 2, -W / 2 + 0.009)
      salp.castShadow = true
      group.add(salp)
    }

    // Salpicadero lateral
    if (cfg.salp_lat > 0 && cfg.alto_salp > 0) {
      for (const side of [-1, 1]) {
        const salpLat = new THREE.Mesh(
          new THREE.BoxGeometry(0.018, cfg.alto_salp, W),
          steelMat.clone()
        )
        salpLat.position.set(side * (L / 2 - 0.009), H + cfg.alto_salp / 2, 0)
        salpLat.castShadow = true
        group.add(salpLat)
      }
    }

    // ── Babero ──
    if (cfg.babero && cfg.alto_babero > 0) {
      const babH = cfg.alto_babero
      const babMat = new THREE.MeshStandardMaterial({ ...preset, roughness: preset.roughness * 0.7 })
      const bab = new THREE.Mesh(
        new THREE.BoxGeometry(L, babH, 0.015),
        babMat
      )
      bab.position.set(0, H - babH / 2, W / 2 - 0.0075)
      bab.castShadow = true
      group.add(bab)
    }

    // ── Pozuelos ──
    if (cfg.pozuelos_rect > 0 && cfg.pozuelo_dims.length > 0) {
      const poz = cfg.pozuelo_dims[0]
      const pL = poz.largo || 0.5, pW = poz.ancho || 0.4, pD = poz.alto || 0.3

      // Pozuelo cavity
      const cavity = new THREE.Mesh(
        new THREE.BoxGeometry(pL, pD, pW),
        pozMat
      )
      cavity.position.set(L / 2 - pL / 2 - 0.1, H - pD / 2, 0)
      group.add(cavity)

      // Rim
      const rimMat = steelMat.clone()
      const rimThick = 0.008
      // Front/back rims
      for (const side of [-1, 1]) {
        const rim = new THREE.Mesh(new THREE.BoxGeometry(pL + rimThick * 2, 0.025, rimThick), rimMat)
        rim.position.set(L / 2 - pL / 2 - 0.1, H + 0.003, side * (pW / 2) )
        group.add(rim)
      }
      // Left/right rims
      for (const side of [-1, 1]) {
        const rim = new THREE.Mesh(new THREE.BoxGeometry(rimThick, 0.025, pW + rimThick * 2), rimMat)
        rim.position.set(L / 2 - pL / 2 - 0.1 + side * (pL / 2), H + 0.003, 0)
        group.add(rim)
      }

      // Drain
      const drain = new THREE.Mesh(
        new THREE.CircleGeometry(0.018, 16),
        darkMat
      )
      drain.rotation.x = -Math.PI / 2
      drain.position.set(L / 2 - pL / 2 - 0.1, H - pD + 0.002, 0)
      group.add(drain)

      // Faucet
      const faucetGroup = new THREE.Group()
      // Base
      const fBase = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.02, 16), chromeMat)
      fBase.position.y = H + 0.01
      faucetGroup.add(fBase)
      // Vertical tube
      const fTube = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.14, 8), chromeMat)
      fTube.position.y = H + 0.09
      faucetGroup.add(fTube)
      // Arm
      const fArm = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.08, 8), chromeMat)
      fArm.rotation.z = Math.PI / 2
      fArm.position.set(-0.04, H + 0.16, 0)
      faucetGroup.add(fArm)
      // Spout
      const fSpout = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.035, 8), chromeMat)
      fSpout.position.set(-0.08, H + 0.143, 0)
      faucetGroup.add(fSpout)
      // Handle
      const fHandle = new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 12), chromeMat)
      fHandle.position.set(0.02, H + 0.16, 0)
      faucetGroup.add(fHandle)

      faucetGroup.position.set(L / 2 - pL - 0.12, 0, -pW / 2 - 0.04)
      group.add(faucetGroup)
    }

    // ── Escabiladero ──
    if (cfg.escabiladero) {
      const escGroup = new THREE.Group()
      const barCount = 5
      const escH = H * 0.6
      const spacing = escH / (barCount + 1)
      for (let i = 1; i <= barCount; i++) {
        const bar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.005, 0.005, W - 0.1, 8),
          steelMat.clone()
        )
        bar.rotation.x = Math.PI / 2
        bar.position.set(0, i * spacing, 0)
        escGroup.add(bar)
      }
      // Side supports
      for (const side of [-1, 1]) {
        const support = new THREE.Mesh(
          new THREE.BoxGeometry(0.025, escH + spacing, 0.015),
          legMat
        )
        support.position.set(0, escH / 2 + spacing / 2, side * (W / 2 - 0.06))
        escGroup.add(support)
      }
      escGroup.position.set(-L / 2 - 0.04, 0, 0)
      group.add(escGroup)
    }

    // ── Dimension lines (simple approach with line + text sprites) ──
    addDimensionLine(group, 'largo', L, W, H)
    addDimensionLine(group, 'ancho', L, W, H)
    addDimensionLine(group, 'alto', L, W, H)

  }, [])

  /* ── Dimension text sprites ──────────────────── */
  function addDimensionLine(group: THREE.Group, axis: 'largo' | 'ancho' | 'alto', L: number, W: number, H: number) {
    const lineMat = new THREE.LineBasicMaterial({ color: 0x5599cc, transparent: true, opacity: 0.6 })

    if (axis === 'largo') {
      const y = -0.06
      const z = W / 2 + 0.15
      const pts = [new THREE.Vector3(-L / 2, y, z), new THREE.Vector3(L / 2, y, z)]
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat)
      group.add(line)
      // End ticks
      for (const x of [-L / 2, L / 2]) {
        const tick = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, y, z - 0.02), new THREE.Vector3(x, y, z + 0.02)]),
          lineMat
        )
        group.add(tick)
      }
      group.add(makeTextSprite(`${(L * 100).toFixed(0)}cm`, new THREE.Vector3(0, y - 0.04, z)))
    }

    if (axis === 'ancho') {
      const y = -0.06
      const x = L / 2 + 0.15
      const pts = [new THREE.Vector3(x, y, -W / 2), new THREE.Vector3(x, y, W / 2)]
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat)
      group.add(line)
      for (const z of [-W / 2, W / 2]) {
        const tick = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x - 0.02, y, z), new THREE.Vector3(x + 0.02, y, z)]),
          lineMat
        )
        group.add(tick)
      }
      group.add(makeTextSprite(`${(W * 100).toFixed(0)}cm`, new THREE.Vector3(x + 0.04, y, 0)))
    }

    if (axis === 'alto') {
      const x = -L / 2 - 0.15
      const z = W / 2 + 0.05
      const pts = [new THREE.Vector3(x, 0, z), new THREE.Vector3(x, H + 0.01, z)]
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat)
      group.add(line)
      for (const y of [0, H + 0.01]) {
        const tick = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x - 0.02, y, z), new THREE.Vector3(x + 0.02, y, z)]),
          lineMat
        )
        group.add(tick)
      }
      group.add(makeTextSprite(`${(H * 100).toFixed(0)}cm`, new THREE.Vector3(x - 0.06, H / 2, z)))
    }
  }

  function makeTextSprite(text: string, position: THREE.Vector3): THREE.Sprite {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    canvas.width = 128
    canvas.height = 48
    ctx.fillStyle = 'rgba(0,0,0,0)'
    ctx.fillRect(0, 0, 128, 48)
    ctx.font = 'bold 28px sans-serif'
    ctx.fillStyle = '#88bbdd'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, 64, 24)

    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.LinearFilter
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false })
    const sprite = new THREE.Sprite(spriteMat)
    sprite.position.copy(position)
    sprite.scale.set(0.2, 0.075, 1)
    return sprite
  }

  /* ── Camera presets ──────────────────────────── */
  function resetCamera() {
    if (!cameraRef.current || !controlsRef.current) return
    const cam = cameraRef.current
    const ctrl = controlsRef.current
    cam.position.set(2, 1.5, 2)
    ctrl.target.set(0, config.alto * 0.45, 0)
    ctrl.update()
    needsRenderRef.current = true
  }

  function topView() {
    if (!cameraRef.current || !controlsRef.current) return
    cameraRef.current.position.set(0, 3, 0.01)
    controlsRef.current.target.set(0, 0, 0)
    controlsRef.current.update()
    needsRenderRef.current = true
  }

  function frontView() {
    if (!cameraRef.current || !controlsRef.current) return
    cameraRef.current.position.set(0, config.alto * 0.5, 3)
    controlsRef.current.target.set(0, config.alto * 0.5, 0)
    controlsRef.current.update()
    needsRenderRef.current = true
  }

  /* ── Init scene ──────────────────────────────── */
  useEffect(() => {
    if (!webglSupported || !containerRef.current) return

    const container = containerRef.current
    const w = container.clientWidth
    const h = container.clientHeight

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0f1520)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(40, w / h, 0.01, 50)
    camera.position.set(2, 1.5, 2)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, config.alto * 0.45, 0)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.minDistance = 0.5
    controls.maxDistance = 8
    controls.maxPolarAngle = Math.PI / 2 + 0.1
    controls.addEventListener('change', () => { needsRenderRef.current = true })
    controls.update()
    controlsRef.current = controls

    // Lighting
    const ambient = new THREE.AmbientLight(0x404040, 0.6)
    scene.add(ambient)

    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4)
    scene.add(hemi)

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
    dirLight.position.set(3, 5, 3)
    dirLight.castShadow = true
    dirLight.shadow.mapSize.set(1024, 1024)
    dirLight.shadow.camera.near = 0.1
    dirLight.shadow.camera.far = 20
    dirLight.shadow.camera.left = -3
    dirLight.shadow.camera.right = 3
    dirLight.shadow.camera.top = 3
    dirLight.shadow.camera.bottom = -3
    scene.add(dirLight)

    // Secondary fill light
    const fillLight = new THREE.DirectionalLight(0x8899bb, 0.3)
    fillLight.position.set(-2, 3, -2)
    scene.add(fillLight)

    // Floor
    const floorGeo = new THREE.PlaneGeometry(6, 6)
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x141a24, metalness: 0, roughness: 0.9 })
    const floor = new THREE.Mesh(floorGeo, floorMat)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -0.001
    floor.receiveShadow = true
    scene.add(floor)

    // Grid
    const grid = new THREE.GridHelper(4, 20, 0x1e2a3a, 0x171f2e)
    grid.position.y = 0.001
    scene.add(grid)

    // Mesa group
    const mesaGroup = new THREE.Group()
    scene.add(mesaGroup)
    meshGroupRef.current = mesaGroup

    // Build initial
    buildMesa(config, mesaGroup)

    // Animation loop (render on demand + damping)
    let lastTime = 0
    const FPS_INTERVAL = 1000 / 30
    function animate(time: number) {
      rafRef.current = requestAnimationFrame(animate)
      const delta = time - lastTime
      if (delta < FPS_INTERVAL) return
      lastTime = time - (delta % FPS_INTERVAL)

      controls.update()
      if (needsRenderRef.current) {
        renderer.render(scene, camera)
        needsRenderRef.current = false
      }
    }
    rafRef.current = requestAnimationFrame(animate)
    needsRenderRef.current = true

    // Resize observer
    const ro = new ResizeObserver(() => {
      const w2 = container.clientWidth
      const h2 = container.clientHeight
      if (w2 > 0 && h2 > 0) {
        camera.aspect = w2 / h2
        camera.updateProjectionMatrix()
        renderer.setSize(w2, h2)
        needsRenderRef.current = true
      }
    })
    ro.observe(container)

    return () => {
      ro.disconnect()
      cancelAnimationFrame(rafRef.current)
      controls.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [webglSupported]) // Only run once on mount

  /* ── Update mesa when config changes ────────── */
  useEffect(() => {
    if (!meshGroupRef.current) return
    buildMesa(config, meshGroupRef.current)

    // Update controls target to center of mesa
    if (controlsRef.current) {
      controlsRef.current.target.set(0, config.alto * 0.45, 0)
      controlsRef.current.update()
    }
    needsRenderRef.current = true
  }, [config, buildMesa])

  if (!webglSupported) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0f1520] rounded-xl text-[#64748b] text-sm">
        WebGL no disponible en este navegador
      </div>
    )
  }

  // Material label
  const matLabel = `${config.tipo_acero === '304' ? '304' : '430'} ${config.acabado.charAt(0).toUpperCase() + config.acabado.slice(1)}`
  const calLabel = config.calibre.replace('cal_', 'Cal ')

  // Active accessories
  const accessories: string[] = []
  if (config.entrepaños > 0) accessories.push(`${config.entrepaños} entrepaño${config.entrepaños > 1 ? 's' : ''}`)
  if (config.salp_long > 0) accessories.push('Salpicadero')
  if (config.babero) accessories.push('Babero')
  if (config.pozuelos_rect > 0) accessories.push(`${config.pozuelos_rect} pozuelo${config.pozuelos_rect > 1 ? 's' : ''}`)
  if (config.escabiladero) accessories.push('Escabiladero')
  if (config.ruedas) accessories.push('Ruedas')

  return (
    <div className="relative rounded-xl overflow-hidden bg-[#0f1520]" style={{ height: '100%', minHeight: 400 }}>
      <div ref={containerRef} className="w-full h-full" />

      {/* Info badge top-left */}
      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
        <span className="px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-[11px] font-semibold text-white/80">
          {matLabel} — {calLabel}
        </span>
        {accessories.map(a => (
          <span key={a} className="px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-sm text-[10px] text-white/60">
            {a}
          </span>
        ))}
      </div>

      {/* Camera controls top-right */}
      <div className="absolute top-3 right-3 flex gap-1.5">
        <button onClick={resetCamera} className="p-2 rounded-lg bg-black/50 backdrop-blur-sm text-white/70 hover:text-white hover:bg-black/70 transition-colors" title="Vista isométrica">
          <RotateCcw size={14} />
        </button>
        <button onClick={topView} className="p-2 rounded-lg bg-black/50 backdrop-blur-sm text-white/70 hover:text-white hover:bg-black/70 transition-colors" title="Vista superior">
          <ArrowUp size={14} />
        </button>
        <button onClick={frontView} className="p-2 rounded-lg bg-black/50 backdrop-blur-sm text-white/70 hover:text-white hover:bg-black/70 transition-colors" title="Vista frontal">
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Dimensions badge bottom-left */}
      <div className="absolute bottom-3 left-3">
        <span className="px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-[11px] font-mono text-[#88bbdd]">
          {(config.largo * 100).toFixed(0)} × {(config.ancho * 100).toFixed(0)} × {(config.alto * 100).toFixed(0)} cm
        </span>
      </div>

      {/* Interaction hint bottom-right */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-[10px] text-white/30">
        <Eye size={12} /> Arrastra para rotar · Scroll para zoom
      </div>
    </div>
  )
}
