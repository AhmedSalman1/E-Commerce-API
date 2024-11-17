import * as factory from './handlerFactory.js';
import { Coupon } from '../models/coupon.model.js';

export const getAllCoupons = factory.getAll(Coupon);
export const getCoupon = factory.getOne(Coupon);
export const createCoupon = factory.createOne(Coupon);
export const updateCoupon = factory.updateOne(Coupon);
export const deleteCoupon = factory.deleteOne(Coupon);
