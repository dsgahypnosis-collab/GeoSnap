// GeoSnap Design System - "Subsurface Sublime"
// Every photon feels motivated. Every pixel feels quarried.

export const colors = {
  // Primary palette - Deep geological tones
  obsidian: '#0c0c0c',        // Primary background - like polished volcanic glass
  caveShadow: '#1a1a2e',      // Secondary background - deep cave darkness
  basalt: '#16213e',          // Tertiary background - dense volcanic rock
  
  // Accent colors - Natural geological elements
  magmaAmber: '#FF6B35',      // Primary accent - molten rock glow
  mineralBlue: '#2C5282',     // Secondary accent - azurite depth
  specimenGold: '#D4AF37',    // Tertiary accent - pyrite highlights
  crystalTeal: '#00B4D8',     // Info color - aquamarine clarity
  emeraldGreen: '#10B981',    // Success - malachite
  rubyRed: '#EF4444',         // Error - garnet
  amethystPurple: '#8B5CF6',  // Special - amethyst glow
  
  // Surface colors - Thin section glass panels
  glassPanel: 'rgba(26, 26, 46, 0.85)',      // Semi-transparent panels
  glassPanelLight: 'rgba(44, 82, 130, 0.15)', // Light glass overlay
  glassBorder: 'rgba(212, 175, 55, 0.2)',     // Golden glass edges
  
  // Text hierarchy
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textTertiary: 'rgba(255, 255, 255, 0.5)',
  textMuted: 'rgba(255, 255, 255, 0.3)',
  
  // Functional
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#00B4D8',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  // Carved, deliberate typography
  hero: {
    fontSize: 42,
    fontWeight: '700' as const,
    letterSpacing: -1,
  },
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    letterSpacing: 0,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: 0,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
};

export const borderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  // Shadows that suggest depth and weight
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  }),
};

// Geological motion curves - accumulation, transformation, stabilization
export const animations = {
  // Slow, deliberate - like geological processes
  geological: {
    duration: 600,
    easing: 'ease-out',
  },
  // Medium - like crystal growth
  crystalline: {
    duration: 400,
    easing: 'ease-in-out',
  },
  // Quick - like light refraction
  refraction: {
    duration: 200,
    easing: 'ease-out',
  },
};

// Rock type colors for classification badges
export const rockTypeColors: Record<string, string> = {
  igneous: '#FF6B35',      // Magma amber - formed from molten rock
  sedimentary: '#D4AF37',  // Specimen gold - layers of time
  metamorphic: '#8B5CF6',  // Amethyst - transformed under pressure
  mineral: '#00B4D8',      // Crystal teal - pure crystalline structure
  gemstone: '#10B981',     // Emerald - precious and rare
};

// Confidence level colors
export const confidenceColors = (confidence: number): string => {
  if (confidence >= 0.85) return colors.emeraldGreen;
  if (confidence >= 0.7) return colors.specimenGold;
  if (confidence >= 0.5) return colors.magmaAmber;
  return colors.rubyRed;
};
