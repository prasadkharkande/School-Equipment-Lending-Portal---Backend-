'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BorrowRequest extends Model {
    static associate(models) {
      BorrowRequest.belongsTo(models.User, { foreignKey: 'user_id' });
      BorrowRequest.belongsTo(models.Equipment, { foreignKey: 'equipment_id' });
    }
  }
  BorrowRequest.init({
    equipment_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    request_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    return_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'returned'),
      allowNull: false,
      defaultValue: 'pending'
    },
    createdAt: {
      type: 'TIMESTAMP',
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false
    },
    updatedAt: {
      type: 'TIMESTAMP',
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false
    }
    // remarks: {
    //   type: DataTypes.STRING,
    //   allowNull: true
    // },

  }, {
    sequelize,
    modelName: 'BorrowRequest',
    tableName: 'BorrowRequests'
  });
  return BorrowRequest;
};
