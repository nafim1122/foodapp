const express = require('express');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateProfile,
  uploadAvatar
} = require('../controllers/users');

const { protect, authorize } = require('../middleware/auth');
const { uploadSingle, handleMulterError } = require('../middleware/upload');

const router = express.Router();

// Protected routes
router.use(protect);

// User routes
router.put('/profile', updateProfile);
router.put('/avatar', uploadSingle('avatar'), handleMulterError, uploadAvatar);

// Admin routes
router.get('/', authorize('admin'), getUsers);
router.get('/:id', authorize('admin'), getUser);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
