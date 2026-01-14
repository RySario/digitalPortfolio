/**
 * Cyberpunk Store Model
 * Loads the FBX model from the cyberpunk-store folder
 */

import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

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
   * Load the FBX model
   */
  async load() {
    return new Promise((resolve, reject) => {
      const loader = new FBXLoader()
      const textureLoader = new THREE.TextureLoader()

      console.log('Starting to load FBX from: /cyberpunk-store/source/poopy.fbx')

      loader.load(
        '/cyberpunk-store/source/poopy.fbx',
        (fbx) => {
          console.log('✅ FBX model loaded successfully!')
          console.log('Model bounding box:', fbx)

          // Load and apply textures
          this.loadTextures(fbx, textureLoader)

          // Calculate bounding box to see actual size
          const box = new THREE.Box3().setFromObject(fbx)
          const size = box.getSize(new THREE.Vector3())
          console.log('Model original size:', size)

          // Rotate 180 degrees on Y axis so open side faces front
          fbx.rotation.y = Math.PI

          // Scale and position
          fbx.scale.setScalar(4)
          fbx.position.set(0, 1.5, 0)  // Position on platform

          console.log('Model scale:', fbx.scale)
          console.log('Model position:', fbx.position)
          console.log('Model rotation:', fbx.rotation)

          // Enable shadows and ensure materials are visible
          let meshCount = 0
          fbx.traverse((child) => {
            if (child.isMesh) {
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
              const materialName = child.material?.name || 'unknown'
              const worldPos = new THREE.Vector3()
              child.getWorldPosition(worldPos)

              console.log(`Mesh ${meshCount}: ${child.name}`)
              console.log(`  Material: ${materialName}`)
              console.log(`  Position (local): ${child.position.x.toFixed(2)}, ${child.position.y.toFixed(2)}, ${child.position.z.toFixed(2)}`)
              console.log(`  Position (world): ${worldPos.x.toFixed(2)}, ${worldPos.y.toFixed(2)}, ${worldPos.z.toFixed(2)}`)

              // Highlight screen meshes
              if (materialName.toLowerCase().includes('pantalla')) {
                console.log(`  ⭐ THIS IS A SCREEN MESH! Use this position for billboard`)
              }
            }
          })
          console.log(`Total meshes found: ${meshCount}`)

          this.model = fbx
          this.group.add(fbx)

          console.log('✅ Model added to scene group')
          resolve()
        },
        (progress) => {
          if (progress.total > 0) {
            const percent = (progress.loaded / progress.total) * 100
            console.log(`📦 Loading model: ${percent.toFixed(2)}%`)
          }
        },
        (error) => {
          console.error('❌ Error loading FBX model:', error)
          console.error('Error details:', error.message)
          // Keep the test box if loading fails
          resolve() // Don't reject, just continue without model
        }
      )
    })
  }

  /**
   * Load and apply textures to the model (simplified - BaseColor only)
   */
  loadTextures(fbx, textureLoader) {
    const textureBasePath = '/cyberpunk-store/textures/'
    console.log('Loading textures from:', textureBasePath)

    // First pass: collect all unique material names
    const materialNames = new Set()
    fbx.traverse((child) => {
      if (child.isMesh && child.material) {
        materialNames.add(child.material.name || 'unnamed')
      }
    })
    console.log('Found material names:', Array.from(materialNames))

    // Apply materials with ONLY BaseColor textures (simplified to avoid shader errors)
    fbx.traverse((child) => {
      if (child.isMesh) {
        const originalMaterialName = child.material?.name || 'unknown'
        const materialNameLower = originalMaterialName.toLowerCase()

        // Create material with default properties
        const material = new THREE.MeshStandardMaterial({
          color: 0xffffff,  // White to show texture colors accurately
          metalness: 0.3,
          roughness: 0.7,
          side: THREE.DoubleSide
        })

        // Load ONLY the BaseColor texture for each material type
        if (materialNameLower.includes('metal')) {
          console.log('Loading Metal BaseColor texture...')
          material.map = textureLoader.load(
            textureBasePath + 'low_poly_Metal_BaseColor.png',
            (texture) => {
              console.log('✓ Metal texture loaded')
              material.needsUpdate = true
            },
            undefined,
            (err) => {
              console.error('✗ Metal texture failed:', err)
              material.color.setHex(0x444444)  // Fallback color
            }
          )
          material.metalness = 0.6
          material.roughness = 0.4
        } else if (materialNameLower.includes('pantalla')) {
          // Screens - use cyan emissive instead of texture
          console.log('Setting Pantallas as emissive cyan...')
          material.color.setHex(0x00d9ff)
          material.emissive.setHex(0x00d9ff)
          material.emissiveIntensity = 0.6
          material.metalness = 0.1
          material.roughness = 0.2
        } else if (materialNameLower.includes('stand')) {
          console.log('Loading Stand BaseColor texture...')
          material.map = textureLoader.load(
            textureBasePath + 'low_poly_Stand_BaseColor.png',
            (texture) => {
              console.log('✓ Stand texture loaded')
              material.needsUpdate = true
            },
            undefined,
            (err) => {
              console.error('✗ Stand texture failed:', err)
              material.color.setHex(0x6b4423)  // Fallback brown
            }
          )
          material.metalness = 0.1
          material.roughness = 0.8
        } else if (materialNameLower.includes('blinn4')) {
          console.log('Loading Blinn4 BaseColor texture...')
          material.map = textureLoader.load(
            textureBasePath + 'lowppoly_blinn4_BaseColor.png',
            (texture) => {
              console.log('✓ Blinn4 texture loaded')
              material.needsUpdate = true
            },
            undefined,
            (err) => {
              console.error('✗ Blinn4 texture failed:', err)
              material.color.setHex(0xffaa00)  // Fallback orange
            }
          )
          material.emissive.setHex(0xffaa00)
          material.emissiveIntensity = 0.2
          material.metalness = 0.2
          material.roughness = 0.6
        } else if (materialNameLower.includes('blinn5')) {
          console.log('Loading Blinn5 BaseColor texture...')
          material.map = textureLoader.load(
            textureBasePath + 'lowppoly_blinn5_BaseColor.png',
            (texture) => {
              console.log('✓ Blinn5 texture loaded')
              material.needsUpdate = true
            },
            undefined,
            (err) => {
              console.error('✗ Blinn5 texture failed:', err)
              material.color.setHex(0x777777)  // Fallback gray
            }
          )
          material.metalness = 0.3
          material.roughness = 0.6
        } else if (materialNameLower.includes('blinn9')) {
          console.log('Loading Blinn9 BaseColor texture...')
          material.map = textureLoader.load(
            textureBasePath + 'lowppoly_blinn9_BaseColor.png',
            (texture) => {
              console.log('✓ Blinn9 texture loaded')
              material.needsUpdate = true
            },
            undefined,
            (err) => {
              console.error('✗ Blinn9 texture failed:', err)
              material.color.setHex(0x555555)  // Fallback dark gray
            }
          )
          material.metalness = 0.3
          material.roughness = 0.7
        } else {
          // Default fallback for unknown materials
          console.log('Using default color for:', materialNameLower)
          material.color.setHex(0x888888)
        }

        child.material = material
      }
    })

    console.log('Texture loading initiated')
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
