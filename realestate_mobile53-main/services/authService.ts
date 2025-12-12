import { apiService, ApiResponse } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginPhoneRequest {
  phoneNumber: string;
  password: string;
}

export interface RegisterEmailRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  userType?: 'buyer' | 'seller';
}

export interface RegisterPhoneRequest {
  phoneNumber: string;
  email: string; // Required for verification when SMS is not available
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  userType?: 'buyer' | 'seller';
  interest?: 'property' | 'cars';
}

export interface VerifyOTPRequest {
  phoneNumber: string;
  otp: string;
}

export interface ForgotPasswordEmailRequest {
  email: string;
}

export interface ForgotPasswordPhoneRequest {
  phoneNumber: string;
}

export interface ResetPasswordEmailRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordPhoneRequest {
  phoneNumber: string;
  otp: string;
  password: string;
  confirmPassword: string;
}

export interface User {
  _id: string;
  email?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  userType: 'buyer' | 'seller';
  role?: string[];
  interest?: 'property' | 'cars';
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Storage Keys
const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
};

class AuthService {
  // Store authentication data
  private async storeAuthData(token: string, user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      apiService.setAuthToken(token);
    } catch (error) {
      console.error('Error storing auth data:', error);
      throw error;
    }
  }

  // Get stored token
  async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  }

  // Get stored user
  async getStoredUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  }

  // Initialize auth service (call on app start)
  async initializeAuth(): Promise<User | null> {
    try {
      const token = await this.getStoredToken();
      if (token) {
        apiService.setAuthToken(token);
        return await this.getStoredUser();
      }
      return null;
    } catch (error) {
      console.error('Error initializing auth:', error);
      return null;
    }
  }

  // Clear authentication data
  async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
      apiService.removeAuthToken();
    } catch (error) {
      console.error('Error clearing auth data:', error);
      throw error;
    }
  }

  // Email Registration
  async registerEmail(data: RegisterEmailRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/register-email', data);
      
      if (response.success && response.data) {
        await this.storeAuthData(response.data.token, response.data.user);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Phone Registration
  async registerPhone(data: RegisterPhoneRequest): Promise<ApiResponse<any>> {
    try {
      return await apiService.post('/auth/register-phone', data);
    } catch (error) {
      throw error;
    }
  }

  // Verify OTP for phone registration
  async verifyOTP(data: VerifyOTPRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/verify-otp', data);
      
      if (response.success && response.data) {
        await this.storeAuthData(response.data.token, response.data.user);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Resend OTP
  async resendOTP(phoneNumber: string): Promise<ApiResponse<any>> {
    try {
      return await apiService.post('/auth/resend-otp', { phoneNumber });
    } catch (error) {
      throw error;
    }
  }

  // Email Login
  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      console.log('🔄 AuthService: Sending login request to API...', { email: data.email });
      
      const response = await apiService.post<AuthResponse>('/auth/login', data);
      console.log('📡 AuthService: Got response from API:', response);
      
      if (response.success) {
        if (response.data && response.data.token) {
          // Standard format: { success: true, data: { user, token } }
          console.log('✅ AuthService: Login successful (standard format), storing auth data...');
          await this.storeAuthData(response.data.token, response.data.user);
          console.log('✅ AuthService: Auth data stored successfully');
        } else if (response.access_token) {
          // Your backend format: { success: true, access_token: "..." }
          console.log('✅ AuthService: Login successful (backend format), storing access token...');
          
          // IMPORTANT: Set token in API service first, then store to AsyncStorage
          apiService.setAuthToken(response.access_token);
          await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, response.access_token);
          
          // Store user data if available
          const backendResponse = response as any;
          if (backendResponse.user) {
            await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(backendResponse.user));
          }
          
          console.log('✅ AuthService: Access token stored and set in API headers successfully');
        }
      } else {
        console.error('❌ AuthService: Login failed - invalid response:', response);
      }
      
      return response;
    } catch (error) {
      console.error('❌ AuthService: Login error:', error);
      throw error;
    }
  }

  // Phone Login
  async loginPhone(data: LoginPhoneRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/login-phone', data);
      
      if (response.success && response.data) {
        await this.storeAuthData(response.data.token, response.data.user);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Forgot Password via Email
  async forgotPasswordEmail(data: ForgotPasswordEmailRequest): Promise<ApiResponse<any>> {
    try {
      return await apiService.post('/auth/forgot-password-email', data);
    } catch (error) {
      throw error;
    }
  }

  // Forgot Password via Phone
  async forgotPasswordPhone(data: ForgotPasswordPhoneRequest): Promise<ApiResponse<any>> {
    try {
      return await apiService.post('/auth/forgot-password-phone', data);
    } catch (error) {
      throw error;
    }
  }

  // Reset Password via Email
  async resetPasswordEmail(data: ResetPasswordEmailRequest): Promise<ApiResponse<any>> {
    try {
      return await apiService.post('/auth/reset-password-email', data);
    } catch (error) {
      throw error;
    }
  }

  // Reset Password via Phone
  async resetPasswordPhone(data: ResetPasswordPhoneRequest): Promise<ApiResponse<any>> {
    try {
      return await apiService.post('/auth/reset-password-phone', data);
    } catch (error) {
      throw error;
    }
  }

  // Logout
  async logout(): Promise<ApiResponse<any>> {
    try {
      const response = await apiService.post('/auth/logout');
      await this.clearAuthData();
      return response;
    } catch (error) {
      // Always clear local data even if API call fails
      // This ensures user can logout even with invalid/expired token
      await this.clearAuthData();
      console.log('Logout API failed, but local data cleared:', error);
      
      // Return success since local logout succeeded
      return {
        success: true,
        message: 'Logged out locally',
      };
    }
  }

  // Verify Email (for email verification links)
  async verifyEmail(token: string): Promise<ApiResponse<any>> {
    try {
      return await apiService.get(`/auth/email-verification?token=${token}`);
    } catch (error) {
      throw error;
    }
  }

  // Resend Email Verification
  async resendEmailVerification(email: string): Promise<ApiResponse<any>> {
    try {
      return await apiService.post('/auth/resend-email-verification', { email });
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;