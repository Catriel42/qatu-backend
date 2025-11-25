import { Router } from 'express';
import AdminUserController from './admin-user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validator.middleware.js';
import { listUsersQuerySchema, updateUserSchema, idParamSchema } from './admin-user.validator.js';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize(['admin']));

// GET /admin/users - List users
router.get('/', validate({ query: listUsersQuerySchema }), AdminUserController.list);

// GET /admin/users/:id - Get user details
router.get('/:id', validate({ params: idParamSchema }), AdminUserController.getById);

// PATCH /admin/users/:id - Update user
router.patch('/:id',
    validate({ params: idParamSchema, body: updateUserSchema }),
    AdminUserController.update
);

// POST /admin/users/:id/suspend - Suspend user
router.post('/:id/suspend', validate({ params: idParamSchema }), AdminUserController.suspend);

// POST /admin/users/:id/activate - Activate user
router.post('/:id/activate', validate({ params: idParamSchema }), AdminUserController.activate);

// DELETE /admin/users/:id - Delete user
router.delete('/:id', validate({ params: idParamSchema }), AdminUserController.delete);

export default router;
