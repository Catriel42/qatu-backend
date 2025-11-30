import { jest } from '@jest/globals';

// Mocking dependencies before they are imported
const mockUserRepo = {
  create: jest.fn(),
  findById: jest.fn(),
  findByColumn: jest.fn(),
  findByIamId: jest.fn(),
  updateById: jest.fn(),
  count: jest.fn(),
};

const mockAuditLogRepo = {
  create: jest.fn(),
};

jest.unstable_mockModule('../src/application/repositories/UserRepository.js', () => ({
  default: mockUserRepo,
}));

jest.unstable_mockModule('../src/application/repositories/AuditLogRepository.js', () => ({
    default: mockAuditLogRepo,
}));

// Dynamically import modules after mocks are set up
const { default: CreateUser } = await import('../src/application/use-cases/CreateUser.js');
const { default: UpdateUser } = await import('../src/application/use-cases/UpdateUser.js');
const { NotFoundError, AuthorizationError } = await import('../src/domain/errors/httpErrors.js');


describe('Backend Use Cases: User Management', () => {

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  // --- Tests for CreateUser Use Case ---
  describe('CreateUser', () => {
    it('should create a new user if they do not exist', async () => {
      // Arrange
      const userData = { iamId: 'new-iam-id', email: 'new@example.com', fullName: 'New User' };
      const expectedUser = { id: 'user-id-1', ...userData };

      mockUserRepo.findByIamId.mockResolvedValue(null); // User does not exist
      mockUserRepo.create.mockResolvedValue(expectedUser);

      // Act
      const user = await CreateUser.execute(userData);

      // Assert
      expect(mockUserRepo.findByIamId).toHaveBeenCalledWith(userData.iamId);
      expect(mockUserRepo.create).toHaveBeenCalledWith(userData);
      expect(user).toEqual(expectedUser);
    });

    it('should return the existing user if they already exist', async () => {
      // Arrange
      const userData = { iamId: 'existing-iam-id', email: 'existing@example.com', fullName: 'Existing User' };
      const existingUser = { id: 'user-id-2', ...userData };

      mockUserRepo.findByIamId.mockResolvedValue(existingUser);

      // Act
      const user = await CreateUser.execute(userData);

      // Assert
      expect(mockUserRepo.findByIamId).toHaveBeenCalledWith(userData.iamId);
      expect(mockUserRepo.create).not.toHaveBeenCalled(); // Should not create a new user
      expect(user).toEqual(existingUser);
    });
  });

  // --- Tests for UpdateUser Use Case ---
  describe('UpdateUser', () => {
    const adminId = 'admin-user-id';
    const targetUserId = 'target-user-id';
    const ipAddress = '127.0.0.1';
    const userAgent = 'jest-test';

    const mockUser = {
      id: targetUserId,
      full_name: 'Original Name',
      email: 'original@example.com',
      role: 'buyer',
      phone: '123456789',
      is_active: true,
      dataValues: {
        stores: [],
        sellerRequests: [],
      }
    };
    
    it('should update a user and create an audit log', async () => {
      // Arrange
      const updates = { fullName: 'Updated Name', phone: '987654321' };
      const updatedUser = { ...mockUser, full_name: 'Updated Name', phone: '987654321' };

      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.updateById.mockResolvedValue(updatedUser);

      // Act
      const result = await UpdateUser.execute({
        userId: targetUserId,
        adminId,
        updates,
        ipAddress,
        userAgent,
      });

      // Assert
      expect(mockUserRepo.findById).toHaveBeenCalledWith(targetUserId);
      expect(mockUserRepo.updateById).toHaveBeenCalledWith(targetUserId, { fullName: 'Updated Name', phone: '987654321' });
      expect(mockAuditLogRepo.create).toHaveBeenCalledWith({
        userId: adminId,
        action: 'user_update',
        entityType: 'user',
        entityId: targetUserId,
        details: {
          changes: {
            fullName: { old: 'Original Name', new: 'Updated Name' },
            phone: { old: '123456789', new: '987654321' },
          },
        },
        ipAddress,
        userAgent,
      });
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundError if user to update does not exist', async () => {
      // Arrange
      mockUserRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(UpdateUser.execute({
        userId: 'non-existent-id',
        adminId,
        updates: { fullName: 'any' },
      })).rejects.toThrow(NotFoundError);

      expect(mockAuditLogRepo.create).not.toHaveBeenCalled();
    });

    it('should prevent an admin from updating their own role', async () => {
      // Arrange
      const updates = { role: 'admin' };
      mockUserRepo.findById.mockResolvedValue({ id: adminId, role: 'buyer' });

      // Act & Assert
      await expect(UpdateUser.execute({
        userId: adminId, // Admin is updating themselves
        adminId,
        updates,
      })).rejects.toThrow(AuthorizationError);
      
      expect(mockAuditLogRepo.create).not.toHaveBeenCalled();
      expect(mockUserRepo.updateById).not.toHaveBeenCalled();
    });
    
    it('should prevent an admin from deactivating their own account', async () => {
      // Arrange
      const updates = { isActive: false };
      mockUserRepo.findById.mockResolvedValue({ id: adminId, is_active: true });
      
      // Act & Assert
      await expect(UpdateUser.execute({
        userId: adminId, // Admin is updating themselves
        adminId,
        updates,
      })).rejects.toThrow(AuthorizationError);

      expect(mockAuditLogRepo.create).not.toHaveBeenCalled();
      expect(mockUserRepo.updateById).not.toHaveBeenCalled();
    });

    it('should allow an admin to update their own non-restricted fields', async () => {
      // Arrange
      const selfUpdates = { fullName: 'Admin New Name' };
      const selfUser = { id: adminId, role: 'admin', full_name: 'Admin Old Name' };
      const updatedSelfUser = { ...selfUser, full_name: 'Admin New Name' };

      mockUserRepo.findById.mockResolvedValue(selfUser);
      mockUserRepo.updateById.mockResolvedValue(updatedSelfUser);

      // Act
      await UpdateUser.execute({
        userId: adminId,
        adminId,
        updates: selfUpdates,
        ipAddress,
        userAgent,
      });

      // Assert
      expect(mockUserRepo.updateById).toHaveBeenCalledWith(adminId, selfUpdates);
      expect(mockAuditLogRepo.create).toHaveBeenCalled();
    });
  });
});
