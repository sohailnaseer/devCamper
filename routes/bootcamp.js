const express = require('express');
const router = express.Router();
const courseRouter = require('./course');
const reviewRouter = require('./review');
const Bootcamp = require('../models/Bootcamp');
const advancedFeature = require('../middlewares/advancedFeatures');
const { protect, authorize } = require('../middlewares/auth');

const {
  getBootCamp,
  getBootCamps,
  createBootCamp,
  deleteBootCamp,
  updateBootCamp,
  getBootCampsInRadius,
  uploadBootcampPhoto,
} = require('../controllers/bootcampController');

router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

router.route('/radius/:zipcode/:distance').get(getBootCampsInRadius);

router
  .route('/')
  .get(advancedFeature(Bootcamp, 'courses'), getBootCamps)
  .post(protect, authorize('publisher'), createBootCamp);

router
  .route('/:id/photo')
  .post(protect, authorize('publisher'), uploadBootcampPhoto);

router
  .route('/:id')
  .get(getBootCamp)
  .put(protect, authorize('publisher'), updateBootCamp)
  .delete(protect, authorize('publisher'), deleteBootCamp);

module.exports = router;
