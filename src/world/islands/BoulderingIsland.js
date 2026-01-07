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
    // Climbing wall
    const wall = this.createClimbingWall()
    this.addDecoration(wall, 0, 1, -5)

    // Crash pads at base of wall
    const pad1 = GeometryUtils.createBox(2, 0.3, 2, ColorPalettes.bouldering.accent)
    this.addDecoration(pad1, 0, 1.15, -3.5)

    const pad2 = GeometryUtils.createBox(2, 0.3, 2, ColorPalettes.bouldering.secondary)
    this.addDecoration(pad2, 2.5, 1.15, -3.5)

    // Rocks scattered around
    const rock1 = GeometryUtils.createLowPolyRock(1.2, ColorPalettes.bouldering.primary)
    this.addDecoration(rock1, 4, 1, 3)

    const rock2 = GeometryUtils.createLowPolyRock(0.8, ColorPalettes.bouldering.secondary)
    this.addDecoration(rock2, -4, 1, -2)

    const rock3 = GeometryUtils.createLowPolyRock(1, ColorPalettes.bouldering.primary)
    this.addDecoration(rock3, 3, 1, -4)

    const rock4 = GeometryUtils.createLowPolyRock(0.6, ColorPalettes.bouldering.secondary)
    this.addDecoration(rock4, -3, 1, 4)

    // Trees
    const tree1 = GeometryUtils.createLowPolyTree(ColorPalettes.bouldering.tree, 1)
    this.addDecoration(tree1, 5, 1, 0)

    const tree2 = GeometryUtils.createLowPolyTree(ColorPalettes.bouldering.tree, 0.9)
    this.addDecoration(tree2, -5, 1, 2)

    // Chalk bag prop
    const chalkBag = GeometryUtils.createCylinder(0.3, 0.4, 0.5, ColorPalettes.bouldering.accent, 8)
    this.addDecoration(chalkBag, 1.5, 1.3, -2)
  }

  createClimbingWall() {
    const group = new THREE.Group()

    // Wall (tall, slightly angled back)
    const wall = GeometryUtils.createBox(6, 5, 0.5, ColorPalettes.bouldering.secondary)
    wall.position.y = 2.5
    wall.rotation.x = -0.2  // Slight overhang
    group.add(wall)

    // Climbing holds (colorful small spheres)
    const holdColors = [
      ColorPalettes.bouldering.accent,
      ColorPalettes.karting.primary,
      ColorPalettes.basketball.primary,
      ColorPalettes.anime.accent
    ]

    for (let i = 0; i < 15; i++) {
      const hold = GeometryUtils.createSphere(
        0.15 + Math.random() * 0.1,
        holdColors[Math.floor(Math.random() * holdColors.length)],
        6
      )

      hold.position.x = (Math.random() - 0.5) * 5
      hold.position.y = Math.random() * 4 + 0.5
      hold.position.z = 0.3
      group.add(hold)
    }

    return group
  }

  async createMediaFrames() {
    // Media frames will be added later
  }

  getName() {
    return 'Bouldering Crag'
  }
}

export default BoulderingIsland
