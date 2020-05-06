const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../utils/async');
const ErrorResponse = require('../utils/errorReponse');
const advancedFeatures = require('../middlewares/advancedFeatures');
const geocoder = require('../utils/geocoder');

exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });

    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });

  if (!course) {
    return next(new ErrorResponse(`No course with id of ${req.params.id}`));
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

exports.addCourse = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp with id of ${req.params.bootcampId}`)
    );
  }

  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User with id ${req.user.id} is not allowed to add course to this bootcamp`,
        401
      )
    );
  }

  const course = await Course.create(req.body);

  res.status(200).json({
    success: true,
    data: course,
  });
});

exports.updateCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`No course with id of ${req.params.id}`));
  }

  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User with id ${req.user.id} is not allowed to update course to this bootcamp`,
        401
      )
    );
  }

  const updatedCourse = await Course.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      runValidators: true,
      new: true,
    }
  );

  res.status(200).json({
    success: true,
    data: updatedCourse,
  });
});

exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`No course with id of ${req.params.id}`));
  }

  await course.remove();

  res.status(200).json({
    success: true,
    data: course,
  });
});
