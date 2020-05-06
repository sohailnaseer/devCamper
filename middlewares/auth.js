const mongoose = require('mongoose');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/async');
const ErrorResposne = require('../utils/errorReponse');

exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }

  if (!token) {
    return next(new ErrorResposne('Not authorized to access this route', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById({ _id: decoded.id });

    if (!user) return next(new ErrorResposne('Invalid Token', 400));
    req.user = user;

    next();
  } catch (error) {
    console.log(error);
    return next(new ErrorResposne('Invalid Token', 400));
  }
});

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResposne(
          `User roles "${req.user.role} is authorized to access this route"`
        )
      );
    }
    next();
  };
};
