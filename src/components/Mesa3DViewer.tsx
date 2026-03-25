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
    // If wheels, compensate height (wheel adds ~0.06m)
    const wheelH = cfg.ruedas ? 0.06 : 0
    const legH = H - 0.02 - wheelH
    const offset = 0.05

    // Auto-compute number of legs based on length
    const numPatas = cfg.patas >= 8 ? 8 : cfg.patas >= 6 ? 6 : cfg.largo > 3 ? 8 : cfg.largo > 2 ? 6 : 4
    const legPositions: [number, number][] = [
      [-L / 2 + offset, -W / 2 + offset],
      [-L / 2 + offset,  W / 2 - offset],
      [ L / 2 - offset, -W / 2 + offset],
      [ L / 2 - offset,  W / 2 - offset],
    ]
    if (numPatas >= 6) {
      legPositions.push([0, -W / 2 + offset], [0, W / 2 - offset])
    }
    if (numPatas >= 8) {
      legPositions.push([-L / 3, -W / 2 + offset], [-L / 3, W / 2 - offset])
      // Reposition middle pair
      legPositions[4] = [L / 3, -W / 2 + offset]
      legPositions[5] = [L / 3, W / 2 - offset]
    }

    for (const [x, z] of legPositions) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(legW, legH, legW), legMat)
      leg.position.set(x, wheelH + legH / 2, z)
      leg.castShadow = true
      group.add(leg)

      if (cfg.ruedas) {
        // Wheel assembly
        const wheelGroup = new THREE.Group()
        // Plate
        const plate = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.003, 0.05), darkMat)
        plate.position.y = wheelH
        wheelGroup.add(plate)
        // Axle
        const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.04, 8), darkMat)
        axle.position.y = wheelH / 2
        wheelGroup.add(axle)
        // Wheel
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.015, 16), darkMat)
        wheel.rotation.z = Math.PI / 2
        wheel.position.y = 0.03
        wheelGroup.add(wheel)
        // Brake
        const brake = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.02, 0.008), darkMat)
        brake.position.set(0.025, 0.03, 0)
        wheelGroup.add(brake)
        wheelGroup.position.set(x, 0, z)
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

    // ── Babero (frontal) ──
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

    // ── Baberos laterales (costados) ──
    if (cfg.babero_costados > 0 && cfg.alto_babero > 0) {
      const babH = cfg.alto_babero
      const babMat = new THREE.MeshStandardMaterial({ ...preset, roughness: preset.roughness * 0.7 })
      // Left side always if babero_costados >= 1
      const sides = cfg.babero_costados >= 2 ? [-1, 1] : [-1]
      for (const side of sides) {
        const babLat = new THREE.Mesh(
          new THREE.BoxGeometry(0.015, babH, W),
          babMat
        )
        babLat.position.set(side * (L / 2 - 0.0075), H - babH / 2, 0)
        babLat.castShadow = true
        group.add(babLat)
      }
    }

    // ── Pozuelos rectangular ──
    if (cfg.pozuelos_rect > 0 && cfg.pozuelo_dims.length > 0) {
      const poz = cfg.pozuelo_dims[0]
      const pL = poz.largo || 0.5, pW = poz.ancho || 0.4, pD = poz.alto || 0.3
      const pozX = L / 2 - pL / 2 - 0.1

      // Cavity box (dark, sunken into mesón)
      const cavity = new THREE.Mesh(
        new THREE.BoxGeometry(pL, pD, pW),
        pozMat
      )
      cavity.position.set(pozX, H - pD / 2, 0)
      group.add(cavity)

      // Rim borders
      const rimMat = steelMat.clone()
      const rimThick = 0.008
      for (const side of [-1, 1]) {
        const rim = new THREE.Mesh(new THREE.BoxGeometry(pL + rimThick * 2, 0.025, rimThick), rimMat)
        rim.position.set(pozX, H + 0.003, side * (pW / 2))
        group.add(rim)
      }
      for (const side of [-1, 1]) {
        const rim = new THREE.Mesh(new THREE.BoxGeometry(rimThick, 0.025, pW + rimThick * 2), rimMat)
        rim.position.set(pozX + side * (pL / 2), H + 0.003, 0)
        group.add(rim)
      }

      // Drain
      const drain = new THREE.Mesh(new THREE.CircleGeometry(0.018, 16), darkMat)
      drain.rotation.x = -Math.PI / 2
      drain.position.set(pozX, H - pD + 0.002, 0)
      group.add(drain)

      // Faucet
      const faucetGroup = new THREE.Group()
      const fBase = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.02, 16), chromeMat)
      fBase.position.y = H + 0.01
      faucetGroup.add(fBase)
      const fTube = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.14, 8), chromeMat)
      fTube.position.y = H + 0.09
      faucetGroup.add(fTube)
      const fArm = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.08, 8), chromeMat)
      fArm.rotation.z = Math.PI / 2
      fArm.position.set(-0.04, H + 0.16, 0)
      faucetGroup.add(fArm)
      const fSpout = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.035, 8), chromeMat)
      fSpout.position.set(-0.08, H + 0.143, 0)
      faucetGroup.add(fSpout)
      const fHandle = new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 12), chromeMat)
      fHandle.position.set(0.02, H + 0.16, 0)
      faucetGroup.add(fHandle)
      faucetGroup.position.set(pozX - pL / 2 - 0.04, 0, -pW / 2 - 0.04)
      group.add(faucetGroup)
    }

    // ── Pozuelo redondo (370mm) ──
    if (cfg.pozuelos_redondos > 0) {
      const radius = 0.185
      const depth = cfg.pozuelo_dims[0]?.alto || 0.3
      // Position to the left of the rectangular pozuelo
      const pozRectL = cfg.pozuelos_rect > 0 && cfg.pozuelo_dims.length > 0 ? cfg.pozuelo_dims[0].largo || 0.5 : 0
      const offsetX = cfg.pozuelos_rect > 0 ? L / 2 - pozRectL - 0.1 - radius - 0.08 : L / 2 - radius - 0.1

      const roundCavity = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, depth, 24),
        pozMat
      )
      roundCavity.position.set(offsetX, H - depth / 2, 0)
      group.add(roundCavity)

      // Rim ring
      const rimRing = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.008, 8, 24),
        steelMat.clone()
      )
      rimRing.rotation.x = Math.PI / 2
      rimRing.position.set(offsetX, H + 0.005, 0)
      group.add(rimRing)

      // Drain
      const drain = new THREE.Mesh(new THREE.CircleGeometry(0.015, 12), darkMat)
      drain.rotation.x = -Math.PI / 2
      drain.position.set(offsetX, H - depth + 0.002, 0)
      group.add(drain)
    }

    // ── Vertedero ──
    if (cfg.vertederos > 0) {
      const vertDiam = cfg.diam_vertedero > 0 ? cfg.diam_vertedero : 0.076 // 3" default
      const vertDepth = cfg.prof_vertedero > 0 ? cfg.prof_vertedero : 0.2
      // Position near pozuelo, below the mesón
      const vertX = cfg.pozuelos_rect > 0 ? L / 2 - 0.1 - (cfg.pozuelo_dims[0]?.largo || 0.5) / 2 : L / 2 - 0.2
      for (let i = 0; i < cfg.vertederos; i++) {
        const tube = new THREE.Mesh(
          new THREE.CylinderGeometry(vertDiam / 2, vertDiam / 2, vertDepth, 16),
          chromeMat
        )
        tube.position.set(vertX + i * 0.15, H - 0.02 - vertDepth / 2, W / 2 - 0.06)
        group.add(tube)

        // Opening ring at top
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(vertDiam / 2, 0.004, 8, 16),
          chromeMat
        )
        ring.rotation.x = Math.PI / 2
        ring.position.set(vertX + i * 0.15, H - 0.02, W / 2 - 0.06)
        group.add(ring)
      }
    }

    // ── Escabiladero (angle bars welded to patas) ──
    if (cfg.escabiladero) {
      const barCount = 5
      const barSpacing = 0.08
      const startY = H * 0.15
      const leftPataX = -L / 2 + offset

      for (let i = 0; i < barCount; i++) {
        const barY = startY + i * barSpacing
        // Horizontal bar between front and back patas on left side
        const bar = new THREE.Mesh(
          new THREE.BoxGeometry(legW, 0.003, W - offset * 2),
          steelMat.clone()
        )
        bar.position.set(leftPataX, barY, 0)
        bar.castShadow = true
        group.add(bar)

        // Small L-angle profile (visual detail)
        const angleL = new THREE.Mesh(
          new THREE.BoxGeometry(legW, 0.015, 0.003),
          steelMat.clone()
        )
        angleL.position.set(leftPataX, barY + 0.009, 0)
        group.add(angleL)
      }
    }

    // ── Dimension lines ──
    addDimensionLine(group, 'largo', L, W, H)
    addDimensionLine(group, 'ancho', L, W, H)
    addDimensionLine(group, 'alto', L, W, H)

  }, [])

  /* ── Dimension text sprites ──────────────────── */
  function addDimensionLine(group: THREE.Group, axis: 'largo' | 'ancho' | 'alto', L: number, W: number, H: number) {
    const lineMat = new THREE.LineBasicMaterial({ color: 0x5599cc, transparent: true, opacity: 0.6 })
    const arrowSize = 0.015

    if (axis === 'largo') {
      const y = -0.06
      const z = W / 2 + 0.15
      // Main line from corner to corner
      const pts = [new THREE.Vector3(-L / 2, y, z), new THREE.Vector3(L / 2, y, z)]
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat))
      // End ticks (vertical)
      for (const x of [-L / 2, L / 2]) {
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x, y - 0.03, z), new THREE.Vector3(x, y + 0.03, z)
        ]), lineMat))
      }
      // Extension lines from mesa corners down to dimension line
      for (const x of [-L / 2, L / 2]) {
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x, 0, W / 2), new THREE.Vector3(x, y, z)
        ]), new THREE.LineBasicMaterial({ color: 0x5599cc, transparent: true, opacity: 0.2 })))
      }
      // Arrows
      for (const dir of [-1, 1]) {
        const tipX = dir * L / 2
        const arrowPts = [
          new THREE.Vector3(tipX, y, z),
          new THREE.Vector3(tipX - dir * arrowSize * 2, y + arrowSize, z),
          new THREE.Vector3(tipX - dir * arrowSize * 2, y - arrowSize, z),
          new THREE.Vector3(tipX, y, z),
        ]
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(arrowPts), lineMat))
      }
      group.add(makeTextSprite(`${(L * 100).toFixed(0)}cm`, new THREE.Vector3(0, y - 0.04, z)))
    }

    if (axis === 'ancho') {
      const y = -0.06
      const x = L / 2 + 0.15
      const pts = [new THREE.Vector3(x, y, -W / 2), new THREE.Vector3(x, y, W / 2)]
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat))
      for (const z of [-W / 2, W / 2]) {
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x, y, z - 0.03), new THREE.Vector3(x, y, z + 0.03)
        ]), lineMat))
      }
      // Extension lines
      for (const z of [-W / 2, W / 2]) {
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(L / 2, 0, z), new THREE.Vector3(x, y, z)
        ]), new THREE.LineBasicMaterial({ color: 0x5599cc, transparent: true, opacity: 0.2 })))
      }
      // Arrows
      for (const dir of [-1, 1]) {
        const tipZ = dir * W / 2
        const arrowPts = [
          new THREE.Vector3(x, y, tipZ),
          new THREE.Vector3(x, y, tipZ - dir * arrowSize * 2),
          new THREE.Vector3(x, y + arrowSize, tipZ - dir * arrowSize * 1),
          new THREE.Vector3(x, y, tipZ),
        ]
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(arrowPts), lineMat))
      }
      group.add(makeTextSprite(`${(W * 100).toFixed(0)}cm`, new THREE.Vector3(x + 0.04, y, 0)))
    }

    if (axis === 'alto') {
      const x = -L / 2 - 0.15
      const z = W / 2 + 0.05
      const pts = [new THREE.Vector3(x, 0, z), new THREE.Vector3(x, H + 0.01, z)]
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat))
      for (const y of [0, H + 0.01]) {
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x - 0.03, y, z), new THREE.Vector3(x + 0.03, y, z)
        ]), lineMat))
      }
      // Extension lines
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-L / 2, 0, W / 2), new THREE.Vector3(x, 0, z)
      ]), new THREE.LineBasicMaterial({ color: 0x5599cc, transparent: true, opacity: 0.2 })))
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-L / 2, H, W / 2), new THREE.Vector3(x, H + 0.01, z)
      ]), new THREE.LineBasicMaterial({ color: 0x5599cc, transparent: true, opacity: 0.2 })))
      // Arrows
      for (const dir of [0, 1]) {
        const tipY = dir === 0 ? 0 : H + 0.01
        const sign = dir === 0 ? 1 : -1
        const arrowPts = [
          new THREE.Vector3(x, tipY, z),
          new THREE.Vector3(x - arrowSize, tipY + sign * arrowSize * 2, z),
          new THREE.Vector3(x + arrowSize, tipY + sign * arrowSize * 2, z),
          new THREE.Vector3(x, tipY, z),
        ]
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(arrowPts), lineMat))
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

    // Scene — light background to match app
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xe8edf2)
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
    renderer.toneMappingExposure = 1.4
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

    // Lighting — brighter for light background
    const ambient = new THREE.AmbientLight(0x606060, 0.8)
    scene.add(ambient)

    const hemi = new THREE.HemisphereLight(0xffffff, 0x888888, 0.5)
    scene.add(hemi)

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0)
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
    const fillLight = new THREE.DirectionalLight(0x8899bb, 0.4)
    fillLight.position.set(-2, 3, -2)
    scene.add(fillLight)

    // Floor — light
    const floorGeo = new THREE.PlaneGeometry(6, 6)
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xd0d4da, metalness: 0, roughness: 0.9 })
    const floor = new THREE.Mesh(floorGeo, floorMat)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -0.001
    floor.receiveShadow = true
    scene.add(floor)

    // Grid
    const grid = new THREE.GridHelper(4, 20, 0xbcc4cc, 0xc8d0d8)
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
      <div className="flex items-center justify-center h-full bg-[#e8edf2] rounded-xl text-[#64748b] text-sm">
        WebGL no disponible en este navegador
      </div>
    )
  }

  // Material label
  const matLabel = `${config.tipo_acero === '304' ? '304' : '430'} ${config.acabado.charAt(0).toUpperCase() + config.acabado.slice(1)}`
  const calLabel = config.calibre.replace('cal_', 'Cal ')

  // Suggested patas
  const suggestedPatas = config.largo > 3 ? 8 : config.largo > 2 ? 6 : 4
  const patasLabel = config.patas !== suggestedPatas && suggestedPatas > 4
    ? `${Math.max(config.patas, suggestedPatas)} patas`
    : config.patas > 4 ? `${config.patas} patas` : ''

  // Active accessories
  const accessories: string[] = []
  if (config.entrepaños > 0) accessories.push(`${config.entrepaños} entrepaño${config.entrepaños > 1 ? 's' : ''}`)
  if (config.salp_long > 0) accessories.push('Salpicadero')
  if (config.babero) accessories.push('Babero')
  if (config.babero_costados > 0) accessories.push(`Babero lat. ×${config.babero_costados}`)
  if (config.pozuelos_rect > 0) accessories.push(`${config.pozuelos_rect} pozuelo${config.pozuelos_rect > 1 ? 's' : ''}`)
  if (config.pozuelos_redondos > 0) accessories.push(`Poz. redondo`)
  if (config.vertederos > 0) accessories.push(`${config.vertederos} vertedero${config.vertederos > 1 ? 's' : ''}`)
  if (config.escabiladero) accessories.push('Escabiladero')
  if (config.ruedas) accessories.push('Ruedas')
  if (patasLabel) accessories.push(patasLabel)

  return (
    <div className="relative rounded-xl overflow-hidden bg-[#e8edf2] border border-[#d0d4da]" style={{ height: '100%', minHeight: 400 }}>
      <div ref={containerRef} className="w-full h-full" />

      {/* Info badge top-left */}
      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
        <span className="px-2.5 py-1 rounded-lg bg-white/80 backdrop-blur-sm text-[11px] font-semibold text-[#334155] shadow-sm border border-[#e2e8f0]">
          {matLabel} — {calLabel}
        </span>
        {accessories.map(a => (
          <span key={a} className="px-2 py-0.5 rounded-md bg-white/60 backdrop-blur-sm text-[10px] text-[#64748b] shadow-sm border border-[#e2e8f0]">
            {a}
          </span>
        ))}
      </div>

      {/* Auto-patas suggestion */}
      {suggestedPatas > config.patas && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-amber-50/90 border border-amber-200 text-[11px] text-amber-700 font-medium shadow-sm backdrop-blur-sm">
          Sugerido: {suggestedPatas} patas (largo {'>'} {suggestedPatas === 8 ? '3' : '2'}m)
        </div>
      )}

      {/* Camera controls top-right */}
      <div className="absolute top-3 right-3 flex gap-1.5">
        <button onClick={resetCamera} className="p-2 rounded-lg bg-white/80 backdrop-blur-sm text-[#64748b] hover:text-[#1e293b] hover:bg-white transition-colors shadow-sm border border-[#e2e8f0]" title="Vista isométrica">
          <RotateCcw size={14} />
        </button>
        <button onClick={topView} className="p-2 rounded-lg bg-white/80 backdrop-blur-sm text-[#64748b] hover:text-[#1e293b] hover:bg-white transition-colors shadow-sm border border-[#e2e8f0]" title="Vista superior">
          <ArrowUp size={14} />
        </button>
        <button onClick={frontView} className="p-2 rounded-lg bg-white/80 backdrop-blur-sm text-[#64748b] hover:text-[#1e293b] hover:bg-white transition-colors shadow-sm border border-[#e2e8f0]" title="Vista frontal">
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Dimensions badge bottom-left */}
      <div className="absolute bottom-3 left-3">
        <span className="px-2.5 py-1 rounded-lg bg-white/80 backdrop-blur-sm text-[11px] font-mono text-[#3b82f6] shadow-sm border border-[#e2e8f0]">
          {(config.largo * 100).toFixed(0)} × {(config.ancho * 100).toFixed(0)} × {(config.alto * 100).toFixed(0)} cm
        </span>
      </div>

      {/* Interaction hint bottom-right */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-[10px] text-[#94a3b8]">
        <Eye size={12} /> Arrastra para rotar · Scroll para zoom
      </div>
    </div>
  )
}
