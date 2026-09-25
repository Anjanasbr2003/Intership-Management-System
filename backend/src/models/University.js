const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const University = sequelize.define(
  'University',
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    code: {
      type: DataTypes.STRING,
    },
    location: {
      type: DataTypes.STRING,
    },
    headUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    applierName: {
      type: DataTypes.STRING,
    },
    applierPosition: {
      type: DataTypes.STRING,
    },
    contactNum: {
      type: DataTypes.STRING,
    },
    universityEmail: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
    reviewedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: 'universities',
    timestamps: true,
  }
);

University.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;
  return values;
};

module.exports = University;

