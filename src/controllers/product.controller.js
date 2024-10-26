import slugify from 'slugify';
import catchAsyncError from 'express-async-handler';
import { Product } from '../models/product.model.js';
import { AppError } from '../utils/appError.js';

export const getAllProducts = catchAsyncError(async (req, res) => {
  //! Filtering
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'limit', 'sort', 'fields', 'keyword'];
  excludedFields.forEach((el) => delete queryObj[el]);

  //* Advanced filtering
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  //! Pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 50;
  const skip = (page - 1) * limit;

  //! Search
  let filterConditions = JSON.parse(queryStr);

  if (req.query.keyword) {
    filterConditions.$or = [
      { title: { $regex: req.query.keyword, $options: 'i' } },
      { description: { $regex: req.query.keyword, $options: 'i' } },
    ];
  }

  //* Build query
  let query = Product.find(filterConditions)
    .skip(skip)
    .limit(limit)
    .populate('category subcategories', 'name -_id');

  //! Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  //! Field limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  } else {
    query = query.select('-__v');
  }

  //* Execute query
  const products = await query;

  res.status(200).json({
    status: 'success',
    results: products.length,
    page,
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
