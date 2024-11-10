import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import catchAsyncError from 'express-async-handler';
import bcrypt from 'bcryptjs';
import { AppError } from '../utils/appError.js';

import { User } from '../models/user.model.js';

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

export const signup = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;

  const newUser = await User.create({
    name,
    email,
    password,
  });

  const token = createToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  const token = createToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});

export const protect = catchAsyncError(async (req, res, next) => {
  //* 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  //* 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //* 3) Check if user still exists
  const currentUser = await User.findById(decoded.id).select(
    '+passwordChangedAt'
  );
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  //* 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  req.user = currentUser;
  next();
});

export const refreshAccessToken = catchAsyncError(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError('No refresh token provided', 401));
  }

  const decoded = await promisify(jwt.verify)(
    refreshToken,
    process.env.JWT_REFRESH_SECRET
  );

  const user = await User.findById(decoded.id).select('+refreshToken');

  if (!user || user.refreshToken !== refreshToken) {
    return next(new AppError('Invalid refresh token', 403));
  }

  const newAccessToken = user.generateAccessToken();

  res.status(200).json({
    status: 'success',
    data: {
      accessToken: newAccessToken,
    },
  });
});

export const oAuthCallback = (req, res) => {
  const { accessToken, refreshToken } = req.user;

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict', // Prevent CSRF
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);
  res.status(200).json({
    status: 'success',
    data: {
      accessToken,
    },
  });
};
