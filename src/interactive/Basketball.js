/**
 * Interactive Basketball
 * Can be picked up and thrown with realistic physics
 * Detects scoring through hoops
 */

import * as THREE from 'three'
import { GeometryUtils } from '../utils/GeometryUtils.js'
import { ColorPalettes } from '../utils/ColorPalettes.js'

export class Basketball {
  constructor(position) {
    this.position = position.clone()
    this.spawnPosition = position.clone()  // Remember spawn for respawn

    // Physics properties
    this.velocity = new THREE.Vector3()
    this.angularVelocity = new THREE.Vector3()
    this.gravity = 25
    this.bounceDamping = 0.7
    this.friction = 0.98
    this.airResistance = 0.995
    this.radius = 0.35

    // State
    this.isHeld = false
    this.isGrounded = false
    this.lastPosition = position.clone()

    // Scoring
    this.hoopPositions = []
    this.lastScoreTime = 0
    this.scoreCooldown = 1000  // ms between scores
    this.onScore = null  // Callback for scoring

    // Create mesh
    this.createMesh()
  }

  createMesh() {
    const group = new THREE.Group()

    // Main basketball sphere with high detail
    const ballGeom = new THREE.SphereGeometry(this.radius, 32, 32)
    const ballMat = new THREE.MeshStandardMaterial({
      color: 0xFF6B35,  // Orange
      roughness: 0.6,
      metalness: 0.1
    })
    const ball = new THREE.Mesh(ballGeom, ballMat)
    ball.castShadow = true
    group.add(ball)

    // Black seam lines on basketball
    this.createSeamLines(group)

    group.position.copy(this.position)

    this.mesh = group

    // Add userData for physics and interaction
    this.mesh.userData.interactive = true
    this.mesh.userData.physics = this
    this.mesh.userData.type = 'basketball'
    this.mesh.userData.canPickup = true
  }

  /**
   * Create black seam lines on the basketball
   */
  createSeamLines(group) {
    const seamMat = new THREE.MeshBasicMaterial({ color: 0x111111 })

    // Horizontal seam (equator)
    const horizontalGeom = new THREE.TorusGeometry(this.radius * 1.001, 0.008, 8, 48)
    const horizontal = new THREE.Mesh(horizontalGeom, seamMat)
    horizontal.rotation.x = Math.PI / 2
    group.add(horizontal)

    // Vertical seam
    const verticalGeom = new THREE.TorusGeometry(this.radius * 1.001, 0.008, 8, 48)
    const vertical = new THREE.Mesh(verticalGeom, seamMat)
    group.add(vertical)

    // Two curved seams (perpendicular)
    const curveGeom = new THREE.TorusGeometry(this.radius * 1.001, 0.008, 8, 48)
    const curve1 = new THREE.Mesh(curveGeom, seamMat)
    curve1.rotation.y = Math.PI / 2
    group.add(curve1)
  }

  /**
   * Register hoop positions for scoring detection
   * @param {Array} hoops - Array of {position: Vector3, direction: number}
   */
  registerHoops(hoops) {
    this.hoopPositions = hoops
  }

  /**
   * Set score callback
   * @param {Function} callback
   */
  setScoreCallback(callback) {
    this.onScore = callback
  }

  /**
   * Update basketball physics
   * @param {number} delta
   * @param {CollisionManager} collisionManager
   */
  update(delta, collisionManager) {
    if (this.isHeld) {
      return
    }

    // Store last position for scoring detection
    this.lastPosition.copy(this.mesh.position)

    // Apply gravity
    this.velocity.y -= this.gravity * delta

    // Apply air resistance
    this.velocity.multiplyScalar(this.airResistance)

    // Calculate proposed position
    const proposedPos = this.mesh.position.clone()
    proposedPos.add(this.velocity.clone().multiplyScalar(delta))

    // Check ground collision
    if (collisionManager) {
      // Try direct terrain height first
      let groundHeight = null
      if (collisionManager.getTerrainHeightDirect) {
        groundHeight = collisionManager.getTerrainHeightDirect(proposedPos)
      }
      if (groundHeight === null) {
        groundHeight = collisionManager.getGroundHeight(proposedPos)
      }

      if (groundHeight !== null && proposedPos.y - this.radius <= groundHeight) {
        // Hit ground
        proposedPos.y = groundHeight + this.radius

        // Bounce
        if (Math.abs(this.velocity.y) > 1) {
          this.velocity.y = -this.velocity.y * this.bounceDamping

          // Add some horizontal friction on bounce
          this.velocity.x *= this.friction
          this.velocity.z *= this.friction

          // Add random spin on bounce
          this.angularVelocity.x += (Math.random() - 0.5) * 2
          this.angularVelocity.z += (Math.random() - 0.5) * 2
        } else {
          this.velocity.y = 0
          this.isGrounded = true

          // Rolling friction
          this.velocity.x *= 0.95
          this.velocity.z *= 0.95
        }
      } else {
        this.isGrounded = false
      }
    }

    // Check if ball went out of bounds (fell in water)
    if (proposedPos.y < -5) {
      this.respawn()
      return
    }

    // Update position
    this.mesh.position.copy(proposedPos)

    // Apply rotation based on velocity and angular velocity
    if (this.velocity.length() > 0.1 || this.angularVelocity.length() > 0.1) {
      // Rolling rotation (based on movement)
      this.mesh.rotation.x += this.velocity.z * delta * 3
      this.mesh.rotation.z -= this.velocity.x * delta * 3

      // Spin rotation (from angular velocity)
      this.mesh.rotation.x += this.angularVelocity.x * delta
      this.mesh.rotation.y += this.angularVelocity.y * delta
      this.mesh.rotation.z += this.angularVelocity.z * delta

      // Decay angular velocity
      this.angularVelocity.multiplyScalar(0.98)
    }

    // Check for scoring
    this.checkScoring()
  }

  /**
   * Check if ball went through any hoop
   */
  checkScoring() {
    const now = Date.now()
    if (now - this.lastScoreTime < this.scoreCooldown) {
      return
    }

    for (const hoop of this.hoopPositions) {
      const hoopPos = hoop.position

      // Get ball's current and last positions
      const currentPos = this.mesh.position
      const lastPos = this.lastPosition

      // Check if ball crossed through the rim plane (horizontal check)
      const rimRadius = 0.23  // Must match the rim size in BasketballIsland

      // Ball must be moving downward
      if (this.velocity.y >= 0) continue

      // Check if ball crossed the rim height (y position)
      const rimY = hoopPos.y
      if (lastPos.y > rimY && currentPos.y <= rimY) {
        // Ball crossed through rim height - check if within rim circle
        const dx = currentPos.x - hoopPos.x
        const dz = currentPos.z - hoopPos.z
        const horizontalDist = Math.sqrt(dx * dx + dz * dz)

        if (horizontalDist < rimRadius) {
          // SCORE!
          this.lastScoreTime = now
          console.log('SCORE! Basketball went through the hoop!')

          if (this.onScore) {
            this.onScore()
          }

          // Add celebration effect (spin the ball)
          this.angularVelocity.y += 10
          break
        }
      }
    }
  }

  /**
   * Respawn ball at original position
   */
  respawn() {
    this.mesh.position.copy(this.spawnPosition)
    this.velocity.set(0, 0, 0)
    this.angularVelocity.set(0, 0, 0)
    this.isGrounded = false
    console.log('Basketball respawned')
  }

  /**
   * Get mesh
   * @returns {THREE.Group}
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
      this.angularVelocity.set(0, 0, 0)
    }
  }

  /**
   * Apply force (for throwing)
   * @param {THREE.Vector3} force
   */
  applyForce(force) {
    this.velocity.copy(force)

    // Add some backspin for realistic arc
    const spinAmount = force.length() * 0.3
    this.angularVelocity.set(
      -spinAmount,  // Backspin
      (Math.random() - 0.5) * spinAmount * 0.3,  // Slight side spin
      0
    )
  }

  /**
   * Shoot the ball with an arc toward a target
   * @param {THREE.Vector3} targetPosition - Where to aim
   * @param {number} power - Shot power (0-1)
   */
  shootAt(targetPosition, power = 0.7) {
    const currentPos = this.mesh.position.clone()
    const direction = targetPosition.clone().sub(currentPos)

    // Calculate distance
    const distance = direction.length()

    // Calculate velocity needed for arc shot
    const horizontalDist = Math.sqrt(direction.x * direction.x + direction.z * direction.z)
    const heightDiff = targetPosition.y - currentPos.y

    // Initial velocity components
    const angle = Math.PI / 4 + (1 - power) * 0.2  // 45 degrees + adjustment
    const speed = Math.sqrt(this.gravity * horizontalDist / Math.sin(2 * angle)) * power * 1.2

    // Normalize horizontal direction
    direction.y = 0
    direction.normalize()

    // Set velocity
    this.velocity.set(
      direction.x * speed * Math.cos(angle),
      speed * Math.sin(angle),
      direction.z * speed * Math.cos(angle)
    )

    // Add backspin
    this.angularVelocity.set(-5, 0, 0)

    this.isHeld = false
    this.isGrounded = false
  }

  /**
   * Get current position
   * @returns {THREE.Vector3}
   */
  getPosition() {
    return this.mesh.position.clone()
  }
}

export default Basketball
