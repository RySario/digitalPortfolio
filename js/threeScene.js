// ============================================
// THREE.JS SCENE MODULE
// Animated particle background for hero section
// ============================================

import CONFIG from './config.js';

class ThreeScene {
  constructor() {
    this.canvas = document.getElementById('three-canvas');
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particles = null;
    this.particleGeometry = null;
    this.particleMaterial = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.time = 0;
    this.lightningBolts = [];

    this.init();
    this.createParticles();
    this.addEventListeners();
    this.animate();
  }

  init() {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0a0a0a, 0.0008);

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 100;

    // Create renderer with enhanced settings
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
  }

  createParticles() {
    const particleCount = CONFIG.scene.particleCount || 1000;
    this.particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // Color palette from config
    const colorPalette = [
      new THREE.Color(CONFIG.scene.colorScheme.primary),
      new THREE.Color(CONFIG.scene.colorScheme.secondary),
      new THREE.Color(CONFIG.scene.colorScheme.accent)
    ];

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Positions - spread particles in a sphere
      const radius = Math.random() * 200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Colors - randomly pick from palette
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      // Sizes
      sizes[i] = Math.random() * 2 + 0.5;
    }

    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Create particle material with subtle glow effect
    this.particleMaterial = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      depthWrite: false
    });

    // Create particle system
    this.particles = new THREE.Points(this.particleGeometry, this.particleMaterial);
    this.scene.add(this.particles);

    // Add sophisticated lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    // Add golden accent lights
    const goldLight1 = new THREE.PointLight(CONFIG.scene.colorScheme.primary, 2, 200);
    goldLight1.position.set(50, 50, 50);
    this.scene.add(goldLight1);

    const goldLight2 = new THREE.PointLight(CONFIG.scene.colorScheme.secondary, 1.5, 200);
    goldLight2.position.set(-50, -50, 50);
    this.scene.add(goldLight2);

    // Add directional light for depth
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(0, 1, 1);
    this.scene.add(dirLight);

    // Add some floating geometric shapes
    this.addFloatingShapes();
  }

  addFloatingShapes() {
    // Create innovative wireframe geometric shapes spread across the scene - all white
    const shapes = [
      {
        geometry: new THREE.TorusKnotGeometry(18, 4, 120, 20, 3, 2),
        position: { x: -120, y: 80, z: -200 },
        rotation: { x: 0.004, y: 0.006, z: 0.002 }
      },
      {
        geometry: new THREE.IcosahedronGeometry(22, 1),
        position: { x: 150, y: -60, z: -180 },
        rotation: { x: 0.003, y: 0.007, z: 0.004 }
      },
      {
        geometry: new THREE.OctahedronGeometry(25, 0),
        position: { x: -80, y: -90, z: -140 },
        rotation: { x: 0.005, y: 0.003, z: 0.006 }
      },
      {
        geometry: new THREE.TetrahedronGeometry(20, 2),
        position: { x: 100, y: 120, z: -220 },
        rotation: { x: 0.006, y: 0.004, z: 0.003 }
      },
      {
        geometry: new THREE.DodecahedronGeometry(16, 0),
        position: { x: -140, y: -40, z: -160 },
        rotation: { x: 0.002, y: 0.008, z: 0.005 }
      },
      {
        geometry: new THREE.TorusGeometry(20, 6, 16, 100),
        position: { x: 60, y: -120, z: -250 },
        rotation: { x: 0.004, y: 0.005, z: 0.002 }
      },
      {
        geometry: new THREE.ConeGeometry(18, 35, 32),
        position: { x: -50, y: 100, z: -190 },
        rotation: { x: 0.007, y: 0.002, z: 0.004 }
      },
      {
        geometry: new THREE.CylinderGeometry(8, 8, 40, 32),
        position: { x: 130, y: 30, z: -170 },
        rotation: { x: 0.003, y: 0.006, z: 0.007 }
      }
    ];

    shapes.forEach((shapeData) => {
      // Create clean white wireframe shapes
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.15
      });

      const mesh = new THREE.Mesh(shapeData.geometry, material);
      mesh.position.set(shapeData.position.x, shapeData.position.y, shapeData.position.z);
      mesh.userData.rotationSpeed = shapeData.rotation;
      this.scene.add(mesh);
    });

    // Add abstract line structures for depth - all white
    for (let i = 0; i < 5; i++) {
      const points = [];
      const segments = 20;

      for (let j = 0; j <= segments; j++) {
        const t = j / segments;
        const angle = t * Math.PI * 4;
        const radius = 30 + i * 5;

        points.push(new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle * 2) * radius,
          Math.sin(angle) * radius
        ));
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.1
      });

      const line = new THREE.Line(geometry, material);
      line.position.set(
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 150,
        -150 - i * 40
      );
      line.userData.rotationSpeed = {
        x: Math.random() * 0.002,
        y: Math.random() * 0.004,
        z: Math.random() * 0.003
      };
      this.scene.add(line);
    }
  }

  addEventListeners() {
    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize(), false);

    // Handle mouse movement for parallax effect
    document.addEventListener('mousemove', (event) => {
      this.mouseX = (event.clientX - window.innerWidth / 2) / 100;
      this.mouseY = (event.clientY - window.innerHeight / 2) / 100;
    });

    // Handle scroll to fade out particles
    window.addEventListener('scroll', () => {
      const scrollPercent = window.scrollY / window.innerHeight;
      if (scrollPercent < 1) {
        this.particleMaterial.opacity = 0.6 - (scrollPercent * 0.4);
      }
    });
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.time += 0.01;

    // Enhanced camera movement - slow cinematic drift + mouse parallax
    const driftX = Math.sin(this.time * 0.1) * 2;
    const driftY = Math.cos(this.time * 0.15) * 2;

    this.targetX = this.mouseX * 0.5 + driftX;
    this.targetY = this.mouseY * 0.5 + driftY;

    this.camera.position.x += (this.targetX - this.camera.position.x) * 0.02;
    this.camera.position.y += (-this.targetY - this.camera.position.y) * 0.02;

    // Add subtle camera rotation
    this.camera.rotation.z = Math.sin(this.time * 0.05) * 0.01;
    this.camera.lookAt(this.scene.position);

    // Dynamic particle rotation - varies with time
    const animSpeed = CONFIG.scene.animationSpeed || 0.0005;
    const speedVariation = Math.sin(this.time * 0.2) * 0.0002;
    this.particles.rotation.x += animSpeed + speedVariation;
    this.particles.rotation.y += (animSpeed * 1.5) + speedVariation;
    this.particles.rotation.z += animSpeed * 0.5;

    // Animate geometric shapes with organic movement
    this.scene.children.forEach((child, index) => {
      if (child.userData.rotationSpeed) {
        child.rotation.x += child.userData.rotationSpeed.x;
        child.rotation.y += child.userData.rotationSpeed.y;
        child.rotation.z += child.userData.rotationSpeed.z;

        // Add floating motion to shapes
        child.position.y += Math.sin(this.time * 0.3 + index) * 0.05;
        child.position.x += Math.cos(this.time * 0.2 + index) * 0.03;
      }
    });

    // Enhanced particle wave motion with multiple frequencies
    const positions = this.particleGeometry.attributes.position.array;
    const colors = this.particleGeometry.attributes.color.array;

    for (let i = 0; i < positions.length; i += 3) {
      const i3 = i;
      const x = positions[i3];
      const y = positions[i3 + 1];
      const z = positions[i3 + 2];

      // Complex wave motion
      const wave1 = Math.sin(this.time + x * 0.01) * 0.2;
      const wave2 = Math.cos(this.time * 0.7 + z * 0.01) * 0.15;
      const wave3 = Math.sin(this.time * 1.3 + y * 0.01) * 0.1;

      positions[i3 + 1] = y + wave1 + wave2 + wave3;

      // Subtle color pulsing
      const pulse = Math.sin(this.time + i * 0.001) * 0.05;
      colors[i3] = Math.min(1, colors[i3] + pulse);
      colors[i3 + 1] = Math.min(1, colors[i3 + 1] + pulse);
      colors[i3 + 2] = Math.min(1, colors[i3 + 2] + pulse);
    }

    this.particleGeometry.attributes.position.needsUpdate = true;
    this.particleGeometry.attributes.color.needsUpdate = true;

    // Render scene
    this.renderer.render(this.scene, this.camera);
  }

  // Public method to cleanup
  destroy() {
    this.particleGeometry.dispose();
    this.particleMaterial.dispose();
    this.renderer.dispose();
  }
}

// Initialize and export
let threeSceneInstance = null;

export function initThreeScene() {
  if (!threeSceneInstance) {
    threeSceneInstance = new ThreeScene();
  }
  return threeSceneInstance;
}

export default ThreeScene;
