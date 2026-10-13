import { Request, Response } from 'express';
import { Lead } from '../models/Lead.js';
import { School } from '../models/School.js';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import { hashPassword } from '../utils/password.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getLeads(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { status, search } = req.query;
    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { schoolName: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const leads = await Lead.find(query).sort({ updatedAt: -1 });
    res.json({ success: true, data: leads });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function createLead(req: Request, res: Response): Promise<void> {
  try {
    const {
      schoolName,
      contactPerson,
      designation,
      email,
      phone,
      city,
      state,
      estimatedStudents,
      interestedProgram,
      classes,
      preferredDemoDate,
      message,
      leadSource = 'WEBSITE_DEMO',
    } = req.body;

    if (!schoolName || !contactPerson || !email || !phone) {
      res.status(400).json({
        success: false,
        message: 'School Name, Contact Person, Email and Phone are required.',
      });
      return;
    }

    const lead = await Lead.create({
      schoolName,
      contactPerson,
      designation,
      email: email.toLowerCase().trim(),
      phone,
      city: city || 'Not specified',
      state,
      estimatedStudents: estimatedStudents || 250,
      interestedProgram: interestedProgram || 'AI & Digital Skills',
      classes: classes || ['Class 6-8', 'Class 9-10'],
      preferredDemoDate: preferredDemoDate ? new Date(preferredDemoDate) : undefined,
      message,
      leadSource,
      status: 'NEW',
      timeline: [
        {
          action: 'LEAD_CREATED',
          details: `Inquiry submitted via ${leadSource}.`,
          timestamp: new Date(),
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your demo request has been received. Our team will contact you shortly.',
      data: lead,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateLeadStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status, note, demoScheduledAt } = req.body;

    const lead = await Lead.findById(id);
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found.' });
      return;
    }

    const oldStatus = lead.status;
    lead.status = status;
    if (demoScheduledAt) {
      lead.demoScheduledAt = new Date(demoScheduledAt);
    }

    lead.timeline.push({
      action: 'STATUS_UPDATED',
      details: `Status changed from ${oldStatus} to ${status}${note ? ` (${note})` : ''}`,
      performedBy: req.user?.name || 'Admin',
      timestamp: new Date(),
    });

    if (note) {
      lead.notes.push({
        author: req.user?.name || 'Staff',
        text: note,
        createdAt: new Date(),
      });
    }

    await lead.save();

    await AuditLog.create({
      user: req.user?.userId,
      userName: req.user?.name,
      action: 'UPDATE_LEAD_STATUS',
      entity: 'Lead',
      entityId: lead._id.toString(),
      details: `Moved ${lead.schoolName} to stage ${status}`,
    });

    res.json({ success: true, message: `Pipeline stage updated to ${status}.`, data: lead });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function convertLeadToSchool(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const lead = await Lead.findById(id);
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found.' });
      return;
    }

    // Generate unique slug
    let baseSlug = lead.schoolName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    let slug = baseSlug;
    let counter = 1;
    while (await School.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const code = `${lead.schoolName.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const school = await School.create({
      name: lead.schoolName,
      slug,
      code,
      address: { city: lead.city, state: lead.state || 'Rajasthan', country: 'India' },
      contactPerson: {
        name: lead.contactPerson,
        designation: lead.designation,
        phone: lead.phone,
        email: lead.email,
      },
      classesServed: lead.classes && lead.classes.length > 0 ? lead.classes : ['Class 6', 'Class 7', 'Class 8'],
      studentCapacity: lead.estimatedStudents || 300,
      status: 'ACTIVE',
    });

    // Create school admin account
    const defaultPassword = await hashPassword('School@123');
    await User.create({
      name: lead.contactPerson,
      email: lead.email,
      password: defaultPassword,
      role: 'SCHOOL_ADMIN',
      school: school._id,
      phone: lead.phone,
      status: 'ACTIVE',
    });

    lead.status = 'CONVERTED';
    lead.convertedSchool = school._id;
    lead.timeline.push({
      action: 'CONVERTED_TO_SCHOOL',
      details: `Successfully converted lead into active School tenant: ${school.name}`,
      performedBy: req.user?.name || 'Admin',
      timestamp: new Date(),
    });
    await lead.save();

    await AuditLog.create({
      user: req.user?.userId,
      userName: req.user?.name,
      action: 'CONVERT_LEAD',
      entity: 'Lead',
      entityId: lead._id.toString(),
      details: `Converted lead ${lead.schoolName} into school ${school.code}`,
    });

    res.json({
      success: true,
      message: `Lead successfully converted! School ${school.name} is now an active tenant.`,
      data: { school, lead },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
