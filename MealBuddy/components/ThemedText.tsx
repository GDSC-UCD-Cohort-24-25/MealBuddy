import { useColorScheme } from 'react-native';

type ThemeColors = {
  light?: string;
  dark?: string;
};

export function useThemeColor(
  colors: ThemeColors,
  colorName: keyof ThemeColors
): string {
  const theme = useColorScheme(); // Detect the system's color scheme
  if (theme === 'dark' && colors.dark) {
    return colors.dark;
  }
  if (theme === 'light' && colors.light) {
    return colors.light;
  }
  // Default fallback color if neither dark nor light is defined
  return colors[colorName] || '#000';
}
