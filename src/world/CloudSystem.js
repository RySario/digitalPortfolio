/**
 * Cloud System
 * Creates low-poly clouds floating in the sky
 */

import * as THREE from 'three'
import { Config } from '../core/Config.js'
import { GeometryUtils } from '../utils/GeometryUtils.js'

export class CloudSystem {
  constructor(scene) {
    this.scene = scene
    this.clouds = []

    this.createClouds()
  }

  /**
   * Create multiple clouds scattered in the sky
   */
  createClouds() {
    const config = Config.clouds

    for (let i = 0; i < config.count; i++) {
      const cloud = this.createCloud()

      // Random position in a circle
      const angle = (Math.PI * 2 * i) / config.count + (Math.random() - 0.5) * 0.5
      const radius = config.spreadRadius * (0.5 + Math.random() * 0.5)
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const y = config.minHeight + Math.random() * (config.maxHeight - config.minHeight)

      cloud.position.set(x, y, z)

      // Random rotation
      cloud.rotation.y = Math.random() * Math.PI * 2

      // Random scale
      const scale = config.minSize + Math.random() * (config.maxSize - config.minSize)
      cloud.scale.set(scale, scale * 0.6, scale)

      this.scene.add(cloud)
      this.clouds.push({
        mesh: cloud,
        driftSpeed: 0.1 + Math.random() * 0.2,
        bobSpeed: 0.5 + Math.random() * 0.5,
        bobAmount: 0.5 + Math.random() * 1,
        initialY: y
      })
    }

    console.log(`Created ${this.clouds.length} clouds`)
  }

  /**
   * Create a single low-poly cloud
   * @returns {THREE.Group}
   */
  createCloud() {
    const group = new THREE.Group()

    const cloudMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      flatShading: true,
      transparent: true,
      opacity: 0.9
    })

    // Create cloud from multiple overlapping spheres
    const puffCount = 5 + Math.floor(Math.random() * 4)

    for (let i = 0; i < puffCount; i++) {
      const puffGeometry = new THREE.SphereGeometry(
        0.8 + Math.random() * 0.4,
        5,
        4
      )
      const puff = new THREE.Mesh(puffGeometry, cloudMaterial)

      // Random offset
      puff.position.x = (Math.random() - 0.5) * 2
      puff.position.y = (Math.random() - 0.5) * 0.5
      puff.position.z = (Math.random() - 0.5) * 1.5

      puff.castShadow = false
      puff.receiveShadow = false

      group.add(puff)
    }

    return group
  }

  /**
   * Update clouds - drift and gentle bobbing
   * @param {number} delta
   */
  update(delta) {
    const time = Date.now() * 0.001

    this.clouds.forEach((cloud, index) => {
      // Slow drift
      cloud.mesh.position.x += cloud.driftSpeed * delta

      // Wrap around
      if (cloud.mesh.position.x > Config.clouds.spreadRadius) {
        cloud.mesh.position.x = -Config.clouds.spreadRadius
      }

      // Gentle bobbing
      cloud.mesh.position.y = cloud.initialY + Math.sin(time * cloud.bobSpeed + index) * cloud.bobAmount
    })
  }

  /**
   * Get all cloud meshes
   * @returns {Array}
   */
  getClouds() {
    return this.clouds
  }
}

export default CloudSystem
