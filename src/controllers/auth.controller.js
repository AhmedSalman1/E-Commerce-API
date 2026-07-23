import crypto from 'crypto';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import catchAsyncError from 'express-async-handler';
import bcrypt from 'bcryptjs';
import { AppError } from '../utils/appError.js';
import { sendEmail } from '../utils/sendEmail.js';
import { sanitizeUser } from '../utils/sanitizeData.js';
import { createAccessToken } from '../utils/createAccessToken.js';

import { User } from '../models/user.model.js';
import { issueTokens } from '../utils/issueTokens.js';

export const signup = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;

  const newUser = await User.create({
    name,
    email,
    password,
  });

  const accessToken = await issueTokens(newUser, res);

  newUser.password = undefined;

  res.status(201).json({
    status: 'success',
    data: {
      accessToken,
      user: sanitizeUser(newUser),
    },
  });
});

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  const accessToken = await issueTokens(user, res);

  user.password = undefined;

  res.status(200).json({
    status: 'success',
    data: {
      accessToken,
      user: sanitizeUser(user),
    },
  });
});

// TODO
export const refreshToken = catchAsyncError(async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  const decoded = await promisify(jwt.verify)(
    refreshToken,
    process.env.JWT_REFRESH_SECRET
  );

  const currentUser = await User.findById(decoded.id).select(
    '+refreshTokens +passwordChangedAt'
  );
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  const hashedRefreshToken = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  if (!currentUser.refreshTokens.includes(hashedRefreshToken)) {
    return next(
      new AppError('Your refresh token is invalid. Please log in again.', 401)
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  const accessToken = createAccessToken(currentUser._id);

  res.status(200).json({
    status: 'success',
    data: {
      accessToken,
    },
  });
});

export const logout = catchAsyncError(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (refreshToken) {
    const hashedRefreshToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    await User.findOneAndUpdate(
      { refreshTokens: hashedRefreshToken },
      { $pull: { refreshTokens: hashedRefreshToken } }
    );
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json({
    status: 'success',
  });
});

export const protect = catchAsyncError(async (req, res, next) => {
  //* 1) Getting token and check of it's there
  let accessToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    accessToken = req.headers.authorization.split(' ')[1];
  }

  if (!accessToken) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  //* 2) Verification token
  const decoded = await promisify(jwt.verify)(
    accessToken,
    process.env.JWT_SECRET
  );

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

export const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };

export const oAuthCallback = catchAsyncError(async (req, res) => {
  const accessToken = await issueTokens(req.user, res);

  res.redirect(
    `${process.env.FRONTEND_URL}/oauth/success#token=${accessToken}`
  );
});

/*                  Password Reset                  */
export const forgotPassword = catchAsyncError(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token and save it in DB
  const resetToken = user.createPasswordResetToken();

  await user.save();

  // 3) Send it to user's email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message: `Hi ${user.name}, \n\n We received a request to reset your password on your Nestify account. 
      \n ${resetToken} \n\n Enter this code to complete the reset.
      \n If you did not request a password reset, please ignore this email. 
      \n Thanks for helping us keep your account secure. \n The Nestify Team`,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }

  res.status(200).json({
    status: 'success',
    message: 'Reset token sent to email!',
  });
});

export const resetPassword = catchAsyncError(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+refreshTokens');

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;

  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  user.refreshTokens = [];
  await user.save();

  const accessToken = await issueTokens(user, res);

  res.status(200).json({
    status: 'success',
    data: {
      accessToken,
    },
  });
});
