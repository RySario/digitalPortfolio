/**
 * Orbit Camera Controls with Inverted Mouse
 * Click and drag to rotate camera around the building
 * - Drag left = Camera moves right
 * - Drag down = Camera moves up
 */

import * as THREE from 'three'
import gsap from 'gsap'
import { Config } from '../core/Config.js'

export class OrbitCameraControls {
  constructor(camera, domElement) {
    this.camera = camera
    this.domElement = domElement

    // Control settings from config
    const config = Config.orbitControls
    this.enabled = true
    this.enableDamping = config.enableDamping
    this.dampingFactor = config.dampingFactor
    this.sensitivity = config.sensitivity
    this.minDistance = config.minDistance
    this.maxDistance = config.maxDistance
    this.minPolarAngle = config.minPolarAngle
    this.maxPolarAngle = config.maxPolarAngle
    this.smoothness = config.smoothness
    this.zoomSpeed = config.zoomSpeed

    // Spherical coordinates (orbit around target)
    this.target = new THREE.Vector3(0, 15, 0) // Look at building center/upper area
    this.distance = 50 // Distance from target
    this.azimuthAngle = 0 // Horizontal rotation (start at front view)
    this.polarAngle = Math.PI / 2.5 // Vertical rotation (looking slightly up)

    // Mouse state
    this.isDragging = false
    this.previousMousePosition = { x: 0, y: 0 }

    // Camera state
    this.isFocused = false // Whether camera is focused on billboard
    this.currentAnimation = null // GSAP animation reference

    // Damping velocities
    this.azimuthVelocity = 0
    this.polarVelocity = 0
    this.zoomVelocity = 0

    // Bind event handlers
    this.onMouseDown = this.onMouseDown.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
    this.onWheel = this.onWheel.bind(this)

    // Initialize event listeners
    this.addEventListeners()

    // Set initial camera position
    this.updateCameraPosition()
  }

  addEventListeners() {
    this.domElement.addEventListener('mousedown', this.onMouseDown)
    this.domElement.addEventListener('wheel', this.onWheel, { passive: false })
  }

  removeEventListeners() {
    this.domElement.removeEventListener('mousedown', this.onMouseDown)
    this.domElement.removeEventListener('mousemove', this.onMouseMove)
    this.domElement.removeEventListener('mouseup', this.onMouseUp)
    this.domElement.removeEventListener('wheel', this.onWheel)
  }

  onMouseDown(event) {
    if (!this.enabled || this.isFocused) {
      console.log('Camera controls disabled or focused:', { enabled: this.enabled, isFocused: this.isFocused })
      return
    }

    console.log('Mouse down - starting drag')
    this.isDragging = true
    this.previousMousePosition = {
      x: event.clientX,
      y: event.clientY
    }

    this.domElement.addEventListener('mousemove', this.onMouseMove)
    this.domElement.addEventListener('mouseup', this.onMouseUp)

    // Change cursor
    this.domElement.style.cursor = 'grabbing'
  }

  onMouseMove(event) {
    if (!this.isDragging) return

    const deltaX = event.clientX - this.previousMousePosition.x
    const deltaY = event.clientY - this.previousMousePosition.y

    // Camera controls (swapped as requested)
    // Drag left (negative deltaX) = camera moves right
    // Drag down (positive deltaY) = camera moves up
    this.azimuthVelocity = deltaX * this.sensitivity
    this.polarVelocity = -deltaY * this.sensitivity

    this.previousMousePosition = {
      x: event.clientX,
      y: event.clientY
    }
  }

  onMouseUp() {
    this.isDragging = false
    this.domElement.removeEventListener('mousemove', this.onMouseMove)
    this.domElement.removeEventListener('mouseup', this.onMouseUp)
    this.domElement.style.cursor = 'grab'
  }

  onWheel(event) {
    if (!this.enabled || this.isFocused) return

    event.preventDefault()

    // Zoom in/out
    const delta = event.deltaY * 0.01
    this.zoomVelocity = delta * this.zoomSpeed
  }

  update(deltaTime) {
    if (!this.enabled || this.isFocused) return

    // Apply velocities
    this.azimuthAngle += this.azimuthVelocity
    this.polarAngle += this.polarVelocity
    this.distance += this.zoomVelocity

    // Apply damping
    if (this.enableDamping) {
      this.azimuthVelocity *= (1 - this.dampingFactor)
      this.polarVelocity *= (1 - this.dampingFactor)
      this.zoomVelocity *= (1 - this.dampingFactor)
    } else {
      this.azimuthVelocity = 0
      this.polarVelocity = 0
      this.zoomVelocity = 0
    }

    // Clamp polar angle to prevent camera flipping
    this.polarAngle = Math.max(
      this.minPolarAngle,
      Math.min(this.maxPolarAngle, this.polarAngle)
    )

    // Clamp distance for zoom limits
    this.distance = Math.max(
      this.minDistance,
      Math.min(this.maxDistance, this.distance)
    )

    // Update camera position
    this.updateCameraPosition()
  }

  updateCameraPosition() {
    // Convert spherical coordinates to Cartesian
    const x = this.target.x + this.distance * Math.sin(this.polarAngle) * Math.cos(this.azimuthAngle)
    const y = this.target.y + this.distance * Math.cos(this.polarAngle)
    const z = this.target.z + this.distance * Math.sin(this.polarAngle) * Math.sin(this.azimuthAngle)

    this.camera.position.set(x, y, z)
    this.camera.lookAt(this.target)
  }

  /**
   * Focus camera on main billboard (with animation)
   */
  focusOnBillboard(onComplete) {
    if (this.isFocused || this.currentAnimation) return

    this.isFocused = true

    const focusPos = Config.camera.focusPosition
    const focusLookAt = Config.camera.focusLookAt
    const animConfig = Config.animations.cameraTransition

    // Animate camera to focus position
    this.currentAnimation = gsap.timeline({
      onComplete: () => {
        this.currentAnimation = null
        if (onComplete) onComplete()
      }
    })

    this.currentAnimation.to(this.camera.position, {
      x: focusPos.x,
      y: focusPos.y,
      z: focusPos.z,
      duration: animConfig.duration,
      ease: animConfig.ease,
      onUpdate: () => {
        this.camera.lookAt(focusLookAt.x, focusLookAt.y, focusLookAt.z)
      }
    })
  }

  /**
   * Return camera to orbit mode
   */
  returnToOrbit(onComplete) {
    if (!this.isFocused || this.currentAnimation) return

    const animConfig = Config.animations.cameraTransition

    // Animate camera back to orbit position
    this.currentAnimation = gsap.timeline({
      onComplete: () => {
        this.isFocused = false
        this.currentAnimation = null
        if (onComplete) onComplete()
      }
    })

    // Calculate current orbit position from spherical coordinates
    const targetPos = {
      x: this.target.x + this.distance * Math.sin(this.polarAngle) * Math.cos(this.azimuthAngle),
      y: this.target.y + this.distance * Math.cos(this.polarAngle),
      z: this.target.z + this.distance * Math.sin(this.polarAngle) * Math.sin(this.azimuthAngle)
    }

    this.currentAnimation.to(this.camera.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: animConfig.duration,
      ease: animConfig.ease,
      onUpdate: () => {
        this.camera.lookAt(this.target)
      }
    })
  }

  /**
   * Set camera to initial position
   */
  setInitialPosition() {
    const startPos = Config.camera.startPosition
    const lookAt = Config.camera.lookAt

    this.camera.position.set(startPos.x, startPos.y, startPos.z)
    this.camera.lookAt(lookAt.x, lookAt.y, lookAt.z)

    // Calculate spherical coordinates from initial position
    const offset = new THREE.Vector3()
    offset.subVectors(this.camera.position, this.target)
    this.distance = offset.length()

    this.polarAngle = Math.acos(offset.y / this.distance)
    this.azimuthAngle = Math.atan2(offset.z, offset.x)
  }

  dispose() {
    this.removeEventListeners()
    if (this.currentAnimation) {
      this.currentAnimation.kill()
    }
  }
}

export default OrbitCameraControls
