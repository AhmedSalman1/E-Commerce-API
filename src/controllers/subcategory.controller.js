import * as factory from './handlerFactory.js';
import { SubCategory } from '../models/subcategory.model.js';

export const setCategoryIdToBody = (req, res, next) => {
  // Nested route
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

export const getAllSubCategories = factory.getAll(SubCategory);
export const getSubCategory = factory.getOne(SubCategory);
export const createSubCategory = factory.createOne(SubCategory);
export const updateSubCategory = factory.updateOne(SubCategory);
export const deleteSubCategory = factory.deleteOne(SubCategory);
