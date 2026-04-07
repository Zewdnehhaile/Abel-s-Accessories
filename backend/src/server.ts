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
import aiRoutes from './routes/aiRoutes';
import userRoutes from './routes/userRoutes';
import User from './models/User';
import Shop from './models/Shop';

// Load env vars
dotenv.config();

// Connect to DB before bootstrapping
const startServer = async () => {
  const nodeEnv = process.env.NODE_ENV || 'development';

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
  if (nodeEnv === 'development') {
    app.use(morgan('dev'));
  }
 app.get('/', (req, res) => {
  res.send('Abel Accessories API is running 🚀');
});
  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/repairs', repairRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/users', userRoutes);
  
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

  const initialPort = Number(process.env.PORT) || 5000;

  const listen = async (port: number): Promise<number> => {
    return new Promise((resolve, reject) => {
      const server = app.listen(port, () => resolve(port));

      server.on('error', (error: any) => {
        if (error.code === 'EADDRINUSE' && nodeEnv !== 'production') {
          console.warn(`Port ${port} is already in use, trying ${port + 1}...`);
          listen(port + 1).then(resolve).catch(reject);
          return;
        }

        reject(error);
      });
    });
  };

  const PORT = await listen(initialPort);

  console.log(`Server running in ${nodeEnv} mode on port ${PORT}`);

  void (async () => {
    try {
      await connectDB();
      await seedUsers();
    } catch (error: any) {
      console.error(`MongoDB connection failed: ${error.message}`);
      if (nodeEnv === 'production') {
        process.exit(1);
      }
      console.warn('Continuing without a database connection so the dev server can stay up.');
    }
  })();
};

startServer();
