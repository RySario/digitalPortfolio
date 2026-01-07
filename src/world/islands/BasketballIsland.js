/**
 * Basketball themed island
 * Orange and blue court theme with basketball decorations
 */

import * as THREE from 'three'
import { Island } from '../Island.js'
import { ColorPalettes } from '../../utils/ColorPalettes.js'
import { GeometryUtils } from '../../utils/GeometryUtils.js'
import { Basketball } from '../../interactive/Basketball.js'

export class BasketballIsland extends Island {
  constructor(position) {
    super(position)
    this.color = ColorPalettes.basketball.ground
    this.basketball = null  // Store interactive basketball
  }

  createDecorations() {
    // === BASKETBALL HOOPS ===
    const hoop1 = this.createBasketballHoop()
    this.addDecoration(hoop1, 8, 0, 0)

    const hoop2 = this.createBasketballHoop()
    hoop2.rotation.y = Math.PI
    this.addDecoration(hoop2, -8, 0, 0)

    // === COURT SURFACE (painted area) ===
    const courtSurface = GeometryUtils.createBox(16, 0.08, 14, ColorPalettes.basketball.primary)
    this.addDecoration(courtSurface, 0, 1.08, 0)

    // === COURT LINES ===
    // Center circle
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2
      const x = Math.cos(angle) * 2
      const z = Math.sin(angle) * 2
      const segment = GeometryUtils.createBox(0.15, 0.01, 0.4, ColorPalettes.common.white)
      segment.rotation.y = angle + Math.PI / 2
      this.addDecoration(segment, x, 1.16, z)
    }

    // Center line
    const centerLine = GeometryUtils.createBox(0.15, 0.01, 14, ColorPalettes.common.white)
    this.addDecoration(centerLine, 0, 1.16, 0)

    // Sidelines
    const sideline1 = GeometryUtils.createBox(16, 0.01, 0.15, ColorPalettes.common.white)
    this.addDecoration(sideline1, 0, 1.16, 7)

    const sideline2 = GeometryUtils.createBox(16, 0.01, 0.15, ColorPalettes.common.white)
    this.addDecoration(sideline2, 0, 1.16, -7)

    // Baselines
    const baseline1 = GeometryUtils.createBox(0.15, 0.01, 14, ColorPalettes.common.white)
    this.addDecoration(baseline1, 8, 1.16, 0)

    const baseline2 = GeometryUtils.createBox(0.15, 0.01, 14, ColorPalettes.common.white)
    this.addDecoration(baseline2, -8, 1.16, 0)

    // Three-point arcs (both sides)
    for (let i = 0; i < 12; i++) {
      const angle = (i / 11) * Math.PI - Math.PI / 2
      const x1 = Math.cos(angle) * 5.5 + 8
      const z1 = Math.sin(angle) * 5.5
      const arc1 = GeometryUtils.createBox(0.15, 0.01, 0.5, ColorPalettes.common.white)
      arc1.rotation.y = angle
      this.addDecoration(arc1, x1, 1.16, z1)

      const x2 = Math.cos(angle) * 5.5 - 8
      const z2 = Math.sin(angle) * 5.5
      const arc2 = GeometryUtils.createBox(0.15, 0.01, 0.5, ColorPalettes.common.white)
      arc2.rotation.y = angle + Math.PI
      this.addDecoration(arc2, x2, 1.16, z2)
    }

    // Free throw lanes (the "key")
    const key1 = GeometryUtils.createBox(4, 0.01, 0.15, ColorPalettes.common.white)
    this.addDecoration(key1, 6, 1.16, 4)

    const key2 = GeometryUtils.createBox(4, 0.01, 0.15, ColorPalettes.common.white)
    this.addDecoration(key2, 6, 1.16, -4)

    const key3 = GeometryUtils.createBox(4, 0.01, 0.15, ColorPalettes.common.white)
    this.addDecoration(key3, -6, 1.16, 4)

    const key4 = GeometryUtils.createBox(4, 0.01, 0.15, ColorPalettes.common.white)
    this.addDecoration(key4, -6, 1.16, -4)

    // === SPECTATOR STANDS ===
    const stands1 = GeometryUtils.createStands(4, 10, ColorPalettes.basketball.secondary)
    this.addDecoration(stands1, 0, 1, 10)

    const stands2 = GeometryUtils.createStands(4, 10, ColorPalettes.basketball.secondary)
    stands2.rotation.y = Math.PI
    this.addDecoration(stands2, 0, 1, -10)

    // === SCOREBOARD ===
    const scoreboard = this.createScoreboard()
    this.addDecoration(scoreboard, -11, 5, 0)

    // === PLAYER BENCHES (team areas) ===
    const teamBench1 = GeometryUtils.createBench(3, ColorPalettes.basketball.primary)
    this.addDecoration(teamBench1, -3, 1, 8.5)

    const teamBench2 = GeometryUtils.createBench(3, ColorPalettes.basketball.primary)
    this.addDecoration(teamBench2, 3, 1, 8.5)

    // Water coolers
    const cooler1 = this.createWaterCooler()
    this.addDecoration(cooler1, -5, 1, 8.5)

    const cooler2 = this.createWaterCooler()
    this.addDecoration(cooler2, 5, 1, 8.5)

    // === LIGHTING (light poles) ===
    const light1 = this.createLightPole()
    this.addDecoration(light1, 12, 0, 10)

    const light2 = this.createLightPole()
    this.addDecoration(light2, 12, 0, -10)

    const light3 = this.createLightPole()
    this.addDecoration(light3, -12, 0, 10)

    const light4 = this.createLightPole()
    this.addDecoration(light4, -12, 0, -10)

    // === LANDSCAPING ===
    // Trees around perimeter
    const treePositions = [
      [14, 1, 8], [14, 1, 0], [14, 1, -8],
      [-14, 1, 8], [-14, 1, 0], [-14, 1, -8],
      [10, 1, 12], [0, 1, 13], [-10, 1, 12],
      [10, 1, -12], [0, 1, -13], [-10, 1, -12]
    ]

    treePositions.forEach((pos, i) => {
      const tree = GeometryUtils.createLowPolyTree(
        ColorPalettes.basketball.tree,
        1 + Math.random() * 0.4
      )
      this.addDecoration(tree, ...pos)
    })

    // Bushes and grass
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2
      const distance = 13 + Math.random() * 2
      const bush = GeometryUtils.createLowPolyBush(0x228B22, 0.7 + Math.random() * 0.3)
      this.addDecoration(
        bush,
        Math.cos(angle) * distance,
        1,
        Math.sin(angle) * distance
      )
    }

    // Decorative rocks
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + 0.5
      const distance = 12
      const rock = GeometryUtils.createLowPolyRock(0.5 + Math.random() * 0.4, 0x808080)
      this.addDecoration(
        rock,
        Math.cos(angle) * distance,
        1,
        Math.sin(angle) * distance
      )
    }

    // Fencing around court
    const fence1 = GeometryUtils.createFence(20, 2, 0x8B4513)
    fence1.rotation.y = Math.PI / 2
    this.addDecoration(fence1, 10, 1, 0)

    const fence2 = GeometryUtils.createFence(20, 2, 0x8B4513)
    fence2.rotation.y = Math.PI / 2
    this.addDecoration(fence2, -10, 1, 0)
  }

  createBench() {
    const group = new THREE.Group()

    // Seat
    const seat = GeometryUtils.createBox(1.5, 0.1, 0.4, ColorPalettes.basketball.secondary)
    seat.position.y = 0.5
    group.add(seat)

    // Backrest
    const back = GeometryUtils.createBox(1.5, 0.6, 0.1, ColorPalettes.basketball.secondary)
    back.position.y = 0.8
    back.position.z = -0.15
    group.add(back)

    // Legs
    for (let i = 0; i < 4; i++) {
      const leg = GeometryUtils.createBox(0.1, 0.5, 0.1, ColorPalettes.common.black)
      const x = (i % 2) * 1.4 - 0.7
      const z = Math.floor(i / 2) * 0.3 - 0.15
      leg.position.set(x, 0.25, z)
      group.add(leg)
    }

    return group
  }

  createBasketballHoop() {
    const group = new THREE.Group()

    // Pole
    const pole = GeometryUtils.createCylinder(0.2, 0.2, 4, ColorPalettes.basketball.secondary, 6)
    pole.position.y = 2
    group.add(pole)

    // Backboard
    const backboard = GeometryUtils.createBox(2, 1.5, 0.1, ColorPalettes.common.white)
    backboard.position.y = 4
    backboard.position.z = -0.5
    group.add(backboard)

    // Rim (torus would be better but we'll use a cylinder)
    const rim = GeometryUtils.createCylinder(0.4, 0.4, 0.1, ColorPalettes.basketball.primary, 8)
    rim.position.y = 3.5
    rim.position.z = -0.9
    rim.rotation.x = Math.PI / 2
    group.add(rim)

    return group
  }

  createScoreboard() {
    const group = new THREE.Group()

    // Main board
    const board = GeometryUtils.createBox(4, 2, 0.2, 0x1a1a1a)
    group.add(board)

    // Display panels (simplified)
    const homePanel = GeometryUtils.createBox(1.5, 1, 0.1, ColorPalettes.basketball.primary)
    homePanel.position.set(-1, 0, 0.15)
    group.add(homePanel)

    const awayPanel = GeometryUtils.createBox(1.5, 1, 0.1, ColorPalettes.basketball.secondary)
    awayPanel.position.set(1, 0, 0.15)
    group.add(awayPanel)

    // Supporting pole
    const pole = GeometryUtils.createCylinder(0.15, 0.15, 5, 0x505050, 8)
    pole.position.y = -3.5
    group.add(pole)

    return group
  }

  createWaterCooler() {
    const group = new THREE.Group()

    // Base/tank
    const tank = GeometryUtils.createCylinder(0.3, 0.3, 0.8, 0x4169E1, 8)
    tank.position.y = 0.5
    group.add(tank)

    // Lid
    const lid = GeometryUtils.createCylinder(0.32, 0.28, 0.15, 0x1E90FF, 8)
    lid.position.y = 0.975
    group.add(lid)

    // Stand
    const stand = GeometryUtils.createBox(0.5, 0.1, 0.5, 0x2F4F4F)
    stand.position.y = 0.05
    group.add(stand)

    return group
  }

  createLightPole() {
    const group = new THREE.Group()

    // Pole
    const pole = GeometryUtils.createCylinder(0.15, 0.2, 8, 0x404040, 8)
    pole.position.y = 5
    group.add(pole)

    // Light fixtures (4 lights on top)
    const lightPositions = [
      [0.5, 9, 0.5],
      [-0.5, 9, 0.5],
      [0.5, 9, -0.5],
      [-0.5, 9, -0.5]
    ]

    lightPositions.forEach(pos => {
      const light = GeometryUtils.createBox(0.4, 0.3, 0.4, 0xFFFFAA)
      light.position.set(...pos)
      group.add(light)
    })

    // Cross beam
    const beam = GeometryUtils.createBox(1.5, 0.1, 1.5, 0x404040)
    beam.position.y = 8.8
    group.add(beam)

    return group
  }

  async createMediaFrames() {
    // Media frames for basketball action shots
    const frame1 = GeometryUtils.createMediaFrame(4, 3, 0x2C3E50)
    frame1.rotation.y = -Math.PI / 2
    this.addDecoration(frame1, 12, 4, 5)

    const frame2 = GeometryUtils.createMediaFrame(4, 3, 0x2C3E50)
    frame2.rotation.y = -Math.PI / 2
    this.addDecoration(frame2, 12, 4, -5)

    const frame3 = GeometryUtils.createMediaFrame(5, 3, 0x2C3E50)
    frame3.rotation.y = Math.PI
    this.addDecoration(frame3, 0, 4, -12)

    // TODO: Load basketball action photos/videos
  }

  /**
   * Create interactive basketball object
   * @param {InteractiveObjectManager} interactiveManager
   */
  createInteractiveObjects(interactiveManager) {
    if (!interactiveManager) return

    // Create basketball at center court
    const basketballPos = this.position.clone()
    basketballPos.y += 2  // Above ground
    basketballPos.z += 0  // Center court

    this.basketball = new Basketball(basketballPos)
    interactiveManager.registerObject(this.basketball)
    console.log('Added interactive basketball to Basketball Island')
  }

  getName() {
    return 'Basketball Court'
  }
}

export default BasketballIsland
