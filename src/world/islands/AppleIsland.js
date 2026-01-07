/**
 * Apple/Work themed island
 * Tech minimal aesthetic with Apple colors (silver, black, blue)
 */

import * as THREE from 'three'
import { Island } from '../Island.js'
import { ColorPalettes } from '../../utils/ColorPalettes.js'
import { GeometryUtils } from '../../utils/GeometryUtils.js'

export class AppleIsland extends Island {
  constructor(position) {
    super(position)
    this.color = ColorPalettes.apple.ground
  }

  createDecorations() {
    // Apple logo (simplified as sphere)
    const appleLogo = GeometryUtils.createSphere(1, ColorPalettes.apple.primary, 8)
    this.addDecoration(appleLogo, 0, 2, -4)

    // Product silhouettes - Laptop
    const laptop = this.createLaptop()
    this.addDecoration(laptop, 3, 1, 2)

    // Product silhouettes - Phone
    const phone = this.createPhone()
    this.addDecoration(phone, -3, 1, 2)

    // Modern minimal trees (stylized in tech blue)
    const tree1 = GeometryUtils.createLowPolyTree(ColorPalettes.apple.tree, 1)
    this.addDecoration(tree1, 5, 1, 0)

    const tree2 = GeometryUtils.createLowPolyTree(ColorPalettes.apple.tree, 0.9)
    this.addDecoration(tree2, -5, 1, -2)

    // Tech-themed decorative elements
    const cube1 = GeometryUtils.createBox(0.8, 0.8, 0.8, ColorPalettes.apple.accent)
    this.addDecoration(cube1, 4, 1.4, -3)

    const cube2 = GeometryUtils.createBox(1, 1, 1, ColorPalettes.apple.primary)
    this.addDecoration(cube2, -4, 1.5, 3)

    // Minimalist rocks
    const rock1 = GeometryUtils.createLowPolyRock(0.6, ColorPalettes.apple.primary)
    this.addDecoration(rock1, 2, 1, -5)

    const rock2 = GeometryUtils.createLowPolyRock(0.5, ColorPalettes.apple.primary)
    this.addDecoration(rock2, -2, 1, 4)
  }

  createLaptop() {
    const group = new THREE.Group()

    // Base (keyboard section)
    const base = GeometryUtils.createBox(2, 0.1, 1.5, ColorPalettes.apple.primary)
    base.position.y = 0.05
    group.add(base)

    // Screen
    const screen = GeometryUtils.createBox(2, 1.3, 0.1, ColorPalettes.apple.secondary)
    screen.position.y = 0.75
    screen.position.z = -0.65
    screen.rotation.x = -0.3
    group.add(screen)

    // Screen display (blue glow)
    const display = GeometryUtils.createBox(1.8, 1.1, 0.05, ColorPalettes.apple.accent)
    display.position.y = 0.75
    display.position.z = -0.6
    display.rotation.x = -0.3
    group.add(display)

    return group
  }

  createPhone() {
    const group = new THREE.Group()

    // Phone body
    const body = GeometryUtils.createBox(0.6, 1.2, 0.1, ColorPalettes.apple.secondary)
    body.position.y = 0.6
    body.rotation.x = Math.PI / 2
    body.rotation.y = Math.PI / 6
    group.add(body)

    // Screen
    const screen = GeometryUtils.createBox(0.55, 1.1, 0.05, ColorPalettes.apple.accent)
    screen.position.y = 0.62
    screen.rotation.x = Math.PI / 2
    screen.rotation.y = Math.PI / 6
    group.add(screen)

    return group
  }

  async createMediaFrames() {
    // Media frames will be added later
  }

  getName() {
    return 'Apple Campus'
  }
}

export default AppleIsland
