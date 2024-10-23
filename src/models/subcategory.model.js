import mongoose from 'mongoose';

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please provide a SubCategory name'],
      unique: [true, 'SubCategory name must be unique'],
      minLength: [2, 'SubCategory name must be at least 2 characters long'],
      maxLength: [30, 'SubCategory name must be at most 30 characters long'],
    },
    slug: {
      type: String,
      lowercase: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'SubCategory must belong to category!'],
    },
  },
  {
    timestamps: true,
  }
);

export const SubCategory = mongoose.model('SubCategory', subCategorySchema);
