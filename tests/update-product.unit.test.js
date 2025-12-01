import db from '../src/domain/models/index.js';
import UpdateProduct from '../src/application/use-cases/UpdateProduct.js';
import { ValidationError, NotFoundError, AuthorizationError } from '../src/domain/errors/httpErrors.js';

const { User, Store, Product, ProductImage, Category } = db;

describe('UpdateProduct Use Case - Integration Tests', () => {
    let sellerId, otherSellerId, productId, storeId, categoryId;

    beforeEach(async () => {
        // Create category
        const category = await Category.create({
            name: 'Electronics',
            description: 'Electronic items',
            slug: 'electronics'
        });
        categoryId = category.id;

        // Create sellers
        const seller = await User.create({
            fullName: 'Seller User',
            email: 'seller@example.com',
            role: 'seller',
            isActive: true,
            iamId: 'seller-iam-123'
        });
        sellerId = seller.id;

        const otherSeller = await User.create({
            fullName: 'Other Seller',
            email: 'other@example.com',
            role: 'seller',
            isActive: true,
            iamId: 'other-iam-456'
        });
        otherSellerId = otherSeller.id;

        // Create store for seller
        const store = await Store.create({
            sellerId: sellerId,
            name: 'Test Store',
            description: 'A test store',
            logoUrl: '/logo.png',
            slug: 'test-store'
        });
        storeId = store.id;

        // Create product
        const product = await Product.create({
            storeId: storeId,
            categoryId: categoryId,
            name: 'Original Product',
            description: 'Original Description',
            price: 100.00,
            stock: 10,
            status: 'draft'
        });
        productId = product.id;
    });

    describe('Success Cases', () => {
        it('should update product details successfully when owner requests', async () => {
            const result = await UpdateProduct.execute({
                productId,
                sellerId,
                payload: {
                    name: 'Updated Product',
                    price: 150.00
                },
                imageUrls: [],
                imagesToDelete: []
            });

            expect(result.name).toBe('Updated Product');
            expect(parseFloat(result.price)).toBe(150.00);
        });

        it('should update only allowed fields', async () => {
            const result = await UpdateProduct.execute({
                productId,
                sellerId,
                payload: {
                    description: 'New Description',
                    stock: 20,
                    invalidField: 'should be ignored'
                },
                imageUrls: [],
                imagesToDelete: []
            });

            expect(result.description).toBe('New Description');
            expect(result.stock).toBe(20);
            expect(result.invalidField).toBeUndefined();
        });

        it('should update product with new images', async () => {
            const result = await UpdateProduct.execute({
                productId,
                sellerId,
                payload: {},
                imageUrls: ['/uploads/image1.jpg', '/uploads/image2.jpg'],
                imagesToDelete: []
            });

            expect(result.imageUrls).toHaveLength(2);
            expect(result.imageUrls).toContain('/uploads/image1.jpg');
            expect(result.imageUrls).toContain('/uploads/image2.jpg');
        });

        it('should delete images from product', async () => {
            // First add images
            await ProductImage.bulkCreate([
                { productId: productId, imageUrl: '/uploads/old1.jpg', displayOrder: 0, isPrimary: true },
                { productId: productId, imageUrl: '/uploads/old2.jpg', displayOrder: 1, isPrimary: false }
            ]);

            const images = await ProductImage.findAll({ where: { productId } });
            const imageToDeleteId = images[0].id;

            const result = await UpdateProduct.execute({
                productId,
                sellerId,
                payload: {},
                imageUrls: [],
                imagesToDelete: [imageToDeleteId]
            });

            expect(result.imageUrls).toHaveLength(1);
            expect(result.imageUrls).not.toContain('/uploads/old1.jpg');
        });

        it('should update all allowed fields at once', async () => {
            const payload = {
                name: 'Complete Update',
                description: 'New Description',
                price: 200.00,
                stock: 50,
                categoryId: categoryId,
                status: 'active'
            };

            const result = await UpdateProduct.execute({
                productId,
                sellerId,
                payload,
                imageUrls: [],
                imagesToDelete: []
            });

            expect(result.name).toBe('Complete Update');
            expect(result.description).toBe('New Description');
            expect(parseFloat(result.price)).toBe(200.00);
            expect(result.stock).toBe(50);
            expect(result.status).toBe('active');
        });
    });

    describe('Validation Errors', () => {
        it('should throw ValidationError if productId is missing', async () => {
            await expect(
                UpdateProduct.execute({
                    productId: null,
                    sellerId,
                    payload: { name: 'Test' },
                    imageUrls: [],
                    imagesToDelete: []
                })
            ).rejects.toThrow(ValidationError);
        });

        it('should throw ValidationError if sellerId is missing', async () => {
            await expect(
                UpdateProduct.execute({
                    productId,
                    sellerId: null,
                    payload: { name: 'Test' },
                    imageUrls: [],
                    imagesToDelete: []
                })
            ).rejects.toThrow(ValidationError);
        });

        it('should throw ValidationError if no valid fields or images provided', async () => {
            await expect(
                UpdateProduct.execute({
                    productId,
                    sellerId,
                    payload: {},
                    imageUrls: [],
                    imagesToDelete: []
                })
            ).rejects.toThrow(ValidationError);
        });
    });

    describe('Authorization Errors', () => {
        it('should throw AuthorizationError if non-owner tries to update', async () => {
            await expect(
                UpdateProduct.execute({
                    productId,
                    sellerId: otherSellerId,
                    payload: { name: 'Hacked Product' },
                    imageUrls: [],
                    imagesToDelete: []
                })
            ).rejects.toThrow(AuthorizationError);
        });
    });

    describe('Not Found Errors', () => {
        it('should throw NotFoundError if product does not exist', async () => {
            await expect(
                UpdateProduct.execute({
                    productId: '00000000-0000-0000-0000-000000000000',
                    sellerId,
                    payload: { name: 'Ghost Product' },
                    imageUrls: [],
                    imagesToDelete: []
                })
            ).rejects.toThrow(NotFoundError);
        });
    });
});
