const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// ==================== Multer Setup ====================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

const router = express.Router();

// ==================== Validation Rules ====================
const validateProduct = [
  body('name').notEmpty().trim().withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').optional().trim(),
];

// ==================== Create Product ====================
// Note: We're applying the upload middleware before protect/validate for simplicity
router.post('/', protect, upload.single('image'), validateProduct, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors.array().reduce((acc, err) => {
          acc[err.path] = err.msg;
          return acc;
        }, {}),
      },
    });
  }

  try {
    const { name, brand, price, category, stock, status } = req.body;
    let imageUrl = '';

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const product = new Product({
      name,
      brand,
      price,
      category,
      imageUrl,
      stock,
      status,
    });

    await product.save();

    res.status(201).json({
      success: true,
      data: {
        product: {
          id: product._id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          category: product.category,
          imageUrl: product.imageUrl
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error creating product',
      },
    });
  }
});

// ==================== List Products ====================
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, q, minPrice, maxPrice, sort = '-createdAt' } = req.query;

    // Build filter
    const filter = {};
    if (category) filter.category = category;
    if (q) filter.name = { $regex: q, $options: 'i' }; // Case-insensitive search
    if (minPrice) filter.price = { ...filter.price, $gte: parseFloat(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };

    // Parse pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Fetch products
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Total count
    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        products: products.map((p) => ({
          id: p._id,
          name: p.name,
          brand: p.brand,
          price: p.price,
          category: p.category,
          imageUrl: p.imageUrl
        })),
      },
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error fetching products',
      },
    });
  }
});

// ==================== Get Product by ID ====================
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Product not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        product: {
          id: product._id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          category: product.category,
          imageUrl: product.imageUrl
        },
      },
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Product not found',
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error fetching product',
      },
    });
  }
});

// ==================== Update Product ====================
router.put('/:id', protect, validateProduct, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors.array().reduce((acc, err) => {
          acc[err.path] = err.msg;
          return acc;
        }, {}),
      },
    });
  }

  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Product not found',
        },
      });
    }

    // Check ownership (allow admin to update anyone's products)
    if (
      req.user.role !== 'admin' &&
      (!product.createdBy || product.createdBy.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Not authorized to update this product',
        },
      });
    }

    // Update fields
    const { name, brand, price, category, stock, status } = req.body;
    product.name = name || product.name;
    product.brand = brand || product.brand;
    product.price = price !== undefined ? price : product.price;
    product.category = category || product.category;
    product.stock = stock !== undefined ? stock : product.stock;
    product.status = status || product.status;

    await product.save();

    res.status(200).json({
      success: true,
      data: {
        product: {
          id: product._id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          category: product.category,
          imageUrl: product.imageUrl
        },
      },
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Product not found',
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error updating product',
      },
    });
  }
});

// ==================== Delete Product ====================
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Product not found',
        },
      });
    }

    // Check ownership (allow admin to delete anyone's products)
    if (
      req.user.role !== 'admin' &&
      (!product.createdBy || product.createdBy.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Not authorized to delete this product',
        },
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    // Delete associated image file from local storage if it exists
    if (product.imageUrl) {
      const imagePath = path.join(__dirname, '..', product.imageUrl);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error(`Failed to delete image at ${imagePath}:`, err);
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        message: 'Product deleted successfully',
      },
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Product not found',
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error deleting product',
      },
    });
  }
});

module.exports = router;
