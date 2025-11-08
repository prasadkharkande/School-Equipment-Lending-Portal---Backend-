const { Equipment } = require('../models')
const { Op } = require('sequelize')

const createResponse = (success, data = null, message = null, metadata = null) => {
  const resp = { success }
  if (message) resp.message = message
  if (data !== null) resp.data = data
  if (metadata) resp.metadata = metadata
  return resp
}

const serializeEquipment = (equipment) => ({
  id: equipment.id,
  name: equipment.name,
  category: equipment.category,
  condition: equipment.condition_status,
  quantity: equipment.quantity,
  available: equipment.available,
  status: equipment.status,
  createdAt: equipment.createdAt
});

// Create new equipment (Admin only)
exports.createEquipment = async (req, res) => {
  try {
    const { name, category, condition_status, quantity, status } = req.body
    if (!name || !category || typeof quantity === 'undefined') {
      return res.status(400).json(createResponse(false, null, 'name, category and quantity are required'))
    }

    const qty = parseInt(quantity, 10)
    if (isNaN(qty) || qty < 0) {
      return res.status(400).json(createResponse(false, null, 'quantity must be a non-negative integer'))
    }

    const eq = await Equipment.create({
      name,
      category,
      condition_status: condition_status || 'Good',
      quantity: qty,
      available: qty, // available should start equal to quantity
      status: status || 'active'
    })

    return res.status(201).json(createResponse(true, { equipment: serializeEquipment(eq) }, 'Equipment created'))
  } catch (err) {
    console.error(err)
    return res.status(500).json(createResponse(false, null, 'Server error', { details: process.env.NODE_ENV === 'development' ? err.message : undefined }))
  }
}

/**
 * Get all equipment (filters: category, available, q) with pagination
 * GET /api/equipment?category=...&available=true&q=...&page=1&limit=10
 */
exports.getAllEquipment = async (req, res) => {
  try {
    const { category, available, q } = req.query

    // default to active items
    const where = { status: 'active' }

    if (category) where.category = category
    if (available === 'true') where.available = { [Op.gt]: 0 }
    if (q) where.name = { [Op.like]: `%${q}%` }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1)
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1)
    const offset = (page - 1) * limit

    const { count, rows } = await Equipment.findAndCountAll({
      where,
      order: [['name', 'ASC']],
      limit,
      offset,
      attributes: ['id', 'name', 'category', 'condition_status', 'quantity', 'available', 'status', 'createdAt']
    })

    const items = rows.map(serializeEquipment)
    const pages = Math.ceil(count / limit)

    return res.status(200).json(createResponse(true, { items }, 'Equipment list retrieved', {
      pagination: { total: count, page, limit, pages, hasNext: page < pages, hasPrev: page > 1 },
      filters: { category, available, q },
      timestamp: new Date().toISOString()
    }))
  } catch (err) {
    console.error(err)
    return res.status(500).json(createResponse(false, null, 'Server error', { details: process.env.NODE_ENV === 'development' ? err.message : undefined }))
  }
}

/**
 * Get single equipment by id
 */
exports.getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params
    const eq = await Equipment.findByPk(id, {
      attributes: ['id', 'name', 'category', 'condition_status', 'quantity', 'available', 'status', 'createdAt']
    })
    if (!eq) return res.status(404).json(createResponse(false, null, 'Equipment not found'))
    return res.status(200).json(createResponse(true, { equipment: serializeEquipment(eq) }))
  } catch (err) {
    console.error(err)
    return res.status(500).json(createResponse(false, null, 'Server error', { details: process.env.NODE_ENV === 'development' ? err.message : undefined }))
  }
}

/**
 * Update equipment (Admin only)
 */
exports.updateEquipment = async (req, res) => {
  try {
    const { id } = req.params
    const eq = await Equipment.findByPk(id)
    if (!eq) return res.status(404).json(createResponse(false, null, 'Equipment not found'))

    const { name, category, condition_status, quantity, available, status } = req.body

    if (typeof quantity !== 'undefined') {
      const newQuantity = parseInt(quantity, 10)
      if (isNaN(newQuantity) || newQuantity < 0) {
        return res.status(400).json(createResponse(false, null, 'quantity must be non-negative integer'))
      }
      // adjust available if needed
      if (eq.available > newQuantity) eq.available = newQuantity
      eq.quantity = newQuantity
    }

    if (typeof available !== 'undefined') {
      const av = parseInt(available, 10)
      if (isNaN(av) || av < 0 || av > (eq.quantity ?? Number.MAX_SAFE_INTEGER)) {
        return res.status(400).json(createResponse(false, null, 'available must be between 0 and quantity'))
      }
      eq.available = av
    }

    if (name) eq.name = name
    if (category) eq.category = category
    if (condition_status) eq.condition_status = condition_status
    if (status) eq.status = status

    await eq.save()
    return res.json(createResponse(true, { equipment: serializeEquipment(eq) }, 'Equipment updated'))
  } catch (err) {
    console.error(err)
    return res.status(500).json(createResponse(false, null, 'Server error', { details: process.env.NODE_ENV === 'development' ? err.message : undefined }))
  }
}

/**
 * Delete equipment (Admin only) - soft delete by setting status = 'inactive'
 */
exports.deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params
    const eq = await Equipment.findByPk(id)
    if (!eq) return res.status(404).json(createResponse(false, null, 'Equipment not found'))

    eq.status = 'inactive'
    eq.available = 0
    await eq.save()

    return res.json(createResponse(true, { equipment: serializeEquipment(eq) }, 'Equipment marked inactive'))
  } catch (err) {
    console.error(err)
    return res.status(500).json(createResponse(false, null, 'Server error', { details: process.env.NODE_ENV === 'development' ? err.message : undefined }))
  }
}
