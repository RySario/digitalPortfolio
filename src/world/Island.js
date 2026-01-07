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

    // References
    this.decorations = []
    this.mediaFrames = []
    this.animals = []
    this.collisionMesh = null
    this.boundingBox = null
  }

  /**
   * Build the island and add to scene
   * @param {THREE.Scene} scene
   * @param {CollisionManager} collisionManager
   */
  async build(scene, collisionManager) {
    this.createTerrain()
    this.createDecorations()
    await this.createMediaFrames()

    scene.add(this.group)

    // Register collision
    if (collisionManager && this.collisionMesh) {
      collisionManager.registerCollisionMesh(this.collisionMesh)
      collisionManager.registerIslandBounds(this.boundingBox, this.getName())
    }
  }

  /**
   * Create the island terrain geometry
   */
  createTerrain() {
    const geometry = GeometryUtils.createLowPolyIsland(this.size / 2, this.segments)
    const material = new THREE.MeshStandardMaterial({
      color: this.color,
      flatShading: true
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.y = 0
    mesh.castShadow = true
    mesh.receiveShadow = true

    this.group.add(mesh)

    // Set as collision mesh
    this.collisionMesh = mesh

    // Create bounding box for collision
    this.boundingBox = new THREE.Box3().setFromObject(mesh)
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
   * Add a decoration to the island
   * @param {THREE.Object3D} object
   * @param {number} x - Local x position
   * @param {number} y - Local y position
   * @param {number} z - Local z position
   */
  addDecoration(object, x = 0, y = 0, z = 0) {
    object.position.set(x, y, z)
    this.group.add(object)
    this.decorations.push(object)
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
