"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = seedDatabase;
const qrcode_1 = __importDefault(require("qrcode"));
const database_js_1 = require("../config/database.js");
const User_js_1 = require("../models/User.js");
const School_js_1 = require("../models/School.js");
const Program_js_1 = require("../models/Program.js");
const Batch_js_1 = require("../models/Batch.js");
const Student_js_1 = require("../models/Student.js");
const Teacher_js_1 = require("../models/Teacher.js");
const Attendance_js_1 = require("../models/Attendance.js");
const Assignment_js_1 = require("../models/Assignment.js");
const Submission_js_1 = require("../models/Submission.js");
const Quiz_js_1 = require("../models/Quiz.js");
const Result_js_1 = require("../models/Result.js");
const Certificate_js_1 = require("../models/Certificate.js");
const Lead_js_1 = require("../models/Lead.js");
const CMSContent_js_1 = require("../models/CMSContent.js");
const Notice_js_1 = require("../models/Notice.js");
const Notification_js_1 = require("../models/Notification.js");
const password_js_1 = require("../utils/password.js");
async function seedDatabase() {
    console.log('[Seed] Starting complete database seeding for ALYSTRO...');
    await (0, database_js_1.connectDatabase)();
    // Clear existing collections
    await Promise.all([
        User_js_1.User.deleteMany({}),
        School_js_1.School.deleteMany({}),
        Program_js_1.Program.deleteMany({}),
        Batch_js_1.Batch.deleteMany({}),
        Student_js_1.Student.deleteMany({}),
        Teacher_js_1.Teacher.deleteMany({}),
        Attendance_js_1.Attendance.deleteMany({}),
        Assignment_js_1.Assignment.deleteMany({}),
        Submission_js_1.Submission.deleteMany({}),
        Quiz_js_1.Quiz.deleteMany({}),
        Result_js_1.Result.deleteMany({}),
        Certificate_js_1.Certificate.deleteMany({}),
        Lead_js_1.Lead.deleteMany({}),
        CMSContent_js_1.CMSContent.deleteMany({}),
        Notice_js_1.Notice.deleteMany({}),
        Notification_js_1.Notification.deleteMany({}),
    ]);
    const defaultPasswordHash = await (0, password_js_1.hashPassword)('Admin@123');
    const schoolPasswordHash = await (0, password_js_1.hashPassword)('School@123');
    const teacherPasswordHash = await (0, password_js_1.hashPassword)('Teacher@123');
    const studentPasswordHash = await (0, password_js_1.hashPassword)('Student@123');
    // 1. Super Admin & Platform Admin
    const superAdmin = await User_js_1.User.create({
        name: 'Super Admin',
        email: 'superadmin@alystro.com',
        password: defaultPasswordHash,
        role: 'SUPER_ADMIN',
        phone: '+91 98765 43210',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        status: 'ACTIVE',
    });
    const opsAdmin = await User_js_1.User.create({
        name: 'Operations Manager',
        email: 'operations@alystro.com',
        password: defaultPasswordHash,
        role: 'ADMIN',
        phone: '+91 98765 43211',
        status: 'ACTIVE',
    });
    // 2. Flagship Programs
    const foundationProgram = await Program_js_1.Program.create({
        name: 'Foundation Program',
        slug: 'foundation-program-class-6-8',
        gradeLevel: 'CLASS_6_8',
        category: 'AI & Digital Skills',
        tagline: 'Foundation Program for Young Learners',
        description: 'A fun and practical program to introduce young students to modern AI tools, digital storytelling, video editing, and essential digital productivity in a safe, creative way.',
        durationMonths: 3,
        sessionDurationMinutes: 45,
        mode: 'HYBRID',
        featured: true,
        published: true,
        features: [
            'Introduction to AI & Smart Tools',
            'Video Editing & Reels Basics',
            'Digital Presentations & Infographics',
            'Responsible AI & Cyber Safety',
        ],
        learningOutcomes: [
            'Learn & create with modern AI tools safely',
            'Turn ideas into engaging short videos and animations',
            'Essential digital productivity skills for school projects',
            'Creativity, logical problem solving & presentation confidence',
        ],
        syllabus: [
            {
                month: 1,
                title: 'Month 1 — Introduction to AI & Smart Tools',
                description: 'Demystifying AI, prompt design, visual generation and digital safety.',
                topics: [
                    'What is AI? Real-world applications around us',
                    'Creative Prompt Engineering for Students',
                    'AI Art & Story Generation tools',
                    'Responsible AI Usage and Online Privacy',
                ],
            },
            {
                month: 2,
                title: 'Month 2 — AI Tools & Video Editing Basics',
                description: 'Practical video creation, audio enhancement, transitions, and storyboarding.',
                topics: [
                    'Storyboarding and Visual Scriptwriting',
                    'Timeline Video Editing Foundations',
                    'Adding Audio, Subtitles, and Engaging Visual Effects',
                    'Creating 60-Second Educational Reels',
                ],
            },
            {
                month: 3,
                title: 'Month 3 — Creative Projects & Presentation',
                description: 'Culminating hands-on project portfolio presented to class.',
                topics: [
                    'Designing Digital Infographics & Posters',
                    'Collaborative Capstone Team Project',
                    'Public Speaking and Showcase Presentation',
                    'Final Assessment and Certificate Award',
                ],
            },
        ],
    });
    const skillBuilderProgram = await Program_js_1.Program.create({
        name: 'Skill Builder Program',
        slug: 'skill-builder-program-class-9-10',
        gradeLevel: 'CLASS_9_10',
        category: 'Content Creation & Future Skills',
        tagline: 'Build Real Skills with Practical Projects',
        description: 'Advanced AI workflows, digital motion design, visual content creation, and future-oriented tech literacy tailored for high school students.',
        durationMonths: 3,
        sessionDurationMinutes: 45,
        mode: 'HYBRID',
        featured: true,
        published: true,
        features: [
            'Advanced Generative AI Workflows',
            'Motion Graphics & Timeline Editing',
            'Digital Content Strategy & Audio Mixing',
            'Automation & Workflow Optimization',
        ],
        learningOutcomes: [
            'Master generative AI tools for academic research and creative media',
            'Produce polished multi-track video projects',
            'Understand algorithm basics, logic building, and data presentation',
            'Build a verified creative portfolio for future college applications',
        ],
        syllabus: [
            {
                month: 1,
                title: 'Month 1 — Advanced AI Tools & Research Workflows',
                description: 'Using AI for research, summarizing papers, and generating multimedia assets.',
                topics: [
                    'Deep-dive into LLMs for Academic Research',
                    'Multi-modal AI: Text to Image, Voice & Music',
                    'Critical Evaluation of AI Outputs & Fact Checking',
                ],
            },
            {
                month: 2,
                title: 'Month 2 — Advanced Video Editing & Motion Graphics',
                description: 'Keyframe animation, color grading, sound design, and narrative pacing.',
                topics: [
                    'Multi-track Video Timeline Mastery',
                    'Color Grading, Audio Equalization & Noise Removal',
                    'Motion Text, Lower Thirds and Dynamic Transitions',
                ],
            },
            {
                month: 3,
                title: 'Month 3 — Capstone Project & Career Portfolios',
                description: 'Developing a complete digital portfolio showcasing 3 independent projects.',
                topics: [
                    'Brand Identity, YouTube/Social Asset Production',
                    'Portfolio Website Construction',
                    'Project Peer Review and Final Certification',
                ],
            },
        ],
    });
    const futureReadyProgram = await Program_js_1.Program.create({
        name: 'Future Ready Program',
        slug: 'future-ready-program-class-11-12',
        gradeLevel: 'CLASS_11_12',
        category: 'Applied AI & Creative Technology',
        tagline: 'Advanced Tools and Career-Oriented Skills',
        description: 'Prepare for university and the 21st-century modern workforce with applied AI tools, data analytics, creative technology, and practical capstone projects.',
        durationMonths: 3,
        sessionDurationMinutes: 45,
        mode: 'HYBRID',
        featured: true,
        published: true,
        features: [
            'Applied AI, Automation & Prompt Architecture',
            'Professional Media Production & Storytelling',
            'Tech Entrepreneurship & Pitch Deck Design',
            'Industry-Standard Portfolio Building',
        ],
        learningOutcomes: [
            'Deploy real AI agents and automate personal productivity workflows',
            'Produce professional-grade digital media and pitch presentations',
            'Understand modern tech careers, ethics, and computational thinking',
            'Earn an industry-recognized ALYSTRO Future Skills Certificate',
        ],
        syllabus: [
            {
                month: 1,
                title: 'Month 1 — Applied AI Architecture & Automation',
                description: 'Leveraging AI APIs, webhooks, and productivity automations.',
                topics: [
                    'Modern AI Landscape & Architecture Overview',
                    'Productivity Automations with No-Code & Python logic',
                    'AI-assisted Data Analysis & Visualization',
                ],
            },
            {
                month: 2,
                title: 'Month 2 — Professional Media & Brand Production',
                description: 'Commercial video production, UI/UX prototyping fundamentals.',
                topics: [
                    'Documentary and Narrative Storytelling Techniques',
                    'Figma Basics: UI/UX Prototyping for Digital Products',
                    'Synthesizing Media for Startup Pitches',
                ],
            },
            {
                month: 3,
                title: 'Month 3 — Industry Capstone & Showcase',
                description: 'Comprehensive capstone project evaluated by industry mentors.',
                topics: [
                    'Developing a Market-Ready Digital Project',
                    'Pitch Deck Creation and Live Demo Day',
                    'Resume, LinkedIn & GitHub/Behance Portfolio Setup',
                ],
            },
        ],
    });
    // 3. Partner Schools
    const abcSchool = await School_js_1.School.create({
        name: 'ABC International School',
        slug: 'abc-international',
        code: 'ABC-101',
        logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&q=80&w=200',
        coverImage: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=1200',
        tagline: 'Future Skills Program for Students',
        description: 'A specially designed AI & Digital Skills program for ABC International School students to build practical digital and creative skills through live hands-on projects.',
        address: {
            street: 'Sector 14, Mansarovar',
            city: 'Jaipur',
            state: 'Rajasthan',
            pincode: '302020',
            country: 'India',
        },
        contactPerson: {
            name: 'Dr. Ramesh Sharma',
            designation: 'Principal',
            phone: '+91 98290 11223',
            email: 'principal@abcinternational.edu',
        },
        classesServed: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'],
        studentCapacity: 600,
        activeStudentCount: 4,
        programsEnrolled: [foundationProgram._id, skillBuilderProgram._id],
        paymentStatus: 'PAID',
        status: 'ACTIVE',
    });
    const dpmSchool = await School_js_1.School.create({
        name: 'Delhi Public Modern School',
        slug: 'delhi-public-modern',
        code: 'DPM-204',
        logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200',
        coverImage: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1200',
        tagline: 'Excellence in 21st Century Education',
        description: 'Premier academic institution pioneering digital creativity and future-ready technology.',
        address: {
            street: 'Mathura Road',
            city: 'New Delhi',
            state: 'Delhi',
            pincode: '110003',
            country: 'India',
        },
        contactPerson: {
            name: 'Mrs. Sunita Kaul',
            designation: 'Vice Principal',
            phone: '+91 98110 33445',
            email: 'admin@dpmschool.edu',
        },
        classesServed: ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
        studentCapacity: 800,
        activeStudentCount: 3,
        programsEnrolled: [skillBuilderProgram._id, futureReadyProgram._id],
        paymentStatus: 'PAID',
        status: 'ACTIVE',
    });
    const stXavierSchool = await School_js_1.School.create({
        name: 'St. Xavier Tech Academy',
        slug: 'st-xavier-tech',
        code: 'SXT-309',
        logo: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?auto=format&fit=crop&q=80&w=200',
        coverImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200',
        tagline: 'Empowering Minds, Shaping Tomorrow',
        description: 'Committed to fostering innovation, critical thinking, and applied technology skills.',
        address: {
            street: 'Fort Heritage Zone',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            country: 'India',
        },
        contactPerson: {
            name: 'Fr. Anthony D’Souza',
            designation: 'Director',
            phone: '+91 98200 55667',
            email: 'coordinator@stxavier.edu',
        },
        classesServed: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
        studentCapacity: 750,
        activeStudentCount: 3,
        programsEnrolled: [foundationProgram._id, futureReadyProgram._id],
        paymentStatus: 'PAID',
        status: 'ACTIVE',
    });
    // 4. School Admin User Accounts
    const abcAdmin = await User_js_1.User.create({
        name: 'Dr. Ramesh Sharma',
        email: 'principal@abcschool.edu',
        password: schoolPasswordHash,
        role: 'SCHOOL_ADMIN',
        school: abcSchool._id,
        phone: '+91 98290 11223',
        status: 'ACTIVE',
    });
    const dpmAdmin = await User_js_1.User.create({
        name: 'Mrs. Sunita Kaul',
        email: 'admin@dpmschool.edu',
        password: schoolPasswordHash,
        role: 'SCHOOL_ADMIN',
        school: dpmSchool._id,
        phone: '+91 98110 33445',
        status: 'ACTIVE',
    });
    const stXavierAdmin = await User_js_1.User.create({
        name: 'Fr. Anthony D’Souza',
        email: 'coordinator@stxavier.edu',
        password: schoolPasswordHash,
        role: 'SCHOOL_ADMIN',
        school: stXavierSchool._id,
        phone: '+91 98200 55667',
        status: 'ACTIVE',
    });
    // 5. Teachers & Mentors
    const teacherUser1 = await User_js_1.User.create({
        name: 'Rohit Verma',
        email: 'mentor.rohit@alystro.com',
        password: teacherPasswordHash,
        role: 'TEACHER',
        school: abcSchool._id,
        phone: '+91 98765 11111',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        status: 'ACTIVE',
    });
    const teacherUser2 = await User_js_1.User.create({
        name: 'Priya Sundaram',
        email: 'mentor.priya@alystro.com',
        password: teacherPasswordHash,
        role: 'TEACHER',
        school: abcSchool._id,
        phone: '+91 98765 22222',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
        status: 'ACTIVE',
    });
    const teacher1 = await Teacher_js_1.Teacher.create({
        user: teacherUser1._id,
        school: abcSchool._id,
        specialization: ['AI & Smart Tools', 'Video Editing'],
        qualification: 'M.Sc. Interactive Media & AI',
        status: 'ACTIVE',
    });
    const teacher2 = await Teacher_js_1.Teacher.create({
        user: teacherUser2._id,
        school: abcSchool._id,
        specialization: ['Digital Skills', 'Creative Technology'],
        qualification: 'B.Tech CS, Adobe Certified Instructor',
        status: 'ACTIVE',
    });
    // 6. Batches
    const batch1 = await Batch_js_1.Batch.create({
        name: 'Class 6-8 AI Innovators - Batch A',
        school: abcSchool._id,
        program: foundationProgram._id,
        teacher: teacherUser1._id,
        grade: 'Class 6-8',
        section: 'A',
        schedule: [
            { dayOfWeek: 'Monday', startTime: '16:00', endTime: '16:45' },
            { dayOfWeek: 'Wednesday', startTime: '16:00', endTime: '16:45' },
            { dayOfWeek: 'Friday', startTime: '16:00', endTime: '16:45' },
        ],
        meetingLink: 'https://meet.google.com/aly-class6-live',
        classroomNumber: 'Computer Lab 1',
        status: 'ACTIVE',
        maxStudents: 35,
        currentStudentCount: 4,
    });
    const batch2 = await Batch_js_1.Batch.create({
        name: 'Class 9-10 Skill Builders - Batch B',
        school: abcSchool._id,
        program: skillBuilderProgram._id,
        teacher: teacherUser2._id,
        grade: 'Class 9-10',
        section: 'B',
        schedule: [
            { dayOfWeek: 'Tuesday', startTime: '17:00', endTime: '17:45' },
            { dayOfWeek: 'Thursday', startTime: '17:00', endTime: '17:45' },
            { dayOfWeek: 'Saturday', startTime: '11:00', endTime: '11:45' },
        ],
        meetingLink: 'https://meet.google.com/aly-class9-live',
        classroomNumber: 'Multimedia Lab',
        status: 'ACTIVE',
        maxStudents: 40,
        currentStudentCount: 3,
    });
    await Teacher_js_1.Teacher.findByIdAndUpdate(teacher1._id, { $addToSet: { assignedBatches: batch1._id } });
    await Teacher_js_1.Teacher.findByIdAndUpdate(teacher2._id, { $addToSet: { assignedBatches: batch2._id } });
    // 7. Students
    const studentData = [
        {
            name: 'Aarav Sharma',
            email: 'aarav.sharma@student.alystro.com',
            rollNumber: 'ABC-601',
            grade: 'Class 7',
            section: 'A',
            school: abcSchool._id,
            batch: batch1._id,
            program: foundationProgram._id,
            parentName: 'Sanjay Sharma',
            parentPhone: '+91 98290 88776',
            attendanceRate: 94,
            avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
        },
        {
            name: 'Ananya Patel',
            email: 'ananya.patel@student.alystro.com',
            rollNumber: 'ABC-602',
            grade: 'Class 8',
            section: 'A',
            school: abcSchool._id,
            batch: batch1._id,
            program: foundationProgram._id,
            parentName: 'Vikram Patel',
            parentPhone: '+91 98290 88777',
            attendanceRate: 98,
            avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
        },
        {
            name: 'Rohan Mehra',
            email: 'rohan.mehra@student.alystro.com',
            rollNumber: 'ABC-603',
            grade: 'Class 6',
            section: 'A',
            school: abcSchool._id,
            batch: batch1._id,
            program: foundationProgram._id,
            parentName: 'Rajesh Mehra',
            parentPhone: '+91 98290 88778',
            attendanceRate: 88,
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
        },
        {
            name: 'Ishaan Verma',
            email: 'ishaan.verma@student.alystro.com',
            rollNumber: 'ABC-604',
            grade: 'Class 7',
            section: 'B',
            school: abcSchool._id,
            batch: batch1._id,
            program: foundationProgram._id,
            parentName: 'Manoj Verma',
            parentPhone: '+91 98290 88779',
            attendanceRate: 91,
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
        },
        {
            name: 'Diya Singhania',
            email: 'diya.singhania@student.alystro.com',
            rollNumber: 'ABC-901',
            grade: 'Class 10',
            section: 'B',
            school: abcSchool._id,
            batch: batch2._id,
            program: skillBuilderProgram._id,
            parentName: 'Alok Singhania',
            parentPhone: '+91 98290 88780',
            attendanceRate: 96,
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
        },
        {
            name: 'Kabir Malhotra',
            email: 'kabir.malhotra@student.alystro.com',
            rollNumber: 'ABC-902',
            grade: 'Class 9',
            section: 'B',
            school: abcSchool._id,
            batch: batch2._id,
            program: skillBuilderProgram._id,
            parentName: 'Sunil Malhotra',
            parentPhone: '+91 98290 88781',
            attendanceRate: 85,
            avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
        },
    ];
    const createdStudents = [];
    for (const s of studentData) {
        const user = await User_js_1.User.create({
            name: s.name,
            email: s.email,
            password: studentPasswordHash,
            role: 'STUDENT',
            school: s.school,
            phone: s.parentPhone,
            avatar: s.avatar,
            status: 'ACTIVE',
        });
        const student = await Student_js_1.Student.create({
            user: user._id,
            school: s.school,
            batch: s.batch,
            program: s.program,
            rollNumber: s.rollNumber,
            grade: s.grade,
            section: s.section,
            parentName: s.parentName,
            parentPhone: s.parentPhone,
            attendanceRate: s.attendanceRate,
            completedAssignments: 3,
            totalScore: 92,
            status: 'ACTIVE',
        });
        createdStudents.push(student);
    }
    // 8. Attendance Records
    const today = new Date();
    const pastDates = [
        new Date(today.getTime() - 2 * 86400000),
        new Date(today.getTime() - 4 * 86400000),
        new Date(today.getTime() - 6 * 86400000),
    ];
    for (const date of pastDates) {
        await Attendance_js_1.Attendance.create({
            school: abcSchool._id,
            batch: batch1._id,
            date,
            teacher: teacherUser1._id,
            topicCovered: 'Mastering AI Prompts & Visual Storytelling Concepts',
            records: createdStudents.slice(0, 4).map((st, idx) => ({
                student: st._id,
                status: idx === 2 ? 'LATE' : 'PRESENT',
                remark: idx === 2 ? 'Joined 5 mins late' : 'Active class participation',
            })),
        });
    }
    // 9. Assignments & Submissions
    const assignment1 = await Assignment_js_1.Assignment.create({
        school: abcSchool._id,
        batch: batch1._id,
        program: foundationProgram._id,
        teacher: teacherUser1._id,
        title: 'AI Storyboard & Character Design Project',
        description: 'Create a 4-panel visual storyboard introducing a superhero robot that solves environmental challenges. Include character prompt specifications and a 100-word story concept.',
        dueDate: new Date(today.getTime() + 5 * 86400000),
        totalMarks: 50,
        attachments: [
            { name: 'Storyboard_Template.pdf', url: 'https://alystro.com/docs/templates/storyboard.pdf' },
        ],
    });
    const assignment2 = await Assignment_js_1.Assignment.create({
        school: abcSchool._id,
        batch: batch1._id,
        program: foundationProgram._id,
        teacher: teacherUser1._id,
        title: '60-Second Video Reel: Science in Daily Life',
        description: 'Shoot or edit a 60-second video demonstrating an everyday scientific phenomenon. Add audio background, text captions, and smooth transitions.',
        dueDate: new Date(today.getTime() - 1 * 86400000),
        totalMarks: 50,
        attachments: [],
    });
    // Add submissions for student 0 (Aarav) and 1 (Ananya)
    await Submission_js_1.Submission.create({
        assignment: assignment2._id,
        student: createdStudents[0]._id,
        school: abcSchool._id,
        fileUrl: 'https://drive.google.com/demo/aarav-science-reel.mp4',
        notes: 'Used CapCut & Canva with custom voiceover recording.',
        marksObtained: 48,
        feedback: 'Fantastic pacing and very clear captions! Excellent voice modulation.',
        gradedBy: teacherUser1._id,
        gradedAt: new Date(),
        status: 'GRADED',
    });
    await Submission_js_1.Submission.create({
        assignment: assignment2._id,
        student: createdStudents[1]._id,
        school: abcSchool._id,
        fileUrl: 'https://drive.google.com/demo/ananya-science-reel.mp4',
        notes: 'Created an animation on water condensation with dynamic sound effects.',
        marksObtained: 50,
        feedback: 'Outstanding creative animation. Highly engaging!',
        gradedBy: teacherUser1._id,
        gradedAt: new Date(),
        status: 'GRADED',
    });
    // 10. Quizzes & Results
    const quiz1 = await Quiz_js_1.Quiz.create({
        school: abcSchool._id,
        batch: batch1._id,
        program: foundationProgram._id,
        title: 'AI & Digital Literacy Checkpoint 1',
        description: 'Test your understanding of prompt structuring, ethics, and digital safety.',
        durationMinutes: 15,
        passingScore: 60,
        status: 'PUBLISHED',
        questions: [
            {
                questionText: 'Which element is most important when crafting an effective AI prompt?',
                options: ['Using random long words', 'Providing clear context, role, and output format', 'Using ALL CAPS', 'Asking only one word questions'],
                correctOptionIndex: 1,
                marks: 10,
                explanation: 'Providing context, specifying a role, and setting the target format gives the AI accurate direction.',
            },
            {
                questionText: 'What should you do before sharing an AI-generated image online?',
                options: ['Claim you painted it by hand', 'Verify that it does not infringe privacy or mislead others', 'Delete the original file', 'Print it out first'],
                correctOptionIndex: 1,
                marks: 10,
                explanation: 'Responsible digital citizenship requires ethical transparency and verifying authenticity.',
            },
            {
                questionText: 'In timeline video editing, what is the purpose of B-roll footage?',
                options: ['To delete the main audio', 'To support and enrich the primary spoken narrative visually', 'To make the video file smaller', 'To speed up the internet'],
                correctOptionIndex: 1,
                marks: 10,
                explanation: 'B-roll footage visually enhances dialogue or voiceover, keeping viewers engaged.',
            },
        ],
    });
    await Result_js_1.Result.create({
        quiz: quiz1._id,
        student: createdStudents[0]._id,
        school: abcSchool._id,
        score: 30,
        totalMarks: 30,
        percentage: 100,
        passed: true,
        selectedAnswers: [1, 1, 1],
        completedAt: new Date(),
    });
    // 11. Verified Certificates with QR Code
    const certId1 = 'ALY-2026-948123';
    const verifyUrl1 = `http://localhost:5173/verify/${certId1}`;
    const qrCodeData1 = await qrcode_1.default.toDataURL(verifyUrl1, {
        width: 250,
        margin: 1,
        color: { dark: '#0B1B3D', light: '#FFFFFF' },
    });
    await Certificate_js_1.Certificate.create({
        certificateId: certId1,
        student: createdStudents[0]._id,
        studentName: 'Aarav Sharma',
        school: abcSchool._id,
        schoolName: 'ABC International School',
        program: foundationProgram._id,
        programName: 'Foundation Program: AI & Digital Skills',
        grade: 'Distinction (Grade O)',
        issueDate: new Date('2026-09-15'),
        completionDate: new Date('2026-09-10'),
        verificationQrCode: qrCodeData1,
        status: 'VALID',
        issuedBy: superAdmin._id,
    });
    const certId2 = 'ALY-2026-831452';
    const verifyUrl2 = `http://localhost:5173/verify/${certId2}`;
    const qrCodeData2 = await qrcode_1.default.toDataURL(verifyUrl2, {
        width: 250,
        margin: 1,
        color: { dark: '#0B1B3D', light: '#FFFFFF' },
    });
    await Certificate_js_1.Certificate.create({
        certificateId: certId2,
        student: createdStudents[1]._id,
        studentName: 'Ananya Patel',
        school: abcSchool._id,
        schoolName: 'ABC International School',
        program: foundationProgram._id,
        programName: 'Foundation Program: AI & Digital Skills',
        grade: 'Distinction (Grade O)',
        issueDate: new Date('2026-09-15'),
        completionDate: new Date('2026-09-10'),
        verificationQrCode: qrCodeData2,
        status: 'VALID',
        issuedBy: superAdmin._id,
    });
    // 12. CRM Leads (Matching reference mockup table & Kanban stages)
    await Lead_js_1.Lead.create([
        {
            schoolName: 'ABC School',
            contactPerson: 'Rahul Sharma',
            designation: 'Principal',
            email: 'rahul.sharma@abcschool.edu',
            phone: '9876543210',
            city: 'Jaipur',
            state: 'Rajasthan',
            classes: ['Class 6-8', 'Class 9-10'],
            estimatedStudents: 350,
            interestedProgram: 'AI & Digital Skills',
            status: 'CONVERTED',
            convertedSchool: abcSchool._id,
            timeline: [
                { action: 'DEMO_DONE', details: 'Delivered 3-day demo with 90% positive feedback.', timestamp: new Date('2026-05-09') },
                { action: 'CONVERTED', details: 'Signed annual partnership agreement.', timestamp: new Date('2026-05-10') },
            ],
        },
        {
            schoolName: 'Sunrise School',
            contactPerson: 'Amit Singh',
            designation: 'Vice Principal',
            email: 'amit.singh@sunriseschool.in',
            phone: '7654321098',
            city: 'Jaipur',
            state: 'Rajasthan',
            classes: ['Class 9-10'],
            estimatedStudents: 220,
            interestedProgram: 'Video Editing & Content Creation',
            status: 'DEMO_SCHEDULED',
            demoScheduledAt: new Date('2026-10-18'),
            timeline: [
                { action: 'DEMO_SCHEDULED', details: 'Demo confirmed for Class 9-10 batches.', timestamp: new Date() },
            ],
        },
        {
            schoolName: 'Global School',
            contactPerson: 'Priya Mehta',
            designation: 'Director',
            email: 'priya.mehta@globalschool.org',
            phone: '7014321098',
            city: 'Kota',
            state: 'Rajasthan',
            classes: ['Class 6-8', 'Class 11-12'],
            estimatedStudents: 400,
            interestedProgram: 'Coding & Future Skills',
            status: 'CONTACTED',
            timeline: [{ action: 'CALL_COMPLETED', details: 'Shared curriculum brochure and fee structure.', timestamp: new Date() }],
        },
        {
            schoolName: 'Bright Future Public School',
            contactPerson: 'Vikram Gupta',
            designation: 'Academic Head',
            email: 'vikram.gupta@brightfuture.edu',
            phone: '9829123456',
            city: 'Udaipur',
            state: 'Rajasthan',
            classes: ['Class 6-8'],
            estimatedStudents: 180,
            interestedProgram: 'AI & Smart Tools',
            status: 'NEW',
            timeline: [{ action: 'WEBSITE_INQUIRY', details: 'Submitted Book a Free Demo form.', timestamp: new Date() }],
        },
        {
            schoolName: 'Heritage Modern Academy',
            contactPerson: 'Sunita Verma',
            designation: 'Principal',
            email: 'principal@heritageacademy.in',
            phone: '9928123490',
            city: 'Jodhpur',
            state: 'Rajasthan',
            classes: ['Class 6-8', 'Class 9-10', 'Class 11-12'],
            estimatedStudents: 500,
            interestedProgram: 'Full Future Ready Bundle',
            status: 'DEMO_DONE',
            timeline: [{ action: 'DEMO_COMPLETED', details: 'Workshop conducted for 80 students successfully.', timestamp: new Date() }],
        },
    ]);
    // 13. CMS Content (Testimonials, FAQs, Student Projects)
    await CMSContent_js_1.CMSContent.create([
        {
            key: 'testimonials',
            category: 'TESTIMONIALS',
            title: 'What Educators & Students Say About ALYSTRO',
            published: true,
            data: [
                {
                    name: 'Dr. Ramesh Sharma',
                    role: 'Principal, ABC International School',
                    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
                    quote: 'ALYSTRO has transformed how our students engage with technology. The combination of live mentors, practical AI projects, and hands-on video editing gave our students immense confidence.',
                    rating: 5,
                },
                {
                    name: 'Pooja Agarwal',
                    role: 'Head of Computer Science, DPM School',
                    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
                    quote: 'The structured 3-month curriculum perfectly complements our academic timetable without burdening students. The attendance and student submission portal is exceptionally seamless.',
                    rating: 5,
                },
                {
                    name: 'Aarav Sharma',
                    role: 'Student, Class 8',
                    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
                    quote: 'I used to just play games on the computer, but now I can generate AI artwork, storyboard videos, and edit awesome science explainers! The mentors make every session fun.',
                    rating: 5,
                },
            ],
        },
        {
            key: 'student_projects',
            category: 'PROJECTS',
            title: 'Real Projects. Real Creativity.',
            published: true,
            data: [
                {
                    title: 'AI Cyber Guardian Art',
                    category: 'AI Tools & Creativity',
                    grade: 'Class 7',
                    student: 'Aarav Sharma',
                    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
                    description: 'A generative AI artwork series depicting clean-energy futuristic smart cities.',
                },
                {
                    title: 'Solar System Motion Explainer',
                    category: 'Video Editing',
                    grade: 'Class 8',
                    student: 'Ananya Patel',
                    thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&q=80&w=600',
                    description: 'A 60-second kinetic typography video explaining planetary gravity with custom audio.',
                },
                {
                    title: 'Eco-Conservation Digital Poster',
                    category: 'Digital Skills',
                    grade: 'Class 6',
                    student: 'Rohan Mehra',
                    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=600',
                    description: 'An interactive infographic poster on forest preservation designed using smart design tools.',
                },
                {
                    title: 'AI Historical Story Video',
                    category: 'Video Editing',
                    grade: 'Class 9',
                    student: 'Diya Singhania',
                    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600',
                    description: 'A mini documentary bringing ancient civilizations to life using historical AI recreations.',
                },
            ],
        },
        {
            key: 'faqs',
            category: 'FAQS',
            title: 'Frequently Asked Questions',
            published: true,
            data: [
                {
                    q: 'Which classes is the ALYSTRO program designed for?',
                    a: 'Our programs are segmented into three developmental stages: Foundation Program for Class 6–8, Skill Builder Program for Class 9–10, and Future Ready Program for Class 11–12.',
                },
                {
                    q: 'How long is the program duration and how are sessions scheduled?',
                    a: 'The standard program runs for 3 months with 45-minute interactive sessions. Timings are scheduled in coordination with your school (usually 2–3 sessions per week).',
                },
                {
                    q: 'Is the delivery model online, offline, or hybrid?',
                    a: 'We offer flexible hybrid delivery. Live interactive online mentors guide students directly in your school computer lab or smart classrooms with on-ground school coordinator assistance.',
                },
                {
                    q: 'What hardware/software requirements are needed?',
                    a: 'Standard desktop computers or laptops with web browsers and internet access. All tools used run securely in modern browsers without demanding expensive GPU workstations.',
                },
                {
                    q: 'Will students receive verifiable certificates?',
                    a: 'Yes! Upon completing the curriculum and capstone project, every eligible student receives an official ALYSTRO certificate featuring a unique verification ID and instant QR code.',
                },
            ],
        },
    ]);
    // 14. Notices
    await Notice_js_1.Notice.create({
        school: abcSchool._id,
        title: 'Upcoming Capstone Project Showcase Day',
        content: 'All students of Batch A and Batch B are invited to demonstrate their final AI & Video Editing projects this Friday at 3:00 PM in Computer Lab 1. Parents and teachers are welcome.',
        category: 'WORKSHOP',
        targetRole: 'ALL',
        postedBy: abcAdmin._id,
        pinned: true,
    });
    console.log('[Seed] Database successfully seeded with:');
    console.log(`- Super Admin: superadmin@alystro.com / Admin@123`);
    console.log(`- School Admin (ABC): principal@abcschool.edu / School@123`);
    console.log(`- Teacher: mentor.rohit@alystro.com / Teacher@123`);
    console.log(`- Student: aarav.sharma@student.alystro.com / Student@123`);
    console.log(`- 3 Partner Schools, 3 Flagship Programs, Batches, Students, Attendance, Certificates & CRM Leads.`);
    await (0, database_js_1.disconnectDatabase)();
}
// Auto-run if executed directly
if (process.argv[1]?.includes('seedData')) {
    seedDatabase()
        .then(() => process.exit(0))
        .catch((err) => {
        console.error('Seeding error:', err);
        process.exit(1);
    });
}
