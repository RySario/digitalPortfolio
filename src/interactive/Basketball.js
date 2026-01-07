/**
 * Interactive Basketball
 * Can be picked up and thrown
 */

import * as THREE from 'three'
import { GeometryUtils } from '../utils/GeometryUtils.js'
import { ColorPalettes } from '../utils/ColorPalettes.js'

export class Basketball {
  constructor(position) {
    this.position = position.clone()

    // Physics properties
    this.velocity = new THREE.Vector3()
    this.angularVelocity = new THREE.Vector3()
    this.gravity = 15
    this.bounceDamping = 0.6
    this.friction = 0.95

    // State
    this.isHeld = false
    this.isGrounded = false

    // Create mesh
    this.createMesh()
  }

  createMesh() {
    this.mesh = GeometryUtils.createSphere(0.6, ColorPalettes.basketball.primary, 10)
    this.mesh.position.copy(this.position)

    // Add userData for physics and interaction
    this.mesh.userData.interactive = true
    this.mesh.userData.physics = this
    this.mesh.userData.type = 'basketball'
    this.mesh.userData.canPickup = true
  }

  /**
   * Update basketball physics
   * @param {number} delta
   * @param {CollisionManager} collisionManager
   */
  update(delta, collisionManager) {
    if (this.isHeld) {
      // Don't apply physics when held
      return
    }

    // Apply gravity
    this.velocity.y -= this.gravity * delta

    // Apply friction
    this.velocity.x *= this.friction
    this.velocity.z *= this.friction

    // Calculate proposed position
    const proposedPos = this.mesh.position.clone()
    proposedPos.add(this.velocity.clone().multiplyScalar(delta))

    // Check ground collision
    if (collisionManager) {
      const groundHeight = collisionManager.getGroundHeight(proposedPos)

      if (groundHeight !== null && proposedPos.y - 0.6 <= groundHeight) {
        // Hit ground
        proposedPos.y = groundHeight + 0.6

        // Bounce
        if (Math.abs(this.velocity.y) > 0.5) {
          this.velocity.y = -this.velocity.y * this.bounceDamping
        } else {
          this.velocity.y = 0
          this.isGrounded = true
        }
      } else {
        this.isGrounded = false
      }
    }

    // Update position
    this.mesh.position.copy(proposedPos)

    // Apply angular velocity for spinning
    if (this.velocity.length() > 0.1) {
      this.mesh.rotation.x += this.velocity.z * delta * 2
      this.mesh.rotation.z -= this.velocity.x * delta * 2
    }
  }

  /**
   * Get mesh
   * @returns {THREE.Mesh}
   */
  getMesh() {
    return this.mesh
  }

  /**
   * Set held state
   * @param {boolean} held
   */
  setHeld(held) {
    this.isHeld = held
    if (!held) {
      // Reset velocity when released (will be set by throw)
      this.velocity.set(0, 0, 0)
    }
  }

  /**
   * Apply force (for throwing)
   * @param {THREE.Vector3} force
   */
  applyForce(force) {
    this.velocity.copy(force)
  }
}

export default Basketball
