import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import connectDB from './config/db';
import { errorHandler } from './middleware/errorMiddleware';

// Route Imports
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import repairRoutes from './routes/repairRoutes';
import orderRoutes from './routes/orderRoutes';
import adminRoutes from './routes/adminRoutes';
import User from './models/User';
import Shop from './models/Shop';

// Load env vars
dotenv.config();

// Connect to DB before bootstrapping
const startServer = async () => {
  await connectDB();

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100
});
app.use(limiter);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/repairs', repairRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Error Handler
app.use(errorHandler);

// Seeder Function for Demo Users
const seedUsers = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding demo users...');
      
      // Create Default Shop
      const shop = await Shop.create({
        name: 'Abel Accessories Main',
        ownerName: 'Abel Getachew',
        phone: '0911223344',
        location: 'Dessie, Ethiopia'
      });

      // Super Admin
      await User.create({
        name: 'Super Admin',
        email: 'nehzewd@gmail.com',
        password: 'password123',
        role: 'super_admin'
      });

      // Shop Admin
      await User.create({
        name: 'Abel Shop Admin',
        email: 'Abelab523@gmail.com',
        password: 'password123',
        role: 'shop_admin',
        shopId: shop._id
      });

      console.log('Demo users seeded.');
    }
  } catch (error) {
    console.error('Seeding failed:', error);
  }
};

  // Run Seeder
  await seedUsers();

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

startServer();
