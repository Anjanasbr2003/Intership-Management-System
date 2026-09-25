const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define(
  'User',
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
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
      set(value) {
        this.setDataValue('email', value ? value.toLowerCase().trim() : value);
      },
    },
    personalEmail: {
      type: DataTypes.STRING,
      set(value) {
        this.setDataValue('personalEmail', value ? value.toLowerCase().trim() : null);
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'head', 'supervisor', 'student', 'employer'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'active'),
      defaultValue: 'pending',
    },
    phone: {
      type: DataTypes.STRING,
    },
    livingCity: {
      type: DataTypes.STRING,
    },
    position: {
      type: DataTypes.STRING,
    },
    staffRegNo: {
      type: DataTypes.STRING,
    },
    universityId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    companyName: {
      type: DataTypes.STRING,
    },
    companyCategory: {
      type: DataTypes.STRING,
    },
    recruiterName: {
      type: DataTypes.STRING,
    },
    recruitmentArea: {
      type: DataTypes.STRING,
    },
    recruiterDesignation: {
      type: DataTypes.STRING,
    },
    recruiterLinkedin: {
      type: DataTypes.STRING,
    },
    recruiterContactNumber: {
      type: DataTypes.STRING,
    },
    businessRegNumber: {
      type: DataTypes.STRING,
    },
    taxId: {
      type: DataTypes.STRING,
    },
    companyWebsite: {
      type: DataTypes.STRING,
    },
    profilePic: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    // Security & Hardening Fields
    passwordChangedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordExpire: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    failedLoginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lockUntil: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'users',
    timestamps: true,
  }
);

User.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;
  return values;
};

module.exports = User;

