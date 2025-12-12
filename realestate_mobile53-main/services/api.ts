// API Configuration and Base Setup

// API Configuration
export const API_CONFIG = {
  // For development - use your local IP address when testing on device
  // For emulator/simulator, you can use localhost
  BASE_URL: __DEV__ 
    ? 'http://192.168.100.4:3000/api' // Your current local IP address
    // ? 'http://localhost:3000/api' // iOS simulator
    // ? 'http://YOUR_LOCAL_IP:3000/api' // Physical device (replace YOUR_LOCAL_IP)
    : 'https://your-production-url.com/api', // Production URL
    
  TIMEOUT: 10000, // 10 seconds
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  token?: string;
  access_token?: string; // Support for your backend's token format
}

export interface ApiError {
  success: false;
  message: string;
  errors?: any;
}

// HTTP Methods
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Base API Class
class ApiService {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.defaultHeaders = API_CONFIG.HEADERS;
  }

  // Set custom timeout for specific requests
  setCustomTimeout(timeout: number) {
    this.timeout = timeout;
  }

  // Set authentication token
  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    console.log('🔑 API Service: Auth token set successfully');
  }

  // Remove authentication token
  removeAuthToken() {
    delete this.defaultHeaders['Authorization'];
    console.log('🔓 API Service: Auth token removed');
  }

  // Get current auth token (for debugging)
  getAuthToken(): string | undefined {
    return this.defaultHeaders['Authorization'];
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    method: HttpMethod = 'GET',
    data?: any,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      let headers = { ...this.defaultHeaders, ...customHeaders };

      const config: RequestInit = {
        method,
        headers,
      };

      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        // Check if data is FormData - don't stringify it and remove Content-Type header
        if (data instanceof FormData) {
          config.body = data as any;
          // Remove Content-Type header to let browser set it with boundary
          delete headers['Content-Type'];
          config.headers = headers;
        } else {
          config.body = JSON.stringify(data);
        }
      }

      console.log(`🌐 API Request: ${method} ${url}`, {
        data: data instanceof FormData ? 'FormData' : (data || 'none'),
        hasAuthToken: !!headers['Authorization'],
        authTokenPreview: headers['Authorization']?.substring(0, 20) + '...',
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const result = await response.json();

      console.log(`📡 API Response: ${method} ${url}`, result);

      if (!response.ok) {
        throw {
          success: false,
          message: result.message || 'Network request failed',
          status: response.status,
          ...result,
        };
      }

      return result;
    } catch (error: any) {
      // Don't log errors for logout endpoint (expected with expired tokens)
      if (endpoint !== '/auth/logout') {
        console.error(`❌ API Error: ${method} ${endpoint}`, error);
      }
      
      if (error.name === 'AbortError') {
        throw {
          success: false,
          message: 'Request timeout',
        };
      }

      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'GET', undefined, headers);
  }

  // POST request
  async post<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'POST', data, headers);
  }

  // PUT request
  async put<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PUT', data, headers);
  }

  // DELETE request
  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'DELETE', undefined, headers);
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PATCH', data, headers);
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;