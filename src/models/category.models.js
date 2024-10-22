import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      unique: [true, 'Category name must be unique'],
      minLength: [3, 'Category name must be at least 3 characters long'],
      maxLength: [30, 'Category name must be at most 30 characters long'],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Category = mongoose.model('Category', categorySchema);
