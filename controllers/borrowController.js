const { BorrowRequest, Equipment, User } = require('../models');
const { Op } = require('sequelize');

// Helper function for consistent response structure
const createResponse = (success, data, message = null, metadata = null) => {
  const response = { success };
  if (message) response.message = message;
  if (data) response.data = data;
  if (metadata) response.metadata = metadata;
  return response;
};

// Student creates a borrow request
exports.createRequest = async (req, res) => {
  try {
    const { equipment_id, request_date, return_date } = req.body;
    const user_id = req.user.id;

    if (!equipment_id || !request_date || !return_date) {
      return res.status(400).json(createResponse(false, null, 
        'equipment_id, request_date, and return_date are required'));
    }

    const equipment = await Equipment.findByPk(equipment_id);
    console.log("-=-=-= equipment : ", equipment);
    console.log("-=-=-= equipment.status : ", equipment.status, "  equipment.dataValues.available : ", !equipment.dataValues.available);
    // if (!equipment || equipment.status !== 'active' || equipment.dataValues.available != 0)
    //   return res.status(404).json({ message: 'Equipment not available' });

    // Prevent overlapping bookings
    const overlapping = await BorrowRequest.findOne({
      where: {
        equipment_id,
        status: { [Op.in]: ['pending', 'approved'] },
        [Op.or]: [
          { request_date: { [Op.between]: [request_date, return_date] } },
          { return_date: { [Op.between]: [request_date, return_date] } }
        ]
      }
    });

    if (overlapping)
      return res.status(409).json({ message: 'Equipment already booked in this period' });

    const newReq = await BorrowRequest.create({
      equipment_id,
      user_id,
      request_date,
      return_date
    });

    return res.status(201).json(createResponse(true, 
      { request: newReq }, 
      'Request submitted successfully'));

  } catch (err) {
    console.error(err);
    return res.status(500).json(createResponse(false, null, 
      'Server error occurred', 
      { error: process.env.NODE_ENV === 'development' ? err.message : undefined }));
  }
};

// Admin: approve or reject
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const request = await BorrowRequest.findByPk(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (!['approved', 'rejected'].includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    if (status === 'approved') {
      const equipment = await Equipment.findByPk(request.equipment_id);
      if (equipment.dataValues.quantity <= 0)
        return res.status(400).json({ message: 'No available units left' });

      equipment.quantity -= 1;
      // const equipmentId =  equipment.equipment_id ? equipment.equipment_id : equipment.dataValues.equipment_id;
      // const availableQty = equipment.quantity ? equipment.quantity : equipment.dataValues.quantity;
      // //await equipment.save();

      //equipment.quantity =  - 1;
      await equipment.save();
      console.log("equipment.quantity  : ", equipment.quantity);
      
      console.log("-=-=- equipment : ", equipment);
      //console.log(" availableQty", availableQty , "  new availableQty  : ", availableQty );
      
      console.log("-=-=-start : ");
      
    }
    console.log("-=-= end  : ");

    request.status = status;
    if (remarks) request.remarks = remarks;
    await request.save();

    res.json({ message: `Request ${status}`, request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: mark returned
exports.markReturned = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await BorrowRequest.findByPk(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'approved')
      return res.status(400).json({ message: 'Only approved items can be returned' });

    const equipment = await Equipment.findByPk(request.equipment_id);
    equipment.quantity += 1;
    await equipment.save();

    request.status = 'returned';
    await request.save();

    res.json({ message: 'Marked as returned', request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: view all requests with pagination
exports.getAllRequests = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // Status filter
    const status = req.query.status;
    const where = status ? { status } : {};

    // Get total count and requests
    const { count, rows: requests } = await BorrowRequest.findAndCountAll({
      where,
      include: [
        { 
          model: Equipment, 
          attributes: ['name', 'category'] 
        },
        { 
          model: User, 
          attributes: ['name', 'email'] 
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    // Format the response
    const totalPages = Math.ceil(count / limit);
    
    return res.json(createResponse(true, 
      { requests }, 
      'Requests retrieved successfully',
      {
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        },
        filters: { status },
        timestamp: new Date().toISOString()
      }
    ));

  } catch (err) {
    console.error(err);
    return res.status(500).json(createResponse(false, null, 
      'Server error occurred',
      { error: process.env.NODE_ENV === 'development' ? err.message : undefined }));
  }
};

// Student: view own requests with pagination
exports.getMyRequests = async (req, res) => {
  try {
    const user_id = req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: requests } = await BorrowRequest.findAndCountAll({
      where: { user_id },
      include: [{ 
        model: Equipment, 
        attributes: ['name', 'category'] 
      }],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    const totalPages = Math.ceil(count / limit);

    return res.json(createResponse(true, 
      { requests },
      'Your requests retrieved successfully',
      {
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      }
    ));

  } catch (err) {
    console.error(err);
    return res.status(500).json(createResponse(false, null, 
      'Server error occurred'));
  }
};
