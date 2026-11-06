// Shared types for the research group application

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'member';
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface CareerItem {
  title: string;
  organization: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
}

export interface EducationItem {
  degree: string;
  institution: string;
  department?: string;
  graduationYear?: string;
  thesis?: string;
}

export interface TeamMember {
  id: string;
  username: string;
  name: string;
  email: string;
  securityCode?: string;
  phone?: string;
  position: 'team_leader' | 'faculty' | 'researcher' | 'student' | 'Administrative' | 'alumni';
  title: string;
  researchArea: string;
  bio: string;
  photoUrl: string;
  googleScholarLink: string;
  socialLinks?: SocialLink[];
  expertise: string[];
  joinedDate: string;
  // Alumni / Professional fields
  currentTitle?: string;
  currentOrganization?: string;
  currentDepartment?: string;
  location?: string;
  currentPositionStartDate?: string;
  currentPositionDescription?: string;
  formerRole?: string;
  labAffiliation?: string;
  labContributions?: string;
  orcid?: string;
  researchGate?: string;
  personalWebsite?: string;
  isEmailPublic?: boolean;
  isContactPublic?: boolean;
  careerHistory?: CareerItem[];
  education?: EducationItem[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  researchLink: string;
  status: 'ongoing' | 'completed';
  startDate: string;
  endDate?: string;
}

export interface Publication {
  id: string;
  title: string;
  authors: string[];
  year: number;
  journal: string;
  pdfLink?: string;
  memberId?: string;
  citedBy?: number;
}

export interface Notice {
  id: string;
  title: string;
  publishedBy: string;
  fileUrl?: string;
  date: string;
  content?: string;
  priority?: 'normal' | 'important';
}

export interface News {
  id: string;
  title: string;
  summary?: string;
  content: string;
  imageUrl?: string;
  date: string;
  author?: string;
}

export interface ResearchFocus {
  id: string;
  title: string;
  shortDescription?: string;
  details?: string;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/* ------------------------------------------------------------------ */
/* Instrument Booking System                                           */
/* Each interface below maps 1:1 to a database table (see the table    */
/* comments). Dates are ISO-8601 strings; ids are UUID strings.        */
/* ------------------------------------------------------------------ */

export type InstrumentStatus = 'available' | 'booked' | 'in_use' | 'maintenance';

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

/** Table: instrument_categories */
export interface InstrumentCategory {
  id: string;
  name: string;
}

/** Table: instrument_specifications (many rows per instrument, ordered by sortOrder) */
export interface InstrumentSpecification {
  id: string;
  instrumentId: string;
  label: string;
  value: string;
  sortOrder: number;
}

/** Table: instruments */
export interface Instrument {
  id: string;
  slug: string;                       // unique, used in /instruments/:slug
  name: string;
  shortDescription: string;
  description: string;                // may contain plain paragraphs separated by \n\n
  categoryId: string;                 // FK -> instrument_categories.id
  category: string;                   // denormalised category name for convenience
  status: InstrumentStatus;
  imageUrl: string;
  manufacturer: string;
  model: string;
  serialNumber?: string;
  location: string;
  responsibleAdminId: string;         // FK -> users.id (admin who approves bookings)
  responsibleAdminName: string;
  responsibleAdminEmail: string;
  features: string[];                 // stored as JSON array / child table
  usageRequirements: string[];        // stored as JSON array / child table
  // Booking rules (used by the booking form and calendar grid)
  openingHour: number;                // 0-23, first bookable hour of the day
  closingHour: number;                // 1-24, end of the last bookable hour
  slotIntervalMinutes: number;        // 30 | 60
  minDurationMinutes: number;
  maxDurationMinutes: number;
  advanceBookingDays: number;         // how far ahead users may book
  createdAt: string;
  updatedAt: string;
  // Joined/aggregated when fetched (not stored on the instruments table)
  specifications: InstrumentSpecification[];
  averageRating?: number;
  reviewCount?: number;
}

/** Table: instrument_bookings */
export interface InstrumentBooking {
  id: string;
  instrumentId: string;               // FK -> instruments.id
  requesterId?: string;               // FK -> users/members.id when logged in
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string;
  affiliation: string;                // department / institution
  supervisorName?: string;
  purposeTitle: string;               // short research / usage title
  purposeDescription: string;         // detailed intended usage
  sampleDetails?: string;
  startAt: string;
  endAt: string;
  status: BookingStatus;
  adminNote?: string;                 // reason shown on reject / optional note on approve
  reviewedBy?: string;                // FK -> users.id (admin)
  reviewedAt?: string;
  createdAt: string;
}

/** Table: instrument_unavailable_periods (maintenance, calibration, holidays) */
export interface InstrumentUnavailablePeriod {
  id: string;
  instrumentId: string;
  startAt: string;
  endAt: string;
  reason: string;
  type: 'maintenance' | 'calibration' | 'closed';
}

/** Table: instrument_reviews */
export interface InstrumentReview {
  id: string;
  instrumentId: string;
  bookingId?: string;                 // optional link to the booking that was used
  reviewerName: string;
  reviewerAffiliation?: string;
  rating: number;                     // 1-5
  comment: string;
  createdAt: string;
}

/** Derived (not a table): what the calendar renders */
export interface InstrumentCalendarEvent {
  id: string;
  instrumentId: string;
  kind: 'booking' | 'unavailable';
  title: string;
  subtitle?: string;
  startAt: string;
  endAt: string;
}

export interface CreateBookingPayload {
  instrumentId: string;
  requesterId?: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string;
  affiliation: string;
  supervisorName?: string;
  purposeTitle: string;
  purposeDescription: string;
  sampleDetails?: string;
  startAt: string;
  endAt: string;
}
