import { StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from './GlobalStyles';

export const FormStyles = StyleSheet.create({
  // Form Container
  formContainer: {
    flex: 1,
  },
  
  // Input Container
  inputContainer: {
    marginBottom: Spacing.xl,
  },
  
  // Input Label
  inputLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    marginBottom: Spacing.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  
  // Text Input
  textInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    fontSize: Typography.fontSize.base,
    backgroundColor: Colors.background,
    color: Colors.textPrimary,
    ...Shadows.sm,
  },
  
  // Password Input Wrapper
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.background,
    ...Shadows.sm,
  },
  
  // Password Input
  passwordInput: {
    flex: 1,
    paddingVertical: Spacing.lg,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  
  // Input Error State
  inputError: {
    borderColor: Colors.error,
    borderWidth: 2,
  },
  
  // Error Text
  errorText: {
    color: Colors.error,
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  
  // Forgot Password
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: Spacing['3xl'],
    marginTop: Spacing.sm,
  },
  
  forgotPasswordText: {
    color: Colors.primary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  
  // Form Separator
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  
  separatorText: {
    marginHorizontal: Spacing.xl,
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
});