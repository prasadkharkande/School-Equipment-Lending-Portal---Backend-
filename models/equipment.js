'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Equipment extends Model {
    static associate(models) {
      // If you have BorrowRequest model, set association here:
      // Equipment.hasMany(models.BorrowRequest, { foreignKey: 'equipment_id' });
    }
  }
  Equipment.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    condition_status: {
      type: DataTypes.STRING,
      allowNull: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    // availableQuantity: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   defaultValue: 1
    // },
    available: {
      type: DataTypes.ENUM('active','inactive'),
      allowNull: false,
      defaultValue: 'active'
    }
  }, {
    sequelize,
    modelName: 'Equipment',
    tableName: 'Equipment'
  });

  // Hook: keep availableQuantity in sync if quantity changed on update
  Equipment.beforeUpdate(async (instance, options) => {
    if (instance.changed('quantity')) {
      // Ensure availableQuantity not greater than quantity
      if (instance.availableQuantity > instance.quantity) {
        instance.availableQuantity = instance.quantity;
      }
    }
  });

  return Equipment;
};
