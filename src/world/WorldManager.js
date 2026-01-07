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
   * Create the ocean plane
   */
  createOcean() {
    const geometry = new THREE.PlaneGeometry(
      Config.ocean.size,
      Config.ocean.size
    )
    const material = new THREE.MeshStandardMaterial({
      color: Config.ocean.color,
      flatShading: true
    })

    this.ocean = new THREE.Mesh(geometry, material)
    this.ocean.rotation.x = -Math.PI / 2
    this.ocean.position.y = Config.ocean.position.y
    this.ocean.receiveShadow = true

    this.scene.add(this.ocean)
  }

  /**
   * Create the central hub
   */
  createCentralHub() {
    console.log('Creating central hub with radius:', Config.centralHub.radius)

    const geometry = GeometryUtils.createLowPolyIsland(
      Config.centralHub.radius,
      Config.islands.segments
    )
    const material = new THREE.MeshStandardMaterial({
      color: 0x9CCC65,  // Light green
      flatShading: true
    })

    this.centralHub = new THREE.Mesh(geometry, material)
    this.centralHub.position.set(0, 0, 0)
    this.centralHub.castShadow = true
    this.centralHub.receiveShadow = true

    this.scene.add(this.centralHub)

    console.log('Central hub created at position:', this.centralHub.position)
    console.log('Central hub geometry vertices:', geometry.attributes.position.count)

    // Register for collision
    if (this.collisionManager) {
      this.collisionManager.registerCollisionMesh(this.centralHub)
    }

    // Add decorations to central hub
    this.decorateCentralHub()
  }

  /**
   * Add decorations to central hub
   */
  decorateCentralHub() {
    // Trees around perimeter
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const radius = 22
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius

      const tree = GeometryUtils.createLowPolyTree(0x228B22, 2)
      tree.position.set(x, 0, z)
      this.scene.add(tree)

      if (this.collisionManager) {
        this.collisionManager.registerCollisionMesh(tree)
      }
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
      const x = Math.cos(angle) * spacing
      const z = Math.sin(angle) * spacing

      const position = new THREE.Vector3(x, 0, z)
      const IslandClass = islandClasses[i]
      const island = new IslandClass(position)

      await island.build(this.scene, this.collisionManager)

      this.islands.push(island)

      console.log(`Created ${island.getName()} at position (${x.toFixed(1)}, 0, ${z.toFixed(1)})`)
    }
  }

  /**
   * Create bridges connecting central hub to each island
   */
  createBridges() {
    const angleStep = (Math.PI * 2) / Config.islands.count

    for (let i = 0; i < Config.islands.count; i++) {
      const angle = i * angleStep
      const island = this.islands[i]

      this.createBridge(angle, island.position)
    }

    console.log(`Created ${this.bridges.length} bridges`)
  }

  /**
   * Create a single bridge
   * @param {number} angle - Angle from center
   * @param {THREE.Vector3} targetPos - Island position
   */
  createBridge(angle, targetPos) {
    // Calculate bridge position and dimensions
    const centerRadius = Config.centralHub.radius
    const distanceToIsland = targetPos.length()
    const bridgeLength = distanceToIsland - centerRadius - (Config.islands.baseSize / 2) + 15

    // Main bridge deck geometry (wider and more visible)
    const deckGeometry = new THREE.BoxGeometry(
      Config.bridges.width * 1.5,  // Wider for easier walking
      Config.bridges.height,
      bridgeLength
    )
    const deckMaterial = new THREE.MeshStandardMaterial({
      color: Config.bridges.color,
      flatShading: true
    })

    const bridgeDeck = new THREE.Mesh(deckGeometry, deckMaterial)

    // Position bridge between hub and island, raised above water
    const bridgeDistance = centerRadius + (bridgeLength / 2)
    const bridgeHeight = 1.5  // Raised above island surface
    bridgeDeck.position.set(
      Math.cos(angle) * bridgeDistance,
      bridgeHeight,
      Math.sin(angle) * bridgeDistance
    )
    bridgeDeck.rotation.y = angle

    bridgeDeck.castShadow = true
    bridgeDeck.receiveShadow = true

    this.scene.add(bridgeDeck)
    this.bridges.push(bridgeDeck)

    // Register for collision
    if (this.collisionManager) {
      this.collisionManager.registerCollisionMesh(bridgeDeck)
    }

    // Add decorative planks on the bridge
    const plankCount = Math.floor(bridgeLength / 2)
    for (let i = 0; i < plankCount; i++) {
      const plankZ = (i / plankCount) * bridgeLength - bridgeLength / 2
      const plank = GeometryUtils.createBox(
        Config.bridges.width * 1.3,
        0.1,
        0.3,
        0x654321
      )
      plank.position.copy(bridgeDeck.position)
      plank.position.y += Config.bridges.height / 2 + 0.05
      plank.position.x += Math.cos(angle) * plankZ
      plank.position.z += Math.sin(angle) * plankZ
      plank.rotation.y = angle
      this.scene.add(plank)
    }

    // Add support pillars
    const pillarCount = Math.floor(bridgeLength / 10)
    for (let i = 1; i < pillarCount; i++) {
      const pillarZ = (i / pillarCount) * bridgeLength - bridgeLength / 2
      const pillarHeight = bridgeHeight + 2

      const pillar = GeometryUtils.createCylinder(0.3, 0.4, pillarHeight, 0x654321, 8)
      pillar.position.set(
        Math.cos(angle) * (bridgeDistance + pillarZ * Math.sin(angle)),
        pillarHeight / 2 - 2,
        Math.sin(angle) * (bridgeDistance + pillarZ * Math.cos(angle))
      )
      this.scene.add(pillar)

      if (this.collisionManager) {
        this.collisionManager.registerCollisionMesh(pillar)
      }
    }

    // Add railings
    this.addBridgeRailings(bridgeDeck, angle, bridgeLength, bridgeHeight)
  }

  /**
   * Add railings to bridge
   * @param {THREE.Mesh} bridge
   * @param {number} angle
   * @param {number} length
   * @param {number} bridgeHeight
   */
  addBridgeRailings(bridge, angle, length, bridgeHeight) {
    const railingHeight = 1.2
    const railingWidth = 0.15
    const bridgeWidth = Config.bridges.width * 1.5

    // Left railing
    const leftRailing = GeometryUtils.createBox(
      railingWidth,
      railingHeight,
      length,
      0x8B4513
    )
    leftRailing.position.copy(bridge.position)
    leftRailing.position.x += Math.cos(angle + Math.PI / 2) * (bridgeWidth / 2)
    leftRailing.position.z += Math.sin(angle + Math.PI / 2) * (bridgeWidth / 2)
    leftRailing.position.y = bridgeHeight + railingHeight / 2 + Config.bridges.height / 2
    leftRailing.rotation.y = angle
    this.scene.add(leftRailing)

    // Right railing
    const rightRailing = GeometryUtils.createBox(
      railingWidth,
      railingHeight,
      length,
      0x8B4513
    )
    rightRailing.position.copy(bridge.position)
    rightRailing.position.x += Math.cos(angle - Math.PI / 2) * (bridgeWidth / 2)
    rightRailing.position.z += Math.sin(angle - Math.PI / 2) * (bridgeWidth / 2)
    rightRailing.position.y = bridgeHeight + railingHeight / 2 + Config.bridges.height / 2
    rightRailing.rotation.y = angle
    this.scene.add(rightRailing)

    // Add crossbeams for visual detail
    const beamCount = Math.floor(length / 5)
    for (let i = 0; i < beamCount; i++) {
      const beamZ = (i / beamCount) * length - length / 2
      const beam = GeometryUtils.createBox(bridgeWidth, 0.1, 0.15, 0x654321)
      beam.position.copy(bridge.position)
      beam.position.y = bridgeHeight + railingHeight * 0.3
      beam.position.x += Math.cos(angle) * beamZ
      beam.position.z += Math.sin(angle) * beamZ
      beam.rotation.y = angle
      this.scene.add(beam)
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
