import express from 'express';
import {
  signupValidator,
  loginValidator,
} from '../utils/validators/authValidator.js';

import {
  signup,
  login,
  logout,
  oAuthCallback,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.js';
import { oAuthenticated, oCallback } from '../middlewares/passportOAuth.js';

const router = express.Router();

router.get('/google', oAuthenticated);
router.get('/google/callback', oCallback, oAuthCallback);

router.post('/signup', signupValidator, signup);
router.post('/login', loginValidator, login);
router.get('/logout', logout);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

export default router;
