import catchAsyncError from 'express-async-handler';
import { AppError } from '../utils/appError.js';
import { APIFeatures } from '../utils/apiFeatures.js';

export const getAll = (Model) =>
  catchAsyncError(async (req, res) => {
    // Allow nested routes (Git /api/v1/categories/:categoryId/subcategories)
    let filter = {};
    if (req.params.categoryId) filter = { category: req.params.categoryId };

    // Build query
    const totalDocuments = await Model.countDocuments();
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .search(Model.modelName)
      .sort()
      .limitFields()
      .paginate(totalDocuments);

    // Execute query
    const { query, pagination } = features;
    const doc = await query;

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        doc,
      },
      pagination,
    });
  });

export const getOne = (Model) =>
  catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const doc = await Model.findById(id);

    if (!doc) {
      return next(
        new AppError(`${Model.modelName} with ID ${id} not found`, 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

export const createOne = (Model) =>
  catchAsyncError(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

export const updateOne = (Model) =>
  catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const doc = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(
        new AppError(`${Model.modelName} with ID ${id} not found`, 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

export const deleteOne = (Model) =>
  catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const doc = await Model.findByIdAndDelete(id);

    if (!doc) {
      return next(
        new AppError(`${Model.modelName} with ID ${id} not found`, 404)
      );
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });