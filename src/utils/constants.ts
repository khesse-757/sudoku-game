export const GRID_SIZE = 9;
export const BOX_SIZE = 3;

export const DIFFICULTY_CONFIG = {
  easy: {
    givens: 45,
    hintsAllowed: 999,
    highlightMistakes: true,
    label: 'Easy'
  },
  medium: {
    givens: 35,
    hintsAllowed: 3,
    highlightMistakes: true,
    label: 'Medium'
  },
  hard: {
    givens: 28,
    hintsAllowed: 0,
    highlightMistakes: false,
    label: 'Hard'
  }
} as const;

export const THEMES = {
  green: {
    name: 'Green Phosphor',
    primary: '#00ff00',
    secondary: '#00aa00',
    background: '#000000',
    surface: '#001a00',
    text: '#00ff00',
    textDim: '#008800',
    error: '#ff3333',
    success: '#00ff88',
    border: '#00aa00'
  },
  amber: {
    name: 'Classic Amber',
    primary: '#ffb000',
    secondary: '#cc8800',
    background: '#1a0f00',
    surface: '#2a1f10',
    text: '#ffb000',
    textDim: '#aa7700',
    error: '#ff4444',
    success: '#88ff00',
    border: '#cc8800'
  },
  paper: {
    name: 'Paper',
    primary: '#2a2a2a',
    secondary: '#4a4a4a',
    background: '#f5f5dc',
    surface: '#eeeecc',
    text: '#2a2a2a',
    textDim: '#666666',
    error: '#cc0000',
    success: '#006600',
    border: '#4a4a4a'
  },
  monochrome: {
    name: 'Monochrome',
    primary: '#ffffff',
    secondary: '#cccccc',
    background: '#000000',
    surface: '#1a1a1a',
    text: '#ffffff',
    textDim: '#999999',
    error: '#ffffff',
    success: '#ffffff',
    border: '#666666'
  }
} as const;

export const FONTS = {
  jetbrains: '"JetBrains Mono", monospace',
  fira: '"Fira Code", monospace',
  ibm: '"IBM Plex Mono", monospace',
  courier: '"Courier New", monospace'
} as const;
