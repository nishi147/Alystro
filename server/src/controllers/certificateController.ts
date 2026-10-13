import { Request, Response } from 'express';
import QRCode from 'qrcode';
import { Certificate } from '../models/Certificate.js';
import { Student } from '../models/Student.js';
import { School } from '../models/School.js';
import { Program } from '../models/Program.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { AuditLog } from '../models/AuditLog.js';

export async function getCertificates(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const query: any = {};

    if (['SCHOOL_ADMIN', 'TEACHER'].includes(req.user?.role || '')) {
      query.school = req.schoolId;
    } else if (req.user?.role === 'STUDENT') {
      const student = await Student.findOne({ user: req.user.userId });
      if (student) {
        query.student = student._id;
      }
    } else if (req.query.schoolId) {
      query.school = req.query.schoolId;
    }

    const certs = await Certificate.find(query).sort({ issueDate: -1 });
    res.json({ success: true, data: certs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function verifyCertificate(req: Request, res: Response): Promise<void> {
  try {
    const { certificateId } = req.params;
    const cert = await Certificate.findOne({
      certificateId: certificateId.toUpperCase().trim(),
    })
      .populate('school', 'name logo address')
      .populate('program', 'name category durationMonths');

    if (!cert) {
      res.status(404).json({
        success: false,
        valid: false,
        message: 'No official ALYSTRO certificate was found matching this credential identifier.',
      });
      return;
    }

    res.json({
      success: true,
      valid: cert.status === 'VALID',
      data: {
        certificateId: cert.certificateId,
        studentName: cert.studentName,
        schoolName: cert.schoolName,
        programName: cert.programName,
        grade: cert.grade,
        issueDate: cert.issueDate,
        completionDate: cert.completionDate,
        status: cert.status,
        verificationQrCode: cert.verificationQrCode,
        school: cert.school,
        program: cert.program,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function issueCertificate(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { studentId, programId, grade = 'Distinction', completionDate } = req.body;

    const student = await Student.findById(studentId).populate('user').populate('school');
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found.' });
      return;
    }

    const program = await Program.findById(programId || student.program);
    if (!program) {
      res.status(404).json({ success: false, message: 'Program not found.' });
      return;
    }

    const school = await School.findById(student.school);
    if (!school) {
      res.status(404).json({ success: false, message: 'School not found.' });
      return;
    }

    // Generate unique ID: ALY-YYYY-XXXXXX
    const year = new Date().getFullYear();
    const randomHex = Math.floor(100000 + Math.random() * 900000);
    const certificateId = `ALY-${year}-${randomHex}`;

    // Verification URL
    const verifyUrl = `${req.protocol}://${req.get('host')}/verify/${certificateId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
      width: 250,
      margin: 1,
      color: { dark: '#0B1B3D', light: '#FFFFFF' },
    });

    const cert = await Certificate.create({
      certificateId,
      student: student._id,
      studentName: (student.user as any)?.name || 'Student',
      school: school._id,
      schoolName: school.name,
      program: program._id,
      programName: program.name,
      grade,
      issueDate: new Date(),
      completionDate: completionDate ? new Date(completionDate) : new Date(),
      verificationQrCode: qrCodeDataUrl,
      status: 'VALID',
      issuedBy: req.user?.userId,
    });

    await AuditLog.create({
      user: req.user?.userId,
      userName: req.user?.name,
      action: 'ISSUE_CERTIFICATE',
      entity: 'Certificate',
      entityId: cert._id.toString(),
      details: `Issued Certificate ${certificateId} for ${cert.studentName}`,
    });

    res.status(201).json({
      success: true,
      message: 'Certificate generated with verification QR code.',
      data: cert,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
