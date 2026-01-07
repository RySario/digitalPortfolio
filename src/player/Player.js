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
   * Create a colorful fantasy creature character
   * Unique shape with vibrant colors and expressive features
   */
  createPlayerModel() {
    console.log('=== CREATING COLORFUL CREATURE ===')

    // Vibrant color palette
    const colors = {
      // Main body gradient colors
      bodyMain: 0x9B59B6,      // Purple
      bodyLight: 0xBE90D4,     // Light purple
      bodyDark: 0x8E44AD,      // Dark purple

      // Accent colors
      belly: 0xF39C12,         // Orange/gold belly
      bellyLight: 0xF7DC6F,    // Light yellow

      // Feature colors
      spots: 0x1ABC9C,         // Teal spots
      spotsAlt: 0xE74C3C,      // Red spots

      // Eye colors
      eyeWhite: 0xFFFFFF,
      eyeIris: 0x3498DB,       // Blue iris
      eyePupil: 0x000000,
      eyeGlow: 0x5DADE2,       // Light blue glow

      // Extras
      antenna: 0xE91E63,       // Pink antenna
      antennaGlow: 0xFF6B9D,   // Light pink
      cheeks: 0xFFB6C1,        // Pink cheeks
      mouth: 0xC0392B,         // Red mouth
    }

    // Character scale
    const scale = Config.player.height / 2.5

    // === MAIN BODY GROUP ===
    this.bodyGroup = new THREE.Group()
    this.bodyGroup.position.set(0, scale * 0.7, 0)
    this.group.add(this.bodyGroup)

    // --- MAIN BODY (rounded blob shape) ---
    const bodyGeom = new THREE.SphereGeometry(scale * 0.5, 32, 32)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: colors.bodyMain,
      roughness: 0.3,
      metalness: 0.1
    })
    const body = new THREE.Mesh(bodyGeom, bodyMat)
    body.scale.set(1, 0.9, 0.85)
    body.castShadow = true
    this.bodyGroup.add(body)

    // Body highlight (top)
    const highlightGeom = new THREE.SphereGeometry(scale * 0.35, 24, 24)
    const highlightMat = new THREE.MeshStandardMaterial({
      color: colors.bodyLight,
      roughness: 0.4
    })
    const highlight = new THREE.Mesh(highlightGeom, highlightMat)
    highlight.position.set(0, scale * 0.15, scale * 0.1)
    highlight.scale.set(1, 0.6, 0.8)
    this.bodyGroup.add(highlight)

    // Belly (front, different color)
    const bellyGeom = new THREE.SphereGeometry(scale * 0.35, 24, 24)
    const bellyMat = new THREE.MeshStandardMaterial({
      color: colors.belly,
      roughness: 0.3
    })
    const belly = new THREE.Mesh(bellyGeom, bellyMat)
    belly.position.set(0, -scale * 0.1, scale * 0.25)
    belly.scale.set(0.8, 0.7, 0.5)
    belly.castShadow = true
    this.bodyGroup.add(belly)

    // Colorful spots on body
    const spotPositions = [
      { x: -0.3, y: 0.2, z: 0.2, color: colors.spots, size: 0.08 },
      { x: 0.35, y: 0.1, z: 0.15, color: colors.spotsAlt, size: 0.06 },
      { x: -0.25, y: -0.15, z: 0.3, color: colors.spots, size: 0.05 },
      { x: 0.2, y: 0.25, z: 0.25, color: colors.spotsAlt, size: 0.07 },
      { x: -0.35, y: 0, z: -0.1, color: colors.spots, size: 0.06 },
      { x: 0.3, y: -0.1, z: -0.15, color: colors.spotsAlt, size: 0.05 },
    ]

    spotPositions.forEach(spot => {
      const spotGeom = new THREE.SphereGeometry(scale * spot.size, 12, 12)
      const spotMat = new THREE.MeshStandardMaterial({ color: spot.color })
      const spotMesh = new THREE.Mesh(spotGeom, spotMat)
      spotMesh.position.set(scale * spot.x, scale * spot.y, scale * spot.z)
      this.bodyGroup.add(spotMesh)
    })

    // --- STUBBY LEGS ---
    this.leftLegGroup = new THREE.Group()
    this.leftLegGroup.position.set(-scale * 0.25, -scale * 0.35, scale * 0.1)
    this.bodyGroup.add(this.leftLegGroup)

    const legGeom = new THREE.CapsuleGeometry(scale * 0.12, scale * 0.15, 8, 16)
    const legMat = new THREE.MeshStandardMaterial({ color: colors.bodyDark })
    const leftLeg = new THREE.Mesh(legGeom, legMat)
    leftLeg.castShadow = true
    this.leftLegGroup.add(leftLeg)

    // Left foot (round)
    const footGeom = new THREE.SphereGeometry(scale * 0.14, 16, 16)
    const footMat = new THREE.MeshStandardMaterial({ color: colors.belly })
    const leftFoot = new THREE.Mesh(footGeom, footMat)
    leftFoot.position.set(0, -scale * 0.18, scale * 0.05)
    leftFoot.scale.set(1, 0.6, 1.2)
    leftFoot.castShadow = true
    this.leftLegGroup.add(leftFoot)

    this.rightLegGroup = new THREE.Group()
    this.rightLegGroup.position.set(scale * 0.25, -scale * 0.35, scale * 0.1)
    this.bodyGroup.add(this.rightLegGroup)

    const rightLeg = new THREE.Mesh(legGeom.clone(), legMat)
    rightLeg.castShadow = true
    this.rightLegGroup.add(rightLeg)

    const rightFoot = new THREE.Mesh(footGeom.clone(), footMat)
    rightFoot.position.set(0, -scale * 0.18, scale * 0.05)
    rightFoot.scale.set(1, 0.6, 1.2)
    rightFoot.castShadow = true
    this.rightLegGroup.add(rightFoot)

    // --- STUBBY ARMS ---
    this.leftArmGroup = new THREE.Group()
    this.leftArmGroup.position.set(-scale * 0.45, scale * 0.05, 0)
    this.bodyGroup.add(this.leftArmGroup)

    const armGeom = new THREE.CapsuleGeometry(scale * 0.1, scale * 0.2, 8, 16)
    const armMat = new THREE.MeshStandardMaterial({ color: colors.bodyMain })
    const leftArm = new THREE.Mesh(armGeom, armMat)
    leftArm.rotation.z = Math.PI / 4
    leftArm.castShadow = true
    this.leftArmGroup.add(leftArm)

    // Left hand (round paw)
    const handGeom = new THREE.SphereGeometry(scale * 0.1, 16, 16)
    const handMat = new THREE.MeshStandardMaterial({ color: colors.bellyLight })
    const leftHand = new THREE.Mesh(handGeom, handMat)
    leftHand.position.set(-scale * 0.15, -scale * 0.15, 0)
    leftHand.castShadow = true
    this.leftArmGroup.add(leftHand)

    this.rightArmGroup = new THREE.Group()
    this.rightArmGroup.position.set(scale * 0.45, scale * 0.05, 0)
    this.bodyGroup.add(this.rightArmGroup)

    const rightArm = new THREE.Mesh(armGeom.clone(), armMat)
    rightArm.rotation.z = -Math.PI / 4
    rightArm.castShadow = true
    this.rightArmGroup.add(rightArm)

    const rightHand = new THREE.Mesh(handGeom.clone(), handMat)
    rightHand.position.set(scale * 0.15, -scale * 0.15, 0)
    rightHand.castShadow = true
    this.rightArmGroup.add(rightHand)

    // --- HEAD ---
    this.headGroup = new THREE.Group()
    this.headGroup.position.set(0, scale * 0.45, scale * 0.1)
    this.bodyGroup.add(this.headGroup)

    // Main head (slightly squashed sphere)
    const headGeom = new THREE.SphereGeometry(scale * 0.35, 32, 32)
    const headMat = new THREE.MeshStandardMaterial({
      color: colors.bodyMain,
      roughness: 0.3
    })
    const head = new THREE.Mesh(headGeom, headMat)
    head.scale.set(1.1, 0.95, 1)
    head.castShadow = true
    this.headGroup.add(head)

    // Face highlight
    const faceHighlight = new THREE.Mesh(
      new THREE.SphereGeometry(scale * 0.25, 24, 24),
      new THREE.MeshStandardMaterial({ color: colors.bodyLight })
    )
    faceHighlight.position.set(0, scale * 0.05, scale * 0.2)
    faceHighlight.scale.set(1, 0.8, 0.5)
    this.headGroup.add(faceHighlight)

    // --- BIG EXPRESSIVE EYES ---
    const eyeSpacing = scale * 0.15

    // Left eye white
    const eyeGeom = new THREE.SphereGeometry(scale * 0.12, 24, 24)
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: colors.eyeWhite })
    const leftEyeWhite = new THREE.Mesh(eyeGeom, eyeWhiteMat)
    leftEyeWhite.position.set(-eyeSpacing, scale * 0.08, scale * 0.28)
    leftEyeWhite.scale.set(1, 1.1, 0.8)
    this.headGroup.add(leftEyeWhite)

    // Left iris
    const irisGeom = new THREE.SphereGeometry(scale * 0.07, 20, 20)
    const irisMat = new THREE.MeshStandardMaterial({ color: colors.eyeIris })
    const leftIris = new THREE.Mesh(irisGeom, irisMat)
    leftIris.position.set(-eyeSpacing, scale * 0.08, scale * 0.35)
    this.headGroup.add(leftIris)
    this.leftIris = leftIris

    // Left pupil
    const pupilGeom = new THREE.SphereGeometry(scale * 0.035, 16, 16)
    const pupilMat = new THREE.MeshStandardMaterial({ color: colors.eyePupil })
    const leftPupil = new THREE.Mesh(pupilGeom, pupilMat)
    leftPupil.position.set(-eyeSpacing, scale * 0.08, scale * 0.38)
    this.headGroup.add(leftPupil)
    this.leftPupil = leftPupil

    // Left eye shine
    const shineGeom = new THREE.SphereGeometry(scale * 0.025, 12, 12)
    const shineMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      emissive: 0xFFFFFF,
      emissiveIntensity: 0.3
    })
    const leftShine = new THREE.Mesh(shineGeom, shineMat)
    leftShine.position.set(-eyeSpacing + scale * 0.03, scale * 0.12, scale * 0.38)
    this.headGroup.add(leftShine)

    // Right eye (mirror)
    const rightEyeWhite = new THREE.Mesh(eyeGeom.clone(), eyeWhiteMat)
    rightEyeWhite.position.set(eyeSpacing, scale * 0.08, scale * 0.28)
    rightEyeWhite.scale.set(1, 1.1, 0.8)
    this.headGroup.add(rightEyeWhite)

    const rightIris = new THREE.Mesh(irisGeom.clone(), irisMat)
    rightIris.position.set(eyeSpacing, scale * 0.08, scale * 0.35)
    this.headGroup.add(rightIris)
    this.rightIris = rightIris

    const rightPupil = new THREE.Mesh(pupilGeom.clone(), pupilMat)
    rightPupil.position.set(eyeSpacing, scale * 0.08, scale * 0.38)
    this.headGroup.add(rightPupil)
    this.rightPupil = rightPupil

    const rightShine = new THREE.Mesh(shineGeom.clone(), shineMat)
    rightShine.position.set(eyeSpacing + scale * 0.03, scale * 0.12, scale * 0.38)
    this.headGroup.add(rightShine)

    // --- CUTE CHEEKS ---
    const cheekGeom = new THREE.SphereGeometry(scale * 0.06, 12, 12)
    const cheekMat = new THREE.MeshStandardMaterial({ color: colors.cheeks })
    const leftCheek = new THREE.Mesh(cheekGeom, cheekMat)
    leftCheek.position.set(-scale * 0.22, -scale * 0.02, scale * 0.25)
    leftCheek.scale.set(1.2, 0.8, 0.5)
    this.headGroup.add(leftCheek)

    const rightCheek = new THREE.Mesh(cheekGeom.clone(), cheekMat)
    rightCheek.position.set(scale * 0.22, -scale * 0.02, scale * 0.25)
    rightCheek.scale.set(1.2, 0.8, 0.5)
    this.headGroup.add(rightCheek)

    // --- SMILE ---
    const smileGeom = new THREE.TorusGeometry(scale * 0.08, scale * 0.02, 12, 24, Math.PI)
    const smileMat = new THREE.MeshStandardMaterial({ color: colors.mouth })
    const smile = new THREE.Mesh(smileGeom, smileMat)
    smile.position.set(0, -scale * 0.08, scale * 0.3)
    smile.rotation.x = Math.PI * 0.1
    smile.rotation.z = Math.PI
    this.headGroup.add(smile)
    this.smile = smile

    // --- ANTENNA/EARS ---
    this.leftAntennaGroup = new THREE.Group()
    this.leftAntennaGroup.position.set(-scale * 0.2, scale * 0.3, 0)
    this.headGroup.add(this.leftAntennaGroup)

    const antennaStalkGeom = new THREE.CylinderGeometry(scale * 0.025, scale * 0.035, scale * 0.25, 12)
    const antennaMat = new THREE.MeshStandardMaterial({ color: colors.antenna })
    const leftStalk = new THREE.Mesh(antennaStalkGeom, antennaMat)
    leftStalk.rotation.z = 0.3
    this.leftAntennaGroup.add(leftStalk)

    const antennaTipGeom = new THREE.SphereGeometry(scale * 0.06, 16, 16)
    const antennaTipMat = new THREE.MeshStandardMaterial({
      color: colors.antennaGlow,
      emissive: colors.antenna,
      emissiveIntensity: 0.3
    })
    const leftTip = new THREE.Mesh(antennaTipGeom, antennaTipMat)
    leftTip.position.set(-scale * 0.08, scale * 0.12, 0)
    this.leftAntennaGroup.add(leftTip)
    this.leftAntennaTip = leftTip

    this.rightAntennaGroup = new THREE.Group()
    this.rightAntennaGroup.position.set(scale * 0.2, scale * 0.3, 0)
    this.headGroup.add(this.rightAntennaGroup)

    const rightStalk = new THREE.Mesh(antennaStalkGeom.clone(), antennaMat)
    rightStalk.rotation.z = -0.3
    this.rightAntennaGroup.add(rightStalk)

    const rightTip = new THREE.Mesh(antennaTipGeom.clone(), antennaTipMat)
    rightTip.position.set(scale * 0.08, scale * 0.12, 0)
    this.rightAntennaGroup.add(rightTip)
    this.rightAntennaTip = rightTip

    // --- TAIL ---
    this.tailGroup = new THREE.Group()
    this.tailGroup.position.set(0, -scale * 0.15, -scale * 0.4)
    this.bodyGroup.add(this.tailGroup)

    const tailGeom = new THREE.CapsuleGeometry(scale * 0.08, scale * 0.25, 8, 16)
    const tailMat = new THREE.MeshStandardMaterial({ color: colors.bodyMain })
    const tail = new THREE.Mesh(tailGeom, tailMat)
    tail.rotation.x = -0.5
    tail.castShadow = true
    this.tailGroup.add(tail)

    const tailTipGeom = new THREE.SphereGeometry(scale * 0.1, 16, 16)
    const tailTipMat = new THREE.MeshStandardMaterial({ color: colors.spots })
    const tailTip = new THREE.Mesh(tailTipGeom, tailTipMat)
    tailTip.position.set(0, scale * 0.08, -scale * 0.2)
    this.tailGroup.add(tailTip)

    // Store scale and base positions for animation
    this.scale = scale
    this.baseBodyY = this.bodyGroup.position.y

    console.log('Colorful creature created!')
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

    // Head looks around curiously
    if (this.headGroup) {
      this.headGroup.rotation.y = Math.sin(time * idleSpeed * 0.5) * 0.15
      this.headGroup.rotation.z = Math.sin(time * idleSpeed * 0.8) * 0.05
      this.headGroup.rotation.x = Math.sin(time * idleSpeed * 0.6) * 0.03
    }

    // Eyes look around (pupils move)
    if (this.leftPupil && this.rightPupil) {
      const lookX = Math.sin(time * idleSpeed * 0.4) * s * 0.02
      const lookY = Math.sin(time * idleSpeed * 0.3) * s * 0.015
      this.leftPupil.position.x = -s * 0.15 + lookX
      this.leftPupil.position.y = s * 0.08 + lookY
      this.rightPupil.position.x = s * 0.15 + lookX
      this.rightPupil.position.y = s * 0.08 + lookY
    }

    // Arms hang with slight sway
    if (this.leftArmGroup) {
      this.leftArmGroup.rotation.x = Math.sin(time * idleSpeed * 0.6) * 0.1
      this.leftArmGroup.rotation.z = Math.PI / 4 + Math.sin(time * idleSpeed * 0.5) * 0.05
    }
    if (this.rightArmGroup) {
      this.rightArmGroup.rotation.x = Math.sin(time * idleSpeed * 0.6 + 0.5) * 0.1
      this.rightArmGroup.rotation.z = -Math.PI / 4 + Math.sin(time * idleSpeed * 0.5 + 0.5) * 0.05
    }

    // Legs slight idle movement
    if (this.leftLegGroup) {
      this.leftLegGroup.rotation.x = Math.sin(time * idleSpeed * 0.4) * 0.03
    }
    if (this.rightLegGroup) {
      this.rightLegGroup.rotation.x = Math.sin(time * idleSpeed * 0.4 + 0.3) * 0.03
    }

    // Tail wags gently
    if (this.tailGroup) {
      this.tailGroup.rotation.y = Math.sin(time * idleSpeed * 1.5) * 0.3
      this.tailGroup.rotation.x = -0.3 + Math.sin(time * idleSpeed) * 0.1
    }

    // Antenna sway
    if (this.leftAntennaGroup) {
      this.leftAntennaGroup.rotation.z = 0.3 + Math.sin(time * idleSpeed * 1.2) * 0.1
    }
    if (this.rightAntennaGroup) {
      this.rightAntennaGroup.rotation.z = -0.3 + Math.sin(time * idleSpeed * 1.2 + 0.5) * 0.1
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
      this.bodyGroup.position.y = this.baseBodyY + Math.abs(Math.sin(time * walkSpeed)) * s * 0.08
      this.bodyGroup.rotation.z = Math.sin(time * walkSpeed) * 0.08
      this.bodyGroup.rotation.x = Math.sin(time * walkSpeed * 2) * 0.02
    }

    // Head bobs with walk
    if (this.headGroup) {
      this.headGroup.rotation.z = Math.sin(time * walkSpeed) * -0.1
      this.headGroup.rotation.x = Math.sin(time * walkSpeed * 2) * 0.05
    }

    // Legs waddle
    if (this.leftLegGroup) {
      this.leftLegGroup.rotation.x = Math.sin(time * walkSpeed) * 0.4
      this.leftLegGroup.rotation.z = Math.sin(time * walkSpeed) * 0.1
    }
    if (this.rightLegGroup) {
      this.rightLegGroup.rotation.x = Math.sin(time * walkSpeed + Math.PI) * 0.4
      this.rightLegGroup.rotation.z = Math.sin(time * walkSpeed + Math.PI) * 0.1
    }

    // Arms swing
    if (this.leftArmGroup) {
      this.leftArmGroup.rotation.x = Math.sin(time * walkSpeed + Math.PI) * 0.3
      this.leftArmGroup.rotation.z = Math.PI / 4 + Math.sin(time * walkSpeed) * 0.1
    }
    if (this.rightArmGroup) {
      this.rightArmGroup.rotation.x = Math.sin(time * walkSpeed) * 0.3
      this.rightArmGroup.rotation.z = -Math.PI / 4 + Math.sin(time * walkSpeed + Math.PI) * 0.1
    }

    // Tail wags faster
    if (this.tailGroup) {
      this.tailGroup.rotation.y = Math.sin(time * walkSpeed * 1.5) * 0.5
      this.tailGroup.rotation.x = -0.3 + Math.sin(time * walkSpeed) * 0.15
    }

    // Antenna bounce
    if (this.leftAntennaGroup) {
      this.leftAntennaGroup.rotation.z = 0.3 + Math.sin(time * walkSpeed * 1.5) * 0.2
      this.leftAntennaGroup.rotation.x = Math.sin(time * walkSpeed) * 0.1
    }
    if (this.rightAntennaGroup) {
      this.rightAntennaGroup.rotation.z = -0.3 + Math.sin(time * walkSpeed * 1.5 + Math.PI) * 0.2
      this.rightAntennaGroup.rotation.x = Math.sin(time * walkSpeed + Math.PI) * 0.1
    }

    // Eyes stay forward
    if (this.leftPupil && this.rightPupil) {
      this.leftPupil.position.x = -s * 0.15
      this.leftPupil.position.y = s * 0.08
      this.rightPupil.position.x = s * 0.15
      this.rightPupil.position.y = s * 0.08
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
      this.bodyGroup.position.y = this.baseBodyY + Math.abs(Math.sin(time * runSpeed)) * s * 0.15
      this.bodyGroup.rotation.z = Math.sin(time * runSpeed) * 0.12
      this.bodyGroup.rotation.x = 0.1 + Math.sin(time * runSpeed * 2) * 0.05  // Lean forward
    }

    // Head bobs more
    if (this.headGroup) {
      this.headGroup.rotation.z = Math.sin(time * runSpeed) * -0.15
      this.headGroup.rotation.x = -0.1 + Math.sin(time * runSpeed * 2) * 0.08
    }

    // Legs pump faster
    if (this.leftLegGroup) {
      this.leftLegGroup.rotation.x = Math.sin(time * runSpeed) * 0.7
      this.leftLegGroup.rotation.z = Math.sin(time * runSpeed) * 0.15
    }
    if (this.rightLegGroup) {
      this.rightLegGroup.rotation.x = Math.sin(time * runSpeed + Math.PI) * 0.7
      this.rightLegGroup.rotation.z = Math.sin(time * runSpeed + Math.PI) * 0.15
    }

    // Arms pump
    if (this.leftArmGroup) {
      this.leftArmGroup.rotation.x = Math.sin(time * runSpeed + Math.PI) * 0.6
      this.leftArmGroup.rotation.z = Math.PI / 6 + Math.sin(time * runSpeed) * 0.2
    }
    if (this.rightArmGroup) {
      this.rightArmGroup.rotation.x = Math.sin(time * runSpeed) * 0.6
      this.rightArmGroup.rotation.z = -Math.PI / 6 + Math.sin(time * runSpeed + Math.PI) * 0.2
    }

    // Tail streams behind
    if (this.tailGroup) {
      this.tailGroup.rotation.y = Math.sin(time * runSpeed * 2) * 0.6
      this.tailGroup.rotation.x = -0.5 + Math.sin(time * runSpeed) * 0.2
    }

    // Antenna fly back
    if (this.leftAntennaGroup) {
      this.leftAntennaGroup.rotation.z = 0.5 + Math.sin(time * runSpeed * 2) * 0.3
      this.leftAntennaGroup.rotation.x = -0.2 + Math.sin(time * runSpeed) * 0.15
    }
    if (this.rightAntennaGroup) {
      this.rightAntennaGroup.rotation.z = -0.5 + Math.sin(time * runSpeed * 2 + Math.PI) * 0.3
      this.rightAntennaGroup.rotation.x = -0.2 + Math.sin(time * runSpeed + Math.PI) * 0.15
    }

    // Determined eyes (pupils forward and slightly narrowed position)
    if (this.leftPupil && this.rightPupil) {
      this.leftPupil.position.x = -s * 0.15
      this.leftPupil.position.y = s * 0.08 + Math.sin(time * runSpeed * 2) * s * 0.01
      this.rightPupil.position.x = s * 0.15
      this.rightPupil.position.y = s * 0.08 + Math.sin(time * runSpeed * 2) * s * 0.01
    }
  }

  /**
   * Antenna glow pulsing effect
   */
  animateAntenna(time) {
    const pulseSpeed = 3
    const pulse = 0.2 + Math.sin(time * pulseSpeed) * 0.15

    if (this.leftAntennaTip && this.leftAntennaTip.material) {
      this.leftAntennaTip.material.emissiveIntensity = pulse
    }
    if (this.rightAntennaTip && this.rightAntennaTip.material) {
      this.rightAntennaTip.material.emissiveIntensity = pulse
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
