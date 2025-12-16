import { Router } from 'express';
import ChristmasController from './christmas.controller.js';

const router = Router();

router.get('/', ChristmasController.sayMerryChristmas);

export default router;
