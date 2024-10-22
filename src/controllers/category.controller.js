import slugify from 'slugify';
import { Category } from '../models/category.models.js';
import catchAsyncError from 'express-async-handler';

export const getAllCategories = catchAsyncError(async (req, res) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 3;
  const skip = (page - 1) * limit;

  const categories = await Category.find({}).skip(skip).limit(limit);

  res.status(200).json({
    status: 'success',
    results: categories.length,
    page,
    data: {
      categories,
    },
  });
});

export const getCategory = catchAsyncError(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);

  if (!category) {
    return res.status(404).json({
      status: 'fail',
      message: 'Category not found',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      category,
    },
  });
});

export const createCategory = catchAsyncError(async (req, res) => {
  const { name } = req.body;

  const newCategory = await Category.create({
    name,
    slug: slugify(name),
  });

  res.status(201).json({
    status: 'success',
    data: {
      newCategory,
    },
  });
});

export const updateCategory = catchAsyncError(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const category = await Category.findByIdAndUpdate(
    id,
    { name, slug: slugify(name) },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!category) {
    return res.status(404).json({
      status: 'fail',
      message: 'Category not found',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      category,
    },
  });
});

export const deleteCategory = catchAsyncError(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findByIdAndDelete(id);

  if (!category) {
    return res.status(404).json({
      status: 'fail',
      message: 'Category not found',
    });
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
