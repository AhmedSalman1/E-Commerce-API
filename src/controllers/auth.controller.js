import jwt from 'jsonwebtoken';
import catchAsyncError from 'express-async-handler';
import { AppError } from '../utils/appError.js';

import { User } from '../models/user.model.js';

export const signup = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;

  const newUser = await User.create({
    name,
    email,
    password,
  });

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});
