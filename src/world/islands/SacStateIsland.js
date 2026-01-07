/**
 * Sacramento State themed island
 * College campus with school colors (green and gold)
 */

import * as THREE from 'three'
import { Island } from '../Island.js'
import { ColorPalettes } from '../../utils/ColorPalettes.js'
import { GeometryUtils } from '../../utils/GeometryUtils.js'

export class SacStateIsland extends Island {
  constructor(position) {
    super(position)
    this.color = ColorPalettes.sacstate.ground
  }

  createDecorations() {
    // Simple campus buildings
    const building1 = this.createBuilding(2, 3, 2)
    this.addDecoration(building1, 3, 1, 0)

    const building2 = this.createBuilding(1.5, 4, 1.5)
    this.addDecoration(building2, -3, 1, 2)

    const building3 = this.createBuilding(2.5, 2.5, 2)
    this.addDecoration(building3, 0, 1, -4)

    // Pennant flags with school colors
    const flag1 = this.createPennantFlag(ColorPalettes.sacstate.primary)
    this.addDecoration(flag1, 4, 1, 4)

    const flag2 = this.createPennantFlag(ColorPalettes.sacstate.secondary)
    this.addDecoration(flag2, -4, 1, 4)

    // Campus trees
    const tree1 = GeometryUtils.createLowPolyTree(ColorPalettes.sacstate.tree, 1.2)
    this.addDecoration(tree1, 5, 1, -2)

    const tree2 = GeometryUtils.createLowPolyTree(ColorPalettes.sacstate.tree, 1)
    this.addDecoration(tree2, -5, 1, -3)

    const tree3 = GeometryUtils.createLowPolyTree(ColorPalettes.sacstate.tree, 1.1)
    this.addDecoration(tree3, 2, 1, 4)

    // "CSUS" letters on ground (simplified)
    const letter = GeometryUtils.createBox(0.8, 0.05, 0.8, ColorPalettes.sacstate.secondary)
    this.addDecoration(letter, 0, 1.1, 2)
  }

  createBuilding(width, height, depth) {
    const group = new THREE.Group()

    // Main building structure
    const building = GeometryUtils.createBox(width, height, depth, ColorPalettes.sacstate.primary)
    building.position.y = height / 2
    group.add(building)

    // Windows (small white squares)
    const windowRows = Math.floor(height / 0.8)
    const windowCols = Math.floor(width / 0.6)

    for (let row = 0; row < windowRows; row++) {
      for (let col = 0; col < windowCols; col++) {
        const window = GeometryUtils.createBox(0.3, 0.4, 0.05, ColorPalettes.sacstate.accent)
        window.position.x = (col - windowCols / 2 + 0.5) * 0.6
        window.position.y = (row + 0.5) * 0.8
        window.position.z = depth / 2 + 0.03
        group.add(window)
      }
    }

    // Roof
    const roof = GeometryUtils.createBox(width + 0.2, 0.3, depth + 0.2, ColorPalettes.sacstate.secondary)
    roof.position.y = height + 0.15
    group.add(roof)

    return group
  }

  createPennantFlag() {
    const group = new THREE.Group()

    // Pole
    const pole = GeometryUtils.createCylinder(0.05, 0.05, 3, ColorPalettes.common.black, 6)
    pole.position.y = 1.5
    group.add(pole)

    // Triangular flag (using cone rotated)
    const flag = GeometryUtils.createCone(0.8, 1.5, ColorPalettes.sacstate.secondary, 3)
    flag.rotation.z = -Math.PI / 2
    flag.position.x = 0.75
    flag.position.y = 3
    group.add(flag)

    return group
  }

  async createMediaFrames() {
    // Media frames will be added later
  }

  getName() {
    return 'Sacramento State'
  }
}

export default SacStateIsland
