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

const setImageUrl = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/img/categories/${doc.image}`;
    doc.image = imageUrl;
  }
};

// MONGOOSE MIDDLEWARE: find, update
categorySchema.post('init', (doc) => {
  setImageUrl(doc);
});

// runs after create → .save()
categorySchema.post('save', (doc) => {
  setImageUrl(doc);
});

export const Category = mongoose.model('Category', categorySchema);
