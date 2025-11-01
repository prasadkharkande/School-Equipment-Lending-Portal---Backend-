const { BorrowRequest, Equipment, User } = require('../models');
const { Op } = require('sequelize');

// Student creates a borrow request
exports.createRequest = async (req, res) => {
  try {
    const { equipment_id, request_date, return_date } = req.body;
    const user_id = req.user.id; // from JWT

    if (!equipment_id || !request_date || !return_date)
      return res.status(400).json({ message: 'equipment_id, request_date, return_date required' });

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

    res.status(201).json({ message: 'Request submitted', request: newReq });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
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

// Student: view own requests
exports.getMyRequests = async (req, res) => {
  try {
    const user_id = req.user.id;
    const requests = await BorrowRequest.findAll({
      where: { user_id },
      include: [{ model: Equipment, attributes: ['name', 'category'] }]
    });
    res.json({ requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: view all requests
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await BorrowRequest.findAll({
      include: [
        { model: Equipment, attributes: ['name'] },
        { model: User, attributes: ['name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json({ requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
