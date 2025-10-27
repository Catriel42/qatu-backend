import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './infrastructure/database/index.js';
import productRouter from './interfaces/products/product.router.js';
import storeRouter from './interfaces/stores/store.router.js';
import { devAuth } from './interfaces/middlewares/dev-auth.middleware.js';

const app = express();

const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));
app.use(devAuth);
app.use('/uploads', express.static('uploads'));

app.use('/api/products', productRouter);
app.use('/api/stores', storeRouter);

app.get('/', (_req, res) => {
  res.json({ name: 'QATU API', version: '1.0.0' });
});

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!', error: err.message });
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
