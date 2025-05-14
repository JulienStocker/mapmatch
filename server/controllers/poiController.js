const POI = require('../models/POI');

// @desc    Get all POIs
// @route   GET /api/poi
// @access  Public
exports.getAllPOIs = async (req, res) => {
  try {
    const pois = await POI.find();
    
    res.status(200).json({
      success: true,
      count: pois.length,
      data: pois
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get POIs by type (groceries, malls, transport, hospitals)
// @route   GET /api/poi/type/:type
// @access  Public
exports.getPOIsByType = async (req, res) => {
  try {
    const pois = await POI.find({ type: req.params.type });
    
    res.status(200).json({
      success: true,
      count: pois.length,
      data: pois
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get POIs within a certain radius
// @route   GET /api/poi/radius/:lat/:lng/:radius
// @access  Public
exports.getPOIsInRadius = async (req, res) => {
  try {
    const { lat, lng, radius } = req.params;
    
    // Convert radius from km to meters (required by MongoDB)
    const radiusInMeters = radius * 1000;
    
    const pois = await POI.find({
      coordinates: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radiusInMeters
        }
      }
    });
    
    res.status(200).json({
      success: true,
      count: pois.length,
      data: pois
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get POIs within a radius and of a specific type
// @route   GET /api/poi/radius/:lat/:lng/:radius/type/:type
// @access  Public
exports.getPOIsInRadiusByType = async (req, res) => {
  try {
    const { lat, lng, radius, type } = req.params;
    
    // Convert radius from km to meters (required by MongoDB)
    const radiusInMeters = radius * 1000;
    
    const pois = await POI.find({
      type,
      coordinates: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radiusInMeters
        }
      }
    });
    
    res.status(200).json({
      success: true,
      count: pois.length,
      data: pois
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single POI
// @route   GET /api/poi/:id
// @access  Public
exports.getPOI = async (req, res) => {
  try {
    const poi = await POI.findById(req.params.id);
    
    if (!poi) {
      return res.status(404).json({
        success: false,
        error: 'POI not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: poi
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Create new POI
// @route   POST /api/poi
// @access  Private (should be protected with auth)
exports.createPOI = async (req, res) => {
  try {
    const poi = await POI.create(req.body);
    
    res.status(201).json({
      success: true,
      data: poi
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

// @desc    Update POI
// @route   PUT /api/poi/:id
// @access  Private (should be protected with auth)
exports.updatePOI = async (req, res) => {
  try {
    let poi = await POI.findById(req.params.id);
    
    if (!poi) {
      return res.status(404).json({
        success: false,
        error: 'POI not found'
      });
    }
    
    poi = await POI.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: poi
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete POI
// @route   DELETE /api/poi/:id
// @access  Private (should be protected with auth)
exports.deletePOI = async (req, res) => {
  try {
    const poi = await POI.findById(req.params.id);
    
    if (!poi) {
      return res.status(404).json({
        success: false,
        error: 'POI not found'
      });
    }
    
    await poi.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}; 