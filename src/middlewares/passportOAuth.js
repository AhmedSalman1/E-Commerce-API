import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { User } from '../models/user.model.js';

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();

        if (!email) {
          return done(
            new Error('Your Google account does not provide an email address.')
          );
        }

        // 1. if user exists, return user
        let user = await User.findOne({ googleId: profile.id });
        if (user) return done(null, user);

        // if email exists already, link google account
        user = await User.findOne({ email });
        if (user) {
          user.googleId = profile.id;
          await user.save({ validateBeforeSave: false });
          return done(null, user);
        }

        user = await User.create({
          name: profile.displayName,
          email,
          googleId: profile.id,
          photo: profile.photos?.[0]?.value,
        });

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

export const oAuthenticated = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
});

export const oCallback = passport.authenticate('google', {
  session: false,
  failureRedirect: '/api/v1/auth/google/failure',
});
