import { StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from './GlobalStyles';

export const ButtonStyles = StyleSheet.create({
  // Primary Button Base
  primaryButton: {
    borderRadius: BorderRadius['3xl'],
    marginBottom: Spacing['2xl'], // Reduced from 3xl
    // Removed shadow
  },
  
  // Primary Button Gradient
  primaryButtonGradient: {
    paddingVertical: Spacing.lg + 2, // 18px
    paddingHorizontal: Spacing['2xl'],
    alignItems: 'center',
    borderRadius: BorderRadius['3xl'],
    minHeight: Spacing['6xl'], // 56px
    justifyContent: 'center',
  },
  
  // Primary Button Text
  primaryButtonText: {
    color: Colors.textWhite,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: Typography.letterSpacing.wide,
  },
  
  // Primary Button Disabled
  primaryButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  
  primaryButtonTextDisabled: {
    color: Colors.textLight,
  },
  
  // Secondary Button (Social Login)
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.base,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    // Removed shadow
  },
  
  // Secondary Button Text
  secondaryButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  
  // Social Button Icon
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: Spacing.md,
  },
  
  // Tab Container
  tabContainer: {
    flexDirection: 'row',
    marginBottom: Spacing['3xl'],
    backgroundColor: 'transparent', // Remove grey background
    borderRadius: BorderRadius['3xl'],
    padding: 0, // Remove padding since no background
    height: Spacing['6xl'], // 56px
  },
  
  // Tab Button
  tabButton: {
    flex: 1,
    paddingVertical: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius['2xl'] + 2, // 26px
    marginHorizontal: 2,
    height: 48,
  },
  
  // Active Tab Button
  activeTabButton: {
    // Removed shadow
  },
  
  // Active Tab Gradient
  activeTabGradient: {
    paddingVertical: 0,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius['2xl'] + 2, // 26px
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 48,
    // Removed shadow
  },
  
  // Tab Text
  tabText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
  },
  
  // Active Tab Text
  activeTabText: {
    color: Colors.textWhite,
    fontWeight: Typography.fontWeight.bold,
    fontSize: Typography.fontSize.base,
  },
});