import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, 'Product title is required'],
      minLength: [3, 'Title must be at least 3 chars'],
      maxLength: [100, 'Title must be at most 100 chars'],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minLength: [20, 'Description must be at least 20 chars'],
      maxLength: [1000, 'Description must be at most 1000 chars'],
    },
    quantity: {
      type: Number,
      required: [true, 'Product quantity is required'],
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      max: [250000, 'Product price must be at most 10 chars'],
    },
    priceAfterDiscount: {
      type: Number,
    },
    colors: [String],
    imageCover: {
      type: String,
      required: [true, 'Product cover image is required'],
    },
    images: [String],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product must belong to category!'],
    },
    subcategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory',
      },
    ],
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
    },
    ratingsAverage: {
      type: Number,
      min: [1, 'Rating must be above or equal 1.0'],
      max: [5, 'Rating must be below or equal 5.0'],
      default: 4.5,
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

productSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'category subcategories',
    select: 'name -_id',
  });
  next();
});

const setImageUrl = (doc) => {
  if (doc.imageCover) {
    const imageUrl = `${process.env.BASE_URL}/img/products/${doc.imageCover}`;
    doc.imageCover = imageUrl;
  }

  if (doc.images) {
    const images = [];
    doc.images.forEach((image) => {
      const imageUrl = `${process.env.BASE_URL}/img/products/${image}`;
      images.push(imageUrl);
    });
    doc.images = images;
  }
};

productSchema.post('init', (doc) => {
  setImageUrl(doc);
});

productSchema.post('save', (doc) => {
  setImageUrl(doc);
});

export const Product = mongoose.model('Product', productSchema);
