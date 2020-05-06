const express = require('express');
const router = express.Router({ mergeParams: true });
const Review = require('../models/Review');
const advancedFeatures = require('../middlewares/advancedFeatures');
const { protect, authorize } = require('../middlewares/auth');
const {
  getReview,
  getReviews,
  addReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');

router
  .route('/')
  .get(
    protect,
    advancedFeatures(Review, {
      path: 'bootcamp',
      select: 'name description',
    }),
    getReviews
  )
  .post(addReview);

router
  .route('/:id')
  .get(protect, getReview)
  .put(protect, authorize('user', 'admin'), updateReview)
  .delete(protect, authorize('user', 'admin'), deleteReview);

module.exports = router;
