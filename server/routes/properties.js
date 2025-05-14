const express = require('express');
const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertiesByType,
  getPropertiesInRadius
} = require('../controllers/propertyController');

const router = express.Router();

router
  .route('/')
  .get(getProperties)
  .post(createProperty);

router
  .route('/type/:type')
  .get(getPropertiesByType);

router
  .route('/radius/:lat/:lng/:radius')
  .get(getPropertiesInRadius);

router
  .route('/:id')
  .get(getProperty)
  .put(updateProperty)
  .delete(deleteProperty);

module.exports = router; 