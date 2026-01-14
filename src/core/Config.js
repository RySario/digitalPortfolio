/**
 * Central configuration for the Cyberpunk Building Portfolio
 * All constants and settings in one place
 */

export const Config = {
  // Camera settings
  camera: {
    fov: 60,
    near: 0.1,
    far: 1000,
    // Initial position - zoomed in, lower, looking up at building
    startPosition: { x: -30, y: 8, z: 30 },
    lookAt: { x: 0, y: 12, z: 0 },

    // Focus position when viewing main billboard
    focusPosition: { x: 0, y: 15, z: 35 },
    focusLookAt: { x: 0, y: 15, z: 0 }
  },

  // Orbit camera controls
  orbitControls: {
    enableDamping: true,
    dampingFactor: 0.08,
    sensitivity: 0.003,
    minDistance: 25,
    maxDistance: 80,
    minPolarAngle: Math.PI / 6,    // Prevent too steep top-down
    maxPolarAngle: Math.PI * 0.45,  // Prevent going below platform
    smoothness: 0.1,
    zoomSpeed: 0.5
  },

  // Building structure
  building: {
    platform: {
      width: 100,  // Much larger platform
      depth: 100,  // Much larger platform
      height: 1.5,
      color: 0x1a1a1a,
      roughness: 0.2,  // Decreased from 0.8 for more reflectivity
      metalness: 0.8  // Increased from 0.3 for more reflectivity
    },

    // Ground floor
    groundFloor: {
      width: 16,
      depth: 12,
      height: 8,
      color: 0x2a2a2a,
      position: { x: 0, y: 5.5, z: 0 }
    },

    // Second floor
    secondFloor: {
      width: 14,
      depth: 10,
      height: 6,
      color: 0x252525,
      position: { x: 0, y: 12, z: -1 }
    },

    // Third floor
    thirdFloor: {
      width: 10,
      depth: 8,
      height: 5,
      color: 0x2a2a2a,
      position: { x: 0, y: 17.5, z: 1 }
    },

    // Roof
    roof: {
      width: 10,
      depth: 8,
      height: 0.5,
      color: 0x1a1a1a,
      position: { x: 0, y: 20.5, z: 1 }
    }
  },

  // Billboard/Screen configuration
  billboards: {
    // Main interactive billboard (front of building)
    main: {
      width: 12,
      height: 7,
      position: { x: 0, y: 12, z: 6.1 },
      rotation: { x: 0, y: 0, z: 0 },
      emissiveIntensity: 0.3,
      interactive: true
    },

    // Additional portfolio billboards
    portfolio: [
      // Left side
      {
        width: 4,
        height: 3,
        position: { x: -8.1, y: 8, z: 0 },
        rotation: { x: 0, y: Math.PI / 2, z: 0 },
        emissiveIntensity: 0.25
      },
      // Right side upper
      {
        width: 5,
        height: 4,
        position: { x: 8.1, y: 14, z: 0 },
        rotation: { x: 0, y: -Math.PI / 2, z: 0 },
        emissiveIntensity: 0.25
      },
      // Right side lower
      {
        width: 3,
        height: 2.5,
        position: { x: 8.1, y: 7, z: 2 },
        rotation: { x: 0, y: -Math.PI / 2, z: 0 },
        emissiveIntensity: 0.2
      },
      // Back upper
      {
        width: 6,
        height: 4,
        position: { x: 0, y: 16, z: -5.1 },
        rotation: { x: 0, y: Math.PI, z: 0 },
        emissiveIntensity: 0.25
      },
      // Roof billboard
      {
        width: 4,
        height: 2,
        position: { x: 0, y: 21, z: 1 },
        rotation: { x: -Math.PI / 4, y: 0, z: 0 },
        emissiveIntensity: 0.3
      },
      // Ground floor side
      {
        width: 3,
        height: 2,
        position: { x: -8.1, y: 4, z: 3 },
        rotation: { x: 0, y: Math.PI / 2, z: 0 },
        emissiveIntensity: 0.2
      },
      // Small corner sign
      {
        width: 2,
        height: 1.5,
        position: { x: 7, y: 5, z: 6 },
        rotation: { x: 0, y: -Math.PI / 4, z: 0 },
        emissiveIntensity: 0.3
      }
    ]
  },

  // Neon signs and decorative elements
  neon: {
    mainSign: {
      text: 'SARIO ESTATE',
      position: { x: 0, y: 22, z: 6.2 },
      fontSize: 1.2,
      color: 0x00d9ff,
      emissiveIntensity: 1.0
    },

    accentSigns: [
      {
        text: '04',
        position: { x: 6, y: 18, z: -5 },
        fontSize: 1.2,
        color: 0x9b59b6,
        emissiveIntensity: 0.9
      }
    ],

    // Flicker animation settings
    flicker: {
      enabled: true,
      minInterval: 2000,
      maxInterval: 8000,
      flickerDuration: 0.05
    },

    // Pulse animation settings
    pulse: {
      enabled: true,
      speed: 2,
      min: 0.7,
      max: 1.0
    }
  },

  // Scene elements (arcade, props)
  sceneElements: {
    arcade: {
      position: { x: -11, y: 2.4, z: -10 },  // Moved to back left corner, on platform
      rotation: { x: 0, y: Math.PI / 4, z: 0 },
      scale: 1,
      screenColor: 0xff00ff,
      emissiveIntensity: 0.5
    },

    streetLight: {
      position: { x: -15, y: 1.5, z: 12 },  // Moved to front left, on platform
      height: 8,
      color: 0xff00ff,  // Neon pink/magenta
      intensity: 5,  // Increased for neon effect
      emissiveIntensity: 1.0
    },

    props: [
      { type: 'crate', position: { x: -12, y: 2.25, z: 14 } }  // On platform surface
    ]
  },

  // Floor text
  floorText: {
    name: {
      text: 'RYAN SARIO',
      position: { x: 0, y: 1.6, z: 15 },
      rotation: { x: -Math.PI / 2, y: 0, z: 0 },
      fontSize: 2.5,
      color: 0xffffff,  // Neon white
      emissiveIntensity: 1.0
    },
    subtitles: [
      {
        text: 'Software Engineer',
        position: { x: 0, y: 1.6, z: 18 },
        rotation: { x: -Math.PI / 2, y: 0, z: 0 },
        fontSize: 1.0,  // Larger font
        color: 0xffffff,  // Neon white
        emissiveIntensity: 0.9
      },
      {
        text: 'Quality Engineer',
        position: { x: 0, y: 1.6, z: 20.5 },  // Stacked vertically
        rotation: { x: -Math.PI / 2, y: 0, z: 0 },
        fontSize: 1.0,  // Larger font
        color: 0xffffff,  // Neon white
        emissiveIntensity: 0.9
      },
      {
        text: 'Content Creator',
        position: { x: 0, y: 1.6, z: 23 },  // Stacked vertically
        rotation: { x: -Math.PI / 2, y: 0, z: 0 },
        fontSize: 1.0,  // Larger font
        color: 0xffffff,  // Neon white
        emissiveIntensity: 0.9
      }
    ]
  },

  // Street signs (clickable)
  streetSigns: [
    {
      text: 'ABOUT ME',
      position: { x: -10, y: 3.5, z: 12 },
      rotation: { x: 0, y: 0, z: 0 },
      fontSize: 0.5,
      color: 0xff00ff,
      emissiveIntensity: 0.8,
      interactive: true,
      action: 'openMainBillboard'
    },
    {
      text: 'PROJECTS',
      position: { x: -6, y: 3.5, z: 12 },
      rotation: { x: 0, y: 0, z: 0 },
      fontSize: 0.5,
      color: 0x00d9ff,
      emissiveIntensity: 0.8,
      interactive: true,
      action: 'openMainBillboard'
    }
  ],

  // Cyberpunk lighting
  lighting: {
    ambient: {
      color: 0x4455aa,  // Slight blue tint
      intensity: 0.5  // Increased from 0.15 for better visibility
    },

    // Main atmospheric lights
    neonLights: [
      {
        color: 0x9b59b6,  // Purple
        position: { x: -10, y: 15, z: 10 },
        intensity: 5,  // Increased from 4
        distance: 50,  // Increased from 40
        decay: 2
      },
      {
        color: 0x3498db,  // Blue
        position: { x: 10, y: 12, z: 8 },
        intensity: 4.5,  // Increased from 3.5
        distance: 45,  // Increased from 35
        decay: 2
      },
      {
        color: 0x00d9ff,  // Cyan
        position: { x: 0, y: 20, z: -10 },
        intensity: 4,  // Increased from 3
        distance: 40,  // Increased from 30
        decay: 2
      },
      {
        color: 0xff00ff,  // Pink accent
        position: { x: -8, y: 8, z: -5 },
        intensity: 3.5,  // Increased from 2.5
        distance: 35,  // Increased from 25
        decay: 2
      }
    ],

    // Subtle fill light to prevent pure black shadows
    fillLight: {
      color: 0x8e44ad,
      intensity: 0.6  // Increased from 0.3
    },

    // Spotlights for additional illumination
    spotlights: [
      {
        color: 0x9b59b6,  // Purple
        position: { x: -20, y: 30, z: 20 },
        target: { x: 0, y: 0, z: 0 },
        intensity: 3,
        angle: Math.PI / 4,
        penumbra: 0.3,
        distance: 80,
        decay: 1.5
      },
      {
        color: 0x3498db,  // Blue
        position: { x: 20, y: 30, z: 20 },
        target: { x: 0, y: 0, z: 0 },
        intensity: 3,
        angle: Math.PI / 4,
        penumbra: 0.3,
        distance: 80,
        decay: 1.5
      }
    ]
  },

  // Scene settings
  scene: {
    backgroundColor: 0x0a0a14,  // Very dark blue-purple
    fogEnabled: false
  },

  // UI settings for main billboard
  ui: {
    mainBillboard: {
      tabs: ['About', 'Skills', 'Experience'],
      defaultTab: 'About',
      animationDuration: 0.5,
      backgroundColor: 'rgba(10, 10, 20, 0.95)',
      borderColor: '#00d9ff',
      textColor: '#ffffff',
      accentColor: '#9b59b6'
    }
  },

  // Content for main billboard (can be moved to separate file later)
  content: {
    about: "Welcome to my digital portfolio...",
    skills: "Skills and technologies...",
    experience: "Professional experience..."
  },

  // Animation settings
  animations: {
    cameraTransition: {
      duration: 1.5,
      ease: 'power2.inOut'
    },
    uiFade: {
      duration: 0.5,
      ease: 'power1.inOut'
    }
  }
}

export default Config
