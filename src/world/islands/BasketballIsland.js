/**
 * Basketball themed island - Golden 1 Center Arena
 * Sacramento Kings home court with interactive basketball
 * Features flat arena floor with proper structure
 */

import * as THREE from 'three'
import { Island } from '../Island.js'
import { ColorPalettes } from '../../utils/ColorPalettes.js'
import { GeometryUtils } from '../../utils/GeometryUtils.js'
import { Basketball } from '../../interactive/Basketball.js'
import { Config } from '../../core/Config.js'

export class BasketballIsland extends Island {
  constructor(position) {
    super(position)
    this.color = ColorPalettes.basketball.ground
    this.basketballs = []
    this.hoops = []
    this.score = 0
    this.arenaCollisionMeshes = []

    // Sacramento Kings colors
    this.kingsColors = {
      purple: 0x5A2D82,
      silver: 0xC4CED4,
      black: 0x000000,
      white: 0xFFFFFF,
      gray: 0x63727A,
      darkGray: 0x2A2A2A
    }

    // Arena dimensions - MUCH bigger for proper scale
    this.arenaRadius = 60
    this.floorHeight = 2
    this.courtScale = 1.8  // Scale up the court
  }

  /**
   * Override terrain creation to make a flat arena platform
   */
  createTerrain() {
    // Much larger island for the arena
    this.radius = 75
    this.seed = this.radius * 1000

    // Create a mostly flat circular platform for the arena
    const segments = 64
    const geometry = new THREE.BufferGeometry()

    const vertices = []
    const normals = []
    const uvs = []
    const indices = []

    // Center vertex
    vertices.push(0, this.floorHeight, 0)
    normals.push(0, 1, 0)
    uvs.push(0.5, 0.5)

    // Concentric rings with flat center and sloped edges
    const rings = 32
    for (let ring = 1; ring <= rings; ring++) {
      const ringRadius = (ring / rings) * this.radius

      for (let seg = 0; seg < segments; seg++) {
        const angle = (seg / segments) * Math.PI * 2
        const x = Math.cos(angle) * ringRadius
        const z = Math.sin(angle) * ringRadius

        // Flat in the center (arena area), then slope down at edges
        const normalizedDist = ringRadius / this.radius
        let y = this.floorHeight

        if (normalizedDist > 0.75) {
          // Slope down at edges
          const edgeFactor = (normalizedDist - 0.75) / 0.25
          y = this.floorHeight - edgeFactor * 3
        }

        vertices.push(x, y, z)
        normals.push(0, 1, 0)
        uvs.push(0.5 + (x / this.radius) * 0.5, 0.5 + (z / this.radius) * 0.5)
      }
    }

    // Create triangles - center ring (reversed winding for top visibility)
    for (let seg = 0; seg < segments; seg++) {
      const next = (seg + 1) % segments
      indices.push(0, next + 1, seg + 1)
    }

    // Ring triangles (reversed winding)
    for (let ring = 1; ring < rings; ring++) {
      const ringStart = 1 + (ring - 1) * segments
      const nextRingStart = 1 + ring * segments

      for (let seg = 0; seg < segments; seg++) {
        const next = (seg + 1) % segments
        const curr = ringStart + seg
        const currNext = ringStart + next
        const outer = nextRingStart + seg
        const outerNext = nextRingStart + next

        indices.push(curr, currNext, outer)
        indices.push(currNext, outerNext, outer)
      }
    }

    // Add cliff sides
    const outerRingStart = 1 + (rings - 1) * segments
    const cliffBaseY = -8
    const sideVertexStart = vertices.length / 3

    for (let seg = 0; seg < segments; seg++) {
      const angle = (seg / segments) * Math.PI * 2
      const x = Math.cos(angle) * this.radius * 0.95
      const z = Math.sin(angle) * this.radius * 0.95

      vertices.push(x, cliffBaseY, z)
      normals.push(Math.cos(angle), 0, Math.sin(angle))
      uvs.push(seg / segments, 0)
    }

    // Cliff face triangles
    for (let seg = 0; seg < segments; seg++) {
      const next = (seg + 1) % segments
      const topCurr = outerRingStart + seg
      const topNext = outerRingStart + next
      const botCurr = sideVertexStart + seg
      const botNext = sideVertexStart + next

      indices.push(topCurr, topNext, botCurr)
      indices.push(topNext, botNext, botCurr)
    }

    // Bottom cap
    const bottomCenterIdx = vertices.length / 3
    vertices.push(0, cliffBaseY, 0)
    normals.push(0, -1, 0)
    uvs.push(0.5, 0.5)

    for (let seg = 0; seg < segments; seg++) {
      const next = (seg + 1) % segments
      indices.push(bottomCenterIdx, sideVertexStart + seg, sideVertexStart + next)
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geometry.setIndex(indices)
    geometry.computeVertexNormals()

    // Use a concrete/stone material for the arena base
    const material = new THREE.MeshStandardMaterial({
      color: 0x404040,
      roughness: 0.9,
      metalness: 0.1
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.receiveShadow = true
    this.group.add(mesh)

    this.collisionMesh = mesh
    this.boundingBox = new THREE.Box3().setFromObject(mesh)
  }

  /**
   * Override to not add terrain rocks in the arena
   */
  addTerrainRocks() {
    // No random rocks in the arena - keep it clean
  }

  /**
   * Get terrain height - flat for arena area
   */
  getTerrainHeightAt(localX, localZ) {
    const dist = Math.sqrt(localX * localX + localZ * localZ)
    const normalizedDist = dist / this.radius

    if (normalizedDist > 1) return -10

    if (normalizedDist > 0.75) {
      const edgeFactor = (normalizedDist - 0.75) / 0.25
      return this.floorHeight - edgeFactor * 3
    }

    return this.floorHeight
  }

  createDecorations() {
    // Build the arena from the ground up
    this.createArenaStructure()
    this.createHardwoodCourt()
    this.createProfessionalHoops()
    this.createArenaSeating()
    this.createArenaRoof()
    this.createJumbotron()
    this.createEntrances()
    this.createArenaLighting()
  }

  /**
   * Create the main arena structure base
   */
  createArenaStructure() {
    // Outer arena wall (circular) - taller for larger arena
    const wallHeight = 20
    const wallThickness = 1.5
    const outerRadius = this.arenaRadius
    const innerRadius = this.arenaRadius - wallThickness

    // Create wall segments for collision
    const wallSegments = 32
    const wallMat = new THREE.MeshStandardMaterial({
      color: this.kingsColors.darkGray,
      roughness: 0.8
    })

    for (let i = 0; i < wallSegments; i++) {
      const angle = (i / wallSegments) * Math.PI * 2
      const nextAngle = ((i + 1) / wallSegments) * Math.PI * 2

      // Skip where entrances are (at 0, 90, 180, 270 degrees)
      const angleDeg = (angle * 180 / Math.PI) % 360
      const isEntrance = (angleDeg > 355 || angleDeg < 5) ||
                        (angleDeg > 85 && angleDeg < 95) ||
                        (angleDeg > 175 && angleDeg < 185) ||
                        (angleDeg > 265 && angleDeg < 275)

      if (isEntrance) continue

      const segmentAngle = (angle + nextAngle) / 2
      const segmentLength = outerRadius * (2 * Math.PI / wallSegments)

      const wallGeom = new THREE.BoxGeometry(wallThickness, wallHeight, segmentLength + 0.5)
      const wall = new THREE.Mesh(wallGeom, wallMat)

      const x = Math.cos(segmentAngle) * (outerRadius - wallThickness / 2)
      const z = Math.sin(segmentAngle) * (outerRadius - wallThickness / 2)

      wall.position.set(x, this.floorHeight + wallHeight / 2, z)
      wall.rotation.y = -segmentAngle + Math.PI / 2

      wall.castShadow = true
      wall.receiveShadow = true
      this.group.add(wall)
      this.arenaCollisionMeshes.push(wall)
    }

    // Arena floor (concrete underneath the court)
    const floorGeom = new THREE.CylinderGeometry(outerRadius - 1, outerRadius - 1, 0.3, 48)
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x3A3A3A,
      roughness: 0.9
    })
    const floor = new THREE.Mesh(floorGeom, floorMat)
    floor.position.y = this.floorHeight + 0.15
    floor.receiveShadow = true
    this.group.add(floor)
    this.arenaCollisionMeshes.push(floor)
  }

  /**
   * Create authentic hardwood basketball court
   */
  createHardwoodCourt() {
    const courtWidth = 15 * this.courtScale  // Standard NBA width scaled up
    const courtLength = 28 * this.courtScale  // Standard NBA length scaled up

    // Main hardwood surface
    const courtGeom = new THREE.BoxGeometry(courtLength, 0.15, courtWidth)
    const courtMat = new THREE.MeshStandardMaterial({
      color: 0xDEB887,  // Classic hardwood
      roughness: 0.5,
      metalness: 0.05
    })
    const court = new THREE.Mesh(courtGeom, courtMat)
    court.position.y = this.floorHeight + 0.38
    court.receiveShadow = true
    this.group.add(court)
    this.arenaCollisionMeshes.push(court)

    // Court out-of-bounds area (darker wood)
    const outerGeom = new THREE.BoxGeometry(courtLength + 4, 0.12, courtWidth + 4)
    const outerMat = new THREE.MeshStandardMaterial({
      color: 0x8B7355,
      roughness: 0.6
    })
    const outer = new THREE.Mesh(outerGeom, outerMat)
    outer.position.y = this.floorHeight + 0.36
    outer.receiveShadow = true
    this.group.add(outer)

    // Court lines
    this.createCourtLines(courtLength, courtWidth)

    // Center court Kings logo
    this.createCenterLogo()

    // Painted areas (the "paint")
    this.createPaintedAreas(courtLength, courtWidth)
  }

  /**
   * Create court line markings
   */
  createCourtLines(courtLength, courtWidth) {
    const lineY = this.floorHeight + 0.46
    const lineMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF })

    // Boundary lines
    const lineWidth = 0.08

    // Sidelines
    const sideGeom = new THREE.BoxGeometry(courtLength, 0.02, lineWidth)
    const side1 = new THREE.Mesh(sideGeom, lineMat)
    side1.position.set(0, lineY, courtWidth / 2)
    this.group.add(side1)

    const side2 = new THREE.Mesh(sideGeom.clone(), lineMat)
    side2.position.set(0, lineY, -courtWidth / 2)
    this.group.add(side2)

    // Baselines
    const baseGeom = new THREE.BoxGeometry(lineWidth, 0.02, courtWidth)
    const base1 = new THREE.Mesh(baseGeom, lineMat)
    base1.position.set(courtLength / 2, lineY, 0)
    this.group.add(base1)

    const base2 = new THREE.Mesh(baseGeom.clone(), lineMat)
    base2.position.set(-courtLength / 2, lineY, 0)
    this.group.add(base2)

    // Half-court line
    const halfGeom = new THREE.BoxGeometry(lineWidth, 0.02, courtWidth)
    const halfLine = new THREE.Mesh(halfGeom, lineMat)
    halfLine.position.set(0, lineY, 0)
    this.group.add(halfLine)

    // Center circle
    const circleRadius = 1.8
    const segments = 36
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      const segGeom = new THREE.BoxGeometry(lineWidth, 0.02, 0.35)
      const seg = new THREE.Mesh(segGeom, lineMat)
      seg.position.set(
        Math.cos(angle) * circleRadius,
        lineY,
        Math.sin(angle) * circleRadius
      )
      seg.rotation.y = angle + Math.PI / 2
      this.group.add(seg)
    }

    // Three-point arcs
    this.createThreePointArc(courtLength / 2, lineY, lineMat, 1)
    this.createThreePointArc(-courtLength / 2, lineY, lineMat, -1)

    // Free throw lines
    this.createFreeThrowArea(courtLength / 2 - 5.8, lineY, lineMat)
    this.createFreeThrowArea(-courtLength / 2 + 5.8, lineY, lineMat)
  }

  createThreePointArc(baseX, y, material, direction) {
    const arcRadius = 7.24
    const arcSegments = 18

    // Arc portion
    for (let i = 0; i <= arcSegments; i++) {
      const angle = (i / arcSegments) * Math.PI - Math.PI / 2
      const segGeom = new THREE.BoxGeometry(0.08, 0.02, 0.5)
      const seg = new THREE.Mesh(segGeom, material)

      const x = baseX + Math.cos(angle) * arcRadius * direction * -1
      const z = Math.sin(angle) * arcRadius

      seg.position.set(x, y, z)
      seg.rotation.y = angle * direction
      this.group.add(seg)
    }

    // Corner straight sections
    const cornerGeom = new THREE.BoxGeometry(4.5, 0.02, 0.08)
    const corner1 = new THREE.Mesh(cornerGeom, material)
    corner1.position.set(baseX - 2.25 * direction, y, 7.24)
    this.group.add(corner1)

    const corner2 = new THREE.Mesh(cornerGeom.clone(), material)
    corner2.position.set(baseX - 2.25 * direction, y, -7.24)
    this.group.add(corner2)
  }

  createFreeThrowArea(centerX, y, material) {
    // Free throw line
    const ftLineGeom = new THREE.BoxGeometry(0.08, 0.02, 3.6)
    const ftLine = new THREE.Mesh(ftLineGeom, material)
    ftLine.position.set(centerX, y, 0)
    this.group.add(ftLine)

    // Lane lines
    const laneLength = 5.8
    const laneGeom = new THREE.BoxGeometry(laneLength, 0.02, 0.08)

    const lane1 = new THREE.Mesh(laneGeom, material)
    lane1.position.set(centerX + (centerX > 0 ? -laneLength/2 : laneLength/2), y, 1.8)
    this.group.add(lane1)

    const lane2 = new THREE.Mesh(laneGeom.clone(), material)
    lane2.position.set(centerX + (centerX > 0 ? -laneLength/2 : laneLength/2), y, -1.8)
    this.group.add(lane2)
  }

  /**
   * Create painted key areas
   */
  createPaintedAreas(courtLength, courtWidth) {
    const paintY = this.floorHeight + 0.39

    // Left paint
    const paintGeom = new THREE.BoxGeometry(5.8, 0.02, 3.6)
    const paintMat = new THREE.MeshStandardMaterial({
      color: this.kingsColors.purple,
      roughness: 0.6
    })

    const leftPaint = new THREE.Mesh(paintGeom, paintMat)
    leftPaint.position.set(-courtLength / 2 + 2.9, paintY, 0)
    this.group.add(leftPaint)

    const rightPaint = new THREE.Mesh(paintGeom.clone(), paintMat)
    rightPaint.position.set(courtLength / 2 - 2.9, paintY, 0)
    this.group.add(rightPaint)
  }

  /**
   * Create center court Kings logo
   */
  createCenterLogo() {
    const logoY = this.floorHeight + 0.47

    // Purple circle
    const circleGeom = new THREE.CylinderGeometry(1.5, 1.5, 0.02, 32)
    const circleMat = new THREE.MeshStandardMaterial({
      color: this.kingsColors.purple,
      roughness: 0.5
    })
    const circle = new THREE.Mesh(circleGeom, circleMat)
    circle.position.y = logoY
    this.group.add(circle)

    // Silver ring
    const ringGeom = new THREE.RingGeometry(1.4, 1.6, 32)
    const ringMat = new THREE.MeshStandardMaterial({
      color: this.kingsColors.silver,
      side: THREE.DoubleSide
    })
    const ring = new THREE.Mesh(ringGeom, ringMat)
    ring.rotation.x = -Math.PI / 2
    ring.position.y = logoY + 0.01
    this.group.add(ring)

    // Crown shape
    const crownMat = new THREE.MeshStandardMaterial({
      color: this.kingsColors.silver,
      metalness: 0.4,
      roughness: 0.4
    })

    // Crown points
    const points = [-0.6, -0.3, 0, 0.3, 0.6]
    const heights = [0.4, 0.55, 0.7, 0.55, 0.4]

    points.forEach((xOff, i) => {
      const pointGeom = new THREE.ConeGeometry(0.1, heights[i], 4)
      const point = new THREE.Mesh(pointGeom, crownMat)
      point.rotation.x = Math.PI / 2
      point.position.set(xOff, logoY + 0.02, 0)
      this.group.add(point)
    })
  }

  /**
   * Create professional hoops
   */
  createProfessionalHoops() {
    const courtLength = 28 * this.courtScale
    const hoopOffset = courtLength / 2 - 2

    // Left hoop - scaled up
    const leftHoop = this.createHoop()
    leftHoop.rotation.y = Math.PI
    leftHoop.scale.set(1.5, 1.5, 1.5)  // Scale up the hoop
    leftHoop.position.set(-hoopOffset, this.floorHeight + 0.35, 0)
    this.group.add(leftHoop)
    this.hoops.push({
      position: new THREE.Vector3(-hoopOffset + 2.5, 4.5, 0),
      direction: 1
    })

    // Right hoop - scaled up
    const rightHoop = this.createHoop()
    rightHoop.scale.set(1.5, 1.5, 1.5)  // Scale up the hoop
    rightHoop.position.set(hoopOffset, this.floorHeight + 0.35, 0)
    this.group.add(rightHoop)
    this.hoops.push({
      position: new THREE.Vector3(hoopOffset - 2.5, 4.5, 0),
      direction: -1
    })
  }

  createHoop() {
    const group = new THREE.Group()

    // Main pole
    const poleGeom = new THREE.CylinderGeometry(0.12, 0.15, 3.5, 16)
    const poleMat = new THREE.MeshStandardMaterial({
      color: this.kingsColors.gray,
      metalness: 0.6,
      roughness: 0.3
    })
    const pole = new THREE.Mesh(poleGeom, poleMat)
    pole.position.set(-0.2, 1.75, 0)
    pole.castShadow = true
    group.add(pole)

    // Horizontal arm
    const armGeom = new THREE.BoxGeometry(1.2, 0.12, 0.12)
    const arm = new THREE.Mesh(armGeom, poleMat)
    arm.position.set(0.4, 3.3, 0)
    group.add(arm)

    // Glass backboard
    const bbGeom = new THREE.BoxGeometry(1.8, 1.05, 0.04)
    const bbMat = new THREE.MeshStandardMaterial({
      color: 0xE8F4F8,
      transparent: true,
      opacity: 0.4,
      roughness: 0.1
    })
    const backboard = new THREE.Mesh(bbGeom, bbMat)
    backboard.position.set(1, 2.9, 0)
    group.add(backboard)

    // Backboard frame
    const frameGeom = new THREE.BoxGeometry(1.85, 1.1, 0.06)
    const frameMat = new THREE.MeshStandardMaterial({
      color: this.kingsColors.gray,
      metalness: 0.5
    })
    const frame = new THREE.Mesh(frameGeom, frameMat)
    frame.position.set(1, 2.9, -0.02)
    group.add(frame)

    // Orange rim
    const rimGeom = new THREE.TorusGeometry(0.23, 0.018, 8, 24)
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xFF6600,
      metalness: 0.6,
      roughness: 0.3
    })
    const rim = new THREE.Mesh(rimGeom, rimMat)
    rim.position.set(1.3, 2.55, 0)
    rim.rotation.x = Math.PI / 2
    group.add(rim)

    // Net
    const netGeom = new THREE.CylinderGeometry(0.22, 0.14, 0.4, 12, 4, true)
    const netMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      wireframe: true
    })
    const net = new THREE.Mesh(netGeom, netMat)
    net.position.set(1.3, 2.35, 0)
    group.add(net)

    // Padding
    const padGeom = new THREE.BoxGeometry(0.15, 0.6, 0.2)
    const padMat = new THREE.MeshStandardMaterial({ color: this.kingsColors.purple })
    const pad = new THREE.Mesh(padGeom, padMat)
    pad.position.set(1, 2.35, 0)
    group.add(pad)

    return group
  }

  /**
   * Create tiered arena seating
   */
  createArenaSeating() {
    const tiers = 6
    const tierHeight = 2
    const tierDepth = 4
    const startRadius = 30

    for (let tier = 0; tier < tiers; tier++) {
      const radius = startRadius + tier * tierDepth
      const height = this.floorHeight + 0.5 + tier * tierHeight

      // Seating platform ring
      const innerR = radius
      const outerR = radius + tierDepth * 0.9

      const seatGeom = new THREE.RingGeometry(innerR, outerR, 48)
      const seatMat = new THREE.MeshStandardMaterial({
        color: tier % 2 === 0 ? this.kingsColors.purple : this.kingsColors.gray,
        side: THREE.DoubleSide,
        roughness: 0.8
      })
      const seats = new THREE.Mesh(seatGeom, seatMat)
      seats.rotation.x = -Math.PI / 2
      seats.position.y = height
      this.group.add(seats)

      // Seat backs
      this.createSeatBackRing(radius, height, tier)
    }
  }

  createSeatBackRing(radius, height, tier) {
    const seatCount = 90
    const color = tier % 2 === 0 ? this.kingsColors.silver : this.kingsColors.purple
    const seatMat = new THREE.MeshStandardMaterial({ color: color })

    for (let i = 0; i < seatCount; i++) {
      const angle = (i / seatCount) * Math.PI * 2

      // Skip seats near entrances
      const angleDeg = (angle * 180 / Math.PI) % 360
      const isEntrance = (angleDeg > 350 || angleDeg < 10) ||
                        (angleDeg > 80 && angleDeg < 100) ||
                        (angleDeg > 170 && angleDeg < 190) ||
                        (angleDeg > 260 && angleDeg < 280)
      if (isEntrance) continue

      const seatGeom = new THREE.BoxGeometry(0.8, 0.6, 0.12)
      const seat = new THREE.Mesh(seatGeom, seatMat)

      const x = Math.cos(angle) * (radius + 1)
      const z = Math.sin(angle) * (radius + 1)

      seat.position.set(x, height + 0.3, z)
      seat.rotation.y = angle + Math.PI
      this.group.add(seat)
    }
  }

  /**
   * Create arena roof - full dome enclosure
   */
  createArenaRoof() {
    const roofRadius = this.arenaRadius
    const roofHeight = this.floorHeight + 25

    // Full dome roof with slight flattening
    const roofGeom = new THREE.SphereGeometry(roofRadius * 0.95, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2.2)
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x1A1A1A,
      roughness: 0.4,
      metalness: 0.3,
      side: THREE.DoubleSide
    })
    const roof = new THREE.Mesh(roofGeom, roofMat)
    roof.rotation.x = Math.PI
    roof.scale.y = 0.45  // Flatten the dome
    roof.position.y = roofHeight
    this.group.add(roof)

    // Inner ceiling ring for structural support look
    const innerRingGeom = new THREE.TorusGeometry(roofRadius * 0.7, 0.8, 8, 64)
    const innerRingMat = new THREE.MeshStandardMaterial({
      color: this.kingsColors.gray,
      metalness: 0.6
    })
    const innerRing = new THREE.Mesh(innerRingGeom, innerRingMat)
    innerRing.rotation.x = Math.PI / 2
    innerRing.position.y = roofHeight - 3
    this.group.add(innerRing)

    // Outer support ring at roof edge
    const outerRingGeom = new THREE.TorusGeometry(roofRadius * 0.9, 1, 8, 64)
    const outerRing = new THREE.Mesh(outerRingGeom, innerRingMat)
    outerRing.rotation.x = Math.PI / 2
    outerRing.position.y = roofHeight - 8
    this.group.add(outerRing)

    // Radial support beams
    const beamCount = 16
    for (let i = 0; i < beamCount; i++) {
      const angle = (i / beamCount) * Math.PI * 2
      const beamGeom = new THREE.BoxGeometry(0.6, 0.6, roofRadius * 0.85)
      const beam = new THREE.Mesh(beamGeom, innerRingMat)
      beam.position.set(
        Math.cos(angle) * roofRadius * 0.45,
        roofHeight - 5,
        Math.sin(angle) * roofRadius * 0.45
      )
      beam.rotation.y = angle + Math.PI / 2
      this.group.add(beam)
    }
  }

  /**
   * Create center jumbotron
   */
  createJumbotron() {
    const group = new THREE.Group()
    const size = 10
    const height = this.floorHeight + 18

    // Main structure
    const cubeGeom = new THREE.BoxGeometry(size, 2, size)
    const cubeMat = new THREE.MeshStandardMaterial({
      color: 0x1A1A1A,
      roughness: 0.5
    })
    const cube = new THREE.Mesh(cubeGeom, cubeMat)
    group.add(cube)

    // Screens on each side
    for (let i = 0; i < 4; i++) {
      const screenGeom = new THREE.PlaneGeometry(size * 0.85, 1.8)
      const screenMat = new THREE.MeshStandardMaterial({
        color: this.kingsColors.purple,
        emissive: this.kingsColors.purple,
        emissiveIntensity: 0.2
      })
      const screen = new THREE.Mesh(screenGeom, screenMat)

      const angle = (i / 4) * Math.PI * 2
      screen.position.set(
        Math.cos(angle) * (size / 2 + 0.05),
        0,
        Math.sin(angle) * (size / 2 + 0.05)
      )
      screen.rotation.y = -angle + Math.PI / 2
      group.add(screen)
    }

    // Support cables
    const cables = [[-2, -2], [-2, 2], [2, -2], [2, 2]]
    cables.forEach(([x, z]) => {
      const cableGeom = new THREE.CylinderGeometry(0.05, 0.05, 5, 8)
      const cableMat = new THREE.MeshStandardMaterial({ color: 0x333333 })
      const cable = new THREE.Mesh(cableGeom, cableMat)
      cable.position.set(x, 2.5, z)
      group.add(cable)
    })

    group.position.y = height
    this.group.add(group)
  }

  /**
   * Create player entrances/tunnels
   */
  createEntrances() {
    const entrancePositions = [
      { angle: 0, label: 'KINGS' },
      { angle: Math.PI / 2, label: 'VISITORS' },
      { angle: Math.PI, label: 'MEDIA' },
      { angle: Math.PI * 1.5, label: 'VIP' }
    ]

    entrancePositions.forEach(pos => {
      const entrance = this.createEntrance()
      entrance.rotation.y = pos.angle
      const x = Math.cos(pos.angle) * (this.arenaRadius - 0.5)
      const z = Math.sin(pos.angle) * (this.arenaRadius - 0.5)
      entrance.position.set(x, this.floorHeight, z)
      this.group.add(entrance)
    })
  }

  createEntrance() {
    const group = new THREE.Group()

    // Larger tunnel frame
    const frameGeom = new THREE.BoxGeometry(8, 6, 3)
    const frameMat = new THREE.MeshStandardMaterial({
      color: this.kingsColors.purple,
      roughness: 0.7
    })
    const frame = new THREE.Mesh(frameGeom, frameMat)
    frame.position.y = 3
    group.add(frame)

    // Tunnel opening - large enough to walk through
    const openingGeom = new THREE.BoxGeometry(6, 5, 4)
    const openingMat = new THREE.MeshStandardMaterial({ color: 0x111111 })
    const opening = new THREE.Mesh(openingGeom, openingMat)
    opening.position.set(0, 2.5, 1)
    group.add(opening)

    // Floor of tunnel (walkable) - longer ramp
    const floorGeom = new THREE.BoxGeometry(6, 0.3, 8)
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x3A3A3A })
    const floor = new THREE.Mesh(floorGeom, floorMat)
    floor.position.set(0, 0.15, 3)
    floor.receiveShadow = true
    group.add(floor)
    this.arenaCollisionMeshes.push(floor)

    return group
  }

  /**
   * Create arena lighting
   */
  createArenaLighting() {
    const lightRadius = 35
    const lightHeight = this.floorHeight + 22
    const lightCount = 24

    for (let i = 0; i < lightCount; i++) {
      const angle = (i / lightCount) * Math.PI * 2
      const x = Math.cos(angle) * lightRadius
      const z = Math.sin(angle) * lightRadius

      // Light fixture
      const fixtureGeom = new THREE.BoxGeometry(1.2, 0.4, 0.8)
      const fixtureMat = new THREE.MeshStandardMaterial({
        color: 0x333333,
        metalness: 0.7
      })
      const fixture = new THREE.Mesh(fixtureGeom, fixtureMat)
      fixture.position.set(x, lightHeight, z)
      this.group.add(fixture)

      // Light panel
      const panelGeom = new THREE.BoxGeometry(1, 0.08, 0.6)
      const panelMat = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        emissive: 0xFFFFFF,
        emissiveIntensity: 0.4
      })
      const panel = new THREE.Mesh(panelGeom, panelMat)
      panel.position.set(x, lightHeight - 0.25, z)
      this.group.add(panel)
    }
  }

  async createMediaFrames() {}

  createInteractiveObjects(interactiveManager) {
    if (!interactiveManager) return

    const worldHoops = this.hoops.map(hoop => ({
      position: new THREE.Vector3(
        this.position.x + hoop.position.x,
        this.position.y + hoop.position.y + this.floorHeight,
        this.position.z + hoop.position.z
      ),
      direction: hoop.direction
    }))

    const ballPositions = [
      { x: 0, z: 0 },
      { x: -6, z: 3 },
      { x: 6, z: -3 }
    ]

    ballPositions.forEach((pos) => {
      const ballPos = this.position.clone()
      ballPos.x += pos.x
      ballPos.z += pos.z
      ballPos.y += this.floorHeight + 1

      const basketball = new Basketball(ballPos)
      basketball.registerHoops(worldHoops)
      basketball.setScoreCallback(() => {
        this.score++
        console.log(`SCORE! Total: ${this.score} points`)
      })

      interactiveManager.registerObject(basketball)
      this.basketballs.push(basketball)
    })

    console.log('Golden 1 Center arena ready! Pick up balls with E, throw with F')
  }

  getName() {
    return 'Golden 1 Center'
  }
}

export default BasketballIsland
