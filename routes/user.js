const express = require('express');
const router = express.Router();
const User = require('../models/User');
const advancedFeatures = require('../middlewares/advancedFeatures');
const { protect, authorize } = require('../middlewares/auth');

const {
  getUser,
  getUsers,
  updateUser,
  deleteUser,
  createUser,
} = require('../controllers/userController');

router.use(protect, authorize('admin'));

router.route('/').get(advancedFeatures(User), getUsers).post(createUser);
router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
