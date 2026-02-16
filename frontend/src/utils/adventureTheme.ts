// GeoSnap Adventure-Cinematic Design System
// "RELICS OF EARTH, SEEN THROUGH THE COSMOS"
// Indiana Jones DNA + Interstellar DNA

export const adventureColors = {
  // Primary - Deep & Ancient
  obsidian: '#0a0a0c',           // The void
  deepSpace: '#0d1117',          // Cosmic darkness
  cosmicBlue: '#161b29',         // Deep space blue
  
  // Adventure Accents - Brass & Warmth
  brassGold: '#C9A227',          // Worn brass
  antiqueGold: '#B8860B',        // Ancient gold
  amberGlow: '#FF8C00',          // Warm discovery light
  copperRust: '#B87333',         // Aged copper
  
  // Earth Elements
  volcanicOrange: '#FF4500',     // Magma core
  fossilBone: '#E8DCC4',         // Ancient bone
  sedimentBrown: '#8B7355',      // Layered earth
  mineralTeal: '#2F8B8B',        // Crystal waters
  
  // Mystical Glow
  relicGlow: '#FFD700',          // Discovery moment
  cosmicPurple: '#4A0080',       // Deep time
  starLight: '#E6E6FA',          // Distant stars
  
  // Functional
  success: '#228B22',            // Forest green
  warning: '#DAA520',            // Golden rod
  danger: '#8B0000',             // Dark red
  
  // Text
  textPrimary: '#F5F5DC',        // Beige/parchment
  textSecondary: 'rgba(245, 245, 220, 0.7)',
  textTertiary: 'rgba(245, 245, 220, 0.5)',
  textMuted: 'rgba(245, 245, 220, 0.3)',
  
  // Glass & Overlays
  glassPanel: 'rgba(13, 17, 23, 0.9)',
  glassBorder: 'rgba(201, 162, 39, 0.3)',  // Brass tint
  leatherPanel: 'rgba(35, 25, 18, 0.95)',
};

export const adventureTypography = {
  // Carved, expedition-style typography
  hero: {
    fontSize: 38,
    fontWeight: '700' as const,
    letterSpacing: 3,
    textTransform: 'uppercase' as const,
  },
  title: {
    fontSize: 28,
    fontWeight: '600' as const,
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500' as const,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  journal: {
    fontSize: 15,
    fontWeight: '400' as const,
    fontStyle: 'italic' as const,
    lineHeight: 22,
  },
  label: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
  },
};

// Explorer's Path - Progression Titles
export const EXPLORER_TITLES: Record<number, { title: string; description: string; icon: string }> = {
  1: { title: "Field Scout", description: "Beginning your journey into the unknown", icon: "compass" },
  2: { title: "Rock Wanderer", description: "Learning to read the Earth's surface", icon: "walk" },
  3: { title: "Relic Seeker", description: "Discovering the stories stones tell", icon: "search" },
  4: { title: "Stratum Reader", description: "Understanding the layers of time", icon: "layers" },
  5: { title: "Rift Walker", description: "Traversing the boundaries of epochs", icon: "git-branch" },
  6: { title: "Crystal Sage", description: "Mastering the language of minerals", icon: "diamond" },
  7: { title: "Deep Time Navigator", description: "Journeying through eons with ease", icon: "time" },
  8: { title: "Tectonic Whisperer", description: "Hearing the Earth's ancient movements", icon: "pulse" },
  9: { title: "Planetary Archivist", description: "Cataloging Earth's deepest secrets", icon: "library" },
  10: { title: "Cosmic Geologist", description: "Understanding Earth in universal context", icon: "planet" },
};

// Expedition Challenges (Quests, not tasks)
export const EXPEDITION_QUESTS = [
  {
    id: "ancient_water",
    title: "Echoes of Ancient Seas",
    description: "Find evidence of water that flowed millions of years ago",
    xp: 100,
    icon: "water",
    hint: "Look for sedimentary rocks with ripple marks or marine fossils",
  },
  {
    id: "fire_survivor",
    title: "Born from Fire",
    description: "Identify a rock that survived volcanic fury",
    xp: 80,
    icon: "flame",
    hint: "Igneous rocks tell tales of molten origins",
  },
  {
    id: "time_traveler",
    title: "500 Million Year Journey",
    description: "Discover a mineral older than complex life itself",
    xp: 150,
    icon: "hourglass",
    hint: "Ancient rocks hide in shields and cratons",
  },
  {
    id: "crystal_hunter",
    title: "Geometry of the Deep",
    description: "Find a perfectly formed crystal specimen",
    xp: 75,
    icon: "prism",
    hint: "Crystals grow in cavities and veins",
  },
  {
    id: "metamorphic_tale",
    title: "Transformed by Pressure",
    description: "Identify a rock that was once something else entirely",
    xp: 90,
    icon: "sync",
    hint: "Heat and pressure write new stories in stone",
  },
];

// Story Mode Configurations
export const STORY_MODES = {
  legend: {
    id: "legend",
    name: "Legend Mode",
    description: "Mythic tales of geological wonder",
    tone: "poetic and mysterious",
    icon: "book",
    systemPrompt: `You are an ancient storyteller revealing Earth's secrets. Speak with wonder and mystery.
Use phrases like:
- "This stone was born when..."
- "In ages before memory..."
- "The Earth whispered this into being..."
Make the user feel they're holding something sacred.`,
  },
  scientific: {
    id: "scientific",
    name: "Scientific Mode",
    description: "Precise geological analysis",
    tone: "rigorous and factual",
    icon: "flask",
    systemPrompt: `You are a professional geologist providing precise scientific analysis.
Use technical terminology accurately.
Reference mineral databases, classification systems, and geological literature.
Be thorough but accessible.`,
  },
  fieldNotes: {
    id: "fieldNotes",
    name: "Field Notes Mode",
    description: "Quick expedition references",
    tone: "practical and concise",
    icon: "document-text",
    systemPrompt: `You are writing quick field notes for an expedition journal.
Be concise and practical.
Focus on identification features and field tests.
Write as if jotting notes during a hike.`,
  },
};

// Animation timing for cinematic feel
export const CINEMATIC_TIMING = {
  // Slow, weighty animations
  pageTransition: 600,
  menuUnfold: 400,
  buttonPress: 150,
  crystalGrow: 2000,
  sedimentLayer: 1500,
  
  // Discovery moment
  scanLock: 300,
  revealBuild: 800,
  lightTrace: 1200,
  
  // Easing curves
  mechanicalEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounceSettle: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  gravityFall: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
};

// Material textures (conceptual - for styling hints)
export const MATERIAL_HINTS = {
  leather: {
    backgroundColor: adventureColors.leatherPanel,
    borderColor: 'rgba(139, 69, 19, 0.5)',
    shadowColor: '#000',
  },
  brass: {
    backgroundColor: adventureColors.brassGold,
    borderColor: adventureColors.antiqueGold,
    shadowColor: adventureColors.brassGold,
  },
  stone: {
    backgroundColor: adventureColors.cosmicBlue,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
  },
  crystal: {
    backgroundColor: 'rgba(47, 139, 139, 0.2)',
    borderColor: adventureColors.mineralTeal,
    shadowColor: adventureColors.mineralTeal,
  },
};
