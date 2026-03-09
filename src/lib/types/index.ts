// ============================================================
// Core data types for the humanitarian coordination app
// ============================================================

export type Locale = 'en' | 'ar';

export type RequestCategory =
  | 'medicine'
  | 'shelter'
  | 'food'
  | 'baby_milk'
  | 'transport'
  | 'clothing'
  | 'hygiene'
  | 'other';

export type UrgencyLevel = 'critical' | 'high' | 'medium' | 'low';

export type ContactMethod = 'phone' | 'whatsapp' | 'no_contact';

export type RequestStatus = 'open' | 'in_progress' | 'fulfilled' | 'archived' | 'flagged';

export type CreatedByType = 'anonymous' | 'authenticated' | 'admin';

export type ModerationFlag = 'spam' | 'inappropriate' | 'duplicate' | 'suspicious';

// Governorates of Lebanon
export type Governorate =
  | 'beirut'
  | 'mount_lebanon'
  | 'north'
  | 'south'
  | 'bekaa'
  | 'baalbek_hermel'
  | 'akkar'
  | 'nabatieh';

// ---- Firestore Document Types ----

export interface HelpRequest {
  id: string;
  category: RequestCategory;
  description: string;
  governorate: Governorate;
  city: string;
  area: string; // general area, not exact address
  peopleCount: number;
  urgency: UrgencyLevel;
  contactMethod: ContactMethod;
  language: Locale;
  status: RequestStatus;
  createdAt: number; // Unix timestamp ms
  updatedAt: number;
  createdByType: CreatedByType;
  createdByUid?: string;
  moderationFlags: ModerationFlag[];
  claimedBy?: string; // helper uid
  claimedAt?: number;
  referenceCode: string; // short human-readable code
}

// Stored in subcollection: requests/{id}/private/contact
export interface RequestContactInfo {
  phone?: string;
  phoneCountryCode?: string;
  name?: string;
}

export interface Helper {
  id: string;
  name: string;
  organization?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  governorate?: Governorate;
  suppliesCanProvide: RequestCategory[];
  verified: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Claim {
  id: string;
  requestId: string;
  helperId: string;
  helperName: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: number;
  updatedAt: number;
}

export interface AdminUser {
  uid: string;
  email: string;
  role: 'admin' | 'moderator';
  createdAt: number;
}

export interface AuditLog {
  id: string;
  action: string;
  targetType: 'request' | 'helper' | 'claim' | 'admin';
  targetId: string;
  performedBy: string;
  details?: string;
  createdAt: number;
}

export interface AppStats {
  totalRequests: number;
  openRequests: number;
  fulfilledRequests: number;
  totalHelpers: number;
  totalClaims: number;
  lastUpdated: number;
}

// ---- Form Types ----

export interface HelpRequestFormData {
  category: RequestCategory;
  description: string;
  governorate: Governorate;
  city: string;
  area: string;
  peopleCount: number;
  urgency: UrgencyLevel;
  contactMethod: ContactMethod;
  phone?: string;
  phoneCountryCode?: string;
  name?: string;
  consent: boolean;
  language: Locale;
}

export interface HelperFormData {
  name: string;
  organization?: string;
  phone?: string;
  whatsapp?: string;
  email: string;
  password: string;
  governorate?: Governorate;
  suppliesCanProvide: RequestCategory[];
}

export interface ClaimFormData {
  message?: string;
}

// Contact person for an area (public directory)
export interface AreaContact {
  id: string;
  fullName: string;
  phone: string;
  governorate: Governorate;
  area: string; // city or neighborhood
  available: boolean;
  createdAt: number;
  updatedAt: number;
}

// ---- Filter Types ----

export interface RequestFilters {
  category?: RequestCategory;
  governorate?: Governorate;
  urgency?: UrgencyLevel;
  status?: RequestStatus;
}
