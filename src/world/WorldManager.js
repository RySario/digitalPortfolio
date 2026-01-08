/**
 * World Manager
 * Creates and manages the entire 3D world: islands, ocean, spawn platform
 */

import * as THREE from 'three'
import { Config } from '../core/Config.js'
import { GeometryUtils } from '../utils/GeometryUtils.js'

// Import all themed islands
import { BasketballIsland } from './islands/BasketballIsland.js'
import { KartingIsland } from './islands/KartingIsland.js'
import { BoulderingIsland } from './islands/BoulderingIsland.js'
import { AnimeIsland } from './islands/AnimeIsland.js'
import { SacStateIsland } from './islands/SacStateIsland.js'
import { AppleIsland } from './islands/AppleIsland.js'

export class WorldManager {
  constructor(scene, collisionManager) {
    this.scene = scene
    this.collisionManager = collisionManager
    this.islands = []
    this.ocean = null
    this.centralHub = null
    this.bridges = []
    this.bifrostMaterials = []  // For animation
    this.bifrostTime = 0
  }

  /**
   * Create the entire world
   */
  async createWorld() {
    console.log('Creating connected world...')

    this.createOcean()
    this.createCentralHub()
    await this.createIslands()
    this.createBridges()

    console.log(`World created with ${this.islands.length} connected islands`)
  }

  /**
   * Create the animated ocean with waves
   */
  createOcean() {
    // High-poly plane for smooth waves
    const segments = 128
    const geometry = new THREE.PlaneGeometry(
      Config.ocean.size,
      Config.ocean.size,
      segments,
      segments
    )

    // Store original positions for wave animation
    this.oceanGeometry = geometry
    this.oceanOriginalPositions = geometry.attributes.position.array.slice()

    // Ocean material with transparency and shininess
    const material = new THREE.MeshStandardMaterial({
      color: Config.ocean.color,
      transparent: true,
      opacity: 0.85,
      roughness: 0.2,
      metalness: 0.1,
      side: THREE.DoubleSide
    })

    this.ocean = new THREE.Mesh(geometry, material)
    this.ocean.rotation.x = -Math.PI / 2
    this.ocean.position.y = Config.ocean.position.y
    this.ocean.receiveShadow = true

    this.scene.add(this.ocean)

    // Start wave animation
    this.waveTime = 0
  }

  /**
   * Update ocean waves
   * @param {number} delta - Time delta
   */
  updateOcean(delta) {
    if (!this.ocean || !this.oceanGeometry) return

    this.waveTime += delta

    const positions = this.oceanGeometry.attributes.position.array
    const original = this.oceanOriginalPositions

    // Wave parameters
    const waveSpeed = 1.5
    const waveHeight = 1.2
    const waveFrequency = 0.03
    const waveFrequency2 = 0.02

    for (let i = 0; i < positions.length; i += 3) {
      const x = original[i]
      const y = original[i + 1]

      // Combine multiple wave patterns for realistic ocean
      const wave1 = Math.sin(x * waveFrequency + this.waveTime * waveSpeed) * waveHeight
      const wave2 = Math.sin(y * waveFrequency2 + this.waveTime * waveSpeed * 0.8) * waveHeight * 0.6
      const wave3 = Math.sin((x + y) * waveFrequency * 0.7 + this.waveTime * waveSpeed * 1.2) * waveHeight * 0.3

      // Z is the vertical axis after rotation
      positions[i + 2] = wave1 + wave2 + wave3
    }

    this.oceanGeometry.attributes.position.needsUpdate = true
    this.oceanGeometry.computeVertexNormals()
  }

  /**
   * Create the central hub with textured terrain
   */
  createCentralHub() {
    console.log('Creating central hub with radius:', Config.centralHub.radius)

    // Use textured island for the central hub too
    this.centralHub = GeometryUtils.createTexturedIsland(
      Config.centralHub.radius,
      Config.islands.segments
    )
    this.centralHub.position.set(0, 0, 0)

    this.scene.add(this.centralHub)

    console.log('Central hub created at position:', this.centralHub.position)
    console.log('Central hub geometry vertices:', this.centralHub.geometry.attributes.position.count)

    // Register for collision
    if (this.collisionManager) {
      this.collisionManager.registerCollisionMesh(this.centralHub)
      // Register central hub as an island for terrain height lookup
      this.collisionManager.registerIsland({
        position: new THREE.Vector3(0, 0, 0),
        radius: Config.centralHub.radius,
        seed: Config.centralHub.radius * 1000
      })
    }

    // Add decorations to central hub
    this.decorateCentralHub()
  }

  /**
   * Add decorations to central hub
   */
  decorateCentralHub() {
    const hubRadius = Config.centralHub.radius

    // Trees around perimeter - more trees for larger hub
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2
      const radius = hubRadius * 0.75  // Trees at 75% of hub radius
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius

      const tree = GeometryUtils.createLowPolyTree(0x228B22, 2 + Math.random())
      tree.position.set(x, 3, z)  // Raised to be on top of terrain
      this.scene.add(tree)

      if (this.collisionManager) {
        this.collisionManager.registerCollisionMesh(tree)
      }
    }

    // Add some inner trees/bushes
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + 0.2
      const radius = hubRadius * 0.4
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius

      const bush = GeometryUtils.createLowPolyBush(0x2E7D32, 1.5)
      bush.position.set(x, 3, z)
      this.scene.add(bush)
    }

    // Add some rocks
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + 0.5
      const radius = hubRadius * 0.6
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius

      const rock = GeometryUtils.createLowPolyRock(1 + Math.random(), 0x757575)
      rock.position.set(x, 3, z)
      this.scene.add(rock)
    }
  }

  /**
   * Create all themed islands in radial layout
   */
  async createIslands() {
    const islandClasses = [
      BasketballIsland,   // 0°
      KartingIsland,      // 60°
      BoulderingIsland,   // 120°
      AnimeIsland,        // 180°
      SacStateIsland,     // 240°
      AppleIsland         // 300°
    ]

    const spacing = Config.islands.spacing
    const angleStep = (Math.PI * 2) / Config.islands.count

    for (let i = 0; i < islandClasses.length; i++) {
      const angle = i * angleStep

      // Basketball island (index 0) needs more distance for the larger arena
      const islandSpacing = (i === 0) ? spacing + 80 : spacing
      const x = Math.cos(angle) * islandSpacing
      const z = Math.sin(angle) * islandSpacing

      const position = new THREE.Vector3(x, 0, z)
      const IslandClass = islandClasses[i]
      const island = new IslandClass(position)

      await island.build(this.scene, this.collisionManager)

      this.islands.push(island)

      console.log(`Created ${island.getName()} at position (${x.toFixed(1)}, 0, ${z.toFixed(1)})`)
    }
  }

  /**
   * Create Bifrost-style bridges connecting central hub to each island
   */
  createBridges() {
    const angleStep = (Math.PI * 2) / Config.islands.count

    for (let i = 0; i < Config.islands.count; i++) {
      const angle = i * angleStep
      const island = this.islands[i]

      // Get the actual island radius (different islands have different sizes)
      const islandRadius = island.radius || Config.islands.baseSize / 2

      this.createBifrostBridge(angle, island.position, islandRadius)
    }

    console.log(`Created ${this.bridges.length} Bifrost bridges`)
  }

  /**
   * Create a Bifrost-style rainbow bridge with old-timey hump
   * @param {number} angle - Angle from center
   * @param {THREE.Vector3} targetPos - Island position
   * @param {number} islandRadius - Actual radius of the target island
   */
  createBifrostBridge(angle, targetPos, islandRadius) {
    // Calculate bridge position and dimensions
    const centerRadius = Config.centralHub.radius
    const distanceToIsland = targetPos.length()

    // Calculate bridge length to properly connect hub edge to island edge
    // Add small overlap on each end for smooth connection
    const hubOverlap = 3
    const islandOverlap = 5
    const bridgeLength = distanceToIsland - centerRadius - islandRadius + hubOverlap + islandOverlap
    const bridgeWidth = Config.bridges.width * 2
    const bridgeHeight = 2.0  // Slightly higher base
    const humpHeight = 3.5    // Height of the arch in the middle

    // Create the bridge group
    const bridgeGroup = new THREE.Group()

    // Create custom shader material for rainbow effect
    const bifrostMaterial = this.createBifrostMaterial()
    this.bifrostMaterials.push(bifrostMaterial)

    // Main bridge surface with old-timey hump (arch)
    const segmentsX = 4
    const segmentsZ = Math.ceil(bridgeLength / 2)  // More segments for smooth curve
    const bridgeGeom = new THREE.PlaneGeometry(bridgeWidth, bridgeLength, segmentsX, segmentsZ)

    // Add arch/hump to the bridge - old-timey style
    const positions = bridgeGeom.attributes.position.array
    for (let i = 0; i < positions.length; i += 3) {
      const z = positions[i + 1]  // Y in plane geometry becomes Z after rotation
      const normalizedZ = z / (bridgeLength / 2)  // -1 to 1 along bridge length
      // Parabolic arch: highest in middle, tapering to ends
      const archHeight = humpHeight * (1 - normalizedZ * normalizedZ)
      positions[i + 2] = archHeight  // Z becomes Y (height) after rotation
    }
    bridgeGeom.attributes.position.needsUpdate = true
    bridgeGeom.computeVertexNormals()

    const bridgeSurface = new THREE.Mesh(bridgeGeom, bifrostMaterial)
    bridgeSurface.rotation.x = -Math.PI / 2
    bridgeSurface.receiveShadow = true
    bridgeGroup.add(bridgeSurface)

    // Add glowing edges with hump
    this.addBifrostEdges(bridgeGroup, bridgeWidth, bridgeLength, humpHeight)

    // Add energy pillars along the bridge
    this.addBifrostPillars(bridgeGroup, bridgeWidth, bridgeLength, humpHeight)

    // Position the bridge - center it between hub and island
    const bridgeStartDist = centerRadius - hubOverlap
    const bridgeDistance = bridgeStartDist + (bridgeLength / 2)
    bridgeGroup.position.set(
      Math.cos(angle) * bridgeDistance,
      bridgeHeight,
      Math.sin(angle) * bridgeDistance
    )
    bridgeGroup.rotation.y = angle

    this.scene.add(bridgeGroup)
    this.bridges.push(bridgeGroup)

    // Create multiple collision segments along the arched bridge for proper walking
    const collisionSegments = 8
    for (let seg = 0; seg < collisionSegments; seg++) {
      const segmentLength = bridgeLength / collisionSegments
      const segZ = (seg + 0.5 - collisionSegments / 2) * segmentLength
      const normalizedZ = segZ / (bridgeLength / 2)
      const segHeight = humpHeight * (1 - normalizedZ * normalizedZ)

      const collisionGeom = new THREE.BoxGeometry(bridgeWidth, 1.5, segmentLength + 1)
      const collisionMat = new THREE.MeshBasicMaterial({ visible: false })
      const collisionMesh = new THREE.Mesh(collisionGeom, collisionMat)

      // Position relative to bridge center
      const segWorldDist = bridgeDistance + segZ * Math.cos(0)  // Along the bridge direction
      collisionMesh.position.set(
        Math.cos(angle) * bridgeDistance + Math.cos(angle + Math.PI/2) * 0 + Math.cos(angle) * segZ,
        bridgeHeight + segHeight + 0.5,
        Math.sin(angle) * bridgeDistance + Math.sin(angle + Math.PI/2) * 0 + Math.sin(angle) * segZ
      )
      collisionMesh.rotation.y = angle
      this.scene.add(collisionMesh)

      if (this.collisionManager) {
        this.collisionManager.registerCollisionMesh(collisionMesh)
      }
    }
  }

  /**
   * Create the shader material for translucent white bridge
   */
  createBifrostMaterial() {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        opacity: { value: 0.7 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;

        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float opacity;
        varying vec2 vUv;
        varying vec3 vPosition;

        void main() {
          // Clean white with subtle energy flow
          vec3 baseColor = vec3(0.95, 0.97, 1.0);  // Slightly cool white

          // Subtle flowing energy lines
          float flow = vUv.y - time * 0.2;
          float energyLine = sin(flow * 30.0) * 0.5 + 0.5;
          energyLine = pow(energyLine, 8.0) * 0.3;  // Sharp, subtle lines

          // Soft edge glow
          float edgeFade = 1.0 - abs(vUv.x - 0.5) * 2.0;
          edgeFade = pow(edgeFade, 0.3);

          // Pulse effect
          float pulse = sin(time * 1.5) * 0.05 + 0.95;

          // Combine effects
          vec3 finalColor = baseColor * pulse + vec3(energyLine * 0.15);

          // Final opacity with edge fade
          float finalOpacity = opacity * edgeFade;

          gl_FragColor = vec4(finalColor, finalOpacity);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.NormalBlending
    })

    return material
  }

  /**
   * Add glowing edges to the bridge following the hump
   */
  addBifrostEdges(bridgeGroup, width, length, humpHeight = 0) {
    // Create clean white edge material
    const edgeMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6
    })

    // Create edge segments that follow the arch
    const edgeSegments = 16
    for (let i = 0; i < edgeSegments; i++) {
      const z1 = (i / edgeSegments) * length - length / 2
      const z2 = ((i + 1) / edgeSegments) * length - length / 2
      const zMid = (z1 + z2) / 2
      const normalizedZ = zMid / (length / 2)
      const segHeight = humpHeight * (1 - normalizedZ * normalizedZ)
      const segLength = length / edgeSegments + 0.2

      const edgeGeom = new THREE.BoxGeometry(0.2, 0.4, segLength)

      // Left edge segment
      const leftEdge = new THREE.Mesh(edgeGeom, edgeMat)
      leftEdge.position.set(-width / 2, segHeight + 0.2, zMid)
      bridgeGroup.add(leftEdge)

      // Right edge segment
      const rightEdge = new THREE.Mesh(edgeGeom.clone(), edgeMat)
      rightEdge.position.set(width / 2, segHeight + 0.2, zMid)
      bridgeGroup.add(rightEdge)
    }

    // Subtle marker orbs along edges following the arch
    const lightCount = Math.floor(length / 15)
    for (let i = 0; i <= lightCount; i++) {
      const z = (i / lightCount) * length - length / 2
      const normalizedZ = z / (length / 2)
      const orbHeight = humpHeight * (1 - normalizedZ * normalizedZ)

      // Small white orbs
      const orbGeom = new THREE.SphereGeometry(0.15, 12, 12)
      const orbMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
      })

      const leftOrb = new THREE.Mesh(orbGeom, orbMat)
      leftOrb.position.set(-width / 2, orbHeight + 0.5, z)
      bridgeGroup.add(leftOrb)

      const rightOrb = new THREE.Mesh(orbGeom.clone(), orbMat)
      rightOrb.position.set(width / 2, orbHeight + 0.5, z)
      bridgeGroup.add(rightOrb)
    }
  }

  /**
   * Add pillars along the bridge following the hump
   */
  addBifrostPillars(bridgeGroup, width, length, humpHeight = 0) {
    const pillarCount = Math.floor(length / 20)

    for (let i = 0; i <= pillarCount; i++) {
      const z = (i / pillarCount) * length - length / 2
      const normalizedZ = z / (length / 2)
      const baseHeight = humpHeight * (1 - normalizedZ * normalizedZ)

      // Create clean pillar
      const pillarHeight = 2.5
      const pillarGeom = new THREE.CylinderGeometry(0.08, 0.15, pillarHeight, 8)
      const pillarMat = new THREE.MeshStandardMaterial({
        color: 0xeeeeee,
        transparent: true,
        opacity: 0.7,
        roughness: 0.3,
        metalness: 0.2
      })

      // Left pillar - positioned on the arched surface
      const leftPillar = new THREE.Mesh(pillarGeom, pillarMat)
      leftPillar.position.set(-width / 2 - 0.15, baseHeight + pillarHeight / 2, z)
      bridgeGroup.add(leftPillar)

      // Right pillar
      const rightPillar = new THREE.Mesh(pillarGeom.clone(), pillarMat)
      rightPillar.position.set(width / 2 + 0.15, baseHeight + pillarHeight / 2, z)
      bridgeGroup.add(rightPillar)

      // Simple sphere tops
      const topGeom = new THREE.SphereGeometry(0.15, 12, 12)
      const topMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9
      })

      const leftTop = new THREE.Mesh(topGeom, topMat)
      leftTop.position.set(-width / 2 - 0.15, baseHeight + pillarHeight + 0.1, z)
      bridgeGroup.add(leftTop)

      const rightTop = new THREE.Mesh(topGeom.clone(), topMat)
      rightTop.position.set(width / 2 + 0.15, baseHeight + pillarHeight + 0.1, z)
      bridgeGroup.add(rightTop)
    }
  }

  /**
   * Update Bifrost bridge animation
   * @param {number} delta
   */
  updateBifrost(delta) {
    this.bifrostTime += delta

    // Update all Bifrost materials
    for (const material of this.bifrostMaterials) {
      material.uniforms.time.value = this.bifrostTime
    }
  }

  /**
   * Get all islands
   * @returns {Array}
   */
  getIslands() {
    return this.islands
  }

  /**
   * Get island by name
   * @param {string} name
   * @returns {Island|null}
   */
  getIslandByName(name) {
    return this.islands.find(island => island.getName() === name) || null
  }
}

export default WorldManager
