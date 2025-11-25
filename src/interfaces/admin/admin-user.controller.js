import ListUsers from '../../application/use-cases/ListUsers.js';
import GetUserById from '../../application/use-cases/GetUserById.js';
import UpdateUser from '../../application/use-cases/UpdateUser.js';
import SuspendUser from '../../application/use-cases/SuspendUser.js';
import ActivateUser from '../../application/use-cases/ActivateUser.js';
import DeleteUser from '../../application/use-cases/DeleteUser.js';
import AdminUserSerializer from '../serializers/AdminUserSerializer.js';

class AdminUserController {
    /**
     * GET /admin/users - List users with pagination and filters
     */
    async list(req, res, next) {
        try {
            const { page, limit, search, role, isActive } = req.query;

            // Convert isActive from string to boolean if present
            let isActiveBoolean;
            if (isActive !== undefined) {
                isActiveBoolean = isActive === 'true' || isActive === true;
            }

            const result = await ListUsers.execute({
                page,
                limit,
                search,
                role,
                isActive: isActiveBoolean,
            });

            const serialized = AdminUserSerializer.serialize(result.users);

            // Add pagination metadata
            serialized.meta = {
                total: result.total,
                page: result.page,
                totalPages: result.totalPages,
            };

            res.status(200).json(serialized);
        } catch (err) {
            next(err);
        }
    }

    /**
     * GET /admin/users/:id - Get user details
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const user = await GetUserById.execute({ userId: id });

            res.status(200).json(AdminUserSerializer.serialize(user, {
                included: ['stores', 'sellerRequests']
            }));
        } catch (err) {
            next(err);
        }
    }

    /**
     * PATCH /admin/users/:id - Update user
     */
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const adminId = req.user.id;
            const updates = req.body;

            const updatedUser = await UpdateUser.execute({
                userId: id,
                adminId,
                updates,
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
            });

            res.status(200).json(AdminUserSerializer.serialize(updatedUser));
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /admin/users/:id/suspend - Suspend user
     */
    async suspend(req, res, next) {
        try {
            const { id } = req.params;
            const adminId = req.user.id;

            const updatedUser = await SuspendUser.execute({
                userId: id,
                adminId,
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
            });

            res.status(200).json(AdminUserSerializer.serialize(updatedUser));
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /admin/users/:id/activate - Activate user
     */
    async activate(req, res, next) {
        try {
            const { id } = req.params;
            const adminId = req.user.id;

            const updatedUser = await ActivateUser.execute({
                userId: id,
                adminId,
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
            });

            res.status(200).json(AdminUserSerializer.serialize(updatedUser));
        } catch (err) {
            next(err);
        }
    }

    /**
     * DELETE /admin/users/:id - Delete user (hard delete)
     */
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const adminId = req.user.id;

            await DeleteUser.execute({
                userId: id,
                adminId,
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
            });

            res.status(204).send();
        } catch (err) {
            next(err);
        }
    }
}

export default new AdminUserController();
