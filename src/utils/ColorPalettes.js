/**
 * Color palettes for each themed island
 * Vibrant, saturated colors for low-poly aesthetic
 */

export const ColorPalettes = {
  // Basketball island - Orange and blue theme
  basketball: {
    primary: 0xFF6B35,    // Orange (basketball color)
    secondary: 0x004E89,  // Deep blue
    accent: 0xFFFFFF,     // White
    ground: 0xD4A574,     // Court wood color
    tree: 0xFF8C42        // Warm orange for trees
  },

  // Karting/F1 island - Racing theme
  karting: {
    primary: 0xE63946,    // Racing red
    secondary: 0x1D3557,  // Dark blue
    accent: 0xFFFFFF,     // White (checkered)
    ground: 0x2A2A2A,     // Asphalt gray
    tree: 0xC1121F        // Dark red for trees
  },

  // Bouldering island - Earth tones
  bouldering: {
    primary: 0x8B4513,    // Brown rock
    secondary: 0xD2691E,  // Orange-brown rock
    accent: 0x4A90E2,     // Blue climbing holds
    ground: 0x696969,     // Gray
    tree: 0xA0522D        // Sienna brown for trees
  },

  // Anime island - Vibrant Japanese theme
  anime: {
    primary: 0xFF69B4,    // Hot pink
    secondary: 0x9370DB,  // Medium purple
    accent: 0xFFD700,     // Gold
    ground: 0xF0E68C,     // Khaki
    tree: 0xFFB6C1,       // Light pink (cherry blossom)
    torii: 0xFF0000       // Red torii gate
  },

  // Sacramento State island - School colors
  sacstate: {
    primary: 0x00573F,    // Sac State green
    secondary: 0xC4B581,  // Sac State gold
    accent: 0xFFFFFF,     // White
    ground: 0x2E8B57,     // Sea green (campus)
    tree: 0x228B22        // Forest green
  },

  // Apple island - Tech minimal aesthetic
  apple: {
    primary: 0xA2AAAD,    // Silver
    secondary: 0x000000,  // Black
    accent: 0x0071E3,     // Apple blue
    ground: 0xF5F5F7,     // Light gray
    tree: 0x87CEEB        // Sky blue for modern trees
  },

  // Common colors
  common: {
    white: 0xFFFFFF,
    black: 0x000000,
    shadow: 0x222222,
    trunk: 0x8B4513      // Tree trunk brown
  }
}

export default ColorPalettes
