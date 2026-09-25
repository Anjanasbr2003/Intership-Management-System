const { JoinRequest, University, User } = require('../models');

// @desc    Get University Head details for supervisor's university
// @route   GET /api/supervisors/head-info
// @access  Private (Supervisor)
const getUniversityHeadInfo = async (req, res) => {
  try {
    const universityId = req.user.universityId;
    if (!universityId) {
      return res.status(400).json({ message: 'No university associated with supervisor' });
    }

    const university = await University.findByPk(universityId, {
      include: [
        {
          model: User,
          as: 'headUser',
          attributes: ['id', 'name', 'email', 'phone', 'position'],
        },
      ],
    });

    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }

    res.json({
      success: true,
      university: {
        _id: university.id,
        id: university.id,
        name: university.name,
        code: university.code,
      },
      head: university.headUser ? university.headUser.toJSON() : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send or re-send a join request to University Head (Supervisor)
// @route   POST /api/supervisors/join-request
// @access  Private (Supervisor)
const sendJoinRequest = async (req, res) => {
  try {
    const { universityId, staffRegNo, position } = req.body;
    const targetUniId = universityId || req.user.universityId;

    if (!targetUniId || !staffRegNo) {
      return res.status(400).json({ message: 'University and academic staff registration number are required' });
    }

    const university = await University.findByPk(targetUniId);
    if (!university || university.status !== 'approved') {
      return res.status(400).json({ message: 'Selected university is not approved in the system' });
    }

    // Check for existing pending request
    const existing = await JoinRequest.findOne({
      where: {
        supervisorId: req.user.id,
        universityId: targetUniId,
        status: 'pending',
      },
    });

    if (existing) {
      return res.status(400).json({ message: 'A join request to this University Head is already pending review' });
    }

    const joinRequest = await JoinRequest.create({
      supervisorId: req.user.id,
      universityId: targetUniId,
      headUserId: university.headUserId,
      staffRegNo,
      position: position || req.user.position || 'Lecturer',
      status: 'pending',
    });

    await User.update(
      {
        universityId: targetUniId,
        staffRegNo,
        position: position || req.user.position,
        status: 'pending',
      },
      { where: { id: req.user.id } }
    );

    res.status(201).json({
      success: true,
      message: `Join request sent to ${university.name} Head successfully.`,
      joinRequest,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get supervisor's own join request history
// @route   GET /api/supervisors/my-requests
// @access  Private (Supervisor)
const getMyJoinRequests = async (req, res) => {
  try {
    const requests = await JoinRequest.findAll({
      where: { supervisorId: req.user.id },
      include: [
        {
          model: University,
          as: 'university',
          attributes: ['id', 'name', 'code', 'location'],
        },
        {
          model: User,
          as: 'headUser',
          attributes: ['id', 'name', 'email', 'position'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const result = requests.map((r) => {
      const rObj = r.toJSON();
      if (r.university) rObj.universityId = r.university.toJSON();
      if (r.headUser) rObj.headUserId = r.headUser.toJSON();
      return rObj;
    });

    res.json({ success: true, requests: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUniversityHeadInfo, sendJoinRequest, getMyJoinRequests };

