/**
 * Utility functions for creating low-poly geometries
 * All shapes use flat shading and geometric patterns
 */

import * as THREE from 'three'
import { ColorPalettes } from './ColorPalettes.js'

export class GeometryUtils {
  /**
   * Noise function for terrain generation
   */
  static noise(x, z, freq, seed) {
    return (
      Math.sin(x * freq + seed) * Math.cos(z * freq * 0.7 + seed * 0.5) +
      Math.sin(x * freq * 1.7 + z * freq * 1.3 + seed * 0.3) * 0.5 +
      Math.cos(x * freq * 0.5 + z * freq * 2.1 + seed * 0.8) * 0.3
    ) / 1.8
  }

  /**
   * Get terrain height at a specific point
   * @param {number} x - X coordinate
   * @param {number} z - Z coordinate
   * @param {number} radius - Island radius
   * @param {number} seed - Random seed
   * @returns {number} Height at that point
   */
  static getTerrainHeight(x, z, radius, seed = 1000) {
    const distanceFromCenter = Math.sqrt(x * x + z * z)
    const normalizedDistance = distanceFromCenter / radius

    // Outside island
    if (normalizedDistance > 1) return -10

    // Multiple octaves of noise
    const hillNoise1 = this.noise(x, z, 0.06, seed) * 4
    const hillNoise2 = this.noise(x, z, 0.12, seed + 100) * 2
    const hillNoise3 = this.noise(x, z, 0.25, seed + 200) * 1

    let totalHeight = hillNoise1 + hillNoise2 + hillNoise3

    // Edge falloff - smooth transition to edge
    const edgeFalloff = Math.pow(Math.max(0, 1 - normalizedDistance), 0.7)
    totalHeight *= edgeFalloff

    // Base height + terrain variation
    return 3 + Math.max(0, totalHeight * 1.5)
  }

  /**
   * Create a solid island terrain using a disc with raised edges
   * This approach creates a watertight mesh without gaps
   * @param {number} radius - Island radius
   * @param {number} segments - Number of segments
   * @returns {THREE.BufferGeometry}
   */
  static createLowPolyIsland(radius = 40, segments = 64) {
    const actualSegments = Math.max(segments, 48)
    const rings = Math.floor(actualSegments / 2)
    const seed = radius * 1000

    // Create vertices for top surface
    const vertices = []
    const indices = []
    const normals = []
    const uvs = []

    // Center vertex
    const centerHeight = this.getTerrainHeight(0, 0, radius, seed)
    vertices.push(0, centerHeight, 0)
    normals.push(0, 1, 0)
    uvs.push(0.5, 0.5)

    // Generate concentric rings of vertices for top surface
    for (let ring = 1; ring <= rings; ring++) {
      const ringRadius = (ring / rings) * radius
      const ringSegments = actualSegments

      for (let seg = 0; seg < ringSegments; seg++) {
        const angle = (seg / ringSegments) * Math.PI * 2
        const x = Math.cos(angle) * ringRadius
        const z = Math.sin(angle) * ringRadius
        const y = this.getTerrainHeight(x, z, radius, seed)

        vertices.push(x, y, z)
        normals.push(0, 1, 0)  // Will be recalculated
        uvs.push(0.5 + (x / radius) * 0.5, 0.5 + (z / radius) * 0.5)
      }
    }

    // Create triangles for top surface
    // Center triangles (first ring) - winding order corrected for visibility from above
    for (let seg = 0; seg < actualSegments; seg++) {
      const next = (seg + 1) % actualSegments
      indices.push(0, next + 1, seg + 1)  // Reversed winding order
    }

    // Ring triangles - winding order corrected
    for (let ring = 1; ring < rings; ring++) {
      const ringStart = 1 + (ring - 1) * actualSegments
      const nextRingStart = 1 + ring * actualSegments

      for (let seg = 0; seg < actualSegments; seg++) {
        const next = (seg + 1) % actualSegments

        const curr = ringStart + seg
        const currNext = ringStart + next
        const outer = nextRingStart + seg
        const outerNext = nextRingStart + next

        // Two triangles per quad - reversed winding order
        indices.push(curr, currNext, outer)
        indices.push(currNext, outerNext, outer)
      }
    }

    // Add cliff sides
    const outerRingStart = 1 + (rings - 1) * actualSegments
    const cliffBaseY = -8  // Lower cliff base to fully hide from ocean
    const sideVertexStart = vertices.length / 3

    // Add bottom ring vertices
    for (let seg = 0; seg < actualSegments; seg++) {
      const angle = (seg / actualSegments) * Math.PI * 2
      const x = Math.cos(angle) * radius * 0.95  // Less tapered for better coverage
      const z = Math.sin(angle) * radius * 0.95

      vertices.push(x, cliffBaseY, z)
      normals.push(Math.cos(angle), 0, Math.sin(angle))
      uvs.push(seg / actualSegments, 0)
    }

    // Create cliff face triangles - reversed winding order for outside visibility
    for (let seg = 0; seg < actualSegments; seg++) {
      const next = (seg + 1) % actualSegments

      const topCurr = outerRingStart + seg
      const topNext = outerRingStart + next
      const botCurr = sideVertexStart + seg
      const botNext = sideVertexStart + next

      indices.push(topCurr, topNext, botCurr)
      indices.push(topNext, botNext, botCurr)
    }

    // Add bottom cap - visible from below
    const bottomCenterIdx = vertices.length / 3
    vertices.push(0, cliffBaseY, 0)
    normals.push(0, -1, 0)
    uvs.push(0.5, 0.5)

    for (let seg = 0; seg < actualSegments; seg++) {
      const next = (seg + 1) % actualSegments
      indices.push(bottomCenterIdx, sideVertexStart + seg, sideVertexStart + next)  // Reversed
    }

    // Create geometry
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geometry.setIndex(indices)

    // Recompute normals for smooth shading
    geometry.computeVertexNormals()

    return geometry
  }

  /**
   * Create a fully textured island with varied terrain colors
   * @param {number} radius - Island radius
   * @param {number} segments - Number of segments
   * @returns {THREE.Mesh}
   */
  static createTexturedIsland(radius = 40, segments = 64) {
    const geometry = this.createLowPolyIsland(radius, segments)
    const positions = geometry.attributes.position
    const colors = new Float32Array(positions.count * 3)

    const seed = radius * 1000

    // Rich color palette for varied terrain
    const colors_palette = {
      sand: new THREE.Color(0xC2B280),       // Sandy beach
      sandDark: new THREE.Color(0xA89060),   // Wet sand
      grassLight: new THREE.Color(0x7CCD7C), // Light grass
      grass: new THREE.Color(0x4CAF50),      // Normal grass
      grassDark: new THREE.Color(0x2E7D32),  // Dark grass
      dirt: new THREE.Color(0x8B7355),       // Dirt path
      dirtDark: new THREE.Color(0x654321),   // Dark dirt
      rock: new THREE.Color(0x808080),       // Gray rock
      rockDark: new THREE.Color(0x505050),   // Dark rock
      moss: new THREE.Color(0x4A5D23),       // Mossy rock
    }

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const y = positions.getY(i)
      const z = positions.getZ(i)
      const distFromCenter = Math.sqrt(x * x + z * z)
      const normalizedDist = distFromCenter / radius

      let color = new THREE.Color()

      // Add noise-based variation
      const variation = this.noise(x * 0.3, z * 0.3, 1, seed + 999) * 0.5 + 0.5
      const patchNoise = this.noise(x * 0.15, z * 0.15, 1, seed + 888)

      if (y < -3) {
        // Bottom/underwater - dark rock
        color.copy(colors_palette.rockDark)
      } else if (y < 0) {
        // Cliff face - rocky with moss patches
        if (patchNoise > 0.3) {
          color.lerpColors(colors_palette.rock, colors_palette.moss, variation)
        } else {
          color.lerpColors(colors_palette.rockDark, colors_palette.rock, variation)
        }
      } else if (y < 3.5) {
        // Beach/edge area - sand
        const t = y / 3.5
        color.lerpColors(colors_palette.sand, colors_palette.grassLight, t * variation)
      } else if (y < 5) {
        // Transition to grass
        const t = (y - 3.5) / 1.5
        if (patchNoise > 0.2) {
          color.lerpColors(colors_palette.grassLight, colors_palette.grass, t)
        } else {
          color.lerpColors(colors_palette.sand, colors_palette.dirt, t)
        }
      } else if (y < 7) {
        // Main grass area with dirt patches
        if (patchNoise > 0.4) {
          color.lerpColors(colors_palette.grass, colors_palette.grassDark, variation)
        } else if (patchNoise < -0.3) {
          color.lerpColors(colors_palette.dirt, colors_palette.dirtDark, variation)
        } else {
          color.lerpColors(colors_palette.grassLight, colors_palette.grass, variation)
        }
      } else if (y < 9) {
        // Higher elevation - more dirt and rock
        const t = (y - 7) / 2
        if (patchNoise > 0.2) {
          color.lerpColors(colors_palette.grassDark, colors_palette.dirt, t)
        } else {
          color.lerpColors(colors_palette.dirt, colors_palette.rock, t)
        }
      } else {
        // Hill tops - rocky
        color.lerpColors(colors_palette.rock, colors_palette.rockDark, variation)
        // Add moss patches
        if (patchNoise > 0.5) {
          color.lerp(colors_palette.moss, 0.4)
        }
      }

      // Subtle edge darkening
      const edgeDarken = 0.85 + (1 - normalizedDist) * 0.15
      color.multiplyScalar(edgeDarken)

      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.85,
      metalness: 0.05,
      flatShading: false
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true

    return mesh
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
   * Create a natural-looking rock with smooth shading
   * @param {number} scale - Rock size
   * @param {number} color - Rock color
   * @returns {THREE.Mesh}
   */
  static createLowPolyRock(scale = 1, color = 0x808080) {
    // Use higher subdivision for smoother appearance
    const geometry = new THREE.IcosahedronGeometry(scale, 2)
    const positions = geometry.attributes.position

    // Store original positions for consistent deformation
    const seed = Math.random() * 1000

    // Randomize vertices with noise for natural look
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const y = positions.getY(i)
      const z = positions.getZ(i)

      // Use coherent noise based on vertex position for smoother deformation
      const noiseVal = this.noise(x * 2, z * 2, 0.5, seed)
      const deform = 0.75 + noiseVal * 0.35

      positions.setX(i, x * deform)
      positions.setY(i, y * deform * 0.8) // Flatten slightly
      positions.setZ(i, z * deform)
    }

    geometry.computeVertexNormals()

    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.85,
      metalness: 0.05,
      flatShading: false  // Smooth shading for better appearance
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
    // Use higher subdivision icosahedron for smooth, detailed rock
    const geometry = new THREE.IcosahedronGeometry(scale, 3)
    const positions = geometry.attributes.position

    // Use seed for consistent deformation
    const seed = Math.random() * 1000

    // Deform vertices for natural rock appearance with coherent noise
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const y = positions.getY(i)
      const z = positions.getZ(i)

      // Use coherent noise for smoother, more natural deformation
      const noiseVal = this.noise(x * 1.5, z * 1.5, 0.5, seed)
      const noiseVal2 = this.noise(x * 3, y * 3, 0.3, seed + 500)
      const deform = 0.7 + noiseVal * 0.25 + noiseVal2 * 0.15

      positions.setX(i, x * deform)
      positions.setY(i, y * deform * 0.85) // Slightly flattened
      positions.setZ(i, z * deform)
    }

    geometry.computeVertexNormals()

    const material = new THREE.MeshStandardMaterial({
      color: color,
      flatShading: false,  // Smooth shading for realistic rock
      roughness: 0.9,
      metalness: 0.05
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
    // Create smooth irregular hold shape with higher detail
    const geometry = new THREE.SphereGeometry(size, 16, 12)
    const positions = geometry.attributes.position

    const seed = Math.random() * 1000

    // Flatten one side (attach to wall) and add subtle variation
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const y = positions.getY(i)
      const z = positions.getZ(i)

      // Add subtle noise for natural look
      const noiseVal = this.noise(x * 5, y * 5, 1, seed) * 0.1

      if (z < 0) {
        positions.setZ(i, z * 0.3)
      }
      positions.setX(i, x * (1 + noiseVal))
      positions.setY(i, y * (1 + noiseVal))
    }

    geometry.computeVertexNormals()

    const material = new THREE.MeshStandardMaterial({
      color: color,
      flatShading: false,  // Smooth shading
      roughness: 0.75,
      metalness: 0.1
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
