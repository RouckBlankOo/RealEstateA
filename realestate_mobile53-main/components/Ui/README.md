# Reusable Button Components (TypeScript)

This project includes reusable button components built with TypeScript for consistent UI and type safety across the application.

## Components

### PrimaryButton

- **Purpose**: Main action buttons (e.g., Login, Sign Up, Submit)
- **Style**: Orange background with white text
- **File**: `components/Ui/PrimaryButton.tsx`

### SecondaryButton

- **Purpose**: Secondary actions and social login buttons
- **Style**: White background with border and dark text
- **File**: `components/Ui/SecondaryButton.tsx`

### CustomButton

- **Purpose**: Legacy purple button component
- **Style**: Purple background with white text
- **File**: `components/Ui/CustomButton.tsx`

## TypeScript Interfaces

### PrimaryButtonProps

```typescript
interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}
```

### SecondaryButtonProps

```typescript
interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  icon?: string;
}
```

### CustomButtonProps

```typescript
interface CustomButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}
```

## Usage Examples

### PrimaryButton

```typescript
import PrimaryButton from '../../components/Ui/PrimaryButton';

// Basic usage
<PrimaryButton
  title="Login"
  onPress={handleLogin}
/>

// With custom styling
<PrimaryButton
  title="Sign Up"
  onPress={handleSignUp}
  style={{ marginTop: 20 }}
  textStyle={{ fontSize: 18 }}
/>

// Disabled state
<PrimaryButton
  title="Submit"
  onPress={handleSubmit}
  disabled={!isFormValid}
/>
```

### SecondaryButton

```typescript
import SecondaryButton from '../../components/Ui/SecondaryButton';

// Basic usage
<SecondaryButton
  title="Cancel"
  onPress={handleCancel}
/>

// With icon (for social login)
<SecondaryButton
  title="Google"
  onPress={handleGoogleLogin}
  icon="🔍"
/>

<SecondaryButton
  title="Apple"
  onPress={handleAppleLogin}
  icon="🍎"
/>

// With custom styling
<SecondaryButton
  title="Skip"
  onPress={handleSkip}
  style={{ marginBottom: 10 }}
  textStyle={{ color: '#666' }}
/>
```

## Props

### PrimaryButton Props

| Prop      | Type     | Default  | Description          |
| --------- | -------- | -------- | -------------------- |
| title     | string   | required | Button text          |
| onPress   | function | required | Press handler        |
| style     | object   | {}       | Custom button styles |
| textStyle | object   | {}       | Custom text styles   |
| disabled  | boolean  | false    | Disable button       |

### SecondaryButton Props

| Prop      | Type     | Default   | Description                       |
| --------- | -------- | --------- | --------------------------------- |
| title     | string   | required  | Button text                       |
| onPress   | function | required  | Press handler                     |
| style     | object   | {}        | Custom button styles              |
| textStyle | object   | {}        | Custom text styles                |
| disabled  | boolean  | false     | Disable button                    |
| icon      | string   | undefined | Icon/emoji to display before text |

## Import Options

### Individual imports:

```typescript
import PrimaryButton from "../../components/Ui/PrimaryButton";
import SecondaryButton from "../../components/Ui/SecondaryButton";
```

### Using index file (recommended):

```typescript
import { PrimaryButton, SecondaryButton } from "../../components/Ui";
```

## Benefits

1. **Type Safety**: Full TypeScript support with proper interfaces
2. **Consistency**: All buttons follow the same design system
3. **Reusability**: Can be used across different screens
4. **Maintainability**: Easy to update button styles globally
5. **Flexibility**: Support for custom styling when needed
6. **Accessibility**: Built-in disabled states
7. **Documentation**: Clear usage examples and prop definitions
8. **IntelliSense**: Full IDE support with auto-completion and type checking
