import { check } from 'express-validator';
import { validatorMiddleware } from '../../middlewares/validatorMiddleware.js';

export const createOrderValidator = [
  check('shippingAddress')
    .notEmpty()
    .withMessage('Shipping address is required')
    .isObject()
    .withMessage('Shipping address must be an object'),

  check('shippingAddress.details')
    .notEmpty()
    .withMessage('Address details are required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Address details must be 5-200 characters')
    .trim()
    .escape(),

  check('shippingAddress.phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[0-9]{10,15}$/)
    .withMessage('Phone number must be 10-15 digits'),

  check('shippingAddress.city')
    .notEmpty()
    .withMessage('City is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('City name must be 2-50 characters')
    .trim()
    .escape(),

  check('shippingAddress.postalCode')
    .notEmpty()
    .withMessage('Postal code is required')
    .matches(/^[0-9]{4,10}$/)
    .withMessage('Postal code must be 4-10 digits'),

  validatorMiddleware,
];

export const applyCouponValidator = [
  check('coupon')
    .notEmpty()
    .withMessage('Coupon code is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Coupon code must be 2-50 characters')
    .trim()
    .toUpperCase(),

  validatorMiddleware,
];
