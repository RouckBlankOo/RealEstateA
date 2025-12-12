# Mobile App Chat Fixes

## Issues Found and Fixed

### 1. **Authentication Token Storage Key Mismatch** (CRITICAL)
**Problem:** 
- `authService.ts` stores the auth token under key `'auth_token'`
- `chatService.ts` was looking for token under key `'access_token'`
- This caused "No auth token found" error when initializing chat

**Fix:**
- Updated `chatService.ts` line 54 to use `'auth_token'` instead of `'access_token'`

### 2. **User Data Storage Key Mismatch**
**Problem:**
- `authService.ts` stores user data under key `'user_data'`
- `chat.tsx` was looking for user data under key `'user'`
- This could cause issues identifying the current user in chat

**Fix:**
- Updated `chat.tsx` line 47 to use `'user_data'` instead of `'user'`

### 3. **Hardcoded Backend URL for Images**
**Problem:**
- Image URLs in chat messages used hardcoded IP `http://192.168.100.4:3000`
- Makes the app fragile and difficult to configure for different environments

**Fix:**
- Exported `API_URL` from `chatService.ts`
- Updated `chat.tsx` to import and use `API_URL` for image rendering

## Files Modified
1. `/services/chatService.ts` - Fixed token key and exported API_URL
2. `/app/support/chat.tsx` - Fixed user data key and image URL

## Testing Recommendations
1. Login to the mobile app with valid credentials
2. Navigate to Support/Chat screen
3. Verify chat initializes without "No auth token found" error
4. Send a text message and verify it appears on support dashboard
5. Send an image and verify it displays correctly in chat
6. Have support agent reply and verify message appears in mobile app

## Related Backend Configuration
The mobile app expects:
- Backend URL: `http://192.168.100.4:3000`
- Socket.IO endpoint: same as backend URL
- Auth endpoints: `/api/auth/login`, `/api/auth/register-email`, etc.
- Message endpoints: `/api/messages/*`
