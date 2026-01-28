// Central export for all services
export { authService } from './auth.service';
export { teamService } from './team.service';
export { projectService } from './project.service';
export { publicationService } from './publication.service';
export { noticeService } from './notice.service';
export { newsService } from './news.service';
export { adminService } from './admin.service';
export { settingsService } from './settings.service';
export { scholarService } from './scholar.service';

// Re-export types
export type {
  User,
  TeamMember,
  Project,
  Publication,
  Notice,
  News,
  AuthResponse,
  ApiResponse
} from './types';

export type { SiteSettings } from './settings.service';
export type { ScholarProfile, ScholarPublication, ScholarResponse, MemberScholarResponse } from './scholar.service';
