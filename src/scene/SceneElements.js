/**
 * Scene Elements
 * Environmental objects: car, arcade machine, street light, props
 */

import * as THREE from 'three'
import { Config } from '../core/Config.js'

export class SceneElements {
  constructor() {
    this.group = new THREE.Group()
    this.elementsConfig = Config.sceneElements

    this.createArcade()
    this.createStreetLight()
    this.createProps()
  }

  /**
   * Create arcade machine
   */
  createArcade() {
    const arcadeConfig = this.elementsConfig.arcade
    const arcadeGroup = new THREE.Group()

    // Base/cabinet
    const cabinetGeom = new THREE.BoxGeometry(1.2, 1.8, 0.8)
    const cabinetMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.7,
      metalness: 0.2
    })
    const cabinet = new THREE.Mesh(cabinetGeom, cabinetMat)
    cabinet.position.y = 0.9
    cabinet.castShadow = true
    arcadeGroup.add(cabinet)

    // Screen
    const screenGeom = new THREE.BoxGeometry(0.9, 0.7, 0.1)
    const screenMat = new THREE.MeshStandardMaterial({
      color: arcadeConfig.screenColor,
      emissive: arcadeConfig.screenColor,
      emissiveIntensity: arcadeConfig.emissiveIntensity
    })
    const screen = new THREE.Mesh(screenGeom, screenMat)
    screen.position.set(0, 1.3, 0.45)
    arcadeGroup.add(screen)

    // Screen light
    const screenLight = new THREE.PointLight(
      arcadeConfig.screenColor,
      2,
      5
    )
    screenLight.position.set(0, 1.3, 0.8)
    arcadeGroup.add(screenLight)

    // Control panel
    const panelGeom = new THREE.BoxGeometry(1.0, 0.15, 0.4)
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      roughness: 0.6,
      metalness: 0.3
    })
    const panel = new THREE.Mesh(panelGeom, panelMat)
    panel.position.set(0, 0.5, 0.3)
    panel.rotation.x = -Math.PI / 6
    arcadeGroup.add(panel)

    // Position and rotate arcade
    arcadeGroup.position.set(
      arcadeConfig.position.x,
      arcadeConfig.position.y,
      arcadeConfig.position.z
    )
    arcadeGroup.rotation.y = arcadeConfig.rotation.y
    arcadeGroup.scale.setScalar(arcadeConfig.scale)

    this.group.add(arcadeGroup)
  }

  /**
   * Create street light with multiple lamps (like inspiration image)
   */
  createStreetLight() {
    const lightConfig = this.elementsConfig.streetLight
    const lightGroup = new THREE.Group()

    // Main pole
    const poleGeom = new THREE.CylinderGeometry(0.12, 0.12, lightConfig.height, 8)
    const poleMat = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      roughness: 0.6,
      metalness: 0.6
    })
    const pole = new THREE.Mesh(poleGeom, poleMat)
    pole.position.y = lightConfig.height / 2
    pole.castShadow = true
    lightGroup.add(pole)

    // Create 3 lamp fixtures at different heights (like inspiration)
    const lampHeights = [lightConfig.height - 1, lightConfig.height - 2.5, lightConfig.height - 4]
    const lampColors = [0xff00ff, 0x00d9ff, 0xff00ff]  // Alternating pink and cyan

    lampHeights.forEach((height, index) => {
      // Lamp arm extending from pole
      const armGeom = new THREE.CylinderGeometry(0.08, 0.08, 1.5, 6)
      const arm = new THREE.Mesh(armGeom, poleMat)
      arm.position.set(0.75, height, 0)
      arm.rotation.z = Math.PI / 2
      arm.castShadow = true
      lightGroup.add(arm)

      // Lamp fixture housing
      const fixtureGeom = new THREE.BoxGeometry(0.4, 0.6, 0.4)
      const fixtureMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.5,
        metalness: 0.5
      })
      const fixture = new THREE.Mesh(fixtureGeom, fixtureMat)
      fixture.position.set(1.5, height, 0)
      fixture.castShadow = true
      lightGroup.add(fixture)

      // Light bulb/panel (emissive)
      const bulbGeom = new THREE.BoxGeometry(0.35, 0.5, 0.35)
      const bulbMat = new THREE.MeshStandardMaterial({
        color: lampColors[index],
        emissive: lampColors[index],
        emissiveIntensity: lightConfig.emissiveIntensity || 1.0
      })
      const bulb = new THREE.Mesh(bulbGeom, bulbMat)
      bulb.position.set(1.5, height, 0)
      lightGroup.add(bulb)

      // Point light for illumination
      const light = new THREE.PointLight(
        lampColors[index],
        lightConfig.intensity || 5,
        20,  // Increased range
        1.5  // Decay
      )
      light.position.set(1.5, height, 0)
      light.castShadow = true
      light.shadow.mapSize.width = 512
      light.shadow.mapSize.height = 512
      lightGroup.add(light)
    })

    // Position street light
    lightGroup.position.set(
      lightConfig.position.x,
      lightConfig.position.y,
      lightConfig.position.z
    )

    // Store reference for attaching signs later
    this.streetLightGroup = lightGroup

    this.group.add(lightGroup)
  }

  /**
   * Create props (cones, crates, etc.)
   */
  createProps() {
    this.elementsConfig.props.forEach(propConfig => {
      switch (propConfig.type) {
        case 'cone':
          this.createCone(propConfig.position)
          break
        case 'crate':
          this.createCrate(propConfig.position)
          break
      }
    })
  }

  createCone(position) {
    const coneGeom = new THREE.ConeGeometry(0.3, 0.8, 8)
    const coneMat = new THREE.MeshStandardMaterial({
      color: 0xff6600,
      roughness: 0.8,
      metalness: 0.1
    })
    const cone = new THREE.Mesh(coneGeom, coneMat)
    cone.position.set(position.x, position.y, position.z)
    cone.castShadow = true
    this.group.add(cone)
  }

  createCrate(position) {
    const crateGeom = new THREE.BoxGeometry(1, 1, 1)
    const crateMat = new THREE.MeshStandardMaterial({
      color: 0x5a4a3a,
      roughness: 0.9,
      metalness: 0.1
    })
    const crate = new THREE.Mesh(crateGeom, crateMat)
    crate.position.set(position.x, position.y, position.z)
    crate.rotation.y = Math.random() * Math.PI
    crate.castShadow = true
    this.group.add(crate)
  }

  getGroup() {
    return this.group
  }

  getStreetLightGroup() {
    return this.streetLightGroup
  }
}

export default SceneElements
