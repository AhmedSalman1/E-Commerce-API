import slugify from 'slugify';
import catchAsyncError from 'express-async-handler';
import { Brand } from '../models/brand.model.js';
import { AppError } from '../utils/appError.js';

export const getAllBrands = catchAsyncError(async (req, res) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 3;
  const skip = (page - 1) * limit;

  const brands = await Brand.find({}).skip(skip).limit(limit);

  res.status(200).json({
    status: 'success',
    results: brands.length,
    page,
    data: {
      brands,
    },
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
