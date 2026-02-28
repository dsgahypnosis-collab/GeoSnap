// GeoSnap Adventure-Cinematic Design System V2
// "RELICS OF EARTH, SEEN THROUGH THE COSMOS"
// More vibrant, fun, and adventurous!

export const adventureColors = {
  // Primary - Deep & Ancient (kept dark for contrast)
  obsidian: '#0a0a0c',           // The void
  deepSpace: '#0d1117',          // Cosmic darkness
  cosmicBlue: '#161b29',         // Deep space blue
  
  // ADVENTURE ACCENTS - More Vibrant!
  brassGold: '#FFD700',          // Bright gold
  antiqueGold: '#DAA520',        // Rich gold
  amberGlow: '#FF9500',          // Warm adventure orange
  copperRust: '#CD7F32',         // Bright copper
  
  // EARTH ELEMENTS - More Saturated
  volcanicOrange: '#FF5722',     // Bright magma
  volcanicRed: '#E53935',        // Hot lava
  fossilBone: '#FFF8E1',         // Warm cream
  sedimentBrown: '#A1887F',      // Warm earth
  mineralTeal: '#00BCD4',        // Bright teal crystal
  emeraldGreen: '#00C853',       // Vibrant green
  sapphireBlue: '#2979FF',       // Electric blue
  amethystPurple: '#AA00FF',     // Bright purple crystal
  rubyRed: '#FF1744',            // Ruby glow
  
  // MYSTICAL GLOW - More Magical
  relicGlow: '#FFD700',          // Discovery moment
  cosmicPurple: '#7C4DFF',       // Deep time purple
  starLight: '#E8EAF6',          // Distant stars
  auroraGreen: '#00E676',        // Northern lights
  auroraBlue: '#00B0FF',         // Aurora blue
  
  // FUN ACCENT COLORS
  adventureOrange: '#FF6D00',    // Bold orange
  questYellow: '#FFEA00',        // Quest marker yellow
  treasureGold: '#FFC400',       // Treasure chest gold
  mysteryPink: '#FF4081',        // Mystery/rare item
  legendaryPurple: '#E040FB',    // Legendary finds
  
  // Functional - More Vibrant
  success: '#00E676',            // Bright green
  warning: '#FFAB00',            // Amber warning
  danger: '#FF1744',             // Bright red
  info: '#00B0FF',               // Info blue
  xpGold: '#FFD740',             // XP indicator
  
  // Text
  textPrimary: '#FFFFFF',        // Clean white
  textSecondary: 'rgba(255, 255, 255, 0.8)',
  textTertiary: 'rgba(255, 255, 255, 0.6)',
  textMuted: 'rgba(255, 255, 255, 0.4)',
  
  // Glass & Overlays
  glassPanel: 'rgba(13, 17, 23, 0.85)',
  glassBorder: 'rgba(255, 215, 0, 0.3)',
  leatherPanel: 'rgba(45, 35, 28, 0.95)',
  crystalGlass: 'rgba(0, 188, 212, 0.15)',
};

export const adventureTypography = {
  // Bold, expedition-style typography
  hero: {
    fontSize: 42,
    fontWeight: '800' as const,
    letterSpacing: 4,
    textTransform: 'uppercase' as const,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    letterSpacing: 3,
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
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
  },
  stats: {
    fontSize: 32,
    fontWeight: '800' as const,
    letterSpacing: 1,
  },
};

// Explorer's Path - Progression Titles with Fun Descriptions
export const EXPLORER_TITLES: Record<number, { title: string; description: string; icon: string; color: string }> = {
  1: { title: "Field Scout", description: "Every legend starts somewhere!", icon: "compass", color: "#4CAF50" },
  2: { title: "Rock Wanderer", description: "The Earth speaks to those who listen", icon: "walk", color: "#8BC34A" },
  3: { title: "Relic Seeker", description: "Ancient treasures await discovery", icon: "search", color: "#CDDC39" },
  4: { title: "Stratum Reader", description: "Reading the book of stone", icon: "layers", color: "#FFEB3B" },
  5: { title: "Rift Walker", description: "Dancing between epochs", icon: "git-branch", color: "#FFC107" },
  6: { title: "Crystal Sage", description: "The minerals whisper secrets", icon: "diamond", color: "#FF9800" },
  7: { title: "Deep Time Navigator", description: "Billions of years at your fingertips", icon: "time", color: "#FF5722" },
  8: { title: "Tectonic Whisperer", description: "Feeling the Earth's heartbeat", icon: "pulse", color: "#E91E63" },
  9: { title: "Planetary Archivist", description: "Keeper of Earth's memories", icon: "library", color: "#9C27B0" },
  10: { title: "Cosmic Geologist", description: "Master of stone and stars!", icon: "planet", color: "#673AB7" },
};

// Fun Expedition Challenges with Rewards
export const EXPEDITION_QUESTS = [
  {
    id: "ancient_water",
    title: "🌊 Echoes of Ancient Seas",
    description: "Find evidence of water that flowed millions of years ago",
    xp: 100,
    icon: "water",
    hint: "Look for sedimentary rocks with ripple marks or marine fossils",
    rarity: "uncommon",
    color: "#00BCD4",
  },
  {
    id: "fire_survivor",
    title: "🔥 Born from Fire",
    description: "Identify a rock forged in volcanic fury",
    xp: 80,
    icon: "flame",
    hint: "Igneous rocks tell tales of molten origins",
    rarity: "common",
    color: "#FF5722",
  },
  {
    id: "time_traveler",
    title: "⏳ 500 Million Year Journey",
    description: "Discover a mineral older than complex life!",
    xp: 150,
    icon: "hourglass",
    hint: "Ancient rocks hide in shields and cratons",
    rarity: "rare",
    color: "#9C27B0",
  },
  {
    id: "crystal_hunter",
    title: "💎 Geometry of the Deep",
    description: "Find a perfectly formed crystal specimen",
    xp: 75,
    icon: "prism",
    hint: "Crystals grow in cavities and veins",
    rarity: "uncommon",
    color: "#00E676",
  },
  {
    id: "metamorphic_tale",
    title: "🦋 Transformed by Pressure",
    description: "Identify a rock that was once something else entirely",
    xp: 90,
    icon: "sync",
    hint: "Heat and pressure write new stories in stone",
    rarity: "uncommon",
    color: "#E040FB",
  },
  {
    id: "landscape_explorer",
    title: "🏔️ Landscape Detective",
    description: "Identify the geological history of a landscape",
    xp: 120,
    icon: "image",
    hint: "Take a photo of mountains, cliffs, or rock formations",
    rarity: "rare",
    color: "#2979FF",
  },
  {
    id: "first_discovery",
    title: "🎉 First Discovery",
    description: "Identify your very first specimen!",
    xp: 50,
    icon: "star",
    hint: "Snap any rock to begin your adventure",
    rarity: "common",
    color: "#FFD700",
  },
  {
    id: "weekly_collector",
    title: "📦 Weekly Collector",
    description: "Add 5 specimens to your vault this week",
    xp: 200,
    icon: "cube",
    hint: "Keep exploring and collecting!",
    rarity: "epic",
    color: "#FF4081",
  },
];

// Daily Challenges - More Fun!
export const DAILY_CHALLENGES = [
  { id: "identify_3", title: "Triple Snap", description: "Identify 3 specimens today", xp: 60, icon: "camera" },
  { id: "hardness_test", title: "Hardness Hunter", description: "Perform 3 hardness tests", xp: 50, icon: "shield" },
  { id: "field_note", title: "Journal Entry", description: "Create a field note", xp: 40, icon: "create" },
  { id: "landscape_scan", title: "Big Picture", description: "Scan a geological landscape", xp: 80, icon: "image" },
  { id: "ask_strata", title: "Student of Stone", description: "Ask Strata 3 questions", xp: 45, icon: "chatbubble" },
  { id: "crystal_quest", title: "Crystal Quest", description: "Find a crystalline mineral", xp: 70, icon: "diamond" },
];

// Achievement Badges with Fun Names
export const ACHIEVEMENTS = [
  { id: "first_snap", title: "Snap Happy", description: "First identification!", icon: "camera", xp: 25, color: "#FFD700" },
  { id: "ten_rocks", title: "Rock Star", description: "Identify 10 specimens", icon: "star", xp: 100, color: "#FF9800" },
  { id: "fifty_rocks", title: "Stone Cold Expert", description: "Identify 50 specimens", icon: "trophy", xp: 300, color: "#E91E63" },
  { id: "streak_7", title: "Week Warrior", description: "7-day streak", icon: "flame", xp: 150, color: "#FF5722" },
  { id: "streak_30", title: "Month Master", description: "30-day streak", icon: "medal", xp: 500, color: "#9C27B0" },
  { id: "igneous_10", title: "Fire Walker", description: "10 igneous rocks", icon: "flame", xp: 75, color: "#FF5722" },
  { id: "sedimentary_10", title: "Layer Cake", description: "10 sedimentary rocks", icon: "layers", xp: 75, color: "#8D6E63" },
  { id: "metamorphic_10", title: "Transformer", description: "10 metamorphic rocks", icon: "sync", xp: 75, color: "#E040FB" },
  { id: "crystal_collector", title: "Shiny Hunter", description: "Find 5 crystal specimens", icon: "diamond", xp: 100, color: "#00BCD4" },
  { id: "landscape_pro", title: "Big Picture Pro", description: "Scan 10 landscapes", icon: "image", xp: 200, color: "#2979FF" },
];

// Story Mode Configurations
export const STORY_MODES = {
  legend: {
    id: "legend",
    name: "🏛️ Legend Mode",
    description: "Mythic tales of geological wonder",
    tone: "poetic and mysterious",
    icon: "book",
    color: "#FFD700",
  },
  scientific: {
    id: "scientific",
    name: "🔬 Scientific Mode",
    description: "Precise geological analysis",
    tone: "rigorous and factual",
    icon: "flask",
    color: "#00BCD4",
  },
  fieldNotes: {
    id: "fieldNotes",
    name: "📓 Field Notes Mode",
    description: "Quick expedition references",
    tone: "practical and concise",
    icon: "document-text",
    color: "#8BC34A",
  },
  funFacts: {
    id: "funFacts",
    name: "🎉 Fun Facts Mode",
    description: "Surprising & entertaining info",
    tone: "fun and engaging",
    icon: "happy",
    color: "#FF4081",
  },
};

// Rarity Colors for specimens
export const RARITY_COLORS = {
  common: { color: "#9E9E9E", label: "Common", glow: "rgba(158, 158, 158, 0.3)" },
  uncommon: { color: "#4CAF50", label: "Uncommon", glow: "rgba(76, 175, 80, 0.3)" },
  rare: { color: "#2196F3", label: "Rare", glow: "rgba(33, 150, 243, 0.3)" },
  epic: { color: "#9C27B0", label: "Epic", glow: "rgba(156, 39, 176, 0.3)" },
  legendary: { color: "#FF9800", label: "Legendary", glow: "rgba(255, 152, 0, 0.3)" },
  mythic: { color: "#E91E63", label: "Mythic", glow: "rgba(233, 30, 99, 0.3)" },
};

// Animation timing for cinematic feel
export const CINEMATIC_TIMING = {
  pageTransition: 500,
  menuUnfold: 350,
  buttonPress: 120,
  crystalGrow: 1500,
  sedimentLayer: 1200,
  scanLock: 250,
  revealBuild: 600,
  lightTrace: 1000,
  confetti: 2000,
  levelUp: 1500,
};

// Fun sound effect triggers (conceptual)
export const SOUND_TRIGGERS = {
  snap: "camera_click",
  discovery: "discovery_chime",
  levelUp: "level_up_fanfare",
  achievement: "achievement_unlock",
  rare: "rare_find_sparkle",
  xpGain: "xp_ding",
};
