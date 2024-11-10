import express from 'express';
import {
  signupValidator,
  loginValidator,
} from '../utils/validators/authValidator.js';

import {
  login,
  oAuthCallback,
  refreshAccessToken,
  signup,
} from '../controllers/auth.controller.js';
import { oAuthenticated, oCallback } from '../middlewares/passportOAuth.js';

const router = express.Router();

router.get('/google', oAuthenticated);
router.get('/google/callback', oCallback, oAuthCallback);
router.post('/refresh-token', refreshAccessToken);

router.post('/signup', signupValidator, signup);
router.post('/login', loginValidator, login);

export default router;
