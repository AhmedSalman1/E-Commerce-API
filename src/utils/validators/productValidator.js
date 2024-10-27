import slugify from 'slugify';
import { check } from 'express-validator';
import { validatorMiddleware } from '../../middlewares/validatorMiddleware.js';
import { Category } from '../../models/category.model.js';
import { SubCategory } from '../../models/subcategory.model.js';

const idValidationChain = [
  check('id').isMongoId().withMessage('Invalid Product ID format!'),
];

export const getProductValidator = [...idValidationChain, validatorMiddleware];

export const createProductValidator = [
  check('title')
    .notEmpty()
    .withMessage('Product title is required')
    .isLength({ min: 3 })
    .withMessage('Title must be at least 3 chars')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 20, max: 1000 })
    .withMessage('Description must be between 20 and 1000 chars'),

  check('quantity')
    .notEmpty()
    .withMessage('Product quantity is required')
    .isNumeric()
    .withMessage('Product quantity must be a number'),

  check('sold')
    .optional()
    .isNumeric()
    .withMessage('Product sold must be a number'),

  check('price')
    .notEmpty()
    .withMessage('Product Price is Required')
    .isNumeric()
    .withMessage('Product Price must be a number'),

  check('priceAfterDiscount')
    .optional()
    .isNumeric()
    .toFloat()
    .withMessage('Product Price must be a number')
    .custom((val, { req }) => {
      if (val >= req.body.price) {
        throw new Error(
          'Product Price cannot be less than price before discount'
        );
      }
      return true;
    }),

  check('colors')
    .optional()
    .isArray()
    .withMessage('Product Colors must be an array'),

  check('imageCover').notEmpty().withMessage('Product Cover Image is required'),

  check('images')
    .optional()
    .isArray()
    .withMessage('Product Images must be an array'),

  check('category')
    .notEmpty()
    .withMessage('Product must belong to category')
    .isMongoId()
    .withMessage('Invalid Category ID format!')
    .custom(async (val) => {
      const category = await Category.findById(val);

      if (!category) {
        throw new Error(`Category with ID ${val} does not exist`);
      }
      return true;
    }),

  check('subcategories')
    .optional()
    .isArray()
    .withMessage('Product subcategories must be an array')
    // Check each subcategory ID's existence and association with the given category
    .custom(async (subcategoriesIds, { req }) => {
      const subCategories = await SubCategory.find({
        _id: { $exists: true, $in: subcategoriesIds },
        category: req.body.category,
      });

      if (subCategories.length !== subcategoriesIds.length) {
        throw new Error('One or more subcategories do not exist');
      }
      return true;
    }),

  check('brand').optional().isMongoId().withMessage('Invalid Brand ID format!'),

  check('ratingQuantity')
    .optional()
    .isNumeric()
    .withMessage('Product ratingQuantity must be a number'),

  validatorMiddleware,
];

export const updateProductValidator = [
  ...idValidationChain,

  check('title')
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  validatorMiddleware,
];

export const deleteProductValidator = [
  ...idValidationChain,
  validatorMiddleware,
];
