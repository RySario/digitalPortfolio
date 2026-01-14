/**
 * Engine
 * Core 3D rendering engine for the Cyberpunk Building Portfolio
 */

import * as THREE from 'three'
import { Config } from './Config.js'
import { AssetLoader } from './AssetLoader.js'
import { OrbitCameraControls } from '../controls/OrbitCameraControls.js'
import { CyberpunkBuilding } from '../building/CyberpunkBuilding.js'
import { NeonElements } from '../building/NeonElements.js'
import { BillboardSystem } from '../building/BillboardSystem.js'
import { SceneElements } from '../scene/SceneElements.js'
import { FloorText } from '../scene/FloorText.js'
import { StreetSigns } from '../scene/StreetSigns.js'
import { MainBillboardUI } from '../ui/MainBillboardUI.js'

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
    this.controls = null
    this.building = null
    this.neonElements = null
    this.billboardSystem = null
    this.sceneElements = null
    this.floorText = null
    this.streetSigns = null
    this.mainBillboardUI = null

    // Raycaster for billboard interaction
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()

    // Don't call init here - it's async now
  }

  async init() {
    console.log('Initializing Cyberpunk Portfolio...')

    // Setup scene
    this.setupScene()

    // Setup camera
    this.setupCamera()

    // Setup renderer
    this.setupRenderer()

    // Setup lighting
    this.setupLights()

    // Load assets (if any)
    this.assetLoader = new AssetLoader()
    await this.assetLoader.loadAll()
    console.log('Assets loaded')

    // Create building
    this.building = new CyberpunkBuilding()
    this.scene.add(this.building.getGroup())
    console.log('Building created')

    // Create neon elements
    this.neonElements = new NeonElements()
    this.scene.add(this.neonElements.getGroup())
    console.log('Neon elements created')

    // Create billboard system
    this.billboardSystem = new BillboardSystem()
    this.scene.add(this.billboardSystem.getGroup())
    console.log('Billboard system created')

    // Create scene elements (car, arcade, etc.)
    this.sceneElements = new SceneElements()
    this.scene.add(this.sceneElements.getGroup())
    console.log('Scene elements created')

    // Create floor text (Ryan Sario)
    this.floorText = new FloorText()
    this.scene.add(this.floorText.getGroup())
    console.log('Floor text created')

    // Create street signs (attached to street lamp)
    this.streetSigns = new StreetSigns(this.sceneElements.getStreetLightGroup())
    console.log('Street signs created')

    // Setup camera controls
    this.controls = new OrbitCameraControls(this.camera, this.renderer.domElement)
    this.controls.setInitialPosition()
    console.log('Camera controls initialized')

    // Create main billboard UI
    this.mainBillboardUI = new MainBillboardUI(() => {
      // Callback when UI is closed
      this.controls.returnToOrbit()
    })
    console.log('Billboard UI created')

    // Add event listeners
    this.addEventListeners()

    // Hide loading screen
    this.hideLoadingScreen()

    // Start render loop
    this.start()

    console.log('Cyberpunk Portfolio initialized successfully!')
  }

  setupScene() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(Config.scene.backgroundColor)

    // Optional fog (disabled by default in cyberpunk mode)
    if (Config.scene.fogEnabled) {
      this.scene.fog = new THREE.FogExp2(Config.scene.backgroundColor, 0.001)
    }
  }

  setupCamera() {
    const aspect = window.innerWidth / window.innerHeight
    this.camera = new THREE.PerspectiveCamera(
      Config.camera.fov,
      aspect,
      Config.camera.near,
      Config.camera.far
    )

    const startPos = Config.camera.startPosition
    this.camera.position.set(startPos.x, startPos.y, startPos.z)

    const lookAt = Config.camera.lookAt
    this.camera.lookAt(lookAt.x, lookAt.y, lookAt.z)
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false
    })

    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.2

    this.container.appendChild(this.renderer.domElement)

    // Set cursor style
    this.renderer.domElement.style.cursor = 'grab'
  }

  setupLights() {
    // Ambient light (very low for cyberpunk atmosphere)
    const ambientConfig = Config.lighting.ambient
    const ambientLight = new THREE.AmbientLight(
      ambientConfig.color,
      ambientConfig.intensity
    )
    this.scene.add(ambientLight)

    // Neon point lights
    Config.lighting.neonLights.forEach(lightConfig => {
      const light = new THREE.PointLight(
        lightConfig.color,
        lightConfig.intensity,
        lightConfig.distance,
        lightConfig.decay
      )
      light.position.set(
        lightConfig.position.x,
        lightConfig.position.y,
        lightConfig.position.z
      )
      light.castShadow = true
      light.shadow.mapSize.width = 1024
      light.shadow.mapSize.height = 1024
      this.scene.add(light)
    })

    // Fill light to prevent pure black
    const fillConfig = Config.lighting.fillLight
    const fillLight = new THREE.HemisphereLight(
      fillConfig.color,
      0x000000,
      fillConfig.intensity
    )
    this.scene.add(fillLight)

    // Add spotlights
    if (Config.lighting.spotlights) {
      Config.lighting.spotlights.forEach(spotConfig => {
        const spotlight = new THREE.SpotLight(
          spotConfig.color,
          spotConfig.intensity,
          spotConfig.distance,
          spotConfig.angle,
          spotConfig.penumbra,
          spotConfig.decay
        )
        spotlight.position.set(
          spotConfig.position.x,
          spotConfig.position.y,
          spotConfig.position.z
        )
        spotlight.target.position.set(
          spotConfig.target.x,
          spotConfig.target.y,
          spotConfig.target.z
        )
        spotlight.castShadow = true
        spotlight.shadow.mapSize.width = 1024
        spotlight.shadow.mapSize.height = 1024
        this.scene.add(spotlight)
        this.scene.add(spotlight.target)
      })
    }
  }

  addEventListeners() {
    // Window resize
    window.addEventListener('resize', () => this.onWindowResize())

    // Mouse click for billboard interaction
    this.renderer.domElement.addEventListener('click', (event) => this.onMouseClick(event))
  }

  onWindowResize() {
    const width = window.innerWidth
    const height = window.innerHeight

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(width, height)
  }

  onMouseClick(event) {
    // Don't raycast if UI is open
    if (this.mainBillboardUI && this.mainBillboardUI.isVisible) {
      return
    }

    // Calculate mouse position in normalized device coordinates
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

    // Update raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera)

    // Check for intersection with street signs first
    if (this.streetSigns) {
      const interactiveSigns = this.streetSigns.getInteractiveSigns()
      const signIntersects = this.raycaster.intersectObjects(interactiveSigns, true)

      if (signIntersects.length > 0) {
        // Find the sign group
        let signObject = signIntersects[0].object
        while (signObject.parent && !signObject.userData.action) {
          signObject = signObject.parent
        }

        if (signObject.userData.action === 'openMainBillboard') {
          console.log('Street sign clicked!')
          this.onMainBillboardClick()
          return
        }
      }
    }

    // Check for intersection with main billboard
    const mainBillboard = this.billboardSystem.getMainBillboard()
    if (!mainBillboard) return

    const intersects = this.raycaster.intersectObjects([mainBillboard], true)

    if (intersects.length > 0) {
      // Check if camera is facing the front of the billboard
      const billboardNormal = new THREE.Vector3(0, 0, 1)  // Billboard faces +Z
      billboardNormal.applyQuaternion(mainBillboard.quaternion)  // Apply billboard rotation

      const cameraDirection = new THREE.Vector3()
      this.camera.getWorldDirection(cameraDirection)

      // Check if we're looking at the front (dot product should be negative when facing front)
      const dotProduct = cameraDirection.dot(billboardNormal)

      if (dotProduct < 0) {
        console.log('Main billboard clicked from front!')
        this.onMainBillboardClick()
      } else {
        console.log('Billboard clicked from back - ignoring')
      }
    }
  }

  onMainBillboardClick() {
    // Focus camera on billboard and show UI
    this.controls.focusOnBillboard(() => {
      // Once camera animation is complete, show the UI
      this.mainBillboardUI.show()
    })
  }

  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen')
    if (loadingScreen) {
      loadingScreen.style.opacity = '0'
      setTimeout(() => {
        loadingScreen.style.display = 'none'
      }, 500)
    }
  }

  start() {
    if (this.isRunning) return

    this.isRunning = true
    this.animate()
  }

  stop() {
    this.isRunning = false
  }

  animate() {
    if (!this.isRunning) return

    requestAnimationFrame(() => this.animate())

    const deltaTime = this.clock.getDelta()

    // Update controls
    if (this.controls) {
      this.controls.update(deltaTime)
    }

    // Update steam animation
    if (this.building) {
      this.building.updateSteam(deltaTime)
    }

    // Render scene
    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    this.stop()

    // Dispose of systems
    if (this.controls) this.controls.dispose()
    if (this.neonElements) this.neonElements.dispose()
    if (this.billboardSystem) this.billboardSystem.dispose()
    if (this.mainBillboardUI) this.mainBillboardUI.dispose()

    // Dispose of Three.js resources
    this.scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose()
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose())
        } else {
          object.material.dispose()
        }
      }
    })

    this.renderer.dispose()
  }
}

export { Engine }
export default Engine
