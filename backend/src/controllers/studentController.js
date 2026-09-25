const { StudentProfile, DailyProgressLog, User, University } = require('../models');

// @desc    Get student's own profile
// @route   GET /api/students/profile
// @access  Private (Student)
const getProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({
      where: { userId: req.user.id },
      include: [{ model: University, as: 'university', attributes: ['id', 'name', 'code'] }],
    });

    let profileObj = null;
    if (profile) {
      profileObj = profile.toJSON();
      if (profile.university) {
        profileObj.universityId = profile.university.toJSON();
      }
    }

    res.json({ success: true, user: req.user, profile: profileObj });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update student profile (All fields editable anytime by student)
// @route   PUT /api/students/profile
// @access  Private (Student)
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      livingCity,
      personalEmail,
      studentRegNo,
      degreeProgram,
      mainCategory,
      desiredField,
      workType,
      availability,
      profilePic,
      gpa,
      skills,
      bio,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
    } = req.body;

    let profile = await StudentProfile.findOne({ where: { userId: req.user.id } });
    if (!profile) {
      profile = await StudentProfile.create({
        userId: req.user.id,
        universityId: req.user.universityId || 1,
        studentRegNo: studentRegNo || 'REG-001',
        degreeProgram: degreeProgram || 'Undergraduate Degree',
      });
    }

    if (studentRegNo !== undefined) profile.studentRegNo = studentRegNo;
    if (degreeProgram !== undefined) profile.degreeProgram = degreeProgram;
    if (mainCategory !== undefined) profile.mainCategory = mainCategory;
    if (desiredField !== undefined) profile.desiredField = desiredField;
    if (workType !== undefined) profile.workType = workType;
    if (availability !== undefined) profile.availability = availability;
    if (profilePic !== undefined) profile.profilePic = profilePic;
    if (gpa !== undefined) profile.gpa = gpa;
    if (livingCity !== undefined) profile.livingCity = livingCity;
    if (phone !== undefined) profile.phone = phone;
    if (personalEmail !== undefined) profile.personalEmail = personalEmail;
    if (bio !== undefined) profile.bio = bio;
    if (linkedinUrl !== undefined) profile.linkedinUrl = linkedinUrl;
    if (githubUrl !== undefined) profile.githubUrl = githubUrl;
    if (portfolioUrl !== undefined) profile.portfolioUrl = portfolioUrl;

    if (skills !== undefined) {
      profile.skills = Array.isArray(skills)
        ? skills
        : skills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    await profile.save();

    // Update user root fields if changed
    const userUpdates = {};
    if (name) userUpdates.name = name;
    if (phone) userUpdates.phone = phone;
    if (livingCity) userUpdates.livingCity = livingCity;
    if (personalEmail) userUpdates.personalEmail = personalEmail;
    if (Object.keys(userUpdates).length > 0) {
      await User.update(userUpdates, { where: { id: req.user.id } });
    }

    res.json({ success: true, message: 'Profile updated successfully', profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload student CV
// @route   POST /api/students/cv
// @access  Private (Student)
const uploadCV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const cvUrl = `/uploads/cvs/${req.file.filename}`;
    let profile = await StudentProfile.findOne({ where: { userId: req.user.id } });
    if (!profile) {
      profile = await StudentProfile.create({
        userId: req.user.id,
        universityId: req.user.universityId || 1,
        studentRegNo: 'REG-001',
        degreeProgram: 'Degree',
      });
    }

    profile.cvUrl = cvUrl;
    await profile.save();

    res.json({
      success: true,
      message: 'CV uploaded successfully',
      cvUrl,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload Profile Picture
// @route   POST /api/students/profile-picture
// @access  Private (Student)
const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const profilePic = `/uploads/profiles/${req.file.filename}`;
    let profile = await StudentProfile.findOne({ where: { userId: req.user.id } });
    if (!profile) {
      profile = await StudentProfile.create({
        userId: req.user.id,
        universityId: req.user.universityId || 1,
        studentRegNo: 'REG-001',
        degreeProgram: 'Degree',
      });
    }

    profile.profilePic = profilePic;
    await profile.save();

    // Also synchronize to User record
    const { User } = require('../models');
    const user = await User.findByPk(req.user.id);
    if (user) {
      user.profilePic = profilePic;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profilePic,
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({ message: error.message || 'Failed to upload profile picture' });
  }
};

// @desc    Add daily progress log
// @route   POST /api/students/logs
// @access  Private (Student)
const addDailyProgressLog = async (req, res) => {
  try {
    const { date, hoursWorked, tasksCompleted, learnings } = req.body;
    if (!date || !tasksCompleted) {
      return res.status(400).json({ message: 'Date and completed task description are required' });
    }

    let universityId = req.user.universityId;
    if (!universityId) {
      const profile = await StudentProfile.findOne({ where: { userId: req.user.id } });
      if (profile && profile.universityId) {
        universityId = profile.universityId;
        req.user.universityId = universityId;
        await req.user.save();
      }
    }

    if (!universityId) {
      return res.status(400).json({
        message: 'Please associate your student account with an approved university before submitting progress logs.',
      });
    }

    const log = await DailyProgressLog.create({
      studentId: req.user.id,
      universityId,
      date: new Date(date),
      hoursWorked: hoursWorked ? Number(hoursWorked) : 8,
      tasksCompleted,
      learnings: learnings || '',
    });

    res.status(201).json({ success: true, message: 'Daily progress log recorded', log });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current student's own daily progress logs
// @route   GET /api/students/logs
// @access  Private (Student)
const getMyProgressLogs = async (req, res) => {
  try {
    const logs = await DailyProgressLog.findAll({
      where: { studentId: req.user.id },
      order: [['date', 'DESC']],
    });
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a student's progress logs & full profile
//          Visible to: Head of same uni, Supervisor of same uni, ALL Employers, and Admin
//          Blocked to: Other students (Student X cannot see Student Y)
// @route   GET /api/students/:id/logs
// @access  Private
const getStudentProgressLogs = async (req, res) => {
  try {
    // Constraint: Student X cannot view Student Y
    if (req.user.role === 'student' && String(req.user.id) !== String(req.params.id)) {
      return res.status(403).json({ message: 'Access denied: Students cannot inspect other students profiles' });
    }

    const student = await User.findByPk(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Constraint: Head and Supervisor can only see students from their own university
    if (['head', 'supervisor'].includes(req.user.role)) {
      if (
        !req.user.universityId ||
        !student.universityId ||
        String(req.user.universityId) !== String(student.universityId)
      ) {
        return res.status(403).json({
          message: 'Access restricted: This student is not registered under your university',
        });
      }
    }

    const logs = await DailyProgressLog.findAll({
      where: { studentId: student.id },
      order: [['date', 'DESC']],
    });

    const profile = await StudentProfile.findOne({
      where: { userId: student.id },
      include: [{ model: University, as: 'university', attributes: ['id', 'name', 'code'] }],
    });

    let profileObj = null;
    if (profile) {
      profileObj = profile.toJSON();
      if (profile.university) {
        profileObj.universityId = profile.university.toJSON();
      }
    }

    res.json({
      success: true,
      student: {
        _id: student.id,
        id: student.id,
        name: student.name,
        email: student.email,
        personalEmail: student.personalEmail,
        phone: student.phone,
        livingCity: student.livingCity,
      },
      profile: profileObj,
      logs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadCV,
  uploadProfilePic,
  addDailyProgressLog,
  getMyProgressLogs,
  getStudentProgressLogs,
};

