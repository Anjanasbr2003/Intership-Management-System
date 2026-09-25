const { University, JoinRequest, User, StudentProfile } = require('../models');

// Master list of all Sri Lankan universities (Government & Private/Non-state)
const SRI_LANKAN_UNIVERSITIES_MASTER = [
  // Government Universities
  { name: 'University of Colombo', type: 'Government', code: 'UOC' },
  { name: 'University of Peradeniya', type: 'Government', code: 'UOP' },
  { name: 'University of Sri Jayewardenepura', type: 'Government', code: 'USJ' },
  { name: 'University of Kelaniya', type: 'Government', code: 'UOK' },
  { name: 'University of Moratuwa', type: 'Government', code: 'UOM' },
  { name: 'University of Jaffna', type: 'Government', code: 'UOJ' },
  { name: 'University of Ruhuna', type: 'Government', code: 'UOR' },
  { name: 'Eastern University, Sri Lanka', type: 'Government', code: 'EUSL' },
  { name: 'South Eastern University of Sri Lanka', type: 'Government', code: 'SEUSL' },
  { name: 'Rajarata University of Sri Lanka', type: 'Government', code: 'RUSL' },
  { name: 'Sabaragamuwa University of Sri Lanka', type: 'Government', code: 'SUSL' },
  { name: 'Wayamba University of Sri Lanka', type: 'Government', code: 'WUSL' },
  { name: 'Uva Wellassa University', type: 'Government', code: 'UWU' },
  { name: 'University of the Visual and Performing Arts', type: 'Government', code: 'UVPA' },
  { name: 'Gampaha Wickramarachchi University of Indigenous Medicine', type: 'Government', code: 'GWUIM' },
  { name: 'University of Vavuniya', type: 'Government', code: 'UOV' },
  { name: 'Open University of Sri Lanka', type: 'Government', code: 'OUSL' },
  { name: 'General Sir John Kotelawala Defence University (KDU)', type: 'Government / Defence', code: 'KDU' },
  { name: 'Ocean University of Sri Lanka', type: 'Government', code: 'OCU' },

  // Recognized Private & Non-State Higher Education Institutes
  { name: 'Sri Lanka Institute of Information Technology (SLIIT)', type: 'Non-State / Private', code: 'SLIIT' },
  { name: 'National School of Business Management (NSBM Green University)', type: 'Non-State / Private', code: 'NSBM' },
  { name: 'Informatics Institute of Technology (IIT)', type: 'Private', code: 'IIT' },
  { name: 'CINEC Campus', type: 'Private', code: 'CINEC' },
  { name: 'Horizon Campus', type: 'Private', code: 'HORIZON' },
  { name: 'ICBT Campus', type: 'Private', code: 'ICBT' },
  { name: 'Asia Pacific Institute of Information Technology (APIIT)', type: 'Private', code: 'APIIT' },
  { name: 'National Institute of Business Management (NIBM)', type: 'Semi-Government', code: 'NIBM' },
  { name: 'Saegis Campus', type: 'Private', code: 'SAEGIS' },
  { name: 'Sri Lanka Technological Campus (SLTC Research University)', type: 'Private', code: 'SLTC' },
  { name: 'ESOFT Metro Campus', type: 'Private', code: 'ESOFT' },
];

// @desc    Get master list of universities for Head registration
// @route   GET /api/universities/master-list
// @access  Public
const getMasterUniversities = async (req, res) => {
  res.json({ success: true, universities: SRI_LANKAN_UNIVERSITIES_MASTER });
};

// @desc    Get approved universities (for Student & Supervisor registration dropdown)
// @route   GET /api/universities/approved
// @access  Public
const getApprovedUniversities = async (req, res) => {
  try {
    const universities = await University.findAll({
      where: { status: 'approved' },
      include: [
        {
          model: User,
          as: 'headUser',
          attributes: ['id', 'name', 'email', 'phone', 'position'],
        },
      ],
      order: [['name', 'ASC']],
    });

    const result = universities.map((u) => {
      const uObj = u.toJSON();
      if (u.headUser) uObj.headUserId = u.headUser.toJSON();
      return uObj;
    });

    res.json({ success: true, universities: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get supervisor join requests for own university (University Head)
// @route   GET /api/universities/head/join-requests
// @access  Private (Head)
const getJoinRequestsForHead = async (req, res) => {
  try {
    const universityId = req.user.universityId;
    if (!universityId) {
      return res.status(400).json({ message: 'No university linked to this head account' });
    }

    const requests = await JoinRequest.findAll({
      where: { universityId },
      include: [
        {
          model: User,
          as: 'supervisor',
          attributes: ['id', 'name', 'email', 'personalEmail', 'phone', 'position', 'staffRegNo', 'status'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const result = requests.map((r) => {
      const rObj = r.toJSON();
      if (r.supervisor) rObj.supervisorId = r.supervisor.toJSON();
      return rObj;
    });

    res.json({ success: true, requests: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve or reject a supervisor join request (Head)
// @route   PATCH /api/universities/head/join-requests/:id
// @access  Private (Head)
const reviewJoinRequest = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const request = await JoinRequest.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Join request not found' });
    }

    if (String(request.universityId) !== String(req.user.universityId)) {
      return res.status(403).json({ message: 'Access denied to join request of another university' });
    }

    request.status = status;
    request.reviewedAt = new Date();
    await request.save();

    if (status === 'approved') {
      await User.update(
        {
          status: 'approved',
          universityId: request.universityId,
          staffRegNo: request.staffRegNo,
          position: request.position,
        },
        { where: { id: request.supervisorId } }
      );
    } else {
      await User.update(
        { status: 'rejected' },
        { where: { id: request.supervisorId } }
      );
    }

    res.json({
      success: true,
      message: `Supervisor join request ${status} successfully.`,
      request,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all students of own university (Head / Supervisor only - strictly scoped)
// @route   GET /api/universities/students
// @access  Private (Head, Supervisor)
const getUniversityStudents = async (req, res) => {
  try {
    const universityId = req.user.universityId;
    if (!universityId) {
      return res.status(400).json({ message: 'No university linked to your account' });
    }

    const students = await User.findAll({
      where: { role: 'student', universityId },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });

    const studentIds = students.map((s) => s.id);
    const profiles = await StudentProfile.findAll({
      where: { userId: studentIds },
    });

    const studentData = students.map((student) => {
      const studentObj = student.toJSON();
      const profile = profiles.find((p) => p.userId === student.id);
      studentObj.profile = profile ? profile.toJSON() : null;
      return studentObj;
    });

    res.json({ success: true, students: studentData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all supervisors of own university (Head)
// @route   GET /api/universities/supervisors
// @access  Private (Head)
const getUniversitySupervisors = async (req, res) => {
  try {
    const universityId = req.user.universityId;
    const supervisors = await User.findAll({
      where: { role: 'supervisor', universityId },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, supervisors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMasterUniversities,
  getApprovedUniversities,
  getJoinRequestsForHead,
  reviewJoinRequest,
  getUniversityStudents,
  getUniversitySupervisors,
};

