const { sequelize } = require('../config/db');
const User = require('./User');
const University = require('./University');
const StudentProfile = require('./StudentProfile');
const JobPosting = require('./JobPosting');
const Application = require('./Application');
const DailyProgressLog = require('./DailyProgressLog');
const JoinRequest = require('./JoinRequest');

// 1. User & University
User.belongsTo(University, { foreignKey: 'universityId', as: 'university' });
University.hasMany(User, { foreignKey: 'universityId', as: 'users' });

University.belongsTo(User, { foreignKey: 'headUserId', as: 'headUser' });
University.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

// 2. StudentProfile
User.hasOne(StudentProfile, { foreignKey: 'userId', as: 'profile' });
StudentProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });
StudentProfile.belongsTo(University, { foreignKey: 'universityId', as: 'university' });
University.hasMany(StudentProfile, { foreignKey: 'universityId', as: 'studentProfiles' });

// 3. JobPosting
JobPosting.belongsTo(User, { foreignKey: 'employerId', as: 'employer' });
User.hasMany(JobPosting, { foreignKey: 'employerId', as: 'jobPostings' });

// 4. Application
Application.belongsTo(JobPosting, { foreignKey: 'jobId', as: 'job' });
JobPosting.hasMany(Application, { foreignKey: 'jobId', as: 'applications' });
Application.belongsTo(User, { foreignKey: 'studentId', as: 'student' });
Application.belongsTo(User, { foreignKey: 'employerId', as: 'employer' });

// 5. DailyProgressLog
DailyProgressLog.belongsTo(User, { foreignKey: 'studentId', as: 'student' });
DailyProgressLog.belongsTo(University, { foreignKey: 'universityId', as: 'university' });

// 6. JoinRequest
JoinRequest.belongsTo(User, { foreignKey: 'supervisorId', as: 'supervisor' });
JoinRequest.belongsTo(University, { foreignKey: 'universityId', as: 'university' });
JoinRequest.belongsTo(User, { foreignKey: 'headUserId', as: 'headUser' });

module.exports = {
  sequelize,
  User,
  University,
  StudentProfile,
  JobPosting,
  Application,
  DailyProgressLog,
  JoinRequest,
};
