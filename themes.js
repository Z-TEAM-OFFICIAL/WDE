const THEMES = {
  // Original 14 themes preserved...
  dark: {
    '--ed-bg': '#1e1e1e',
    '--ed-panel': '#252526',
    '--ed-text': '#d4d4d4',
    '--ed-muted': '#6a9955',
    '--ed-accent': '#61dafb',
    '--ed-line': '#333333',
    '--ed-gutter': '#1e1e1e',
    '--ed-sel': 'rgba(97,175,239,0.3)'
  },
  light: {
    '--ed-bg': '#f8fafc',
    '--ed-panel': '#ffffff',
    '--ed-text': '#0f172a',
    '--ed-muted': '#475569',
    '--ed-accent': '#2563eb',
    '--ed-line': '#cbd5e1',
    '--ed-gutter': '#e2e8f0',
    '--ed-sel': 'rgba(37,99,235,0.14)'
  },
  dracula: {
    '--ed-bg': '#282a36',
    '--ed-panel': '#44475a',
    '--ed-text': '#f8f8f2',
    '--ed-muted': '#6272a4',
    '--ed-accent': '#ff79c6',
    '--ed-line': '#6272a4',
    '--ed-gutter': '#21222c',
    '--ed-sel': 'rgba(255,121,198,0.3)'
  },
  solarized: {
    '--ed-bg': '#002b36',
    '--ed-panel': '#073642',
    '--ed-text': '#839496',
    '--ed-muted': '#586e75',
    '--ed-accent': '#b58900',
    '--ed-line': '#586e75',
    '--ed-gutter': '#073642',
    '--ed-sel': 'rgba(181,137,0,0.2)'
  },
  ocean: {
    '--ed-bg': '#1b2b34',
    '--ed-panel': '#343d46',
    '--ed-text': '#c0c5ce',
    '--ed-muted': '#65737e',
    '--ed-accent': '#6699cc',
    '--ed-line': '#4f5b66',
    '--ed-gutter': '#1b2b34',
    '--ed-sel': 'rgba(102,153,204,0.25)'
  },
  monokai: {
    '--ed-bg': '#272822',
    '--ed-panel': '#3e3d32',
    '--ed-text': '#f8f8f2',
    '--ed-muted': '#75715e',
    '--ed-accent': '#f92672',
    '--ed-line': '#49483e',
    '--ed-gutter': '#272822',
    '--ed-sel': 'rgba(249,38,114,0.25)'
  },
  twilight: {
    '--ed-bg': '#141414',
    '--ed-panel': '#1f1f1f',
    '--ed-text': '#f8f8f8',
    '--ed-muted': '#999999',
    '--ed-accent': '#6699cc',
    '--ed-line': '#333333',
    '--ed-gutter': '#1f1f1f',
    '--ed-sel': 'rgba(102,153,204,0.18)'
  },
  graphite: {
    '--ed-bg': '#2f2f2f',
    '--ed-panel': '#3a3a3a',
    '--ed-text': '#e0e0e0',
    '--ed-muted': '#a0a0a0',
    '--ed-accent': '#ff9800',
    '--ed-line': '#4a4a4a',
    '--ed-gutter': '#2f2f2f',
    '--ed-sel': 'rgba(255,152,0,0.2)'
  },
  cobalt: {
    '--ed-bg': '#002240',
    '--ed-panel': '#003366',
    '--ed-text': '#ffffff',
    '--ed-muted': '#99ccff',
    '--ed-accent': '#ffcc00',
    '--ed-line': '#004080',
    '--ed-gutter': '#002240',
    '--ed-sel': 'rgba(255,204,0,0.2)'
  },
  ember: {
    '--ed-bg': '#1b0b0b',
    '--ed-panel': '#2c1a1a',
    '--ed-text': '#ffe0e0',
    '--ed-muted': '#aa6666',
    '--ed-accent': '#ff5500',
    '--ed-line': '#442222',
    '--ed-gutter': '#1b0b0b',
    '--ed-sel': 'rgba(255,85,0,0.25)'
  },
  forest: {
    '--ed-bg': '#0b1e0b',
    '--ed-panel': '#1a341a',
    '--ed-text': '#d4f8d4',
    '--ed-muted': '#66aa66',
    '--ed-accent': '#55ff55',
    '--ed-line': '#224422',
    '--ed-gutter': '#0b1e0b',
    '--ed-sel': 'rgba(85,255,85,0.2)'
  },
  sunset: {
    '--ed-bg': '#3b0b0b',
    '--ed-panel': '#5a1a1a',
    '--ed-text': '#ffd4d4',
    '--ed-muted': '#aa6666',
    '--ed-accent': '#ff5555',
    '--ed-line': '#442222',
    '--ed-gutter': '#3b0b0b',
    '--ed-sel': 'rgba(255,85,85,0.2)'
  },
  lavender: {
    '--ed-bg': '#1b0b1b',
    '--ed-panel': '#341a34',
    '--ed-text': '#f0d4f8',
    '--ed-muted': '#aa66aa',
    '--ed-accent': '#ff55ff',
    '--ed-line': '#442244',
    '--ed-gutter': '#1b0b1b',
    '--ed-sel': 'rgba(255,85,255,0.2)'
  },
  amber: {
    '--ed-bg': '#1b140b',
    '--ed-panel': '#342a1a',
    '--ed-text': '#f8ecd4',
    '--ed-muted': '#aa9966',
    '--ed-accent': '#ffbb55',
    '--ed-line': '#443322',
    '--ed-gutter': '#1b140b',
    '--ed-sel': 'rgba(255,187,85,0.2)'
  },
  
  // 20 NEW THEMES BELOW
  
  nord: {
    '--ed-bg': '#2e3440',
    '--ed-panel': '#3b4252',
    '--ed-text': '#d8dee9',
    '--ed-muted': '#616e88',
    '--ed-accent': '#88c0d0',
    '--ed-line': '#434c5e',
    '--ed-gutter': '#2e3440',
    '--ed-sel': 'rgba(136,192,208,0.25)'
  },
  gruvbox: {
    '--ed-bg': '#282828',
    '--ed-panel': '#3c3836',
    '--ed-text': '#ebdbb2',
    '--ed-muted': '#928374',
    '--ed-accent': '#fb4934',
    '--ed-line': '#504945',
    '--ed-gutter': '#282828',
    '--ed-sel': 'rgba(251,73,52,0.2)'
  },
  'one-dark': {
    '--ed-bg': '#282c34',
    '--ed-panel': '#353b45',
    '--ed-text': '#abb2bf',
    '--ed-muted': '#5c6370',
    '--ed-accent': '#61afef',
    '--ed-line': '#3e4451',
    '--ed-gutter': '#282c34',
    '--ed-sel': 'rgba(97,175,239,0.2)'
  },
  material: {
    '--ed-bg': '#263238',
    '--ed-panel': '#37474f',
    '--ed-text': '#b0bec5',
    '--ed-muted': '#607d8b',
    '--ed-accent': '#80cbc4',
    '--ed-line': '#455a64',
    '--ed-gutter': '#263238',
    '--ed-sel': 'rgba(128,203,196,0.25)'
  },
  'night-owl': {
    '--ed-bg': '#011627',
    '--ed-panel': '#0b2942',
    '--ed-text': '#d6deeb',
    '--ed-muted': '#5f7e97',
    '--ed-accent': '#ffeb95',
    '--ed-line': '#1d3b53',
    '--ed-gutter': '#011627',
    '--ed-sel': 'rgba(255,235,149,0.2)'
  },
  palenight: {
    '--ed-bg': '#292d3e',
    '--ed-panel': '#444267',
    '--ed-text': '#a6accd',
    '--ed-muted': '#676e95',
    '--ed-accent': '#ff5370',
    '--ed-line': '#3e4451',
    '--ed-gutter': '#292d3e',
    '--ed-sel': 'rgba(255,83,112,0.2)'
  },
  'high-contrast': {
    '--ed-bg': '#000000',
    '--ed-panel': '#1a1a1a',
    '--ed-text': '#ffffff',
    '--ed-muted': '#ffffff',
    '--ed-accent': '#ffff00',
    '--ed-line': '#333333',
    '--ed-gutter': '#000000',
    '--ed-sel': 'rgba(255,255,0,0.4)'
  },
  cyberpunk: {
    '--ed-bg': '#0a0a0f',
    '--ed-panel': '#1a1a2e',
    '--ed-text': '#00ff9f',
    '--ed-muted': '#ff00ff',
    '--ed-accent': '#00ffff',
    '--ed-line': '#2d1b69',
    '--ed-gutter': '#0a0a0f',
    '--ed-sel': 'rgba(0,255,159,0.3)'
  },
  matrix: {
    '--ed-bg': '#0c0c0c',
    '--ed-panel': '#1a1a1a',
    '--ed-text': '#00ff00',
    '--ed-muted': '#008800',
    '--ed-accent': '#33ff33',
    '--ed-line': '#003300',
    '--ed-gutter': '#0c0c0c',
    '--ed-sel': 'rgba(0,255,0,0.25)'
  },
  'rose-pine': {
    '--ed-bg': '#191724',
    '--ed-panel': '#1f1d2e',
    '--ed-text': '#e0def4',
    '--ed-muted': '#6e6a86',
    '--ed-accent': '#eb6f92',
    '--ed-line': '#26233a',
    '--ed-gutter': '#191724',
    '--ed-sel': 'rgba(235,111,146,0.2)'
  },
  catppuccin: {
    '--ed-bg': '#1e1e2e',
    '--ed-panel': '#302d41',
    '--ed-text': '#cdd6f4',
    '--ed-muted': '#6c7086',
    '--ed-accent': '#f5c2e7',
    '--ed-line': '#45475a',
    '--ed-gutter': '#1e1e2e',
    '--ed-sel': 'rgba(245,194,231,0.25)'
  },
  'tokyo-night': {
    '--ed-bg': '#1a1b26',
    '--ed-panel': '#24283b',
    '--ed-text': '#a9b1d6',
    '--ed-muted': '#565f89',
    '--ed-accent': '#7aa2f7',
    '--ed-line': '#414868',
    '--ed-gutter': '#1a1b26',
    '--ed-sel': 'rgba(122,162,247,0.25)'
  },
  ayu: {
    '--ed-bg': '#0f1419',
    '--ed-panel': '#1c2128',
    '--ed-text': '#bfbdb6',
    '--ed-muted': '#565b66',
    '--ed-accent': '#39bae6',
    '--ed-line': '#242936',
    '--ed-gutter': '#0f1419',
    '--ed-sel': 'rgba(57,186,230,0.25)'
  },
  synthwave: {
    '--ed-bg': '#2b213a',
    '--ed-panel': '#463465',
    '--ed-text': '#f8f8f2',
    '--ed-muted': '#8b8b8b',
    '--ed-accent': '#ff7edb',
    '--ed-line': '#34294f',
    '--ed-gutter': '#2b213a',
    '--ed-sel': 'rgba(255,126,219,0.3)'
  },
  'black-metal': {
    '--ed-bg': '#000000',
    '--ed-panel': '#121212',
    '--ed-text': '#c1c1c1',
    '--ed-muted': '#4a4a4a',
    '--ed-accent': '#aa0000',
    '--ed-line': '#1a1a1a',
    '--ed-gutter': '#000000',
    '--ed-sel': 'rgba(170,0,0,0.3)'
  },
  paper: {
    '--ed-bg': '#f4ecd8',
    '--ed-panel': '#e8e0cc',
    '--ed-text': '#5c5548',
    '--ed-muted': '#8b8378',
    '--ed-accent': '#d4a373',
    '--ed-line': '#d0c8b8',
    '--ed-gutter': '#f4ecd8',
    '--ed-sel': 'rgba(212,163,115,0.25)'
  },
  winter: {
    '--ed-bg': '#0d1117',
    '--ed-panel': '#161b22',
    '--ed-text': '#c9d1d9',
    '--ed-muted': '#8b949e',
    '--ed-accent': '#58a6ff',
    '--ed-line': '#21262d',
    '--ed-gutter': '#0d1117',
    '--ed-sel': 'rgba(88,166,255,0.2)'
  },
  coffee: {
    '--ed-bg': '#3b2f2f',
    '--ed-panel': '#4a3b3b',
    '--ed-text': '#d4c5b9',
    '--ed-muted': '#8b7355',
    '--ed-accent': '#d2691e',
    '--ed-line': '#5c4a4a',
    '--ed-gutter': '#3b2f2f',
    '--ed-sel': 'rgba(210,105,30,0.25)'
  },
  neon: {
    '--ed-bg': '#0b0c15',
    '--ed-panel': '#151825',
    '--ed-text': '#f1f1f1',
    '--ed-muted': '#4a5568',
    '--ed-accent': '#ff006e',
    '--ed-line': '#1e2130',
    '--ed-gutter': '#0b0c15',
    '--ed-sel': 'rgba(255,0,110,0.25)'
  },
  dawn: {
    '--ed-bg': '#faf4ed',
    '--ed-panel': '#fffaf3',
    '--ed-text': '#575279',
    '--ed-muted': '#9893a5',
    '--ed-accent': '#d7827e',
    '--ed-line': '#f2e9e1',
    '--ed-gutter': '#faf4ed',
    '--ed-sel': 'rgba(215,130,126,0.2)'
  }
};

function applyTheme(themeName) {
  const theme = THEMES[themeName] || THEMES.dark;
  for (const varName in theme) {
    document.documentElement.style.setProperty(varName, theme[varName]);
  }
  // Save preference if storage available
  try {
    localStorage.setItem('editor-theme', themeName);
  } catch(e) {}
}

// Load saved theme on init
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('editor-theme');
    if (saved && THEMES[saved]) applyTheme(saved);
  } catch(e) {}
}