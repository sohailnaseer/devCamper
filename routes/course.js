const express = require('express');
const router = express.Router({ mergeParams: true });
const Course = require('../models/Course');
const advancedFeatures = require('../middlewares/advancedFeatures');
const { protect, authorize } = require('../middlewares/auth');

const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');

router
  .route('/')
  .get(
    advancedFeatures(Course, {
      path: 'bootcamp',
      select: 'name description',
    }),
    getCourses
  )
  .post(protect, authorize('publisher'), addCourse);
router
  .route('/:id')
  .get(getCourse)
  .put(protect, authorize('publisher'), updateCourse)
  .delete(protect, authorize('publisher'), deleteCourse);

module.exports = router;
