// ============================================
// PORTFOLIO CONFIGURATION FILE
// Edit this file to customize your portfolio
// ============================================

const CONFIG = {
  // Personal Information
  name: "Ryan Sario",
  tagline: "Software Developer & Creative Technologist",
  email: "sarioryan0@gmail.com",

  // GitHub Configuration
  githubUsername: "RySario",

  // Social Media Links
  socials: {
    github: "https://github.com/RySario",
    linkedin: "https://www.linkedin.com/in/ryan-sario/",
    tiktok: "https://tiktok.com/@rysario",
    instagram: "https://www.instagram.com/ry.sario/"
  },

  // About Me Section
  about: {
    description: `
      <p>Hello! I'm a passionate software developer with a love for creating
      immersive digital experiences. I specialize in web development, Three.js,
      and modern frontend technologies.</p>

      <p>When I'm not coding, you'll find me exploring new technologies,
      working on creative projects, or pushing my limits in the gym.</p>

      <h3>Skills & Technologies</h3>
      <ul>
        <li>JavaScript / TypeScript</li>
        <li>React, Vue, Angular</li>
        <li>Three.js / WebGL</li>
        <li>Node.js / Express</li>
        <li>HTML5 / CSS3</li>
        <li>Git / GitHub</li>
      </ul>
    `,
    // Add your media files to the /media folder
    mediaFiles: [
      { type: "image", src: "media/placeholder1.jpg", alt: "Project work" },
      { type: "image", src: "media/placeholder2.jpg", alt: "Team photo" },
      { type: "image", src: "media/placeholder3.jpg", alt: "Conference" },
      { type: "image", src: "media/placeholder4.jpg", alt: "Workspace" }
    ]
  },

  // Hobbies Section
  hobbies: [
    { icon: "💻", name: "Coding", description: "Building cool stuff with code" },
    { icon: "🏋️", name: "Fitness", description: "Staying healthy and strong" },
    { icon: "🏎️", name: "Motorsports", description: "Speed and precision" },
    { icon: "🎮", name: "Gaming", description: "Strategy and teamwork" },
    { icon: "📹", name: "Content Creation", description: "Sharing knowledge" }
  ],

  // Music Configuration
  music: {
    enabled: true,
    file: "music/background.mp3", // Add your music file to /music folder
    defaultVolume: 0.3
  },

  // Files
  resumeFile: "resume.pdf", // Add your resume file to the root folder

  // Three.js Scene Configuration
  scene: {
    particleCount: 2000,
    animationSpeed: 0.0005,
    colorScheme: {
      primary: 0xd4af37,    // Gold
      secondary: 0xf7e7ce,  // Champagne
      accent: 0xb8a898      // Taupe
    }
  }
};

// Export for use in other modules
export default CONFIG;
