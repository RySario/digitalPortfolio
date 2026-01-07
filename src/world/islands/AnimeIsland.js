/**
 * Anime themed island
 * Japanese aesthetic with torii gate, cherry blossoms, lanterns
 */

import * as THREE from 'three'
import { Island } from '../Island.js'
import { ColorPalettes } from '../../utils/ColorPalettes.js'
import { GeometryUtils } from '../../utils/GeometryUtils.js'

export class AnimeIsland extends Island {
  constructor(position) {
    super(position)
    this.color = ColorPalettes.anime.ground
  }

  createDecorations() {
    // Torii gate (traditional Japanese gate)
    const torii = this.createToriiGate()
    this.addDecoration(torii, 0, 1, 0)

    // Cherry blossom trees
    const cherryTree1 = GeometryUtils.createLowPolyTree(ColorPalettes.anime.tree, 1.3)
    this.addDecoration(cherryTree1, 4, 1, 4)

    const cherryTree2 = GeometryUtils.createLowPolyTree(ColorPalettes.anime.tree, 1.2)
    this.addDecoration(cherryTree2, -4, 1, 4)

    const cherryTree3 = GeometryUtils.createLowPolyTree(ColorPalettes.anime.tree, 1.1)
    this.addDecoration(cherryTree3, 5, 1, -3)

    // Japanese lanterns
    const lantern1 = this.createLantern()
    this.addDecoration(lantern1, 2, 1, -4)

    const lantern2 = this.createLantern()
    this.addDecoration(lantern2, -2, 1, -4)

    // Decorative rocks
    const rock1 = GeometryUtils.createLowPolyRock(0.8, ColorPalettes.common.shadow)
    this.addDecoration(rock1, -3, 1, -2)

    const rock2 = GeometryUtils.createLowPolyRock(0.6, ColorPalettes.common.shadow)
    this.addDecoration(rock2, 3, 1, 3)
  }

  createToriiGate() {
    const group = new THREE.Group()

    // Two vertical poles
    const pole1 = GeometryUtils.createCylinder(0.3, 0.3, 4, ColorPalettes.anime.torii, 6)
    pole1.position.set(-1.5, 2, 0)
    group.add(pole1)

    const pole2 = GeometryUtils.createCylinder(0.3, 0.3, 4, ColorPalettes.anime.torii, 6)
    pole2.position.set(1.5, 2, 0)
    group.add(pole2)

    // Top horizontal beam (kasagi)
    const topBeam = GeometryUtils.createBox(4, 0.4, 0.4, ColorPalettes.anime.torii)
    topBeam.position.y = 4.2
    group.add(topBeam)

    // Second horizontal beam (nuki)
    const midBeam = GeometryUtils.createBox(3.5, 0.3, 0.3, ColorPalettes.anime.torii)
    midBeam.position.y = 3.2
    group.add(midBeam)

    return group
  }

  createLantern() {
    const group = new THREE.Group()

    // Pole
    const pole = GeometryUtils.createCylinder(0.1, 0.1, 2, ColorPalettes.common.black, 6)
    pole.position.y = 1
    group.add(pole)

    // Lantern body (hexagonal cylinder)
    const lanternBody = GeometryUtils.createCylinder(0.4, 0.4, 1, ColorPalettes.anime.accent, 6)
    lanternBody.position.y = 2.5
    group.add(lanternBody)

    // Lantern top
    const lanternTop = GeometryUtils.createCone(0.5, 0.3, ColorPalettes.common.black, 6)
    lanternTop.position.y = 3.2
    group.add(lanternTop)

    return group
  }

  async createMediaFrames() {
    // Media frames will be added later
  }

  getName() {
    return 'Anime Shrine'
  }
}

export default AnimeIsland
