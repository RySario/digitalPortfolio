/**
 * Grass System
 * Creates animated grass that sways in the wind
 * Uses instanced meshes for performance
 */

import * as THREE from 'three'
import { GeometryUtils } from '../utils/GeometryUtils.js'

export class GrassSystem {
  constructor(scene) {
    this.scene = scene
    this.grassPatches = []
    this.time = 0
  }

  /**
   * Add grass to an island
   * @param {THREE.Vector3} islandPosition - Island center position
   * @param {number} radius - Island radius
   * @param {number} density - Grass density (blades per unit area)
   */
  addGrassToIsland(islandPosition, radius, density = 0.3) {
    const seed = islandPosition.x * 1000 + islandPosition.z
    const grassGroup = new THREE.Group()
    grassGroup.position.copy(islandPosition)

    // Calculate number of grass patches based on area
    const area = Math.PI * radius * radius
    const patchCount = Math.floor(area * density * 0.1)

    // Create grass blade geometry (simple cone)
    const bladeGeometry = new THREE.ConeGeometry(0.05, 0.4, 4)
    bladeGeometry.translate(0, 0.2, 0)  // Move pivot to base

    // Multiple grass colors for variety
    const grassColors = [
      0x4CAF50,  // Green
      0x66BB6A,  // Light green
      0x43A047,  // Medium green
      0x388E3C,  // Dark green
      0x7CB342,  // Lime green
      0x558B2F,  // Olive green
    ]

    // Create instanced mesh for each color
    const instancesPerColor = Math.floor(patchCount * 15 / grassColors.length)

    grassColors.forEach((color, colorIndex) => {
      const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.8,
        metalness: 0,
        side: THREE.DoubleSide
      })

      const instancedMesh = new THREE.InstancedMesh(
        bladeGeometry,
        material,
        instancesPerColor
      )
      instancedMesh.castShadow = true
      instancedMesh.receiveShadow = true

      const dummy = new THREE.Object3D()
      let instanceIndex = 0

      for (let i = 0; i < instancesPerColor; i++) {
        // Random position within island
        const angle = Math.random() * Math.PI * 2
        const dist = Math.random() * radius * 0.85  // Keep away from edges
        const x = Math.cos(angle) * dist
        const z = Math.sin(angle) * dist

        // Get terrain height at this position
        const terrainHeight = GeometryUtils.getTerrainHeight(x, z, radius, radius * 1000)

        // Only place grass on grassy areas (not on sand or rock)
        if (terrainHeight < 4 || terrainHeight > 9) continue

        // Position
        dummy.position.set(x, terrainHeight, z)

        // Random rotation
        dummy.rotation.y = Math.random() * Math.PI * 2

        // Random scale for variety
        const scale = 0.6 + Math.random() * 0.8
        dummy.scale.set(scale, scale + Math.random() * 0.5, scale)

        // Store wind phase for animation
        dummy.userData.windPhase = Math.random() * Math.PI * 2
        dummy.userData.windStrength = 0.5 + Math.random() * 0.5

        dummy.updateMatrix()
        instancedMesh.setMatrixAt(instanceIndex, dummy.matrix)
        instanceIndex++
      }

      instancedMesh.count = instanceIndex
      instancedMesh.instanceMatrix.needsUpdate = true

      // Store reference for animation
      instancedMesh.userData.baseMatrices = []
      for (let i = 0; i < instanceIndex; i++) {
        const matrix = new THREE.Matrix4()
        instancedMesh.getMatrixAt(i, matrix)
        instancedMesh.userData.baseMatrices.push(matrix.clone())
      }

      grassGroup.add(instancedMesh)
    })

    this.scene.add(grassGroup)
    this.grassPatches.push(grassGroup)

    return grassGroup
  }

  /**
   * Add flowers scattered in the grass
   * @param {THREE.Vector3} islandPosition - Island center
   * @param {number} radius - Island radius
   */
  addFlowersToIsland(islandPosition, radius) {
    const flowerGroup = new THREE.Group()
    flowerGroup.position.copy(islandPosition)

    // Flower colors
    const flowerColors = [
      0xFF6B6B,  // Red
      0xFFE66D,  // Yellow
      0x4ECDC4,  // Teal
      0xFFFFFF,  // White
      0xFF69B4,  // Pink
      0x9B59B6,  // Purple
    ]

    const flowerCount = Math.floor(radius * 2)

    flowerColors.forEach(color => {
      for (let i = 0; i < flowerCount / flowerColors.length; i++) {
        const angle = Math.random() * Math.PI * 2
        const dist = Math.random() * radius * 0.8
        const x = Math.cos(angle) * dist
        const z = Math.sin(angle) * dist

        const terrainHeight = GeometryUtils.getTerrainHeight(x, z, radius, radius * 1000)
        if (terrainHeight < 4.5 || terrainHeight > 8) continue

        // Flower stem
        const stemGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 4)
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x228B22 })
        const stem = new THREE.Mesh(stemGeom, stemMat)
        stem.position.set(x, terrainHeight + 0.15, z)

        // Flower head
        const petalGeom = new THREE.SphereGeometry(0.08, 8, 8)
        const petalMat = new THREE.MeshStandardMaterial({ color: color })
        const petals = new THREE.Mesh(petalGeom, petalMat)
        petals.position.set(x, terrainHeight + 0.35, z)
        petals.scale.set(1, 0.6, 1)

        // Flower center
        const centerGeom = new THREE.SphereGeometry(0.04, 6, 6)
        const centerMat = new THREE.MeshStandardMaterial({ color: 0xFFD700 })
        const center = new THREE.Mesh(centerGeom, centerMat)
        center.position.set(x, terrainHeight + 0.38, z)

        flowerGroup.add(stem)
        flowerGroup.add(petals)
        flowerGroup.add(center)
      }
    })

    this.scene.add(flowerGroup)
    this.grassPatches.push(flowerGroup)

    return flowerGroup
  }

  /**
   * Update grass animation (wind sway)
   * @param {number} delta - Time delta
   */
  update(delta) {
    this.time += delta

    // Wind parameters
    const windSpeed = 2
    const windStrength = 0.15

    this.grassPatches.forEach(patch => {
      patch.children.forEach(child => {
        if (child instanceof THREE.InstancedMesh && child.userData.baseMatrices) {
          const dummy = new THREE.Object3D()

          for (let i = 0; i < child.count; i++) {
            const baseMatrix = child.userData.baseMatrices[i]
            if (!baseMatrix) continue

            // Decompose base matrix
            const position = new THREE.Vector3()
            const quaternion = new THREE.Quaternion()
            const scale = new THREE.Vector3()
            baseMatrix.decompose(position, quaternion, scale)

            // Calculate wind sway
            const phase = position.x * 0.5 + position.z * 0.3 + this.time * windSpeed
            const swayX = Math.sin(phase) * windStrength
            const swayZ = Math.cos(phase * 0.7) * windStrength * 0.5

            // Apply sway rotation
            dummy.position.copy(position)
            dummy.quaternion.copy(quaternion)
            dummy.scale.copy(scale)
            dummy.rotation.x += swayX
            dummy.rotation.z += swayZ

            dummy.updateMatrix()
            child.setMatrixAt(i, dummy.matrix)
          }

          child.instanceMatrix.needsUpdate = true
        }
      })
    })
  }

  /**
   * Clean up grass system
   */
  dispose() {
    this.grassPatches.forEach(patch => {
      patch.children.forEach(child => {
        if (child.geometry) child.geometry.dispose()
        if (child.material) child.material.dispose()
      })
      this.scene.remove(patch)
    })
    this.grassPatches = []
  }
}

export default GrassSystem
