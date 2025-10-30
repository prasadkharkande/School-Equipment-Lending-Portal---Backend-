const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', authenticate, equipmentController.getAllEquipment);
router.get('/:id', authenticate, equipmentController.getEquipmentById);

/*
    Admin only: create, update, delete
 */
router.post('/', authenticate, authorizeRoles('admin'), equipmentController.createEquipment);
router.put('/:id', authenticate, authorizeRoles('admin'), equipmentController.updateEquipment);
router.delete('/:id', authenticate, authorizeRoles('admin'), equipmentController.deleteEquipment);

module.exports = router;
