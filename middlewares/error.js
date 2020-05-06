const ErrorResponse = require('../utils/errorReponse');
const colors = require('colors');

module.exports = (err, req, res, next) => {
  console.log('Error handling middelware');

  console.log(err.stack.red);
  let error = { ...err };
  error.message = err.message;

  if (err.name === 'CastError') {
    error = new ErrorResponse(`Bootcamp not found of id ${err.value}`, 400);
  }

  if (err.code === 11000) {
    const message = 'Duplicate Field Value Entered';
    error = new ErrorResponse(message, 400);
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(500).json({
    success: false,
    error: error.message,
  });
};
