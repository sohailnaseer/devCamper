const path = require('path');
const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../utils/async');
const ErrorResponse = require('../utils/errorReponse');
const geocoder = require('../utils/geocoder');

exports.getBootCamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    console.log('test');
    return next(
      new ErrorResponse(`Bootcamp with id ${req.params.id} not found`, 400)
    );
  }

  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

exports.getBootCamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

exports.getBootCampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  const loc = await geocoder.geocode(zipcode);
  const lng = loc[0].longitude;
  const lat = loc[0].latitude;

  const radius = +distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

exports.createBootCamp = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;

  const publishedBootcamp = await Bootcamp.findOne({ _id: req.user.id });

  if (publishedBootcamp && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User with id ${req.user.id} already published a bootcamp`,
        400
      )
    );
  }

  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

exports.updateBootCamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp)
    return next(
      new ErrorResponse(`Bootcamp with id ${req.params.id} not found`, 400)
    );

  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User with id ${req.user.id} is not allowed to update bootcamp`,
        401
      )
    );
  }

  const updatedBootcamp = await Bootcamp.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    data: updatedBootcamp,
  });
});

exports.deleteBootCamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp)
    return next(
      new ErrorResponse(`Bootcamp with id ${req.params.id} not found`, 400)
    );

  await bootcamp.remove();

  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

exports.uploadBootcampPhoto = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp)
    return next(
      new ErrorResponse(`Bootcamp with id ${req.params.id} not found`, 400)
    );

  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User with id ${req.user.id} is not allowed to update bootcamp`,
        401
      )
    );
  }

  if (!req.files.photo) {
    return next(new ErrorResponse(` Please upload a photo`, 400));
  }

  const photo = req.files.photo;

  if (photo.size > process.env.MAX_UPLOAD_SIZE) {
    return next(
      new ErrorResponse(
        ` Please upload a photo less than ${process.env.MAX_UPLOAD_SIZE}`,
        400
      )
    );
  }

  if (!photo.mimetype.startsWith('image')) {
    return next(new ErrorResponse(` Please upload an image file`, 400));
  }

  const filename = `photo_${req.params.id}${path.parse(photo.name).ext}`;

  await photo.mv(`${process.env.FILE_UPLOAD_PATH}/${filename}`, async function (
    error
  ) {
    if (error) {
      console.log(error);
      return next(
        new ErrorResponse(`Some complications occur in file upload`, 500)
      );
    }
  });

  await Bootcamp.findByIdAndUpdate(req.params.id, {
    photo: filename,
  });

  res.status(200).json({
    success: true,
  });
});
