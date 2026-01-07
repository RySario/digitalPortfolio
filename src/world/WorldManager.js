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
    // Central fountain/monument
    const monument = GeometryUtils.createCylinder(3, 2, 8, 0xC0C0C0, 8)
    monument.position.set(0, 4, 0)
    this.scene.add(monument)

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
    const bridgeLength = distanceToIsland - centerRadius - (Config.islands.baseSize / 2) + 10

    // Bridge geometry
    const geometry = new THREE.BoxGeometry(
      Config.bridges.width,
      Config.bridges.height,
      bridgeLength
    )
    const material = new THREE.MeshStandardMaterial({
      color: Config.bridges.color,
      flatShading: true
    })

    const bridge = new THREE.Mesh(geometry, material)

    // Position bridge between hub and island
    const bridgeDistance = centerRadius + (bridgeLength / 2)
    bridge.position.set(
      Math.cos(angle) * bridgeDistance,
      0,
      Math.sin(angle) * bridgeDistance
    )
    bridge.rotation.y = angle

    bridge.castShadow = true
    bridge.receiveShadow = true

    this.scene.add(bridge)
    this.bridges.push(bridge)

    // Register for collision
    if (this.collisionManager) {
      this.collisionManager.registerCollisionMesh(bridge)
    }

    // Add railings
    this.addBridgeRailings(bridge, angle, bridgeLength)
  }

  /**
   * Add railings to bridge
   * @param {THREE.Mesh} bridge
   * @param {number} angle
   * @param {number} length
   */
  addBridgeRailings(bridge, angle, length) {
    const railingHeight = 1.5
    const railingWidth = 0.2

    // Left railing
    const leftRailing = GeometryUtils.createBox(
      railingWidth,
      railingHeight,
      length,
      0x8B4513
    )
    leftRailing.position.copy(bridge.position)
    leftRailing.position.x += Math.cos(angle + Math.PI / 2) * (Config.bridges.width / 2)
    leftRailing.position.z += Math.sin(angle + Math.PI / 2) * (Config.bridges.width / 2)
    leftRailing.position.y = railingHeight / 2 + Config.bridges.height / 2
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
    rightRailing.position.x += Math.cos(angle - Math.PI / 2) * (Config.bridges.width / 2)
    rightRailing.position.z += Math.sin(angle - Math.PI / 2) * (Config.bridges.width / 2)
    rightRailing.position.y = railingHeight / 2 + Config.bridges.height / 2
    rightRailing.rotation.y = angle
    this.scene.add(rightRailing)
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
