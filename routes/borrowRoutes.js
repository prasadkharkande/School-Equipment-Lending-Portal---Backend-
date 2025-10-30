const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrowController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

// Students
router.post('/', authenticate, authorizeRoles('student', 'staff'), borrowController.createRequest);
router.get('/requests', authenticate, authorizeRoles('student', 'staff'), borrowController.getMyRequests);

// Admin
router.get('/', authenticate, authorizeRoles('admin'), borrowController.getAllRequests);
router.put('/:id/status', authenticate, authorizeRoles('admin'), borrowController.updateStatus);
router.put('/:id/return', authenticate, authorizeRoles('admin'), borrowController.markReturned);

module.exports = router;
