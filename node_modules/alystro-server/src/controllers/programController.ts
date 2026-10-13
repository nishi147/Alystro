import { Request, Response } from 'express';
import { Program } from '../models/Program.js';

export async function getPrograms(req: Request, res: Response): Promise<void> {
  try {
    const { gradeLevel, featured } = req.query;
    const query: any = { published: true };

    if (gradeLevel) {
      query.gradeLevel = gradeLevel;
    }
    if (featured === 'true') {
      query.featured = true;
    }

    const programs = await Program.find(query).sort({ gradeLevel: 1 });
    res.json({ success: true, data: programs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getProgramBySlug(req: Request, res: Response): Promise<void> {
  try {
    const program = await Program.findOne({ slug: req.params.slug });
    if (!program) {
      res.status(404).json({ success: false, message: 'Program not found.' });
      return;
    }
    res.json({ success: true, data: program });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function createProgram(req: Request, res: Response): Promise<void> {
  try {
    const program = await Program.create(req.body);
    res.status(201).json({ success: true, message: 'Program created successfully.', data: program });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateProgram(req: Request, res: Response): Promise<void> {
  try {
    const program = await Program.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!program) {
      res.status(404).json({ success: false, message: 'Program not found.' });
      return;
    }
    res.json({ success: true, message: 'Program updated successfully.', data: program });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
