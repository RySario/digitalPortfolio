/**
 * Street Signs
 * Clickable neon signs attached to street lamp post
 */

import * as THREE from 'three'
import { Config } from '../core/Config.js'

export class StreetSigns {
  constructor(streetLightGroup) {
    this.group = new THREE.Group()
    this.signs = []
    this.streetLightGroup = streetLightGroup
    this.createStreetSigns()
  }

  createStreetSigns() {
    if (!Config.streetSigns) return

    Config.streetSigns.forEach((signConfig, index) => {
      const sign = this.createSignAttached(
        signConfig.text,
        signConfig.fontSize,
        signConfig.color,
        signConfig.emissiveIntensity,
        index
      )

      sign.userData.interactive = signConfig.interactive
      sign.userData.action = signConfig.action

      this.signs.push(sign)
    })
  }

  /**
   * Create a sign attached to the street lamp pole
   */
  createSignAttached(text, fontSize, color, emissiveIntensity, index) {
    const signGroup = new THREE.Group()

    // Horizontal arm extending from pole
    const armGeom = new THREE.BoxGeometry(1.2, 0.08, 0.08)
    const armMat = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      roughness: 0.6,
      metalness: 0.5
    })
    const arm = new THREE.Mesh(armGeom, armMat)
    arm.position.set(0.6, 0, 0)
    arm.castShadow = true
    signGroup.add(arm)

    // Sign board
    const boardWidth = text.length * fontSize * 1.2
    const boardHeight = fontSize * 1.2
    const boardGeom = new THREE.BoxGeometry(boardWidth, boardHeight, 0.08)
    const boardMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.6,
      metalness: 0.3
    })
    const board = new THREE.Mesh(boardGeom, boardMat)
    board.position.set(1.2, 0, 0)
    board.castShadow = true
    signGroup.add(board)

    // Create text using canvas
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    canvas.width = 512
    canvas.height = 128

    const fontSizePx = fontSize * 80
    context.font = `bold ${fontSizePx}px Arial, sans-serif`
    context.textAlign = 'center'
    context.textBaseline = 'middle'

    // Draw glowing text
    context.shadowBlur = 15
    context.shadowColor = `#${color.toString(16).padStart(6, '0')}`
    context.fillStyle = `#${color.toString(16).padStart(6, '0')}`
    context.fillText(text, canvas.width / 2, canvas.height / 2)

    const texture = new THREE.CanvasTexture(canvas)

    // Text plane
    const textGeom = new THREE.PlaneGeometry(boardWidth * 0.9, boardHeight * 0.7)
    const textMat = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      emissive: color,
      emissiveIntensity: emissiveIntensity,
      side: THREE.DoubleSide
    })
    const textPlane = new THREE.Mesh(textGeom, textMat)
    textPlane.position.set(1.2, 0, 0.05)
    signGroup.add(textPlane)

    // Add point light for glow
    const light = new THREE.PointLight(color, emissiveIntensity * 2, 4)
    light.position.set(1.2, 0, 0.3)
    signGroup.add(light)

    // Position sign on pole at different heights
    const signHeight = 5 - (index * 1.2)  // Stack signs vertically
    signGroup.position.y = signHeight

    // Attach to street light group
    if (this.streetLightGroup) {
      this.streetLightGroup.add(signGroup)
      this.signs.push(signGroup)
    }

    return signGroup
  }

  /**
   * Get all interactive signs for raycasting
   */
  getInteractiveSigns() {
    return this.signs.filter(sign => sign.userData.interactive)
  }

  getGroup() {
    return this.group
  }
}

export default StreetSigns
