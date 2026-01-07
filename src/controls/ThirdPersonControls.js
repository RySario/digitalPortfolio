/**
 * Third Person Controls
 * Controls player character with WASD and camera with mouse
 * Camera follows behind player
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

    // Camera rotation
    this.cameraRotationY = 0  // Horizontal rotation
    this.cameraRotationX = 0.3  // Vertical tilt (looking slightly down)

    // Player rotation
    this.targetPlayerRotation = 0
    this.currentPlayerRotation = 0

    // Movement parameters
    this.speed = Config.controls.maxSpeed
    this.runSpeed = Config.controls.runSpeed
    this.rotationSpeed = Config.controls.rotationSpeed
    this.mouseSensitivity = Config.controls.mouseSensitivity

    // Camera parameters
    this.cameraDistance = Config.camera.thirdPerson.distance
    this.cameraHeight = Config.camera.thirdPerson.height
    this.cameraSmoothness = Config.camera.thirdPerson.smoothness

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

    // Update camera rotation
    this.cameraRotationY -= movementX * this.mouseSensitivity
    this.cameraRotationX -= movementY * this.mouseSensitivity

    // Limit vertical rotation
    this.cameraRotationX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.cameraRotationX))
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
    // Calculate movement direction based on camera rotation
    const moveDirection = new THREE.Vector3()

    // Get forward and right vectors relative to camera
    const forward = new THREE.Vector3(
      Math.sin(this.cameraRotationY),
      0,
      Math.cos(this.cameraRotationY)
    )
    const right = new THREE.Vector3(
      Math.cos(this.cameraRotationY),
      0,
      -Math.sin(this.cameraRotationY)
    )

    if (this.moveForward) moveDirection.add(forward)
    if (this.moveBackward) moveDirection.sub(forward)
    if (this.moveRight) moveDirection.add(right)
    if (this.moveLeft) moveDirection.sub(right)

    // Normalize and apply speed
    if (moveDirection.length() > 0) {
      moveDirection.normalize()

      const currentSpeed = this.isRunning ? this.runSpeed : this.speed
      moveDirection.multiplyScalar(currentSpeed * delta)

      // Update player rotation to face movement direction
      this.targetPlayerRotation = Math.atan2(moveDirection.x, moveDirection.z)
    }

    // Smoothly rotate player
    let rotationDiff = this.targetPlayerRotation - this.currentPlayerRotation
    // Handle angle wrapping
    if (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2
    if (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2

    this.currentPlayerRotation += rotationDiff * this.rotationSpeed * delta
    this.player.setRotation(this.currentPlayerRotation)

    // Calculate proposed position
    const currentPos = this.player.getPosition()
    const proposedPos = currentPos.clone().add(moveDirection)

    // Update camera to follow player
    this.updateCamera()

    return proposedPos
  }

  /**
   * Update camera position to follow player
   */
  updateCamera() {
    const playerPos = this.player.getPosition()

    // Calculate desired camera position
    const cameraOffset = new THREE.Vector3(
      Math.sin(this.cameraRotationY) * this.cameraDistance,
      this.cameraHeight,
      Math.cos(this.cameraRotationY) * this.cameraDistance
    )

    const targetCameraPos = playerPos.clone().sub(cameraOffset)

    // Smooth camera movement
    this.camera.position.lerp(targetCameraPos, this.cameraSmoothness)

    // Look at point slightly ahead and above player
    const lookAtPoint = playerPos.clone()
    lookAtPoint.y += Config.player.height * 0.7
    lookAtPoint.add(new THREE.Vector3(
      Math.sin(this.cameraRotationY) * Config.camera.thirdPerson.lookAhead,
      0,
      Math.cos(this.cameraRotationY) * Config.camera.thirdPerson.lookAhead
    ))

    this.camera.lookAt(lookAtPoint)

    // Apply vertical tilt
    const tiltAxis = new THREE.Vector3(
      Math.cos(this.cameraRotationY),
      0,
      -Math.sin(this.cameraRotationY)
    )
    this.camera.rotateOnAxis(tiltAxis, this.cameraRotationX)
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
