/**
 * Main Billboard UI
 * Interactive overlay for About/Skills/Experience tabs
 */

import gsap from 'gsap'
import { Config } from '../core/Config.js'

export class MainBillboardUI {
  constructor(onClose) {
    this.onClose = onClose
    this.currentTab = Config.ui.mainBillboard.defaultTab
    this.isVisible = false

    this.createUI()
    this.attachEventListeners()
  }

  createUI() {
    // Create container
    this.container = document.getElementById('billboard-ui')
    if (!this.container) {
      console.error('Billboard UI container not found in HTML')
      return
    }

    // Initially hidden
    this.container.style.display = 'none'
    this.container.style.opacity = '0'

    // Create tab buttons
    const tabsContainer = this.container.querySelector('.tabs')
    Config.ui.mainBillboard.tabs.forEach(tabName => {
      const button = document.createElement('button')
      button.className = 'tab-button'
      button.textContent = tabName
      button.dataset.tab = tabName.toLowerCase()

      if (tabName === this.currentTab) {
        button.classList.add('active')
      }

      button.addEventListener('click', () => this.switchTab(tabName))
      tabsContainer.appendChild(button)
    })

    // Create content areas
    const contentContainer = this.container.querySelector('.content')
    Config.ui.mainBillboard.tabs.forEach(tabName => {
      const contentDiv = document.createElement('div')
      contentDiv.className = 'tab-content'
      contentDiv.dataset.tab = tabName.toLowerCase()

      if (tabName === this.currentTab) {
        contentDiv.classList.add('active')
      }

      // Load content from config (placeholder for now)
      const contentKey = tabName.toLowerCase()
      contentDiv.innerHTML = this.getContent(contentKey)

      contentContainer.appendChild(contentDiv)
    })

    // Close button
    const closeButton = this.container.querySelector('.close-button')
    closeButton.addEventListener('click', () => this.hide())
  }

  attachEventListeners() {
    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide()
      }
    })
  }

  /**
   * Get content for a tab (placeholder - can be loaded from config or external file)
   */
  getContent(tab) {
    const content = {
      about: `
        <h2>About Me</h2>
        <p>${Config.content.about}</p>
        <p>This is a placeholder. You can customize this content in Config.js or load it from an external source.</p>
      `,
      skills: `
        <h2>Skills</h2>
        <p>${Config.content.skills}</p>
        <ul>
          <li>Three.js & WebGL</li>
          <li>JavaScript/ES6+</li>
          <li>GSAP Animations</li>
          <li>3D Graphics & Modeling</li>
          <li>Responsive Design</li>
        </ul>
      `,
      experience: `
        <h2>Experience</h2>
        <p>${Config.content.experience}</p>
        <div class="experience-item">
          <h3>Position Title</h3>
          <p class="date">2023 - Present</p>
          <p>Description of responsibilities and achievements.</p>
        </div>
      `
    }

    return content[tab] || '<p>Content not found</p>'
  }

  /**
   * Switch to a different tab
   */
  switchTab(tabName) {
    this.currentTab = tabName
    const tabKey = tabName.toLowerCase()

    // Update buttons
    const buttons = this.container.querySelectorAll('.tab-button')
    buttons.forEach(button => {
      if (button.dataset.tab === tabKey) {
        button.classList.add('active')
      } else {
        button.classList.remove('active')
      }
    })

    // Update content with fade animation
    const contents = this.container.querySelectorAll('.tab-content')
    contents.forEach(content => {
      if (content.dataset.tab === tabKey) {
        gsap.to(content, {
          opacity: 1,
          display: 'block',
          duration: Config.animations.uiFade.duration,
          ease: Config.animations.uiFade.ease
        })
        content.classList.add('active')
      } else {
        gsap.to(content, {
          opacity: 0,
          display: 'none',
          duration: Config.animations.uiFade.duration,
          ease: Config.animations.uiFade.ease
        })
        content.classList.remove('active')
      }
    })
  }

  /**
   * Show the UI
   */
  show() {
    if (this.isVisible) return

    this.isVisible = true
    this.container.style.display = 'flex'

    gsap.to(this.container, {
      opacity: 1,
      duration: Config.animations.uiFade.duration,
      ease: Config.animations.uiFade.ease
    })
  }

  /**
   * Hide the UI
   */
  hide() {
    if (!this.isVisible) return

    gsap.to(this.container, {
      opacity: 0,
      duration: Config.animations.uiFade.duration,
      ease: Config.animations.uiFade.ease,
      onComplete: () => {
        this.container.style.display = 'none'
        this.isVisible = false
        if (this.onClose) {
          this.onClose()
        }
      }
    })
  }

  dispose() {
    // Remove event listeners if needed
    this.container.remove()
  }
}

export default MainBillboardUI
