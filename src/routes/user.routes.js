import express from 'express';
import {
  createUserValidator,
  getUserValidator,
  updateUserValidator,
  deleteUserValidator,
  updateLoggedUserValidator,
  changeMyPasswordValidator,
} from '../utils/validators/userValidator.js';

import {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  uploadUserImage,
  resizeUserImage,
  getMe,
  updateMe,
  updateMyPassword,
  deleteMe,
} from '../controllers/user.controller.js';

import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

router.use(authController.protect);

router.get('/getMe', getMe, getUser);
router.patch('/updateMyPassword', changeMyPasswordValidator, updateMyPassword);
router.delete('/deleteMe', deleteMe);
router.patch(
  '/updateMe',
  uploadUserImage,
  resizeUserImage,
  updateLoggedUserValidator,
  updateMe
);

// Admin
router.use(authController.restrictTo('admin', 'manager'));

router
  .route('/')
  .get(getAllUsers)
  .post(uploadUserImage, resizeUserImage, createUserValidator, createUser);
router
  .route('/:id')
  .get(getUserValidator, getUser)
  .patch(uploadUserImage, resizeUserImage, updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);

export default router;
