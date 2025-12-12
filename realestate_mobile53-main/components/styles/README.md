# Reusable Styles System

## Overview

This project now uses a comprehensive reusable styles system that promotes consistency, maintainability, and scalability across the entire application. All styles are centralized and can be imported and used throughout the app.

## File Structure

```
components/
├── styles/
│   ├── index.ts           # Main export file
│   ├── GlobalStyles.ts    # Colors, typography, spacing, shadows
│   ├── FormStyles.ts      # Form inputs, labels, validation styles
│   ├── ButtonStyles.ts    # Button variants and states
│   ├── LayoutStyles.ts    # Screen layouts, containers, positioning
│   └── ProfileStyles.ts   # Profile screens, user info, stats, navigation
└── Ui/
    ├── PrimaryButton.tsx  # Uses ButtonStyles
    ├── SecondaryButton.tsx # Uses ButtonStyles
    └── index.ts           # Component exports
```

## How to Use

### 1. Import Styles

```typescript
import {
  Colors,
  FormStyles,
  ButtonStyles,
  LayoutStyles,
} from "../../components/styles";
```

### 2. Use in Components

```typescript
// Using predefined styles
<View style={LayoutStyles.screenContainer}>
  <TextInput style={FormStyles.textInput} />
  <Text style={FormStyles.inputLabel}>Email</Text>
</View>

// Combining with custom styles
<View style={[LayoutStyles.screenContainer, { paddingTop: 100 }]}>
  <TextInput
    style={[FormStyles.textInput, errors.email && FormStyles.inputError]}
  />
</View>
```

### 3. Use Colors and Typography

```typescript
// Using color constants
<Text style={{ color: Colors.primary }}>Welcome</Text>
<View style={{ backgroundColor: Colors.backgroundLight }}>

// Using typography
<Text style={{
  fontSize: Typography.fontSize.lg,
  fontWeight: Typography.fontWeight.bold,
  color: Colors.textPrimary
}}>
```

## Style Categories

### Colors (`Colors`)

- **Primary**: `primary`, `primaryLight`
- **Text**: `textPrimary`, `textSecondary`, `textLight`, `textWhite`
- **Background**: `background`, `backgroundLight`, `backgroundGray`
- **Status**: `error`, `success`, `warning`
- **Border**: `border`, `borderLight`

### Typography (`Typography`)

- **Font Sizes**: `fontSize.xs` to `fontSize['4xl']`
- **Font Weights**: `fontWeight.normal` to `fontWeight.bold`
- **Line Heights**: `lineHeight.tight`, `normal`, `relaxed`
- **Letter Spacing**: `letterSpacing.tight` to `letterSpacing.wider`

### Spacing (`Spacing`)

- **Scale**: `xs` (4px) to `7xl` (64px)
- **Usage**: `marginBottom: Spacing.xl`, `padding: Spacing.lg`

### Shadows (`Shadows`)

- **Variants**: `sm`, `base`, `lg`, `xl`, `primary`
- **Usage**: `...Shadows.primary` (spread operator)

### Border Radius (`BorderRadius`)

- **Scale**: `sm` (8px) to `full` (9999px)
- **Usage**: `borderRadius: BorderRadius.base`

## Style Objects

### FormStyles

- `formContainer` - Main form wrapper
- `inputContainer` - Individual input wrapper
- `textInput` - Standard text input
- `inputLabel` - Input field labels
- `passwordInputWrapper` - Password input with icon
- `inputError` - Error state styling
- `errorText` - Error message text
- `forgotPasswordContainer` - Forgot password link
- `separatorContainer` - "Or" separator line

### ButtonStyles

- `primaryButton` - Primary CTA button container
- `primaryButtonGradient` - Gradient overlay
- `primaryButtonText` - Primary button text
- `secondaryButton` - Social/secondary buttons
- `tabContainer` - Tab button container
- `tabButton` - Individual tab button
- `activeTabGradient` - Active tab gradient

### LayoutStyles

- `screenContainer` - Main screen wrapper
- `scrollContent` - ScrollView content
- `imageContainer` - Image positioning
- `apartmentImage` - Apartment image sizing
- `welcomeTitle` - Welcome text styling
- `keyboardAvoidingView` - Keyboard handling
- `cardContainer` - Card-style containers

### ProfileStyles

- `headerContainer` - Profile header with background
- `headerBackgroundImage` - Header background image
- `iconButton` - Circular icon buttons (back, more, etc.)
- `profileImageWrapper` - Profile image positioning
- `profileImageContainer` - Profile image with border
- `profileImage` - Actual profile image
- `profileName` - User name text
- `locationContainer` - Location with icon
- `statsContainer` - Statistics row
- `statItem` - Individual stat
- `outlineButton` - Outline button style
- `filledButton` - Filled button style
- `tabsContainer` - Tab navigation
- `propertyGrid` - Property grid layout
- `bottomNav` - Bottom navigation bar

## Best Practices

### ✅ Do's

```typescript
// Use predefined styles
<Text style={FormStyles.inputLabel}>

// Combine styles appropriately
<View style={[LayoutStyles.screenContainer, customStyles]}>

// Use color constants
backgroundColor: Colors.primary

// Use spacing scale
marginBottom: Spacing.xl
```

### ❌ Don'ts

```typescript
// Don't hardcode colors
color: "#F85B00"; // Use Colors.primary instead

// Don't hardcode spacing
marginBottom: 24; // Use Spacing['2xl'] instead

// Don't duplicate styles
const customInputStyle = {
  borderWidth: 1,
  borderRadius: 12,
}; // Use FormStyles.textInput instead
```

### Extending Styles

```typescript
// Create component-specific styles that extend base styles
const localStyles = StyleSheet.create({
  specialInput: {
    ...FormStyles.textInput,
    borderColor: Colors.warning, // Override specific property
  },
});
```

### Custom Components

```typescript
// Always use the design system
const CustomCard = ({ children }) => (
  <View style={[LayoutStyles.cardContainer, Shadows.base]}>{children}</View>
);
```

## Benefits

1. **Consistency** - All components use the same design tokens
2. **Maintainability** - Change colors/spacing in one place
3. **Scalability** - Easy to add new components
4. **Performance** - Styles are created once and reused
5. **Developer Experience** - IntelliSense and auto-completion
6. **Brand Management** - Centralized brand colors and typography

## Migration Guide

When converting existing components:

1. Import the style modules you need
2. Replace hardcoded values with design tokens
3. Use predefined style objects where possible
4. Remove old StyleSheet.create() blocks
5. Test component functionality

## Example: Before vs After

### Before (Hardcoded)

```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    flex: 1,
  },
  title: {
    fontSize: 28,
    color: "#F85B00",
    fontWeight: "700",
  },
});
```

### After (Design System)

```typescript
import { LayoutStyles, Colors, Typography } from '../components/styles';

// Use predefined styles
<View style={LayoutStyles.screenContainer}>
  <Text style={LayoutStyles.welcomeTitle}>
```

This system ensures your app maintains a consistent, professional appearance while being easy to maintain and extend.
