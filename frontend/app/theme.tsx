// theme.ts
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const LightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#fd9029',
    background: '#f8f9fa',
    surface: '#fff',
    text: '#333',
    secondary: '#666',
    error: '#ff4444',
  },
};

export const DarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#fd9029',
    background: '#121212',
    surface: '#1e1e1e',
    text: '#fff',
    secondary: '#ccc',
    error: '#ff4444',
  },
};
