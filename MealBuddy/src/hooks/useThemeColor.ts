import { useColorScheme } from 'react-native';

type ThemeColors = {
  light: string;
  dark: string;
};

export function useThemeColor(
  colors: ThemeColors,
  colorName: keyof ThemeColors
): string {
  const theme = useColorScheme();
  return theme === 'dark' ? colors.dark : colors.light;
}
