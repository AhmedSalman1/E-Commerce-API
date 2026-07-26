import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    hashedToken: {
      type: String,
      required: true,
      unique: true,
    },
    family: {
      type: String,
      required: true,
    },
    userAgent: String,
    ip: String,
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ user: 1, createdAt: 1 });

export const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
