import { Router } from 'express';
import ProductController from './product.controller.js';
import { validate } from '../middlewares/validator.middleware.js';
import { createProductSchema, getProductDetailsSchema } from './product.validator.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.resolve('uploads/product-assets');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    cb(null, `product-${Date.now()}-${Math.floor(Math.random() * 1e9)}${ext}`);
  },
});
const upload = multer({ storage });

const router = Router();

router.get('/', ProductController.listPublic);

router.get('/mine', authenticate, ProductController.listMine);

// US-016: Search Products by Keyword
router.get('/search', ProductController.search);

router.get('/:id', validate(getProductDetailsSchema, 'params'), ProductController.getById);

// Crear producto
router.post('/', authenticate, upload.array('images', 10), validate(createProductSchema), ProductController.create);

// Delete Product
router.delete('/:id', authenticate, ProductController.delete);

export default router;
