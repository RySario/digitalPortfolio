/**
 * Cyberpunk Building
 * Multi-level building structure with windows, details, and platform
 */

import * as THREE from 'three'
import { Config } from '../core/Config.js'

export class CyberpunkBuilding {
  constructor() {
    this.group = new THREE.Group()
    this.buildingConfig = Config.building
    this.steamSystems = []  // Store steam particle systems for animation

    this.createPlatform()
    this.createGroundFloor()
    this.createSecondFloor()
    this.createThirdFloor()
    this.createRoof()
    this.addWindowsAndDetails()
  }

  createPlatform() {
    const platformConfig = this.buildingConfig.platform

    const geometry = new THREE.BoxGeometry(
      platformConfig.width,
      platformConfig.height,
      platformConfig.depth
    )

    // Create a grid texture for the platform
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')

    // Base color
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, 512, 512)

    // Grid lines
    ctx.strokeStyle = '#2a2a2a'
    ctx.lineWidth = 2
    const gridSize = 32
    for (let i = 0; i <= 512; i += gridSize) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, 512)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(512, i)
      ctx.stroke()
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(platformConfig.width / 4, platformConfig.depth / 4)

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: platformConfig.roughness,
      metalness: platformConfig.metalness,
      color: 0xffffff  // Use white to show texture
    })

    const platform = new THREE.Mesh(geometry, material)
    platform.position.y = platformConfig.height / 2
    platform.receiveShadow = true
    platform.castShadow = true

    this.group.add(platform)
  }

  createGroundFloor() {
    const floorConfig = this.buildingConfig.groundFloor

    const geometry = new THREE.BoxGeometry(
      floorConfig.width,
      floorConfig.height,
      floorConfig.depth
    )

    // Create concrete/metal texture
    const texture = this.createBuildingTexture(floorConfig.width, floorConfig.height)

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.7,
      metalness: 0.2,
      color: 0xffffff  // White to show texture
    })

    const floor = new THREE.Mesh(geometry, material)
    floor.position.set(
      floorConfig.position.x,
      floorConfig.position.y,
      floorConfig.position.z
    )
    floor.castShadow = true
    floor.receiveShadow = true

    this.group.add(floor)

    // Add windows to ground floor - fewer windows, skip front
    this.addWindows(floor, floorConfig, 2, 1, true)  // Skip front
  }

  createSecondFloor() {
    const floorConfig = this.buildingConfig.secondFloor

    const geometry = new THREE.BoxGeometry(
      floorConfig.width,
      floorConfig.height,
      floorConfig.depth
    )

    const texture = this.createBuildingTexture(floorConfig.width, floorConfig.height)

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.7,
      metalness: 0.2,
      color: 0xffffff
    })

    const floor = new THREE.Mesh(geometry, material)
    floor.position.set(
      floorConfig.position.x,
      floorConfig.position.y,
      floorConfig.position.z
    )
    floor.castShadow = true
    floor.receiveShadow = true

    this.group.add(floor)

    // Add windows to second floor - fewer windows, skip front (billboard area)
    this.addWindows(floor, floorConfig, 2, 1, true)  // Skip front
  }

  createThirdFloor() {
    const floorConfig = this.buildingConfig.thirdFloor

    const geometry = new THREE.BoxGeometry(
      floorConfig.width,
      floorConfig.height,
      floorConfig.depth
    )

    const texture = this.createBuildingTexture(floorConfig.width, floorConfig.height)

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.7,
      metalness: 0.2,
      color: 0xffffff
    })

    const floor = new THREE.Mesh(geometry, material)
    floor.position.set(
      floorConfig.position.x,
      floorConfig.position.y,
      floorConfig.position.z
    )
    floor.castShadow = true
    floor.receiveShadow = true

    this.group.add(floor)

    // Add windows to third floor - fewer windows
    this.addWindows(floor, floorConfig, 2, 1, false)  // Keep front for variety
  }

  createRoof() {
    const roofConfig = this.buildingConfig.roof

    const geometry = new THREE.BoxGeometry(
      roofConfig.width,
      roofConfig.height,
      roofConfig.depth
    )

    const material = new THREE.MeshStandardMaterial({
      color: roofConfig.color,
      roughness: 0.8,
      metalness: 0.4
    })

    const roof = new THREE.Mesh(geometry, material)
    roof.position.set(
      roofConfig.position.x,
      roofConfig.position.y,
      roofConfig.position.z
    )
    roof.castShadow = true
    roof.receiveShadow = true

    this.group.add(roof)
  }

  /**
   * Create building texture (concrete/metal panels)
   */
  createBuildingTexture(width, height) {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')

    // Base concrete color - dark gray
    ctx.fillStyle = '#3a3a3a'
    ctx.fillRect(0, 0, 512, 512)

    // Add noise for concrete texture
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 512
      const brightness = Math.random() * 40 - 20
      const gray = 58 + brightness
      ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`
      ctx.fillRect(x, y, 2, 2)
    }

    // Add panel lines (horizontal)
    ctx.strokeStyle = '#2a2a2a'
    ctx.lineWidth = 3
    for (let y = 0; y < 512; y += 128) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(512, y)
      ctx.stroke()
    }

    // Add vertical panel lines
    for (let x = 0; x < 512; x += 128) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, 512)
      ctx.stroke()
    }

    // Add some darker weathering
    ctx.fillStyle = 'rgba(20, 20, 20, 0.1)'
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 512
      const size = Math.random() * 50 + 20
      ctx.fillRect(x, y, size, size)
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(2, 2)
    return texture
  }

  /**
   * Add windows to a floor
   */
  addWindows(floor, floorConfig, columns, rows, skipFront = false) {
    const windowWidth = 0.8
    const windowHeight = 1.2
    const windowDepth = 0.15

    // Calculate spacing
    const horizontalSpacing = floorConfig.width / (columns + 1)
    const verticalSpacing = floorConfig.height / (rows + 1)

    for (let col = 0; col < columns; col++) {
      for (let row = 0; row < rows; row++) {
        // Window position relative to floor center
        const x = -floorConfig.width / 2 + horizontalSpacing * (col + 1)
        const y = -floorConfig.height / 2 + verticalSpacing * (row + 1)

        // Front windows (skip if billboard area)
        if (!skipFront) {
          this.createWindow(
            floor.position.x + x,
            floor.position.y + y,
            floor.position.z + floorConfig.depth / 2 + windowDepth / 2,
            windowWidth,
            windowHeight,
            windowDepth
          )
        }

        // Back windows
        this.createWindow(
          floor.position.x + x,
          floor.position.y + y,
          floor.position.z - floorConfig.depth / 2 - windowDepth / 2,
          windowWidth,
          windowHeight,
          windowDepth
        )
      }
    }

    // Side windows (left and right) - reduced
    for (let row = 0; row < rows; row++) {
      const y = -floorConfig.height / 2 + verticalSpacing * (row + 1)

      // Left side
      this.createWindow(
        floor.position.x - floorConfig.width / 2 - windowDepth / 2,
        floor.position.y + y,
        floor.position.z,
        windowDepth,
        windowHeight,
        windowWidth
      )

      // Right side
      this.createWindow(
        floor.position.x + floorConfig.width / 2 + windowDepth / 2,
        floor.position.y + y,
        floor.position.z,
        windowDepth,
        windowHeight,
        windowWidth
      )
    }
  }

  /**
   * Create a single window with emissive glow
   */
  createWindow(x, y, z, width, height, depth) {
    const geometry = new THREE.BoxGeometry(width, height, depth)

    // Random window color (warm orange or cool blue)
    const isWarm = Math.random() > 0.5
    const emissiveColor = isWarm ? 0xff6b35 : 0x3498db

    const material = new THREE.MeshStandardMaterial({
      color: 0x000000,
      emissive: emissiveColor,
      emissiveIntensity: 0.4 + Math.random() * 0.3,
      roughness: 0.3,
      metalness: 0.1
    })

    const window = new THREE.Mesh(geometry, material)
    window.position.set(x, y, z)
    window.castShadow = false
    window.receiveShadow = false

    this.group.add(window)
  }

  /**
   * Add architectural details
   */
  addWindowsAndDetails() {
    // Add AC units to roof
    this.addACUnits()

    // Add pipes/vents
    this.addPipes()

    // Add balcony rails
    this.addBalconies()
  }

  addACUnits() {
    const roofConfig = this.buildingConfig.roof
    const acSize = 0.8

    for (let i = 0; i < 3; i++) {
      const geometry = new THREE.BoxGeometry(acSize, acSize * 0.6, acSize * 0.8)
      const material = new THREE.MeshStandardMaterial({
        color: 0x3a3a3a,
        roughness: 0.9,
        metalness: 0.1
      })

      const ac = new THREE.Mesh(geometry, material)
      ac.position.set(
        -3 + i * 3,
        roofConfig.position.y + 0.5,
        roofConfig.position.z - 2
      )
      ac.castShadow = true

      this.group.add(ac)
    }

    // Add antenna
    const antennaGeom = new THREE.CylinderGeometry(0.1, 0.1, 4, 8)
    const antennaMat = new THREE.MeshStandardMaterial({
      color: 0x666666,
      roughness: 0.5,
      metalness: 0.8
    })
    const antenna = new THREE.Mesh(antennaGeom, antennaMat)
    antenna.position.set(
      roofConfig.position.x + 3,
      roofConfig.position.y + 2.5,
      roofConfig.position.z + 2
    )
    antenna.castShadow = true
    this.group.add(antenna)
  }

  addPipes() {
    const pipeRadius = 0.15
    const pipeMat = new THREE.MeshStandardMaterial({
      color: 0x4a4a4a,
      roughness: 0.7,
      metalness: 0.5
    })

    // Large vertical pipe 1 - back left (connected from platform to roof)
    const pipe1Height = 19
    const pipe1Geom = new THREE.CylinderGeometry(pipeRadius, pipeRadius, pipe1Height, 8)
    const pipe1 = new THREE.Mesh(pipe1Geom, pipeMat)
    pipe1.position.set(-7, pipe1Height / 2 + 1.5, -5)  // Start from platform top
    pipe1.castShadow = true
    this.group.add(pipe1)

    // Add steam to pipe 1
    this.addSteam(-7, 20.5, -5)

    // Large vertical pipe 2 - back right
    const pipe2Height = 19
    const pipe2Geom = new THREE.CylinderGeometry(pipeRadius, pipeRadius, pipe2Height, 8)
    const pipe2 = new THREE.Mesh(pipe2Geom, pipeMat)
    pipe2.position.set(7, pipe2Height / 2 + 1.5, -5)  // Start from platform top
    pipe2.castShadow = true
    this.group.add(pipe2)

    // Add steam to pipe 2
    this.addSteam(7, 20.5, -5)

    // Medium pipe on right side
    const pipe3Height = 12
    const pipe3Geom = new THREE.CylinderGeometry(pipeRadius * 0.8, pipeRadius * 0.8, pipe3Height, 8)
    const pipe3 = new THREE.Mesh(pipe3Geom, pipeMat)
    pipe3.position.set(6.5, pipe3Height / 2 + 1.5, 3)
    pipe3.castShadow = true
    this.group.add(pipe3)

    // Small decorative pipes
    const smallPipeGeom = new THREE.CylinderGeometry(0.1, 0.1, 6, 6)
    const smallPipe1 = new THREE.Mesh(smallPipeGeom, pipeMat)
    smallPipe1.position.set(-6, 7, 6)
    smallPipe1.castShadow = true
    this.group.add(smallPipe1)

    // Horizontal connecting pipes
    const hPipeGeom = new THREE.CylinderGeometry(0.12, 0.12, 4, 8)
    const hPipe1 = new THREE.Mesh(hPipeGeom, pipeMat)
    hPipe1.rotation.z = Math.PI / 2
    hPipe1.position.set(-5, 18, -5)
    hPipe1.castShadow = true
    this.group.add(hPipe1)
  }

  /**
   * Add steam particle effect at position
   */
  addSteam(x, y, z) {
    // Create particle system for steam
    const particleCount = 50
    const particles = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)
    const opacities = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = x + (Math.random() - 0.5) * 0.3
      positions[i * 3 + 1] = y + Math.random() * 3
      positions[i * 3 + 2] = z + (Math.random() - 0.5) * 0.3

      // Slower upward velocities
      velocities[i * 3] = (Math.random() - 0.5) * 0.01
      velocities[i * 3 + 1] = 0.02 + Math.random() * 0.02  // Slower rise
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01

      opacities[i] = Math.random() * 0.6
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xdddddd,
      size: 0.6,  // Larger particles
      transparent: true,
      opacity: 0.4,  // More transparent
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })

    const particleSystem = new THREE.Points(particles, particleMaterial)
    this.group.add(particleSystem)

    // Store for animation
    this.steamSystems.push({
      system: particleSystem,
      baseY: y,
      maxY: y + 6,  // Taller steam column
      velocities: velocities,
      opacities: opacities,
      baseX: x,
      baseZ: z
    })
  }

  /**
   * Update steam animation
   */
  updateSteam(deltaTime) {
    this.steamSystems.forEach(steam => {
      const positions = steam.system.geometry.attributes.position.array

      for (let i = 0; i < positions.length / 3; i++) {
        const idx = i * 3

        // Update position based on velocity
        positions[idx] += steam.velocities[idx]
        positions[idx + 1] += steam.velocities[idx + 1]
        positions[idx + 2] += steam.velocities[idx + 2]

        // Add gradual outward dispersion as steam rises
        const heightRatio = (positions[idx + 1] - steam.baseY) / (steam.maxY - steam.baseY)
        const disperseSpeed = heightRatio * 0.015
        steam.velocities[idx] += (Math.random() - 0.5) * disperseSpeed
        steam.velocities[idx + 2] += (Math.random() - 0.5) * disperseSpeed

        // Clamp velocities
        steam.velocities[idx] = Math.max(-0.02, Math.min(0.02, steam.velocities[idx]))
        steam.velocities[idx + 2] = Math.max(-0.02, Math.min(0.02, steam.velocities[idx + 2]))

        // Reset particle if it goes too high
        if (positions[idx + 1] > steam.maxY) {
          positions[idx] = steam.baseX + (Math.random() - 0.5) * 0.3
          positions[idx + 1] = steam.baseY
          positions[idx + 2] = steam.baseZ + (Math.random() - 0.5) * 0.3

          // Reset velocities
          steam.velocities[idx] = (Math.random() - 0.5) * 0.01
          steam.velocities[idx + 1] = 0.02 + Math.random() * 0.02
          steam.velocities[idx + 2] = (Math.random() - 0.5) * 0.01
        }
      }

      steam.system.geometry.attributes.position.needsUpdate = true
    })
  }

  addBalconies() {
    // Add small balconies/overhangs
    const balconyGeom = new THREE.BoxGeometry(4, 0.2, 1.5)
    const balconyMat = new THREE.MeshStandardMaterial({
      color: 0x3a3a3a,
      roughness: 0.8,
      metalness: 0.2
    })

    const balcony1 = new THREE.Mesh(balconyGeom, balconyMat)
    balcony1.position.set(5, 14, 5.5)
    balcony1.castShadow = true
    this.group.add(balcony1)

    const balcony2 = new THREE.Mesh(balconyGeom, balconyMat)
    balcony2.position.set(-5, 10, 6.5)
    balcony2.castShadow = true
    this.group.add(balcony2)
  }

  getGroup() {
    return this.group
  }
}

export default CyberpunkBuilding
