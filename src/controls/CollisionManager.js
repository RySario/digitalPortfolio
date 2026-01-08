/**
 * Collision Manager
 * Handles collision detection for camera with ground and environment
 */

import * as THREE from 'three'
import { Config } from '../core/Config.js'
import { GeometryUtils } from '../utils/GeometryUtils.js'

export class CollisionManager {
  constructor(scene, camera) {
    this.scene = scene
    this.camera = camera
    this.raycaster = new THREE.Raycaster()

    // Collision settings
    this.playerRadius = Config.collision.playerRadius
    this.groundOffset = Config.collision.groundOffset
    this.groundCheckDistance = 100  // Increased for taller terrain

    // Collision meshes
    this.collisionMeshes = []
    this.islandBounds = []

    // Store island data for direct height lookups
    this.islands = []
  }

  /**
   * Register a mesh for collision detection
   * @param {THREE.Mesh} mesh
   */
  registerCollisionMesh(mesh) {
    // Update world matrix to ensure proper raycasting
    mesh.updateMatrixWorld(true)
    this.collisionMeshes.push(mesh)
  }

  /**
   * Register island for terrain height lookup
   * @param {Object} island - Island object with position, radius, and optional getTerrainHeightAt method
   */
  registerIsland(island) {
    this.islands.push({
      position: island.position.clone(),
      radius: island.radius || Config.islands.baseSize / 2,
      seed: island.seed || (island.position.x * 1000 + island.position.z),
      // Store reference to the island's custom height function if it exists
      getTerrainHeightAt: island.getTerrainHeightAt ? island.getTerrainHeightAt.bind(island) : null
    })
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

    // 1. Get ground height - try direct terrain calculation first (more reliable)
    let groundHeight = this.getTerrainHeightDirect(proposedPos)

    // If direct fails, try raycast
    if (groundHeight === null) {
      groundHeight = this.getGroundHeight(proposedPos)
    }

    if (groundHeight !== null) {
      // There's ground below - ALWAYS keep player above it
      const minY = groundHeight + this.groundOffset

      // If player is at or below ground level, snap to ground
      // Use small tolerance (0.1) to allow jumping to work
      if (proposedPos.y <= minY + 0.1) {
        result.position.y = minY
        result.grounded = true
      }

      // Safety check: if player would be below ground, force them up
      if (result.position.y < minY) {
        result.position.y = minY
        result.grounded = true
      }
    } else {
      // No ground found - player might be off islands, let them fall
      // But check current position too
      const currentGroundHeight = this.getTerrainHeightDirect(currentPos)
      if (currentGroundHeight !== null) {
        // There was ground at current pos, don't let them fall through
        const minY = currentGroundHeight + this.groundOffset
        if (proposedPos.y < minY) {
          result.position.y = minY
          result.grounded = true
        }
      }
    }

    // Safety floor - NEVER let player go below water level + 3
    const safetyFloor = Config.ocean.position.y + 3
    if (result.position.y < safetyFloor) {
      // Try to find ANY ground nearby
      const nearbyHeight = this.getTerrainHeightDirect(proposedPos) ||
                          this.getTerrainHeightDirect(currentPos)
      if (nearbyHeight !== null && nearbyHeight > safetyFloor) {
        result.position.y = nearbyHeight + this.groundOffset
        result.grounded = true
      }
    }

    // 2. Check horizontal collisions
    const horizontalCollision = this.checkHorizontalCollision(currentPos, proposedPos)
    if (horizontalCollision) {
      result.position.x = currentPos.x
      result.position.z = currentPos.z
      result.collided = true
    }

    return result
  }

  /**
   * Get terrain height directly using the terrain generation function
   * This bypasses raycasting issues
   * Uses island's custom getTerrainHeightAt() method if available for accurate heights
   * @param {THREE.Vector3} position
   * @returns {number|null}
   */
  getTerrainHeightDirect(position) {
    // Check central hub first
    const hubRadius = Config.centralHub.radius
    const distFromCenter = Math.sqrt(position.x * position.x + position.z * position.z)

    if (distFromCenter <= hubRadius) {
      const height = GeometryUtils.getTerrainHeight(position.x, position.z, hubRadius, hubRadius * 1000)
      if (height > -5) return height
    }

    // Check each island - use custom height function if available
    for (const island of this.islands) {
      const localX = position.x - island.position.x
      const localZ = position.z - island.position.z
      const distFromIsland = Math.sqrt(localX * localX + localZ * localZ)

      if (distFromIsland <= island.radius) {
        let height

        // Use island's custom height function if available (e.g., for flat basketball arena)
        if (island.getTerrainHeightAt) {
          height = island.getTerrainHeightAt(localX, localZ)
        } else {
          // Fall back to default terrain generation
          height = GeometryUtils.getTerrainHeight(localX, localZ, island.radius, island.seed)
        }

        if (height > -5) {
          return height + island.position.y
        }
      }
    }

    return null
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

    // Use recursive search to find meshes inside groups
    const intersects = this.raycaster.intersectObjects(this.collisionMeshes, true)

    if (intersects.length > 0) {
      // Find the highest ground point (in case of multiple intersections)
      let highestPoint = intersects[0].point.y
      for (const intersect of intersects) {
        if (intersect.point.y > highestPoint && intersect.point.y < position.y + 10) {
          highestPoint = intersect.point.y
        }
      }
      return highestPoint
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
