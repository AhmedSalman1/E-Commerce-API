import crypto from 'crypto';

import { createAccessToken } from './createAccessToken.js';
import { createRefreshToken } from './createRefreshToken.js';

export const setCookieWithRefreshToken = (res, refreshToken) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);
};

export const issueTokens = async (user, res) => {
  const accessToken = createAccessToken(user._id);

  const refreshToken = createRefreshToken(user._id);

  user.refreshToken = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  await user.save({ validateBeforeSave: false });

  setCookieWithRefreshToken(res, refreshToken);

  return accessToken;
};
