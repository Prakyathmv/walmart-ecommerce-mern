


const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User');
const Product = require('../models/Product');

describe('Product Management API', () => {
  let authToken;
  let userId;
  let productId;

  beforeAll(async () => {
    
    const testDbUri = process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/product-db-test';
    await mongoose.connect(testDbUri);
  });

  afterAll(async () => {
    
    await User.deleteMany({});
    await Product.deleteMany({});
    await mongoose.connection.close();
  });

  describe('Auth Endpoints', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123',
          name: 'Test User',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe('test@example.com');

      authToken = res.body.data.accessToken;
      userId = res.body.data.user.id;
    });

    it('should fail registration with duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123',
          name: 'Another User',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe('test@example.com');
    });

    it('should fail login with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('AUTH_ERROR');
    });

    it('should get current user with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('test@example.com');
    });

    it('should fail to get current user without token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Product Endpoints', () => {
    it('should create a product with auth', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Laptop',
          description: 'High performance laptop',
          price: 999.99,
          category: 'Electronics',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.product.name).toBe('Laptop');
      expect(res.body.data.product.price).toBe(999.99);

      productId = res.body.data.product.id;
    });

    it('should fail to create product without auth', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          name: 'Phone',
          price: 599.99,
          category: 'Electronics',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail to create product with invalid price', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Phone',
          price: -100,
          category: 'Electronics',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should list products', async () => {
      const res = await request(app)
        .get('/api/products?page=1&limit=10');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.products)).toBe(true);
      expect(res.body.meta.total).toBeGreaterThan(0);
    });

    it('should filter products by category', async () => {
      const res = await request(app)
        .get('/api/products?category=Electronics');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.products.length).toBeGreaterThan(0);
    });

    it('should search products by name', async () => {
      const res = await request(app)
        .get('/api/products?q=Laptop');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should get product by ID', async () => {
      const res = await request(app)
        .get(`/api/products/${productId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.product.id).toBe(productId);
      expect(res.body.data.product.name).toBe('Laptop');
    });

    it('should return 404 for non-existent product', async () => {
      const res = await request(app)
        .get('/api/products/507f1f77bcf86cd799439011');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should update a product', async () => {
      const res = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Laptop',
          price: 1199.99,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.product.name).toBe('Updated Laptop');
      expect(res.body.data.product.price).toBe(1199.99);
    });

    it('should fail to update product without auth', async () => {
      const res = await request(app)
        .put(`/api/products/${productId}`)
        .send({
          name: 'Another Name',
          price: 899.99,
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should delete a product', async () => {
      const res = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail to delete product without auth', async () => {
      const res = await request(app)
        .delete(`/api/products/${productId}`);

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const res = await request(app)
        .get('/health');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toBe('Server is healthy');
    });
  });
});
