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
    this.radius = 85
    this.seed = this.radius * 1000

    // Create a mostly flat circular platform for the arena - high poly for smooth edges
    const segments = 96
    const geometry = new THREE.BufferGeometry()

    const vertices = []
    const normals = []
    const uvs = []
    const indices = []

    // Center vertex
    vertices.push(0, this.floorHeight, 0)
    normals.push(0, 1, 0)
    uvs.push(0.5, 0.5)

    // Concentric rings with flat center and sloped edges - high poly
    const rings = 48
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

    // Create wall segments for collision - higher detail
    const wallSegments = 48
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

    // Arena floor (concrete underneath the court) - high poly
    const floorGeom = new THREE.CylinderGeometry(outerRadius - 1, outerRadius - 1, 0.3, 72)
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
   * Create tiered arena seating - Golden 1 Center style
   * Features: Courtside, Lower Bowl, Club Level/Suites, Upper Bowl
   */
  createArenaSeating() {
    // Courtside seating (floor level - premium)
    this.createCourtsideSeating()

    // Lower bowl - main seating area
    this.createLowerBowl()

    // Club level with luxury suites
    this.createClubLevel()

    // Upper bowl
    this.createUpperBowl()
  }

  /**
   * Create courtside/floor level seating
   */
  createCourtsideSeating() {
    const courtLength = 28 * this.courtScale
    const courtWidth = 15 * this.courtScale
    const seatHeight = this.floorHeight + 0.5

    // Black courtside seats material
    const courtsideMat = new THREE.MeshStandardMaterial({
      color: 0x1A1A1A,
      roughness: 0.7
    })

    // Seats along the sidelines
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 20; i++) {
        const x = (i - 9.5) * 2.5
        const z = side * (courtWidth / 2 + 2)

        // Individual seat
        const seatGeom = new THREE.BoxGeometry(1.8, 0.8, 1.2)
        const seat = new THREE.Mesh(seatGeom, courtsideMat)
        seat.position.set(x, seatHeight + 0.4, z)
        this.group.add(seat)

        // Seat back
        const backGeom = new THREE.BoxGeometry(1.8, 1.0, 0.15)
        const back = new THREE.Mesh(backGeom, courtsideMat)
        back.position.set(x, seatHeight + 0.9, z + side * 0.5)
        this.group.add(back)
      }
    }

    // Scorer's table and benches
    this.createScorersTable()
  }

  /**
   * Create scorer's table and team benches
   */
  createScorersTable() {
    const tableY = this.floorHeight + 0.5
    const courtWidth = 15 * this.courtScale

    // Scorer's table (center court)
    const tableGeom = new THREE.BoxGeometry(12, 0.8, 2)
    const tableMat = new THREE.MeshStandardMaterial({
      color: this.kingsColors.black,
      roughness: 0.5
    })
    const table = new THREE.Mesh(tableGeom, tableMat)
    table.position.set(0, tableY + 0.4, courtWidth / 2 + 5)
    this.group.add(table)

    // Team benches
    const benchMat = new THREE.MeshStandardMaterial({
      color: this.kingsColors.purple,
      roughness: 0.6
    })

    // Home bench
    const homeBench = new THREE.Mesh(new THREE.BoxGeometry(8, 0.6, 1.5), benchMat)
    homeBench.position.set(-12, tableY + 0.3, courtWidth / 2 + 4)
    this.group.add(homeBench)

    // Away bench
    const awayBench = new THREE.Mesh(new THREE.BoxGeometry(8, 0.6, 1.5), benchMat)
    awayBench.position.set(12, tableY + 0.3, courtWidth / 2 + 4)
    this.group.add(awayBench)
  }

  /**
   * Create lower bowl seating sections
   */
  createLowerBowl() {
    const startRadius = 32
    const tiers = 8
    const tierHeight = 1.8
    const tierDepth = 2.8

    for (let tier = 0; tier < tiers; tier++) {
      const radius = startRadius + tier * tierDepth
      const height = this.floorHeight + 1 + tier * tierHeight

      // Seating platform (concrete riser)
      const innerR = radius
      const outerR = radius + tierDepth * 0.95

      const riserGeom = new THREE.RingGeometry(innerR, outerR, 64)
      const riserMat = new THREE.MeshStandardMaterial({
        color: 0x4A4A4A,
        roughness: 0.9
      })
      const riser = new THREE.Mesh(riserGeom, riserMat)
      riser.rotation.x = -Math.PI / 2
      riser.position.y = height
      this.group.add(riser)

      // Individual seats with alternating colors
      this.createSeatingRow(radius + 1.2, height, tier, 'lower')
    }
  }

  /**
   * Create club level with luxury suites
   */
  createClubLevel() {
    const clubRadius = 52
    const clubHeight = this.floorHeight + 16

    // Club level concourse floor
    const floorGeom = new THREE.RingGeometry(clubRadius - 3, clubRadius + 6, 64)
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x2A2A2A,
      roughness: 0.7
    })
    const floor = new THREE.Mesh(floorGeom, floorMat)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = clubHeight
    this.group.add(floor)

    // Luxury suite boxes around the perimeter
    const suiteCount = 24
    for (let i = 0; i < suiteCount; i++) {
      const angle = (i / suiteCount) * Math.PI * 2

      // Skip entrances
      const angleDeg = (angle * 180 / Math.PI) % 360
      if (this.isEntranceAngle(angleDeg)) continue

      this.createLuxurySuite(angle, clubRadius + 2, clubHeight)
    }

    // Club seating in front of suites
    this.createSeatingRow(clubRadius - 2, clubHeight + 0.5, 0, 'club')
  }

  /**
   * Create a luxury suite box
   */
  createLuxurySuite(angle, radius, height) {
    const suiteGroup = new THREE.Group()

    // Suite box structure
    const boxGeom = new THREE.BoxGeometry(5, 3, 4)
    const boxMat = new THREE.MeshStandardMaterial({
      color: this.kingsColors.darkGray,
      roughness: 0.6
    })
    const box = new THREE.Mesh(boxGeom, boxMat)
    box.position.y = 1.5
    suiteGroup.add(box)

    // Glass front
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x88CCFF,
      transparent: true,
      opacity: 0.3,
      roughness: 0.1
    })
    const glassGeom = new THREE.PlaneGeometry(4.8, 2.5)
    const glass = new THREE.Mesh(glassGeom, glassMat)
    glass.position.set(0, 1.5, -2.05)
    suiteGroup.add(glass)

    // Suite interior light (emissive)
    const lightGeom = new THREE.PlaneGeometry(4, 0.3)
    const lightMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFAA,
      emissive: 0xFFFFAA,
      emissiveIntensity: 0.3
    })
    const light = new THREE.Mesh(lightGeom, lightMat)
    light.position.set(0, 2.8, 0)
    light.rotation.x = Math.PI / 2
    suiteGroup.add(light)

    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius
    suiteGroup.position.set(x, height, z)
    suiteGroup.rotation.y = -angle + Math.PI
    this.group.add(suiteGroup)
  }

  /**
   * Create upper bowl seating
   */
  createUpperBowl() {
    const startRadius = 54
    const startHeight = this.floorHeight + 17
    const tiers = 6
    const tierHeight = 2
    const tierDepth = 2.5

    for (let tier = 0; tier < tiers; tier++) {
      const radius = startRadius + tier * tierDepth
      const height = startHeight + tier * tierHeight

      // Seating platform
      const innerR = radius
      const outerR = radius + tierDepth * 0.95

      const riserGeom = new THREE.RingGeometry(innerR, outerR, 64)
      const riserMat = new THREE.MeshStandardMaterial({
        color: 0x3A3A3A,
        roughness: 0.9
      })
      const riser = new THREE.Mesh(riserGeom, riserMat)
      riser.rotation.x = -Math.PI / 2
      riser.position.y = height
      this.group.add(riser)

      // Seats
      this.createSeatingRow(radius + 1, height, tier, 'upper')
    }
  }

  /**
   * Create a row of individual seats
   */
  createSeatingRow(radius, height, tier, section) {
    let seatCount, seatWidth, seatColor

    switch (section) {
      case 'lower':
        seatCount = 100 + tier * 8
        seatWidth = 0.9
        seatColor = tier % 3 === 0 ? this.kingsColors.purple :
                    tier % 3 === 1 ? this.kingsColors.gray : this.kingsColors.silver
        break
      case 'club':
        seatCount = 60
        seatWidth = 1.2
        seatColor = this.kingsColors.purple
        break
      case 'upper':
        seatCount = 80 + tier * 10
        seatWidth = 0.8
        seatColor = tier % 2 === 0 ? this.kingsColors.purple : this.kingsColors.gray
        break
      default:
        seatCount = 80
        seatWidth = 0.9
        seatColor = this.kingsColors.gray
    }

    const seatMat = new THREE.MeshStandardMaterial({
      color: seatColor,
      roughness: 0.7
    })

    // Create seats around the ring
    for (let i = 0; i < seatCount; i++) {
      const angle = (i / seatCount) * Math.PI * 2

      // Skip entrance areas
      const angleDeg = (angle * 180 / Math.PI) % 360
      if (this.isEntranceAngle(angleDeg)) continue

      // Seat (low poly chair)
      const seatGeom = new THREE.BoxGeometry(seatWidth, 0.6, 0.5)
      const seat = new THREE.Mesh(seatGeom, seatMat)

      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius

      seat.position.set(x, height + 0.3, z)
      seat.rotation.y = angle + Math.PI
      this.group.add(seat)

      // Seat back
      const backGeom = new THREE.BoxGeometry(seatWidth * 0.9, 0.7, 0.12)
      const back = new THREE.Mesh(backGeom, seatMat)
      back.position.set(x, height + 0.65, z)
      back.rotation.y = angle + Math.PI
      this.group.add(back)
    }
  }

  /**
   * Check if angle is near an entrance
   */
  isEntranceAngle(angleDeg) {
    return (angleDeg > 352 || angleDeg < 8) ||
           (angleDeg > 82 && angleDeg < 98) ||
           (angleDeg > 172 && angleDeg < 188) ||
           (angleDeg > 262 && angleDeg < 278)
  }

  /**
   * Create arena roof - Golden 1 Center style modern steel truss roof
   * The real Golden 1 Center has an iconic angular roof with exposed steel trusses
   */
  createArenaRoof() {
    const roofRadius = this.arenaRadius
    const roofBaseHeight = this.floorHeight + 22
    const roofPeakHeight = this.floorHeight + 35

    // Steel material for trusses
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x3A3A3A,
      metalness: 0.8,
      roughness: 0.3
    })

    // Accent steel (lighter)
    const lightSteelMat = new THREE.MeshStandardMaterial({
      color: 0x5A5A5A,
      metalness: 0.7,
      roughness: 0.4
    })

    // Create the main roof panels - angular modern design
    // Golden 1 Center has a distinctive sloped roof with multiple facets
    this.createRoofPanels(roofRadius, roofBaseHeight, roofPeakHeight)

    // Primary radial trusses - heavy structural beams radiating from center
    const primaryTrussCount = 8
    for (let i = 0; i < primaryTrussCount; i++) {
      const angle = (i / primaryTrussCount) * Math.PI * 2
      this.createPrimaryTruss(angle, roofRadius, roofBaseHeight, roofPeakHeight, steelMat)
    }

    // Secondary trusses between primary ones
    const secondaryTrussCount = 16
    for (let i = 0; i < secondaryTrussCount; i++) {
      const angle = (i / secondaryTrussCount) * Math.PI * 2 + Math.PI / 16
      this.createSecondaryTruss(angle, roofRadius, roofBaseHeight, roofPeakHeight, lightSteelMat)
    }

    // Perimeter ring beam - thick structural ring around the edge
    const ringGeom = new THREE.TorusGeometry(roofRadius - 2, 1.2, 8, 64)
    const ring = new THREE.Mesh(ringGeom, steelMat)
    ring.rotation.x = Math.PI / 2
    ring.position.y = roofBaseHeight
    this.group.add(ring)

    // Center tension ring (where cables/trusses meet)
    const centerRingGeom = new THREE.TorusGeometry(8, 0.8, 8, 32)
    const centerRing = new THREE.Mesh(centerRingGeom, steelMat)
    centerRing.rotation.x = Math.PI / 2
    centerRing.position.y = roofPeakHeight - 2
    this.group.add(centerRing)

    // Cross bracing between trusses
    this.createCrossBracing(roofRadius, roofBaseHeight, roofPeakHeight, lightSteelMat)

    // Add roof edge fascia - Kings purple accent
    const fasciaGeom = new THREE.TorusGeometry(roofRadius - 0.5, 2, 4, 64)
    const fasciaMat = new THREE.MeshStandardMaterial({
      color: this.kingsColors.purple,
      roughness: 0.6
    })
    const fascia = new THREE.Mesh(fasciaGeom, fasciaMat)
    fascia.rotation.x = Math.PI / 2
    fascia.position.y = roofBaseHeight - 1
    this.group.add(fascia)
  }

  /**
   * Create angular roof panels
   */
  createRoofPanels(radius, baseHeight, peakHeight) {
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x1A1A1A,
      roughness: 0.5,
      metalness: 0.2,
      side: THREE.DoubleSide
    })

    // Create faceted roof panels radiating from center
    const panelCount = 16
    for (let i = 0; i < panelCount; i++) {
      const angle1 = (i / panelCount) * Math.PI * 2
      const angle2 = ((i + 1) / panelCount) * Math.PI * 2

      // Create triangular panel geometry
      const geometry = new THREE.BufferGeometry()

      // Panel vertices: center peak, and two points on the perimeter
      const vertices = new Float32Array([
        // Center peak
        0, peakHeight - 2, 0,
        // Outer edge point 1
        Math.cos(angle1) * (radius - 3), baseHeight, Math.sin(angle1) * (radius - 3),
        // Outer edge point 2
        Math.cos(angle2) * (radius - 3), baseHeight, Math.sin(angle2) * (radius - 3)
      ])

      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
      geometry.computeVertexNormals()

      const panel = new THREE.Mesh(geometry, panelMat)
      this.group.add(panel)
    }
  }

  /**
   * Create primary structural truss
   */
  createPrimaryTruss(angle, radius, baseHeight, peakHeight, material) {
    const trussGroup = new THREE.Group()

    // Main diagonal beam from perimeter to center peak
    const beamLength = Math.sqrt(Math.pow(radius - 3, 2) + Math.pow(peakHeight - baseHeight, 2))
    const beamAngle = Math.atan2(peakHeight - baseHeight, radius - 3)

    const mainBeamGeom = new THREE.BoxGeometry(1.5, 1.2, beamLength)
    const mainBeam = new THREE.Mesh(mainBeamGeom, material)
    mainBeam.position.set(
      Math.cos(angle) * (radius / 2 - 1.5),
      (baseHeight + peakHeight) / 2 - 1,
      Math.sin(angle) * (radius / 2 - 1.5)
    )
    mainBeam.rotation.y = -angle
    mainBeam.rotation.x = beamAngle
    trussGroup.add(mainBeam)

    // Lower chord (horizontal)
    const lowerChordGeom = new THREE.BoxGeometry(0.8, 0.6, radius - 10)
    const lowerChord = new THREE.Mesh(lowerChordGeom, material)
    lowerChord.position.set(
      Math.cos(angle) * (radius / 2),
      baseHeight + 1,
      Math.sin(angle) * (radius / 2)
    )
    lowerChord.rotation.y = -angle + Math.PI / 2
    trussGroup.add(lowerChord)

    // Vertical web members
    const webCount = 4
    for (let w = 1; w <= webCount; w++) {
      const webDist = (w / (webCount + 1)) * (radius - 10)
      const webHeight = baseHeight + 1 + (peakHeight - baseHeight - 3) * (1 - w / (webCount + 1))
      const webLength = webHeight - baseHeight - 1

      const webGeom = new THREE.BoxGeometry(0.4, webLength, 0.4)
      const web = new THREE.Mesh(webGeom, material)
      web.position.set(
        Math.cos(angle) * (8 + webDist),
        baseHeight + 1 + webLength / 2,
        Math.sin(angle) * (8 + webDist)
      )
      trussGroup.add(web)
    }

    this.group.add(trussGroup)
  }

  /**
   * Create secondary structural truss (lighter weight)
   */
  createSecondaryTruss(angle, radius, baseHeight, peakHeight, material) {
    // Simplified secondary truss - just the main diagonal
    const beamLength = Math.sqrt(Math.pow(radius - 8, 2) + Math.pow(peakHeight - baseHeight - 5, 2))
    const beamAngle = Math.atan2(peakHeight - baseHeight - 5, radius - 8)

    const beamGeom = new THREE.BoxGeometry(0.6, 0.5, beamLength)
    const beam = new THREE.Mesh(beamGeom, material)
    beam.position.set(
      Math.cos(angle) * (radius / 2),
      (baseHeight + peakHeight) / 2,
      Math.sin(angle) * (radius / 2)
    )
    beam.rotation.y = -angle
    beam.rotation.x = beamAngle
    this.group.add(beam)
  }

  /**
   * Create cross bracing between trusses
   */
  createCrossBracing(radius, baseHeight, peakHeight, material) {
    // Concentric ring braces at different heights
    const ringHeights = [baseHeight + 4, baseHeight + 8, baseHeight + 12]
    const ringRadii = [radius - 8, radius - 18, radius - 28]

    ringHeights.forEach((height, index) => {
      if (ringRadii[index] > 5) {
        const braceGeom = new THREE.TorusGeometry(ringRadii[index], 0.3, 6, 48)
        const brace = new THREE.Mesh(braceGeom, material)
        brace.rotation.x = Math.PI / 2
        brace.position.y = height
        this.group.add(brace)
      }
    })
  }

  /**
   * Create center jumbotron - Golden 1 Center style center-hung scoreboard
   */
  createJumbotron() {
    const group = new THREE.Group()
    const width = 14
    const depth = 10
    const screenHeight = 4
    const height = this.floorHeight + 20

    // Main housing structure (hexagonal-ish shape)
    const housingMat = new THREE.MeshStandardMaterial({
      color: 0x1A1A1A,
      roughness: 0.4,
      metalness: 0.3
    })

    // Top housing
    const topGeom = new THREE.BoxGeometry(width + 2, 1.5, depth + 2)
    const top = new THREE.Mesh(topGeom, housingMat)
    top.position.y = screenHeight / 2 + 0.75
    group.add(top)

    // Bottom housing
    const bottomGeom = new THREE.BoxGeometry(width + 1, 1, depth + 1)
    const bottom = new THREE.Mesh(bottomGeom, housingMat)
    bottom.position.y = -screenHeight / 2 - 0.5
    group.add(bottom)

    // Four main video screens
    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x111122,
      emissive: this.kingsColors.purple,
      emissiveIntensity: 0.15,
      roughness: 0.2
    })

    // Long sides (main screens)
    for (let i = -1; i <= 1; i += 2) {
      const screenGeom = new THREE.BoxGeometry(width, screenHeight, 0.3)
      const screen = new THREE.Mesh(screenGeom, screenMat)
      screen.position.set(0, 0, i * (depth / 2 + 0.15))
      group.add(screen)

      // Screen frame
      const frameMat = new THREE.MeshStandardMaterial({
        color: this.kingsColors.silver,
        metalness: 0.6
      })
      const frameGeom = new THREE.BoxGeometry(width + 0.4, screenHeight + 0.4, 0.1)
      const frame = new THREE.Mesh(frameGeom, frameMat)
      frame.position.set(0, 0, i * (depth / 2 + 0.35))
      group.add(frame)
    }

    // Short sides (end screens)
    for (let i = -1; i <= 1; i += 2) {
      const screenGeom = new THREE.BoxGeometry(0.3, screenHeight, depth)
      const screen = new THREE.Mesh(screenGeom, screenMat)
      screen.position.set(i * (width / 2 + 0.15), 0, 0)
      group.add(screen)
    }

    // Bottom ring display
    const ringScreenGeom = new THREE.TorusGeometry(6, 0.8, 8, 32)
    const ringScreen = new THREE.Mesh(ringScreenGeom, screenMat)
    ringScreen.rotation.x = Math.PI / 2
    ringScreen.position.y = -screenHeight / 2 - 1.2
    group.add(ringScreen)

    // Support cables/chains to roof
    const cablePositions = [
      [-width/2 - 0.5, -depth/2 - 0.5],
      [-width/2 - 0.5, depth/2 + 0.5],
      [width/2 + 0.5, -depth/2 - 0.5],
      [width/2 + 0.5, depth/2 + 0.5]
    ]
    const cableHeight = 12
    cablePositions.forEach(([x, z]) => {
      const cableGeom = new THREE.CylinderGeometry(0.08, 0.08, cableHeight, 8)
      const cableMat = new THREE.MeshStandardMaterial({
        color: 0x444444,
        metalness: 0.7
      })
      const cable = new THREE.Mesh(cableGeom, cableMat)
      cable.position.set(x, screenHeight / 2 + cableHeight / 2, z)
      group.add(cable)
    })

    // Center spotlight cluster
    const spotlightRing = new THREE.Group()
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const spotGeom = new THREE.CylinderGeometry(0.4, 0.6, 1.2, 8)
      const spotMat = new THREE.MeshStandardMaterial({
        color: 0x333333,
        metalness: 0.5
      })
      const spot = new THREE.Mesh(spotGeom, spotMat)
      spot.position.set(Math.cos(angle) * 3, 0, Math.sin(angle) * 3)
      spot.rotation.x = Math.PI
      spotlightRing.add(spot)

      // Light lens
      const lensGeom = new THREE.CircleGeometry(0.35, 16)
      const lensMat = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        emissive: 0xFFFFFF,
        emissiveIntensity: 0.5
      })
      const lens = new THREE.Mesh(lensGeom, lensMat)
      lens.position.set(Math.cos(angle) * 3, -0.6, Math.sin(angle) * 3)
      lens.rotation.x = -Math.PI / 2
      spotlightRing.add(lens)
    }
    spotlightRing.position.y = -screenHeight / 2 - 2
    group.add(spotlightRing)

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
