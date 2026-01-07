/**
 * Asset loading manager with progress tracking
 * Updates the loading bar in index.html
 */

import * as THREE from 'three'

export class AssetLoader {
  constructor() {
    this.loadingManager = new THREE.LoadingManager()
    this.textureLoader = new THREE.TextureLoader(this.loadingManager)

    this.loadingBar = document.getElementById('loading-bar')
    this.loadingScreen = document.getElementById('loading-screen')

    this.assets = {
      textures: {}
    }

    this.setupLoadingManager()
  }

  setupLoadingManager() {
    this.loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
      console.log(`Started loading: ${url}`)
    }

    this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const progress = (itemsLoaded / itemsTotal) * 100
      if (this.loadingBar) {
        this.loadingBar.style.width = `${progress}%`
      }
      console.log(`Loading progress: ${Math.round(progress)}%`)
    }

    this.loadingManager.onLoad = () => {
      console.log('All assets loaded!')
      this.hideLoadingScreen()
    }

    this.loadingManager.onError = (url) => {
      console.error(`Error loading: ${url}`)
    }
  }

  async loadAll() {
    // For now, we don't have any required assets to load
    // This will simulate a brief loading time
    return new Promise((resolve) => {
      // Set loading bar to 100%
      if (this.loadingBar) {
        this.loadingBar.style.width = '100%'
      }

      // Small delay to show loading screen
      setTimeout(() => {
        this.hideLoadingScreen()
        resolve(this.assets)
      }, 300)
    })
  }

  hideLoadingScreen() {
    if (this.loadingScreen) {
      setTimeout(() => {
        this.loadingScreen.classList.add('hidden')
      }, 300)
    }
  }

  /**
   * Load a single texture
   * @param {string} path - Path to texture
   * @param {string} name - Name to store texture under
   * @returns {Promise<THREE.Texture>}
   */
  async loadTexture(path, name) {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        path,
        (texture) => {
          this.assets.textures[name] = texture
          resolve(texture)
        },
        undefined,
        (error) => {
          console.error(`Error loading texture ${name}:`, error)
          reject(error)
        }
      )
    })
  }

  /**
   * Get a loaded texture by name
   * @param {string} name
   * @returns {THREE.Texture|null}
   */
  getTexture(name) {
    return this.assets.textures[name] || null
  }
}

export default AssetLoader
