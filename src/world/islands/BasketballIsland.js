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
    // Basketball hoop (main)
    const hoop = this.createBasketballHoop()
    this.addDecoration(hoop, 6, 0, 0)

    // Second hoop on opposite side
    const hoop2 = this.createBasketballHoop()
    hoop2.rotation.y = Math.PI
    this.addDecoration(hoop2, -6, 0, 0)

    // Court lines (painted on ground) - full court layout
    // Center line
    const centerLine = GeometryUtils.createBox(0.2, 0.05, 16, ColorPalettes.common.white)
    this.addDecoration(centerLine, 0, 1.1, 0)

    // Sidelines
    const sideline1 = GeometryUtils.createBox(20, 0.05, 0.2, ColorPalettes.common.white)
    this.addDecoration(sideline1, 0, 1.1, 8)

    const sideline2 = GeometryUtils.createBox(20, 0.05, 0.2, ColorPalettes.common.white)
    this.addDecoration(sideline2, 0, 1.1, -8)

    // Three-point arc (simplified as half circle lines)
    for (let i = 0; i < 10; i++) {
      const angle = (i / 9) * Math.PI - Math.PI / 2
      const x1 = Math.cos(angle) * 5 + 6
      const z1 = Math.sin(angle) * 5
      const arcSegment1 = GeometryUtils.createBox(0.2, 0.05, 0.5, ColorPalettes.common.white)
      arcSegment1.rotation.y = angle
      this.addDecoration(arcSegment1, x1, 1.1, z1)

      const x2 = Math.cos(angle) * 5 - 6
      const z2 = Math.sin(angle) * 5
      const arcSegment2 = GeometryUtils.createBox(0.2, 0.05, 0.5, ColorPalettes.common.white)
      arcSegment2.rotation.y = angle + Math.PI
      this.addDecoration(arcSegment2, x2, 1.1, z2)
    }

    // Benches
    const bench1 = this.createBench()
    this.addDecoration(bench1, -2, 1, 9)

    const bench2 = this.createBench()
    this.addDecoration(bench2, 2, 1, 9)

    // Trees around perimeter (MORE!)
    const tree1 = GeometryUtils.createLowPolyTree(ColorPalettes.basketball.tree, 1.5)
    this.addDecoration(tree1, 9, 1, 7)

    const tree2 = GeometryUtils.createLowPolyTree(ColorPalettes.basketball.tree, 1.3)
    this.addDecoration(tree2, -9, 1, 7)

    const tree3 = GeometryUtils.createLowPolyTree(ColorPalettes.basketball.tree, 1.4)
    this.addDecoration(tree3, 9, 1, -7)

    const tree4 = GeometryUtils.createLowPolyTree(ColorPalettes.basketball.tree, 1.2)
    this.addDecoration(tree4, -9, 1, -7)

    const tree5 = GeometryUtils.createLowPolyTree(ColorPalettes.basketball.tree, 1.1)
    this.addDecoration(tree5, 0, 1, 10)

    const tree6 = GeometryUtils.createLowPolyTree(ColorPalettes.basketball.tree, 1.3)
    this.addDecoration(tree6, 0, 1, -10)

    // Bushes
    const bush1 = GeometryUtils.createLowPolyBush(ColorPalettes.basketball.tree, 0.8)
    this.addDecoration(bush1, 8, 1, 0)

    const bush2 = GeometryUtils.createLowPolyBush(ColorPalettes.basketball.tree, 0.7)
    this.addDecoration(bush2, -8, 1, 3)

    // Rocks
    const rock1 = GeometryUtils.createLowPolyRock(0.6, ColorPalettes.basketball.secondary)
    this.addDecoration(rock1, 7, 1, 5)

    const rock2 = GeometryUtils.createLowPolyRock(0.5, ColorPalettes.basketball.secondary)
    this.addDecoration(rock2, -7, 1, -4)
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

  async createMediaFrames() {
    // Media frames will be added later when MediaFrame class is created
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
