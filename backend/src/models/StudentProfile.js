const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const StudentProfile = sequelize.define(
  'StudentProfile',
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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    universityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    studentRegNo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    degreeProgram: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mainCategory: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'IT',
    },
    desiredField: {
      type: DataTypes.STRING,
    },
    workType: {
      type: DataTypes.ENUM('Remote', 'Onsite', 'Hybrid'),
      defaultValue: 'Hybrid',
    },
    availability: {
      type: DataTypes.ENUM('Full-Time', 'Part-Time'),
      defaultValue: 'Full-Time',
    },
    profilePic: {
      type: DataTypes.STRING(500),
    },
    gpa: {
      type: DataTypes.STRING,
    },
    livingCity: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
    },
    universityEmail: {
      type: DataTypes.STRING,
    },
    personalEmail: {
      type: DataTypes.STRING,
    },
    skills: {
      type: DataTypes.JSON,
      defaultValue: [],
      get() {
        const raw = this.getDataValue('skills');
        if (!raw) return [];
        if (typeof raw === 'string') {
          try {
            return JSON.parse(raw);
          } catch {
            return raw.split(',').map((s) => s.trim());
          }
        }
        return raw;
      },
    },
    bio: {
      type: DataTypes.TEXT,
    },
    linkedinUrl: {
      type: DataTypes.STRING(500),
    },
    githubUrl: {
      type: DataTypes.STRING(500),
    },
    portfolioUrl: {
      type: DataTypes.STRING(500),
    },
    cvUrl: {
      type: DataTypes.STRING(500),
    },
  },
  {
    tableName: 'student_profiles',
    timestamps: true,
  }
);

StudentProfile.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;
  return values;
};

module.exports = StudentProfile;

