const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const JoinRequest = sequelize.define(
  'JoinRequest',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    _id: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue('id');
      },
    },
    supervisorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    universityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    headUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    staffRegNo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    position: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
    reviewedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: 'join_requests',
    timestamps: true,
  }
);

JoinRequest.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;
  return values;
};

module.exports = JoinRequest;

