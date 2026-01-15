/**
 * Billboard System
 * Manages all billboard screens for portfolio display
 * Includes main interactive billboard and portfolio billboards
 */

import * as THREE from 'three'
import { Config } from '../core/Config.js'
import { BillboardContent } from '../config/BillboardContent.js'

export class BillboardSystem {
  constructor() {
    this.group = new THREE.Group()
    this.billboardsConfig = Config.billboards
    this.billboards = []
    this.mainBillboard = null

    // Content cycling
    this.cycleTimers = []
    this.currentIndices = new Map() // Track current content index for each billboard

    this.createMainBillboard()
    // Custom billboards will be created via startContentCycling()
  }

  /**
   * Create main interactive billboard
   */
  createMainBillboard() {
    const config = this.billboardsConfig.main

    const billboard = this.createBillboard(
      config.width,
      config.height,
      config.position,
      config.rotation,
      config.emissiveIntensity,
      0xd946a6, // Pink/magenta color to match building aesthetic
      true, // Interactive
      true  // Skip top/bottom frames for main billboard
    )

    billboard.userData.isMainBillboard = true
    billboard.userData.interactive = config.interactive

    this.mainBillboard = billboard
    this.billboards.push(billboard)
    this.group.add(billboard)
  }

  /**
   * Create custom billboards from configuration
   */
  createCustomBillboards(customBillboards) {
    customBillboards.forEach((config, index) => {
      const billboard = this.createBillboard(
        config.width,
        config.height,
        config.position,
        config.rotation || { x: 0, y: 0, z: 0 },
        config.emissiveIntensity || 0.6,
        config.color || 0xd946a6, // Default pink color
        config.interactive || false,
        config.skipFrame || false
      )

      billboard.userData.customBillboardIndex = index
      billboard.userData.billboardName = config.name || `Custom Billboard ${index}`
      this.billboards.push(billboard)
      this.group.add(billboard)

      console.log(`✅ Created custom billboard: ${billboard.userData.billboardName}`)
    })
  }

  /**
   * Create a single billboard
   */
  createBillboard(width, height, position, rotation, emissiveIntensity, color, interactive, skipTopBottomFrames = false) {
    const group = new THREE.Group()

    // Billboard screen
    const geometry = new THREE.PlaneGeometry(width, height)
    const material = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: emissiveIntensity,
      side: THREE.DoubleSide,
      roughness: 0.4,
      metalness: 0.1
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = false
    mesh.receiveShadow = true
    group.add(mesh)

    // Frame around billboard
    const frameThickness = 0.1
    const frameDepth = 0.2

    // Top frame (skip for main billboard)
    if (!skipTopBottomFrames) {
      const topFrame = new THREE.Mesh(
        new THREE.BoxGeometry(width + frameThickness * 2, frameThickness, frameDepth),
        new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8, metalness: 0.3 })
      )
      topFrame.position.y = height / 2 + frameThickness / 2
      topFrame.position.z = -frameDepth / 2
      group.add(topFrame)

      // Bottom frame (skip for main billboard)
      const bottomFrame = new THREE.Mesh(
        new THREE.BoxGeometry(width + frameThickness * 2, frameThickness, frameDepth),
        new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8, metalness: 0.3 })
      )
      bottomFrame.position.y = -height / 2 - frameThickness / 2
      bottomFrame.position.z = -frameDepth / 2
      group.add(bottomFrame)
    }

    // Left frame
    const leftFrame = new THREE.Mesh(
      new THREE.BoxGeometry(frameThickness, height, frameDepth),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8, metalness: 0.3 })
    )
    leftFrame.position.x = -width / 2 - frameThickness / 2
    leftFrame.position.z = -frameDepth / 2
    group.add(leftFrame)

    // Right frame
    const rightFrame = new THREE.Mesh(
      new THREE.BoxGeometry(frameThickness, height, frameDepth),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8, metalness: 0.3 })
    )
    rightFrame.position.x = width / 2 + frameThickness / 2
    rightFrame.position.z = -frameDepth / 2
    group.add(rightFrame)

    // Add subtle point light for glow
    const light = new THREE.PointLight(color, emissiveIntensity * 1.5, width * 1.5)
    light.position.z = 0.5
    group.add(light)

    // Position and rotate
    group.position.set(position.x, position.y, position.z)
    group.rotation.set(rotation.x, rotation.y, rotation.z)

    // Store references
    group.userData.billboardMesh = mesh
    group.userData.billboardMaterial = material
    group.userData.billboardLight = light

    return group
  }

  /**
   * Load texture onto a billboard
   * @param {number} index - Billboard index (-1 for main billboard, or portfolio index)
   * @param {string} imagePath - Path to image
   */
  loadTexture(index, imagePath) {
    const billboard = index === -1 ? this.mainBillboard : this.billboards[index + 1]
    if (!billboard) return

    const loader = new THREE.TextureLoader()
    loader.load(
      imagePath,
      (texture) => {
        const material = billboard.userData.billboardMaterial
        material.map = texture
        // Set color to white so texture shows in true colors (not tinted)
        material.color.setHex(0xffffff)
        // Reduce emissive to show texture clearly
        material.emissive.setHex(0x000000)
        material.emissiveIntensity = 0.1
        material.needsUpdate = true
      },
      undefined,
      (error) => {
        console.error('Error loading billboard texture:', error)
      }
    )
  }

  /**
   * Load video onto a billboard
   * @param {number} index - Billboard index
   * @param {string} videoPath - Path to video
   */
  loadVideo(index, videoPath) {
    const billboard = this.billboards[index + 1]
    if (!billboard) return

    const video = document.createElement('video')
    video.src = videoPath
    video.loop = true
    video.muted = true
    video.play()

    const texture = new THREE.VideoTexture(video)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter

    const material = billboard.userData.billboardMaterial
    material.map = texture
    // Set color to white so video shows in true colors (not tinted)
    material.color.setHex(0xffffff)
    // Reduce emissive to show video clearly
    material.emissive.setHex(0x000000)
    material.emissiveIntensity = 0.1
    material.needsUpdate = true

    billboard.userData.video = video
  }

  /**
   * Get the main billboard for raycasting
   */
  getMainBillboard() {
    return this.mainBillboard
  }

  /**
   * Get all billboards
   */
  getAllBillboards() {
    return this.billboards
  }

  getGroup() {
    return this.group
  }

  /**
   * Start content cycling from BillboardContent.js config
   * Call this after creating the billboard system
   */
  startContentCycling() {
    console.log('📺 Starting billboard content cycling...')

    // Create custom billboards if any are configured
    if (BillboardContent.customBillboards && BillboardContent.customBillboards.length > 0) {
      console.log(`📺 Creating ${BillboardContent.customBillboards.length} custom billboard(s)...`)
      this.createCustomBillboards(BillboardContent.customBillboards)
    }

    // Load main billboard content
    if (BillboardContent.mainBillboard.enabled) {
      this.startBillboardCycle(-1, BillboardContent.mainBillboard)
    }

    // Load custom billboard content
    if (BillboardContent.customBillboards && BillboardContent.customBillboards.length > 0) {
      BillboardContent.customBillboards.forEach((billboardConfig, index) => {
        if (billboardConfig.content && billboardConfig.content.length > 0) {
          this.startBillboardCycle(index, billboardConfig)
        }
      })
    }
  }

  /**
   * Start cycling content for a specific billboard
   * @param {number} index - Billboard index (-1 for main, 0+ for portfolio)
   * @param {object} config - Billboard content config
   */
  startBillboardCycle(index, config) {
    const billboardName = index === -1 ? 'Main Billboard' : `Portfolio Billboard ${index}`

    if (!config.content || config.content.length === 0) {
      console.log(`📺 ${billboardName}: No content configured`)
      return
    }

    console.log(`📺 ${billboardName}: Starting cycle with ${config.content.length} item(s)`)

    // Initialize current index
    this.currentIndices.set(index, 0)

    // Load first item immediately
    this.loadBillboardContent(index, config.content[0])

    // If multiple items, start cycling
    if (config.content.length > 1) {
      const timer = setInterval(() => {
        const currentIndex = this.currentIndices.get(index)
        const nextIndex = (currentIndex + 1) % config.content.length
        this.currentIndices.set(index, nextIndex)

        const nextContent = config.content[nextIndex]
        this.loadBillboardContent(index, nextContent)
      }, config.cycleInterval)

      this.cycleTimers.push(timer)
    }
  }

  /**
   * Load a single content item onto a billboard
   * @param {number} index - Billboard index
   * @param {object} contentItem - Content item with type and path/color
   */
  loadBillboardContent(index, contentItem) {
    const billboardName = index === -1 ? 'Main' : `Portfolio ${index}`

    if (!contentItem) {
      console.error(`📺 ${billboardName}: No content item provided`)
      return
    }

    switch (contentItem.type) {
      case 'image':
        console.log(`📺 ${billboardName}: Loading image: ${contentItem.path}`)
        this.loadTextureWithErrorHandling(index, contentItem.path)
        break

      case 'video':
        console.log(`📺 ${billboardName}: Loading video: ${contentItem.path}`)
        this.loadVideoWithErrorHandling(index, contentItem.path)
        break

      case 'color':
        console.log(`📺 ${billboardName}: Setting color: ${contentItem.color.toString(16)}`)
        this.setBillboardColor(index, contentItem.color)
        break

      default:
        console.error(`📺 ${billboardName}: Unknown content type: ${contentItem.type}`)
    }
  }

  /**
   * Load texture with improved error handling
   */
  loadTextureWithErrorHandling(index, imagePath) {
    const billboard = index === -1 ? this.mainBillboard : this.billboards[index + 1]
    if (!billboard) {
      console.error(`📺 Billboard ${index} not found`)
      return
    }

    const loader = new THREE.TextureLoader()
    loader.load(
      imagePath,
      (texture) => {
        const material = billboard.userData.billboardMaterial
        material.map = texture
        // Set color to white so texture shows in true colors (not tinted)
        material.color.setHex(0xffffff)
        // Reduce emissive to show texture clearly
        material.emissive.setHex(0x000000)
        material.emissiveIntensity = 0.1
        material.needsUpdate = true
        console.log(`✅ Successfully loaded: ${imagePath}`)
      },
      undefined,
      (error) => {
        console.error(`❌ Failed to load image: ${imagePath}`)
        console.error('   Make sure the file exists in the public folder')
        console.error('   Error details:', error)
        // Set a visible error color so you know something went wrong
        this.setBillboardColor(index, 0xff0000) // Red for error
      }
    )
  }

  /**
   * Load video with improved error handling
   */
  loadVideoWithErrorHandling(index, videoPath) {
    const billboard = index === -1 ? this.mainBillboard : this.billboards[index + 1]
    if (!billboard) {
      console.error(`📺 Billboard ${index} not found`)
      return
    }

    const video = document.createElement('video')
    video.src = videoPath
    video.loop = true
    video.muted = true

    // Add error handling for video
    video.addEventListener('error', (e) => {
      console.error(`❌ Failed to load video: ${videoPath}`)
      console.error('   Make sure the file exists in the public folder')
      console.error('   Error details:', e)
      this.setBillboardColor(index, 0xff0000) // Red for error
    })

    video.addEventListener('canplay', () => {
      console.log(`✅ Successfully loaded video: ${videoPath}`)
    })

    video.play().catch((err) => {
      console.warn(`⚠️ Video autoplay failed (this is normal in some browsers):`, err)
    })

    const texture = new THREE.VideoTexture(video)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter

    const material = billboard.userData.billboardMaterial
    material.map = texture
    // Set color to white so video shows in true colors (not tinted)
    material.color.setHex(0xffffff)
    // Reduce emissive to show video clearly
    material.emissive.setHex(0x000000)
    material.emissiveIntensity = 0.1
    material.needsUpdate = true

    billboard.userData.video = video
  }

  /**
   * Set billboard to a solid color
   */
  setBillboardColor(index, color) {
    const billboard = index === -1 ? this.mainBillboard : this.billboards[index + 1]
    if (!billboard) return

    const material = billboard.userData.billboardMaterial

    // Remove any existing texture
    if (material.map) {
      material.map = null
    }

    // Set color and emissive
    material.color.setHex(color)
    material.emissive.setHex(color)
    material.needsUpdate = true
  }

  dispose() {
    // Stop all cycling timers
    this.cycleTimers.forEach(timer => clearInterval(timer))
    this.cycleTimers = []

    // Clean up video elements
    this.billboards.forEach(billboard => {
      if (billboard.userData.video) {
        billboard.userData.video.pause()
        billboard.userData.video.src = ''
      }
    })
  }
}

export default BillboardSystem
