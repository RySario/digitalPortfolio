/**
 * Utility functions for creating low-poly geometries
 * All shapes use flat shading and geometric patterns
 */

import * as THREE from 'three'
import { ColorPalettes } from './ColorPalettes.js'

export class GeometryUtils {
  /**
   * Create a low-poly island terrain
   * @param {number} radius - Island radius
   * @param {number} segments - Number of segments (low for poly effect)
   * @returns {THREE.BufferGeometry}
   */
  static createLowPolyIsland(radius = 10, segments = 8) {
    const geometry = new THREE.CylinderGeometry(
      radius,
      radius * 0.9,
      2,
      segments,
      1,
      false
    )

    // Randomize vertices for organic look
    const positions = geometry.attributes.position
    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i)

      // Add noise to top vertices
      if (y > 0.5) {
        const noise = Math.random() * 0.5 - 0.25
        positions.setY(i, y + noise)
      }

      // Vary bottom radius slightly
      if (y < -0.5) {
        const x = positions.getX(i)
        const z = positions.getZ(i)
        const noiseX = (Math.random() - 0.5) * 0.3
        const noiseZ = (Math.random() - 0.5) * 0.3
        positions.setX(i, x + noiseX)
        positions.setZ(i, z + noiseZ)
      }
    }

    geometry.computeVertexNormals()
    return geometry
  }

  /**
   * Create a low-poly tree
   * @param {number} color - Tree foliage color
   * @param {number} scale - Scale factor
   * @returns {THREE.Group}
   */
  static createLowPolyTree(color = 0x228B22, scale = 1) {
    const group = new THREE.Group()

    // Trunk
    const trunkGeom = new THREE.CylinderGeometry(
      0.3 * scale,
      0.4 * scale,
      2 * scale,
      5
    )
    const trunkMat = new THREE.MeshStandardMaterial({
      color: ColorPalettes.common.trunk,
      flatShading: true
    })
    const trunk = new THREE.Mesh(trunkGeom, trunkMat)
    trunk.position.y = 1 * scale
    trunk.castShadow = true
    group.add(trunk)

    // Foliage (cone)
    const foliageGeom = new THREE.ConeGeometry(1.5 * scale, 3 * scale, 6)
    const foliageMat = new THREE.MeshStandardMaterial({
      color: color,
      flatShading: true
    })
    const foliage = new THREE.Mesh(foliageGeom, foliageMat)
    foliage.position.y = 3.5 * scale
    foliage.castShadow = true
    group.add(foliage)

    return group
  }

  /**
   * Create a low-poly rock
   * @param {number} scale - Rock size
   * @param {number} color - Rock color
   * @returns {THREE.Mesh}
   */
  static createLowPolyRock(scale = 1, color = 0x808080) {
    const geometry = new THREE.DodecahedronGeometry(scale, 0)
    const positions = geometry.attributes.position

    // Randomize vertices
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const y = positions.getY(i)
      const z = positions.getZ(i)

      const noise = 0.7 + Math.random() * 0.6
      positions.setX(i, x * noise)
      positions.setY(i, y * noise)
      positions.setZ(i, z * noise)
    }

    geometry.computeVertexNormals()

    const material = new THREE.MeshStandardMaterial({
      color: color,
      flatShading: true
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true

    return mesh
  }

  /**
   * Create a low-poly bush/shrub
   * @param {number} color - Bush color
   * @param {number} scale - Bush size
   * @returns {THREE.Group}
   */
  static createLowPolyBush(color = 0x228B22, scale = 1) {
    const group = new THREE.Group()
    const material = new THREE.MeshStandardMaterial({
      color: color,
      flatShading: true
    })

    // Create 3-5 clustered spheres
    const count = 3 + Math.floor(Math.random() * 3)
    for (let i = 0; i < count; i++) {
      const geometry = new THREE.SphereGeometry(0.4 * scale, 5, 4)
      const mesh = new THREE.Mesh(geometry, material)

      // Random offset
      mesh.position.x = (Math.random() - 0.5) * 0.8 * scale
      mesh.position.y = (Math.random()) * 0.5 * scale
      mesh.position.z = (Math.random() - 0.5) * 0.8 * scale

      mesh.castShadow = true
      group.add(mesh)
    }

    return group
  }

  /**
   * Create a simple box decoration
   * @param {number} width
   * @param {number} height
   * @param {number} depth
   * @param {number} color
   * @returns {THREE.Mesh}
   */
  static createBox(width, height, depth, color) {
    const geometry = new THREE.BoxGeometry(width, height, depth)
    const material = new THREE.MeshStandardMaterial({
      color: color,
      flatShading: true
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true
    return mesh
  }

  /**
   * Create a simple cylinder
   * @param {number} radiusTop
   * @param {number} radiusBottom
   * @param {number} height
   * @param {number} color
   * @param {number} segments
   * @returns {THREE.Mesh}
   */
  static createCylinder(radiusTop, radiusBottom, height, color, segments = 6) {
    const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments)
    const material = new THREE.MeshStandardMaterial({
      color: color,
      flatShading: true
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true
    return mesh
  }

  /**
   * Create a simple sphere
   * @param {number} radius
   * @param {number} color
   * @param {number} segments
   * @returns {THREE.Mesh}
   */
  static createSphere(radius, color, segments = 6) {
    const geometry = new THREE.SphereGeometry(radius, segments, segments)
    const material = new THREE.MeshStandardMaterial({
      color: color,
      flatShading: true
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true
    return mesh
  }

  /**
   * Create a simple cone
   * @param {number} radius
   * @param {number} height
   * @param {number} color
   * @param {number} segments
   * @returns {THREE.Mesh}
   */
  static createCone(radius, height, color, segments = 6) {
    const geometry = new THREE.ConeGeometry(radius, height, segments)
    const material = new THREE.MeshStandardMaterial({
      color: color,
      flatShading: true
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true
    return mesh
  }
}

export default GeometryUtils
