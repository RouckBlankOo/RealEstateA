# Phone Registration with Email Verification

## Overview

Since SMS functionality (Twilio) is not configured, phone-based registration now uses email verification instead of SMS OTP.

## Updated Registration Flow

### Phone Registration Process:

1. **User submits phone registration** with:

   - `phoneNumber`: User's phone number
   - `email`: User's email address (required for verification)
   - `password`: User's password
   - `confirmPassword`: Password confirmation

2. **Backend response**:

   - Creates user account with both phone and email
   - Sends verification email (instead of SMS)
   - Returns success message asking user to check email

3. **Email verification**:
   - User clicks verification link in email
   - Account becomes verified (both email and phone are marked as verified)
   - User can then log in

## API Changes

### POST /api/auth/register-phone

**Updated Request Body:**

```json
{
  "phoneNumber": "+1234567890",
  "email": "user@example.com", // ← Now required
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Registration successful! A verification link has been sent to user@example.com. Please check your email to verify your account.",
  "user": {
    "phoneVerified": false,
    "emailVerified": false,
    "_id": "user_id"
  }
}
```

### Email Verification

Use the existing email verification endpoint:

- **GET** `/api/auth/email-verification?token={verification_token}`

## Frontend Updates Needed

Update the phone registration form to include an email field:

```tsx
// In your phone registration component
const [formData, setFormData] = useState({
  phoneNumber: "",
  email: "", // ← Add this field
  password: "",
  confirmPassword: "",
});
```

## Benefits of This Approach

1. ✅ **No SMS costs** - Uses free email verification
2. ✅ **Consistent UX** - Same verification flow as email registration
3. ✅ **Reliable delivery** - Email is more reliable than SMS
4. ✅ **Better security** - Email verification links are more secure than SMS codes
5. ✅ **Existing infrastructure** - Uses already configured SendGrid

## Note for Production

When you're ready to implement SMS functionality:

1. Configure Twilio credentials in `.env`
2. The code will automatically switch to SMS-based verification
3. Email field becomes optional for phone registration
