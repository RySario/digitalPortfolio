// ============================================
// MAIN APPLICATION MODULE
// Coordinates all modules and handles app logic
// ============================================

import CONFIG from './config.js';
import { initThreeScene } from './threeScene.js';
import { initGitHub } from './github.js';

class Portfolio {
  constructor() {
    this.threeScene = null;
    this.github = null;
    this.isInitialized = false;

    this.init();
  }

  async init() {
    console.log('🚀 Initializing Digital Portfolio...');

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  async setup() {
    try {
      // Initialize all modules
      this.initializeModules();

      // Populate content from config
      this.populateContent();

      // Setup event listeners
      this.setupEventListeners();

      // Setup scroll animations
      this.setupScrollAnimations();

      // Fetch GitHub projects
      if (this.github) {
        await this.github.fetchRepositories();
      }

      this.isInitialized = true;
      console.log('✅ Portfolio initialized successfully!');

    } catch (error) {
      console.error('❌ Error initializing portfolio:', error);
    }
  }

  initializeModules() {
    // Initialize Three.js scene
    try {
      this.threeScene = initThreeScene();
      console.log('✓ Three.js scene loaded');
    } catch (error) {
      console.error('Error initializing Three.js:', error);
    }

    // Initialize GitHub integration
    try {
      this.github = initGitHub();
      console.log('✓ GitHub module loaded');
    } catch (error) {
      console.error('Error initializing GitHub:', error);
    }
  }

  populateContent() {
    // Update hero section
    const heroTitle = document.querySelector('.hero-title .glitch');
    const heroTagline = document.querySelector('.hero-tagline');

    if (heroTitle) {
      heroTitle.textContent = CONFIG.name;
      heroTitle.setAttribute('data-text', CONFIG.name);
    }

    if (heroTagline) {
      heroTagline.textContent = CONFIG.tagline;
    }

    // Populate About section
    this.populateAboutSection();

    // Populate Hobbies section
    this.populateHobbiesSection();

    // Populate Contact section
    this.populateContactSection();

    // Populate Social Links
    this.populateSocialLinks();
  }

  populateAboutSection() {
    // Media gallery
    const mediaGallery = document.querySelector('.media-gallery');
    if (mediaGallery && CONFIG.about.mediaFiles) {
      mediaGallery.innerHTML = '';

      CONFIG.about.mediaFiles.forEach((media, index) => {
        const mediaItem = document.createElement('div');
        mediaItem.className = 'media-item';
        mediaItem.style.animationDelay = `${index * 0.1}s`;

        if (media.type === 'image') {
          const img = document.createElement('img');
          img.src = media.src;
          img.alt = media.alt;
          img.loading = 'lazy';

          // Handle image load error
          img.onerror = () => {
            mediaItem.innerHTML = `
              <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary); font-size: 0.85rem; text-align: center; padding: 1rem;">
                <div>
                  <i class="fas fa-image" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
                  Add image to:<br>${media.src}
                </div>
              </div>
            `;
          };

          mediaItem.appendChild(img);
        } else if (media.type === 'video') {
          const video = document.createElement('video');
          video.src = media.src;
          video.controls = false;
          video.loop = true;
          video.muted = true;
          video.loading = 'lazy';

          // Play on hover
          mediaItem.addEventListener('mouseenter', () => video.play());
          mediaItem.addEventListener('mouseleave', () => video.pause());

          mediaItem.appendChild(video);
        }

        mediaGallery.appendChild(mediaItem);
      });
    }

    // Description
    const description = document.querySelector('.about-description');
    if (description && CONFIG.about.description) {
      description.innerHTML = CONFIG.about.description;
    }
  }

  populateHobbiesSection() {
    const hobbiesGrid = document.querySelector('.hobbies-grid');

    if (hobbiesGrid && CONFIG.hobbies) {
      hobbiesGrid.innerHTML = '';

      CONFIG.hobbies.forEach((hobby, index) => {
        const card = document.createElement('div');
        card.className = 'hobby-card';
        card.style.animationDelay = `${index * 0.1}s`;

        card.innerHTML = `
          <div class="hobby-icon">${hobby.icon}</div>
          <h3 class="hobby-name">${hobby.name}</h3>
          <p class="hobby-description">${hobby.description}</p>
        `;

        hobbiesGrid.appendChild(card);
      });
    }
  }

  populateSocialLinks() {
    const socialLinksContainer = document.querySelector('.social-links');

    if (socialLinksContainer && CONFIG.socials) {
      socialLinksContainer.innerHTML = '';

      const socialIcons = {
        github: 'fab fa-github',
        linkedin: 'fab fa-linkedin',
        tiktok: 'fab fa-tiktok',
        instagram: 'fab fa-instagram',
        twitter: 'fab fa-twitter',
        youtube: 'fab fa-youtube'
      };

      Object.entries(CONFIG.socials).forEach(([platform, url]) => {
        const link = document.createElement('a');
        link.href = url;
        link.className = 'social-link';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.title = platform.charAt(0).toUpperCase() + platform.slice(1);

        const icon = document.createElement('i');
        icon.className = socialIcons[platform] || 'fas fa-link';
        link.appendChild(icon);

        socialLinksContainer.appendChild(link);
      });
    }
  }

  populateContactSection() {
    // Email button
    const emailBtn = document.getElementById('email-btn');
    if (emailBtn) {
      emailBtn.href = `mailto:${CONFIG.email}`;
    }

    // Resume button
    const resumeBtn = document.getElementById('resume-btn');
    if (resumeBtn) {
      resumeBtn.href = CONFIG.resumeFile;
    }

    // GitHub button
    const githubBtn = document.getElementById('github-btn');
    if (githubBtn) {
      githubBtn.href = CONFIG.socials.github;
    }
  }

  setupEventListeners() {
    // Mobile navigation toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle && navLinks) {
      navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
      });

      // Close menu when clicking a link
      navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navLinks.classList.remove('active');
        });
      });
    }

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;

      if (currentScroll > 100) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      lastScroll = currentScroll;
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));

        if (target) {
          const offset = 80; // Account for fixed navbar
          const targetPosition = target.offsetTop - offset;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  setupScrollAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
      observer.observe(section);
    });

    // Observe all animated elements
    const animateOnScroll = () => {
      document.querySelectorAll('.project-card, .hobby-card, .media-item, .about-description, .contact-card, .section-title').forEach(el => {
        observer.observe(el);
      });
    };

    // Initial observation
    animateOnScroll();

    // Re-observe after content loads (for GitHub projects)
    setTimeout(animateOnScroll, 2000);
    setTimeout(animateOnScroll, 3000); // Extra check for slower loads
  }

  // Public methods for external access
  getThreeScene() {
    return this.threeScene;
  }

  getGitHub() {
    return this.github;
  }
}

// Initialize the application
const app = new Portfolio();

// Export for debugging purposes
window.portfolio = app;

// Console welcome message
console.log('%c🎨 Digital Portfolio', 'color: #00ffff; font-size: 24px; font-weight: bold;');
console.log('%cBuilt with Three.js, JavaScript & CSS', 'color: #ff00ff; font-size: 14px;');
console.log('%cEdit js/config.js to customize your portfolio!', 'color: #8892b0; font-size: 12px;');

export default Portfolio;
