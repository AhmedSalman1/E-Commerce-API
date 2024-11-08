import express from 'express';
import {
  signupValidator,
  loginValidator,
} from '../utils/validators/authValidator.js';

import { login, signup } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', signupValidator, signup);
router.post('/login', loginValidator, login);

export default router;
