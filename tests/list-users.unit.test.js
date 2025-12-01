import db from '../src/domain/models/index.js';
import ListUsers from '../src/application/use-cases/ListUsers.js';

const { User } = db;

describe('ListUsers Use Case - Integration Tests', () => {
    describe('Success Cases', () => {
        beforeEach(async () => {
            // Create test users
            await User.bulkCreate([
                {
                    fullName: 'John Doe',
                    email: 'john@example.com',
                    role: 'buyer',
                    isActive: true,
                    iamId: 'iam-john'
                },
                {
                    fullName: 'Jane Smith',
                    email: 'jane@example.com',
                    role: 'seller',
                    isActive: true,
                    iamId: 'iam-jane'
                },
                {
                    fullName: 'Bob Wilson',
                    email: 'bob@example.com',
                    role: 'buyer',
                    isActive: false,
                    iamId: 'iam-bob'
                }
            ]);
        });

        it('should list users with default pagination', async () => {
            const result = await ListUsers.execute();

            expect(result.users).toHaveLength(3);
            expect(result.total).toBe(3);
            expect(result.page).toBe(1);
            expect(result.totalPages).toBe(1);
        });

        it('should list users with custom pagination', async () => {
            // Create more users for pagination
            await User.bulkCreate(Array.from({ length: 12 }, (_, i) => ({
                fullName: `User ${i + 4}`,
                email: `user${i + 4}@example.com`,
                role: 'buyer',
                isActive: true,
                iamId: `iam-user-${i + 4}`
            })));

            const result = await ListUsers.execute({
                page: 2,
                limit: 5
            });

            expect(result.users).toHaveLength(5);
            expect(result.total).toBe(15);
            expect(result.page).toBe(2);
            expect(result.totalPages).toBe(3);
        });

        it('should filter users by role', async () => {
            const result = await ListUsers.execute({ role: 'seller' });

            expect(result.users).toHaveLength(1);
            expect(result.users[0].role).toBe('seller');
            expect(result.users[0].fullName).toBe('Jane Smith');
        });

        it('should filter users by active status', async () => {
            const result = await ListUsers.execute({ isActive: true });

            expect(result.users).toHaveLength(2);
            expect(result.users.every(u => u.isActive === true)).toBe(true);
        });

        it('should search users by name or email', async () => {
            const result = await ListUsers.execute({ search: 'john' });

            expect(result.users).toHaveLength(1);
            expect(result.users[0].fullName).toBe('John Doe');
        });

        it('should combine multiple filters', async () => {
            const result = await ListUsers.execute({
                role: 'buyer',
                isActive: true
            });

            expect(result.users).toHaveLength(1);
            expect(result.users[0].fullName).toBe('John Doe');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty results', async () => {
            const result = await ListUsers.execute({ search: 'nonexistent' });

            expect(result.users).toHaveLength(0);
            expect(result.total).toBe(0);
            expect(result.totalPages).toBe(0);
        });

        it('should calculate total pages correctly', async () => {
            await User.bulkCreate(Array.from({ length: 23 }, (_, i) => ({
                fullName: `User ${i + 1}`,
                email: `user${i + 1}@example.com`,
                role: 'buyer',
                isActive: true,
                iamId: `iam-user-${i + 1}`
            })));

            const result = await ListUsers.execute({ limit: 10 });

            expect(result.totalPages).toBe(3); // 23 items / 10 per page = 3 pages
        });
    });
});
