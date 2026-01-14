/**
 * Floor Text
 * Creates "RYAN SARIO" text on the floor with subtitle text
 */

import * as THREE from 'three'
import { Config } from '../core/Config.js'

export class FloorText {
  constructor() {
    this.group = new THREE.Group()
    this.createFloorText()
  }

  createFloorText() {
    const nameConfig = Config.floorText.name
    const subtitlesConfig = Config.floorText.subtitles

    // Create main name text
    this.createTextPlane(
      nameConfig.text,
      nameConfig.position,
      nameConfig.rotation,
      nameConfig.fontSize,
      nameConfig.color,
      nameConfig.emissiveIntensity
    )

    // Create subtitle texts
    subtitlesConfig.forEach(subtitle => {
      this.createTextPlane(
        subtitle.text,
        subtitle.position,
        subtitle.rotation,
        subtitle.fontSize,
        subtitle.color,
        subtitle.emissiveIntensity
      )
    })
  }

  /**
   * Create a text plane using canvas
   */
  createTextPlane(text, position, rotation, fontSize, color, emissiveIntensity) {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    // Set canvas size
    canvas.width = 1024
    canvas.height = 256

    // Set font
    const fontSizePx = fontSize * 60
    context.font = `bold ${fontSizePx}px Arial, sans-serif`
    context.textAlign = 'center'
    context.textBaseline = 'middle'

    // Draw text with glow
    context.shadowBlur = 20
    context.shadowColor = `#${color.toString(16).padStart(6, '0')}`
    context.fillStyle = `#${color.toString(16).padStart(6, '0')}`
    context.fillText(text, canvas.width / 2, canvas.height / 2)

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas)

    // Calculate plane size based on text
    const aspectRatio = canvas.width / canvas.height
    const planeWidth = fontSize * text.length * 0.6
    const planeHeight = planeWidth / aspectRatio

    // Create plane geometry
    const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight)
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      emissive: color,
      emissiveIntensity: emissiveIntensity,
      side: THREE.DoubleSide
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(position.x, position.y, position.z)
    mesh.rotation.set(rotation.x, rotation.y, rotation.z)
    mesh.receiveShadow = false
    mesh.castShadow = false

    this.group.add(mesh)
  }

  getGroup() {
    return this.group
  }
}

export default FloorText
