/**
 * Cyberpunk Store Model
 * Loads the FBX model from the cyberpunk-store folder
 */

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export class CyberpunkStoreModel {
  constructor() {
    this.group = new THREE.Group()
    this.model = null
    this.steamSystems = []  // Keep steam functionality

    // Create platform first
    this.createPlatform()
  }

  /**
   * Create the platform that the store sits on
   */
  createPlatform() {
    const platformWidth = 100
    const platformDepth = 100
    const platformHeight = 1.5

    const geometry = new THREE.BoxGeometry(platformWidth, platformHeight, platformDepth)

    // Create a grid texture for the platform
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')

    // Base color
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, 512, 512)

    // Grid lines
    ctx.strokeStyle = '#2a2a2a'
    ctx.lineWidth = 2
    const gridSize = 32
    for (let i = 0; i <= 512; i += gridSize) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, 512)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(512, i)
      ctx.stroke()
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(platformWidth / 4, platformDepth / 4)

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.2,
      metalness: 0.8,
      color: 0xffffff
    })

    const platform = new THREE.Mesh(geometry, material)
    platform.position.y = platformHeight / 2
    platform.receiveShadow = true
    platform.castShadow = true

    this.group.add(platform)
  }

  /**
   * Load the GLB model
   */
  async load() {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader()
      const textureLoader = new THREE.TextureLoader()

      console.log('Starting to load GLB from: /cyberpunk_store.glb')

      loader.load(
        '/cyberpunk_store.glb',
        (gltf) => {
          const fbx = gltf.scene  // Extract scene from GLTF
          console.log('✅ GLB model loaded successfully!')
          console.log('Model bounding box:', fbx)

          // Calculate bounding box to see actual size
          const box = new THREE.Box3().setFromObject(fbx)
          const size = box.getSize(new THREE.Vector3())
          console.log('Model original size:', size)

          // Rotate 180 degrees on Y axis so open side faces front
          fbx.rotation.y = Math.PI

          // Scale and position
          fbx.scale.setScalar(450)
          fbx.position.set(0, 1.5, 0)  // Position on platform

          console.log('Model scale:', fbx.scale)
          console.log('Model position:', fbx.position)
          console.log('Model rotation:', fbx.rotation)

          // Enable shadows and ensure materials are visible
          // Also remove unwanted objects (street pole, cube, arcade machine, etc.)
          let meshCount = 0
          const objectsToRemove = []

          // First pass - log ALL mesh names to identify what to remove
          console.log('=== ALL MESHES IN MODEL ===')
          fbx.traverse((child) => {
            if (child.isMesh) {
              console.log(`Found mesh: "${child.name}"`)
            }
          })

          // Second pass - remove unwanted objects and setup materials
          fbx.traverse((child) => {
            if (child.isMesh) {
              const meshName = child.name.toLowerCase()
              const materialName = child.material?.name?.toLowerCase() || ''

              // WHITELIST APPROACH: Only keep things with these material names
              // Everything else gets removed
              const allowedMaterials = [
                'metal',        // Building metal parts
                'pantalla',     // Screens
                'stand',        // Wooden stand
                'blinn4',       // Building parts
                'blinn5',       // Building parts
                'blinn9',       // Building parts
                'cositas'       // Small details
              ]

              // Check if material name contains any allowed pattern
              let isAllowed = false
              for (const allowedMat of allowedMaterials) {
                if (materialName.includes(allowedMat)) {
                  isAllowed = true
                  break
                }
              }

              // If not in whitelist, REMOVE IT
              if (!isAllowed) {
                console.log(`🗑️ REMOVING (not in whitelist): "${child.name}" [Material: "${child.material?.name}"]`)
                objectsToRemove.push(child)
                return
              }

              // This object is allowed - keep it
              console.log(`✓ KEEPING: "${child.name}" [Material: "${child.material?.name}"]`)

              child.castShadow = true
              child.receiveShadow = true

              // Make sure materials are visible
              if (child.material) {
                if (Array.isArray(child.material)) {
                  child.material.forEach(mat => {
                    mat.side = THREE.DoubleSide
                  })
                } else {
                  child.material.side = THREE.DoubleSide
                }
              }

              meshCount++
            }
          })

          // Remove unwanted objects
          objectsToRemove.forEach(obj => {
            if (obj.parent) {
              obj.parent.remove(obj)
              console.log(`✓ Removed: ${obj.name}`)
            }
          })

          console.log(`Total meshes kept: ${meshCount}`)
          console.log(`Removed ${objectsToRemove.length} unwanted objects`)

          this.model = fbx
          this.group.add(fbx)

          console.log('✅ Model added to scene group')

          // Load textures and wait for them before resolving
          this.loadTextures(fbx, textureLoader).then(() => {
            console.log('✅ All textures loaded')
            resolve()
          }).catch((error) => {
            console.error('⚠️ Some textures failed to load:', error)
            resolve() // Still resolve even if textures fail
          })
        },
        (progress) => {
          if (progress.total > 0) {
            const percent = (progress.loaded / progress.total) * 100
            console.log(`📦 Loading model: ${percent.toFixed(2)}%`)
          }
        },
        (error) => {
          console.error('❌ Error loading GLB model:', error)
          console.error('Error details:', error.message)
          // Keep the test box if loading fails
          resolve() // Don't reject, just continue without model
        }
      )
    })
  }

  /**
   * Process materials from GLB (uses embedded textures)
   * GLB files have materials and textures already embedded
   */
  loadTextures(fbx, textureLoader) {
    console.log('Processing GLB embedded materials...')

    // Collect material names for debugging
    const materialNames = new Set()
    let meshCount = 0

    fbx.traverse((child) => {
      if (child.isMesh) {
        meshCount++

        // GLB materials are already loaded, just enhance them
        if (child.material) {
          const materialName = child.material.name || 'unnamed'
          materialNames.add(materialName)

          // Ensure material is double-sided
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              mat.side = THREE.DoubleSide
            })
          } else {
            child.material.side = THREE.DoubleSide

            // Enhance specific materials
            const materialNameLower = materialName.toLowerCase()

            // Make screens (pantallas) glow cyan
            if (materialNameLower.includes('pantalla')) {
              child.material.emissive = new THREE.Color(0x00d9ff)
              child.material.emissiveIntensity = 0.6
              console.log('✓ Enhanced screen material:', materialName)
            }
          }
        }
      }
    })

    console.log(`✅ Processed ${meshCount} meshes with materials:`, Array.from(materialNames))

    // Return resolved promise immediately since GLB has everything embedded
    return Promise.resolve()
  }

  /**
   * Update method (for compatibility)
   */
  updateSteam(deltaTime) {
    // Steam can be added later if needed
  }

  getGroup() {
    return this.group
  }

  getModel() {
    return this.model
  }
}

export default CyberpunkStoreModel
