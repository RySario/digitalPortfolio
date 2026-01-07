/**
 * Flying Camera Controls
 * WASD movement with mouse look (pointer lock)
 * Velocity-based movement with smooth acceleration and damping
 */

import * as THREE from 'three'
import { Config } from '../core/Config.js'

export class FlyingControls {
  constructor(camera, domElement) {
    this.camera = camera
    this.domElement = domElement

    // Movement state
    this.moveForward = false
    this.moveBackward = false
    this.moveLeft = false
    this.moveRight = false
    this.moveUp = false
    this.moveDown = false

    // Movement parameters (from config)
    this.velocity = new THREE.Vector3()
    this.acceleration = Config.controls.acceleration
    this.maxSpeed = Config.controls.maxSpeed
    this.damping = Config.controls.damping
    this.mouseSensitivity = Config.controls.mouseSensitivity

    // Height limits
    this.minHeight = Config.controls.minHeight
    this.maxHeight = Config.controls.maxHeight

    // Camera rotation
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ')
    this.euler.setFromQuaternion(camera.quaternion)

    // Pointer lock state
    this.isLocked = false

    this.setupEventListeners()
  }

  setupEventListeners() {
    // Keyboard events
    document.addEventListener('keydown', (e) => this.onKeyDown(e))
    document.addEventListener('keyup', (e) => this.onKeyUp(e))

    // Pointer lock events
    this.domElement.addEventListener('click', () => this.requestPointerLock())
    document.addEventListener('pointerlockchange', () => this.onPointerLockChange())
    document.addEventListener('pointerlockerror', () => this.onPointerLockError())

    // Mouse movement (only when pointer is locked)
    document.addEventListener('mousemove', (e) => this.onMouseMove(e))
  }

  requestPointerLock() {
    this.domElement.requestPointerLock()
  }

  onPointerLockChange() {
    if (document.pointerLockElement === this.domElement) {
      this.isLocked = true
      console.log('Pointer locked')
    } else {
      this.isLocked = false
      console.log('Pointer unlocked')
    }
  }

  onPointerLockError() {
    console.error('Pointer lock error')
  }

  onKeyDown(event) {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = true
        break
      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = true
        break
      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = true
        break
      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = true
        break
      case 'Space':
        this.moveUp = true
        break
      case 'ShiftLeft':
      case 'ShiftRight':
        this.moveDown = true
        break
    }
  }

  onKeyUp(event) {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = false
        break
      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = false
        break
      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = false
        break
      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = false
        break
      case 'Space':
        this.moveUp = false
        break
      case 'ShiftLeft':
      case 'ShiftRight':
        this.moveDown = false
        break
    }
  }

  onMouseMove(event) {
    if (!this.isLocked) return

    const movementX = event.movementX || 0
    const movementY = event.movementY || 0

    // Update rotation based on mouse movement
    this.euler.y -= movementX * this.mouseSensitivity
    this.euler.x -= movementY * this.mouseSensitivity

    // Limit vertical rotation (prevent camera flip)
    this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x))

    this.camera.quaternion.setFromEuler(this.euler)
  }

  /**
   * Update controls and return proposed position
   * @param {number} delta - Time delta in seconds
   * @returns {THREE.Vector3} Proposed new position
   */
  update(delta) {
    // Calculate acceleration direction
    const direction = new THREE.Vector3()
    const forward = new THREE.Vector3()
    const right = new THREE.Vector3()

    this.camera.getWorldDirection(forward)
    right.crossVectors(forward, this.camera.up)

    // Horizontal movement
    if (this.moveForward) direction.add(forward)
    if (this.moveBackward) direction.sub(forward)
    if (this.moveRight) direction.add(right)
    if (this.moveLeft) direction.sub(right)

    // Normalize horizontal direction
    if (direction.length() > 0) {
      direction.normalize()
    }

    // Apply acceleration
    const accelerationVector = direction.multiplyScalar(this.acceleration * delta)
    this.velocity.add(accelerationVector)

    // Vertical movement (independent of camera direction)
    if (this.moveUp) {
      this.velocity.y += this.acceleration * delta
    }
    if (this.moveDown) {
      this.velocity.y -= this.acceleration * delta
    }

    // Apply damping
    this.velocity.multiplyScalar(this.damping)

    // Limit max speed
    const horizontalVel = new THREE.Vector2(this.velocity.x, this.velocity.z)
    if (horizontalVel.length() > this.maxSpeed) {
      horizontalVel.normalize().multiplyScalar(this.maxSpeed)
      this.velocity.x = horizontalVel.x
      this.velocity.z = horizontalVel.y
    }

    // Limit vertical speed
    this.velocity.y = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.velocity.y))

    // Calculate proposed new position
    const proposedPosition = this.camera.position.clone()
    proposedPosition.add(this.velocity.clone().multiplyScalar(delta))

    // Clamp height
    proposedPosition.y = Math.max(
      this.minHeight,
      Math.min(this.maxHeight, proposedPosition.y)
    )

    return proposedPosition
  }

  /**
   * Dispose of event listeners
   */
  dispose() {
    document.removeEventListener('keydown', this.onKeyDown)
    document.removeEventListener('keyup', this.onKeyUp)
    document.removeEventListener('mousemove', this.onMouseMove)
    document.removeEventListener('pointerlockchange', this.onPointerLockChange)
    document.removeEventListener('pointerlockerror', this.onPointerLockError)
  }
}

export default FlyingControls
