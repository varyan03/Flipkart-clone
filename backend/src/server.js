const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
require('dotenv').config();

const { errorHandler } = require('./middleware/errorHandler');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

const app = express();

// SECURITY: Helmet helps secure the app by setting various HTTP headers.
// Mandatory for any production environment.
app.use(helmet());

// CORS: Configured to restrict access. In production, process.env.FRONTEND_URL 
// should be set to your deployed frontend domain.
app.use(cors({
  origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, 'http://localhost:5173'] : 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  credentials: true  // Required for cross-origin httpOnly cookies
}));

// BODY PARSER & COOKIES: Standard middleware for handling JSON payloads and 
// authenticated session cookies.
app.use(express.json());
app.use(cookieParser());

// LOGGING: 'morgan' provides request logging. Consider using a rotating file logger
// (like winston) for long-term production logs.
app.use(morgan('dev'));

// Health check
app.get('/api/v1/health', (req, res) => res.json({ success: true, message: 'API is running' }));

// Mount routes
app.use('/api/v1', productRoutes);
app.use('/api/v1', cartRoutes);
app.use('/api/v1', orderRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
