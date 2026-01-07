import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Config } from './Config.js'
import { AssetLoader } from './AssetLoader.js'
import { WorldManager } from '../world/WorldManager.js'
import { CloudSystem } from '../world/CloudSystem.js'
import { BoidSystem } from '../world/BoidSystem.js'
import { CollisionManager } from '../controls/CollisionManager.js'

class Engine {
  constructor() {
    this.container = document.getElementById('canvas-container')
    this.scene = null
    this.camera = null
    this.renderer = null
    this.clock = new THREE.Clock()
    this.isRunning = false

    // Core systems
    this.assetLoader = null
    this.worldManager = null
    this.cloudSystem = null
    this.collisionManager = null
    this.birdSystem = null

    // Controls
    this.controls = null

    // Don't call init here - it's async now
  }

  async init() {
    console.log('Initializing 3D Portfolio...')

    // Setup scene
    this.setupScene()

    // Setup camera
    this.setupCamera()

    // Setup renderer
    this.setupRenderer()

    // Setup lighting
    this.setupLights()

    // Load assets
    this.assetLoader = new AssetLoader()
    await this.assetLoader.loadAll()
    console.log('Assets loaded')

    // Create collision manager
    this.collisionManager = new CollisionManager(this.scene, this.camera)

    // Create world (islands, ocean, bridges)
    this.worldManager = new WorldManager(this.scene, this.collisionManager)
    await this.worldManager.createWorld()
    console.log('World created')

    // Create cloud system
    this.cloudSystem = new CloudSystem(this.scene)
    console.log('Clouds created')

    // Create bird system (boids)
    this.birdSystem = new BoidSystem(this.scene)
    console.log('Bird flock created')

    // Setup orbit controls
    this.setupOrbitControls()
    console.log('Orbit controls initialized')

    // ADD TEST CUBE to verify rendering
    const testGeometry = new THREE.BoxGeometry(10, 10, 10)
    const testMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 })
    const testCube = new THREE.Mesh(testGeometry, testMaterial)
    testCube.position.set(0, 5, 0)
    this.scene.add(testCube)
    console.log('Test cube added at:', testCube.position)

    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this))

    // Start render loop
    this.isRunning = true
    this.animate()

    console.log('3D Portfolio ready!')
    console.log('Camera position:', this.camera.position)
    console.log('Scene children count:', this.scene.children.length)
  }

  setupScene() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(Config.scene.backgroundColor)
    this.scene.fog = new THREE.FogExp2(Config.scene.fogColor, Config.scene.fogDensity)
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      Config.camera.fov,
      window.innerWidth / window.innerHeight,
      Config.camera.near,
      Config.camera.far
    )
    this.camera.position.set(
      Config.camera.startPosition.x,
      Config.camera.startPosition.y,
      Config.camera.startPosition.z
    )
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.container.appendChild(this.renderer.domElement)

    console.log('Renderer initialized, canvas size:', window.innerWidth, 'x', window.innerHeight)
    console.log('Canvas appended to:', this.container)
  }

  setupLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(
      Config.lighting.ambient.color,
      Config.lighting.ambient.intensity
    )
    this.scene.add(ambientLight)

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(
      Config.lighting.directional.color,
      Config.lighting.directional.intensity
    )
    directionalLight.position.set(
      Config.lighting.directional.position.x,
      Config.lighting.directional.position.y,
      Config.lighting.directional.position.z
    )
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = Config.lighting.directional.shadowMapSize
    directionalLight.shadow.mapSize.height = Config.lighting.directional.shadowMapSize
    directionalLight.shadow.camera.near = 0.5
    directionalLight.shadow.camera.far = 500
    directionalLight.shadow.camera.left = -200
    directionalLight.shadow.camera.right = 200
    directionalLight.shadow.camera.top = 200
    directionalLight.shadow.camera.bottom = -200
    this.scene.add(directionalLight)

    // Hemisphere light (sky/ground ambient)
    const hemisphereLight = new THREE.HemisphereLight(
      Config.lighting.hemisphere.skyColor,
      Config.lighting.hemisphere.groundColor,
      Config.lighting.hemisphere.intensity
    )
    this.scene.add(hemisphereLight)
  }

  setupOrbitControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = Config.orbitControls.enableDamping
    this.controls.dampingFactor = Config.orbitControls.dampingFactor
    this.controls.minDistance = Config.orbitControls.minDistance
    this.controls.maxDistance = Config.orbitControls.maxDistance
    this.controls.maxPolarAngle = Config.orbitControls.maxPolarAngle
    this.controls.minPolarAngle = Config.orbitControls.minPolarAngle

    // Set initial target
    this.controls.target.set(
      Config.camera.lookAt.x,
      Config.camera.lookAt.y,
      Config.camera.lookAt.z
    )
    this.controls.update()
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  animate() {
    if (!this.isRunning) return

    requestAnimationFrame(this.animate.bind(this))

    const delta = Math.min(this.clock.getDelta(), 0.1)

    // Update orbit controls
    if (this.controls) {
      this.controls.update()
    }

    // Update clouds
    if (this.cloudSystem) {
      this.cloudSystem.update(delta)
    }

    // Update birds
    if (this.birdSystem) {
      this.birdSystem.update(delta)
    }

    // Render scene
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera)
    }
  }

  dispose() {
    this.isRunning = false
    window.removeEventListener('resize', this.onWindowResize.bind(this))

    if (this.controls) {
      this.controls.dispose()
    }

    if (this.renderer) {
      this.renderer.dispose()
    }
  }
}

export default Engine
