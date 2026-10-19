import { 
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
  SiteSettings,
  Executive
} from '../types';
import { getStoredToken } from './authClient';

const API_BASE = '/api/content';

function getAuthHeaders(): Record<string, string> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export interface FullContentPayload {
  events: ChapterEvent[];
  gallery: GalleryItem[];
  constitution: ConstitutionDocument;
  awards: AwardItem[];
  voting: {
    categories: VotingCategory[];
    settings: VotingSettings;
    userVotedCategories: string[];
  };
  contact: ContactInfo;
  menu: NavigationMenuItem[];
  people: PeopleProfile[];
  pastQuestions: PastQuestion[];
  siteSettings: SiteSettings;
  executives?: Executive[];
}

export async function fetchAllContent(): Promise<FullContentPayload | null> {
  try {
    const res = await fetch(`${API_BASE}/all`, {
      headers: getAuthHeaders(), credentials: 'include'
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch dynamic content from server, fallback to local state:', err);
    return null;
  }
}

// Events
export async function createEventApi(event: Partial<ChapterEvent>): Promise<ChapterEvent> {
  const res = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers: getAuthHeaders(), credentials: 'include',
    body: JSON.stringify(event)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create event');
  return data.event;
}

export async function updateEventApi(event: ChapterEvent): Promise<ChapterEvent> {
  const res = await fetch(`${API_BASE}/events/${event.id}`, {
    method: 'PUT',
    headers: getAuthHeaders(), credentials: 'include',
    body: JSON.stringify(event)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update event');
  return data.event;
}

export async function deleteEventApi(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/events/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(), credentials: 'include'
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to delete event');
  }
  return true;
}

// Gallery
export async function createGalleryAlbumApi(album: Partial<GalleryItem>): Promise<GalleryItem> {
  const res = await fetch(`${API_BASE}/gallery`, {
    method: 'POST',
    headers: getAuthHeaders(), credentials: 'include',
    body: JSON.stringify(album)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to save gallery album');
  return data.album;
}

export async function updateGalleryAlbumApi(album: GalleryItem): Promise<GalleryItem> {
  const res = await fetch(`${API_BASE}/gallery/${album.id}`, {
    method: 'PUT',
    headers: getAuthHeaders(), credentials: 'include',
    body: JSON.stringify(album)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update gallery album');
  return data.album;
}

export async function deleteGalleryAlbumApi(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/gallery/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(), credentials: 'include'
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to delete gallery item');
  }
  return true;
}

// Constitution
export async function updateConstitutionApi(doc: Partial<ConstitutionDocument>): Promise<ConstitutionDocument> {
  const res = await fetch(`${API_BASE}/constitution`, {
    method: 'PUT',
    headers: getAuthHeaders(), credentials: 'include',
    body: JSON.stringify(doc)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update constitution');
  return data.constitution;
}

// Awards
export async function createAwardApi(award: Partial<AwardItem>): Promise<AwardItem> {
  const res = await fetch(`${API_BASE}/awards`, {
    method: 'POST',
    headers: getAuthHeaders(), credentials: 'include',
    body: JSON.stringify(award)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create award');
  return data.award;
}

export async function updateAwardApi(award: AwardItem): Promise<AwardItem> {
  const res = await fetch(`${API_BASE}/awards/${award.id}`, {
    method: 'PUT',
    headers: getAuthHeaders(), credentials: 'include',
    body: JSON.stringify(award)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update award');
  return data.award;
}

export async function deleteAwardApi(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/awards/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(), credentials: 'include'
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to delete award');
  }
  return true;
}

// Voting
export async function castVoteApi(
  categoryId: string, 
  nomineeId: string, 
  voteCount?: number
): Promise<{ success: boolean; message: string; userVotedCategories: string[]; error?: string }> {
  try {
    const res = await fetch(`/api/voting/vote`, {
      method: 'POST',
      headers: getAuthHeaders(), credentials: 'include',
      body: JSON.stringify({ categoryId, nomineeId, count: voteCount || 1 })
    });
    const data = await res.json();
    if (!res.ok) {
      return { 
        success: false, 
        message: data.error || 'Failed to cast vote', 
        userVotedCategories: [], 
        error: data.error || 'Failed to cast vote' 
      };
    }
    return data;
  } catch (err: any) {
    return { 
      success: false, 
      message: err?.message || 'Network error casting vote', 
      userVotedCategories: [], 
      error: err?.message || 'Network error casting vote' 
    };
  }
}

export const apiCastVote = castVoteApi;

export async function saveVotingCategoryApi(category: Partial<VotingCategory>): Promise<VotingCategory> {
  const res = await fetch(`/api/voting/category`, {
    method: 'POST',
    headers: getAuthHeaders(), credentials: 'include',
    body: JSON.stringify(category)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to save voting category');
  return data.category;
}

export async function deleteVotingCategoryApi(id: string): Promise<boolean> {
  const res = await fetch(`/api/voting/category/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(), credentials: 'include'
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to delete voting category');
  }
  return true;
}

export async function updateVotingSettingsApi(settings: VotingSettings): Promise<VotingSettings> {
  const res = await fetch(`/api/voting/settings`, {
    method: 'PUT',
    headers: getAuthHeaders(), credentials: 'include',
    body: JSON.stringify(settings)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update voting settings');
  return data.settings;
}

export async function resetVotesApi(categoryId?: string): Promise<boolean> {
  const res = await fetch(`/api/voting/reset`, {
    method: 'POST',
    headers: getAuthHeaders(), credentials: 'include',
    body: JSON.stringify({ categoryId })
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to reset votes');
  }
  return true;
}

// Contact Info
export async function updateContactApi(contact: ContactInfo): Promise<ContactInfo> {
  const res = await fetch(`${API_BASE}/contact`, {
    method: 'PUT',
    headers: getAuthHeaders(), credentials: 'include',
    body: JSON.stringify(contact)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update contact info');
  return data.contact;
}

// Navigation Menu
export async function updateMenuApi(items: NavigationMenuItem[]): Promise<NavigationMenuItem[]> {
  const res = await fetch(`${API_BASE}/menu`, {
    method: 'PUT',
    headers: getAuthHeaders(), credentials: 'include',
    body: JSON.stringify({ items })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update navigation menu');
  return data.menu;
}

// People / Profiles
export async function createPersonApi(person: Partial<PeopleProfile>): Promise<PeopleProfile> {
  const res = await fetch(`${API_BASE}/people`, {
    method: 'POST',
    headers: getAuthHeaders(), credentials: 'include',
    body: JSON.stringify(person)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create person profile');
  return data.person;
}

export async function updatePersonApi(person: PeopleProfile): Promise<PeopleProfile> {
  const res = await fetch(`${API_BASE}/people/${person.id}`, {
    method: 'PUT',
    headers: getAuthHeaders(), credentials: 'include',
    body: JSON.stringify(person)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update person profile');
  return data.person;
}

export async function deletePersonApi(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/people/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(), credentials: 'include'
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to delete person profile');
  }
  return true;
}

// Past Questions
export async function createPastQuestionApi(pq: Partial<PastQuestion>): Promise<PastQuestion> {
  const res = await fetch(`${API_BASE}/past-questions`, {
    method: 'POST',
    headers: getAuthHeaders(), credentials: 'include',
    body: JSON.stringify(pq)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to save past question');
  return data.item;
}

export async function updatePastQuestionApi(pq: PastQuestion): Promise<PastQuestion> {
  const res = await fetch(`${API_BASE}/past-questions/${pq.id}`, {
    method: 'PUT',
    headers: getAuthHeaders(), credentials: 'include',
    body: JSON.stringify(pq)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update past question');
  return data.item;
}

export async function deletePastQuestionApi(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/past-questions/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(), credentials: 'include'
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to delete past question');
  }
  return true;
}

// Site Settings
export async function updateSiteSettingsApi(settings: SiteSettings): Promise<SiteSettings> {
  const res = await fetch(`${API_BASE}/site-settings`, {
    method: 'PUT',
    headers: getAuthHeaders(), credentials: 'include',
    body: JSON.stringify(settings)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update site settings');
  return data.settings;
}
