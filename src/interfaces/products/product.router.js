import { Router } from 'express';
import ProductController from './product.controller.js';
import { validate } from '../middlewares/validator.middleware.js';
import { createProductSchema } from './product.validator.js';

const router = Router();

router.get('/', ProductController.listPublic);

router.get('/mine', ProductController.listMine);

// US-016: Search Products by Keyword
router.get('/search', ProductController.search);

// Crear producto 
router.post('/', validate(createProductSchema), ProductController.create);

// Delete Product
router.delete('/:id', ProductController.delete);

export default router;
