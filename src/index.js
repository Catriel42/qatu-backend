import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './infrastructure/database/index.js';
import productRouter from './interfaces/products/product.router.js';

const app = express();

// Config
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));

// Rutas
app.use('/api/products', productRouter);

// Root
app.get('/', (req, res) => {
  res.json({ name: 'QATU API', version: '1.0.0' });
});

// Basic Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!', error: err.message });
});

// Connect to database and then start the server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}).catch(error => {
  console.error('Failed to connect to the database:', error);
  process.exit(1);
});