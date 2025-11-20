
import { jest } from '@jest/globals';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock firebase-admin
jest.unstable_mockModule('firebase-admin', () => ({
    default: {
        apps: [],
        initializeApp: jest.fn(),
        credential: { cert: jest.fn() },
        auth: () => ({
            verifyIdToken: jest.fn(async (token) => {
                return { uid: token };
            })
        })
    }
}));

// Mock ProductRepository
jest.unstable_mockModule('../src/application/repositories/ProductRepository.js', () => ({
    default: {
        findById: jest.fn(),
        updateById: jest.fn()
    }
}));

// Mock UserRepository
jest.unstable_mockModule('../src/application/repositories/UserRepository.js', () => ({
    default: {
        findByColumn: jest.fn()
    }
}));

// Dynamic imports after mocks
const request = (await import('supertest')).default;
const { default: app } = await import('../src/index.js');
const ProductRepository = (await import('../src/application/repositories/ProductRepository.js')).default;
const UserRepository = (await import('../src/application/repositories/UserRepository.js')).default;

describe('PATCH /api/products/:id', () => {
    const sellerId = 'seller-123';
    const otherSellerId = 'other-seller-456';
    const productId = 'product-789';
    const storeId = 'store-abc';

    const sellerToken = 'seller-iam-id-123';
    const otherToken = 'other-iam-id-456';

    const mockSellerUser = {
        id: sellerId,
        fullName: 'Seller User',
        email: 'seller@example.com',
        role: 'seller',
        iamId: sellerToken
    };

    const mockOtherUser = {
        id: otherSellerId,
        fullName: 'Other User',
        email: 'other@example.com',
        role: 'seller',
        iamId: otherToken
    };

    const mockProduct = {
        id: productId,
        name: 'Original Product',
        description: 'Original Description',
        price: '100.00',
        stock: 10,
        storeId: storeId,
        status: 'active',
        store: {
            id: storeId,
            sellerId: sellerId,
            name: 'Test Store'
        },
        images: []
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup default mocks
        UserRepository.findByColumn.mockImplementation(async (column, value) => {
            if (value === sellerToken) return mockSellerUser;
            if (value === otherToken) return mockOtherUser;
            return null;
        });
    });

    it('should update product details successfully when owner requests', async () => {
        ProductRepository.findById.mockResolvedValue(mockProduct);
        ProductRepository.updateById.mockResolvedValue({
            ...mockProduct,
            name: 'Updated Product',
            price: '150.00'
        });

        const res = await request(app)
            .patch(`/api/products/${productId}`)
            .set('Authorization', `Bearer ${sellerToken}`)
            .send({
                name: 'Updated Product',
                price: 150.00
            });

        expect(res.status).toBe(200);
        expect(res.body.data.attributes.name).toBe('Updated Product');
        expect(res.body.data.attributes.price).toBe('150.00');
        expect(ProductRepository.updateById).toHaveBeenCalledWith(
            productId,
            expect.objectContaining({
                name: 'Updated Product',
                price: 150.00
            }),
            []
        );
    });

    it('should return 403 if non-owner tries to update', async () => {
        ProductRepository.findById.mockResolvedValue(mockProduct);

        const res = await request(app)
            .patch(`/api/products/${productId}`)
            .set('Authorization', `Bearer ${otherToken}`)
            .send({
                name: 'Hacked Product'
            });

        expect(res.status).toBe(403);
        expect(ProductRepository.updateById).not.toHaveBeenCalled();
    });

    it('should return 404 if product does not exist', async () => {
        ProductRepository.findById.mockResolvedValue(null);

        const res = await request(app)
            .patch(`/api/products/nonexistent-id`)
            .set('Authorization', `Bearer ${sellerToken}`)
            .send({
                name: 'Ghost Product'
            });

        expect(res.status).toBe(404);
        expect(ProductRepository.updateById).not.toHaveBeenCalled();
    });

    it('should validate input fields', async () => {
        ProductRepository.findById.mockResolvedValue(mockProduct);

        const res = await request(app)
            .patch(`/api/products/${productId}`)
            .set('Authorization', `Bearer ${sellerToken}`)
            .send({
                price: -10
            });

        expect(res.status).toBe(400);
        expect(ProductRepository.updateById).not.toHaveBeenCalled();
    });

    it('should handle image uploads (add new image)', async () => {
        const mockProductWithImages = {
            ...mockProduct,
            images: [
                { id: 'img-1', imageUrl: 'http://example.com/image1.jpg', displayOrder: 0 },
                { id: 'img-2', imageUrl: '/uploads/product-assets/product-123.png', displayOrder: 1 }
            ]
        };

        ProductRepository.findById.mockResolvedValue(mockProduct);
        ProductRepository.updateById.mockResolvedValue(mockProductWithImages);

        const filePath = path.resolve(__dirname, 'test_image.png');
        fs.writeFileSync(filePath, 'fake image content');

        const res = await request(app)
            .patch(`/api/products/${productId}`)
            .set('Authorization', `Bearer ${sellerToken}`)
            .field('description', 'Updated with image')
            .attach('images', filePath);

        fs.unlinkSync(filePath);

        expect(res.status).toBe(200);
        expect(ProductRepository.updateById).toHaveBeenCalled();
        const updateCall = ProductRepository.updateById.mock.calls[0];
        expect(updateCall[2]).toEqual(expect.arrayContaining([
            expect.stringContaining('/uploads/product-assets/')
        ]));
    });
});
