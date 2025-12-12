import { StyleSheet } from 'react-native';
import { Colors, Spacing } from './GlobalStyles';

export const LayoutStyles = StyleSheet.create({
  // Screen Container
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['5xl'], // 50px
  },
  
  // Scroll Content
  scrollContent: {
    flexGrow: 1,
  },
  
  // Image Container
  imageContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  
  // House/Apartment Image
  apartmentImage: {
    width: 280,
    height: 180,
  },
  
  // Welcome Title
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing['3xl'],
    letterSpacing: 0.5,
  },
  
  // Keyboard Avoiding View
  keyboardAvoidingView: {
    flex: 1,
  },
  
  // Touch Without Feedback
  touchableArea: {
    flex: 1,
  },
  
  // Content Container
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  
  // Header Section
  headerSection: {
    alignItems: 'center',
    paddingTop: Spacing['2xl'],
  },
  
  // Main Content Section
  mainContentSection: {
    flex: 1,
    justifyContent: 'center',
  },
  
  // Footer Section
  footerSection: {
    paddingBottom: Spacing['2xl'],
  },
  
  // Card Container
  cardContainer: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: Spacing['2xl'],
    marginVertical: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  // Row Container
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  // Column Container
  columnContainer: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  
  // Centered Container
  centeredContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Home Page Styles
  homeHeader: {
    paddingTop: 60,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  
  homeHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  
  locationContainer: {
    flex: 1,
  },
  
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  
  iconButton: {
    padding: 5,
  },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 40,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: Spacing.xl,
  },
  
  searchIcon: {
    marginRight: 10,
  },
  
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  
  filtersContainer: {
    flexDirection: 'row',
  },
  
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  
  propertyList: {
    flexDirection: 'row',
  },
  
  propertyCard: {
    marginRight: 15,
    width: 220,
  },
  
  propertyImageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  
  propertyImage: {
    width: 220,
    height: 160,
    borderRadius: 15,
  },
  
  propertyInfo: {
    paddingHorizontal: 5,
  },
  
  bestPropertyCard: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  bestPropertyImage: {
    width: 80,
    height: 80,
    borderRadius: 15,
    margin: 10,
  },
  
  bestPropertyInfo: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  
  propertyFeatures: {
    flexDirection: 'row',
    gap: 15,
  },
  
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});