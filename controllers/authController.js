const crypto = require('crypto');
const User = require('../models/User');
const asyncHandler = require('../utils/async');
const ErrorResponse = require('../utils/errorReponse');
const sendMail = require('../utils/sendMail');

exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  sendTokenResponse(user, 201, res);
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('Please add email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid Credentials', 400));
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid Credentials', 400));
  }

  sendTokenResponse(user, 200, res);
});

exports.getMe = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

exports.forgot = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return next(
      new ErrorResponse(`No user found with this email address`, 400)
    );

  const resetToken = user.getResetToken();
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `This email is sent because you forogt your password and try to reset the password . Your reset url is ${resetURL}`;

  try {
    await sendMail({
      email: req.body.email,
      subject: 'Password Reset Token',
      message,
    });

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new ErrorResponse(`Email could not send . Some Error occurred`, 500)
    );
  }
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { resetToken } = req.params;
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) return next(new ErrorResponse('Invalid Reset Token', 400));

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
  sendTokenResponse(user, 200, res);
});

exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdates = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!user.matchPassword(req.body.oldPassword)) {
    return next(new ErrorResponse('Invalid Password is Entered', 400));
  }

  user.password = req.body.newPassword;
  const updatedUser = await user.save();

  sendTokenResponse(updatedUser, 200, res);
});

const sendTokenResponse = (user, status, res) => {
  const token = user.getSignedJWT();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(status).cookie('token', token, options).json({
    success: true,
    token,
  });
};
