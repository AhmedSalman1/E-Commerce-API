import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please provide a coupon name'],
      unique: true,
    },
    expire: {
      type: Date,
      required: [true, 'Coupon expire time is required'],
    },
    discount: {
      type: Number,
      required: [true, 'Coupon discount is required'],
      min: [1, 'Discount must be at least 1'],
      max: [100, 'Discount cannot exceed 100'],
    },
  },
  { timestamps: true }
);

export const Coupon = mongoose.model('Coupon', couponSchema);
