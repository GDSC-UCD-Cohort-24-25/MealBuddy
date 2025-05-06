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

});
