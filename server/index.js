require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const winston = require('winston');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/product-db';


const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

const path = require('path');


app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: true,
  credentials: true,
}));


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);


app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Server is healthy',
      uptime: process.uptime(),
      mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    },
  });
});



app.use('/api/auth', require('./routes/auth'));


app.use('/api/products', require('./routes/products'));


app.use('/api/orders', require('./routes/orders'));

app.use('/api/payments', require('./routes/payments'));


app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    error: {
      code: err.code || 'SERVER_ERROR',
      message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  });
});


app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.originalUrl} not found`,
    },
  });
});


mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    logger.info('✓ Connected to MongoDB');

    app.listen(PORT, () => {
      logger.info(`✓ Server running on http://localhost:${PORT}`);
      logger.info(`✓ Health check: GET http://localhost:${PORT}/health`);
    });
  })
  .catch((err) => {
    logger.error(`✗ MongoDB connection failed: ${err.message}`);
    process.exit(1);
  });

module.exports = app;
