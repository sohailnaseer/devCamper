const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../utils/async');
const ErrorResponse = require('../utils/errorReponse');

exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });

  if (!review) {
    return next(new ErrorResponse(`No review with id of ${req.params.id}`));
  }

  res.status(200).json({
    success: true,
    data: review,
  });
});

exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp with id of ${req.params.bootcampId}`)
    );
  }

  const review = await Review.create(req.body);

  res.status(200).json({
    success: true,
    data: review,
  });
});

exports.updateReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse(`No review with id of ${req.params.id}`));
  }

  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User with id ${req.user.id} is not allowed to update this review`,
        401
      )
    );
  }

  const updatedReview = await Review.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      runValidators: true,
      new: true,
    }
  );

  res.status(200).json({
    success: true,
    data: updatedReview,
  });
});

exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse(`No review with id of ${req.params.id}`));
  }

  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User with id ${req.user.id} is not allowed to delete this review`,
        401
      )
    );
  }

  await review.remove();

  res.status(200).json({
    success: true,
    data: review,
  });
});
