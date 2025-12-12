import { apiService } from "./api";

export interface VehicleDetails {
  make: string;
  model: string;
  year: number;
  color?: string;
  mileage?: number;
  fuelType?: "petrol" | "diesel" | "electric" | "hybrid";
  transmission?: "manual" | "automatic";
  condition?: "new" | "used" | "certified";
  engineCapacity?: number;
  seatingCapacity?: number;
  registrationNumber?: string;
  insuranceExpiry?: string;
  features?: string[];
}

export interface VehicleLocation {
  city: string;
  state?: string;
  country: string;
  address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface VehiclePricing {
  salePrice?: number;
  rentPrice?: number;
  rentPeriod?: "daily" | "weekly" | "monthly";
  currency?: string;
  deposit?: number;
  negotiable?: boolean;
}

export interface CreateVehicleData {
  title: string;
  description: string;
  type: "car" | "motorcycle" | "truck" | "van" | "bus";
  listingType: "sale" | "rent";
  vehicleDetails: VehicleDetails;
  location: VehicleLocation;
  pricing: VehiclePricing;
  status?: string;
}

export interface Vehicle extends CreateVehicleData {
  _id?: string;
  id?: string;
  owner: string;
  media: {
    images: string[];
    videos: string[];
    documents: string[];
  };
  availability: {
    isAvailable: boolean;
    availableFrom?: string;
    availableTo?: string;
  };
  views: number;
  likes: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Create a new vehicle listing
 */
export const createVehicle = async (
  vehicleData: CreateVehicleData
): Promise<{ success: boolean; data: Vehicle; message: string }> => {
  try {
    console.log("🚗 Creating vehicle:", vehicleData);

    const response = await apiService.post<Vehicle>("/vehicles", vehicleData);

    console.log("✅ Vehicle created:", response);
    return {
      success: response.success,
      data: response.data as Vehicle,
      message: response.message || "Vehicle created successfully",
    };
  } catch (error: any) {
    console.error("❌ Error creating vehicle:", error);
    throw error;
  }
};

/**
 * Upload images for a vehicle
 */
export const uploadVehicleImages = async (
  vehicleId: string,
  images: { uri: string; name: string; type: string }[]
): Promise<{ success: boolean; data: any }> => {
  try {
    if (!vehicleId || vehicleId === "undefined" || vehicleId === "null") {
      throw new Error("Invalid vehicle ID");
    }

    console.log(`📤 uploadVehicleImages - Vehicle ID: ${vehicleId}`);
    console.log(`📤 Uploading ${images.length} images`);

    const formData = new FormData();

    images.forEach((image, index) => {
      formData.append("media", {
        uri: image.uri,
        name: image.name || `vehicle_image_${index}.jpg`,
        type: image.type || "image/jpeg",
      } as any);
    });

    const response = await apiService.post(
      `/vehicles/${vehicleId}/media`,
      formData,
      { "Content-Type": "multipart/form-data" }
    );

    console.log("✅ Images uploaded successfully");
    return {
      success: response.success,
      data: response.data || {},
    };
  } catch (error: any) {
    console.error("❌ Error uploading vehicle images:", error);
    throw error;
  }
};

/**
 * Get user's vehicles
 */
export const getUserVehicles = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<{
  success: boolean;
  data: Vehicle[];
  count: number;
  total: number;
  pages: number;
}> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);

    const response = await apiService.get<{
      data: Vehicle[];
      count: number;
      total: number;
      pages: number;
    }>(`/vehicles/my-vehicles?${queryParams.toString()}`);
    
    return {
      success: response.success,
      data: response.data?.data || [],
      count: response.data?.count || 0,
      total: response.data?.total || 0,
      pages: response.data?.pages || 0,
    };
  } catch (error: any) {
    console.error("❌ Error fetching user vehicles:", error);
    throw error;
  }
};

/**
 * Get vehicle by ID
 */
export const getVehicle = async (
  vehicleId: string
): Promise<{ success: boolean; data: Vehicle }> => {
  try {
    const response = await apiService.get<Vehicle>(`/vehicles/${vehicleId}`);
    return {
      success: response.success,
      data: response.data as Vehicle,
    };
  } catch (error: any) {
    console.error("❌ Error fetching vehicle:", error);
    throw error;
  }
};

/**
 * Search vehicles
 */
export const searchVehicles = async (filters?: {
  type?: string;
  make?: string;
  model?: string;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  fuelType?: string;
  transmission?: string;
  location?: string;
  keyword?: string;
  page?: number;
  limit?: number;
}): Promise<{
  success: boolean;
  data: Vehicle[];
  count: number;
  total: number;
  pages: number;
}> => {
  try {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await apiService.get<{
      data: Vehicle[];
      count: number;
      total: number;
      pages: number;
    }>(`/vehicles/search?${queryParams.toString()}`);
    
    return {
      success: response.success,
      data: response.data?.data || [],
      count: response.data?.count || 0,
      total: response.data?.total || 0,
      pages: response.data?.pages || 0,
    };
  } catch (error: any) {
    console.error("❌ Error searching vehicles:", error);
    throw error;
  }
};

/**
 * Update vehicle
 */
export const updateVehicle = async (
  vehicleId: string,
  vehicleData: Partial<CreateVehicleData>
): Promise<{ success: boolean; data: Vehicle }> => {
  try {
    const response = await apiService.put<Vehicle>(`/vehicles/${vehicleId}`, vehicleData);
    return {
      success: response.success,
      data: response.data as Vehicle,
    };
  } catch (error: any) {
    console.error("❌ Error updating vehicle:", error);
    throw error;
  }
};

/**
 * Delete vehicle
 */
export const deleteVehicle = async (
  vehicleId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiService.delete<{ message: string }>(`/vehicles/${vehicleId}`);
    return {
      success: response.success,
      message: response.message || "Vehicle deleted successfully",
    };
  } catch (error: any) {
    console.error("❌ Error deleting vehicle:", error);
    throw error;
  }
};
