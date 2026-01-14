/**
 * Billboard System
 * Manages all billboard screens for portfolio display
 * Includes main interactive billboard and portfolio billboards
 */

import * as THREE from 'three'
import { Config } from '../core/Config.js'

export class BillboardSystem {
  constructor() {
    this.group = new THREE.Group()
    this.billboardsConfig = Config.billboards
    this.billboards = []
    this.mainBillboard = null

    this.createMainBillboard()
    // Portfolio billboards removed as requested
    // this.createPortfolioBillboards()
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
   * Create portfolio billboards
   */
  createPortfolioBillboards() {
    this.billboardsConfig.portfolio.forEach((config, index) => {
      // Cycle through colors for variety
      const colors = [0x9b59b6, 0x3498db, 0xff00ff, 0x00d9ff, 0xff6b35]
      const color = colors[index % colors.length]

      const billboard = this.createBillboard(
        config.width,
        config.height,
        config.position,
        config.rotation,
        config.emissiveIntensity,
        color,
        false
      )

      billboard.userData.portfolioIndex = index
      this.billboards.push(billboard)
      this.group.add(billboard)
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

  dispose() {
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
