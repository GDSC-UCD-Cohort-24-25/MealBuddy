import { StyleSheet, Dimensions } from 'react-native';
import Colors from '../constants/Colors';

// Constants for consistent spacing, fonts, etc.
const SPACING = {
  xs: 5,
  sm: 10,
  md: 15,
  lg: 20,
  xl: 25,
};

const FONT_SIZE = {
  small: 14,
  medium: 16,
  large: 18,
  xlarge: 20,
  xxlarge: 24,
};

const { width } = Dimensions.get('window');

// Shared styles for reusability
const sharedStyles = {
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZE.medium,
    color: Colors.text,
    fontWeight: '500',
    flex: 0.45,
  },
  value: {
    fontSize: FONT_SIZE.medium,
    color: Colors.secondary,
    flex: 0.55,
    textAlign: 'right',
  },
};

const styles = StyleSheet.create({
  // Page layout
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3fefb',
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  
  // Header & profile section
  headerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    marginTop: SPACING.md,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: '#ddd',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileInitial: {
    fontSize: FONT_SIZE.xxlarge * 1.5,
    fontWeight: 'bold',
    color: Colors.text,
  },
  uploadIndicator: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZE.xxlarge,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZE.xlarge,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    fontWeight: '500',
  },
  
  // Card components
  card: {
    ...sharedStyles.card,
    marginBottom: SPACING.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: SPACING.sm,
  },
  cardTitle: {
    fontSize: FONT_SIZE.xlarge,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: SPACING.sm,
  },
  cardContent: {
    paddingHorizontal: SPACING.sm,
  },
  
  // Information rows
  infoRow: {
    ...sharedStyles.row,
    paddingVertical: SPACING.xs,
  },
  infoLabel: {
    ...sharedStyles.label,
  },
  infoValue: {
    ...sharedStyles.value,
    flexWrap: 'wrap', // Allow text to wrap
  },
  
  // Metrics rows & values
  metricRow: {
    ...sharedStyles.row,
    paddingVertical: SPACING.xs,
  },
  metricLabel: {
    ...sharedStyles.label,
  },
  metricValueContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    flex: 0.55,
  },
  metricValue: {
    fontSize: FONT_SIZE.large,
    fontWeight: 'bold',
  },
  metricCategory: {
    fontSize: FONT_SIZE.small,
  },
  
  // Button styles
  signOutButton: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: '#ff5c5c',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  signOutText: {
    color: '#fff',
    fontSize: FONT_SIZE.medium,
    fontWeight: '600',
  },
  
  // Miscellaneous
  noDataText: {
    fontSize: FONT_SIZE.large,
    color: Colors.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: SPACING.xl,
  },
  
});

export default styles;
