const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'products',
    allowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});
const upload = multer({ storage: storage });

const router = express.Router();


const validateProduct = [
  body('name').notEmpty().trim().withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').optional().trim(),
];



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
    const { name, brand, price, category, department, stock, status } = req.body;
    let imageUrl = '';

    if (req.file) {
      imageUrl = req.file.path;
    }

    const product = new Product({
      name,
      brand,
      price,
      category,
      department,
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
          department: product.department,
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


// GET /api/products/departments — distinct department list
router.get('/departments', async (req, res) => {
  try {
    const departments = await Product.distinct('department', { department: { $ne: null, $ne: '' } });
    res.status(200).json({ success: true, data: { departments } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Error fetching departments' } });
  }
});

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, department, q, minPrice, maxPrice, sort = '-createdAt' } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (department) filter.department = { $regex: new RegExp(`^${department}$`, 'i') };
    if (q) filter.name = { $regex: q, $options: 'i' };
    if (minPrice) filter.price = { ...filter.price, $gte: parseFloat(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

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
          department: p.department,
          imageUrl: p.imageUrl,
          stock: p.stock,
          status: p.status,
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


    if (product.imageUrl) {
      if (product.imageUrl.includes('cloudinary.com')) {
        const urlParts = product.imageUrl.split('/');
        const filename = urlParts[urlParts.length - 1];
        const publicId = `products/${filename.split('.')[0]}`;

        cloudinary.uploader.destroy(publicId, (err, result) => {
          if (err) console.error(`Failed to delete image from Cloudinary:`, err);
        });
      } else {
        const imagePath = path.join(__dirname, '..', product.imageUrl);
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error(`Failed to delete image at ${imagePath}:`, err);
          }
        });
      }
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
