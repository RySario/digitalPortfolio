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
      <p>Hi there! My name is Ryan Sario. I'm a passionate software developer with a love for creating. I specialize in Quality Engineering, Full-Stack Development,
      and Agentic AI workflows.</p>
      <p>When I'm not coding, you'll find me spending time with family,
      working on creative projects, or pushing my limits in all aspects of my life.</p>

      <h3>Skills & Technologies</h3>
      <ul>
        <li>Python</li>
        <li>Java</li>
        <li>SQL</li>
        <li>Snowflake</li>
        <li>Git / GitHub</li>
        <li>Swift</li>
      </ul>
    `,
    // Add your media files to the /media folder
    // Add 'description' field to enable click-to-view details
    mediaFiles: [
      {
        type: "image",
        src: "media/LydiaRyanGrad.jpg",
        alt: "Graduation Day",
        description: "Celebrating graduation with my amazing fiancee, Lydia. A milestone moment marking the end of one chapter and the beginning of another for us."
      },
      {
        type: "image",
        src: "media/jetski.jpg",
        alt: "Travel Lover",
        description: "When I get a break from my schedule, I'll often travel to other countries and explore other cultures."
      },
      {
        type: "video",
        src: "media/bouldering.mp4",
        alt: "Fitness Focused",
        description: "Fitness has carried me through life's ups and downs. I often enjoy bouldering, as it teaches problem-solving, perseverance, and physical strength."
      },
      {
        type: "video",
        src: "media/racing.mp4",
        alt: "Racing",
        description: "The thrill of speed and precision on the track. Racing combines quick reflexes with strategic thinking. I put my skills into practice at K1 Speed Sacramento Adult Challenge GP and iRacing."
      }
    ]
  },

  // Work Experience
  experience: [
    {
      company: "Apple",
      role: "RDO - Jr. Python Developer",
      duration: "October 2025 - Present",
      location: "Elk Grove, CA",
      description: [
        "Develop and maintain lightweight Python apps (Plotly, Streamlit, Pandas) that automate manual workflows and improve operational efficiency by eliminating hours of repetitive tasks",
        "Author comprehensive technical documentation catering to diverse audience expertise levels, ensuring knowledge transfer and long-term code sustainability",
        "Collaborate with cross-functional stakeholders to identify pain points, gather requirements, and translate business needs into technical solutions",
        "Created pipeline to connect to an SFTP server, extract geospatial datasets, and process them into Snowflake tables to be used for strategic retail location planning. This converted a three hour manual process to a fully-automated pipeline. "
      ],
      technologies: ["Python", "Go", "Jenkins","Snowflake", "SQL"]
    },

    {
      company: "Apple",
      role: "Location Frameworks Test Engineer",
      duration: "June 2024 - November 2024",
      location: "Cupertino, CA",
      description: [
        "Obtained and tested unreleased iOS, macOS, tvOS, watchOS, & visionOS roots. Utilizing internal software and documentation, produced and performed manual and automated tests, resulting in on time continuous integration.",
        "Utilized internal bug tracking software to report issues which were screened and resolved by appropriate development teams, minimizing bugs in our upcoming software before being released to the public."
      ],
      technologies: ["Swift","Python","QA/QE","XCode", "Technical Documentation"]
    },

    {
      company: "Apple",
      role: "L2 AppleCare Support Advisor",
      duration: "May 2021 - October 2025",
      location: "Elk Grove, CA",
      description: [
        "Recipient of 2025 AppleCare Excellence Award due to exemplary performance in role.",
        "Responsible for supportive communication, using creative thinking and process follow through to assist customers on technical issues supporting iOS and macOS software and our hardware, resulting in consistent resolution of cases with high customer satisfaction.",
        " As a lead in the Gonzalez Care Team as my category two role, I ideated and produced team building activities by thinking creatively and use online tools that resulted in higher morale."
      ],
      technologies: ["Case Logging","Technical Support","Customer Service","Collaboration", "Communication"]
    },
    // Add more positions as needed - copy the structure above
  ],

  // Socials Content
  socialsContent: [
    {
      platform: "github",
      title: "GitHub",
      handle: "@RySario",
      url: "https://github.com/RySario",
      icon: "fab fa-github",
      description: "Check out my code repositories and open source contributions",
      stats: "Public repos & projects"
    },
    {
      platform: "linkedin",
      title: "LinkedIn",
      handle: "Ryan Sario",
      url: "https://www.linkedin.com/in/ryan-sario/",
      icon: "fab fa-linkedin",
      description: "Connect with me professionally",
      stats: "Professional network"
    },
    {
      platform: "tiktok",
      title: "TikTok",
      handle: "@rysario",
      url: "https://tiktok.com/@rysario",
      icon: "fab fa-tiktok",
      description: "Follow my creative content and daily life",
      stats: "Short-form videos"
    },
    {
      platform: "instagram",
      title: "Instagram",
      handle: "@ry.sario",
      url: "https://www.instagram.com/ry.sario/",
      icon: "fab fa-instagram",
      description: "Visual stories and moments from my journey",
      stats: "Photos & stories"
    }
  ],

  // Music Recommendations
  // HOW TO ADD YOUR OWN MP3 FILES:
  // 1. Download/convert your songs to MP3 format
  // 2. Place MP3 files in the /music folder (e.g., music/song1.mp3)
  // 3. Set audioFile: "music/song1.mp3" below
  //
  // LEGAL NOTE: Hosting copyrighted music without permission is technically
  // copyright infringement, even for personal use. Consider using:
  // - Your own music/compositions
  // - Royalty-free music (incompetech.com, freemusicarchive.org)
  // - 30-second clips instead of full songs
  // For a personal portfolio, risk is very low but not zero.
  //
  // ALTERNATIVES:
  // - Use previewUrl with Spotify preview URLs (30-sec clips)
  // - Leave audioFile empty to open Spotify when play is clicked
  musicRecommendations: [
    {
      title: "Love Blur",
      artist: "slayr",
      album: "Half Blood",
      spotifyUrl: "https://open.spotify.com/track/2yACYwM6qjqt1n5iez7TeK?si=5f8a31db5b7e448b",
      imageUrl: "https://i.scdn.co/image/ab67616d0000b27355a9a5494579add8dd303e2e",
      audioFile: "music/loveBlur.mp3",  // Place your MP3 file here
      genre: "Hyperpop Rap"
    },
    {
      title: "She Don't (feat. Ty Dolla $ign)",
      artist: "Ellai Mai, Ty Dolla $ign",
      album: "Time",
      spotifyUrl: "https://open.spotify.com/track/01JPQ87UHeGysPVwTqMJHK?si=9c4145fdecc74136",
      imageUrl: "https://i.scdn.co/image/ab67616d0000b27340aba43042f328ad560b4be4",
      audioFile: "music/sheDont.mp3",
      genre: "R&B"
    },
    {
      title: "I'm Low On Gas And You Need A Jacket",
      artist: "Pierce The Veil",
      album: "Collide With The Sky",
      spotifyUrl: "https://open.spotify.com/track/40WWeoX26jtsfdmFx5iRty?si=b7a4226f49a34abe",
      imageUrl: "https://i.scdn.co/image/ab67616d0000b273077cac00c2d9075e6f742570",
      audioFile: "music/lowOnGas.mp3",
      genre: "Rock"
    },
    {
      title: "Ging Gang Gong De Do De Laga Raga",
      artist: "Rob Zombie",
      album: "Venomous Rat Regeneration Vendor",
      spotifyUrl: "https://open.spotify.com/track/6a3zbseZr4MBt81paa8Cc4?si=f792bd0634514efe",
      imageUrl: "https://i.scdn.co/image/ab67616d0000b273b06c1c7178b6a6602dc95c03",
      audioFile: "music/gingGangGong.mp3",
      genre: "Rock"
    }
  ],

  // Music Configuration
  music: {
    enabled: true,
    file: "music/background.mp3", // Add your music file to /music folder
    defaultVolume: 0.3
  },

  // Files
  resumeFile: "media/Ryan_Sario.pdf", // Add your resume file to the root folder

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
