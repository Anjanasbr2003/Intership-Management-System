const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Application = sequelize.define(
  'Application',
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
    jobId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    employerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
    reviewedAt: {
      type: DataTypes.DATE,
    },
    appliedAt: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue('createdAt') || new Date();
      },
    },
  },
  {
    tableName: 'applications',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['jobId', 'studentId'],
      },
    ],
  }
);

Application.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;
  values.appliedAt = values.appliedAt || values.createdAt;
  return values;
};

module.exports = Application;

