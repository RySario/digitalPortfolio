/**
 * Interactive Go-Kart
 * Drivable electric kart vehicle
 */

import * as THREE from 'three'
import { GeometryUtils } from '../utils/GeometryUtils.js'
import { ColorPalettes } from '../utils/ColorPalettes.js'

export class GoKart {
  constructor(position) {
    this.position = position.clone()

    // Vehicle physics
    this.velocity = new THREE.Vector3()
    this.rotation = 0
    this.speed = 0
    this.maxSpeed = 20
    this.acceleration = 12
    this.deceleration = 8
    this.turnSpeed = 2.5
    this.friction = 0.95

    // State
    this.isDriving = false
    this.driver = null

    // Controls
    this.accelerating = false
    this.braking = false
    this.turningLeft = false
    this.turningRight = false

    // Create mesh
    this.createMesh()
  }

  createMesh() {
    this.group = new THREE.Group()
    this.group.position.copy(this.position)

    // Main body
    const body = GeometryUtils.createBox(2, 0.6, 1.2, ColorPalettes.karting.primary)
    body.position.y = 0.5
    this.group.add(body)

    // Seat
    const seat = GeometryUtils.createBox(0.8, 0.3, 0.8, ColorPalettes.karting.secondary)
    seat.position.y = 0.95
    this.group.add(seat)

    // Steering wheel
    const steeringWheel = GeometryUtils.createCylinder(0.3, 0.3, 0.05, ColorPalettes.common.black, 8)
    steeringWheel.rotation.z = Math.PI / 2
    steeringWheel.position.set(0, 1.1, 0.3)
    this.group.add(steeringWheel)
    this.steeringWheel = steeringWheel

    // Front wheels
    const frontLeftWheel = this.createWheel()
    frontLeftWheel.position.set(-0.7, 0.25, 0.7)
    this.group.add(frontLeftWheel)

    const frontRightWheel = this.createWheel()
    frontRightWheel.position.set(0.7, 0.25, 0.7)
    this.group.add(frontRightWheel)

    // Back wheels
    const backLeftWheel = this.createWheel()
    backLeftWheel.position.set(-0.7, 0.25, -0.5)
    this.group.add(backLeftWheel)

    const backRightWheel = this.createWheel()
    backRightWheel.position.set(0.7, 0.25, -0.5)
    this.group.add(backRightWheel)

    // Store wheel references for animation
    this.wheels = [frontLeftWheel, frontRightWheel, backLeftWheel, backRightWheel]

    // Front bumper
    const bumper = GeometryUtils.createBox(2.2, 0.2, 0.2, ColorPalettes.common.black)
    bumper.position.set(0, 0.3, 0.9)
    this.group.add(bumper)

    // Add userData for interaction
    this.group.userData.interactive = true
    this.group.userData.type = 'gokart'
    this.group.userData.canDrive = true
    this.group.userData.vehicle = this

    // Enable shadows
    this.group.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }

  createWheel() {
    const group = new THREE.Group()

    // Tire (black)
    const tire = GeometryUtils.createCylinder(0.3, 0.3, 0.25, ColorPalettes.common.black, 8)
    tire.rotation.z = Math.PI / 2
    group.add(tire)

    // Rim (silver)
    const rim = GeometryUtils.createCylinder(0.15, 0.15, 0.26, 0xC0C0C0, 6)
    rim.rotation.z = Math.PI / 2
    group.add(rim)

    return group
  }

  /**
   * Update kart physics and controls
   * @param {number} delta
   * @param {CollisionManager} collisionManager
   */
  update(delta, collisionManager) {
    if (!this.isDriving) {
      // Not being driven - just static
      return
    }

    // Handle controls
    if (this.accelerating) {
      this.speed += this.acceleration * delta
    } else if (this.braking) {
      this.speed -= this.deceleration * delta
    } else {
      // Natural deceleration
      this.speed *= this.friction
    }

    // Clamp speed
    this.speed = Math.max(-this.maxSpeed * 0.5, Math.min(this.maxSpeed, this.speed))

    // Handle turning (only when moving)
    if (Math.abs(this.speed) > 0.5) {
      if (this.turningLeft) {
        this.rotation += this.turnSpeed * delta * (this.speed / this.maxSpeed)
      }
      if (this.turningRight) {
        this.rotation -= this.turnSpeed * delta * (this.speed / this.maxSpeed)
      }
    }

    // Calculate movement
    const forward = new THREE.Vector3(
      Math.sin(this.rotation),
      0,
      Math.cos(this.rotation)
    )

    this.velocity.copy(forward.multiplyScalar(this.speed))

    // Calculate proposed position
    const proposedPos = this.group.position.clone()
    proposedPos.add(this.velocity.clone().multiplyScalar(delta))

    // Check ground collision
    if (collisionManager) {
      const groundHeight = collisionManager.getGroundHeight(proposedPos)
      if (groundHeight !== null) {
        proposedPos.y = groundHeight + 0.5
      }
    }

    // Update position and rotation
    this.group.position.copy(proposedPos)
    this.group.rotation.y = this.rotation

    // Animate wheels
    this.animateWheels(delta)

    // Animate steering wheel
    let steerAngle = 0
    if (this.turningLeft) steerAngle = Math.PI / 6
    if (this.turningRight) steerAngle = -Math.PI / 6
    this.steeringWheel.rotation.y = steerAngle
  }

  animateWheels(delta) {
    // Rotate wheels based on speed
    const rotation = this.speed * delta * 0.5
    this.wheels.forEach(wheel => {
      wheel.rotation.x += rotation
    })
  }

  /**
   * Enter the kart
   * @param {Player} player
   */
  enterKart(player) {
    this.isDriving = true
    this.driver = player

    // Hide player
    if (player.getMesh()) {
      player.getMesh().visible = false
    }
  }

  /**
   * Exit the kart
   */
  exitKart() {
    this.isDriving = false

    // Show player
    if (this.driver && this.driver.getMesh()) {
      this.driver.getMesh().visible = true

      // Position player next to kart
      const exitPos = this.group.position.clone()
      const right = new THREE.Vector3(
        Math.cos(this.rotation),
        0,
        -Math.sin(this.rotation)
      )
      exitPos.add(right.multiplyScalar(2))
      this.driver.setPosition(exitPos)
    }

    this.driver = null

    // Reset controls
    this.accelerating = false
    this.braking = false
    this.turningLeft = false
    this.turningRight = false
  }

  /**
   * Set control input
   * @param {string} control - 'accelerate', 'brake', 'left', 'right'
   * @param {boolean} active
   */
  setControl(control, active) {
    switch (control) {
      case 'accelerate':
        this.accelerating = active
        break
      case 'brake':
        this.braking = active
        break
      case 'left':
        this.turningLeft = active
        break
      case 'right':
        this.turningRight = active
        break
    }
  }

  /**
   * Get kart mesh group
   * @returns {THREE.Group}
   */
  getMesh() {
    return this.group
  }

  /**
   * Get kart position
   * @returns {THREE.Vector3}
   */
  getPosition() {
    return this.group.position.clone()
  }
}

export default GoKart
