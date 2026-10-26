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
