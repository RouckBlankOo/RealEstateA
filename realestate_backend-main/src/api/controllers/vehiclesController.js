const Vehicle = require("../models/vehicleModel");
const User = require("../models/userModel");
const fs = require("fs");
const path = require("path");

// Helper functions
const handleError = (res, error, statusCode = 400) => {
  console.error(error);
  res.status(statusCode).json({
    success: false,
    message: error.message
  });
};

const validateVehicleData = (data) => {
  const errors = [];

  // Required fields validation
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  }
  if (!data.description || data.description.trim().length === 0) {
    errors.push('Description is required');
  }
  if (!data.type) {
    errors.push('Vehicle type is required');
  }
  if (!data.listingType) {
    errors.push('Listing type (sale/rent) is required');
  }

  // Vehicle details validation
  if (!data.vehicleDetails) {
    errors.push('Vehicle details are required');
  } else {
    if (!data.vehicleDetails.make || data.vehicleDetails.make.trim().length === 0) {
      errors.push('Vehicle make is required');
    }
    if (!data.vehicleDetails.model || data.vehicleDetails.model.trim().length === 0) {
      errors.push('Vehicle model is required');
    }
    if (!data.vehicleDetails.year) {
      errors.push('Vehicle year is required');
    } else {
      const year = parseInt(data.vehicleDetails.year);
      const currentYear = new Date().getFullYear();
      if (year < 1900 || year > currentYear + 1) {
        errors.push(`Vehicle year must be between 1900 and ${currentYear + 1}`);
      }
    }
  }

  // Pricing validation
  if (!data.pricing) {
    errors.push('Pricing information is required');
  } else {
    if (data.listingType === 'sale') {
      if (!data.pricing.salePrice || data.pricing.salePrice <= 0) {
        errors.push('Sale price is required and must be greater than 0');
      }
    }
    if (data.listingType === 'rent') {
      if (!data.pricing.rentPrice || data.pricing.rentPrice <= 0) {
        errors.push('Rent price is required and must be greater than 0');
      }
      if (!data.pricing.rentPeriod) {
        errors.push('Rent period is required for rental listings');
      }
    }
  }

  if (errors.length > 0) {
    const error = new Error('Validation failed');
    error.errors = errors;
    throw error;
  }
};

const validatePricing = (listingType, pricing) => {
  if (listingType === 'sale' && !pricing.salePrice) {
    throw new Error('Sale price is required for sale listings');
  }
  if (listingType === 'rent' && (!pricing.rentPrice || !pricing.rentPeriod)) {
    throw new Error('Rent price and period are required for rental listings');
  }
};

// Vehicle CRUD Operations
exports.createVehicle = async (req, res) => {
  try {
    console.log('📝 Creating vehicle with data:', JSON.stringify(req.body, null, 2));
    
    // Validate vehicle data
    validateVehicleData(req.body);

    const { listingType, pricing, location } = req.body;
    validatePricing(listingType, pricing || {});

    // Prepare vehicle data
    const vehicleData = {
      ...req.body,
      owner: req.user.id,
      status: 'active'
    };

    // If location coordinates are provided, use them
    // Otherwise, this will be set when user submits with their current location
    if (location && location.coordinates) {
      vehicleData.location = {
        ...location,
        coordinates: {
          latitude: location.coordinates.latitude,
          longitude: location.coordinates.longitude
        }
      };
    } else if (location) {
      // Ensure location has required fields
      if (!location.city || !location.country) {
        return res.status(400).json({
          success: false,
          message: 'Location must include city and country'
        });
      }
      vehicleData.location = location;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Location information is required'
      });
    }

    console.log('✅ Vehicle data validated, creating in database...');
    const vehicle = await Vehicle.create(vehicleData);
    
    console.log('✅ Vehicle created successfully:', vehicle._id);
    
    // Populate owner information before sending response
    const populatedVehicle = await Vehicle.findById(vehicle._id)
      .populate('owner', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: populatedVehicle
    });
  } catch (error) {
    console.error('❌ Error creating vehicle:', error);
    
    // Handle validation errors
    if (error.errors && Array.isArray(error.errors)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors
      });
    }
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    handleError(res, error);
  }
};

exports.getVehicle = async (req, res) => {
  try {
    // Increment views
    await Vehicle.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    const vehicle = await Vehicle.findById(req.params.id)
      .populate('owner', 'name email phone')
      .populate('likes', 'name');

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found"
      });
    }

    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const { listingType, pricing } = req.body;
    if (listingType || pricing) {
      validatePricing(listingType || 'sale', pricing || {});
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('owner', 'name email');

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found"
      });
    }

    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found"
      });
    }

    // Delete associated media files
    ['images', 'videos', 'documents'].forEach(type => {
      vehicle.media[type]?.forEach(fileUrl => {
        const filename = fileUrl.split('/').pop();
        const filePath = path.join(__dirname, `../uploads/vehicles/${type}`, filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    });

    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully"
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Vehicle Media Operations
exports.addMedia = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found"
      });
    }

    const mediaUpdates = {};
    const mediaTypes = ['images', 'videos', 'documents'];

    mediaTypes.forEach(type => {
      if (req.files[type]) {
        const urls = req.files[type].map(file => 
          `/uploads/vehicles/${type}/${file.filename}`
        );
        mediaUpdates[`media.${type}`] = { $each: urls };
      }
    });

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { $push: mediaUpdates },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedVehicle.media
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.removeMedia = async (req, res) => {
  try {
    const { mediaType = 'images' } = req.query;
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found"
      });
    }

    const mediaItem = vehicle.media[mediaType].id(req.params.mediaId);
    if (!mediaItem) {
      return res.status(404).json({
        success: false,
        message: "Media not found"
      });
    }

    // Delete physical file
    const filename = mediaItem.url.split('/').pop();
    const filePath = path.join(__dirname, `../uploads/vehicles/${mediaType}`, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    mediaItem.remove();
    await vehicle.save();

    res.status(200).json({
      success: true,
      message: "Media removed successfully"
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Vehicle Interactions
exports.likeVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found"
      });
    }

    if (vehicle.likes.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "Vehicle already liked"
      });
    }

    vehicle.likes.push(req.user.id);
    await vehicle.save();

    res.status(200).json({
      success: true,
      data: vehicle.likes
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.unlikeVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found"
      });
    }

    const likeIndex = vehicle.likes.indexOf(req.user.id);
    if (likeIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "Vehicle not liked"
      });
    }

    vehicle.likes.splice(likeIndex, 1);
    await vehicle.save();

    res.status(200).json({
      success: true,
      data: vehicle.likes
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Search and Availability
exports.searchVehicles = async (req, res) => {
  try {
    const { 
      type, 
      make, 
      model, 
      minYear, 
      maxYear, 
      minPrice, 
      maxPrice, 
      fuelType,
      transmission,
      location,
      keyword,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};
    
    if (type) query.type = type;
    if (make) query['vehicleDetails.make'] = new RegExp(make, 'i');
    if (model) query['vehicleDetails.model'] = new RegExp(model, 'i');
    if (minYear || maxYear) {
      query['vehicleDetails.year'] = {};
      if (minYear) query['vehicleDetails.year'].$gte = Number(minYear);
      if (maxYear) query['vehicleDetails.year'].$lte = Number(maxYear);
    }
    if (fuelType) query['vehicleDetails.fuelType'] = fuelType;
    if (transmission) query['vehicleDetails.transmission'] = transmission;
    if (location) query['location.city'] = new RegExp(location, 'i');

    if (minPrice || maxPrice) {
      const priceField = req.query.listingType === 'rent' ? 'pricing.rentPrice' : 'pricing.salePrice';
      query[priceField] = {};
      if (minPrice) query[priceField].$gte = Number(minPrice);
      if (maxPrice) query[priceField].$lte = Number(maxPrice);
    }

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { 'vehicleDetails.make': { $regex: keyword, $options: 'i' } },
        { 'vehicleDetails.model': { $regex: keyword, $options: 'i' } }
      ];
    }

    const vehicles = await Vehicle.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('owner', 'name phone');

    const total = await Vehicle.countDocuments(query);

    res.status(200).json({
      success: true,
      count: vehicles.length,
      total,
      pages: Math.ceil(total / limit),
      data: vehicles
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Get user's vehicles
exports.getUserVehicles = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { owner: req.user.id };
    if (status) {
      query.status = status;
    }

    const vehicles = await Vehicle.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('owner', 'name email phone');

    const total = await Vehicle.countDocuments(query);

    res.status(200).json({
      success: true,
      count: vehicles.length,
      total,
      pages: Math.ceil(total / limit),
      data: vehicles
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.updateAvailability = async (req, res) => {
  try {
    const { isAvailable, availableFrom, availableTo, minRentPeriod, maxRentPeriod } = req.body;

    if (availableFrom && availableTo && new Date(availableFrom) >= new Date(availableTo)) {
      return res.status(400).json({
        success: false,
        message: "Available from date must be before available to date"
      });
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      {
        availability: {
          isAvailable,
          availableFrom,
          availableTo,
          minRentPeriod,
          maxRentPeriod
        }
      },
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found"
      });
    }

    res.status(200).json({
      success: true,
      data: vehicle.availability
    });
  } catch (error) {
    handleError(res, error);
  }
};











