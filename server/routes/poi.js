const express = require('express');
const {
  getAllPOIs,
  getPOI,
  createPOI,
  updatePOI,
  deletePOI,
  getPOIsByType,
  getPOIsInRadius,
  getPOIsInRadiusByType
} = require('../controllers/poiController');

const router = express.Router();

router
  .route('/')
  .get(getAllPOIs)
  .post(createPOI);

router
  .route('/type/:type')
  .get(getPOIsByType);

router
  .route('/radius/:lat/:lng/:radius')
  .get(getPOIsInRadius);

router
  .route('/radius/:lat/:lng/:radius/type/:type')
  .get(getPOIsInRadiusByType);

router
  .route('/:id')
  .get(getPOI)
  .put(updatePOI)
  .delete(deletePOI);

module.exports = router; 