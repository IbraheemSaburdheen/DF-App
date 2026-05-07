/**
 * DF Mobile - Color Constants
 * Dark theme with green accents matching "Smart Choice, Better Life" branding
 */

export const COLORS = {
  // Backgrounds
  background: '#0A0A0A',       // Near black main background
  card: '#1A1A1A',             // Card background
  cardElevated: '#222222',     // Elevated card
  input: '#1E1E1E',            // Input field background
  modal: '#151515',            // Modal background

  // Borders
  border: '#2A2A2A',           // Default border
  borderLight: '#333333',      // Lighter border

  // Accents (Green)
  primary: '#7ED321',          // Primary green accent
  primaryDark: '#5A9A18',      // Darker green
  primaryLight: '#96E830',     // Lighter green
  neon: '#39FF14',             // Neon green for highlights/active states
  neonDim: '#2DC410',          // Dimmer neon green

  // Text
  textPrimary: '#FFFFFF',      // Primary white text
  textSecondary: '#AAAAAA',    // Secondary grey text
  textMuted: '#666666',        // Muted/disabled text
  textDark: '#0A0A0A',         // Dark text (on green backgrounds)

  // Status colors
  success: '#7ED321',          // Success green
  warning: '#F5A623',          // Warning orange
  error: '#FF4444',            // Error red
  info: '#4A90D9',             // Info blue

  // Order status colors
  statusPending: '#F5A623',
  statusProcessing: '#4A90D9',
  statusShipped: '#7ED321',
  statusDelivered: '#39FF14',
  statusCancelled: '#FF4444',

  // Misc
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',

  // Tab bar
  tabBarActive: '#7ED321',
  tabBarInactive: '#555555',
  tabBarBackground: '#111111',
};

export const GRADIENTS = {
  primary: ['#7ED321', '#39FF14'],
  primaryDark: ['#5A9A18', '#7ED321'],
  dark: ['#1A1A1A', '#0A0A0A'],
  card: ['#1A1A1A', '#222222'],
};

export default COLORS;
