const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const JobPosting = sequelize.define(
  'JobPosting',
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
    employerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    companyName: {
      type: DataTypes.STRING,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    jobType: {
      type: DataTypes.ENUM('Full-Time Internship', 'Part-Time Internship', 'Remote'),
      defaultValue: 'Full-Time Internship',
    },
    availability: {
      type: DataTypes.STRING,
      defaultValue: 'Immediate',
    },
    location: {
      type: DataTypes.STRING,
      defaultValue: 'Colombo / Remote',
    },
    deadline: {
      type: DataTypes.DATE,
    },
    status: {
      type: DataTypes.ENUM('open', 'closed'),
      defaultValue: 'open',
    },
  },
  {
    tableName: 'job_postings',
    timestamps: true,
  }
);

JobPosting.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;
  return values;
};

module.exports = JobPosting;

