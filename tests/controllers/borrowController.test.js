const request = require('supertest');
const app = require('../../app');
const { Equipment, User, BorrowRequest } = require('../../models');

describe('Borrow Controller', () => {
  let testUser;
  let testEquipment;
  let testAdmin;

  beforeEach(async () => {
    // Create test data before each test
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'student'
    });

    testAdmin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });

    testEquipment = await Equipment.create({
      name: 'Test Equipment',
      category: 'Test Category',
      condition_status: 'Good',
      quantity: 5,
      available: 5,
      status: 'active'
    });
  });

  afterEach(async () => {
    // Clean up after each test
    await BorrowRequest.destroy({ where: {} });
    await Equipment.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  describe('POST /api/borrow/request', () => {
    it('should create a new borrow request', async () => {
      const response = await request(app)
        .post('/api/borrow/request')
        .set('Authorization', `Bearer ${generateToken(testUser)}`)
        .send({
          equipment_id: testEquipment.id,
          request_date: '2023-11-10',
          return_date: '2023-11-15'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.request).toBeDefined();
    });

    it('should reject request when equipment is not available', async () => {
      // First make equipment unavailable
      testEquipment.available = 0;
      await testEquipment.save();

      const response = await request(app)
        .post('/api/borrow/request')
        .set('Authorization', `Bearer ${generateToken(testUser)}`)
        .send({
          equipment_id: testEquipment.id,
          request_date: '2023-11-10',
          return_date: '2023-11-15'
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/borrow/:id/status', () => {
    let testRequest;

    beforeEach(async () => {
      testRequest = await BorrowRequest.create({
        equipment_id: testEquipment.id,
        user_id: testUser.id,
        request_date: '2023-11-10',
        return_date: '2023-11-15',
        status: 'pending'
      });
    });

    it('should approve a borrow request', async () => {
      const response = await request(app)
        .put(`/api/borrow/${testRequest.id}/status`)
        .set('Authorization', `Bearer ${generateToken(testAdmin)}`)
        .send({
          status: 'approved',
          remarks: 'Approved by admin'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Check equipment quantity was decremented
      const updatedEquipment = await Equipment.findByPk(testEquipment.id);
      expect(updatedEquipment.quantity).toBe(testEquipment.quantity - 1);
    });
  });

  describe('GET /api/borrow/requests', () => {
    beforeEach(async () => {
      // Create multiple borrow requests for testing pagination
      await Promise.all([
        BorrowRequest.create({
          equipment_id: testEquipment.id,
          user_id: testUser.id,
          request_date: '2023-11-10',
          return_date: '2023-11-15',
          status: 'pending'
        }),
        BorrowRequest.create({
          equipment_id: testEquipment.id,
          user_id: testUser.id,
          request_date: '2023-11-16',
          return_date: '2023-11-20',
          status: 'approved'
        })
      ]);
    });

    it('should return paginated list of requests', async () => {
      const response = await request(app)
        .get('/api/borrow/requests')
        .set('Authorization', `Bearer ${generateToken(testAdmin)}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.requests).toHaveLength(2);
      expect(response.body.metadata.pagination).toBeDefined();
    });

    it('should filter requests by status', async () => {
      const response = await request(app)
        .get('/api/borrow/requests')
        .set('Authorization', `Bearer ${generateToken(testAdmin)}`)
        .query({ status: 'pending' });

      expect(response.status).toBe(200);
      expect(response.body.data.requests).toHaveLength(1);
      expect(response.body.data.requests[0].status).toBe('pending');
    });
  });
});

// Helper function to generate JWT tokens for testing
function generateToken(user) {
  // Implement your JWT token generation logic here
  // This should match your actual authentication implementation
  return 'test-token';
}