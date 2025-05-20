import { StyleSheet, Dimensions } from 'react-native';
import Colors from '../constants/Colors';

// Constants for consistent spacing, fonts, etc.
const SPACING = {
  xs: 5,
  sm: 10,
  md: 15,
  lg: 20,
  xl: 25,
  xxl: 30
};

const FONT_SIZE = {
  small: 14,
  medium: 16,
  large: 18,
  xlarge: 20,
  xxlarge: 24
};

const BUBBLE_STYLE = {
  maxWidth: '80%',
  padding: SPACING.md,
  borderRadius: 20,
  marginBottom: SPACING.sm,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 2,
};

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  // Page layout
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    padding: SPACING.lg,
    backgroundColor: 'transparent',
  },
  
  // Message list
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingVertical: SPACING.lg,
  },
  
  // Message bubbles
  messageBubble: {
    ...BUBBLE_STYLE,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#5e2bff',
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 20,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderTopLeftRadius: 4,
    borderBottomRightRadius: 20,
  },
  messageText: {
    fontSize: FONT_SIZE.medium,
    lineHeight: FONT_SIZE.medium * 1.4,
  },
  userText: {
    color: '#fff',
  },
  botText: {
    color: Colors.text,
  },
  highlightText: {
    fontWeight: 'bold',
    color: '#5e2bff',
  },
  linkText: {
    color: '#0066cc',
    textDecorationLine: 'underline',
  },
  
  // Input area
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#eaeaea',
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.lg,
  },
  input: {
    flex: 1,
    height: 50,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: SPACING.md,
    backgroundColor: '#fff',
    fontSize: FONT_SIZE.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  sendButton: {
    marginLeft: SPACING.md,
    backgroundColor: '#5e2bff',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 25,
    shadowColor: '#5e2bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: FONT_SIZE.medium,
    fontWeight: 'bold',
  },
  
  // Reset button
  resetButton: {
    padding: SPACING.xs,
    marginLeft: -SPACING.md,
    marginRight: SPACING.xs,
  },
  
  // Avatar
  avatarIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: SPACING.md,
    alignSelf: 'flex-start',
  },
  
  // Message animations
  slideInAnimation: {
    transform: [{ translateY: 20 }],
    opacity: 0,
  },

  shorterInput: {
    height: 40,
  },
  recipesContainer: {
    marginTop: SPACING.lg,
  },
  recipeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  recipeDetails: {
    padding: 16,
  },
  nutritionInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  nutritionText: {
    fontSize: 12,
    color: '#666',
    marginRight: 12,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
    color: '#333',
  },
  ingredient: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    marginBottom: 4,
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  useButton: {
    backgroundColor: '#5e2bff',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  useButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  makeRecipeButton: {
    backgroundColor: '#5e2bff',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    marginTop: SPACING.md,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5e2bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  makeRecipeButtonText: {
    color: Colors.buttonText || '#fff',
    fontSize: FONT_SIZE.medium,
    fontWeight: 'bold',
  },
  videoLinkButton: {
    backgroundColor: '#5e2bff',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  videoLinkText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  // Adjusted Styles for Category Picker Overlay and Buttons (ADD/MODIFY THESE ONLY)

  // Category Picker Modal/Overlay Styles
  categoryPickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background || '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  categoryPickerContainer: {
    width: width * 0.8,
    backgroundColor: Colors.cardBackground || '#FFFFFF',
    borderRadius: 15,
    padding: SPACING.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  categoryPickerTitle: {
    fontSize: FONT_SIZE.large,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    color: Colors.text || '#333',
  },
  picker: {
    width: '100%',
    height: 150,
    marginBottom: SPACING.md,
  },
  confirmAddButton: {
    backgroundColor: '#5e2bff',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    marginTop: SPACING.sm,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5e2bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  confirmAddButtonText: {
    color: Colors.buttonText || '#fff',
    fontSize: FONT_SIZE.medium,
    fontWeight: 'bold',
  },
  cancelAddButton: {
    marginTop: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondaryButton || '#cccccc',
    shadowColor: Colors.secondaryButton || '#cccccc',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cancelAddButtonText: {
    color: Colors.secondaryButtonText || '#333',
    fontSize: FONT_SIZE.medium,
    fontWeight: 'bold',
  },
});
