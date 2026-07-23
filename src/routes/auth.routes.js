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
  refreshToken,
} from '../controllers/auth.controller.js';
import { oAuthenticated, oCallback } from '../middlewares/passportOAuth.js';

const router = express.Router();

router.get('/google', oAuthenticated);
router.get('/google/callback', oCallback, oAuthCallback);
router.get('/google/failure', (req, res) => {
  res.status(401).json({
    status: 'fail',
    message: 'Google authentication was cancelled or could not be completed.',
  });
});

router.post('/refresh', refreshToken);
router.post('/signup', signupValidator, signup);
router.post('/login', loginValidator, login);
router.post('/logout', logout);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

export default router;
