import * as factory from './handlerFactory.js';
import { Brand } from '../models/brand.model.js';

export const getAllBrands = factory.getAll(Brand);
export const getBrand = factory.getOne(Brand);
export const createBrand = factory.createOne(Brand);
export const updateBrand = factory.updateOne(Brand);
export const deleteBrand = factory.deleteOne(Brand);
