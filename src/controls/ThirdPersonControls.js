/**
 * Third Person Controls
 * Controls player character with WASD and camera with mouse
 * Camera orbits around player with smooth following
 */

import * as THREE from 'three'
import { Config } from '../core/Config.js'

export class ThirdPersonControls {
  constructor(player, camera, domElement) {
    this.player = player
    this.camera = camera
    this.domElement = domElement

    // Movement state
    this.moveForward = false
    this.moveBackward = false
    this.moveLeft = false
    this.moveRight = false
    this.isRunning = false

    // Camera orbit angles (spherical coordinates)
    this.cameraYaw = 0       // Horizontal rotation around player
    this.cameraPitch = 0.3   // Vertical angle (0 = level, positive = looking down)

    // Player rotation - character faces movement direction
    this.targetPlayerRotation = 0
    this.currentPlayerRotation = 0

    // Movement parameters
    this.speed = Config.controls.maxSpeed
    this.runSpeed = Config.controls.runSpeed
    this.rotationSpeed = 8  // Faster rotation for responsive feel
    this.mouseSensitivity = 0.003

    // Camera parameters
    this.cameraDistance = Config.camera.thirdPerson.distance
    this.cameraHeight = Config.camera.thirdPerson.height
    this.cameraSmoothness = 0.1  // Camera lerp speed

    // Target camera position for smoothing
    this.targetCameraPos = new THREE.Vector3()

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

    // Mouse movement
    document.addEventListener('mousemove', (e) => this.onMouseMove(e))
  }

  requestPointerLock() {
    this.domElement.requestPointerLock()
  }

  onPointerLockChange() {
    if (document.pointerLockElement === this.domElement) {
      this.isLocked = true
      console.log('Controls active - WASD to move, Mouse to look, Shift to run, Space to jump')
    } else {
      this.isLocked = false
      console.log('Controls inactive - Click to activate')
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
        if (this.interactiveManager && this.interactiveManager.isDriving()) {
          this.interactiveManager.handleVehicleControl('accelerate', true)
        }
        break
      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = true
        if (this.interactiveManager && this.interactiveManager.isDriving()) {
          this.interactiveManager.handleVehicleControl('brake', true)
        }
        break
      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = true
        if (this.interactiveManager && this.interactiveManager.isDriving()) {
          this.interactiveManager.handleVehicleControl('left', true)
        }
        break
      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = true
        if (this.interactiveManager && this.interactiveManager.isDriving()) {
          this.interactiveManager.handleVehicleControl('right', true)
        }
        break
      case 'ShiftLeft':
      case 'ShiftRight':
        this.isRunning = true
        break
      case 'Space':
        this.player.jump()
        event.preventDefault()
        break
      case 'KeyE':
        // Interact/pickup
        this.onInteract()
        break
      case 'KeyF':
        // Throw/drop
        this.onThrow()
        break
    }
  }

  onKeyUp(event) {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = false
        if (this.interactiveManager && this.interactiveManager.isDriving()) {
          this.interactiveManager.handleVehicleControl('accelerate', false)
        }
        break
      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = false
        if (this.interactiveManager && this.interactiveManager.isDriving()) {
          this.interactiveManager.handleVehicleControl('brake', false)
        }
        break
      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = false
        if (this.interactiveManager && this.interactiveManager.isDriving()) {
          this.interactiveManager.handleVehicleControl('left', false)
        }
        break
      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = false
        if (this.interactiveManager && this.interactiveManager.isDriving()) {
          this.interactiveManager.handleVehicleControl('right', false)
        }
        break
      case 'ShiftLeft':
      case 'ShiftRight':
        this.isRunning = false
        break
    }
  }

  onMouseMove(event) {
    if (!this.isLocked) return

    const movementX = event.movementX || 0
    const movementY = event.movementY || 0

    // Update camera orbit angles
    this.cameraYaw -= movementX * this.mouseSensitivity
    this.cameraPitch += movementY * this.mouseSensitivity

    // Limit vertical angle (don't go below ground or too high)
    this.cameraPitch = Math.max(0.1, Math.min(1.2, this.cameraPitch))
  }

  onInteract() {
    // Will be connected to InteractiveObjectManager
    if (this.interactiveManager) {
      this.interactiveManager.interact()
    }
  }

  onThrow() {
    // Throw held object
    if (this.player.isHoldingObject) {
      const forward = this.player.getForwardDirection()
      forward.y = 0.3  // Slight upward angle
      forward.normalize()
      this.player.throwObject(forward, Config.interaction.throwForce)
    }
  }

  /**
   * Set interactive manager reference
   * @param {InteractiveObjectManager} manager
   */
  setInteractiveManager(manager) {
    this.interactiveManager = manager
  }

  /**
   * Update controls and camera
   * @param {number} delta
   * @returns {THREE.Vector3} Proposed player position
   */
  update(delta) {
    // Calculate movement direction based on camera yaw (relative to camera view)
    const moveDirection = new THREE.Vector3()

    // Forward is the direction the camera is facing (horizontally)
    const forward = new THREE.Vector3(
      -Math.sin(this.cameraYaw),
      0,
      -Math.cos(this.cameraYaw)
    )

    // Right is perpendicular to forward
    const right = new THREE.Vector3(
      -Math.cos(this.cameraYaw),
      0,
      Math.sin(this.cameraYaw)
    )

    // Build movement vector from input
    if (this.moveForward) moveDirection.add(forward)
    if (this.moveBackward) moveDirection.sub(forward)
    if (this.moveRight) moveDirection.add(right)
    if (this.moveLeft) moveDirection.sub(right)

    // Apply movement
    if (moveDirection.lengthSq() > 0) {
      moveDirection.normalize()

      // Set player rotation to face movement direction
      this.targetPlayerRotation = Math.atan2(moveDirection.x, moveDirection.z)

      // Apply speed
      const currentSpeed = this.isRunning ? this.runSpeed : this.speed
      moveDirection.multiplyScalar(currentSpeed * delta)

      // Store velocity for animation
      this.player.velocity.x = moveDirection.x
      this.player.velocity.z = moveDirection.z
    } else {
      // Not moving - clear horizontal velocity
      this.player.velocity.x = 0
      this.player.velocity.z = 0
    }

    // Smoothly rotate player to face movement direction
    let rotationDiff = this.targetPlayerRotation - this.currentPlayerRotation

    // Handle angle wrapping (-PI to PI)
    while (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2
    while (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2

    this.currentPlayerRotation += rotationDiff * this.rotationSpeed * delta
    this.player.setRotation(this.currentPlayerRotation)

    // Calculate proposed position
    const currentPos = this.player.getPosition()
    const proposedPos = currentPos.clone().add(moveDirection)

    // Apply gravity to Y if not grounded
    if (!this.player.isGrounded) {
      proposedPos.y += this.player.velocity.y * delta
    }

    // Update camera
    this.updateCamera()

    return proposedPos
  }

  /**
   * Update camera position to orbit around player
   */
  updateCamera() {
    const playerPos = this.player.getPosition()

    // Look at point is player's chest area
    const lookAtHeight = Config.player.height * 0.65
    const lookAtPoint = new THREE.Vector3(
      playerPos.x,
      playerPos.y + lookAtHeight,
      playerPos.z
    )

    // Calculate camera position using spherical coordinates
    // cameraPitch controls the vertical angle, cameraYaw controls horizontal
    const horizontalDistance = this.cameraDistance * Math.cos(this.cameraPitch)
    const verticalOffset = this.cameraDistance * Math.sin(this.cameraPitch) + this.cameraHeight

    this.targetCameraPos.set(
      playerPos.x + Math.sin(this.cameraYaw) * horizontalDistance,
      playerPos.y + lookAtHeight + verticalOffset,
      playerPos.z + Math.cos(this.cameraYaw) * horizontalDistance
    )

    // Smoothly move camera to target position
    this.camera.position.lerp(this.targetCameraPos, this.cameraSmoothness)

    // Always look at the player
    this.camera.lookAt(lookAtPoint)
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

export default ThirdPersonControls
