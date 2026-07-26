import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import { RefreshToken } from '../models/refreshToken.model.js';
import { createAccessToken } from './createAccessToken.js';
import { createRefreshToken } from './createRefreshToken.js';

const MAX_SESSIONS = 5;

export const hashRefreshToken = (refreshToken) => {
  if (!process.env.REFRESH_TOKEN_HASH_SECRET) {
    throw new Error('REFRESH_TOKEN_HASH_SECRET must be configured');
  }

  return crypto
    .createHmac('sha256', process.env.REFRESH_TOKEN_HASH_SECRET)
    .update(refreshToken)
    .digest('hex');
};

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

export const issueTokens = async (user, res, req, family = uuidv4()) => {
  const accessToken = createAccessToken(user._id);

  const refreshToken = createRefreshToken(user._id, family);
  const { exp } = jwt.decode(refreshToken);

  await RefreshToken.create({
    user: user._id,
    hashedToken: hashRefreshToken(refreshToken),
    family,
    userAgent: req?.get('user-agent'),
    ip: req?.ip,
    expiresAt: new Date(exp * 1000),
  });

  const expiredSessions = await RefreshToken.find({ user: user._id })
    .sort({ createdAt: -1 })
    .skip(MAX_SESSIONS)
    .select('_id');

  if (expiredSessions.length) {
    await RefreshToken.deleteMany({
      _id: { $in: expiredSessions.map((session) => session._id) },
    });
  }

  setCookieWithRefreshToken(res, refreshToken);

  return accessToken;
};
