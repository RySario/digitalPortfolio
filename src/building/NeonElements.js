/**
 * Neon Elements
 * Animated neon signs and decorative lights for the cyberpunk building
 */

import * as THREE from 'three'
import gsap from 'gsap'
import { Config } from '../core/Config.js'

export class NeonElements {
  constructor() {
    this.group = new THREE.Group()
    this.neonConfig = Config.neon
    this.animatedElements = []

    this.createMainSign()
    this.createAccentSigns()
    this.startAnimations()
  }

  /**
   * Create main neon sign (PORTFOLIO)
   */
  createMainSign() {
    const signConfig = this.neonConfig.mainSign

    const sign = this.createNeonText(
      signConfig.text,
      signConfig.fontSize,
      signConfig.color,
      signConfig.emissiveIntensity
    )

    sign.position.set(
      signConfig.position.x,
      signConfig.position.y,
      signConfig.position.z
    )

    this.group.add(sign)
    this.animatedElements.push(sign)
  }

  /**
   * Create accent signs (STUDIO, 04, etc.)
   */
  createAccentSigns() {
    this.neonConfig.accentSigns.forEach(signConfig => {
      const sign = this.createNeonText(
        signConfig.text,
        signConfig.fontSize,
        signConfig.color,
        signConfig.emissiveIntensity
      )

      sign.position.set(
        signConfig.position.x,
        signConfig.position.y,
        signConfig.position.z
      )

      this.group.add(sign)
      this.animatedElements.push(sign)
    })
  }

  /**
   * Create neon text using simple geometry
   * For production, you'd use TextGeometry or a texture, but this is simpler
   */
  createNeonText(text, fontSize, color, emissiveIntensity) {
    const group = new THREE.Group()

    // Create a simple neon bar/box to represent text
    // In production, you'd use TextGeometry from THREE or a texture
    const textWidth = text.length * fontSize * 0.6
    const textHeight = fontSize

    const geometry = new THREE.BoxGeometry(textWidth, textHeight, 0.1)
    const material = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: emissiveIntensity,
      roughness: 0.2,
      metalness: 0.1
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = false
    mesh.userData.neonMaterial = material // Store reference for animation
    group.add(mesh)

    // Add point light for glow effect
    const light = new THREE.PointLight(color, emissiveIntensity * 2, 10)
    light.position.z = 0.5
    group.add(light)
    group.userData.neonLight = light // Store reference for animation

    return group
  }

  /**
   * Start flicker and pulse animations
   */
  startAnimations() {
    if (this.neonConfig.flicker.enabled) {
      this.animatedElements.forEach(element => {
        this.scheduleFlicker(element)
      })
    }

    if (this.neonConfig.pulse.enabled) {
      this.startPulseAnimation()
    }
  }

  /**
   * Schedule random flicker effect
   */
  scheduleFlicker(element) {
    const flickerConfig = this.neonConfig.flicker
    const randomDelay = Math.random() * (flickerConfig.maxInterval - flickerConfig.minInterval) + flickerConfig.minInterval

    setTimeout(() => {
      this.performFlicker(element)
      this.scheduleFlicker(element) // Schedule next flicker
    }, randomDelay)
  }

  /**
   * Perform flicker animation
   */
  performFlicker(element) {
    const light = element.userData.neonLight
    const material = element.children[0].userData.neonMaterial

    if (!light || !material) return

    const originalIntensity = light.intensity
    const originalEmissive = material.emissiveIntensity

    // Quick flicker off and back on
    gsap.timeline()
      .to([light, material], {
        intensity: originalIntensity * 0.2,
        emissiveIntensity: originalEmissive * 0.2,
        duration: this.neonConfig.flicker.flickerDuration,
        ease: 'power1.in'
      })
      .to([light, material], {
        intensity: originalIntensity,
        emissiveIntensity: originalEmissive,
        duration: this.neonConfig.flicker.flickerDuration,
        ease: 'power1.out'
      })
  }

  /**
   * Start continuous pulse animation
   */
  startPulseAnimation() {
    const pulseConfig = this.neonConfig.pulse

    this.animatedElements.forEach((element, index) => {
      const light = element.userData.neonLight
      const material = element.children[0].userData.neonMaterial

      if (!light || !material) return

      const originalIntensity = light.intensity
      const originalEmissive = material.emissiveIntensity

      // Stagger the pulses for variety
      const delay = index * 0.3

      gsap.timeline({ repeat: -1, delay })
        .to([light, material], {
          intensity: originalIntensity * pulseConfig.min,
          emissiveIntensity: originalEmissive * pulseConfig.min,
          duration: pulseConfig.speed,
          ease: 'sine.inOut'
        })
        .to([light, material], {
          intensity: originalIntensity * pulseConfig.max,
          emissiveIntensity: originalEmissive * pulseConfig.max,
          duration: pulseConfig.speed,
          ease: 'sine.inOut'
        })
    })
  }

  getGroup() {
    return this.group
  }

  dispose() {
    // Clean up animations
    gsap.killTweensOf(this.animatedElements)
  }
}

export default NeonElements
