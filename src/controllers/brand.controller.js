import slugify from 'slugify';
import catchAsyncError from 'express-async-handler';
import { Brand } from '../models/brand.model.js';
import { AppError } from '../utils/appError.js';
import { APIFeatures } from '../utils/apiFeatures.js';

export const getAllBrands = catchAsyncError(async (req, res) => {
  // Build query
  const totalDocuments = await Brand.countDocuments();
  const features = new APIFeatures(Brand.find(), req.query)
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate(totalDocuments);

  // Execute query
  const { query, pagination } = features;
  const brands = await query;

  res.status(200).json({
    status: 'success',
    results: brands.length,
    data: {
      brands,
    },
    pagination,
  });
});

export const getBrand = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const brand = await Brand.findById(id);

  if (!brand) {
    return next(new AppError(`Brand with ID ${id} not found`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      brand,
    },
  });
});

export const createBrand = catchAsyncError(async (req, res, next) => {
  const { name } = req.body;

  const brand = await Brand.create({
    name,
    slug: slugify(name),
  });

  res.status(201).json({
    status: 'success',
    data: {
      brand,
    },
  });
});

export const updateBrand = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  const brand = await Brand.findByIdAndUpdate(
    id,
    { name, slug: slugify(name) },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!brand) {
    return next(new AppError(`Brand with ID ${id} not found`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      brand,
    },
  });
});

export const deleteBrand = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const brand = await Brand.findByIdAndDelete(id);

  if (!brand) {
    return next(new AppError(`Brand with ID ${id} not found`, 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
