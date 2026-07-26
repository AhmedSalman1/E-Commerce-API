import jwt from 'jsonwebtoken';

export const createRefreshToken = (id, family) =>
  jwt.sign({ id, family }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
