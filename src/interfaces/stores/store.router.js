import { Router } from 'express';
import StoreController from './store.controller.js';
import { validate } from '../middlewares/validator.middleware.js';
import { createStoreSchema, updateStoreSchema } from './store.validator.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.resolve('uploads/store-assets');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    const base = file.fieldname === 'logo' ? 'logo' : 'banner';
    cb(null, `${base}-${Date.now()}-${Math.floor(Math.random() * 1e9)}${ext}`);
  },
});
const upload = multer({ storage });

const router = Router();

router.post(
  '/',
  upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'banner', maxCount: 1 }]),
  validate(createStoreSchema),
  StoreController.create
);

router.patch(
  '/:id',
  upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'banner', maxCount: 1 }]),
  validate(updateStoreSchema),
  StoreController.update
);

export default router;
