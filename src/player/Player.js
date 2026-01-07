/**
 * Player class - Third-person character
 * Visible character that the camera follows
 */

import * as THREE from 'three'
import { Config } from '../core/Config.js'
import { GeometryUtils } from '../utils/GeometryUtils.js'

export class Player {
  constructor(scene) {
    this.scene = scene
    this.group = new THREE.Group()

    // Physics properties
    this.velocity = new THREE.Vector3()
    this.isGrounded = false
    this.isJumping = false

    // Player state
    this.isHoldingObject = false
    this.heldObject = null

    // Create player model
    this.createPlayerModel()

    // Set initial position
    this.group.position.set(
      Config.player.startPosition.x,
      Config.player.startPosition.y,
      Config.player.startPosition.z
    )

    this.scene.add(this.group)
  }

  /**
   * Create a simple low-poly player character
   */
  createPlayerModel() {
    // Body (capsule-like shape made of cylinder + spheres)
    const bodyHeight = Config.player.height * 0.6
    const body = GeometryUtils.createCylinder(
      Config.player.radius,
      Config.player.radius,
      bodyHeight,
      Config.player.color,
      6
    )
    body.position.y = bodyHeight / 2
    this.group.add(body)

    // Head
    const head = GeometryUtils.createSphere(
      Config.player.radius * 0.8,
      Config.player.color,
      6
    )
    head.position.y = bodyHeight + Config.player.radius * 0.8
    this.group.add(head)

    // Eyes (simple white spheres)
    const eyeLeft = GeometryUtils.createSphere(0.08, 0xFFFFFF, 4)
    eyeLeft.position.set(-0.15, bodyHeight + Config.player.radius * 0.9, Config.player.radius * 0.6)
    this.group.add(eyeLeft)

    const eyeRight = GeometryUtils.createSphere(0.08, 0xFFFFFF, 4)
    eyeRight.position.set(0.15, bodyHeight + Config.player.radius * 0.9, Config.player.radius * 0.6)
    this.group.add(eyeRight)

    // Arms (simple cylinders)
    const armHeight = bodyHeight * 0.5
    const leftArm = GeometryUtils.createCylinder(0.12, 0.12, armHeight, Config.player.color, 5)
    leftArm.position.set(-Config.player.radius * 1.2, bodyHeight * 0.6, 0)
    this.group.add(leftArm)

    const rightArm = GeometryUtils.createCylinder(0.12, 0.12, armHeight, Config.player.color, 5)
    rightArm.position.set(Config.player.radius * 1.2, bodyHeight * 0.6, 0)
    this.group.add(rightArm)

    // Store references for animation
    this.body = body
    this.head = head
    this.leftArm = leftArm
    this.rightArm = rightArm

    // Enable shadows
    this.group.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }

  /**
   * Update player physics
   * @param {number} delta
   */
  update(delta) {
    // Apply gravity
    if (!this.isGrounded) {
      this.velocity.y -= Config.player.gravity * delta
    }

    // Simple walk animation (bob head and sway arms)
    if (this.velocity.length() > 0.1 && this.isGrounded) {
      const time = Date.now() * 0.005
      this.head.position.y = Config.player.height * 0.6 + Config.player.radius * 0.8 + Math.sin(time * 2) * 0.05
      this.leftArm.rotation.x = Math.sin(time * 2) * 0.3
      this.rightArm.rotation.x = Math.sin(time * 2 + Math.PI) * 0.3
    } else {
      // Reset to idle pose
      this.head.position.y = Config.player.height * 0.6 + Config.player.radius * 0.8
      this.leftArm.rotation.x = 0
      this.rightArm.rotation.x = 0
    }
  }

  /**
   * Set player position
   * @param {THREE.Vector3} position
   */
  setPosition(position) {
    this.group.position.copy(position)
  }

  /**
   * Get player position
   * @returns {THREE.Vector3}
   */
  getPosition() {
    return this.group.position.clone()
  }

  /**
   * Set player rotation
   * @param {number} y - Y-axis rotation in radians
   */
  setRotation(y) {
    this.group.rotation.y = y
  }

  /**
   * Get forward direction
   * @returns {THREE.Vector3}
   */
  getForwardDirection() {
    const forward = new THREE.Vector3(0, 0, 1)
    forward.applyQuaternion(this.group.quaternion)
    return forward
  }

  /**
   * Jump
   */
  jump() {
    if (this.isGrounded && !this.isJumping) {
      this.velocity.y = Config.player.jumpForce
      this.isJumping = true
      this.isGrounded = false
    }
  }

  /**
   * Pick up an object
   * @param {THREE.Object3D} object
   */
  pickUpObject(object) {
    this.isHoldingObject = true
    this.heldObject = object

    // Attach to player (in front of player)
    if (object.parent) {
      object.parent.remove(object)
    }
    object.position.set(0, Config.player.height * 0.8, Config.player.radius * 1.5)
    this.group.add(object)
  }

  /**
   * Throw held object
   * @param {THREE.Vector3} direction
   * @param {number} force
   */
  throwObject(direction, force) {
    if (!this.isHoldingObject || !this.heldObject) return

    const object = this.heldObject

    // Detach from player
    this.group.remove(object)

    // Get world position
    const worldPos = new THREE.Vector3()
    this.group.getWorldPosition(worldPos)
    worldPos.y += Config.player.height * 0.8
    worldPos.add(direction.clone().multiplyScalar(1))

    object.position.copy(worldPos)
    this.scene.add(object)

    // Apply physics if object has it
    if (object.userData.physics) {
      object.userData.physics.velocity = direction.clone().multiplyScalar(force)
    }

    this.isHoldingObject = false
    this.heldObject = null
  }

  /**
   * Drop held object
   */
  dropObject() {
    if (!this.isHoldingObject || !this.heldObject) return

    const object = this.heldObject

    // Detach from player
    this.group.remove(object)

    // Place in front of player
    const worldPos = new THREE.Vector3()
    this.group.getWorldPosition(worldPos)
    const forward = this.getForwardDirection()
    worldPos.add(forward.multiplyScalar(1.5))
    worldPos.y += 0.5

    object.position.copy(worldPos)
    this.scene.add(object)

    this.isHoldingObject = false
    this.heldObject = null
  }

  /**
   * Get the player's mesh group
   * @returns {THREE.Group}
   */
  getMesh() {
    return this.group
  }
}

export default Player
