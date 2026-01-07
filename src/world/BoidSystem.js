/**
 * Boid System - Flocking birds using boid algorithm
 * Implements separation, alignment, and cohesion behaviors
 */

import * as THREE from 'three'
import { Config } from '../core/Config.js'
import { GeometryUtils } from '../utils/GeometryUtils.js'

class Boid {
  constructor(position) {
    this.position = position.clone()
    this.velocity = new THREE.Vector3(
      Math.random() - 0.5,
      (Math.random() - 0.5) * 0.3,
      Math.random() - 0.5
    ).normalize().multiplyScalar(Config.birds.speed)

    this.acceleration = new THREE.Vector3()
    this.maxSpeed = Config.birds.speed
    this.maxForce = 0.5

    // Create bird mesh
    this.mesh = this.createBirdMesh()
    this.mesh.position.copy(this.position)
  }

  createBirdMesh() {
    const group = new THREE.Group()

    // Body (elongated)
    const body = GeometryUtils.createCone(0.3, 0.8, 0x4A4A4A, 4)
    body.rotation.x = Math.PI / 2
    group.add(body)

    // Wings (simple triangles)
    const wingGeom = new THREE.ConeGeometry(0.6, 0.3, 3)
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x6A6A6A,
      flatShading: true
    })

    const leftWing = new THREE.Mesh(wingGeom, wingMat)
    leftWing.rotation.z = Math.PI / 2
    leftWing.position.set(-0.4, 0, 0)
    group.add(leftWing)

    const rightWing = new THREE.Mesh(wingGeom, wingMat)
    rightWing.rotation.z = -Math.PI / 2
    rightWing.position.set(0.4, 0, 0)
    group.add(rightWing)

    // Store wing references for animation
    group.userData.leftWing = leftWing
    group.userData.rightWing = rightWing
    group.userData.wingPhase = Math.random() * Math.PI * 2

    group.castShadow = false
    group.receiveShadow = false

    return group
  }

  applyForce(force) {
    this.acceleration.add(force)
  }

  /**
   * Separation - avoid crowding neighbors
   */
  separate(boids) {
    const desiredSeparation = Config.birds.separationDistance
    const steer = new THREE.Vector3()
    let count = 0

    boids.forEach(other => {
      const distance = this.position.distanceTo(other.position)
      if (distance > 0 && distance < desiredSeparation) {
        const diff = new THREE.Vector3().subVectors(this.position, other.position)
        diff.normalize()
        diff.divideScalar(distance)
        steer.add(diff)
        count++
      }
    })

    if (count > 0) {
      steer.divideScalar(count)
      steer.normalize()
      steer.multiplyScalar(this.maxSpeed)
      steer.sub(this.velocity)
      steer.clampLength(0, this.maxForce)
    }

    return steer
  }

  /**
   * Alignment - steer towards average heading of neighbors
   */
  align(boids) {
    const neighborDist = Config.birds.alignmentDistance
    const sum = new THREE.Vector3()
    let count = 0

    boids.forEach(other => {
      const distance = this.position.distanceTo(other.position)
      if (distance > 0 && distance < neighborDist) {
        sum.add(other.velocity)
        count++
      }
    })

    if (count > 0) {
      sum.divideScalar(count)
      sum.normalize()
      sum.multiplyScalar(this.maxSpeed)

      const steer = new THREE.Vector3().subVectors(sum, this.velocity)
      steer.clampLength(0, this.maxForce)
      return steer
    }

    return new THREE.Vector3()
  }

  /**
   * Cohesion - steer towards average position of neighbors
   */
  cohesion(boids) {
    const neighborDist = Config.birds.cohesionDistance
    const sum = new THREE.Vector3()
    let count = 0

    boids.forEach(other => {
      const distance = this.position.distanceTo(other.position)
      if (distance > 0 && distance < neighborDist) {
        sum.add(other.position)
        count++
      }
    })

    if (count > 0) {
      sum.divideScalar(count)
      return this.seek(sum)
    }

    return new THREE.Vector3()
  }

  seek(target) {
    const desired = new THREE.Vector3().subVectors(target, this.position)
    desired.normalize()
    desired.multiplyScalar(this.maxSpeed)

    const steer = new THREE.Vector3().subVectors(desired, this.velocity)
    steer.clampLength(0, this.maxForce)
    return steer
  }

  /**
   * Update boid position and velocity
   */
  update(delta, boids) {
    // Apply boid behaviors
    const sep = this.separate(boids).multiplyScalar(1.5)
    const ali = this.align(boids)
    const coh = this.cohesion(boids)

    this.applyForce(sep)
    this.applyForce(ali)
    this.applyForce(coh)

    // Update velocity
    this.velocity.add(this.acceleration.multiplyScalar(delta))
    this.velocity.clampLength(0, this.maxSpeed)

    // Update position
    this.position.add(this.velocity.clone().multiplyScalar(delta))

    // Reset acceleration
    this.acceleration.set(0, 0, 0)

    // Keep within bounds
    this.boundaries()

    // Update mesh
    this.mesh.position.copy(this.position)

    // Orient towards velocity
    if (this.velocity.length() > 0.1) {
      const lookTarget = this.position.clone().add(this.velocity)
      this.mesh.lookAt(lookTarget)
    }

    // Animate wings
    this.animateWings(delta)
  }

  /**
   * Keep boids within a spherical boundary
   */
  boundaries() {
    const radius = Config.birds.spreadRadius

    if (this.position.length() > radius) {
      const steer = this.position.clone().negate().normalize().multiplyScalar(this.maxSpeed)
      this.applyForce(steer)
    }

    // Height bounds
    if (this.position.y < Config.birds.minHeight) {
      this.velocity.y += 0.1
    }
    if (this.position.y > Config.birds.maxHeight) {
      this.velocity.y -= 0.1
    }
  }

  /**
   * Animate wing flapping
   */
  animateWings(delta) {
    this.mesh.userData.wingPhase += delta * 8

    const flap = Math.sin(this.mesh.userData.wingPhase) * 0.3

    if (this.mesh.userData.leftWing) {
      this.mesh.userData.leftWing.rotation.y = flap
    }
    if (this.mesh.userData.rightWing) {
      this.mesh.userData.rightWing.rotation.y = -flap
    }
  }
}

export class BoidSystem {
  constructor(scene) {
    this.scene = scene
    this.boids = []

    this.createFlock()
  }

  /**
   * Create a flock of birds
   */
  createFlock() {
    for (let i = 0; i < Config.birds.count; i++) {
      // Random position in the sky
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * Config.birds.spreadRadius,
        Config.birds.minHeight + Math.random() * (Config.birds.maxHeight - Config.birds.minHeight),
        (Math.random() - 0.5) * Config.birds.spreadRadius
      )

      const boid = new Boid(position)
      this.boids.push(boid)
      this.scene.add(boid.mesh)
    }

    console.log(`Created flock of ${this.boids.length} birds`)
  }

  /**
   * Update all boids
   */
  update(delta) {
    this.boids.forEach(boid => {
      boid.update(delta, this.boids)
    })
  }
}

export default BoidSystem
