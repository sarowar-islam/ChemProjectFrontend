import { apiRequest } from '@/lib/api';
import { projectService } from './project.service';
import { teamService } from './team.service';
import { noticeService } from './notice.service';
import { settingsService } from './settings.service';
import { newsService } from './news.service';
import { scholarService } from './scholar.service';
import { TeamMember, ApiResponse } from './types';

// Admin service aggregates all management functions
export const adminService = {
  // Dashboard stats
  async getDashboardStats(): Promise<ApiResponse<{
    totalProjects: number;
    totalPublications: number;
    totalMembers: number;
    ongoingProjects: number;
  }>> {
    const [projectsRes, scholarRes, membersRes] = await Promise.all([
      projectService.getProjects(),
      scholarService.getMainPublications(),
      teamService.getMembers()
    ]);

    const projects = projectsRes.data || [];
    const members = membersRes.data || [];

    // Directly get count from Google Scholar publications (matching /publications page)
    const totalPublications = (scholarRes.success && scholarRes.data?.publications)
      ? scholarRes.data.publications.length
      : 0;

    return {
      success: true,
      data: {
        totalProjects: projects.length,
        totalPublications,
        totalMembers: members.length,
        ongoingProjects: projects.filter(p => p.status === 'ongoing').length
      }
    };
  },

  // Project management
  getProjects: projectService.getProjects.bind(projectService),
  createProject: projectService.createProject.bind(projectService),
  updateProject: projectService.updateProject.bind(projectService),
  deleteProject: projectService.deleteProject.bind(projectService),

  // Team management
  getMembers: teamService.getMembers.bind(teamService),
  createMember: (member: Omit<TeamMember, 'id'>) => teamService.createMember(member),
  updateMember: teamService.updateMember.bind(teamService),
  deleteMember: teamService.deleteMember.bind(teamService),

  // Create member with password (handled by backend now)
  async createMemberWithPassword(member: {
    name: string;
    username: string;
    email: string;
    position: TeamMember['position'];
    title: string;
    password: string;
  }): Promise<ApiResponse<TeamMember>> {
    return apiRequest<TeamMember>({
      method: 'POST',
      url: '/admin/members',
      data: {
        name: member.name,
        username: member.username,
        email: member.email,
        position: member.position,
        title: member.title,
        password: member.password,
        researchArea: '',
        bio: '',
        photoUrl: '',
        googleScholarLink: '',
        joinedDate: new Date().toISOString(),
      },
    });
  },

  async generateMemberSecurityCode(memberId: string): Promise<ApiResponse<{ securityCode: string }>> {
    return apiRequest<{ securityCode: string }>({
      method: 'POST',
      url: `/admin/members/${memberId}/generate-security-code`,
    });
  },

  // Notice management
  getNotices: noticeService.getNotices.bind(noticeService),
  createNotice: noticeService.createNotice.bind(noticeService),
  updateNotice: noticeService.updateNotice.bind(noticeService),
  deleteNotice: noticeService.deleteNotice.bind(noticeService),
  uploadNoticeFile: noticeService.uploadNoticeFile.bind(noticeService),

  // News management
  getNews: newsService.getNews.bind(newsService),
  createNews: newsService.createNews.bind(newsService),
  updateNews: newsService.updateNews.bind(newsService),
  deleteNews: newsService.deleteNews.bind(newsService),

  // Settings management
  getSettings: settingsService.getSettings.bind(settingsService),
  updateSettings: settingsService.updateSettings.bind(settingsService),
};
