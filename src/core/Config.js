/**
 * Central configuration for the 3D portfolio
 * All constants and settings in one place
 */

export const Config = {
  // Camera settings
  camera: {
    fov: 60,
    near: 0.1,
    far: 2000,
    startPosition: { x: 0, y: 80, z: 120 },
    lookAt: { x: 0, y: 0, z: 0 },
    // Third-person camera settings
    thirdPerson: {
      distance: 8,      // Distance from player
      height: 1.5,      // Additional height offset
      smoothness: 0.1   // Camera lerp speed (lower = smoother)
    }
  },

  // Player controls
  controls: {
    maxSpeed: 10,
    runSpeed: 16,
    rotationSpeed: 8,
    mouseSensitivity: 0.002
  },

  // Orbit controls (for debugging/free camera mode)
  orbitControls: {
    enableDamping: true,
    dampingFactor: 0.05,
    minDistance: 10,
    maxDistance: 300,
    maxPolarAngle: Math.PI / 2.1,  // Prevent going below ground
    minPolarAngle: Math.PI / 6     // Prevent too steep top-down
  },

  // Island layout - connected world
  islands: {
    count: 6,
    baseSize: 50,      // Much bigger islands
    baseHeight: 3,
    segments: 32,      // High detail for smooth islands
    spacing: 60        // Distance between island centers
  },

  // Central hub
  centralHub: {
    radius: 30,
    height: 2
  },

  // Ocean
  ocean: {
    size: 500,
    color: 0x006994,
    position: { x: 0, y: -2, z: 0 }
  },

  // Clouds
  clouds: {
    count: 30,
    minHeight: 50,
    maxHeight: 100,
    spreadRadius: 300,
    minSize: 4,
    maxSize: 12
  },

  // Birds (boids)
  birds: {
    count: 25,
    minHeight: 20,
    maxHeight: 80,
    spreadRadius: 200,
    speed: 5,
    separationDistance: 3,
    alignmentDistance: 10,
    cohesionDistance: 15
  },

  // Animals
  animals: {
    perIsland: 3,
    types: ['deer', 'rabbit', 'bird']
  },

  // Land bridges
  bridges: {
    width: 8,
    height: 1.5,
    color: 0x8B7355
  },

  // Collision detection (needed by CollisionManager)
  collision: {
    playerRadius: 0.5,
    groundOffset: 0,      // Player feet at ground level
    groundCheckDistance: 50
  },

  // Location detection
  location: {
    islandProximity: 20,
    spawnProximity: 10
  },

  // Media frames
  media: {
    defaultWidth: 4,
    defaultHeight: 3,
    slideshowInterval: 5000  // 5 seconds
  },

  // Interaction settings
  interaction: {
    pickupDistance: 3,
    throwForce: 15
  },

  // Scene
  scene: {
    backgroundColor: 0x87CEEB,
    fogColor: 0x87CEEB,
    fogDensity: 0.002
  },

  // Lighting
  lighting: {
    ambient: {
      color: 0xffffff,
      intensity: 0.6
    },
    directional: {
      color: 0xffffff,
      intensity: 0.8,
      position: { x: 50, y: 50, z: 50 },
      shadowMapSize: 2048
    },
    hemisphere: {
      skyColor: 0x87CEEB,
      groundColor: 0xB8A99F,
      intensity: 0.5
    }
  },

  // Player/Avatar settings
  player: {
    height: 2.5,
    radius: 0.6,
    color: 0x4A90E2,  // Nice blue color
    startPosition: { x: 0, y: 3, z: 0 },  // Spawn on central hub
    speed: 10,
    jumpForce: 12,
    gravity: 30,
    rotationSpeed: 3
  }
}

export default Config
