const { Op } = require('sequelize');
const { JobPosting } = require('../models');

// @desc    Create a job vacancy (Employer)
// @route   POST /api/jobs
// @access  Private (Approved Employer)
const createJob = async (req, res) => {
  try {
    const { title, category, description, jobType, availability, location, deadline } = req.body;
    if (!title || !category || !description) {
      return res.status(400).json({ message: 'Title, category, and description are required' });
    }

    const job = await JobPosting.create({
      employerId: req.user.id,
      companyName: req.user.companyName || req.user.name,
      title,
      category,
      description,
      jobType: jobType || 'Full-Time Internship',
      availability: availability || 'Immediate',
      location: location || 'Colombo / Remote',
      deadline: deadline ? new Date(deadline) : null,
    });

    res.status(201).json({ success: true, message: 'Job vacancy published successfully', job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all open jobs (for students)
// @route   GET /api/jobs
// @access  Private
const getAllJobs = async (req, res) => {
  try {
    const { category, search } = req.query;
    let whereClause = { status: 'open' };

    if (category && category !== 'All') {
      whereClause.category = category;
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { companyName: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const jobs = await JobPosting.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get jobs posted by current employer
// @route   GET /api/jobs/employer/my-jobs
// @access  Private (Employer)
const getEmployerJobs = async (req, res) => {
  try {
    const jobs = await JobPosting.findAll({
      where: { employerId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createJob, getAllJobs, getEmployerJobs };

