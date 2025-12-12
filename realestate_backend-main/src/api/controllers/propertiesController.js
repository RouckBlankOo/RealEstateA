const Property = require("../models/propertyModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Constants
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

const MESSAGES = {
  PROPERTY_CREATED: "Property created successfully",
  PROPERTY_UPDATED: "Property updated successfully",
  PROPERTY_DELETED: "Property deleted successfully",
  PROPERTY_NOT_FOUND: "Property not found",
  PROPERTY_LIKED: "Property liked successfully",
  PROPERTY_UNLIKED: "Property unliked successfully",
  MEDIA_ADDED: "Media added successfully",
  MEDIA_REMOVED: "Media removed successfully",
  AVAILABILITY_UPDATED: "Availability updated successfully",
  UNAUTHORIZED_ACTION: "You are not authorized to perform this action",
  MEDIA_NOT_FOUND: "Media not found",
  ALREADY_LIKED: "Property already liked",
  NOT_LIKED: "Property not liked by user",
  INVALID_LISTING_TYPE: "Invalid listing type for pricing",
  INVALID_COORDINATES: "Invalid coordinates provided",
  INVALID_PROPERTY_TYPE: "Invalid property type",
  INVALID_LISTING_TYPE_VALUE: "Invalid listing type",
  INVALID_AREA_UNIT: "Invalid area unit",
  INVALID_FURNISHING: "Invalid furnishing type",
  INVALID_RENT_PERIOD: "Invalid rent period",
  INVALID_CURRENCY: "Invalid currency",
  INVALID_STATUS: "Invalid status",
  INVALID_DATE_RANGE: "Available from date must be before available to date",
};

const MAX_MEDIA_FILES = 20;

// Valid enum values based on the model
const VALID_PROPERTY_TYPES = ['apartment', 'house', 'commercial', 'land', 'office'];
const VALID_LISTING_TYPES = ['sale', 'rent'];
const VALID_AREA_UNITS = ['sqft', 'sqm'];
const VALID_FURNISHING = ['furnished', 'semi-furnished', 'unfurnished'];
const VALID_RENT_PERIODS = ['daily', 'weekly', 'monthly', 'yearly'];
const VALID_STATUS = ['active', 'inactive', 'sold', 'rented', 'pending'];

// Custom Error Class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Async wrapper
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Form Data Parser Middleware
const parseFormData = (req, res, next) => {
  try {
    // Parse JSON strings in form-data
    const fieldsToParseAsJSON = [
      'location', 
      'propertyDetails', 
      'pricing', 
      'availability', 
      'features', 
      'rules'
    ];
    
    fieldsToParseAsJSON.forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        try {
          req.body[field] = JSON.parse(req.body[field]);
          console.log(`Successfully parsed ${field}:`, req.body[field]);
        } catch (parseError) {
          console.warn(`Failed to parse ${field} as JSON:`, req.body[field]);
          // If parsing fails, leave as string - validation will catch it
        }
      }
    });
    
    // Handle array fields that might come as strings or JSON arrays
    const arrayFields = ['features', 'rules'];
    arrayFields.forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        try {
          // Try to parse as JSON array first
          const parsed = JSON.parse(req.body[field]);
          if (Array.isArray(parsed)) {
            req.body[field] = parsed;
          } else {
            // If it's a single value, make it an array
            req.body[field] = [parsed];
          }
        } catch (e) {
          // If not JSON, split by comma and clean up
          req.body[field] = req.body[field]
            .split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0);
        }
      }
    });
    
    console.log('Final parsed request body:', JSON.stringify(req.body, null, 2));
    next();
  } catch (error) {
    console.error('Error parsing form data:', error);
    next(error);
  }
};

// Helper Functions
// Helper Functions
// Validate MongoDB ObjectId
const validateObjectId = (id, fieldName = 'ID') => {
  if (!id || id === 'undefined' || id === 'null') {
    throw new AppError(`${fieldName} is required`, HTTP_STATUS.BAD_REQUEST);
  }
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${fieldName} format`, HTTP_STATUS.BAD_REQUEST);
  }
  
  return true;
};

const findPropertyById = async (id) => {
  // Validate ObjectId before querying
  validateObjectId(id, 'Property ID');
  
  const property = await Property.findById(id).populate("owner", "name email avatar phone");
  if (!property) {
    throw new AppError(MESSAGES.PROPERTY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }
  return property;
};

const checkPropertyOwnership = (property, userId) => {
  if (property.owner._id.toString() !== userId.toString()) {
    throw new AppError(MESSAGES.UNAUTHORIZED_ACTION, HTTP_STATUS.FORBIDDEN);
  }
};

const formatPropertyResponse = (property) => {
  // Helper function to convert relative paths to full URLs
  const toFullUrl = (path) => {
    if (!path) return path;
    if (path.startsWith('http')) return path; // Already a full URL
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `http://192.168.100.4:3000/${cleanPath}`;
  };

  // Convert media paths to full URLs
  const media = property.media ? {
    images: property.media.images?.map(toFullUrl) || [],
    videos: property.media.videos?.map(toFullUrl) || [],
    documents: property.media.documents?.map(toFullUrl) || [],
    virtualTour: toFullUrl(property.media.virtualTour)
  } : undefined;

  return {
    id: property._id,
    owner: property.owner,
    title: property.title,
    description: property.description,
    type: property.type,
    listingType: property.listingType,
    propertyDetails: property.propertyDetails,
    location: property.location,
    pricing: property.pricing,
    media: media,
    availability: property.availability,
    features: property.features,
    rules: property.rules,
    status: property.status,
    views: property.views,
    likes: property.likes?.length || 0,
    isPromoted: property.isPromoted,
    promotionExpiry: property.promotionExpiry,
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
  };
};

// Enhanced media processing helper
const processUploadedMedia = (files) => {
  const mediaData = {
    images: [],
    videos: [],
    documents: [],
    virtualTour: null
  };

  if (!files || Object.keys(files).length === 0) return mediaData;

  try {
    // Process each media type
    ['images', 'videos', 'documents'].forEach(type => {
      if (files[type] && Array.isArray(files[type])) {
        mediaData[type] = files[type].map(file => {
          // Create relative path for database storage
          const relativePath = `/uploads/properties/${type}/${file.filename}`;
          console.log(`Processed ${type}: ${relativePath}`);
          return relativePath;
        });
      }
    });

    // Handle virtualTour separately (single file)
    if (files.virtualTour && files.virtualTour[0]) {
      mediaData.virtualTour = `/uploads/properties/virtualTour/${files.virtualTour[0].filename}`;
      console.log(`Processed virtualTour: ${mediaData.virtualTour}`);
    }

    console.log('Final processed media data:', mediaData);
    return mediaData;
  } catch (error) {
    console.error('Error processing uploaded media:', error);
    throw new AppError('Error processing uploaded media files', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

// Enhanced file cleanup helper
const cleanupUploadedFiles = (files) => {
  if (!files || typeof files !== 'object') return;
  
  try {
    Object.values(files).flat().forEach(file => {
      if (file && file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
        console.log(`Cleaned up file: ${file.path}`);
      }
    });
  } catch (error) {
    console.error('Error cleaning up files:', error);
  }
};

// Enhanced file deletion helper
const deleteMediaFile = (mediaUrl, mediaType) => {
  if (!mediaUrl) return false;
  
  try {
    const filename = mediaUrl.split('/').pop();
    const filePath = path.join(__dirname, `../uploads/properties/${mediaType}`, filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted media file: ${filePath}`);
      return true;
    } else {
      console.log(`File not found for deletion: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`Error deleting media file ${mediaUrl}:`, error);
    return false;
  }
};

// Validation helpers
const validateEnumFields = (data) => {
  const { type, listingType, propertyDetails, pricing, status } = data;
  
  if (type && !VALID_PROPERTY_TYPES.includes(type)) {
    throw new AppError(MESSAGES.INVALID_PROPERTY_TYPE, HTTP_STATUS.BAD_REQUEST);
  }
  
  if (listingType && !VALID_LISTING_TYPES.includes(listingType)) {
    throw new AppError(MESSAGES.INVALID_LISTING_TYPE_VALUE, HTTP_STATUS.BAD_REQUEST);
  }
  
  if (propertyDetails?.areaUnit && !VALID_AREA_UNITS.includes(propertyDetails.areaUnit)) {
    throw new AppError(MESSAGES.INVALID_AREA_UNIT, HTTP_STATUS.BAD_REQUEST);
  }
  
  if (propertyDetails?.furnishing && !VALID_FURNISHING.includes(propertyDetails.furnishing)) {
    throw new AppError(MESSAGES.INVALID_FURNISHING, HTTP_STATUS.BAD_REQUEST);
  }
  
  if (pricing?.rentPeriod && !VALID_RENT_PERIODS.includes(pricing.rentPeriod)) {
    throw new AppError(MESSAGES.INVALID_RENT_PERIOD, HTTP_STATUS.BAD_REQUEST);
  }
  
  if (status && !VALID_STATUS.includes(status)) {
    throw new AppError(MESSAGES.INVALID_STATUS, HTTP_STATUS.BAD_REQUEST);
  }
};

const validateNumericFields = (data) => {
  const { propertyDetails, pricing } = data;
  
  // Validate propertyDetails numeric fields
  if (propertyDetails) {
    const numericFields = ['bedrooms', 'bathrooms', 'area', 'parking', 'age'];
    numericFields.forEach(field => {
      if (propertyDetails[field] !== undefined && propertyDetails[field] < 0) {
        throw new AppError(`${field} cannot be negative`, HTTP_STATUS.BAD_REQUEST);
      }
    });
  }
  
  // Validate pricing numeric fields
  if (pricing) {
    const pricingFields = ['salePrice', 'rentPrice', 'deposit', 'maintenanceCharges'];
    pricingFields.forEach(field => {
      if (pricing[field] !== undefined && pricing[field] < 0) {
        throw new AppError(`${field} cannot be negative`, HTTP_STATUS.BAD_REQUEST);
      }
    });
  }
};

const validatePricingConsistency = (listingType, pricing) => {
  if (listingType === 'sale' && !pricing.salePrice) {
    throw new AppError("Sale price is required for sale listings", HTTP_STATUS.BAD_REQUEST);
  }
  if (listingType === 'rent' && !pricing.rentPrice) {
    throw new AppError("Rent price is required for rental listings", HTTP_STATUS.BAD_REQUEST);
  }
  if (listingType === 'rent' && pricing.rentPrice && !pricing.rentPeriod) {
    throw new AppError("Rent period is required for rental listings", HTTP_STATUS.BAD_REQUEST);
  }
};

const validateCoordinates = (coordinates) => {
  if (coordinates) {
    const { latitude, longitude } = coordinates;
    if (latitude !== undefined && (latitude < -90 || latitude > 90)) {
      throw new AppError("Latitude must be between -90 and 90", HTTP_STATUS.BAD_REQUEST);
    }
    if (longitude !== undefined && (longitude < -180 || longitude > 180)) {
      throw new AppError("Longitude must be between -180 and 180", HTTP_STATUS.BAD_REQUEST);
    }
  }
};

const validateRequiredFields = (data) => {
  const { title, description, type, listingType, location } = data;
  
  if (!title || !description || !type || !listingType) {
    throw new AppError(
      "Missing required fields: title, description, type, and listingType are required",
      HTTP_STATUS.BAD_REQUEST
    );
  }
  
  if (!location || !location.address || !location.city || !location.country) {
    throw new AppError(
      "Address, city, and country are required in location",
      HTTP_STATUS.BAD_REQUEST
    );
  }
};

const validateAvailabilityDates = (availability) => {
  if (availability?.availableFrom && availability?.availableTo) {
    if (new Date(availability.availableFrom) >= new Date(availability.availableTo)) {
      throw new AppError(MESSAGES.INVALID_DATE_RANGE, HTTP_STATUS.BAD_REQUEST);
    }
  }
};

const incrementPropertyViews = async (propertyId) => {
  await Property.findByIdAndUpdate(propertyId, { $inc: { views: 1 } });
};

// Enhanced media count validation
const validateMediaLimits = (currentMedia, newMedia) => {
  const currentCount = 
    (currentMedia.images?.length || 0) +
    (currentMedia.videos?.length || 0) +
    (currentMedia.documents?.length || 0);
  
  const newCount = 
    (newMedia.images?.length || 0) + 
    (newMedia.videos?.length || 0) + 
    (newMedia.documents?.length || 0);

  if (currentCount + newCount > MAX_MEDIA_FILES) {
    throw new AppError(
      `Maximum ${MAX_MEDIA_FILES} media files allowed. Current: ${currentCount}, Attempting to add: ${newCount}`, 
      HTTP_STATUS.BAD_REQUEST
    );
  }
  
  return { currentCount, newCount, totalAfter: currentCount + newCount };
};

// Property CRUD Operations
const createProperty = catchAsync(async (req, res) => {
  try {
    console.log('Raw request body before parsing:', req.body);
    console.log('Creating property with files:', req.files ? Object.keys(req.files) : 'none');
    
    const {
      title,
      description,
      type,
      listingType,
      propertyDetails,
      location,
      pricing,
      availability,
      features,
      rules
    } = req.body;

    // Validate required fields
    validateRequiredFields(req.body);
    
    // Validate enum fields
    validateEnumFields(req.body);
    
    // Validate numeric fields
    validateNumericFields(req.body);
    
    // Validate coordinates
    validateCoordinates(location?.coordinates);
    
    // Validate pricing consistency
    validatePricingConsistency(listingType, pricing || {});
    
    // Validate availability dates
    validateAvailabilityDates(availability);

    // Process uploaded media
    const mediaData = processUploadedMedia(req.files);
    
    // Check media limits for new property
    const totalMediaCount = 
      mediaData.images.length + 
      mediaData.videos.length + 
      mediaData.documents.length;

    if (totalMediaCount > MAX_MEDIA_FILES) {
      // Cleanup uploaded files
      cleanupUploadedFiles(req.files);
      throw new AppError(
        `Maximum ${MAX_MEDIA_FILES} media files allowed`, 
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const propertyData = {
      owner: req.user.id,
      title: title.trim(),
      description: description.trim(),
      type,
      listingType,
      propertyDetails: propertyDetails || {},
      location,
      pricing: pricing || {},
      availability: {
        isAvailable: true,
        ...availability
      },
      features: features || [],
      rules: rules || [],
      media: mediaData,
      likes: [],
      views: 0,
      status: 'active'
    };

    console.log('Creating property with media:', mediaData);
    const property = await Property.create(propertyData);
    await property.populate("owner", "name email avatar phone");

    // Add property to user's propertyListings array
    try {
      await User.findByIdAndUpdate(
        req.user.id,
        { $addToSet: { propertyListings: property._id } },
        { new: true }
      );
      console.log(`✅ Added property ${property._id} to user ${req.user.id} propertyListings`);
    } catch (error) {
      console.error('⚠️ Failed to add property to user propertyListings:', error);
      // Don't fail the request, just log the error
    }

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: MESSAGES.PROPERTY_CREATED,
      data: formatPropertyResponse(property),
    });
  } catch (error) {
    // Cleanup files on error
    console.error('Error creating property:', error);
    cleanupUploadedFiles(req.files);
    throw error;
  }
});

const getProperty = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const property = await findPropertyById(id);
  incrementPropertyViews(id).catch(console.error);
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: formatPropertyResponse(property),
  });
});

const updateProperty = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log('Updating property with files:', req.files ? Object.keys(req.files) : 'none');
    
    const property = await findPropertyById(id);
    checkPropertyOwnership(property, req.user.id);
    
    // Validate enum fields for update data
    validateEnumFields(updateData);
    
    // Validate numeric fields for update data
    validateNumericFields(updateData);
    
    // Validate coordinates if being updated
    if (updateData.location?.coordinates) {
      validateCoordinates(updateData.location.coordinates);
    }
    
    // Validate availability dates if being updated
    if (updateData.availability) {
      const mergedAvailability = { ...property.availability.toObject(), ...updateData.availability };
      validateAvailabilityDates(mergedAvailability);
    }
    
    // Check pricing consistency
    const newListingType = updateData.listingType || property.listingType;
    const newPricing = { ...property.pricing.toObject(), ...updateData.pricing };
    validatePricingConsistency(newListingType, newPricing);
    
    // Trim title if provided
    if (updateData.title) {
      updateData.title = updateData.title.trim();
    }

    // Process uploaded media if any
    if (req.files && Object.keys(req.files).length > 0) {
      const newMediaData = processUploadedMedia(req.files);
      
      // Validate media limits
      try {
        validateMediaLimits(property.media, newMediaData);
      } catch (error) {
        cleanupUploadedFiles(req.files);
        throw error;
      }

      // Merge media data using MongoDB $push operations
      const mediaUpdates = {};
      
      if (newMediaData.images.length > 0) {
        mediaUpdates['media.images'] = { $each: newMediaData.images };
      }
      if (newMediaData.videos.length > 0) {
        mediaUpdates['media.videos'] = { $each: newMediaData.videos };
      }
      if (newMediaData.documents.length > 0) {
        mediaUpdates['media.documents'] = { $each: newMediaData.documents };
      }

      // Add media to update data
      if (Object.keys(mediaUpdates).length > 0) {
        updateData.$push = mediaUpdates;
      }
      
      // Handle virtualTour separately (replace, not push)
      if (newMediaData.virtualTour) {
        // Delete old virtualTour file if exists
        if (property.media.virtualTour) {
          deleteMediaFile(property.media.virtualTour, 'virtualTour');
        }
        updateData['media.virtualTour'] = newMediaData.virtualTour;
      }
    }
    
    const updatedProperty = await Property.findByIdAndUpdate(
      id,
      { 
        ...updateData,
        updatedAt: new Date()
      },
      { 
        new: true, 
        runValidators: true,
        context: 'query'
      }
    ).populate("owner", "name email avatar phone");
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.PROPERTY_UPDATED,
      data: formatPropertyResponse(updatedProperty),
    });
  } catch (error) {
    // Cleanup files on error
    console.error('Error updating property:', error);
    cleanupUploadedFiles(req.files);
    throw error;
  }
});

const deleteProperty = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const property = await findPropertyById(id);
  checkPropertyOwnership(property, req.user.id);
  
  // Delete associated media files
  const mediaTypes = ['images', 'videos', 'documents'];
  mediaTypes.forEach(type => {
    if (property.media[type] && Array.isArray(property.media[type])) {
      property.media[type].forEach(fileUrl => {
        deleteMediaFile(fileUrl, type);
      });
    }
  });
  
  // Handle virtualTour deletion
  if (property.media.virtualTour) {
    deleteMediaFile(property.media.virtualTour, 'virtualTour');
  }
  
  await Property.findByIdAndDelete(id);
  
  // Remove property from user's propertyListings array
  try {
    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { propertyListings: id } },
      { new: true }
    );
    console.log(`✅ Removed property ${id} from user ${req.user.id} propertyListings`);
  } catch (error) {
    console.error('⚠️ Failed to remove property from user propertyListings:', error);
    // Don't fail the request, just log the error
  }
  
  res.status(HTTP_STATUS.NO_CONTENT).json({
    success: true,
    message: MESSAGES.PROPERTY_DELETED,
  });
});

// Enhanced Media Management
const uploadMedia = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  // Validate property ID first
  try {
    validateObjectId(id, 'Property ID');
  } catch (error) {
    // Clean up any uploaded files before returning error
    if (req.files) {
      cleanupUploadedFiles(req.files);
    }
    throw error;
  }
  
  console.log('Uploading media for property:', id);
  console.log('Files received:', req.files ? Object.keys(req.files) : 'none');
  
  const property = await findPropertyById(id);
  checkPropertyOwnership(property, req.user.id);

  // Process uploaded files
  const mediaData = processUploadedMedia(req.files);
  
  // Validate media limits
  try {
    const limits = validateMediaLimits(property.media, mediaData);
    console.log('Media limits validation passed:', limits);
  } catch (error) {
    cleanupUploadedFiles(req.files);
    throw error;
  }

  // Build update query
  const updateOperations = {};
  
  // Use $push with $each for arrays
  if (mediaData.images.length > 0 || mediaData.videos.length > 0 || mediaData.documents.length > 0) {
    updateOperations.$push = {};
    
    if (mediaData.images.length > 0) {
      updateOperations.$push['media.images'] = { $each: mediaData.images };
    }
    if (mediaData.videos.length > 0) {
      updateOperations.$push['media.videos'] = { $each: mediaData.videos };
    }
    if (mediaData.documents.length > 0) {
      updateOperations.$push['media.documents'] = { $each: mediaData.documents };
    }
  }

  // Use $set for virtualTour (single file replacement)
  if (mediaData.virtualTour) {
    // Delete old virtualTour file if exists
    if (property.media.virtualTour) {
      deleteMediaFile(property.media.virtualTour, 'virtualTour');
    }
    
    if (!updateOperations.$set) {
      updateOperations.$set = {};
    }
    updateOperations.$set['media.virtualTour'] = mediaData.virtualTour;
  }

  console.log('Update operations:', JSON.stringify(updateOperations, null, 2));

  const updatedProperty = await Property.findByIdAndUpdate(
    id,
    updateOperations,
    { new: true, runValidators: true }
  ).populate("owner", "name email avatar phone");

  // Return media URLs
  const uploadedUrls = {
    images: mediaData.images,
    videos: mediaData.videos,
    documents: mediaData.documents,
    virtualTour: mediaData.virtualTour
  };

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: MESSAGES.MEDIA_ADDED,
    data: {
      property: formatPropertyResponse(updatedProperty),
      uploadedMedia: uploadedUrls
    },
  });
});

const deleteMedia = catchAsync(async (req, res) => {
  const { id, mediaId } = req.params;
  const { mediaType = 'images' } = req.query;
  
  console.log(`Deleting media: propertyId=${id}, mediaId=${mediaId}, type=${mediaType}`);
  
  const property = await findPropertyById(id);
  checkPropertyOwnership(property, req.user.id);
  
  let mediaToRemove;
  let updateOperation = {};
  
  // Find and remove media from property
  if (mediaType === 'virtualTour') {
    mediaToRemove = property.media.virtualTour;
    if (!mediaToRemove || !mediaToRemove.includes(mediaId)) {
      throw new AppError(MESSAGES.MEDIA_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    // Use $unset to remove virtualTour field
    updateOperation = { $unset: { 'media.virtualTour': "" } };
  } else {
    // Handle array-based media (images, videos, documents)
    const mediaArray = property.media[mediaType] || [];
    mediaToRemove = mediaArray.find(url => url.includes(mediaId));
    
    if (!mediaToRemove) {
      throw new AppError(MESSAGES.MEDIA_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    
    // Use $pull to remove from array
    updateOperation = { $pull: { [`media.${mediaType}`]: mediaToRemove } };
  }

  // Delete from file storage
  const deleteSuccess = deleteMediaFile(mediaToRemove, mediaType);
  
  if (!deleteSuccess) {
    console.warn(`File not found in storage: ${mediaToRemove}`);
  }

  // Update database
  await Property.findByIdAndUpdate(id, updateOperation);
  
  // Return success response
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: MESSAGES.MEDIA_REMOVED,
    data: {
      removedMedia: {
        type: mediaType,
        url: mediaToRemove,
        fileDeleted: deleteSuccess
      }
    }
  });
});

// Keep existing methods (addMedia and removeMedia for backward compatibility)
const addMedia = uploadMedia;
const removeMedia = deleteMedia;

// Property Interactions
const likeProperty = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  const property = await findPropertyById(id);
  
  if (property.likes.includes(userId)) {
    throw new AppError(MESSAGES.ALREADY_LIKED, HTTP_STATUS.CONFLICT);
  }
  
  property.likes.push(userId);
  await property.save();
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: MESSAGES.PROPERTY_LIKED,
    data: {
      likes: property.likes.length,
    },
  });
});

const unlikeProperty = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  const property = await findPropertyById(id);
  
  if (!property.likes.includes(userId)) {
    throw new AppError(MESSAGES.NOT_LIKED, HTTP_STATUS.BAD_REQUEST);
  }
  
  property.likes.pull(userId);
  await property.save();
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: MESSAGES.PROPERTY_UNLIKED,
    data: {
      likes: property.likes.length,
    },
  });
});

// Search and Filter
const searchProperties = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    type,
    listingType,
    city,
    state,
    country,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    minArea,
    maxArea,
    status = 'active',
    amenities,
    features,
    furnishing,
    areaUnit,
    ...otherFilters
  } = req.query;
  
  const searchQuery = { status };
  
  // Basic filters
  if (type) searchQuery.type = type;
  if (listingType) searchQuery.listingType = listingType;
  
  // Location filters
  if (city) searchQuery['location.city'] = new RegExp(city, 'i');
  if (state) searchQuery['location.state'] = new RegExp(state, 'i');
  if (country) searchQuery['location.country'] = new RegExp(country, 'i');
  
  // Price filters
  if (listingType === 'sale' && (minPrice || maxPrice)) {
    searchQuery['pricing.salePrice'] = {};
    if (minPrice) searchQuery['pricing.salePrice'].$gte = parseInt(minPrice);
    if (maxPrice) searchQuery['pricing.salePrice'].$lte = parseInt(maxPrice);
  }
  
  if (listingType === 'rent' && (minPrice || maxPrice)) {
    searchQuery['pricing.rentPrice'] = {};
    if (minPrice) searchQuery['pricing.rentPrice'].$gte = parseInt(minPrice);
    if (maxPrice) searchQuery['pricing.rentPrice'].$lte = parseInt(maxPrice);
  }
  
  // Property detail filters
  if (bedrooms) searchQuery['propertyDetails.bedrooms'] = { $gte: parseInt(bedrooms) };
  if (bathrooms) searchQuery['propertyDetails.bathrooms'] = { $gte: parseInt(bathrooms) };
  if (furnishing) searchQuery['propertyDetails.furnishing'] = furnishing;
  if (areaUnit) searchQuery['propertyDetails.areaUnit'] = areaUnit;
  
  // Area filters
  if (minArea || maxArea) {
    searchQuery['propertyDetails.area'] = {};
    if (minArea) searchQuery['propertyDetails.area'].$gte = parseInt(minArea);
    if (maxArea) searchQuery['propertyDetails.area'].$lte = parseInt(maxArea);
  }
  
  // Array filters
  if (amenities) {
    const amenitiesArray = Array.isArray(amenities) ? amenities : [amenities];
    searchQuery['propertyDetails.amenities'] = { $in: amenitiesArray };
  }
  
  if (features) {
    const featuresArray = Array.isArray(features) ? features : [features];
    searchQuery.features = { $in: featuresArray };
  }
  
  // Text search
  if (otherFilters.search) {
    searchQuery.$or = [
      { title: new RegExp(otherFilters.search, 'i') },
      { description: new RegExp(otherFilters.search, 'i') },
      { 'location.address': new RegExp(otherFilters.search, 'i') },
      { 'location.landmark': new RegExp(otherFilters.search, 'i') }
    ];
  }
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [properties, total] = await Promise.all([
    Property.find(searchQuery)
      .populate("owner", "name email avatar phone")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    Property.countDocuments(searchQuery),
  ]);
  
  const formattedProperties = properties.map(formatPropertyResponse);
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      properties: formattedProperties,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProperties: total,
        hasNextPage: skip + properties.length < total,
        hasPrevPage: parseInt(page) > 1,
      },
      filters: {
        type,
        listingType,
        city,
        status,
        appliedFilters: Object.keys(req.query).length - 3
      }
    },
  });
});

// Availability Management
const updateAvailability = catchAsync(async (req, res) => {
  const { id } = req.params;
  const availabilityUpdates = req.body;
  
  const property = await findPropertyById(id);
  checkPropertyOwnership(property, req.user.id);
  
  // Merge with existing availability and validate
  const mergedAvailability = { ...property.availability.toObject(), ...availabilityUpdates };
  validateAvailabilityDates(mergedAvailability);
  
  const updatedProperty = await Property.findByIdAndUpdate(
    id,
    { 
      $set: {
        'availability': mergedAvailability
      }
    },
    { new: true, runValidators: true }
  ).populate("owner", "name email avatar phone");
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: MESSAGES.AVAILABILITY_UPDATED,
    data: {
      availability: updatedProperty.availability,
    },
  });
});

// Bulk Media Operations
const bulkDeleteMedia = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { mediaItems } = req.body; // Array of { type, url } objects
  
  if (!mediaItems || !Array.isArray(mediaItems) || mediaItems.length === 0) {
    throw new AppError("Media items array is required", HTTP_STATUS.BAD_REQUEST);
  }
  
  const property = await findPropertyById(id);
  checkPropertyOwnership(property, req.user.id);
  
  const deletedItems = [];
  const failedItems = [];
  
  // Process each media item
  for (const item of mediaItems) {
    const { type, url } = item;
    
    try {
      let found = false;
      
      if (type === 'virtualTour') {
        if (property.media.virtualTour === url) {
          found = true;
          await Property.findByIdAndUpdate(id, { $unset: { 'media.virtualTour': "" } });
        }
      } else {
        const mediaArray = property.media[type] || [];
        if (mediaArray.includes(url)) {
          found = true;
          await Property.findByIdAndUpdate(id, { $pull: { [`media.${type}`]: url } });
        }
      }
      
      if (found) {
        const deleteSuccess = deleteMediaFile(url, type);
        deletedItems.push({ type, url, fileDeleted: deleteSuccess });
      } else {
        failedItems.push({ type, url, reason: 'Media not found in property' });
      }
    } catch (error) {
      failedItems.push({ type, url, reason: error.message });
    }
  }
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: `${deletedItems.length} media items deleted successfully`,
    data: {
      deleted: deletedItems,
      failed: failedItems,
      summary: {
        totalRequested: mediaItems.length,
        deleted: deletedItems.length,
        failed: failedItems.length
      }
    }
  });
});

// Get Media Info
const getMediaInfo = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const property = await findPropertyById(id);
  
  const mediaInfo = {
    images: {
      count: property.media.images?.length || 0,
      urls: property.media.images || []
    },
    videos: {
      count: property.media.videos?.length || 0,
      urls: property.media.videos || []
    },
    documents: {
      count: property.media.documents?.length || 0,
      urls: property.media.documents || []
    },
    virtualTour: {
      exists: !!property.media.virtualTour,
      url: property.media.virtualTour || null
    },
    total: {
      count: (property.media.images?.length || 0) + 
             (property.media.videos?.length || 0) + 
             (property.media.documents?.length || 0),
      maxAllowed: MAX_MEDIA_FILES,
      remaining: MAX_MEDIA_FILES - ((property.media.images?.length || 0) + 
                                   (property.media.videos?.length || 0) + 
                                   (property.media.documents?.length || 0))
    }
  };
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: mediaInfo
  });
});

// Replace Media (useful for updating specific media files)
const replaceMedia = catchAsync(async (req, res) => {
  const { id, mediaId } = req.params;
  const { mediaType = 'images' } = req.query;
  
  if (!req.files || !req.files[mediaType]) {
    throw new AppError(`No ${mediaType} file provided for replacement`, HTTP_STATUS.BAD_REQUEST);
  }
  
  const property = await findPropertyById(id);
  checkPropertyOwnership(property, req.user.id);
  
  let oldMediaUrl;
  
  // Find the media to replace
  if (mediaType === 'virtualTour') {
    oldMediaUrl = property.media.virtualTour;
    if (!oldMediaUrl || !oldMediaUrl.includes(mediaId)) {
      cleanupUploadedFiles(req.files);
      throw new AppError(MESSAGES.MEDIA_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
  } else {
    const mediaArray = property.media[mediaType] || [];
    oldMediaUrl = mediaArray.find(url => url.includes(mediaId));
    if (!oldMediaUrl) {
      cleanupUploadedFiles(req.files);
      throw new AppError(MESSAGES.MEDIA_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
  }
  
  // Process new media
  const newMediaData = processUploadedMedia(req.files);
  const newMediaUrl = mediaType === 'virtualTour' 
    ? newMediaData.virtualTour 
    : newMediaData[mediaType][0];
  
  if (!newMediaUrl) {
    cleanupUploadedFiles(req.files);
    throw new AppError('Failed to process new media file', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
  
  // Delete old file
  deleteMediaFile(oldMediaUrl, mediaType);
  
  // Update database
  let updateOperation;
  if (mediaType === 'virtualTour') {
    updateOperation = { $set: { 'media.virtualTour': newMediaUrl } };
  } else {
    // For array fields, we need to replace the specific URL
    const mediaArray = [...(property.media[mediaType] || [])];
    const index = mediaArray.indexOf(oldMediaUrl);
    if (index !== -1) {
      mediaArray[index] = newMediaUrl;
      updateOperation = { $set: { [`media.${mediaType}`]: mediaArray } };
    }
  }
  
  const updatedProperty = await Property.findByIdAndUpdate(
    id,
    updateOperation,
    { new: true, runValidators: true }
  ).populate("owner", "name email avatar phone");
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Media replaced successfully',
    data: {
      property: formatPropertyResponse(updatedProperty),
      replacedMedia: {
        type: mediaType,
        oldUrl: oldMediaUrl,
        newUrl: newMediaUrl
      }
    }
  });
});

// Get properties for the authenticated user
const getUserProperties = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    sort = '-createdAt',
    status,
  } = req.query;
  
  // Build query to get properties owned by the authenticated user
  const searchQuery = { owner: req.user.id };
  
  // Optional: filter by status
  if (status) {
    searchQuery.status = status;
  }
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [properties, total] = await Promise.all([
    Property.find(searchQuery)
      .populate("owner", "name email avatar phone")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    Property.countDocuments(searchQuery),
  ]);
  
  const formattedProperties = properties.map(formatPropertyResponse);
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      properties: formattedProperties,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProperties: total,
        hasNextPage: skip + properties.length < total,
        hasPrevPage: parseInt(page) > 1,
      },
    },
  });
});

module.exports = {
  parseFormData, // Export the middleware
  createProperty,
  getProperty,
  updateProperty,
  deleteProperty,
  uploadMedia,
  deleteMedia,
  addMedia, // Backward compatibility
  removeMedia, // Backward compatibility
  likeProperty,
  unlikeProperty,
  searchProperties,
  getUserProperties, // Get authenticated user's properties
  updateAvailability,
  bulkDeleteMedia,
  getMediaInfo,
  replaceMedia,
  formatPropertyResponse // Export for use in other controllers
};