const { University, User, StudentProfile, JobPosting } = require('../models');
const bcrypt = require('bcryptjs');

// @desc    Get dashboard statistics for Admin
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
  try {
    const [
      pendingUniversities,
      approvedUniversities,
      pendingEmployers,
      approvedEmployers,
      totalStudents,
      totalSupervisors,
      totalJobs,
    ] = await Promise.all([
      University.count({ where: { status: 'pending' } }),
      University.count({ where: { status: 'approved' } }),
      User.count({ where: { role: 'employer', status: 'pending' } }),
      User.count({ where: { role: 'employer', status: 'approved' } }),
      User.count({ where: { role: 'student' } }),
      User.count({ where: { role: 'supervisor' } }),
      JobPosting.count(),
    ]);

    res.json({
      success: true,
      stats: {
        pendingUniversities,
        approvedUniversities,
        pendingEmployers,
        approvedEmployers,
        totalStudents,
        totalSupervisors,
        totalJobs,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending university registrations
// @route   GET /api/admin/universities/pending
// @access  Private (Admin)
const getPendingUniversities = async (req, res) => {
  try {
    const universities = await University.findAll({
      where: { status: 'pending' },
      include: [
        {
          model: User,
          as: 'headUser',
          attributes: ['id', 'name', 'email', 'phone', 'position'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const result = universities.map((u) => {
      const uObj = u.toJSON();
      if (u.headUser) {
        uObj.headUserId = u.headUser.toJSON();
      }
      return uObj;
    });

    res.json({ success: true, universities: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve or reject a university registration
// @route   PATCH /api/admin/universities/:id/status
// @access  Private (Admin)
const reviewUniversity = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be approved or rejected.' });
    }

    const university = await University.findByPk(req.params.id);
    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }

    university.status = status;
    university.reviewedBy = req.user.id;
    await university.save();

    if (university.headUserId) {
      await User.update(
        { status: status === 'approved' ? 'approved' : 'rejected' },
        { where: { id: university.headUserId } }
      );
    }

    res.json({
      success: true,
      message: `University ${status} successfully.`,
      university,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending employer registrations
// @route   GET /api/admin/employers/pending
// @access  Private (Admin)
const getPendingEmployers = async (req, res) => {
  try {
    const employers = await User.findAll({
      where: { role: 'employer', status: 'pending' },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, employers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve or reject employer registration
// @route   PATCH /api/admin/employers/:id/status
// @access  Private (Admin)
const reviewEmployer = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const employer = await User.findOne({
      where: { id: req.params.id, role: 'employer' },
    });
    if (!employer) {
      return res.status(404).json({ message: 'Employer not found' });
    }

    employer.status = status;
    await employer.save();

    res.json({
      success: true,
      message: `Employer account ${status} successfully.`,
      employer,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users read-only (Admin oversight)
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [
        {
          model: University,
          as: 'university',
          attributes: ['id', 'name', 'code'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const result = users.map((u) => {
      const uObj = u.toJSON();
      if (u.university) {
        uObj.universityId = u.university.toJSON();
      }
      return uObj;
    });

    res.json({ success: true, users: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove user (Admin privilege: add/remove users without editing profiles)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const removeUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot remove system administrator' });
    }

    if (user.role === 'student') {
      await StudentProfile.destroy({ where: { userId: user.id } });
    }
    await user.destroy();

    res.json({ success: true, message: `User ${user.name} removed successfully.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add user manually (Admin privilege)
// @route   POST /api/admin/users
// @access  Private (Admin)
const addUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, position } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required' });
    }

    const exists = await User.findOne({ where: { email: email.toLowerCase() } });
    if (exists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      status: 'active',
      phone,
      position,
    });

    const userObj = newUser.toJSON();
    delete userObj.password;

    res.status(201).json({ success: true, message: 'User created successfully', user: userObj });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getPendingUniversities,
  reviewUniversity,
  getPendingEmployers,
  reviewEmployer,
  getAllUsers,
  removeUser,
  addUser,
};

