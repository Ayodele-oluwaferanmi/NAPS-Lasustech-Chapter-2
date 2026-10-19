import { eq, inArray, and } from 'drizzle-orm';
import { getDb } from '../db/index.ts';
import * as schema from '../db/schema.ts';
import {
  ChapterEvent,
  GalleryItem,
  VotingCategory,
  Nominee,
  ConstitutionArticle,
  ConstitutionDocument,
  AwardItem,
  ContactInfo,
  NavigationMenuItem,
  VotingSettings,
  PeopleProfile,
  SiteSettings,
  PastQuestion,
  ManualQuestionItem
} from '../../src/types/index.js';

export class ContentService {
  async getAll(userId?: string) {
    const db = getDb();
    
    // Fetch all independently to map to JSON
    const events = await this.getEvents();
    const gallery = await this.getGallery();
    const constitution = await this.getConstitution();
    const awards = await this.getAwards();
    const votingData = await this.getVotingData();
    const contact = await this.getContact();
    const menu = await this.getMenu();
    const people = await this.getPeople();
    const pastQuestions = await this.getPastQuestions();
    const siteSettings = await this.getSiteSettings();
    
    let userVotedCategories: string[] = [];
    if (userId) {
      userVotedCategories = await this.getUserVotedCategories(userId);
    }
    
    return {
      events,
      gallery,
      constitution,
      awards,
      voting: {
        categories: votingData.categories,
        settings: votingData.settings,
        userVotedCategories
      },
      contact,
      menu,
      people,
      pastQuestions,
      siteSettings
    };
  }

  async getEvents(): Promise<ChapterEvent[]> {
    const db = getDb();
    const result = await db.select().from(schema.events);
    return result.map(e => ({
      id: e.id,
      title: e.title,
      date: e.date,
      description: e.description,
      image: e.image,
      upcoming: !!e.upcoming,
      ongoing: !!e.ongoing,
      contain: !!e.contain,
      eventTag: e.eventTag || undefined,
      time: e.time || undefined,
      venue: e.venue || undefined,
      registrationInfo: e.registrationInfo || undefined,
      registrationUrl: e.registrationUrl || undefined
    }));
  }

  async saveEvent(event: ChapterEvent): Promise<ChapterEvent> {
    const db = getDb();
    await db.insert(schema.events).values({
      id: event.id,
      title: event.title,
      date: event.date,
      description: event.description,
      image: event.image,
      upcoming: event.upcoming,
      ongoing: event.ongoing,
      contain: event.contain,
      eventTag: event.eventTag,
      time: event.time,
      venue: event.venue,
      registrationInfo: event.registrationInfo,
      registrationUrl: event.registrationUrl
    }).onConflictDoUpdate({
      target: schema.events.id,
      set: {
        title: event.title,
        date: event.date,
        description: event.description,
        image: event.image,
        upcoming: event.upcoming,
        ongoing: event.ongoing,
        contain: event.contain,
        eventTag: event.eventTag,
        time: event.time,
        venue: event.venue,
        registrationInfo: event.registrationInfo,
        registrationUrl: event.registrationUrl
      }
    });
    return event;
  }

  async deleteEvent(id: string): Promise<boolean> {
    const db = getDb();
    const result = await db.delete(schema.events).where(eq(schema.events.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getGallery(): Promise<GalleryItem[]> {
    const db = getDb();
    const albums = await db.query.galleryAlbums.findMany({
      with: { images: true }
    });
    
    return albums.map(a => {
      // sort images by order
      const sortedImages = a.images.sort((x, y) => x.order - y.order).map(i => i.url);
      return {
        id: a.id,
        title: a.title,
        eventTag: a.eventTag,
        date: a.date,
        dateSortValue: a.dateSortValue || undefined,
        images: sortedImages
      };
    });
  }

  async saveGalleryItem(item: GalleryItem): Promise<GalleryItem> {
    const db = getDb();
    await db.insert(schema.galleryAlbums).values({
      id: item.id,
      title: item.title,
      eventTag: item.eventTag,
      date: item.date,
      dateSortValue: item.dateSortValue || null
    }).onConflictDoUpdate({
      target: schema.galleryAlbums.id,
      set: {
        title: item.title,
        eventTag: item.eventTag,
        date: item.date,
        dateSortValue: item.dateSortValue || null
      }
    });

    await db.delete(schema.galleryImages).where(eq(schema.galleryImages.albumId, item.id));
    if (item.images && item.images.length > 0) {
      let order = 0;
      for (const imgUrl of item.images) {
        await db.insert(schema.galleryImages).values({
          albumId: item.id,
          url: imgUrl,
          order: order++
        });
      }
    }
    
    return item;
  }

  async deleteGalleryItem(id: string): Promise<boolean> {
    const db = getDb();
    const result = await db.delete(schema.galleryAlbums).where(eq(schema.galleryAlbums.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getConstitution(): Promise<ConstitutionDocument> {
    const db = getDb();
    const doc = await db.query.constitutionDocument.findFirst({
      with: {
        articles: {
          with: { sections: true }
        }
      }
    });
    
    if (!doc) {
      return { published: false, articles: [] };
    }
    
    const articles = doc.articles.sort((a,b) => a.order - b.order).map(a => {
      return {
        number: a.number,
        title: a.title,
        sections: a.sections.sort((s1, s2) => s1.order - s2.order).map(s => ({
          title: s.title,
          content: s.content
        }))
      };
    });
    
    return {
      pdfUrl: doc.pdfUrl || undefined,
      fileName: doc.fileName || undefined,
      fileSize: doc.fileSize || undefined,
      updatedAt: doc.updatedAt || undefined,
      published: !!doc.published,
      articles
    };
  }

  async updateConstitution(doc: ConstitutionDocument): Promise<ConstitutionDocument> {
    const db = getDb();
    await db.insert(schema.constitutionDocument).values({
      id: 1,
      pdfUrl: doc.pdfUrl || '',
      fileName: doc.fileName || '',
      fileSize: doc.fileSize || '',
      updatedAt: doc.updatedAt || '',
      published: doc.published
    }).onConflictDoUpdate({
      target: schema.constitutionDocument.id,
      set: {
        pdfUrl: doc.pdfUrl || '',
        fileName: doc.fileName || '',
        fileSize: doc.fileSize || '',
        updatedAt: doc.updatedAt || '',
        published: doc.published
      }
    });
    
    // Replace all articles
    await db.delete(schema.constitutionArticles).where(eq(schema.constitutionArticles.documentId, 1));
    
    if (doc.articles && doc.articles.length > 0) {
      let aOrder = 0;
      for (const a of doc.articles) {
        const [article] = await db.insert(schema.constitutionArticles).values({
          documentId: 1,
          number: a.number,
          title: a.title,
          order: aOrder++
        }).returning();
        
        if (a.sections && a.sections.length > 0) {
          let sOrder = 0;
          for (const s of a.sections) {
            await db.insert(schema.constitutionSections).values({
              articleId: article.id,
              title: s.title,
              content: s.content,
              order: sOrder++
            });
          }
        }
      }
    }
    return doc;
  }

  async getAwards(): Promise<AwardItem[]> {
    const db = getDb();
    const result = await db.select().from(schema.awards);
    return result.map(a => ({
      id: a.id,
      title: a.title,
      recipient: a.recipient,
      year: a.year,
      category: a.category,
      description: a.description,
      image: a.image || undefined,
      certificateUrl: a.certificateUrl || undefined
    }));
  }

  async saveAward(award: AwardItem): Promise<AwardItem> {
    const db = getDb();
    await db.insert(schema.awards).values({
      id: award.id,
      title: award.title,
      recipient: award.recipient,
      year: award.year,
      category: award.category,
      description: award.description,
      image: award.image || null,
      certificateUrl: award.certificateUrl || null
    }).onConflictDoUpdate({
      target: schema.awards.id,
      set: {
        title: award.title,
        recipient: award.recipient,
        year: award.year,
        category: award.category,
        description: award.description,
        image: award.image || null,
        certificateUrl: award.certificateUrl || null
      }
    });
    return award;
  }

  async deleteAward(id: string): Promise<boolean> {
    const db = getDb();
    const result = await db.delete(schema.awards).where(eq(schema.awards.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getVotingData() {
    const db = getDb();
    const categoriesDb = await db.query.votingCategories.findMany({
      with: { 
        nominees: {
          with: { votes: true }
        }
      }
    });
    
    const settingsDb = await db.query.votingSettings.findFirst();
    const settings: VotingSettings = settingsDb ? {
      isOpen: !!settingsDb.isOpen,
      title: settingsDb.title || undefined,
      electionTitle: settingsDb.electionTitle || undefined,
      session: settingsDb.session || undefined,
      instructions: settingsDb.instructions || undefined,
      startDate: settingsDb.startDate || undefined,
      endDate: settingsDb.endDate || undefined,
      allowMultipleCategoriesVote: !!settingsDb.allowMultipleCategoriesVote,
      oneVotePerUser: !!settingsDb.oneVotePerUser,
      requireBiometrics: !!settingsDb.requireBiometrics,
      strictMatricValidation: !!settingsDb.strictMatricValidation
    } : { isOpen: false } as any;
    
    const categories: VotingCategory[] = categoriesDb.sort((a,b) => a.order - b.order).map(c => {
      return {
        id: c.id,
        slug: c.slug,
        title: c.title,
        groupKey: c.groupKey,
        groupName: c.groupName,
        description: c.description,
        nominees: c.nominees.map(n => ({
          id: n.id,
          name: n.name,
          level: n.level,
          discipline: n.discipline,
          image: n.image || undefined,
          description: n.description || undefined,
          votes: n.votes.length // Counting actual vote records
        }))
      };
    });
    
    return { categories, settings };
  }

  async hasUserVoted(categoryId: string, userId: string): Promise<boolean> {
    const db = getDb();
    const existing = await db.select().from(schema.votes).where(
      and(
        eq(schema.votes.categoryId, categoryId),
        eq(schema.votes.userId, userId)
      )
    ).limit(1);
    return existing.length > 0;
  }

  async getUserVotedCategories(userId: string): Promise<string[]> {
    const db = getDb();
    const userVotes = await db.select({ categoryId: schema.votes.categoryId }).from(schema.votes).where(eq(schema.votes.userId, userId));
    return userVotes.map(v => v.categoryId);
  }

  async castVote(categoryId: string, nomineeId: string, userId: string): Promise<{ success: boolean; message: string }> {
    const db = getDb();
    
    const settings = await db.query.votingSettings.findFirst();
    if (!settings || !settings.isOpen) {
      return { success: false, message: 'Voting is currently closed.' };
    }
    
    const category = await db.query.votingCategories.findFirst({ where: eq(schema.votingCategories.id, categoryId) });
    if (!category) return { success: false, message: 'Category not found.' };
    
    const nominee = await db.query.votingNominees.findFirst({ where: eq(schema.votingNominees.id, nomineeId) });
    if (!nominee) return { success: false, message: 'Nominee not found.' };

    const hasVoted = await this.hasUserVoted(categoryId, userId);
    if (hasVoted) {
      return { success: false, message: 'You have already voted in this category.' };
    }
    
    try {
      await db.insert(schema.votes).values({
        userId,
        categoryId,
        nomineeId
      });
      return { success: true, message: 'Vote successfully recorded.' };
    } catch (e: unknown) {
      return { success: false, message: 'An error occurred while recording your vote.' };
    }
  }

  async saveVotingCategory(category: VotingCategory): Promise<VotingCategory> {
    const db = getDb();
    await db.insert(schema.votingCategories).values({
      id: category.id,
      slug: category.slug,
      title: category.title,
      groupKey: category.groupKey,
      groupName: category.groupName,
      description: category.description,
    }).onConflictDoUpdate({
      target: schema.votingCategories.id,
      set: {
        slug: category.slug,
        title: category.title,
        groupKey: category.groupKey,
        groupName: category.groupName,
        description: category.description,
      }
    });
    
    // To preserve votes, we should be careful when deleting nominees.
    // Easiest is to upsert nominees and delete those not in the list.
    const existingNominees = await db.select({ id: schema.votingNominees.id }).from(schema.votingNominees).where(eq(schema.votingNominees.categoryId, category.id));
    const newNomineeIds = category.nominees.map(n => n.id);
    
    const toDelete = existingNominees.filter(n => !newNomineeIds.includes(n.id)).map(n => n.id);
    if (toDelete.length > 0) {
      await db.delete(schema.votingNominees).where(inArray(schema.votingNominees.id, toDelete));
    }
    
    for (const nom of category.nominees) {
      await db.insert(schema.votingNominees).values({
        id: nom.id,
        categoryId: category.id,
        name: nom.name,
        level: nom.level,
        discipline: nom.discipline,
        image: nom.image || null,
        description: nom.description || null
      }).onConflictDoUpdate({
        target: schema.votingNominees.id,
        set: {
          name: nom.name,
          level: nom.level,
          discipline: nom.discipline,
          image: nom.image || null,
          description: nom.description || null
        }
      });
    }
    
    return category;
  }

  async deleteVotingCategory(id: string): Promise<boolean> {
    const db = getDb();
    const result = await db.delete(schema.votingCategories).where(eq(schema.votingCategories.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async updateVotingSettings(settings: VotingSettings): Promise<VotingSettings> {
    const db = getDb();
    await db.insert(schema.votingSettings).values({
      id: 1,
      isOpen: !!settings.isOpen,
      title: settings.title,
      electionTitle: settings.electionTitle,
      session: settings.session,
      instructions: settings.instructions,
      startDate: settings.startDate,
      endDate: settings.endDate,
      allowMultipleCategoriesVote: settings.allowMultipleCategoriesVote,
      oneVotePerUser: settings.oneVotePerUser,
      requireBiometrics: settings.requireBiometrics,
      strictMatricValidation: settings.strictMatricValidation
    }).onConflictDoUpdate({
      target: schema.votingSettings.id,
      set: {
        isOpen: !!settings.isOpen,
        title: settings.title,
        electionTitle: settings.electionTitle,
        session: settings.session,
        instructions: settings.instructions,
        startDate: settings.startDate,
        endDate: settings.endDate,
        allowMultipleCategoriesVote: settings.allowMultipleCategoriesVote,
        oneVotePerUser: settings.oneVotePerUser,
        requireBiometrics: settings.requireBiometrics,
        strictMatricValidation: settings.strictMatricValidation
      }
    });
    return settings;
  }

  async resetVotes(categoryId?: string): Promise<void> {
    const db = getDb();
    if (categoryId) {
      await db.delete(schema.votes).where(eq(schema.votes.categoryId, categoryId));
    } else {
      await db.delete(schema.votes);
    }
  }

  async getContact(): Promise<any> { const db = getDb(); const contactRes = await db.select().from(schema.contactInfo) as any; return contactRes[0]; };

  async updateContact(contact: ContactInfo): Promise<ContactInfo> {
    const db = getDb();
    await db.insert(schema.contactInfo).values({
      id: 1,
      phone: contact.phone || '',
      email: contact.email || '',
      alternativePhone: contact.alternativePhone,
      secretariatEmail: contact.secretariatEmail,
      officeAddress: contact.officeAddress,
      address: contact.address,
      faculty: contact.faculty,
      campus: contact.campus,
      twitter: contact.twitter,
      instagram: contact.instagram,
      linkedin: contact.linkedin,
      telegram: contact.telegram,
      whatsapp: contact.whatsapp,
      whatsappGroup: contact.whatsappGroup,
      operatingHours: contact.operatingHours,
      officeHours: contact.officeHours
    }).onConflictDoUpdate({
      target: schema.contactInfo.id,
      set: {
        phone: contact.phone || '',
        email: contact.email || '',
        alternativePhone: contact.alternativePhone,
        secretariatEmail: contact.secretariatEmail,
        officeAddress: contact.officeAddress,
        address: contact.address,
        faculty: contact.faculty,
        campus: contact.campus,
        twitter: contact.twitter,
        instagram: contact.instagram,
        linkedin: contact.linkedin,
        telegram: contact.telegram,
        whatsapp: contact.whatsapp,
        whatsappGroup: contact.whatsappGroup,
        operatingHours: contact.operatingHours,
        officeHours: contact.officeHours
      }
    });
    return contact;
  }

  async getMenu(): Promise<NavigationMenuItem[]> {
    const db = getDb();
    const result = await db.select().from(schema.navigationMenu).orderBy(schema.navigationMenu.order);
    return result.map(m => ({
      id: m.id,
      label: m.label,
      targetView: m.targetView,
      visible: !!m.visible,
      order: m.order,
      isExternal: !!m.isExternal,
      externalUrl: m.externalUrl || undefined,
      badge: m.badge || undefined
    }));
  }

  async updateMenu(items: NavigationMenuItem[]): Promise<NavigationMenuItem[]> {
    const db = getDb();
    await db.delete(schema.navigationMenu);
    if (items.length > 0) {
      for (const m of items) {
        await db.insert(schema.navigationMenu).values({
          id: m.id,
          label: m.label,
          targetView: m.targetView,
          visible: m.visible,
          order: m.order,
          isExternal: m.isExternal,
          externalUrl: m.externalUrl,
          badge: m.badge
        });
      }
    }
    return items;
  }

  async getPeople(): Promise<PeopleProfile[]> {
    const db = getDb();
    const result = await db.select().from(schema.peopleProfiles).orderBy(schema.peopleProfiles.order);
    return result.map(p => ({
      id: p.id,
      name: p.name,
      post: p.post,
      level: p.level,
      description: p.description,
      bio: p.bio || undefined,
      image: p.image,
      category: p.category as 'executive'|'honourable'|'patron',
      phone: p.phone || undefined,
      email: p.email || undefined,
      department: p.department || undefined,
      order: p.order
    }));
  }

  async savePerson(person: PeopleProfile): Promise<PeopleProfile> {
    const db = getDb();
    await db.insert(schema.peopleProfiles).values({
      id: person.id,
      name: person.name,
      post: person.post,
      level: person.level,
      description: person.description,
      bio: person.bio,
      image: person.image,
      category: person.category,
      phone: person.phone,
      email: person.email,
      department: person.department,
      order: person.order || 0
    }).onConflictDoUpdate({
      target: schema.peopleProfiles.id,
      set: {
        name: person.name,
        post: person.post,
        level: person.level,
        description: person.description,
        bio: person.bio,
        image: person.image,
        category: person.category,
        phone: person.phone,
        email: person.email,
        department: person.department,
        order: person.order || 0
      }
    });
    return person;
  }

  async deletePerson(id: string): Promise<boolean> {
    const db = getDb();
    const result = await db.delete(schema.peopleProfiles).where(eq(schema.peopleProfiles.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getPastQuestions(): Promise<PastQuestion[]> {
    const db = getDb();
    const questions = await db.query.pastQuestions.findMany({
      with: {
        images: true,
        manualQuestions: true
      }
    });
    return (questions as any).map(pq => {
      const sortedImages = pq.images.sort((a,b) => a.order - b.order).map(i => i.url);
      const sortedManuals = pq.manualQuestions.sort((a,b) => a.order - b.order).map(m => ({
        id: m.id,
        number: m.number,
        section: m.section || undefined,
        text: m.text,
        options: m.options || undefined,
        answer: m.answer || undefined,
        marks: m.marks || undefined
      }));
      
      return {
        id: pq.id,
        courseCode: pq.courseCode,
        courseTitle: pq.courseTitle,
        level: pq.level as any,
        semester: pq.semester as string,
        session: pq.session,
        examType: pq.examType as 'CA'|'Exam',
        downloads: pq.downloads,
        fileSize: pq.fileSize,
        formatType: pq.formatType as 'PDF'|'Image'|'Text',
        department: pq.department || undefined,
        instructions: pq.instructions || undefined,
        duration: pq.duration || undefined,
        pdfUrl: pq.pdfUrl || undefined,
        pdfFileName: pq.pdfFileName || undefined,
        images: sortedImages,
        manualQuestions: sortedManuals,
        manualContent: pq.manualContent || undefined,
        uploadedAt: pq.uploadedAt || undefined
      };
    });
  }

  async savePastQuestion(pq: PastQuestion): Promise<PastQuestion> {
    const db = getDb();
    await db.insert(schema.pastQuestions).values({
      id: pq.id,
      courseCode: pq.courseCode,
      courseTitle: pq.courseTitle,
      level: pq.level,
      semester: pq.semester as any,
      session: pq.session,
      examType: pq.examType,
      downloads: pq.downloads,
      fileSize: pq.fileSize,
      formatType: pq.formatType,
      department: pq.department,
      instructions: pq.instructions,
      duration: pq.duration,
      pdfUrl: pq.pdfUrl,
      pdfFileName: pq.pdfFileName,
      manualContent: pq.manualContent,
      uploadedAt: pq.uploadedAt
    }).onConflictDoUpdate({
      target: schema.pastQuestions.id,
      set: {
        courseCode: pq.courseCode,
        courseTitle: pq.courseTitle,
        level: pq.level,
        semester: pq.semester as any,
        session: pq.session,
        examType: pq.examType,
        downloads: pq.downloads,
        fileSize: pq.fileSize,
        formatType: pq.formatType,
        department: pq.department,
        instructions: pq.instructions,
        duration: pq.duration,
        pdfUrl: pq.pdfUrl,
        pdfFileName: pq.pdfFileName,
        manualContent: pq.manualContent,
        uploadedAt: pq.uploadedAt
      }
    });

    await db.delete(schema.pastQuestionImages).where(eq(schema.pastQuestionImages.pastQuestionId, pq.id));
    if (pq.images) {
      let order = 0;
      for (const img of pq.images) {
        await db.insert(schema.pastQuestionImages).values({
          pastQuestionId: pq.id,
          url: img,
          order: order++
        });
      }
    }

    await db.delete(schema.pastQuestionManuals).where(eq(schema.pastQuestionManuals.pastQuestionId, pq.id));
    if (pq.manualQuestions) {
      let order = 0;
      for (const mq of pq.manualQuestions) {
        await db.insert(schema.pastQuestionManuals).values({
          id: mq.id,
          pastQuestionId: pq.id,
          number: String(mq.number),
          section: mq.section,
          text: mq.text,
          options: mq.options,
          answer: mq.answer,
          marks: mq.marks,
          order: order++
        });
      }
    }
    return pq;
  }

  async deletePastQuestion(id: string): Promise<boolean> {
    const db = getDb();
    const result = await db.delete(schema.pastQuestions).where(eq(schema.pastQuestions.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getSiteSettings(): Promise<any> { const db = getDb(); const settingsRes = await db.select().from(schema.siteSettings) as any; return settingsRes[0]; };

  async updateSiteSettings(settings: SiteSettings): Promise<SiteSettings> {
    const db = getDb();
    await db.insert(schema.siteSettings).values({
      id: 1,
      associationName: settings.associationName,
      chapterName: settings.chapterName,
      shortName: settings.shortName,
      institution: settings.institution,
      faculty: settings.faculty,
      department: settings.department,
      motto: settings.motto,
      academicSession: settings.academicSession,
      currentSession: settings.currentSession,
      semester: settings.semester,
      duesAmount: settings.duesAmount,
      bankName: settings.bankName,
      accountNumber: settings.accountNumber,
      accountName: settings.accountName,
      portalNotice: settings.portalNotice,
      broadcastNotice: settings.broadcastNotice || null,
      emergencyNotice: settings.emergencyNotice || null,
      registrationOpen: settings.registrationOpen,
      allowRegistration: settings.allowRegistration,
      allowVoting: settings.allowVoting,
      maintenanceMode: settings.maintenanceMode,
      contactEmail: settings.contactEmail
    }).onConflictDoUpdate({
      target: schema.siteSettings.id,
      set: {
        associationName: settings.associationName,
        chapterName: settings.chapterName,
        shortName: settings.shortName,
        institution: settings.institution,
        faculty: settings.faculty,
        department: settings.department,
        motto: settings.motto,
        academicSession: settings.academicSession,
        currentSession: settings.currentSession,
        semester: settings.semester,
        duesAmount: settings.duesAmount,
        bankName: settings.bankName,
        accountNumber: settings.accountNumber,
        accountName: settings.accountName,
        portalNotice: settings.portalNotice,
        broadcastNotice: settings.broadcastNotice || null,
        emergencyNotice: settings.emergencyNotice || null,
        registrationOpen: settings.registrationOpen,
        allowRegistration: settings.allowRegistration,
        allowVoting: settings.allowVoting,
        maintenanceMode: settings.maintenanceMode,
        contactEmail: settings.contactEmail
      }
    });
    return settings;
  }
}

export const contentService = new ContentService();
