import { asc, eq, and } from 'drizzle-orm';
import { db, isDatabaseConfigured } from '../db';
import * as schema from '../../db/schema';
import type {
  ChapterEvent,
  GalleryItem,
  ConstitutionDocument,
  AwardItem,
  VotingCategory,
  VotingSettings,
  ContactInfo,
  NavigationMenuItem,
  PeopleProfile,
  PastQuestion,
  SiteSettings
} from '../../src/types';

export class ContentRepository {
  async getAllContent() {
    if (!isDatabaseConfigured()) {
      throw new Error('DATABASE_UNCONFIGURED');
    }
    const [events, galleryAlbums, galleryImages, constitution, awards, categories, nominees, settings, contact, menu, people, pastQuestions, pastImages, pastManual, siteSettings] = await Promise.all([
      db.select().from(schema.events),
      db.select().from(schema.galleryAlbums),
      db.select().from(schema.galleryImages),
      db.select().from(schema.constitutionDocuments),
      db.select().from(schema.awards),
      db.select().from(schema.votingCategories),
      db.select().from(schema.votingNominees),
      db.select().from(schema.votingSettings),
      db.select().from(schema.contactInfo),
      db.select().from(schema.navigationMenuItems).orderBy(asc(schema.navigationMenuItems.order)),
      db.select().from(schema.peopleProfiles).orderBy(asc(schema.peopleProfiles.order)),
      db.select().from(schema.pastQuestions),
      db.select().from(schema.pastQuestionImages),
      db.select().from(schema.pastQuestionManualQuestions),
      db.select().from(schema.siteSettings)
    ]);
    return {
      events,
      gallery: (galleryAlbums as any[]).map((a: any) => ({
        ...a,
        images: (galleryImages as any[]).filter((g: any) => g.albumId === a.id).map((g: any) => g.imageUrl),
      })),
      constitution: (constitution as any[])[0] ?? null,
      awards,
      voting: {
        categories: (categories as any[]).map((c: any) => ({
          ...c,
          nominees: (nominees as any[]).filter((n: any) => n.categoryId === c.id),
        })),
        settings: (settings as any[])[0] ?? null,
        userVotedCategories: [] as string[]
      },
      contact: (contact as any[])[0] ?? null,
      menu,
      people,
      pastQuestions: (pastQuestions as any[]).map((p: any) => ({
        ...p,
        images: (pastImages as any[]).filter((g: any) => g.pastQuestionId === p.id).map((g: any) => g.imageUrl),
        manualQuestions: (pastManual as any[]).filter((g: any) => g.pastQuestionId === p.id),
      })),
      siteSettings: (siteSettings as any[])[0] ?? null
    } as any;
  }

  async getEvents() { return db.select().from(schema.events); }
  async saveEvent(event: ChapterEvent) {
    const rows = await db.select().from(schema.events).where(eq(schema.events.id, event.id));
    const payload: any = {
        title: event.title,
        date: event.date,
        description: event.description,
        image: event.image,
        upcoming: Boolean(event.upcoming),
        ongoing: Boolean(event.ongoing),
        contain: Boolean(event.contain),
        eventTag: event.eventTag || 'General',
        time: (event as any).time || '',
        venue: (event as any).venue || '',
        registrationInfo: (event as any).registrationInfo || '',
        registrationUrl: (event as any).registrationUrl || ''
    };
    if (rows.length) {
      await (db.update(schema.events) as any).set(payload).where(eq(schema.events.id, event.id));
    } else {
      await (db.insert(schema.events) as any).values({ id: event.id, ...payload });
    }
    return event;
  }

  async deleteEvent(id: string) { await db.delete(schema.events).where(eq(schema.events.id, id)); return true; }

  async getGallery() {
    const albums = await db.select().from(schema.galleryAlbums) as any[];
    const images = await db.select().from(schema.galleryImages) as any[];
    return albums.map((a: any) => ({
      ...a,
      images: images.filter((g: any) => g.albumId === a.id).map((g: any) => g.imageUrl),
    })) as any;
  }
  async saveGalleryItem(item: GalleryItem) {
    const rows = await db.select().from(schema.galleryAlbums).where(eq(schema.galleryAlbums.id, item.id));
    const albumPayload: any = {
        title: item.title,
        eventTag: item.eventTag,
        date: item.date,
        dateSortValue: item.dateSortValue || item.date
    };
    if (rows.length) {
      await (db.update(schema.galleryAlbums) as any).set(albumPayload).where(eq(schema.galleryAlbums.id, item.id));
      await db.delete(schema.galleryImages).where(eq(schema.galleryImages.albumId, item.id));
      for (let i = 0; i < item.images.length; i++) {
        await (db.insert(schema.galleryImages) as any).values({
          id: `${item.id}-img-${i}`,
          albumId: item.id,
          imageUrl: item.images[i],
          sortOrder: i
        });
      }
    } else {
      await (db.insert(schema.galleryAlbums) as any).values({
        id: item.id,
        ...albumPayload
      } as any);
      for (let i = 0; i < item.images.length; i++) {
        await (db.insert(schema.galleryImages) as any).values({
          id: `${item.id}-img-${i}`,
          albumId: item.id,
          imageUrl: item.images[i]
        } as any);
      }
    }
    return item;
  }

  async deleteGalleryItem(id: string) {
    await db.delete(schema.galleryImages).where(eq(schema.galleryImages.albumId, id));
    await db.delete(schema.galleryAlbums).where(eq(schema.galleryAlbums.id, id));
    return true;
  }

  async getConstitution() {
    const rows = await db.select().from(schema.constitutionDocuments) as any[];
    const row: any = rows[0] ?? null;
    if (!row) return null as any;
    if (Array.isArray(row.articles)) return row as any;
    const articles = await db.select().from(schema.constitutionArticles) as any[];
    const sections = await db.select().from(schema.constitutionSections) as any[];
    return {
      ...row,
      articles: articles.map((a: any) => ({
        number: a.number,
        title: a.title,
        sections: sections.filter((s: any) => s.articleId === a.id).map((s: any) => ({ title: s.title, content: s.content })),
      })),
    } as any;
  }
  async updateConstitution(doc: ConstitutionDocument & { id?: string }) {
    const rows: any[] = await db.select().from(schema.constitutionDocuments) as any[];
    const id = (doc as any).id || rows[0]?.id || 'constitution-main';
    const payload: any = {
      pdfUrl: (doc as any).pdfUrl || '',
      fileName: (doc as any).fileName || '',
      fileSize: (doc as any).fileSize || '',
      updatedAt: (doc as any).updatedAt || new Date().toISOString().split('T')[0],
      published: (doc as any).published !== undefined ? Boolean((doc as any).published) : true,
      articles: Array.isArray((doc as any).articles) ? (doc as any).articles : [],
    };
    if (rows.length) {
      await (db.update(schema.constitutionDocuments) as any).set(payload).where(eq(schema.constitutionDocuments.id, rows[0].id));
    } else {
      await (db.insert(schema.constitutionDocuments) as any).values({ id, ...payload });
    }
    return doc;
  }

  async getAwards() { return db.select().from(schema.awards); }
  async saveAward(award: AwardItem) {
    const rows = await db.select().from(schema.awards).where(eq(schema.awards.id, award.id));
    const awardPayload: any = {
        title: award.title,
        recipient: award.recipient,
        year: (award as any).year || '2025/2026',
        category: award.category,
        description: award.description,
        image: award.image || '',
        certificateUrl: award.certificateUrl || ''
    };
    if (rows.length) {
      const { year, ...rest } = awardPayload;
      await (db.update(schema.awards) as any).set({ ...rest, year }).where(eq(schema.awards.id, award.id));
    } else {
      await (db.insert(schema.awards) as any).values({
        id: award.id,
        ...awardPayload
      });
    }
    return award;
  }
  async deleteAward(id: string) { await db.delete(schema.awards).where(eq(schema.awards.id, id)); return true; }

  async getVotingData() {
    const [categories, settingsRows] = await Promise.all([
      db.select().from(schema.votingCategories),
      db.select().from(schema.votingSettings)
    ]);
    const nominees = await db.select().from(schema.votingNominees) as any[];
    const categoriesHydrated = (categories as any[]).map((c: any) => ({
      ...c,
      nominees: nominees.filter((n: any) => n.categoryId === c.id),
    }));
    return { categories: categoriesHydrated, settings: (settingsRows as any[])[0] ?? null } as any;
  }

  async getUserVotedCategories(userId: string) {
    const rows = await db.select().from(schema.votes).where(eq(schema.votes.userId, userId));
    return Array.from(new Set(rows.map(r => r.categoryId)));
  }

  async castVote(categoryId: string, nomineeId: string, userId: string) {
    const voteRows = await db.select().from(schema.votes).where(and(eq(schema.votes.categoryId, categoryId), eq(schema.votes.userId, userId)));
    if (voteRows.length) {
      return { success: false, message: 'Security Violation: You have already cast your vote in this category. Voting rules strictly permit one vote per student member.' };
    }
    const nominee = await db.select().from(schema.votingNominees).where(eq(schema.votingNominees.id, nomineeId));
    if (!nominee.length) {
      return { success: false, message: 'Nominee not found in this category.' };
    }
    await (db.insert(schema.votes) as any).values({
      id: `${categoryId}-${userId}-${Date.now()}`,
      categoryId,
      nomineeId,
      userId,
      voteCount: 1,
    });
    await (db.update(schema.votingNominees) as any).set({ votes: (((nominee[0] as any).votes ?? 0) + 1) }).where(eq(schema.votingNominees.id, nomineeId));
    return { success: true, message: `Your vote for "${(nominee[0] as any).name}" in the category has been securely validated and counted.` };
  }

  async saveVotingCategory(category: VotingCategory) {
    const rows = await db.select().from(schema.votingCategories).where(eq(schema.votingCategories.id, category.id));
    const catPayload: any = {
        slug: category.slug,
        title: category.title,
        groupKey: category.groupKey,
        groupName: category.groupName,
        description: (category as any).description || '',
    };
    if (rows.length) {
      await (db.update(schema.votingCategories) as any).set(catPayload).where(eq(schema.votingCategories.id, category.id));
      await db.delete(schema.votingNominees).where(eq(schema.votingNominees.categoryId, category.id));
      for (const nominee of category.nominees) {
        await (db.insert(schema.votingNominees) as any).values({
          id: nominee.id,
          categoryId: category.id,
          name: nominee.name,
          level: nominee.level,
          discipline: nominee.discipline,
          image: nominee.image || '',
          votes: nominee.votes || 0,
          description: nominee.description || ''
        });
      }
    } else {
      await (db.insert(schema.votingCategories) as any).values({
        id: category.id,
        ...catPayload
      });
      for (const nominee of category.nominees) {
        await (db.insert(schema.votingNominees) as any).values({
          id: nominee.id,
          categoryId: category.id,
          name: nominee.name,
          level: nominee.level,
          discipline: nominee.discipline,
          image: nominee.image || '',
          votes: nominee.votes || 0,
          description: nominee.description || ''
        });
      }
    }
    return category;
  }

  async deleteVotingCategory(id: string) { await db.delete(schema.votingNominees).where(eq(schema.votingNominees.categoryId, id)); await db.delete(schema.votingCategories).where(eq(schema.votingCategories.id, id)); return true; }

  async updateVotingSettings(settings: VotingSettings) {
    const rows = await db.select().from(schema.votingSettings);
    const votingPayload: any = {
        isOpen: Boolean(settings.isOpen),
        title: (settings as any).title,
        electionTitle: (settings as any).electionTitle || '',
        session: (settings as any).session || '',
        instructions: (settings as any).instructions || '',
        startDate: (settings as any).startDate || '',
        endDate: (settings as any).endDate || '',
        allowMultipleCategoriesVote: Boolean((settings as any).allowMultipleCategoriesVote),
        oneVotePerUser: Boolean((settings as any).oneVotePerUser),
        requireBiometrics: Boolean((settings as any).requireBiometrics),
        strictMatricValidation: Boolean((settings as any).strictMatricValidation)
    };
    if (rows.length) {
      await (db.update(schema.votingSettings) as any).set(votingPayload).where(eq(schema.votingSettings.id, rows[0].id));
    } else {
      await (db.insert(schema.votingSettings) as any).values(votingPayload);
    }
    return settings;
  }

  async resetVotes(categoryId?: string) {
    if (categoryId) {
      await (db.update(schema.votingNominees) as any).set({ votes: 0 }).where(eq(schema.votingNominees.categoryId, categoryId));
      await db.delete(schema.votes).where(eq(schema.votes.categoryId, categoryId));
    } else {
      await (db.update(schema.votingNominees) as any).set({ votes: 0 });
      await db.delete(schema.votes);
    }
    return true;
  }

  async getContact() { const rows = await db.select().from(schema.contactInfo); return rows[0] ?? null; }
  async updateContact(contact: ContactInfo) {
    await db.delete(schema.contactInfo);
    await (db.insert(schema.contactInfo) as any).values({
      phone: contact.phone,
      alternativePhone: contact.alternativePhone || '',
      email: contact.email,
      secretariatEmail: contact.secretariatEmail || '',
      officeAddress: contact.officeAddress || '',
      address: contact.address || '',
      faculty: contact.faculty || '',
      campus: contact.campus || '',
      twitter: contact.twitter || '',
      instagram: contact.instagram || '',
      linkedin: contact.linkedin || '',
      telegram: contact.telegram || '',
      whatsapp: contact.whatsapp || '',
      whatsappGroup: contact.whatsappGroup || '',
      operatingHours: contact.operatingHours || '',
      officeHours: contact.officeHours || ''
    });
    return contact;
  }

  async getMenu() { return db.select().from(schema.navigationMenuItems).orderBy(asc(schema.navigationMenuItems.order)); }
  async updateMenu(items: NavigationMenuItem[]) {
    await db.delete(schema.navigationMenuItems);
    for (const item of items) {
      await (db.insert(schema.navigationMenuItems) as any).values({
        id: item.id,
        label: item.label,
        targetView: item.targetView,
        visible: Boolean(item.visible),
        order: item.order,
        isExternal: Boolean(item.isExternal),
        externalUrl: item.externalUrl || '',
        badge: item.badge || '',
        parentId: null
      });
    }
    return items;
  }

  async getPeople() { return db.select().from(schema.peopleProfiles).orderBy(asc(schema.peopleProfiles.order)); }
  async savePerson(person: PeopleProfile) {
    const rows = await db.select().from(schema.peopleProfiles).where(eq(schema.peopleProfiles.id, person.id));
    const personPayload: any = {
        name: person.name,
        post: person.post,
        level: person.level,
        description: person.description,
        bio: (person as any).bio || '',
        image: person.image,
        category: person.category,
        phone: person.phone || '',
        email: person.email || '',
        department: person.department || '',
        order: person.order || 50
    };
    if (rows.length) {
      await (db.update(schema.peopleProfiles) as any).set(personPayload).where(eq(schema.peopleProfiles.id, person.id));
    } else {
      await (db.insert(schema.peopleProfiles) as any).values({
        id: person.id,
        ...personPayload
      });
    }
    return person;
  }
  async deletePerson(id: string) { await db.delete(schema.peopleProfiles).where(eq(schema.peopleProfiles.id, id)); return true; }

  async getPastQuestions() {
    const rows = await db.select().from(schema.pastQuestions) as any[];
    const images = await db.select().from(schema.pastQuestionImages) as any[];
    const manual = await db.select().from(schema.pastQuestionManualQuestions) as any[];
    return rows.map((p: any) => ({
      ...p,
      images: images.filter((g: any) => g.pastQuestionId === p.id).map((g: any) => g.imageUrl),
      manualQuestions: manual.filter((g: any) => g.pastQuestionId === p.id),
    })) as any;
  }
  async savePastQuestion(item: PastQuestion) {
    const rows = await db.select().from(schema.pastQuestions).where(eq(schema.pastQuestions.id, item.id));
    const pqPayload: any = {
        courseCode: item.courseCode,
        courseTitle: item.courseTitle,
        level: item.level,
        semester: (item as any).semester,
        session: item.session,
        examType: (item as any).examType,
        downloads: item.downloads || 0,
        fileSize: item.fileSize,
        formatType: (item as any).formatType || 'pdf',
        department: (item as any).department || '',
        instructions: (item as any).instructions || '',
        duration: (item as any).duration || '',
        pdfUrl: item.pdfUrl || '',
        pdfFileName: item.pdfFileName || '',
        uploadedAt: (item as any).uploadedAt ? new Date((item as any).uploadedAt) : new Date()
    };
    if (rows.length) {
      await (db.update(schema.pastQuestions) as any).set(pqPayload).where(eq(schema.pastQuestions.id, item.id));
    } else {
      await (db.insert(schema.pastQuestions) as any).values({
        id: item.id,
        ...pqPayload
      });
    }
    await db.delete(schema.pastQuestionImages).where(eq(schema.pastQuestionImages.pastQuestionId, item.id));
    for (let i = 0; i < (((item as any).images?.length) || 0); i += 1) {
      await (db.insert(schema.pastQuestionImages) as any).values({
        id: `${item.id}-img-${i}-${Date.now()}`,
        pastQuestionId: item.id,
        imageUrl: (item as any).images[i],
        sortOrder: i,
      });
    }
    await db.delete(schema.pastQuestionManualQuestions).where(eq(schema.pastQuestionManualQuestions.pastQuestionId, item.id));
    for (const q of (((item as any).manualQuestions) || [])) {
      await (db.insert(schema.pastQuestionManualQuestions) as any).values({
        id: (q as any).id || `${item.id}-q-${Date.now()}`,
        pastQuestionId: item.id,
        number: String((q as any).number ?? ''),
        section: (q as any).section || '',
        text: (q as any).text || '',
        options: (q as any).options ?? null,
        answer: (q as any).answer || '',
        marks: (q as any).marks || '',
      });
    }
    return item;
  }
  async deletePastQuestion(id: string) {
    await db.delete(schema.pastQuestionImages).where(eq(schema.pastQuestionImages.pastQuestionId, id));
    await db.delete(schema.pastQuestionManualQuestions).where(eq(schema.pastQuestionManualQuestions.pastQuestionId, id));
    await db.delete(schema.pastQuestions).where(eq(schema.pastQuestions.id, id));
    return true;
  }

  async getSiteSettings() { const rows = await db.select().from(schema.siteSettings); return rows[0] ?? null; }
  async updateSiteSettings(settings: SiteSettings) {
    const rows = await db.select().from(schema.siteSettings);
    const settingsPayload: any = {
        associationName: settings.associationName,
        chapterName: settings.chapterName || '',
        shortName: settings.shortName || '',
        institution: settings.institution || '',
        faculty: settings.faculty || '',
        department: settings.department || '',
        motto: settings.motto || '',
        academicSession: settings.academicSession || '',
        currentSession: (settings as any).currentSession || '',
        semester: settings.semester || '',
        duesAmount: String(settings.duesAmount || 0),
        bankName: settings.bankName || '',
        accountNumber: settings.accountNumber || '',
        accountName: settings.accountName || '',
        portalNotice: settings.portalNotice || '',
        broadcastNotice: (settings as any).broadcastNotice || '',
        emergencyNotice: (settings as any).emergencyNotice || '',
        registrationOpen: settings.registrationOpen ?? true,
        allowRegistration: settings.allowRegistration ?? true,
        allowVoting: settings.allowVoting ?? true,
        maintenanceMode: settings.maintenanceMode ?? false,
        contactEmail: settings.contactEmail || ''
    };
    if (rows.length) {
      await (db.update(schema.siteSettings) as any).set(settingsPayload).where(eq(schema.siteSettings.id, rows[0].id));
    } else {
      await (db.insert(schema.siteSettings) as any).values(settingsPayload);
    }
    return settings;
  }
}

export const contentRepository = new ContentRepository();
