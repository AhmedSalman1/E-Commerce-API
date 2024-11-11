import express from 'express';
import {
  createUserValidator,
  getUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changePasswordValidator,
} from '../utils/validators/userValidator.js';

import {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  uploadUserImage,
  resizeUserImage,
  changePassword,
} from '../controllers/user.controller.js';

import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

router.patch('/changePassword/:id', changePasswordValidator, changePassword);

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'manager'),
    getAllUsers
  )
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    uploadUserImage,
    resizeUserImage,
    createUserValidator,
    createUser
  );
router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    getUserValidator,
    getUser
  )
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    uploadUserImage,
    resizeUserImage,
    updateUserValidator,
    updateUser
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    deleteUserValidator,
    deleteUser
  );

export default router;
