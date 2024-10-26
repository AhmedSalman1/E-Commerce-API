import slugify from 'slugify';
import catchAsyncError from 'express-async-handler';
import { Product } from '../models/product.model.js';
import { AppError } from '../utils/appError.js';
import { APIFeatures } from '../utils/apiFeatures.js';

export const getAllProducts = catchAsyncError(async (req, res) => {
  const features = new APIFeatures(Product.find(), req.query)
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate();

  // Execute query
  const products = await features.query;

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products,
    },
  });
});

export const getProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findById(id).populate(
    'category subcategories',
    'name -_id'
  );

  if (!product) {
    return next(new AppError(`Product with ID ${id} not found`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});

export const createProduct = catchAsyncError(async (req, res, next) => {
  req.body.slug = slugify(req.body.title);

  const product = await Product.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      product,
    },
  });
});

export const updateProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  if (req.body.title) {
    req.body.slug = slugify(req.body.title);
  }

  const product = await Product.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return next(new AppError(`Product with ID ${id} not found`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});

export const deleteProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    return next(new AppError(`Product with ID ${id} not found`, 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
