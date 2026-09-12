/**
 * Bizdee Design System Tokens
 * Palette B: Deep Forest Emerald & Warm Copper / Amber Gold
 * Bespoke luxury couple experience.
 */

export const colors = {
  // Brand Primaries
  emerald: {
    50: '#F0F7F5',
    100: '#DCEEE9',
    200: '#B6DCD2',
    300: '#84C2B4',
    400: '#4DA291',
    500: '#1B7F6E',
    600: '#0D525A', // Primary Brand Accent
    700: '#093E44',
    800: '#062C31',
    900: '#031D21',
  },

  // Warm Secondary & Highlights
  copper: {
    50: '#FDF7F2',
    100: '#FBEDE2',
    200: '#F5DAC5',
    300: '#ECC1A0',
    400: '#E09F71',
    500: '#D97736', // Warm Copper Accent
    600: '#BD5C20',
    700: '#994415',
    800: '#7B3412',
    900: '#5F280D',
  },

  // Romance & Reaction Highlights
  rose: {
    50: '#FFF1F3',
    100: '#FFE4E8',
    200: '#FECDD6',
    300: '#FDA4B6',
    400: '#FB718D',
    500: '#D94862', // Romantic Rose
    600: '#BE2744',
    700: '#9F1A34',
    800: '#83162C',
    900: '#6E1627',
  },

  // Achievement & XP Gold
  gold: {
    50: '#FFFDF5',
    100: '#FEF9E7',
    200: '#FCF0C4',
    300: '#F9E397',
    400: '#F5D15E',
    500: '#EEBD2B', // XP Gold
    600: '#D69E15',
    700: '#A9750D',
    800: '#875B10',
    900: '#714B11',
  },

  // Sage / Linen Neutrals & Surfaces
  neutral: {
    50: '#F7F9F7', // Main App Canvas Background
    100: '#EFF3F0', // Soft Surface Tint
    200: '#E1E9E3', // Subtle Card Border
    300: '#CCD8CF',
    400: '#9FB1A5',
    500: '#6D8275', // Muted Secondary Text
    600: '#4F6357',
    700: '#34453B',
    800: '#1E2C24',
    900: '#0F1A13', // Deep Forest Primary Text
  },

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const radii = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  full: 9999,
};

export const shadows = {
  soft: {
    shadowColor: '#093E44',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    shadowColor: '#0D525A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  floating: {
    shadowColor: '#093E44',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  copperGlow: {
    shadowColor: '#D97736',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  emeraldGlow: {
    shadowColor: '#0D525A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
};

export const spring = {
  // Apple Native Interaction Presets
  press: {
    duration: 180,
    dampingRatio: 0.85,
  },
  settle: {
    duration: 350,
    dampingRatio: 0.82,
  },
  bouncy: {
    duration: 420,
    dampingRatio: 0.72,
  },
  sheet: {
    duration: 320,
    dampingRatio: 0.84,
  },
};
