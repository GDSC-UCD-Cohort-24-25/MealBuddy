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

const CARD_STYLE = {
  backgroundColor: '#fff',
  borderRadius: 20,
  padding: SPACING.md,
  marginBottom: SPACING.md,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 4
};

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  // Page layout
  container: {
    flex: 1,
    backgroundColor: '#f9f9fb',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl * 2,
  },
  
  // Header & greeting
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  greetingContainer: {
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  greetingText: {
    fontSize: FONT_SIZE.xxlarge,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: SPACING.xs,
  },
  dateText: {
    fontSize: FONT_SIZE.small,
    color: '#666',
    marginBottom: SPACING.xs,
  },
  loggedText: {
    fontSize: FONT_SIZE.small,
    color: '#666',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eee',
    marginLeft: SPACING.md,
  },
  
  // Cards
  card: {
    ...CARD_STYLE,
    marginBottom: SPACING.lg,
  },
  mealContainer: {
    ...CARD_STYLE,
    marginTop: SPACING.md,
  },
  mealOfDayCard: {
    ...CARD_STYLE,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: SPACING.sm,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text || '#333',
  },
  
  // Meal of Day section
  mealOfDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  mealOfDayTitle: {
    fontSize: FONT_SIZE.large,
    fontWeight: 'bold',
    color: Colors.text,
  },
  logMealButton: {
    backgroundColor: '#5e2bff',
    borderRadius: 20,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    shadowColor: '#5e2bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  logMealButtonText: {
    color: '#fff',
    fontSize: FONT_SIZE.small,
    fontWeight: '600',
  },
  mealCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: SPACING.md,
  },
  placeholderBox: {
    width: 80,
    height: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    marginRight: SPACING.md,
  },
  mealCardTitle: {
    fontSize: FONT_SIZE.medium,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  viewAllText: {
    color: '#5e2bff',
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.small,
    fontWeight: '500',
    textAlign: 'right',
  },
  
  // Nutrition section
  nutritionSummaryCard: {
    width: width * 0.9,
    backgroundColor: Colors.cardBackground || '#FFFFFF',
    borderRadius: 15,
    padding: 20, // Ensure padding is applied inside the card
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nutritionSummaryContent: {
    // This container holds the large and small tracker rows.
    // Ensure no conflicting padding or margin that pushes content out.
    // Adding a little horizontal padding here might help contain the rows.
    paddingHorizontal: 5, // Added a small horizontal padding to this content container
  },
  largeTrackerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Use space-around for even distribution including ends
    marginBottom: 20,
    // Removed marginHorizontal if previously added
  },
  smallTrackerRow: {
    flexDirection: 'row',
    // Use space-around to distribute space evenly between and around items.
    // Ensure the total width of items + space fits within the parent.
    justifyContent: 'space-around', // Reverted to space-around, combined with paddingHorizontal on content
    // Add flexWrap in case they still don't fit, although space-around should help
    flexWrap: 'wrap', // Added flexWrap as a fallback
    // Removed marginHorizontal if previously added
  },
  
  // Suggested recipes section
  recipeScrollView: {
    marginVertical: SPACING.md,
  },
  recipesSectionContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: SPACING.sm,
  },
  recipesSectionTitle: {
    fontSize: FONT_SIZE.large,
    fontWeight: 'bold',
    color: Colors.text,
  },
  recipeCard: {
    width: width * 0.7,
    marginRight: SPACING.md,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recipeImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f7f7f7',
  },
  recipeContent: {
    padding: SPACING.md,
  },
  recipeTitle: {
    fontSize: FONT_SIZE.medium,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: SPACING.xs,
  },
  recipeButton: {
    backgroundColor: '#5e2bff',
    borderRadius: 20,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
  },
  recipeButtonText: {
    color: '#fff',
    fontSize: FONT_SIZE.small,
    fontWeight: '600',
  },
  
  // Meal items
  mealTitle: {
    fontSize: FONT_SIZE.large,
    fontWeight: 'bold',
    color: '#5e2bff',
    marginBottom: SPACING.sm,
  },
  foodItem: {
    marginBottom: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: '#f9f9fb',
    borderRadius: 12,
  },
  foodName: {
    fontSize: FONT_SIZE.medium,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: SPACING.xs,
  },
  nutritionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.xs,
  },
  nutritionText: {
    fontSize: FONT_SIZE.small,
    color: '#666',
    marginRight: SPACING.md,
  },
  
  // ChatBot CTA
  chatbotCTA: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: '#5e2bff',
    borderRadius: 30,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  chatbotCTAText: {
    color: '#fff',
    fontSize: FONT_SIZE.medium,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  
  // NEW STYLES FOR LOGGED MEALS SECTION
  loggedMealsSectionContainer: {
    width: width * 0.9, // Match other main cards
    backgroundColor: Colors.cardBackground || '#FFFFFF', // Consistent card background color, fallback to white
    borderRadius: 15, // Match border radius
    padding: 20, // Match padding
    marginBottom: 20, // Space below the section
    shadowColor: '#000', // Consistent shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // for Android
  },
  loggedMealsContent: {
    // Add padding or other styles if needed for the content area within the section card
    // paddingHorizontal: 10, // Example
  },
  mealCategoryGroup: {
    marginBottom: 15, // Space between meal categories (Breakfast, Lunch, etc.)
    // Optional: add padding or margin if categories need more separation
  },
  mealCategoryHeader: {
    fontSize: 16, // Consistent header size
    fontWeight: 'bold',
    color: Colors.text || '#333333', // Consistent text color, fallback to dark gray
    marginBottom: 10, // Space below header
    borderBottomWidth: 1, // Optional: Add a subtle line below the category name
    borderBottomColor: Colors.divider || '#eeeeee', // Assuming a divider color is defined, fallback to light gray
    paddingBottom: 5, // Space between text and line
  },
  loggedMealItemContainer: { // Style for each individual logged meal card
    backgroundColor: Colors.innerCardBackground || Colors.cardBackground || '#FFFFFF', // Background for individual meal item, fallback to white
    borderRadius: 10, // Slightly smaller border radius than main card
    padding: 15, // Inner padding
    marginBottom: 10, // Space between individual meal cards
    shadowColor: '#000', // Optional: subtle inner shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1, // for Android
    borderWidth: 1, // Optional: subtle border
    borderColor: Colors.border || '#dddddd', // Assuming a border color, fallback to light gray
  },
  loggedMealTitle: {
    fontSize: 15, // Slightly smaller than card title
    fontWeight: 'bold',
    color: Colors.text || '#333333',
    marginBottom: 5, // Space below the meal title
  },
  loggedMealMacros: {
    flexDirection: 'row', // Arrange macros in a row
    flexWrap: 'wrap', // Allow macros to wrap
  },
  loggedMealMacroText: {
    fontSize: 13, // Smaller font size for macros
    color: Colors.textSecondary || Colors.text || '#666666', // Use a secondary color or main text color, fallback to gray
    marginRight: 10, // Space between macro labels
    marginBottom: 3, // Space below macros if they wrap
  },

  // Add a style for the container wrapping each small tracker to control spacing
  smallTrackerContainer: {
      alignItems: 'center', // Center the tracker within its container
      // Add horizontal margin to create space between trackers
      marginHorizontal: 5, // Add horizontal margin between trackers
      marginBottom: 10, // Add a small bottom margin in case of wrapping
  },
});
