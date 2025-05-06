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
    margin: SPACING.sm,
    // Add a subtle shadow to the whole container
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  
  // Text container for value and label
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
    paddingVertical: SPACING.sm,
  },
  
  // Value display
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: FONT_SIZE.xlarge,
    fontWeight: 'bold',
    textAlign: 'center', 
  },
  unitText: {
    fontSize: FONT_SIZE.small,
    marginLeft: 2,
    color: '#888',
  },
  
  // Label display with icon
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -SPACING.xs,
  },
  labelText: {
    fontSize: FONT_SIZE.small,
    fontWeight: '600',
    marginLeft: SPACING.xs / 2,
  },
  
  // Percentage indicator
  percentText: {
    fontSize: FONT_SIZE.small,
    color: '#888',
    fontWeight: '500',
  },
  
  // Animation styles
  progressCircleContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});
