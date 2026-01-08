/**
 * Bouldering/Climbing themed island
 * Earth tones with climbing wall, holds, and rocks
 */

import * as THREE from 'three'
import { Island } from '../Island.js'
import { ColorPalettes } from '../../utils/ColorPalettes.js'
import { GeometryUtils } from '../../utils/GeometryUtils.js'

export class BoulderingIsland extends Island {
  constructor(position) {
    super(position)
    this.color = ColorPalettes.bouldering.ground
  }

  createDecorations() {
    const grayColors = [0x808080, 0x696969, 0x778899, 0x708090, 0x8B8B8B]
    const scale = this.size / 50  // Scale for larger islands

    // === MAIN BOULDERING AREA - Multiple boulder problems ===

    // Central large boulder (main attraction) with route
    const centerBoulder = this.createBoulderWithRoute(
      4.5 * scale,
      grayColors[0],
      [0xFF4444, 0xFF4444, 0xFF4444, 0xFF4444],  // Red route
      12
    )
    this.addDecoration(centerBoulder, 0, 0, 0)

    // Crash pad under center boulder
    const centerPad = GeometryUtils.createBox(5 * scale, 0.5, 5 * scale, 0x4169E1)
    this.addDecoration(centerPad, 0, 0.25, 2 * scale)

    // Left boulder cluster - easier problems
    const leftBoulder1 = this.createBoulderWithRoute(
      3 * scale,
      grayColors[1],
      [0x44FF44, 0x44FF44, 0x44FF44],  // Green route (easier)
      8
    )
    this.addDecoration(leftBoulder1, -8 * scale, 0, -4 * scale)

    const leftPad = GeometryUtils.createBox(4 * scale, 0.5, 4 * scale, 0xFF8C00)
    this.addDecoration(leftPad, -8 * scale, 0.25, -2 * scale)

    const leftBoulder2 = GeometryUtils.createBoulder(2.5 * scale, grayColors[2])
    this.addDecoration(leftBoulder2, -12 * scale, 0, 3 * scale)

    // Right boulder - harder overhang
    const rightBoulder = this.createOverhangBoulder(
      4 * scale,
      grayColors[3],
      [0x000000, 0x000000, 0x000000, 0x000000],  // Black route (hardest)
      10
    )
    this.addDecoration(rightBoulder, 10 * scale, 0, -3 * scale)

    const rightPad = GeometryUtils.createBox(4.5 * scale, 0.5, 4.5 * scale, 0x8B4513)
    this.addDecoration(rightPad, 10 * scale, 0.25, 0.5 * scale)

    // Back boulder wall - warm up area
    const backBoulder1 = this.createBoulderWithRoute(
      2.5 * scale,
      grayColors[4],
      [0xFFFF44, 0xFFFF44, 0xFFFF44],  // Yellow route
      6
    )
    this.addDecoration(backBoulder1, 3 * scale, 0, -12 * scale)

    const backBoulder2 = GeometryUtils.createBoulder(2.2 * scale, grayColors[1])
    this.addDecoration(backBoulder2, -4 * scale, 0, -10 * scale)

    // Small sitting/practice boulders around perimeter
    for (let i = 0; i < 12; i++) {
      const smallBoulder = GeometryUtils.createBoulder(
        (0.8 + Math.random() * 1) * scale,
        grayColors[Math.floor(Math.random() * grayColors.length)]
      )
      const angle = (Math.PI * 2 * i) / 12
      const distance = this.radius * (0.6 + Math.random() * 0.25)
      this.addDecoration(
        smallBoulder,
        Math.cos(angle) * distance,
        0,
        Math.sin(angle) * distance
      )
    }

    // === BOULDERING ACCESSORIES ===

    // Chalk bags scattered around
    const chalkBag1 = GeometryUtils.createCylinder(0.3, 0.35, 0.5, 0xE8E8E8, 8)
    this.addDecoration(chalkBag1, 2 * scale, 0.25, 4 * scale)

    const chalkBag2 = GeometryUtils.createCylinder(0.3, 0.35, 0.5, 0xFF6B35, 8)
    this.addDecoration(chalkBag2, -5 * scale, 0.25, 0)

    // Brushes for cleaning holds
    const brush1 = this.createBrush()
    this.addDecoration(brush1, 4 * scale, 0.3, 3 * scale)

    // === NATURAL SCENERY ===

    // Pine trees around perimeter
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2
      const distance = this.radius * 0.85
      const treeScale = 1.5 + Math.random() * 0.8
      const tree = GeometryUtils.createLowPolyTree(
        i % 2 === 0 ? 0x2F4F2F : 0x228B22,
        treeScale
      )
      this.addDecoration(tree, Math.cos(angle) * distance, 0, Math.sin(angle) * distance)
    }

    // Small bushes
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + 0.4
      const distance = this.radius * 0.7
      const bush = GeometryUtils.createLowPolyBush(
        i % 2 === 0 ? 0x556B2F : 0x6B8E23,
        0.8 + Math.random() * 0.4
      )
      this.addDecoration(bush, Math.cos(angle) * distance, 0, Math.sin(angle) * distance)
    }

    // Benches for resting
    const bench1 = GeometryUtils.createBench(3, 0x8B4513)
    this.addDecoration(bench1, 14 * scale, 0, 2 * scale)

    const bench2 = GeometryUtils.createBench(2.5, 0x654321)
    bench2.rotation.y = Math.PI / 3
    this.addDecoration(bench2, -12 * scale, 0, -8 * scale)

    // Route information sign (simple board)
    const signPost = GeometryUtils.createCylinder(0.15, 0.15, 2.5, 0x8B4513, 8)
    this.addDecoration(signPost, -15 * scale, 1.25, -12 * scale)

    const signBoard = GeometryUtils.createBox(2.5, 1.8, 0.15, 0xF5DEB3)
    this.addDecoration(signBoard, -15 * scale, 3, -12 * scale)
  }

  /**
   * Create a boulder with a climbing route
   */
  createBoulderWithRoute(size, boulderColor, routeColors, holdCount) {
    const group = new THREE.Group()

    // Main boulder
    const boulder = GeometryUtils.createBoulder(size, boulderColor)
    group.add(boulder)

    // Add climbing holds forming a route
    const routeColorArray = Array.isArray(routeColors) ? routeColors : [routeColors]

    for (let i = 0; i < holdCount; i++) {
      const holdColor = routeColorArray[i % routeColorArray.length]
      const hold = GeometryUtils.createClimbingHold(0.2 + Math.random() * 0.15, holdColor)

      // Position holds on the face of the boulder
      const angle = Math.random() * Math.PI * 2
      const height = (i / holdCount) * size * 1.5 + 0.5
      const distance = size * 0.7 + (Math.random() - 0.5) * 0.5

      hold.position.x = Math.cos(angle) * distance
      hold.position.y = height
      hold.position.z = Math.sin(angle) * distance

      // Rotate holds to face outward
      hold.lookAt(
        hold.position.x * 2,
        hold.position.y,
        hold.position.z * 2
      )

      group.add(hold)
    }

    return group
  }

  /**
   * Create an overhanging boulder (harder climb)
   */
  createOverhangBoulder(size, boulderColor, routeColors, holdCount) {
    const group = new THREE.Group()

    // Boulder leaning back for overhang effect
    const boulder = GeometryUtils.createBoulder(size, boulderColor)
    boulder.rotation.x = 0.4  // Lean back
    group.add(boulder)

    // Add holds on the overhang
    const routeColorArray = Array.isArray(routeColors) ? routeColors : [routeColors]

    for (let i = 0; i < holdCount; i++) {
      const holdColor = routeColorArray[i % routeColorArray.length]
      const hold = GeometryUtils.createClimbingHold(0.18 + Math.random() * 0.12, holdColor)

      // Position on overhang face
      const progressUp = i / holdCount
      const xPos = (Math.random() - 0.5) * size * 1.2
      const yPos = progressUp * size * 1.6
      const zPos = size * 0.6 + progressUp * 0.5  // Lean out as you go up

      hold.position.set(xPos, yPos, zPos)
      hold.rotation.x = -0.4  // Angle for overhang

      group.add(hold)
    }

    return group
  }

  /**
   * Create a climbing brush prop
   */
  createBrush() {
    const group = new THREE.Group()

    // Handle
    const handle = GeometryUtils.createCylinder(0.08, 0.08, 0.6, 0x8B4513, 6)
    group.add(handle)

    // Bristles
    const bristles = GeometryUtils.createBox(0.15, 0.2, 0.08, 0xFFD700)
    bristles.position.y = 0.35
    group.add(bristles)

    group.rotation.z = Math.PI / 6

    return group
  }

  async createMediaFrames() {
    // Media frames for climbing photos/videos
    const frame1 = GeometryUtils.createMediaFrame(3, 2, 0x2C3E50)
    frame1.rotation.y = Math.PI  // Face inward
    this.addDecoration(frame1, 11, 3, 6)

    const frame2 = GeometryUtils.createMediaFrame(3, 2, 0x2C3E50)
    frame2.rotation.y = -Math.PI / 2
    this.addDecoration(frame2, 6, 3, 10)

    const frame3 = GeometryUtils.createMediaFrame(4, 2.5, 0x2C3E50)
    frame3.rotation.y = Math.PI / 4
    this.addDecoration(frame3, -10, 3.5, 8)

    // TODO: Load actual climbing images/videos onto frames
  }

  getName() {
    return 'Bouldering Crag'
  }
}

export default BoulderingIsland
