/**
 * Central configuration for the 3D portfolio
 * All constants and settings in one place
 */

export const Config = {
  // Camera settings (orbit)
  camera: {
    fov: 60,
    near: 0.1,
    far: 2000,
    startPosition: { x: 0, y: 80, z: 120 },
    lookAt: { x: 0, y: 0, z: 0 }
  },

  // Orbit controls
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
    segments: 12,      // More detail
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
    playerRadius: 1.5,
    groundOffset: 1.5,
    groundCheckDistance: 10
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
  }
}

export default Config
