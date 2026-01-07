/**
 * Karting/F1 themed island
 * Racing theme with track, barriers, and checkered flags
 */

import * as THREE from 'three'
import { Island } from '../Island.js'
import { ColorPalettes } from '../../utils/ColorPalettes.js'
import { GeometryUtils } from '../../utils/GeometryUtils.js'
import { GoKart } from '../../interactive/GoKart.js'

export class KartingIsland extends Island {
  constructor(position) {
    super(position)
    this.color = ColorPalettes.karting.ground
    this.goKart = null  // Store interactive go-kart
  }

  createDecorations() {
    // Race track outline (checkered pattern)
    this.createTrackLines()

    // Tire barriers
    const barrier1 = this.createTireBarrier()
    this.addDecoration(barrier1, 4, 1, -3)

    const barrier2 = this.createTireBarrier()
    this.addDecoration(barrier2, -4, 1, 3)

    // Checkered flags
    const flag1 = this.createCheckeredFlag()
    this.addDecoration(flag1, 0, 1, 5)

    const flag2 = this.createCheckeredFlag()
    this.addDecoration(flag2, 0, 1, -5)

    // Simple kart decoration
    const kart = this.createSimpleKart()
    this.addDecoration(kart, -2, 1.3, 0)

    // Trees
    const tree1 = GeometryUtils.createLowPolyTree(ColorPalettes.karting.tree, 0.9)
    this.addDecoration(tree1, 6, 1, 0)

    const tree2 = GeometryUtils.createLowPolyTree(ColorPalettes.karting.tree, 1)
    this.addDecoration(tree2, -6, 1, -2)
  }

  createTrackLines() {
    // White track lines in a circuit pattern
    const line1 = GeometryUtils.createBox(8, 0.05, 0.3, ColorPalettes.common.white)
    this.addDecoration(line1, 0, 1.1, 0)

    const line2 = GeometryUtils.createBox(0.3, 0.05, 8, ColorPalettes.common.white)
    this.addDecoration(line2, 3, 1.1, 0)

    const line3 = GeometryUtils.createBox(0.3, 0.05, 8, ColorPalettes.common.white)
    this.addDecoration(line3, -3, 1.1, 0)
  }

  createTireBarrier() {
    const group = new THREE.Group()

    // Stack of 3 tires
    for (let i = 0; i < 3; i++) {
      const tire = GeometryUtils.createCylinder(0.5, 0.5, 0.3, ColorPalettes.common.black, 8)
      tire.rotation.z = Math.PI / 2
      tire.position.x = i * 0.8 - 0.8
      group.add(tire)
    }

    return group
  }

  createCheckeredFlag() {
    const group = new THREE.Group()

    // Pole
    const pole = GeometryUtils.createCylinder(0.05, 0.05, 3, ColorPalettes.common.black, 6)
    pole.position.y = 1.5
    group.add(pole)

    // Flag (simple box with checkered texture simulation)
    const flag = GeometryUtils.createBox(1.5, 1, 0.05, ColorPalettes.common.white)
    flag.position.y = 3
    flag.position.x = 0.75
    group.add(flag)

    // Black squares on flag
    const blackSquare = GeometryUtils.createBox(0.75, 0.5, 0.06, ColorPalettes.common.black)
    blackSquare.position.y = 3.25
    blackSquare.position.x = 0.375
    group.add(blackSquare)

    return group
  }

  createSimpleKart() {
    const group = new THREE.Group()

    // Body
    const body = GeometryUtils.createBox(1.5, 0.5, 1, ColorPalettes.karting.primary)
    body.position.y = 0.5
    group.add(body)

    // Wheels (4 cylinders)
    const wheelPositions = [
      { x: 0.6, z: 0.5 },
      { x: 0.6, z: -0.5 },
      { x: -0.6, z: 0.5 },
      { x: -0.6, z: -0.5 }
    ]

    wheelPositions.forEach(pos => {
      const wheel = GeometryUtils.createCylinder(0.25, 0.25, 0.2, ColorPalettes.common.black, 8)
      wheel.rotation.z = Math.PI / 2
      wheel.position.set(pos.x, 0.25, pos.z)
      group.add(wheel)
    })

    return group
  }

  async createMediaFrames() {
    // Media frames will be added later
  }

  /**
   * Create interactive go-kart
   * @param {InteractiveObjectManager} interactiveManager
   */
  createInteractiveObjects(interactiveManager) {
    if (!interactiveManager) return

    // Create go-kart near the starting line
    const kartPos = this.position.clone()
    kartPos.y += 1.5  // Above ground
    kartPos.x -= 2    // Offset from center

    this.goKart = new GoKart(kartPos)
    interactiveManager.registerObject(this.goKart)
    console.log('Added drivable go-kart to Racing Track')
  }

  getName() {
    return 'Racing Track'
  }
}

export default KartingIsland
