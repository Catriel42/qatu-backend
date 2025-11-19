import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './infrastructure/database/index.js';
import productRouter from './interfaces/products/product.router.js';
import storeRouter from './interfaces/stores/store.router.js';
import userRouter from './interfaces/users/user.router.js';
import sellerRequestRouter from './interfaces/seller-requests/seller-request.router.js';
import categoryRouter from './interfaces/categories/category.router.js';
import { deserializeJsonApi } from './interfaces/middlewares/jsonapi.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());
app.use(deserializeJsonApi); // Deserialize JSON:API requests

// Middleware to log all JSON responses for debugging
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function(data) {
    console.log('--- API RESPONSE BODY ---');
    console.log(JSON.stringify(data, null, 2));
    console.log('-------------------------');
    originalJson.apply(res, arguments);
  };
  next();
});

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/products', productRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/stores', storeRouter);
app.use('/api/users', userRouter);
app.use('/api/seller-requests', sellerRequestRouter);

app.get('/', (_req, res) => {
  res.json({ name: 'QATU API', version: '1.0.0' });
});

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const errorResponse = {
    errors: [
      {
        status: statusCode.toString(),
        title: err.name || 'Error',
        detail: err.message || 'Something broke!',
      },
    ],
  };
  res.status(statusCode).json(errorResponse);
});

export default app;

if (process.env.NODE_ENV !== 'test') {
  (async () => {
    try {
      await connectDB({ sync: true });
      app.listen(PORT, () => {
        console.log(`API listening on http://localhost:${PORT}`);
      });
    } catch (error) {
      console.error('Failed to connect to the database:', error);
      process.exit(1);
    }
  })();
}