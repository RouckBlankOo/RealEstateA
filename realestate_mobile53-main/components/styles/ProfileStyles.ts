import { StyleSheet, Dimensions } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from './GlobalStyles';

const { width } = Dimensions.get('window');

export const ProfileStyles = StyleSheet.create({
  // Scroll Container
  scrollContainer: {
    flex: 1,
    margin: 0,
    padding: 0,
  },
  
  // Header Styles
  headerContainer: {
    height: 280,
    position: 'relative',
    width: '100%',
    marginLeft: 0,
    marginRight: 0,
    resizeMode: 'cover',
  },
  
  headerBackgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  
  headerTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: 50,
    paddingBottom: Spacing.xl,
  },
  
  // Icon Buttons (Back, More, etc.)
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  iconButtonSolid: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  
  // Profile Image Styles
  profileImageWrapper: {
    position: 'absolute',
    bottom: -60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  
  profileImageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.background,
    padding: 3,
    borderWidth: 3,
    borderColor: Colors.accent,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  
  profileImageContainerSmall: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.background,
    padding: 2,
    borderWidth: 2,
    borderColor: Colors.accent,
    ...Shadows.sm,
  },
  
  profileImage: {
    width: 137,
    height: 137,
    borderRadius: 68.5,
  },
  
  profileImageSmall: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  
  // Profile Info Section
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: 85,
    paddingBottom: 15,
  },
  
  profileName: {
    fontSize: Typography.fontSize.xl + 2, // 22px
    fontWeight: Typography.fontWeight.bold,
    color: Colors.accent,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing['2xl'] + 1, // 25px
  },
  
  locationText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  
  // Stats Section
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginBottom: Spacing['3xl'] - 2, // 30px
    paddingHorizontal: Spacing['3xl'] - 2, // 30px
  },
  
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  
  statNumber: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: '#888888',
    textAlign: 'center',
  },
  
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing['2xl'] + 1, // 25px
    gap: 15,
  },
  
  outlineButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: BorderRadius['2xl'] + 1, // 25px
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  
  outlineButtonText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.accent,
    fontWeight: Typography.fontWeight.medium,
  },
  
  filledButton: {
    flex: 1,
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius['2xl'] + 1, // 25px
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  
  filledButtonText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textWhite,
    fontWeight: Typography.fontWeight.medium,
  },
  
  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  
  tab: {
    paddingVertical: Spacing.sm + 2, // 10px
    paddingHorizontal: Spacing.xl,
    marginRight: Spacing.xl,
  },
  
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.accent,
  },
  
  tabText: {
    fontSize: Typography.fontSize.base,
    color: '#999999',
    fontWeight: Typography.fontWeight.medium,
  },
  
  activeTabText: {
    color: Colors.accent,
  },
  
  // Property Grid
  propertyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xl,
    justifyContent: 'space-between',
  },
  
  propertyGridItem: {
    width: (width - 60) / 3,
    aspectRatio: 1,
    marginBottom: Spacing.sm + 2, // 10px
    borderRadius: Spacing.sm + 2, // 10px
    overflow: 'hidden',
  },
  
  propertyGridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  
  // Reviews
  reviewsContainer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing['4xl'],
    alignItems: 'center',
  },
  
  reviewsText: {
    fontSize: Typography.fontSize.base,
    color: '#999999',
  },
  
  // Bottom Navigation
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.background,
  },
  
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  
  // Content Container
  profileContent: {
    flex: 1,
    paddingTop: 85,
  },
  
  // Settings List
  settingsList: {
    paddingHorizontal: Spacing.xl,
  },
  
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  
  settingsItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  settingsItemIcon: {
    marginRight: Spacing.md,
  },
  
  settingsItemText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeight.medium,
  },
  
  settingsItemSubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
