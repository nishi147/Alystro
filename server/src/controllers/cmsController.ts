import { Request, Response } from 'express';
import { CMSContent } from '../models/CMSContent.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getCMSByKey(req: Request, res: Response): Promise<void> {
  try {
    const { key } = req.params;
    const content = await CMSContent.findOne({ key, published: true });
    if (!content) {
      res.status(404).json({ success: false, message: 'Content not found.' });
      return;
    }
    res.json({ success: true, data: content.data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAllCMS(req: Request, res: Response): Promise<void> {
  try {
    const contents = await CMSContent.find().sort({ category: 1 });
    res.json({ success: true, data: contents });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateCMS(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { key } = req.params;
    const { category, title, data, published } = req.body;

    const content = await CMSContent.findOneAndUpdate(
      { key },
      {
        category,
        title,
        data,
        published: published !== undefined ? published : true,
        updatedBy: req.user?.userId,
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: 'Content updated successfully.', data: content });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
