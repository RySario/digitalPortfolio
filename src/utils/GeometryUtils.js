/**
 * Utility functions for creating low-poly geometries
 * All shapes use flat shading and geometric patterns
 */

import * as THREE from 'three'
import { ColorPalettes } from './ColorPalettes.js'

export class GeometryUtils {
  /**
   * Create a smooth island terrain with varied heights
   * @param {number} radius - Island radius
   * @param {number} segments - Number of segments (higher = smoother)
   * @param {number} heightVariation - How much height variation (0-1)
   * @returns {THREE.BufferGeometry}
   */
  static createLowPolyIsland(radius = 10, segments = 32, heightVariation = 0.3) {
    // Use high segment count for smooth, gap-free terrain
    const actualSegments = Math.max(segments, 32)

    const geometry = new THREE.CylinderGeometry(
      radius,
      radius * 0.9,   // Slightly tapered bottom
      4,              // Base height
      actualSegments, // Radial segments (around the circle)
      4,              // Height segments
      false           // Closed ends
    )

    // Create gentle terrain variation
    const positions = geometry.attributes.position
    const vertexCount = positions.count

    // Use seeded random for consistent terrain
    const seed = radius * 1000
    const seededRandom = (i) => {
      const x = Math.sin(seed + i) * 10000
      return x - Math.floor(x)
    }

    for (let i = 0; i < vertexCount; i++) {
      const x = positions.getX(i)
      const y = positions.getY(i)
      const z = positions.getZ(i)

      // Calculate distance from center
      const distanceFromCenter = Math.sqrt(x * x + z * z)
      const normalizedDistance = distanceFromCenter / radius

      // Add gentle height variation to top surface only
      if (y > 1.0) {
        const angle = Math.atan2(z, x)
        // Smooth noise using sine waves
        const noise1 = Math.sin(angle * 2 + distanceFromCenter * 0.5) * 0.4
        const noise2 = Math.cos(angle * 3) * 0.3

        // Combine for smooth hills
        const totalNoise = (noise1 + noise2) * heightVariation

        // More height in center, less at edges
        const heightMultiplier = 1 - (normalizedDistance * 0.7)
        const heightOffset = totalNoise * heightMultiplier * 1.5

        positions.setY(i, y + Math.max(0, heightOffset))
      }
    }

    // Recompute normals for proper lighting
    geometry.computeVertexNormals()
    return geometry
  }

  /**
   * Create a smooth tree
   * @param {number} color - Tree foliage color
   * @param {number} scale - Scale factor
   * @returns {THREE.Group}
   */
  static createLowPolyTree(color = 0x228B22, scale = 1) {
    const group = new THREE.Group()

    // Trunk - smooth cylinder
    const trunkGeom = new THREE.CylinderGeometry(
      0.3 * scale,
      0.4 * scale,
      2 * scale,
      16
    )
    const trunkMat = new THREE.MeshStandardMaterial({
      color: ColorPalettes.common.trunk
    })
    const trunk = new THREE.Mesh(trunkGeom, trunkMat)
    trunk.position.y = 1 * scale
    trunk.castShadow = true
    group.add(trunk)

    // Foliage (smooth cone)
    const foliageGeom = new THREE.ConeGeometry(1.5 * scale, 3 * scale, 24)
    const foliageMat = new THREE.MeshStandardMaterial({
      color: color
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
   * Create a smooth bush/shrub
   * @param {number} color - Bush color
   * @param {number} scale - Bush size
   * @returns {THREE.Group}
   */
  static createLowPolyBush(color = 0x228B22, scale = 1) {
    const group = new THREE.Group()
    const material = new THREE.MeshStandardMaterial({
      color: color
    })

    // Create 3-5 clustered spheres
    const count = 3 + Math.floor(Math.random() * 3)
    for (let i = 0; i < count; i++) {
      const geometry = new THREE.SphereGeometry(0.4 * scale, 16, 16)
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
   * Create a box decoration
   * @param {number} width
   * @param {number} height
   * @param {number} depth
   * @param {number} color
   * @returns {THREE.Mesh}
   */
  static createBox(width, height, depth, color) {
    const geometry = new THREE.BoxGeometry(width, height, depth)
    const material = new THREE.MeshStandardMaterial({
      color: color
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true
    return mesh
  }

  /**
   * Create a smooth cylinder
   * @param {number} radiusTop
   * @param {number} radiusBottom
   * @param {number} height
   * @param {number} color
   * @param {number} segments
   * @returns {THREE.Mesh}
   */
  static createCylinder(radiusTop, radiusBottom, height, color, segments = 24) {
    const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments)
    const material = new THREE.MeshStandardMaterial({
      color: color
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true
    return mesh
  }

  /**
   * Create a smooth sphere
   * @param {number} radius
   * @param {number} color
   * @param {number} segments
   * @returns {THREE.Mesh}
   */
  static createSphere(radius, color, segments = 24) {
    const geometry = new THREE.SphereGeometry(radius, segments, segments)
    const material = new THREE.MeshStandardMaterial({
      color: color
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true
    return mesh
  }

  /**
   * Create a smooth cone
   * @param {number} radius
   * @param {number} height
   * @param {number} color
   * @param {number} segments
   * @returns {THREE.Mesh}
   */
  static createCone(radius, height, color, segments = 24) {
    const geometry = new THREE.ConeGeometry(radius, height, segments)
    const material = new THREE.MeshStandardMaterial({
      color: color
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true
    return mesh
  }

  /**
   * Create a detailed boulder for climbing
   * @param {number} scale - Size of the boulder
   * @param {number} color - Boulder color
   * @returns {THREE.Mesh}
   */
  static createBoulder(scale = 2, color = 0x808080) {
    // Use icosahedron for more angular, realistic rock shape
    const geometry = new THREE.IcosahedronGeometry(scale, 1)
    const positions = geometry.attributes.position

    // Deform vertices for natural rock appearance
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const y = positions.getY(i)
      const z = positions.getZ(i)

      // Random deformation
      const deform = 0.6 + Math.random() * 0.8
      positions.setX(i, x * deform)
      positions.setY(i, y * deform * 0.9) // Slightly flattened
      positions.setZ(i, z * deform)
    }

    geometry.computeVertexNormals()

    const material = new THREE.MeshStandardMaterial({
      color: color,
      flatShading: true,
      roughness: 0.9,
      metalness: 0.1
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true

    return mesh
  }

  /**
   * Create climbing holds for bouldering wall
   * @param {number} size - Hold size
   * @param {number} color - Hold color
   * @returns {THREE.Mesh}
   */
  static createClimbingHold(size = 0.3, color = 0xFF6B35) {
    // Create irregular hold shape
    const geometry = new THREE.SphereGeometry(size, 6, 5)
    const positions = geometry.attributes.position

    // Flatten one side (attach to wall)
    for (let i = 0; i < positions.count; i++) {
      const z = positions.getZ(i)
      if (z < 0) {
        positions.setZ(i, z * 0.3)
      }
    }

    geometry.computeVertexNormals()

    const material = new THREE.MeshStandardMaterial({
      color: color,
      flatShading: true,
      roughness: 0.8
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true

    return mesh
  }

  /**
   * Create a bench
   * @param {number} length - Bench length
   * @param {number} color - Bench color
   * @returns {THREE.Group}
   */
  static createBench(length = 2, color = 0x8B4513) {
    const group = new THREE.Group()

    // Seat
    const seat = this.createBox(length, 0.15, 0.5, color)
    seat.position.y = 0.5
    group.add(seat)

    // Back rest
    const backrest = this.createBox(length, 0.8, 0.15, color)
    backrest.position.set(0, 0.9, -0.2)
    group.add(backrest)

    // Legs (4 legs)
    const legPositions = [
      [-length * 0.4, 0.25, 0.15],
      [length * 0.4, 0.25, 0.15],
      [-length * 0.4, 0.25, -0.15],
      [length * 0.4, 0.25, -0.15]
    ]

    legPositions.forEach(pos => {
      const leg = this.createBox(0.1, 0.5, 0.1, color)
      leg.position.set(...pos)
      group.add(leg)
    })

    return group
  }

  /**
   * Create a media display frame
   * @param {number} width - Frame width
   * @param {number} height - Frame height
   * @param {number} frameColor - Frame color
   * @returns {THREE.Group}
   */
  static createMediaFrame(width = 4, height = 3, frameColor = 0x2C3E50) {
    const group = new THREE.Group()

    // Frame border
    const frameThickness = 0.15
    const frameDepth = 0.2

    // Top border
    const top = this.createBox(width + frameThickness * 2, frameThickness, frameDepth, frameColor)
    top.position.y = height / 2 + frameThickness / 2
    group.add(top)

    // Bottom border
    const bottom = this.createBox(width + frameThickness * 2, frameThickness, frameDepth, frameColor)
    bottom.position.y = -height / 2 - frameThickness / 2
    group.add(bottom)

    // Left border
    const left = this.createBox(frameThickness, height, frameDepth, frameColor)
    left.position.x = -width / 2 - frameThickness / 2
    group.add(left)

    // Right border
    const right = this.createBox(frameThickness, height, frameDepth, frameColor)
    right.position.x = width / 2 + frameThickness / 2
    group.add(right)

    // Display surface (slightly inset)
    const displayGeometry = new THREE.PlaneGeometry(width, height)
    const displayMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      side: THREE.DoubleSide
    })
    const display = new THREE.Mesh(displayGeometry, displayMaterial)
    display.position.z = -frameDepth / 4
    group.add(display)

    // Store reference to display surface for later texture application
    group.userData.displaySurface = display

    return group
  }

  /**
   * Create an award pedestal
   * @param {number} height - Pedestal height
   * @param {number} color - Pedestal color
   * @returns {THREE.Group}
   */
  static createAwardPedestal(height = 1.5, color = 0xE8E8E8) {
    const group = new THREE.Group()

    // Base
    const base = this.createCylinder(0.4, 0.5, 0.2, color, 8)
    base.position.y = 0.1
    group.add(base)

    // Column
    const column = this.createCylinder(0.25, 0.25, height, color, 8)
    column.position.y = height / 2 + 0.2
    group.add(column)

    // Top platform
    const top = this.createCylinder(0.35, 0.3, 0.15, color, 8)
    top.position.y = height + 0.275
    group.add(top)

    return group
  }

  /**
   * Create a trophy or award
   * @param {number} scale - Trophy size
   * @param {number} color - Trophy color (gold, silver, bronze)
   * @returns {THREE.Group}
   */
  static createTrophy(scale = 0.5, color = 0xFFD700) {
    const group = new THREE.Group()

    // Base
    const base = this.createCylinder(0.3 * scale, 0.25 * scale, 0.1 * scale, color, 8)
    base.position.y = 0.05 * scale
    group.add(base)

    // Stem
    const stem = this.createCylinder(0.08 * scale, 0.08 * scale, 0.4 * scale, color, 6)
    stem.position.y = 0.3 * scale
    group.add(stem)

    // Cup
    const cup = this.createCylinder(0.25 * scale, 0.15 * scale, 0.35 * scale, color, 8)
    cup.position.y = 0.675 * scale
    group.add(cup)

    // Handles (left and right)
    const handleLeft = this.createCylinder(0.05 * scale, 0.05 * scale, 0.3 * scale, color, 6)
    handleLeft.rotation.z = Math.PI / 2
    handleLeft.position.set(-0.22 * scale, 0.65 * scale, 0)
    group.add(handleLeft)

    const handleRight = this.createCylinder(0.05 * scale, 0.05 * scale, 0.3 * scale, color, 6)
    handleRight.rotation.z = Math.PI / 2
    handleRight.position.set(0.22 * scale, 0.65 * scale, 0)
    group.add(handleRight)

    return group
  }

  /**
   * Create bleachers/stands for spectating
   * @param {number} rows - Number of rows
   * @param {number} width - Width of stands
   * @param {number} color - Stands color
   * @returns {THREE.Group}
   */
  static createStands(rows = 3, width = 6, color = 0x4A90E2) {
    const group = new THREE.Group()

    const rowHeight = 0.5
    const rowDepth = 0.8

    for (let i = 0; i < rows; i++) {
      // Seat platform
      const seat = this.createBox(width, 0.1, rowDepth, color)
      seat.position.set(0, rowHeight * i, -rowDepth * i)
      group.add(seat)

      // Back support
      if (i < rows - 1) {
        const back = this.createBox(width, rowHeight * 0.8, 0.1, color)
        back.position.set(0, rowHeight * i + rowHeight * 0.4, -rowDepth * (i + 0.5))
        group.add(back)
      }
    }

    return group
  }

  /**
   * Create decorative grass patches
   * @param {number} count - Number of grass blades
   * @param {number} spread - Spread radius
   * @param {number} color - Grass color
   * @returns {THREE.Group}
   */
  static createGrassPatch(count = 20, spread = 1, color = 0x7CFC00) {
    const group = new THREE.Group()

    for (let i = 0; i < count; i++) {
      const blade = this.createCone(0.05, 0.3 + Math.random() * 0.2, color, 3)
      blade.position.x = (Math.random() - 0.5) * spread
      blade.position.z = (Math.random() - 0.5) * spread
      blade.rotation.z = (Math.random() - 0.5) * 0.3
      group.add(blade)
    }

    return group
  }

  /**
   * Create a fence section
   * @param {number} length - Fence length
   * @param {number} height - Fence height
   * @param {number} color - Fence color
   * @returns {THREE.Group}
   */
  static createFence(length = 3, height = 1, color = 0x8B4513) {
    const group = new THREE.Group()

    const postCount = Math.floor(length / 0.8) + 1

    // Create posts
    for (let i = 0; i < postCount; i++) {
      const post = this.createBox(0.1, height, 0.1, color)
      post.position.x = (i / (postCount - 1)) * length - length / 2
      post.position.y = height / 2
      group.add(post)
    }

    // Horizontal rails
    const rail1 = this.createBox(length, 0.08, 0.08, color)
    rail1.position.y = height * 0.7
    group.add(rail1)

    const rail2 = this.createBox(length, 0.08, 0.08, color)
    rail2.position.y = height * 0.4
    group.add(rail2)

    return group
  }
}

export default GeometryUtils
