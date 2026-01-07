/**
 * Collision Manager
 * Handles collision detection for camera with ground and environment
 */

import * as THREE from 'three'
import { Config } from '../core/Config.js'

export class CollisionManager {
  constructor(scene, camera) {
    this.scene = scene
    this.camera = camera
    this.raycaster = new THREE.Raycaster()

    // Collision settings
    this.playerRadius = Config.collision.playerRadius
    this.groundOffset = Config.collision.groundOffset
    this.groundCheckDistance = Config.collision.groundCheckDistance

    // Collision meshes
    this.collisionMeshes = []
    this.islandBounds = []
  }

  /**
   * Register a mesh for collision detection
   * @param {THREE.Mesh} mesh
   */
  registerCollisionMesh(mesh) {
    this.collisionMeshes.push(mesh)
  }

  /**
   * Register island bounding box
   * @param {THREE.Box3} boundingBox
   * @param {string} islandName
   */
  registerIslandBounds(boundingBox, islandName) {
    this.islandBounds.push({
      box: boundingBox,
      name: islandName
    })
  }

  /**
   * Check collision and return validated position
   * @param {THREE.Vector3} currentPos
   * @param {THREE.Vector3} proposedPos
   * @returns {Object} { position: Vector3, grounded: boolean, collided: boolean }
   */
  checkCollision(currentPos, proposedPos) {
    const result = {
      position: proposedPos.clone(),
      grounded: false,
      collided: false
    }

    // 1. Check ground height
    const groundHeight = this.getGroundHeight(proposedPos)

    if (groundHeight !== null) {
      // There's ground below - keep camera above it
      const minY = groundHeight + this.groundOffset
      if (proposedPos.y < minY) {
        result.position.y = minY
        result.grounded = true
      }
    }

    // 2. Check horizontal collisions (simple approach for now)
    // This prevents moving through islands
    const horizontalCollision = this.checkHorizontalCollision(currentPos, proposedPos)
    if (horizontalCollision) {
      result.position.x = currentPos.x
      result.position.z = currentPos.z
      result.collided = true
    }

    return result
  }

  /**
   * Get ground height at position using raycast
   * @param {THREE.Vector3} position
   * @returns {number|null}
   */
  getGroundHeight(position) {
    // Cast ray downward from high above the position
    const rayOrigin = new THREE.Vector3(
      position.x,
      this.groundCheckDistance,
      position.z
    )
    const rayDirection = new THREE.Vector3(0, -1, 0)

    this.raycaster.set(rayOrigin, rayDirection)
    this.raycaster.far = this.groundCheckDistance * 2

    const intersects = this.raycaster.intersectObjects(this.collisionMeshes, false)

    if (intersects.length > 0) {
      return intersects[0].point.y
    }

    return null
  }

  /**
   * Check horizontal collision with islands
   * @param {THREE.Vector3} from
   * @param {THREE.Vector3} to
   * @returns {boolean}
   */
  checkHorizontalCollision(from, to) {
    // Simple bounding box check
    // Check if the proposed position puts camera inside any island bounds

    const playerBox = new THREE.Box3(
      new THREE.Vector3(
        to.x - this.playerRadius,
        to.y - this.playerRadius,
        to.z - this.playerRadius
      ),
      new THREE.Vector3(
        to.x + this.playerRadius,
        to.y + this.playerRadius,
        to.z + this.playerRadius
      )
    )

    // Check against each island's bounds
    for (const islandBound of this.islandBounds) {
      if (playerBox.intersectsBox(islandBound.box)) {
        // Check if we're trying to move into the island from outside
        // Allow if we're already inside (to prevent getting stuck)
        const currentBox = new THREE.Box3(
          new THREE.Vector3(
            from.x - this.playerRadius,
            from.y - this.playerRadius,
            from.z - this.playerRadius
          ),
          new THREE.Vector3(
            from.x + this.playerRadius,
            from.y + this.playerRadius,
            from.z + this.playerRadius
          )
        )

        // If we weren't colliding before but are now, block movement
        if (!currentBox.intersectsBox(islandBound.box)) {
          return true
        }
      }
    }

    return false
  }

  /**
   * Get all collision meshes
   * @returns {Array}
   */
  getCollisionMeshes() {
    return this.collisionMeshes
  }
}

export default CollisionManager
