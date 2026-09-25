const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const DailyProgressLog = sequelize.define(
  'DailyProgressLog',
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
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    universityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    hoursWorked: {
      type: DataTypes.FLOAT,
      defaultValue: 8,
      validate: {
        min: 0,
        max: 24,
      },
    },
    tasksCompleted: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    learnings: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: 'daily_progress_logs',
    timestamps: true,
  }
);

DailyProgressLog.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;
  return values;
};

module.exports = DailyProgressLog;

