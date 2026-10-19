
export interface AuthRequest extends Request {
  user?: any;
  session?: any;
}

import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin, extractSessionToken } from './authRoutes';
import { contentService } from './services/contentService.ts';
import { authService } from './services/authService.ts';


export const contentRouter = Router();

// ==========================================
// 1. PUBLIC COMPREHENSIVE BATCH ENDPOINT
// ==========================================
contentRouter.get('/all', async (req: AuthRequest, res: Response) => {
  try {
    let userId: string | undefined;
    const token = extractSessionToken(req);
    if (token) {
      const session = await authService.getSession(token);
      if (session) userId = session.userId;
    }
    const all = await contentService.getAll(userId);
    res.json(all);
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve site content.' });
  }
});
// ==========================================
// 2. EVENTS ENDPOINTS
// ==========================================
contentRouter.get('/events', async (req: AuthRequest, res: Response) => {
  res.json(await contentService.getEvents());
});

contentRouter.post('/events', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { title, date, description, image, upcoming, ongoing, contain, eventTag } = req.body;
    if (!title || !date) {
      return res.status(400).json({ error: 'Event title and date are required.' });
    }
    const newEvent = {
      id: `evt-${Date.now()}`,
      title: title.trim(),
      date: date.trim(),
      description: description || '',
      image: image || 'https://www.nacoslasustech.org.ng/assets/PHOTO-2026-04-29-19-36-07-wlQ92H1G.jpg',
      upcoming: Boolean(upcoming),
      ongoing: Boolean(ongoing),
      contain: Boolean(contain),
      eventTag: eventTag || 'General'
    };
    await contentService.saveEvent(newEvent);
    res.status(201).json({ message: 'Event published successfully.', event: newEvent });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Failed to publish event.' });
  }
});

contentRouter.put('/events/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, date, description, image, upcoming, ongoing, contain, eventTag } = req.body;
    const updated = {
      id,
      title: title?.trim() || 'Untitled Event',
      date: date?.trim() || 'TBD',
      description: description || '',
      image: image || '',
      upcoming: Boolean(upcoming),
      ongoing: Boolean(ongoing),
      contain: Boolean(contain),
      eventTag: eventTag || 'General'
    };
    await contentService.saveEvent(updated);
    res.json({ message: 'Event updated successfully.', event: updated });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Failed to update event.' });
  }
});

contentRouter.delete('/events/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const ok = await contentService.deleteEvent(id);
    if (ok) {
      res.json({ message: 'Event deleted successfully.' });
    } else {
      res.status(404).json({ error: 'Event not found.' });
    }
  } catch (err: unknown) {
    res.status(500).json({ error: 'Failed to delete event.' });
  }
});

// ==========================================
// 3. GALLERY ENDPOINTS
// ==========================================
contentRouter.get('/gallery', async (req: AuthRequest, res: Response) => {
  res.json(await contentService.getGallery());
});

contentRouter.post('/gallery', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { title, eventTag, date, images } = req.body;
    if (!title || !images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Album title and at least one image are required.' });
    }
    const newAlbum = {
      id: `gallery-${Date.now()}`,
      title: title.trim(),
      eventTag: eventTag || 'General',
      date: date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      images
    };
    await contentService.saveGalleryItem(newAlbum);
    res.status(201).json({ message: 'Gallery album saved successfully.', album: newAlbum });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Failed to save gallery album.' });
  }
});

contentRouter.put('/gallery/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, eventTag, date, images } = req.body;
    const updated = {
      id,
      title: title?.trim() || 'Untitled Album',
      eventTag: eventTag || 'General',
      date: date || new Date().toLocaleDateString('en-US'),
      images: Array.isArray(images) ? images : []
    };
    await contentService.saveGalleryItem(updated);
    res.json({ message: 'Gallery album updated successfully.', album: updated });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Failed to update gallery album.' });
  }
});

contentRouter.delete('/gallery/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const ok = await contentService.deleteGalleryItem(id);
    if (ok) {
      res.json({ message: 'Gallery item deleted successfully.' });
    } else {
      res.status(404).json({ error: 'Gallery item not found.' });
    }
  } catch (err: unknown) {
    res.status(500).json({ error: 'Failed to delete gallery item.' });
  }
});

// ==========================================
// 4. CONSTITUTION ENDPOINTS
// ==========================================
contentRouter.get('/constitution', async (req: AuthRequest, res: Response) => {
  res.json(await contentService.getConstitution());
});

contentRouter.put('/constitution', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { pdfUrl, fileName, fileSize, articles, published } = req.body;
    const current = await contentService.getConstitution();
    const updated = {
      pdfUrl: pdfUrl !== undefined ? pdfUrl : current.pdfUrl,
      fileName: fileName || current.fileName,
      fileSize: fileSize || current.fileSize,
      updatedAt: new Date().toISOString().split('T')[0],
      published: published !== undefined ? Boolean(published) : current.published,
      articles: Array.isArray(articles) ? articles : current.articles
    };
    await contentService.updateConstitution(updated);
    res.json({ message: 'Constitution document updated successfully.', constitution: updated });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Failed to update constitution.' });
  }
});

// ==========================================
// 5. AWARDS ENDPOINTS
// ==========================================
contentRouter.get('/awards', async (req: AuthRequest, res: Response) => {
  res.json(await contentService.getAwards());
});

contentRouter.post('/awards', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { title, recipient, year, category, description, image, certificateUrl } = req.body;
    if (!title || !recipient) {
      return res.status(400).json({ error: 'Award title and recipient name are required.' });
    }
    const newAward = {
      id: `award-${Date.now()}`,
      title: title.trim(),
      recipient: recipient.trim(),
      year: year || '2025/2026',
      category: category || 'Excellence',
      description: description || '',
      image: image || '',
      certificateUrl: certificateUrl || ''
    };
    await contentService.saveAward(newAward);
    res.status(201).json({ message: 'Award registered successfully.', award: newAward });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Failed to register award.' });
  }
});

contentRouter.put('/awards/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, recipient, year, category, description, image, certificateUrl } = req.body;
    const updated = {
      id,
      title: title?.trim() || 'Untitled Award',
      recipient: recipient?.trim() || 'Recipient',
      year: year || '2025/2026',
      category: category || 'Excellence',
      description: description || '',
      image: image || '',
      certificateUrl: certificateUrl || ''
    };
    await contentService.saveAward(updated);
    res.json({ message: 'Award updated successfully.', award: updated });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Failed to update award.' });
  }
});

contentRouter.delete('/awards/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const ok = await contentService.deleteAward(id);
    if (ok) {
      res.json({ message: 'Award deleted successfully.' });
    } else {
      res.status(404).json({ error: 'Award not found.' });
    }
  } catch (err: unknown) {
    res.status(500).json({ error: 'Failed to delete award.' });
  }
});

// ==========================================
// 6. VOTING & SECURE BALLOT ENDPOINTS
// ==========================================
contentRouter.get('/voting', async (req: AuthRequest, res: Response) => {
  try {
    const votingData = await contentService.getVotingData();
    let userVotedCategories: string[] = [];
    const token = extractSessionToken(req);
    if (token) {
      const session = await authService.getSession(token);
      if (session) {
        userVotedCategories = await contentService.getUserVotedCategories(session.userId);
      }
    }
    res.json({
      ...votingData,
      userVotedCategories
    });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Failed to retrieve voting data.' });
  }
});

// Cast Vote: Requires standard authenticated user session!
contentRouter.post('/voting/vote', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { categoryId, nomineeId } = req.body;

    if (!categoryId || !nomineeId) {
      return res.status(400).json({ error: 'Voting category ID and nominee ID are required.' });
    }

    const result = await contentService.castVote(categoryId, nomineeId, user.id);
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    res.json({ 
      success: true, 
      message: result.message,
      userVotedCategories: await contentService.getUserVotedCategories(user.id)
    });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Internal server error while recording vote.' });
  }
});

// Manage Categories (Admin)
contentRouter.post('/voting/category', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id, title, slug, groupKey, groupName, description, nominees } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Category title is required.' });
    }
    const catId = id || `cat-${Date.now()}`;
    const category = {
      id: catId,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: title.trim(),
      groupKey: groupKey || 'general',
      groupName: groupName || 'General Awards',
      description: description || '',
      nominees: Array.isArray(nominees) ? nominees : []
    };
    await contentService.saveVotingCategory(category);
    res.status(201).json({ message: 'Voting category saved.', category });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Failed to save voting category.' });
  }
});

contentRouter.delete('/voting/category/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const ok = await contentService.deleteVotingCategory(id);
    if (ok) {
      res.json({ message: 'Voting category deleted successfully.' });
    } else {
      res.status(404).json({ error: 'Category not found.' });
    }
  } catch (err: unknown) {
    res.status(500).json({ error: 'Failed to delete category.' });
  }
});

contentRouter.put('/voting/settings', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { isOpen, title, instructions, startDate, endDate, allowMultipleCategoriesVote } = req.body;
    const settings = {
      isOpen: Boolean(isOpen),
      title: title || 'NAPS Honors Voting',
      instructions: instructions || 'Vote once per category.',
      startDate: startDate || '',
      endDate: endDate || '',
      allowMultipleCategoriesVote: allowMultipleCategoriesVote !== false
    };
    await contentService.updateVotingSettings(settings);
    res.json({ message: 'Voting settings updated.', settings });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Failed to update voting settings.' });
  }
});

contentRouter.post('/voting/reset', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { categoryId } = req.body;
    await contentService.resetVotes(categoryId);
    res.json({ message: 'Votes successfully reset.' });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Failed to reset votes.' });
  }
});

// ==========================================
// 7. CONTACT INFO ENDPOINTS
// ==========================================
contentRouter.get('/contact', async (req: AuthRequest, res: Response) => {
  res.json(await contentService.getContact());
});

contentRouter.put('/contact', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { 
      phone, alternativePhone, email, secretariatEmail, officeAddress, 
      faculty, campus, twitter, instagram, linkedin, whatsapp, operatingHours 
    } = req.body;

    const updated = {
      phone: phone?.trim() || '+234 802 345 6789',
      alternativePhone: alternativePhone?.trim() || '',
      email: email?.trim() || 'napslasustech@gmail.com',
      secretariatEmail: secretariatEmail?.trim() || '',
      officeAddress: officeAddress?.trim() || 'Department of Physics, LASUSTECH, Ikorodu',
      faculty: faculty?.trim() || 'Faculty of Science',
      campus: campus?.trim() || 'Ikorodu Main Campus',
      twitter: twitter?.trim() || '',
      instagram: instagram?.trim() || '',
      linkedin: linkedin?.trim() || '',
      whatsapp: whatsapp?.trim() || '',
      operatingHours: operatingHours?.trim() || 'Mon - Fri: 8:00 AM - 5:00 PM'
    };

    await contentService.updateContact(updated);
    res.json({ message: 'Contact information updated globally.', contact: updated });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Failed to update contact info.' });
  }
});

// ==========================================
// 8. MENU & NAVIGATION ENDPOINTS
// ==========================================
contentRouter.get('/menu', async (req: AuthRequest, res: Response) => {
  res.json(await contentService.getMenu());
});

contentRouter.put('/menu', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Menu items array is required.' });
    }
    const cleanItems = items.map((it: any, index: number) => ({
      id: it.id || `menu-${index}`,
      label: it.label?.trim() || 'Link',
      targetView: it.targetView || 'home',
      visible: it.visible !== false,
      order: typeof it.order === 'number' ? it.order : index + 1,
      isExternal: Boolean(it.isExternal),
      externalUrl: it.externalUrl || '',
      badge: it.badge || ''
    }));
    await contentService.updateMenu(cleanItems);
    res.json({ message: 'Navigation menu updated successfully.', menu: cleanItems });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Failed to update navigation menu.' });
  }
});

// ==========================================
// 9. PEOPLE & PROFILES (Executives, Honourable, Patrons, Officials)
// ==========================================
contentRouter.get('/people', async (req: AuthRequest, res: Response) => {
  res.json(await contentService.getPeople());
});

contentRouter.post('/people', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, post, level, category, description, bio, image, phone, email, department, order } = req.body;
    if (!name || !post) {
      return res.status(400).json({ error: 'Full name and position/title are required.' });
    }
    const newPerson = {
      id: `peo-${Date.now()}`,
      name: name.trim(),
      post: post.trim(),
      level: level || '400 Level',
      category: category || 'executive',
      description: description || '',
      bio: bio || '',
      image: image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      phone: phone || '',
      email: email || '',
      department: department || 'Department of Physics',
      order: typeof order === 'number' ? order : 50
    };
    await contentService.savePerson(newPerson);
    res.status(201).json({ message: 'Profile created successfully.', person: newPerson });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Failed to save person profile.' });
  }
});

contentRouter.put('/people/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, post, level, category, description, bio, image, phone, email, department, order } = req.body;
    const updated = {
      id,
      name: name?.trim() || 'Official',
      post: post?.trim() || 'Executive Member',
      level: level || '400 Level',
      category: category || 'executive',
      description: description || '',
      bio: bio || '',
      image: image || '',
      phone: phone || '',
      email: email || '',
      department: department || 'Department of Physics',
      order: typeof order === 'number' ? order : 50
    };
    await contentService.savePerson(updated);
    res.json({ message: 'Profile updated successfully.', person: updated });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Failed to update person profile.' });
  }
});

contentRouter.delete('/people/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const ok = await contentService.deletePerson(id);
    if (ok) {
      res.json({ message: 'Profile removed successfully.' });
    } else {
      res.status(404).json({ error: 'Profile not found.' });
    }
  } catch (err: unknown) {
    res.status(500).json({ error: 'Failed to delete person profile.' });
  }
});

// ==========================================
// 10. PAST QUESTIONS ENDPOINTS
// ==========================================
contentRouter.get('/past-questions', async (req: AuthRequest, res: Response) => {
  res.json(await contentService.getPastQuestions());
});

contentRouter.post('/past-questions', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const pq = req.body;
    if (!pq.courseCode || !pq.courseTitle) {
      return res.status(400).json({ error: 'Course code and course title are required.' });
    }
    const item = {
      ...pq,
      id: pq.id || `pq-${Date.now()}`,
      downloads: pq.downloads || 0,
      uploadedAt: pq.uploadedAt || new Date().toISOString()
    };
    await contentService.savePastQuestion(item);
    res.status(201).json({ message: 'Past question registered in archive.', item });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Failed to save past question.' });
  }
});

contentRouter.put('/past-questions/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const pq = req.body;
    const item = {
      ...pq,
      id
    };
    await contentService.savePastQuestion(item);
    res.json({ message: 'Past question updated successfully.', item });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Failed to update past question.' });
  }
});

contentRouter.delete('/past-questions/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const ok = await contentService.deletePastQuestion(id);
    if (ok) {
      res.json({ message: 'Past question deleted successfully.' });
    } else {
      res.status(404).json({ error: 'Past question not found.' });
    }
  } catch (err: unknown) {
    res.status(500).json({ error: 'Failed to delete past question.' });
  }
});

// ==========================================
// 11. SITE SETTINGS ENDPOINTS
// ==========================================
contentRouter.get('/site-settings', async (req: AuthRequest, res: Response) => {
  res.json(await contentService.getSiteSettings());
});

contentRouter.put('/site-settings', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const settings = req.body;
    await contentService.updateSiteSettings(settings);
    res.json({ message: 'Site configuration updated.', settings });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Failed to update site settings.' });
  }
});
