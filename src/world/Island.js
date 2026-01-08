/**
 * Base Island class
 * Abstract class for all themed islands
 */

import * as THREE from 'three'
import { GeometryUtils } from '../utils/GeometryUtils.js'
import { Config } from '../core/Config.js'

export class Island {
  constructor(position) {
    this.position = position
    this.group = new THREE.Group()
    this.group.position.copy(position)

    // Island properties (can be overridden in subclasses)
    this.size = Config.islands.baseSize
    this.height = Config.islands.baseHeight
    this.color = 0x8BC34A  // Default green
    this.segments = Config.islands.segments
    this.radius = this.size / 2
    this.seed = position.x * 1000 + position.z

    // References
    this.decorations = []
    this.mediaFrames = []
    this.animals = []
    this.collisionMesh = null
    this.boundingBox = null
    this.rocks = []
  }

  /**
   * Build the island and add to scene
   * @param {THREE.Scene} scene
   * @param {CollisionManager} collisionManager
   */
  async build(scene, collisionManager) {
    this.scene = scene
    this.collisionManager = collisionManager

    this.createTerrain()
    this.addTerrainRocks()
    this.createDecorations()
    await this.createMediaFrames()

    scene.add(this.group)

    // Register collision
    if (collisionManager) {
      if (this.collisionMesh) {
        collisionManager.registerCollisionMesh(this.collisionMesh)
        collisionManager.registerIslandBounds(this.boundingBox, this.getName())
      }
      // Register island for direct terrain height lookup
      collisionManager.registerIsland(this)
    }
  }

  /**
   * Get terrain height at local position
   * @param {number} localX - Local X coordinate
   * @param {number} localZ - Local Z coordinate
   * @returns {number} Terrain height
   */
  getTerrainHeightAt(localX, localZ) {
    return GeometryUtils.getTerrainHeight(localX, localZ, this.radius, this.seed || this.radius * 1000)
  }

  /**
   * Create the island terrain geometry with textured hills
   */
  createTerrain() {
    // Store seed for consistent terrain height lookups
    this.seed = this.radius * 1000

    // Use the new textured island with vertex colors for varied terrain
    const mesh = GeometryUtils.createTexturedIsland(this.radius, this.segments)
    mesh.position.y = 0

    this.group.add(mesh)

    // Set as collision mesh
    this.collisionMesh = mesh

    // Create bounding box for collision
    this.boundingBox = new THREE.Box3().setFromObject(mesh)
  }

  /**
   * Add natural rocks scattered across the terrain
   */
  addTerrainRocks() {
    const rockCount = Math.floor(this.radius * 0.8)

    for (let i = 0; i < rockCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist = Math.random() * this.radius * 0.85
      const localX = Math.cos(angle) * dist
      const localZ = Math.sin(angle) * dist

      const terrainHeight = this.getTerrainHeightAt(localX, localZ)

      // Only place rocks on valid terrain (not underwater)
      if (terrainHeight < 3) continue

      // Random rock size
      const scale = 0.3 + Math.random() * 0.8

      // Create rock with varied colors
      const rockColors = [0x696969, 0x808080, 0x5F5F5F, 0x707070, 0x606060]
      const rockColor = rockColors[Math.floor(Math.random() * rockColors.length)]

      const rock = GeometryUtils.createLowPolyRock(scale, rockColor)
      rock.position.set(localX, terrainHeight - scale * 0.3, localZ)
      rock.rotation.y = Math.random() * Math.PI * 2
      rock.rotation.x = (Math.random() - 0.5) * 0.3
      rock.rotation.z = (Math.random() - 0.5) * 0.3

      this.group.add(rock)
      this.rocks.push(rock)
    }
  }

  /**
   * Create island decorations
   * Override in subclasses
   */
  createDecorations() {
    // Override in subclass
  }

  /**
   * Create media frames for this island
   * Override in subclasses
   */
  async createMediaFrames() {
    // Override in subclass
  }

  /**
   * Get island name
   * Override in subclasses
   * @returns {string}
   */
  getName() {
    return 'Island'
  }

  /**
   * Add a decoration to the island, automatically positioned on terrain
   * @param {THREE.Object3D} object
   * @param {number} x - Local x position
   * @param {number} y - Height offset above terrain (or absolute if useAbsoluteY is true)
   * @param {number} z - Local z position
   * @param {boolean} useAbsoluteY - If true, use y as absolute position instead of terrain-relative
   */
  addDecoration(object, x = 0, y = 0, z = 0, useAbsoluteY = false) {
    if (useAbsoluteY) {
      object.position.set(x, y, z)
    } else {
      // Get terrain height and place object on top
      const terrainHeight = this.getTerrainHeightAt(x, z)
      object.position.set(x, terrainHeight + y, z)
    }
    this.group.add(object)
    this.decorations.push(object)
  }

  /**
   * Add a decoration at absolute position (legacy compatibility)
   * @param {THREE.Object3D} object
   * @param {number} x - Local x position
   * @param {number} y - Absolute y position
   * @param {number} z - Local z position
   */
  addDecorationAbsolute(object, x = 0, y = 0, z = 0) {
    this.addDecoration(object, x, y, z, true)
  }

  /**
   * Add a media frame to the island
   * @param {MediaFrame} mediaFrame
   */
  addMediaFrame(mediaFrame) {
    if (mediaFrame && mediaFrame.mesh) {
      this.mediaFrames.push(mediaFrame)
    }
  }
}

export default Island
