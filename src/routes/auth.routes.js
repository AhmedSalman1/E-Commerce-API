import express from 'express';
import { signupValidator } from '../utils/validators/authValidator.js';

import { signup } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', signupValidator, signup);

export default router;
