const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { User, University, StudentProfile, JoinRequest } = require('../models');
const { logSecurityEvent } = require('../utils/securityLogger');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'interlink_super_secure_jwt_secret_key_2026',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user (Fine-tuned role-specific flows)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const {
      role,
      name,
      email, // university email or company email
      personalEmail,
      password,
      phone,
      livingCity,

      // University Head fields
      universityName,
      applierPosition,

      // Supervisor fields
      position,
      staffRegNo,
      universityId,
      autoSendJoinRequest,

      // Student fields
      studentRegNo,
      degreeProgram,
      mainCategory,
      desiredField,
      workType,
      availability,
      profilePic,
      gpa,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      skills,
      cvUrl,

      // Employer fields
      companyName,
      companyCategory,
      recruiterName,
      recruitmentArea,
      recruiterDesignation,
      recruiterLinkedin,
      recruiterContactNumber,
      businessRegNumber,
      taxId,
      companyWebsite,
    } = req.body;

    if (!role || !name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, password, and role are required.' });
    }

    // Security Hardening: Block privilege escalation - admin role cannot be self-registered
    const ALLOWED_PUBLIC_ROLES = ['student', 'employer', 'head', 'supervisor'];
    if (!ALLOWED_PUBLIC_ROLES.includes(role)) {
      logSecurityEvent({
        type: 'PRIVILEGE_ESCALATION_BLOCKED',
        severity: 'WARN',
        ip: req.ip || req.connection?.remoteAddress,
        details: `Blocked public registration attempt with restricted role: '${role}'`,
      });
      return res.status(403).json({ message: 'Registration with this role is not permitted.' });
    }

    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email is already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let initialStatus = 'pending';
    if (role === 'student') {
      initialStatus = 'active'; // Students activate immediately per FR-06
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      personalEmail: personalEmail ? personalEmail.toLowerCase() : null,
      password: hashedPassword,
      role,
      status: initialStatus,
      phone,
      livingCity,
      position: role === 'head' ? applierPosition : position,
      staffRegNo: role === 'supervisor' ? staffRegNo : null,
      universityId: (role === 'student' || role === 'supervisor') ? universityId : null,
      profilePic: profilePic || null,

      // Employer details
      companyName: role === 'employer' ? companyName : null,
      companyCategory: role === 'employer' ? companyCategory : null,
      recruiterName: role === 'employer' ? (recruiterName || name) : null,
      recruitmentArea: role === 'employer' ? recruitmentArea : null,
      recruiterDesignation: role === 'employer' ? recruiterDesignation : null,
      recruiterLinkedin: role === 'employer' ? recruiterLinkedin : null,
      recruiterContactNumber: role === 'employer' ? recruiterContactNumber : null,
      businessRegNumber: role === 'employer' ? businessRegNumber : null,
      taxId: role === 'employer' ? taxId : null,
      companyWebsite: role === 'employer' ? companyWebsite : null,
    });

    // 1. Head secondary creation (University record)
    if (role === 'head') {
      const existingUni = await University.findOne({ where: { name: universityName } });
      let university;
      if (existingUni) {
        existingUni.headUserId = user.id;
        existingUni.applierName = name;
        existingUni.applierPosition = applierPosition || 'Dean / HOD';
        existingUni.contactNum = phone;
        existingUni.universityEmail = email;
        existingUni.status = 'pending';
        await existingUni.save();
        university = existingUni;
      } else {
        university = await University.create({
          name: universityName || `${name}'s University`,
          headUserId: user.id,
          applierName: name,
          applierPosition: applierPosition || 'Dean / HOD',
          contactNum: phone,
          universityEmail: email,
          status: 'pending',
        });
      }
      user.universityId = university.id;
      await user.save();
    }

    // 2. Supervisor secondary creation (Join request)
    else if (role === 'supervisor') {
      if (universityId) {
        const uni = await University.findByPk(universityId);
        if (uni) {
          user.universityId = uni.id;
          await user.save();
          if (autoSendJoinRequest) {
            await JoinRequest.create({
              supervisorId: user.id,
              universityId: uni.id,
              headUserId: uni.headUserId,
              staffRegNo: staffRegNo || 'STAFF-REG',
              position: position || 'Lecturer',
              status: 'pending',
            });
          }
        }
      }
    }

    // 3. Student secondary creation (StudentProfile)
    else if (role === 'student') {
      await StudentProfile.create({
        userId: user.id,
        universityId,
        studentRegNo: studentRegNo || 'REG-PENDING',
        degreeProgram: degreeProgram || 'Undergraduate Degree',
        mainCategory: mainCategory || 'IT',
        desiredField: desiredField || '',
        workType: workType || 'Hybrid',
        availability: availability || 'Full-Time',
        profilePic: profilePic || '',
        gpa: gpa || '',
        livingCity: livingCity || '',
        phone,
        universityEmail: email,
        personalEmail: personalEmail || '',
        skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s) => s.trim()) : []),
        linkedinUrl: linkedinUrl || '',
        githubUrl: githubUrl || '',
        portfolioUrl: portfolioUrl || '',
        cvUrl: cvUrl || '',
      });
    }

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user.id,
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        position: user.position,
        universityId: user.universityId,
        companyName: user.companyName,
        companyCategory: user.companyCategory,
        profilePic: user.profilePic || '',
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token (Supports Institutional Email, Personal Email, Student Reg No, or Staff Reg No)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter your email or registration number and password' });
    }

    const cleanInput = email.toLowerCase().trim();

    // 1. Check if matching StudentProfile by studentRegNo, universityEmail, or personalEmail
    let profileUserIds = [];
    try {
      const matchingProfiles = await StudentProfile.findAll({
        where: {
          [Op.or]: [
            { studentRegNo: cleanInput },
            { universityEmail: cleanInput },
            { personalEmail: cleanInput },
          ],
        },
        attributes: ['userId'],
      });
      profileUserIds = matchingProfiles.map((p) => p.userId);
    } catch (profErr) {
      // Non-blocking fallback if profile query encounters issues
    }

    // 2. Build candidate lookup across User attributes and matching profile IDs
    const userConditions = [
      { email: cleanInput },
      { personalEmail: cleanInput },
      { staffRegNo: cleanInput },
    ];
    if (profileUserIds.length > 0) {
      userConditions.push({ id: { [Op.in]: profileUserIds } });
    }

    const candidateUsers = await User.findAll({
      where: {
        [Op.or]: userConditions,
      },
      include: [{ model: University, as: 'university' }],
      order: [['id', 'DESC']], // Most recent first
    });

    let authenticatedUser = null;
    let isMatch = false;

    if (candidateUsers.length > 0) {
      // Check passwords against matching candidate accounts (skipping currently locked accounts)
      for (const candidate of candidateUsers) {
        if (candidate.lockUntil && candidate.lockUntil > new Date()) {
          continue;
        }
        const match = await bcrypt.compare(password, candidate.password);
        if (match) {
          authenticatedUser = candidate;
          isMatch = true;
          break;
        }
      }

      // If no password matched, check if all matching candidates were locked
      if (!authenticatedUser) {
        const lockedCandidate = candidateUsers.find(
          (c) => c.lockUntil && c.lockUntil > new Date()
        );
        if (lockedCandidate) {
          const remainingMinutes = Math.ceil(
            (lockedCandidate.lockUntil - new Date()) / 1000 / 60
          );
          logSecurityEvent({
            type: 'LOCKED_ACCOUNT_LOGIN_ATTEMPT',
            severity: 'WARN',
            ip: req.ip || req.connection?.remoteAddress,
            userId: lockedCandidate.id,
            email: lockedCandidate.email,
            details: `Login attempt on locked account (${remainingMinutes}m remaining)`,
          });

          return res.status(423).json({
            success: false,
            message: `Account is temporarily locked due to consecutive failed login attempts. Please try again in ${remainingMinutes} minute(s).`,
          });
        }
      }
    } else {
      // 5. Prevent user enumeration: timing equalization dummy bcrypt comparison
      await bcrypt.compare(password, '$2a$10$e8ZaX4q7C8nIq5jH3dK9.OC4u9Yx1aA0zV3/E0b.7V9i5F8k1L2mW');
    }

    if (!authenticatedUser || !isMatch) {
      if (candidateUsers.length > 0) {
        const targetUser = candidateUsers[0];
        const attempts = (targetUser.failedLoginAttempts || 0) + 1;
        targetUser.failedLoginAttempts = attempts;
        if (attempts >= 5) {
          targetUser.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
          logSecurityEvent({
            type: 'ACCOUNT_LOCKED',
            severity: 'WARN',
            ip: req.ip || req.connection?.remoteAddress,
            userId: targetUser.id,
            email: targetUser.email,
            details: 'Account locked for 15 minutes following 5 consecutive failed login attempts.',
          });
        }
        await targetUser.save();
      }

      logSecurityEvent({
        type: 'FAILED_LOGIN_ATTEMPT',
        severity: 'WARN',
        ip: req.ip || req.connection?.remoteAddress,
        email: cleanInput,
        details: 'Invalid credentials provided for login.',
      });

      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Login successful: reset failed login attempts and clear lockout
    if (authenticatedUser.failedLoginAttempts > 0 || authenticatedUser.lockUntil) {
      authenticatedUser.failedLoginAttempts = 0;
      authenticatedUser.lockUntil = null;
      await authenticatedUser.save();
    }

    logSecurityEvent({
      type: 'SUCCESSFUL_LOGIN',
      severity: 'INFO',
      ip: req.ip || req.connection?.remoteAddress,
      userId: authenticatedUser.id,
      email: authenticatedUser.email,
      details: `User logged in successfully (Role: ${authenticatedUser.role})`,
    });

    const token = generateToken(authenticatedUser.id);

    res.json({
      success: true,
      token,
      user: {
        _id: authenticatedUser.id,
        id: authenticatedUser.id,
        name: authenticatedUser.name,
        email: authenticatedUser.email,
        personalEmail: authenticatedUser.personalEmail || '',
        role: authenticatedUser.role,
        status: authenticatedUser.status,
        position: authenticatedUser.position,
        universityId: authenticatedUser.university || authenticatedUser.universityId,
        companyName: authenticatedUser.companyName,
        companyCategory: authenticatedUser.companyCategory,
        profilePic: authenticatedUser.profilePic || '',
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update password & invalidate prior sessions (3. Reset sessions on password change)
// @route   PUT /api/auth/update-password
// @access  Private
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current password and new password are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long.' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      logSecurityEvent({
        type: 'PASSWORD_UPDATE_FAILED',
        severity: 'WARN',
        ip: req.ip,
        userId: user.id,
        email: user.email,
        details: 'Incorrect current password provided during password change.',
      });
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    // Setting passwordChangedAt invalidates all previously issued JWT tokens across all devices
    user.passwordChangedAt = new Date();
    await user.save();

    logSecurityEvent({
      type: 'PASSWORD_CHANGED',
      severity: 'INFO',
      ip: req.ip,
      userId: user.id,
      email: user.email,
      details: 'User successfully changed password. Prior sessions invalidated.',
    });

    // Issue fresh token for the current session
    const freshToken = generateToken(user.id);

    res.json({
      success: true,
      message: 'Password updated successfully. All other active sessions have been invalidated.',
      token: freshToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request password reset link (4. Expire reset links, 5. Prevent user enumeration)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please enter your email address.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: cleanEmail },
          { personalEmail: cleanEmail },
        ],
      },
      order: [['id', 'DESC']],
    });

    if (user) {
      // Generate secure 32-byte random reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      // Hash token before storing in database
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      user.resetPasswordToken = hashedToken;
      // 4. Expire reset links: strictly 15 minutes expiration window
      user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();

      logSecurityEvent({
        type: 'PASSWORD_RESET_REQUESTED',
        severity: 'INFO',
        ip: req.ip,
        userId: user.id,
        email: user.email,
        details: 'Password reset link generated with 15-minute expiration.',
      });

      // In production, send via email. In development, include in console
      console.log(`[Interlink Security] Password reset token for ${cleanEmail}: ${resetToken}`);
    } else {
      // User does not exist: equalize timing to prevent timing attack enumeration
      await bcrypt.compare('dummy', '$2a$10$e8ZaX4q7C8nIq5jH3dK9.OC4u9Yx1aA0zV3/E0b.7V9i5F8k1L2mW');
    }

    // 5. Prevent user enumeration: ALWAYS return identical generic confirmation
    res.json({
      success: true,
      message: 'If an account with that email exists, password reset instructions have been dispatched.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password using reset token (4. Expire reset links, 3. Reset sessions)
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long.' });
    }

    // Hash token to look up against stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { [Op.gt]: new Date() }, // Must not be expired
      },
    });

    if (!user) {
      logSecurityEvent({
        type: 'INVALID_RESET_TOKEN_USED',
        severity: 'WARN',
        ip: req.ip,
        details: 'Failed password reset attempt with invalid or expired token.',
      });
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset link. Please request a new link.',
      });
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    // 3. Reset all existing sessions upon password reset
    user.passwordChangedAt = new Date();
    // Invalidate reset token (single-use protection)
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    // Clear any previous account lockouts
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    logSecurityEvent({
      type: 'PASSWORD_RESET_COMPLETED',
      severity: 'INFO',
      ip: req.ip,
      userId: user.id,
      email: user.email,
      details: 'Password successfully reset via token. All old sessions invalidated.',
    });

    res.json({
      success: true,
      message: 'Password reset successfully. You may now log in with your new password.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: University, as: 'university' }],
    });

    let profile = null;
    if (user.role === 'student') {
      profile = await StudentProfile.findOne({
        where: { userId: user.id },
        include: [{ model: University, as: 'university' }],
      });
    }

    const userObj = user.toJSON();
    if (user.university) {
      userObj.universityId = user.university.toJSON();
    }

    let profileObj = null;
    if (profile) {
      profileObj = profile.toJSON();
      if (profile.university) {
        profileObj.universityId = profile.university.toJSON();
      }
    }

    res.json({
      success: true,
      user: userObj,
      profile: profileObj,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload an image for user registration or profile (Public during sign-up)
// @route   POST /api/auth/upload-image
// @access  Public
const uploadRegistrationImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }
    const imageUrl = `/uploads/profiles/${req.file.filename}`;
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: error.message || 'Image upload failed' });
  }
};

// @desc    Upload / Update profile picture for logged-in user account
// @route   POST /api/auth/profile-picture
// @access  Private
const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }
    const profilePic = `/uploads/profiles/${req.file.filename}`;
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.profilePic = profilePic;
    await user.save();

    // If student, synchronize with StudentProfile
    if (user.role === 'student') {
      let studentProfile = await StudentProfile.findOne({ where: { userId: user.id } });
      if (studentProfile) {
        studentProfile.profilePic = profilePic;
        await studentProfile.save();
      }
    }

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      profilePic,
    });
  } catch (error) {
    console.error('Update profile picture error:', error);
    res.status(500).json({ message: error.message || 'Failed to update profile picture' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updatePassword,
  forgotPassword,
  resetPassword,
  uploadRegistrationImage,
  updateProfilePicture,
};



