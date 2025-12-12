import { apiService, ApiResponse } from './api';

// User Types
export interface UserProfile {
  _id: string;
  email?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  userType: 'buyer' | 'seller';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  profileImage?: string;
  bio?: string;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  preferences?: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy: {
      showEmail: boolean;
      showPhone: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  preferences?: {
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
    privacy?: {
      showEmail?: boolean;
      showPhone?: boolean;
    };
  };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateEmailRequest {
  newEmail: string;
  password: string;
}

export interface UpdatePhoneRequest {
  newPhoneNumber: string;
  password: string;
}

class UserService {
  // Get current user profile
  async getUserProfile(): Promise<ApiResponse<UserProfile>> {
    try {
      return await apiService.get<UserProfile>('/user/profile');
    } catch (error) {
      throw error;
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<ApiResponse<UserProfile>> {
    try {
      return await apiService.get<UserProfile>(`/user/${userId}`);
    } catch (error) {
      throw error;
    }
  }

  // Update user profile
  async updateProfile(updates: UpdateUserProfileRequest): Promise<ApiResponse<UserProfile>> {
    try {
      return await apiService.put<UserProfile>('/user/profile', updates);
    } catch (error) {
      throw error;
    }
  }

  // Upload profile image
  async uploadProfileImage(imageFile: FormData): Promise<ApiResponse<{ profileImage: string }>> {
    try {
      const response = await fetch(`${apiService['baseURL']}/user/profile/image`, {
        method: 'POST',
        headers: {
          'Authorization': apiService['defaultHeaders']['Authorization'] || '',
        },
        body: imageFile,
      });

      const result = await response.json();

      if (!response.ok) {
        throw {
          success: false,
          message: result.message || 'Failed to upload profile image',
          status: response.status,
        };
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  // Delete profile image
  async deleteProfileImage(): Promise<ApiResponse<any>> {
    try {
      return await apiService.delete('/user/profile/image');
    } catch (error) {
      throw error;
    }
  }

  // Change password
  async changePassword(passwordData: ChangePasswordRequest): Promise<ApiResponse<any>> {
    try {
      return await apiService.put('/user/change-password', passwordData);
    } catch (error) {
      throw error;
    }
  }

  // Update email (requires verification)
  async updateEmail(emailData: UpdateEmailRequest): Promise<ApiResponse<any>> {
    try {
      return await apiService.put('/user/update-email', emailData);
    } catch (error) {
      throw error;
    }
  }

  // Update phone number (requires verification)
  async updatePhoneNumber(phoneData: UpdatePhoneRequest): Promise<ApiResponse<any>> {
    try {
      return await apiService.put('/user/update-phone', phoneData);
    } catch (error) {
      throw error;
    }
  }

  // Verify new email
  async verifyNewEmail(token: string): Promise<ApiResponse<any>> {
    try {
      return await apiService.get(`/user/verify-new-email?token=${token}`);
    } catch (error) {
      throw error;
    }
  }

  // Verify new phone number
  async verifyNewPhoneNumber(phoneNumber: string, otp: string): Promise<ApiResponse<any>> {
    try {
      return await apiService.post('/user/verify-new-phone', { phoneNumber, otp });
    } catch (error) {
      throw error;
    }
  }

  // Delete user account
  async deleteAccount(password: string): Promise<ApiResponse<any>> {
    try {
      return await apiService.delete('/user/account', {
        'Content-Type': 'application/json',
      });
    } catch (error) {
      throw error;
    }
  }

  // Get user statistics (for sellers)
  async getUserStatistics(): Promise<ApiResponse<{
    totalProperties: number;
    totalViews: number;
    totalInquiries: number;
    soldProperties: number;
    rentedProperties: number;
  }>> {
    try {
      return await apiService.get('/user/statistics');
    } catch (error) {
      throw error;
    }
  }

  // Get user activity log
  async getUserActivity(page?: number, limit?: number): Promise<ApiResponse<{
    activities: {
      _id: string;
      action: string;
      details: string;
      timestamp: string;
    }[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  }>> {
    try {
      const queryParams = new URLSearchParams();
      if (page) queryParams.append('page', page.toString());
      if (limit) queryParams.append('limit', limit.toString());
      
      const queryString = queryParams.toString();
      const endpoint = queryString ? `/user/activity?${queryString}` : '/user/activity';
      
      return await apiService.get(endpoint);
    } catch (error) {
      throw error;
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(preferences: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  }): Promise<ApiResponse<UserProfile>> {
    try {
      return await apiService.put('/user/notification-preferences', { notifications: preferences });
    } catch (error) {
      throw error;
    }
  }

  // Update privacy preferences
  async updatePrivacyPreferences(preferences: {
    showEmail?: boolean;
    showPhone?: boolean;
  }): Promise<ApiResponse<UserProfile>> {
    try {
      return await apiService.put('/user/privacy-preferences', { privacy: preferences });
    } catch (error) {
      throw error;
    }
  }

  // Block/Unblock user
  async blockUser(userId: string): Promise<ApiResponse<any>> {
    try {
      return await apiService.post(`/user/block/${userId}`);
    } catch (error) {
      throw error;
    }
  }

  async unblockUser(userId: string): Promise<ApiResponse<any>> {
    try {
      return await apiService.post(`/user/unblock/${userId}`);
    } catch (error) {
      throw error;
    }
  }

  // Report user
  async reportUser(userId: string, reason: string, details?: string): Promise<ApiResponse<any>> {
    try {
      return await apiService.post('/user/report', {
        reportedUserId: userId,
        reason,
        details,
      });
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const userService = new UserService();
export default userService;