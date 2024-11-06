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

const router = express.Router();

router.patch('/changePassword/:id', changePasswordValidator, changePassword);

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
