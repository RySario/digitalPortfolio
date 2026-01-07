/**
 * Interactive Object Manager
 * Manages all interactive objects (basketballs, go-karts, etc.)
 */

import * as THREE from 'three'
import { Config } from '../core/Config.js'

export class InteractiveObjectManager {
  constructor(player, scene, collisionManager) {
    this.player = player
    this.scene = scene
    this.collisionManager = collisionManager

    // Track interactive objects
    this.interactiveObjects = []

    // Basketballs
    this.basketballs = []

    // Vehicles
    this.vehicles = []

    // Current state
    this.nearbyObject = null
    this.isDrivingVehicle = false
    this.currentVehicle = null
  }

  /**
   * Register an interactive object
   * @param {Object} object - Interactive object (Basketball, GoKart, etc.)
   */
  registerObject(object) {
    this.interactiveObjects.push(object)

    // Add to scene if has mesh
    if (object.getMesh) {
      this.scene.add(object.getMesh())
    }

    // Categorize by type
    if (object.constructor.name === 'Basketball') {
      this.basketballs.push(object)
    } else if (object.constructor.name === 'GoKart') {
      this.vehicles.push(object)
    }
  }

  /**
   * Update all interactive objects
   * @param {number} delta
   */
  update(delta) {
    // Update basketballs
    this.basketballs.forEach(ball => {
      ball.update(delta, this.collisionManager)
    })

    // Update vehicles
    this.vehicles.forEach(vehicle => {
      vehicle.update(delta, this.collisionManager)
    })

    // Check for nearby interactive objects
    this.checkNearbyObjects()
  }

  /**
   * Check for interactive objects near the player
   */
  checkNearbyObjects() {
    if (this.isDrivingVehicle) {
      // When driving, we can only exit the vehicle
      this.nearbyObject = this.currentVehicle
      return
    }

    const playerPos = this.player.getPosition()
    let closestObject = null
    let closestDistance = Config.interaction.pickupDistance

    this.interactiveObjects.forEach(obj => {
      const mesh = obj.getMesh ? obj.getMesh() : obj.mesh
      if (!mesh) return

      const objectPos = mesh.position
      const distance = playerPos.distanceTo(objectPos)

      if (distance < closestDistance) {
        closestDistance = distance
        closestObject = obj
      }
    })

    this.nearbyObject = closestObject
  }

  /**
   * Interact with nearby object (E key)
   */
  interact() {
    if (!this.nearbyObject) return

    // If driving vehicle, exit it
    if (this.isDrivingVehicle && this.currentVehicle) {
      this.exitVehicle()
      return
    }

    const objectType = this.nearbyObject.constructor.name

    switch (objectType) {
      case 'Basketball':
        this.pickupBasketball(this.nearbyObject)
        break
      case 'GoKart':
        this.enterVehicle(this.nearbyObject)
        break
    }
  }

  /**
   * Pick up basketball
   * @param {Basketball} basketball
   */
  pickupBasketball(basketball) {
    if (this.player.isHoldingObject) {
      // Already holding something
      return
    }

    basketball.setHeld(true)
    this.player.pickUpObject(basketball.getMesh())

    console.log('Picked up basketball! Press F to throw')
  }

  /**
   * Enter vehicle
   * @param {GoKart} vehicle
   */
  enterVehicle(vehicle) {
    this.isDrivingVehicle = true
    this.currentVehicle = vehicle
    vehicle.enterKart(this.player)

    console.log('Driving go-kart! WASD to drive, E to exit')
  }

  /**
   * Exit vehicle
   */
  exitVehicle() {
    if (!this.currentVehicle) return

    this.currentVehicle.exitKart()
    this.isDrivingVehicle = false
    this.currentVehicle = null

    console.log('Exited vehicle')
  }

  /**
   * Handle vehicle controls
   * @param {string} control
   * @param {boolean} active
   */
  handleVehicleControl(control, active) {
    if (this.isDrivingVehicle && this.currentVehicle) {
      this.currentVehicle.setControl(control, active)
    }
  }

  /**
   * Get nearby object info for UI
   * @returns {Object|null}
   */
  getNearbyObjectInfo() {
    if (!this.nearbyObject) return null

    const objectType = this.nearbyObject.constructor.name

    if (this.isDrivingVehicle) {
      return {
        type: 'vehicle',
        name: 'Go-Kart',
        action: 'Press E to exit'
      }
    }

    switch (objectType) {
      case 'Basketball':
        return {
          type: 'basketball',
          name: 'Basketball',
          action: 'Press E to pick up'
        }
      case 'GoKart':
        return {
          type: 'vehicle',
          name: 'Go-Kart',
          action: 'Press E to drive'
        }
      default:
        return null
    }
  }

  /**
   * Check if player is driving
   * @returns {boolean}
   */
  isDriving() {
    return this.isDrivingVehicle
  }

  /**
   * Get current vehicle
   * @returns {GoKart|null}
   */
  getCurrentVehicle() {
    return this.currentVehicle
  }
}

export default InteractiveObjectManager
