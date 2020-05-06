const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  forgot,
  resetPassword,
  updateDetails,
  updatePassword,
} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/forgotpassword').post(forgot);
router.route('/updatedetails').put(protect, updateDetails);
router.route('/updatepassword').put(protect, updatePassword);
router.route('/resetpassword/:resetToken').put(resetPassword);
router.route('/me').get(protect, getMe);

module.exports = router;
