const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { connectDB, sequelize } = require('../config/db');
const {
  User,
  University,
  JoinRequest,
  StudentProfile,
  DailyProgressLog,
  JobPosting,
  Application,
} = require('../models');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    console.log('Connected to MySQL for fine-tuned data seeding...');

    // Reset and sync all tables respecting foreign keys
    await sequelize.sync({ force: true });
    console.log('Cleared existing tables and recreated schema.');

    const salt = await bcrypt.genSalt(10);
    const hashPassword = async (pwd) => bcrypt.hash(pwd, salt);

    // 1. System Administrator
    const admin = await User.create({
      name: 'Central System Administrator',
      email: 'admin@interlink.lk',
      password: await hashPassword('admin123'),
      role: 'admin',
      status: 'active',
      phone: '+94 77 123 4567',
    });

    // 2. University Heads
    const headRuhuna = await User.create({
      name: 'Prof. Subhash Jayasinghe',
      email: 'head@ruhuna.ac.lk', // Official university email
      personalEmail: 'subhash.personal@gmail.com',
      password: await hashPassword('head123'),
      role: 'head',
      status: 'approved',
      position: 'Dean, Faculty of Technology',
      phone: '+94 41 229 3300',
    });

    const headMoratuwa = await User.create({
      name: 'Prof. Chathura De Silva',
      email: 'head@mrt.ac.lk',
      personalEmail: 'chathura.ds@gmail.com',
      password: await hashPassword('head123'),
      role: 'head',
      status: 'pending', // Demo pending review by Admin
      position: 'Head of Department (HOD)',
      phone: '+94 11 265 0301',
    });

    // 3. Universities (With Master List Names)
    const uniRuhuna = await University.create({
      name: 'University of Ruhuna',
      code: 'UOR',
      location: 'Karagoda Uyangoda, Kamburupitiya, Matara',
      headUserId: headRuhuna.id,
      applierName: headRuhuna.name,
      applierPosition: 'Dean, Faculty of Technology',
      contactNum: headRuhuna.phone,
      universityEmail: headRuhuna.email,
      status: 'approved',
      reviewedBy: admin.id,
    });

    const uniMoratuwa = await University.create({
      name: 'University of Moratuwa',
      code: 'UOM',
      location: 'Katubedda, Moratuwa',
      headUserId: headMoratuwa.id,
      applierName: headMoratuwa.name,
      applierPosition: 'Head of Department (HOD)',
      contactNum: headMoratuwa.phone,
      universityEmail: headMoratuwa.email,
      status: 'pending', // Demo pending approval
    });

    await University.create({
      name: 'University of Colombo',
      code: 'UOC',
      location: 'Kumaratunga Munidasa Mawatha, Colombo 03',
      status: 'approved',
      applierName: 'Prof. K. P. Hewagamage',
      applierPosition: 'Dean',
      contactNum: '+94 11 258 1245',
      universityEmail: 'dean@science.cmb.ac.lk',
      reviewedBy: admin.id,
    });

    // Link Head user accounts to their respective university
    headRuhuna.universityId = uniRuhuna.id;
    await headRuhuna.save();

    headMoratuwa.universityId = uniMoratuwa.id;
    await headMoratuwa.save();

    // 4. Academic Supervisors (Self-registered under respected university)
    const supRuhuna = await User.create({
      name: 'Dr. Kasun Wickramasinghe',
      email: 'kasun.w@fot.ruh.ac.lk', // University email for verification
      personalEmail: 'kasun.wick@gmail.com',
      password: await hashPassword('sup123'),
      role: 'supervisor',
      status: 'approved',
      position: 'Senior Lecturer (Grade I)',
      staffRegNo: 'STAFF/RUH/FOT/042',
      universityId: uniRuhuna.id,
      phone: '+94 71 888 9999',
    });

    const supRuhunaPending = await User.create({
      name: 'Mr. Nuwan Perera',
      email: 'nuwan.p@fot.ruh.ac.lk', // University email
      personalEmail: 'nuwan.perera@gmail.com',
      password: await hashPassword('sup123'),
      role: 'supervisor',
      status: 'pending', // Demo pending request to Ruhuna Head
      position: 'Lecturer (Probationary)',
      staffRegNo: 'STAFF/RUH/FOT/089',
      universityId: uniRuhuna.id,
      phone: '+94 77 555 4444',
    });

    // Join requests linking supervisor to Head
    await JoinRequest.create({
      supervisorId: supRuhuna.id,
      universityId: uniRuhuna.id,
      headUserId: headRuhuna.id,
      staffRegNo: 'STAFF/RUH/FOT/042',
      position: 'Senior Lecturer (Grade I)',
      status: 'approved',
      reviewedAt: new Date(),
    });

    await JoinRequest.create({
      supervisorId: supRuhunaPending.id,
      universityId: uniRuhuna.id,
      headUserId: headRuhuna.id,
      staffRegNo: 'STAFF/RUH/FOT/089',
      position: 'Lecturer (Probationary)',
      status: 'pending', // Pending Head approval
    });

    // 5. Students (Providing complete profile details)
    const student1 = await User.create({
      name: 'E. Tharinda Gimhana',
      email: 'tharinda.g@fot.ruh.ac.lk', // University email
      personalEmail: 'tharinda.gimhana@gmail.com',
      password: await hashPassword('student123'),
      role: 'student',
      status: 'active', // Active immediately
      universityId: uniRuhuna.id,
      phone: '+94 76 987 6543',
      livingCity: 'Matara',
    });

    const student2 = await User.create({
      name: 'K. K. Daham Somarathna',
      email: 'daham.s@fot.ruh.ac.lk',
      personalEmail: 'daham.somarathna@gmail.com',
      password: await hashPassword('student123'),
      role: 'student',
      status: 'active',
      universityId: uniRuhuna.id,
      phone: '+94 70 876 5432',
      livingCity: 'Galle',
    });

    const student3 = await User.create({
      name: 'R. A. Sandun Bandara',
      email: 'sandun.b@fot.ruh.ac.lk',
      personalEmail: 'sandun.bandara@gmail.com',
      password: await hashPassword('student123'),
      role: 'student',
      status: 'active',
      universityId: uniRuhuna.id,
      phone: '+94 78 765 4321',
      livingCity: 'Colombo',
    });

    // Student Profiles with complete fine-tuned fields
    await StudentProfile.create({
      userId: student1.id,
      universityId: uniRuhuna.id,
      studentRegNo: 'TG/2023/1704',
      degreeProgram: 'Bachelor of Information and Communication Technology (BICT)',
      mainCategory: 'IT',
      desiredField: 'Full-Stack Software Engineering',
      workType: 'Hybrid',
      availability: 'Full-Time',
      profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      gpa: '3.82',
      livingCity: 'Matara',
      phone: student1.phone,
      universityEmail: student1.email,
      personalEmail: student1.personalEmail,
      skills: ['React', 'Node.js', 'Express', 'MySQL', 'REST APIs', 'TypeScript', 'Git'],
      bio: 'Energetic full-stack developer experienced in building scalable web architectures and responsive interfaces.',
      linkedinUrl: 'https://linkedin.com/in/tharinda-gimhana',
      githubUrl: 'https://github.com/tharindagimhana',
      portfolioUrl: 'https://tharinda.dev',
      cvUrl: '',
    });

    await StudentProfile.create({
      userId: student2.id,
      universityId: uniRuhuna.id,
      studentRegNo: 'TG/2023/1713',
      degreeProgram: 'Bachelor of Information and Communication Technology (BICT)',
      mainCategory: 'IT',
      desiredField: 'Backend & Cloud Infrastructure',
      workType: 'Remote',
      availability: 'Full-Time',
      profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      gpa: '3.75',
      livingCity: 'Galle',
      phone: student2.phone,
      universityEmail: student2.email,
      personalEmail: student2.personalEmail,
      skills: ['Node.js', 'Python', 'Docker', 'MySQL', 'AWS', 'Microservices'],
      bio: 'Backend systems enthusiast interested in API optimization, container orchestration, and relational data modeling.',
      linkedinUrl: 'https://linkedin.com/in/daham-somarathna',
      githubUrl: 'https://github.com/dahamsomarathna',
      portfolioUrl: '',
      cvUrl: '',
    });

    await StudentProfile.create({
      userId: student3.id,
      universityId: uniRuhuna.id,
      studentRegNo: 'TG/2023/1741',
      degreeProgram: 'Bachelor of Information and Communication Technology (BICT)',
      mainCategory: 'Science',
      desiredField: 'Data Analysis & Bio-Informatics',
      workType: 'Onsite',
      availability: 'Part-Time',
      profilePic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      gpa: '3.65',
      livingCity: 'Colombo',
      phone: student3.phone,
      universityEmail: student3.email,
      personalEmail: student3.personalEmail,
      skills: ['Python', 'Pandas', 'R', 'Machine Learning', 'Data Visualization'],
      bio: 'Passionate about biological informatics, scientific research computation, and predictive statistical models.',
      linkedinUrl: 'https://linkedin.com/in/sandun-bandara',
      githubUrl: 'https://github.com/sandunbandara',
      portfolioUrl: '',
      cvUrl: '',
    });

    // 6. Daily Progress Logs for Tharinda
    await DailyProgressLog.bulkCreate([
      {
        studentId: student1.id,
        universityId: uniRuhuna.id,
        date: new Date('2026-08-21'),
        hoursWorked: 8,
        tasksCompleted: '2026.08.21 structured the design of the intern website project, wireframed role dashboards, and planned MySQL schemas.',
        learnings: 'Understood university-scoping security constraints and multi-role UX separation.',
      },
      {
        studentId: student1.id,
        universityId: uniRuhuna.id,
        date: new Date('2026-08-22'),
        hoursWorked: 8,
        tasksCompleted: 'Constructed the REST API endpoints for daily progress logging, supervisor join requests, and employer auto-matching.',
        learnings: 'Mastered JWT middleware chaining and role-based access control (RBAC).',
      },
      {
        studentId: student1.id,
        universityId: uniRuhuna.id,
        date: new Date('2026-08-23'),
        hoursWorked: 7.5,
        tasksCompleted: 'Refined employer dashboard filtering to group and display applicants divided by each specific job vacancy.',
        learnings: 'Learned compound aggregation and index query optimization in MySQL and Sequelize.',
      },
    ]);

    // 7. Employers / Recruiters (Full fields per requirements)
    const employerVirtusa = await User.create({
      name: 'Kasun Wijesinghe',
      email: 'kasun.w@virtusa.com', // Company email
      password: await hashPassword('employer123'),
      role: 'employer',
      status: 'approved',
      phone: '+94 11 472 8000', // Company contact number
      companyName: 'Virtusa Sri Lanka',
      companyCategory: 'IT sector', // Category of the company
      recruiterName: 'Kasun Wijesinghe',
      recruitmentArea: 'Western Province / Islandwide',
      recruiterDesignation: 'Senior Talent Acquisition Lead',
      recruiterLinkedin: 'https://linkedin.com/in/kasun-virtusa-hr',
      recruiterContactNumber: '+94 77 111 2222', // Personal contact
      businessRegNumber: 'PV-10492-SL', // BRN
      taxId: 'TIN-98234123',
      companyWebsite: 'https://www.virtusa.com',
    });

    const employerBio = await User.create({
      name: 'Dr. Nilmini Alwis',
      email: 'nilmini@hayleysbio.lk',
      password: await hashPassword('employer123'),
      role: 'employer',
      status: 'approved',
      phone: '+94 11 269 9000',
      companyName: 'Hayleys Agriculture & Biotechnology',
      companyCategory: 'Biology', // Matching Science students
      recruiterName: 'Dr. Nilmini Alwis',
      recruitmentArea: 'Southern & Central Provinces',
      recruiterDesignation: 'R&D Director & Intern Coordinator',
      recruiterLinkedin: 'https://linkedin.com/in/nilmini-alwis',
      recruiterContactNumber: '+94 71 234 5678',
      businessRegNumber: 'PV-88392-AG',
      taxId: 'TIN-11223344',
      companyWebsite: 'https://www.hayleysagriculture.com',
    });

    await User.create({
      name: 'Malik Jayawardena',
      email: 'malik@wso2.com',
      password: await hashPassword('employer123'),
      role: 'employer',
      status: 'pending', // Demo pending review by Admin
      phone: '+94 11 214 5345',
      companyName: 'WSO2 Sri Lanka',
      companyCategory: 'IT sector',
      recruiterName: 'Malik Jayawardena',
      recruitmentArea: 'Colombo / Remote',
      recruiterDesignation: 'HR Talent Acquisition Executive',
      businessRegNumber: 'PV-99481-WSO2',
    });

    // 8. Multiple Job Vacancies per Employer (Divided on dashboard)
    const job1 = await JobPosting.create({
      employerId: employerVirtusa.id,
      companyName: employerVirtusa.companyName,
      title: 'Trainee Software Engineer (Full-Stack)',
      category: 'IT',
      description: 'Join our Digital Engineering unit. Develop enterprise web systems using React, Node.js, and cloud native architectures.',
      jobType: 'Full-Time Internship',
      availability: 'Immediate',
      location: 'Colombo / Hybrid',
      status: 'open',
    });

    await JobPosting.create({
      employerId: employerVirtusa.id,
      companyName: employerVirtusa.companyName,
      title: 'Cloud DevOps & Quality Engineering Intern',
      category: 'IT',
      description: 'Hands-on training in CI/CD pipeline automation, Docker containers, and test script engineering.',
      jobType: 'Full-Time Internship',
      availability: 'Next Month',
      location: 'Colombo',
      status: 'open',
    });

    await JobPosting.create({
      employerId: employerBio.id,
      companyName: employerBio.companyName,
      title: 'Agricultural Biotechnology Research Intern',
      category: 'Science',
      description: 'Assist Senior Researchers in seed quality analysis, tissue culture protocols, and field sample documentation.',
      jobType: 'Full-Time Internship',
      availability: 'Immediate',
      location: 'Kamburupitiya / Lab Site',
      status: 'open',
    });

    // 9. Sample Application
    await Application.create({
      jobId: job1.id,
      studentId: student1.id,
      employerId: employerVirtusa.id,
      status: 'pending',
    });

    console.log('Fine-tuned MySQL database seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();

