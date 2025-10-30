// controller/equipmentController.js
const { Equipment } = require('../models')

/**
 * Create new equipment (Admin only)
 */
exports.createEquipment = async (req, res) => {
  try {
    const { name, category, condition_status, quantity, status } = req.body;
    if (!name || !category || typeof quantity === 'undefined') {
      return res.status(400).json({ message: 'name, category and quantity are required' });
    }

    const eq = await Equipment.create({
      name,
      category,
      condition_status: condition_status || 'Good',
      quantity: parseInt(quantity, 10),
      availableQuantity: parseInt(quantity, 10),
      status: status || 'active'
    });

    res.status(201).json({ equipment: eq });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * Get all equipment (with optional filters: category, available)
 * Example: GET /api/equipment?category=Sports&available=true
 */
exports.getAllEquipment = async (req, res) => {
  try {
    const { category, available, q } = req.query;
    const where = { available: 'active' };

    if (category) where.category = category;
    if (available === 'true') where.availableQuantity = { $gt: 0 }; // Sequelize v5 style; we'll adapt below

    // For Sequelize v6 use Sequelize.Op
    const { Op } = require('sequelize');
    if (available === 'true') where.availableQuantity = { [Op.gt]: 0 };

    if (q) {
      // simple partial search on name
      where.name = { [Op.like]: `%${q}%` };
    }

    const list = await Equipment.findAll({ where, order: [['name', 'ASC']] });
    res.json({ equipment: list });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * Get single equipment by id
 */
exports.getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const eq = await Equipment.findByPk(id);
    if (!eq) return res.status(404).json({ message: 'Equipment not found' });
    res.json({ equipment: eq });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update equipment (Admin only)
 */
exports.updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const eq = await Equipment.findByPk(id);
    if (!eq) return res.status(404).json({ message: 'Equipment not found' });

    const { name, category, condition_status, quantity, availableQuantity, status } = req.body;

    // If quantity is reduced below already lent items, we must ensure availableQuantity <= quantity.
    // Business logic: we will cap availableQuantity to new quantity.
    if (typeof quantity !== 'undefined') {
      const newQuantity = parseInt(quantity, 10);
      if (isNaN(newQuantity) || newQuantity < 0) {
        return res.status(400).json({ message: 'quantity must be non-negative integer' });
      }
      eq.quantity = newQuantity;
      if (eq.availableQuantity > newQuantity) eq.availableQuantity = newQuantity;
    }

    if (typeof availableQuantity !== 'undefined') {
      const av = parseInt(availableQuantity, 10);
      if (isNaN(av) || av < 0 || av > eq.quantity) {
        return res.status(400).json({ message: 'availableQuantity must be between 0 and quantity' });
      }
      eq.availableQuantity = av;
    }

    if (name) eq.name = name;
    if (category) eq.category = category;
    if (condition_status) eq.condition_status = condition_status;
    if (status) eq.status = status;

    await eq.save();
    res.json({ equipment: eq });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * Delete equipment (Admin only) - soft delete by setting status=inactive
 * If you want hard delete, replace with eq.destroy()
 */
exports.deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const eq = await Equipment.findByPk(id);
    if (!eq) return res.status(404).json({ message: 'Equipment not found' });

    // Soft delete
    eq.status = 'inactive';
    await eq.save();

    res.json({ message: 'Equipment marked inactive' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
