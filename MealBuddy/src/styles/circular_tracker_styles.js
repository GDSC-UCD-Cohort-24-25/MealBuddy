import { StyleSheet } from 'react-native';
import Colors from '../constants/Colors';

// Constants for consistent styling
const SPACING = {
  xs: 5,
  sm: 10,
  md: 15,
  lg: 20
};

const FONT_SIZE = {
  small: 14,
  medium: 16,
  large: 18,
  xlarge: 22,
  xxlarge: 24
};

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: SPACING.xs, // Reduced margin to fit better in the container
  },
  
  // Circle background with white fill
  circleBackground: {
    backgroundColor: 'transparent',
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Text container for value and label
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  
  // Value display
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 22, // Adjusted to match the image better
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  unitText: {
    fontSize: 10, // Smaller unit text
    marginLeft: 2,
    color: '#888',
    fontWeight: '500',
  },
  
  // Label display with icon
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  labelText: {
    fontSize: 14, // Slightly smaller font for label
    fontWeight: '600',
    marginLeft: SPACING.xs / 2,
    color: '#333',
  },
  
  // Percentage indicator
  percentText: {
    fontSize: 12, // Smaller percentage text
    color: '#888',
    fontWeight: '500',
    position: 'absolute'
  },
});
