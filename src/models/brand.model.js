import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a brand name'],
      unique: [true, 'Brand name must be unique'],
      minLength: [2, 'Brand name must be at least 2 characters long'],
      maxLength: [30, 'Brand name must be at most 30 characters long'],
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
    const imageUrl = `${process.env.BASE_URL}/img/brands/${doc.image}`;
    doc.image = imageUrl;
  }
};

brandSchema.post('init', (doc) => {
  setImageUrl(doc);
});

brandSchema.post('save', (doc) => {
  setImageUrl(doc);
});

export const Brand = mongoose.model('Brand', brandSchema);
