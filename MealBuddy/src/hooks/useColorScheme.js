import { useColorScheme as _useColorScheme } from 'react-native';

export default function useColorScheme() {
  return _useColorScheme() || 'light';
}
