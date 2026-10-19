import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import { getDb } from '../server/db/index.ts';
import * as schema from '../server/db/schema.ts';

dotenv.config();

async function migrate() {
  const db = getDb();
  const dataPath = path.join(process.cwd(), 'data', 'site_content.json');
  if (!fs.existsSync(dataPath)) {
    console.log('No site_content.json found. Skipping JSON migration.');
    return;
  }
  
  const rawData = fs.readFileSync(dataPath, 'utf8');
  const data = JSON.parse(rawData);

  console.log('Migrating events...');
  if (data.events) {
    for (const ev of data.events) {
      await db.insert(schema.events).values({
        id: ev.id,
        title: ev.title,
        date: ev.date,
        description: ev.description,
        image: ev.image,
        upcoming: ev.upcoming,
        ongoing: ev.ongoing,
        contain: ev.contain,
        eventTag: ev.eventTag,
        time: ev.time,
        venue: ev.venue,
        registrationInfo: ev.registrationInfo,
        registrationUrl: ev.registrationUrl
      }).onConflictDoNothing();
    }
  }

  console.log('Migrating gallery...');
  if (data.gallery) {
    for (const g of data.gallery) {
      await db.insert(schema.galleryAlbums).values({
        id: g.id,
        title: g.title,
        eventTag: g.eventTag,
        date: g.date,
        dateSortValue: g.dateSortValue
      }).onConflictDoNothing();
      
      if (g.images) {
        let i = 0;
        for (const imgUrl of g.images) {
          await db.insert(schema.galleryImages).values({
            albumId: g.id,
            url: imgUrl,
            order: i++
          }).onConflictDoNothing();
        }
      }
    }
  }

  console.log('Migrating constitution...');
  if (data.constitution) {
    const c = data.constitution;
    await db.insert(schema.constitutionDocument).values({
      id: 1,
      pdfUrl: c.pdfUrl || '',
      fileName: c.fileName || '',
      fileSize: c.fileSize || '',
      updatedAt: c.updatedAt || '',
      published: !!c.published
    }).onConflictDoUpdate({
      target: schema.constitutionDocument.id,
      set: {
        pdfUrl: c.pdfUrl || '',
        fileName: c.fileName || '',
        fileSize: c.fileSize || '',
        updatedAt: c.updatedAt || '',
        published: !!c.published
      }
    });

    if (c.articles) {
      let aOrder = 0;
      for (const a of c.articles) {
        const [article] = await db.insert(schema.constitutionArticles).values({
          documentId: 1,
          number: a.number,
          title: a.title,
          order: aOrder++
        }).returning();

        if (a.sections) {
          let sOrder = 0;
          for (const s of a.sections) {
            await db.insert(schema.constitutionSections).values({
              articleId: article.id,
              title: s.title,
              content: s.content,
              order: sOrder++
            }).onConflictDoNothing();
          }
        }
      }
    }
  }

  console.log('Migrating awards...');
  if (data.awards) {
    for (const a of data.awards) {
      await db.insert(schema.awards).values({
        id: a.id,
        title: a.title,
        recipient: a.recipient,
        year: a.year,
        category: a.category,
        description: a.description,
        image: a.image,
        certificateUrl: a.certificateUrl
      }).onConflictDoNothing();
    }
  }

  console.log('Migrating voting...');
  if (data.voting) {
    if (data.voting.settings) {
      const s = data.voting.settings;
      await db.insert(schema.votingSettings).values({
        id: 1,
        isOpen: !!s.isOpen,
        title: s.title,
        electionTitle: s.electionTitle,
        session: s.session,
        instructions: s.instructions,
        startDate: s.startDate,
        endDate: s.endDate,
        allowMultipleCategoriesVote: s.allowMultipleCategoriesVote,
        oneVotePerUser: s.oneVotePerUser,
        requireBiometrics: s.requireBiometrics,
        strictMatricValidation: s.strictMatricValidation
      }).onConflictDoUpdate({
        target: schema.votingSettings.id,
        set: {
          isOpen: !!s.isOpen,
          title: s.title,
          electionTitle: s.electionTitle,
          session: s.session,
          instructions: s.instructions,
          startDate: s.startDate,
          endDate: s.endDate,
          allowMultipleCategoriesVote: s.allowMultipleCategoriesVote,
          oneVotePerUser: s.oneVotePerUser,
          requireBiometrics: s.requireBiometrics,
          strictMatricValidation: s.strictMatricValidation
        }
      });
    }

    if (data.voting.categories) {
      let catOrder = 0;
      for (const cat of data.voting.categories) {
        await db.insert(schema.votingCategories).values({
          id: cat.id,
          slug: cat.slug,
          title: cat.title,
          groupKey: cat.groupKey,
          groupName: cat.groupName,
          description: cat.description,
          order: catOrder++
        }).onConflictDoNothing();

        if (cat.nominees) {
          for (const nom of cat.nominees) {
            await db.insert(schema.votingNominees).values({
              id: nom.id,
              categoryId: cat.id,
              name: nom.name,
              level: nom.level,
              discipline: nom.discipline,
              image: nom.image,
              description: nom.description
            }).onConflictDoNothing();
          }
        }
      }
    }
    
    // We can't migrate votes easily without users being registered first in PostgreSQL
    // We will skip votes migration since they rely on matric numbers and user mapping
    // But we can check if data.voting.voters has any to warn
    if (data.voting.voters && Object.keys(data.voting.voters).length > 0) {
      console.warn("WARNING: Existing votes cannot be reliably migrated without user accounts first. Skipping votes migration.");
    }
  }

  console.log('Migrating contact...');
  if (data.contact) {
    const c = data.contact;
    await db.insert(schema.contactInfo).values({
      id: 1,
      phone: c.phone || '',
      email: c.email || '',
      alternativePhone: c.alternativePhone,
      secretariatEmail: c.secretariatEmail,
      officeAddress: c.officeAddress,
      address: c.address,
      faculty: c.faculty,
      campus: c.campus,
      twitter: c.twitter,
      instagram: c.instagram,
      linkedin: c.linkedin,
      telegram: c.telegram,
      whatsapp: c.whatsapp,
      whatsappGroup: c.whatsappGroup,
      operatingHours: c.operatingHours,
      officeHours: c.officeHours
    }).onConflictDoUpdate({
      target: schema.contactInfo.id,
      set: {
        phone: c.phone || '',
        email: c.email || '',
        alternativePhone: c.alternativePhone,
        secretariatEmail: c.secretariatEmail,
        officeAddress: c.officeAddress,
        address: c.address,
        faculty: c.faculty,
        campus: c.campus,
        twitter: c.twitter,
        instagram: c.instagram,
        linkedin: c.linkedin,
        telegram: c.telegram,
        whatsapp: c.whatsapp,
        whatsappGroup: c.whatsappGroup,
        operatingHours: c.operatingHours,
        officeHours: c.officeHours
      }
    });
  }

  console.log('Migrating menu...');
  if (data.menu) {
    let menuOrder = 0;
    for (const m of data.menu) {
      await db.insert(schema.navigationMenu).values({
        id: m.id,
        label: m.label,
        targetView: m.targetView,
        visible: !!m.visible,
        order: menuOrder++,
        isExternal: m.isExternal,
        externalUrl: m.externalUrl,
        badge: m.badge
      }).onConflictDoNothing();
    }
  }

  console.log('Migrating people...');
  if (data.people) {
    let personOrder = 0;
    for (const p of data.people) {
      await db.insert(schema.peopleProfiles).values({
        id: p.id,
        name: p.name,
        post: p.post,
        level: p.level,
        description: p.description,
        bio: p.bio,
        image: p.image,
        category: p.category || 'executive',
        phone: p.phone,
        email: p.email,
        department: p.department,
        order: personOrder++
      }).onConflictDoNothing();
    }
  }

  console.log('Migrating past questions...');
  if (data.pastQuestions) {
    for (const pq of data.pastQuestions) {
      await db.insert(schema.pastQuestions).values({
        id: pq.id,
        courseCode: pq.courseCode,
        courseTitle: pq.courseTitle,
        level: pq.level,
        semester: pq.semester,
        session: pq.session,
        examType: pq.examType,
        downloads: pq.downloads || 0,
        fileSize: pq.fileSize,
        formatType: pq.formatType,
        department: pq.department,
        instructions: pq.instructions,
        duration: pq.duration,
        pdfUrl: pq.pdfUrl,
        pdfFileName: pq.pdfFileName,
        manualContent: pq.manualContent,
        uploadedAt: pq.uploadedAt
      }).onConflictDoNothing();
      
      if (pq.images) {
        let imgOrder = 0;
        for (const img of pq.images) {
          await db.insert(schema.pastQuestionImages).values({
            pastQuestionId: pq.id,
            url: img,
            order: imgOrder++
          }).onConflictDoNothing();
        }
      }
      
      if (pq.manualQuestions) {
        let mqOrder = 0;
        for (const mq of pq.manualQuestions) {
          await db.insert(schema.pastQuestionManuals).values({
            id: mq.id,
            pastQuestionId: pq.id,
            number: String(mq.number),
            section: mq.section,
            text: mq.text,
            options: mq.options || [],
            answer: mq.answer,
            marks: mq.marks,
            order: mqOrder++
          }).onConflictDoNothing();
        }
      }
    }
  }

  console.log('Migrating site settings...');
  if (data.siteSettings) {
    const s = data.siteSettings;
    await db.insert(schema.siteSettings).values({
      id: 1,
      associationName: s.associationName || 'National Association of Physics Students',
      chapterName: s.chapterName,
      shortName: s.shortName,
      institution: s.institution,
      faculty: s.faculty,
      department: s.department,
      motto: s.motto,
      academicSession: s.academicSession,
      currentSession: s.currentSession,
      semester: s.semester,
      duesAmount: s.duesAmount || 0,
      bankName: s.bankName,
      accountNumber: s.accountNumber,
      accountName: s.accountName,
      portalNotice: s.portalNotice,
      broadcastNotice: s.broadcastNotice,
      emergencyNotice: s.emergencyNotice,
      registrationOpen: s.registrationOpen,
      allowRegistration: s.allowRegistration,
      allowVoting: s.allowVoting,
      maintenanceMode: s.maintenanceMode,
      contactEmail: s.contactEmail
    }).onConflictDoUpdate({
      target: schema.siteSettings.id,
      set: {
        associationName: s.associationName || 'National Association of Physics Students',
        chapterName: s.chapterName,
        shortName: s.shortName,
        institution: s.institution,
        faculty: s.faculty,
        department: s.department,
        motto: s.motto,
        academicSession: s.academicSession,
        currentSession: s.currentSession,
        semester: s.semester,
        duesAmount: s.duesAmount || 0,
        bankName: s.bankName,
        accountNumber: s.accountNumber,
        accountName: s.accountName,
        portalNotice: s.portalNotice,
        broadcastNotice: s.broadcastNotice,
        emergencyNotice: s.emergencyNotice,
        registrationOpen: s.registrationOpen,
        allowRegistration: s.allowRegistration,
        allowVoting: s.allowVoting,
        maintenanceMode: s.maintenanceMode,
        contactEmail: s.contactEmail
      }
    });
  }

  console.log('Migration complete!');
  process.exit(0);
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
