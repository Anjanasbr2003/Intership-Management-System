const { Op } = require('sequelize');
const { Application, JobPosting, StudentProfile, User, University } = require('../models');

// @desc    Apply for a job vacancy (Student)
// @route   POST /api/employer/apply/:jobId
// @access  Private (Student)
const applyForJob = async (req, res) => {
  try {
    const job = await JobPosting.findByPk(req.params.jobId);
    if (!job || job.status !== 'open') {
      return res.status(404).json({ message: 'Job vacancy not found or closed' });
    }

    const existingApp = await Application.findOne({
      where: {
        jobId: job.id,
        studentId: req.user.id,
      },
    });

    if (existingApp) {
      return res.status(400).json({ message: 'You have already applied for this job vacancy' });
    }

    const application = await Application.create({
      jobId: job.id,
      studentId: req.user.id,
      employerId: job.employerId,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student's own applications
// @route   GET /api/employer/my-applications
// @access  Private (Student)
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.findAll({
      where: { studentId: req.user.id },
      include: [
        { model: JobPosting, as: 'job' },
        {
          model: User,
          as: 'employer',
          attributes: ['id', 'companyName', 'name', 'email', 'phone', 'companyCategory'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const result = applications.map((app) => {
      const appObj = app.toJSON();
      if (app.job) appObj.jobId = app.job.toJSON();
      if (app.employer) appObj.employerId = app.employer.toJSON();
      return appObj;
    });

    res.json({ success: true, applications: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get applicants for an employer (divided / filterable by job vacancy)
// @route   GET /api/employer/applicants
// @access  Private (Employer)
const getApplicantsForEmployer = async (req, res) => {
  try {
    const { jobId } = req.query;
    let whereClause = { employerId: req.user.id };
    if (jobId && jobId !== 'all') {
      whereClause.jobId = jobId;
    }

    const applications = await Application.findAll({
      where: whereClause,
      include: [
        {
          model: JobPosting,
          as: 'job',
          attributes: ['id', 'title', 'category', 'jobType', 'availability', 'location'],
        },
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'personalEmail', 'phone', 'livingCity'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const studentUserIds = applications.map((a) => a.studentId).filter(Boolean);
    const profiles = await StudentProfile.findAll({
      where: { userId: studentUserIds },
      include: [{ model: University, as: 'university', attributes: ['id', 'name', 'code'] }],
    });

    const result = applications.map((app) => {
      const appObj = app.toJSON();
      if (app.job) appObj.jobId = app.job.toJSON();
      if (app.student) appObj.studentId = app.student.toJSON();

      const profile = profiles.find((p) => p.userId === app.studentId);
      let profileObj = null;
      if (profile) {
        profileObj = profile.toJSON();
        if (profile.university) {
          profileObj.universityId = profile.university.toJSON();
        }
      }
      appObj.studentProfile = profileObj;
      return appObj;
    });

    res.json({ success: true, applicants: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Review (approve / reject) an application
// @route   PATCH /api/employer/applicants/:id/status
// @access  Private (Employer)
const reviewApplicant = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    const application = await Application.findByPk(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (String(application.employerId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Unauthorized to review this application' });
    }

    application.status = status;
    application.reviewedAt = new Date();
    await application.save();

    res.json({
      success: true,
      message: `Applicant ${status} successfully.`,
      application,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get auto-matched suggested interns based on employer's category
// @route   GET /api/employer/suggested-students
// @access  Private (Employer)
const getSuggestedStudents = async (req, res) => {
  try {
    const employerCategory = req.user.companyCategory || '';
    let categoryFilter = {};

    if (employerCategory) {
      const catLower = employerCategory.toLowerCase();
      let matchedTerm = '';
      if (catLower.includes('it') || catLower.includes('software') || catLower.includes('tech')) {
        matchedTerm = 'IT';
      } else if (catLower.includes('bio') || catLower.includes('science')) {
        matchedTerm = 'Science';
      } else if (catLower.includes('agri')) {
        matchedTerm = 'Agriculture';
      } else if (catLower.includes('art') || catLower.includes('design')) {
        matchedTerm = 'Art';
      } else if (catLower.includes('doc') || catLower.includes('business') || catLower.includes('manage')) {
        matchedTerm = 'Management';
      } else if (catLower.includes('engine')) {
        matchedTerm = 'Engineering';
      } else {
        matchedTerm = employerCategory;
      }

      categoryFilter = {
        [Op.or]: [
          { mainCategory: { [Op.like]: `%${matchedTerm}%` } },
          { desiredField: { [Op.like]: `%${matchedTerm}%` } },
        ],
      };
    }

    const profiles = await StudentProfile.findAll({
      where: categoryFilter,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'livingCity'],
        },
        {
          model: University,
          as: 'university',
          attributes: ['id', 'name', 'code', 'location'],
        },
      ],
      limit: 25,
    });

    const result = profiles.map((p) => {
      const pObj = p.toJSON();
      if (p.user) pObj.userId = p.user.toJSON();
      if (p.university) pObj.universityId = p.university.toJSON();
      return pObj;
    });

    res.json({
      success: true,
      categoryMatched: employerCategory || 'All Categories',
      students: result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getApplicantsForEmployer,
  reviewApplicant,
  getSuggestedStudents,
};

