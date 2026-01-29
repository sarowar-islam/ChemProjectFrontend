// Shared types for the research group application

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'member';
}

export interface TeamMember {
  id: string;
  username: string;
  name: string;
  email: string;
  phone?: string;
  position: 'team_leader' | 'faculty' | 'researcher' | 'student' | 'staff';
  title: string;
  researchArea: string;
  bio: string;
  photoUrl: string;
  googleScholarLink: string;
  expertise: string[];
  joinedDate: string;
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
  content: string;
  date: string;
  priority: 'normal' | 'important';
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
