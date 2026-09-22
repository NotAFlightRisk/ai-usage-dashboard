export const THEMES = [
  { id: 'auto', label: 'Match the system' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'dracula', label: 'Dracula' },
  { id: 'catppuccin', label: 'Catppuccin Mocha' },
  { id: 'tokyo-night', label: 'Tokyo Night' },
  { id: 'nord', label: 'Nord' },
  { id: 'gruvbox', label: 'Gruvbox dark' },
  { id: 'solarized', label: 'Solarized dark' }
] as const;

export type Theme = (typeof THEMES)[number]['id'];
