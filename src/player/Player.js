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
   * Create a "Dumb Ways to Die" style character
   * Simple bean/pill shaped body with minimal features
   */
  createPlayerModel() {
    console.log('=== CREATING DUMB WAYS TO DIE STYLE CHARACTER ===')

    // Simple, masculine color palette
    const colors = {
      body: 0x4A90D9,        // Blue body
      bodyDark: 0x357ABD,    // Darker blue for shading
      skin: 0xE8C4A0,        // Skin tone for face
      eyeWhite: 0xFFFFFF,
      eyePupil: 0x1A1A1A,
      mouth: 0x2C3E50
    }

    // Character scale
    const scale = Config.player.height / 2.2

    // === MAIN BODY GROUP ===
    this.bodyGroup = new THREE.Group()
    this.bodyGroup.position.set(0, scale * 0.9, 0)
    this.group.add(this.bodyGroup)

    // --- BEAN/PILL SHAPED BODY ---
    // Create a capsule-like body shape
    const bodyGeom = new THREE.CapsuleGeometry(scale * 0.4, scale * 0.6, 16, 24)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: colors.body,
      roughness: 0.6,
      metalness: 0.05
    })
    const body = new THREE.Mesh(bodyGeom, bodyMat)
    body.castShadow = true
    this.bodyGroup.add(body)

    // --- SIMPLE HEAD (integrated with body, just a face area) ---
    // Face embedded more into the pill body for a cohesive look
    this.headGroup = new THREE.Group()
    this.headGroup.position.set(0, scale * 0.25, scale * 0.05)
    this.bodyGroup.add(this.headGroup)

    // Face area (slightly lighter/skin colored circle) - more embedded into body
    const faceGeom = new THREE.SphereGeometry(scale * 0.28, 24, 24)
    const faceMat = new THREE.MeshStandardMaterial({
      color: colors.skin,
      roughness: 0.7
    })
    const face = new THREE.Mesh(faceGeom, faceMat)
    face.position.set(0, 0, scale * 0.22)
    face.scale.set(0.85, 0.85, 0.35)
    this.headGroup.add(face)

    // --- LARGE MICKEY MOUSE STYLE EYES ---
    const eyeSpacing = scale * 0.12  // Slightly wider spacing for larger eyes
    const eyeY = scale * 0.04  // Unified Y position for centered look

    // Large eye whites (sclera) - Mickey Mouse style big oval eyes
    // Protruding forward from the face for a friendly, expressive look
    const eyeWhiteGeom = new THREE.SphereGeometry(scale * 0.14, 20, 20)
    const eyeWhiteMat = new THREE.MeshStandardMaterial({
      color: colors.eyeWhite,
      roughness: 0.2
    })

    // Left eye white - large oval, protruding forward for friendly look
    const leftEyeWhite = new THREE.Mesh(eyeWhiteGeom, eyeWhiteMat)
    leftEyeWhite.position.set(-eyeSpacing, eyeY, scale * 0.32)  // Pushed forward to protrude
    leftEyeWhite.scale.set(0.9, 1.15, 0.6)  // Tall oval, more depth to stick out
    this.headGroup.add(leftEyeWhite)

    // Right eye white
    const rightEyeWhite = new THREE.Mesh(eyeWhiteGeom.clone(), eyeWhiteMat)
    rightEyeWhite.position.set(eyeSpacing, eyeY, scale * 0.32)  // Pushed forward to protrude
    rightEyeWhite.scale.set(0.9, 1.15, 0.6)
    this.headGroup.add(rightEyeWhite)

    // Pupils (black dots) - centered on the protruding eye whites
    const eyeGeom = new THREE.SphereGeometry(scale * 0.048, 16, 16)
    const eyeMat = new THREE.MeshStandardMaterial({ color: colors.eyePupil })
    const leftEye = new THREE.Mesh(eyeGeom, eyeMat)
    leftEye.position.set(-eyeSpacing, eyeY, scale * 0.39)  // On front surface of eye white
    this.headGroup.add(leftEye)
    this.leftPupil = leftEye

    // Right pupil
    const rightEye = new THREE.Mesh(eyeGeom.clone(), eyeMat)
    rightEye.position.set(eyeSpacing, eyeY, scale * 0.39)  // On front surface of eye white
    this.headGroup.add(rightEye)
    this.rightPupil = rightEye

    // Eye shine (white highlight dots on pupils for life) - upper right of pupil
    const shineGeom = new THREE.SphereGeometry(scale * 0.016, 8, 8)
    const shineMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF })
    const leftShine = new THREE.Mesh(shineGeom, shineMat)
    leftShine.position.set(-eyeSpacing + scale * 0.015, eyeY + scale * 0.015, scale * 0.41)
    this.headGroup.add(leftShine)

    const rightShine = new THREE.Mesh(shineGeom.clone(), shineMat)
    rightShine.position.set(eyeSpacing + scale * 0.015, eyeY + scale * 0.015, scale * 0.41)
    this.headGroup.add(rightShine)

    // --- SIMPLE MOUTH (small line) ---
    const mouthGeom = new THREE.BoxGeometry(scale * 0.08, scale * 0.018, scale * 0.01)
    const mouthMat = new THREE.MeshStandardMaterial({ color: colors.mouth })
    const mouth = new THREE.Mesh(mouthGeom, mouthMat)
    mouth.position.set(0, -scale * 0.06, scale * 0.30)
    this.headGroup.add(mouth)
    this.mouth = mouth

    // --- STUBBY LEGS ---
    this.leftLegGroup = new THREE.Group()
    this.leftLegGroup.position.set(-scale * 0.18, -scale * 0.55, 0)
    this.bodyGroup.add(this.leftLegGroup)

    const legGeom = new THREE.CapsuleGeometry(scale * 0.1, scale * 0.2, 8, 12)
    const legMat = new THREE.MeshStandardMaterial({ color: colors.bodyDark })
    const leftLeg = new THREE.Mesh(legGeom, legMat)
    leftLeg.castShadow = true
    this.leftLegGroup.add(leftLeg)

    // Left foot (simple round)
    const footGeom = new THREE.SphereGeometry(scale * 0.12, 12, 12)
    const footMat = new THREE.MeshStandardMaterial({ color: colors.bodyDark })
    const leftFoot = new THREE.Mesh(footGeom, footMat)
    leftFoot.position.set(0, -scale * 0.18, scale * 0.03)
    leftFoot.scale.set(1.1, 0.5, 1.2)
    leftFoot.castShadow = true
    this.leftLegGroup.add(leftFoot)

    this.rightLegGroup = new THREE.Group()
    this.rightLegGroup.position.set(scale * 0.18, -scale * 0.55, 0)
    this.bodyGroup.add(this.rightLegGroup)

    const rightLeg = new THREE.Mesh(legGeom.clone(), legMat)
    rightLeg.castShadow = true
    this.rightLegGroup.add(rightLeg)

    const rightFoot = new THREE.Mesh(footGeom.clone(), footMat)
    rightFoot.position.set(0, -scale * 0.18, scale * 0.03)
    rightFoot.scale.set(1.1, 0.5, 1.2)
    rightFoot.castShadow = true
    this.rightLegGroup.add(rightFoot)

    // --- STUBBY ARMS ---
    this.leftArmGroup = new THREE.Group()
    this.leftArmGroup.position.set(-scale * 0.42, scale * 0.1, 0)
    this.bodyGroup.add(this.leftArmGroup)

    const armGeom = new THREE.CapsuleGeometry(scale * 0.08, scale * 0.15, 8, 12)
    const armMat = new THREE.MeshStandardMaterial({ color: colors.body })
    const leftArm = new THREE.Mesh(armGeom, armMat)
    leftArm.rotation.z = Math.PI / 3
    leftArm.castShadow = true
    this.leftArmGroup.add(leftArm)

    // Left hand (simple round)
    const handGeom = new THREE.SphereGeometry(scale * 0.08, 12, 12)
    const handMat = new THREE.MeshStandardMaterial({ color: colors.skin })
    const leftHand = new THREE.Mesh(handGeom, handMat)
    leftHand.position.set(-scale * 0.12, -scale * 0.1, 0)
    leftHand.castShadow = true
    this.leftArmGroup.add(leftHand)

    this.rightArmGroup = new THREE.Group()
    this.rightArmGroup.position.set(scale * 0.42, scale * 0.1, 0)
    this.bodyGroup.add(this.rightArmGroup)

    const rightArm = new THREE.Mesh(armGeom.clone(), armMat)
    rightArm.rotation.z = -Math.PI / 3
    rightArm.castShadow = true
    this.rightArmGroup.add(rightArm)

    const rightHand = new THREE.Mesh(handGeom.clone(), handMat)
    rightHand.position.set(scale * 0.12, -scale * 0.1, 0)
    rightHand.castShadow = true
    this.rightArmGroup.add(rightHand)

    // Store scale and base positions for animation
    this.scale = scale
    this.baseBodyY = this.bodyGroup.position.y

    // No antenna tips in this design
    this.leftAntennaTip = null
    this.rightAntennaTip = null
    this.leftAntennaGroup = null
    this.rightAntennaGroup = null
    this.tailGroup = null

    console.log('Dumb Ways to Die style character created!')
  }

  /**
   * Update player physics and animation
   * @param {number} delta
   */
  update(delta) {
    // Apply gravity
    if (!this.isGrounded) {
      this.velocity.y -= Config.player.gravity * delta
    }

    const time = Date.now() * 0.001

    // Determine animation state
    const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z)
    const isRunning = speed > 0.15
    const isWalking = speed > 0.05 && speed <= 0.15
    const isIdle = speed <= 0.05

    if (isRunning) {
      this.animateRunning(time)
    } else if (isWalking) {
      this.animateWalking(time)
    } else {
      this.animateIdle(time)
    }

    // Always animate antenna glow
    this.animateAntenna(time)
  }

  /**
   * Idle animation - gentle breathing and swaying
   */
  animateIdle(time) {
    const idleSpeed = 2
    const s = this.scale

    // Gentle body breathing/bouncing
    if (this.bodyGroup && this.baseBodyY) {
      this.bodyGroup.position.y = this.baseBodyY + Math.sin(time * idleSpeed) * s * 0.03
      this.bodyGroup.rotation.z = Math.sin(time * idleSpeed * 0.7) * 0.02
    }

    // Head slight movement
    if (this.headGroup) {
      this.headGroup.rotation.y = Math.sin(time * idleSpeed * 0.5) * 0.1
      this.headGroup.rotation.z = Math.sin(time * idleSpeed * 0.8) * 0.03
    }

    // Arms hang with slight sway
    if (this.leftArmGroup) {
      this.leftArmGroup.rotation.x = Math.sin(time * idleSpeed * 0.6) * 0.08
      this.leftArmGroup.rotation.z = Math.PI / 3 + Math.sin(time * idleSpeed * 0.5) * 0.03
    }
    if (this.rightArmGroup) {
      this.rightArmGroup.rotation.x = Math.sin(time * idleSpeed * 0.6 + 0.5) * 0.08
      this.rightArmGroup.rotation.z = -Math.PI / 3 + Math.sin(time * idleSpeed * 0.5 + 0.5) * 0.03
    }

    // Legs slight idle movement
    if (this.leftLegGroup) {
      this.leftLegGroup.rotation.x = Math.sin(time * idleSpeed * 0.4) * 0.02
    }
    if (this.rightLegGroup) {
      this.rightLegGroup.rotation.x = Math.sin(time * idleSpeed * 0.4 + 0.3) * 0.02
    }
  }

  /**
   * Walking animation - bouncy waddle
   */
  animateWalking(time) {
    const walkSpeed = 8
    const s = this.scale

    // Bouncy body movement
    if (this.bodyGroup && this.baseBodyY) {
      this.bodyGroup.position.y = this.baseBodyY + Math.abs(Math.sin(time * walkSpeed)) * s * 0.06
      this.bodyGroup.rotation.z = Math.sin(time * walkSpeed) * 0.06
      this.bodyGroup.rotation.x = Math.sin(time * walkSpeed * 2) * 0.02
    }

    // Head bobs with walk
    if (this.headGroup) {
      this.headGroup.rotation.z = Math.sin(time * walkSpeed) * -0.08
      this.headGroup.rotation.x = Math.sin(time * walkSpeed * 2) * 0.03
    }

    // Legs waddle
    if (this.leftLegGroup) {
      this.leftLegGroup.rotation.x = Math.sin(time * walkSpeed) * 0.4
      this.leftLegGroup.rotation.z = Math.sin(time * walkSpeed) * 0.08
    }
    if (this.rightLegGroup) {
      this.rightLegGroup.rotation.x = Math.sin(time * walkSpeed + Math.PI) * 0.4
      this.rightLegGroup.rotation.z = Math.sin(time * walkSpeed + Math.PI) * 0.08
    }

    // Arms swing
    if (this.leftArmGroup) {
      this.leftArmGroup.rotation.x = Math.sin(time * walkSpeed + Math.PI) * 0.25
      this.leftArmGroup.rotation.z = Math.PI / 3 + Math.sin(time * walkSpeed) * 0.08
    }
    if (this.rightArmGroup) {
      this.rightArmGroup.rotation.x = Math.sin(time * walkSpeed) * 0.25
      this.rightArmGroup.rotation.z = -Math.PI / 3 + Math.sin(time * walkSpeed + Math.PI) * 0.08
    }
  }

  /**
   * Running animation - faster, more exaggerated
   */
  animateRunning(time) {
    const runSpeed = 14
    const s = this.scale

    // More pronounced bouncing
    if (this.bodyGroup && this.baseBodyY) {
      this.bodyGroup.position.y = this.baseBodyY + Math.abs(Math.sin(time * runSpeed)) * s * 0.1
      this.bodyGroup.rotation.z = Math.sin(time * runSpeed) * 0.1
      this.bodyGroup.rotation.x = 0.08 + Math.sin(time * runSpeed * 2) * 0.04  // Lean forward
    }

    // Head bobs more
    if (this.headGroup) {
      this.headGroup.rotation.z = Math.sin(time * runSpeed) * -0.1
      this.headGroup.rotation.x = -0.05 + Math.sin(time * runSpeed * 2) * 0.05
    }

    // Legs pump faster
    if (this.leftLegGroup) {
      this.leftLegGroup.rotation.x = Math.sin(time * runSpeed) * 0.6
      this.leftLegGroup.rotation.z = Math.sin(time * runSpeed) * 0.12
    }
    if (this.rightLegGroup) {
      this.rightLegGroup.rotation.x = Math.sin(time * runSpeed + Math.PI) * 0.6
      this.rightLegGroup.rotation.z = Math.sin(time * runSpeed + Math.PI) * 0.12
    }

    // Arms pump
    if (this.leftArmGroup) {
      this.leftArmGroup.rotation.x = Math.sin(time * runSpeed + Math.PI) * 0.5
      this.leftArmGroup.rotation.z = Math.PI / 4 + Math.sin(time * runSpeed) * 0.15
    }
    if (this.rightArmGroup) {
      this.rightArmGroup.rotation.x = Math.sin(time * runSpeed) * 0.5
      this.rightArmGroup.rotation.z = -Math.PI / 4 + Math.sin(time * runSpeed + Math.PI) * 0.15
    }
  }

  /**
   * Antenna glow pulsing effect (no-op for this character style)
   */
  animateAntenna(time) {
    // No antenna in this design - method kept for compatibility
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
