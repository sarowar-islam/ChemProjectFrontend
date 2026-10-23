import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Bell,
  LogOut,
  Plus,
  Trash2,
  Edit,
  Settings,
  Save,
  Newspaper,
  Eye,
  EyeOff,
  ChevronLeft,
  Menu,
  Compass,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { adminService } from '@/services/admin.service';
import { Project, TeamMember, Notice, News, ResearchFocus } from '@/services/types';
import { SiteSettings } from '@/services/settings.service';
import { researchFocusService } from '@/services/researchFocus.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { newsService } from '@/services/news.service';
import { normalizeMemberTitle, sortMembersForAdmin, sortMembersWithinSection } from '@/lib/memberSorting';
import RichTextEditor from '@/components/RichTextEditor';

type Tab = 'dashboard' | 'projects' | 'members' | 'news' | 'notices' | 'focus' | 'settings';
const VALID_TABS: Tab[] = ['dashboard', 'projects', 'members', 'news', 'notices', 'focus', 'settings'];

// Position options - determines the category/section on team page
const POSITION_OPTIONS = [
  { value: 'team_leader', label: 'Team Leader' },
  { value: 'faculty', label: 'Faculty' },
  { value: 'researcher', label: 'Researcher' },
  { value: 'student', label: 'Student' },
  { value: 'Administrative', label: 'Administrative' },
] as const;

// Title options - ordered by seniority used across team/admin views
const TITLE_OPTIONS = [
  // Faculty titles
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Lecturer',
  // Researcher titles
  'Post Doctoral Researcher',
  'Research Associate',
  'Research Assistant',
  'PhD Research Fellow',
  'MPhil Research Fellow',
  'Masters Fellow',
  'Visiting Researcher',
  // Student titles
  'PhD Student',
  'MPhil Student',
  'MSc Student',
  'BSc Student',
  // Administrative titles
  'Lab Technician',
  'Lab Assistant',
  'Office Secretary',
  'Office Assistant',
];

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const getInitialTab = (): Tab => {
    const tabParam = searchParams.get('tab') as Tab | null;
    if (tabParam && VALID_TABS.includes(tabParam)) {
      return tabParam;
    }
    const saved = localStorage.getItem('admin_active_tab') as Tab | null;
    if (saved && VALID_TABS.includes(saved)) {
      return saved;
    }
    return 'dashboard';
  };

  const [activeTab, setActiveTabState] = useState<Tab>(getInitialTab);

  const setActiveTab = (tab: Tab) => {
    setActiveTabState(tab);
    localStorage.setItem('admin_active_tab', tab);
    setSearchParams(tab === 'dashboard' ? {} : { tab }, { replace: true });
  };

  useEffect(() => {
    const tabParam = searchParams.get('tab') as Tab | null;
    if (tabParam && VALID_TABS.includes(tabParam)) {
      if (tabParam !== activeTab) {
        setActiveTabState(tabParam);
        localStorage.setItem('admin_active_tab', tabParam);
      }
    } else if (!tabParam && activeTab !== 'dashboard') {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [searchParams, activeTab, setSearchParams]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalPublications: 0,
    totalMembers: 0,
    ongoingProjects: 0,
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [researchFocusList, setResearchFocusList] = useState<ResearchFocus[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [statsRes, projectsRes, membersRes, noticesRes, settingsRes, newsRes, focusRes] = await Promise.all([
      adminService.getDashboardStats(),
      adminService.getProjects(),
      adminService.getMembers(),
      adminService.getNotices(),
      adminService.getSettings(),
      newsService.getNews(),
      researchFocusService.getAll(),
    ]);

    if (statsRes.success && statsRes.data) setStats(statsRes.data);
    if (projectsRes.success && projectsRes.data) setProjects(projectsRes.data);
    if (membersRes.success && membersRes.data) setMembers(sortMembersForAdmin(membersRes.data));
    if (noticesRes.success && noticesRes.data) setNotices(noticesRes.data);
    if (settingsRes.success && settingsRes.data) setSettings(settingsRes.data);
    if (newsRes.success && newsRes.data) setNews(newsRes.data);
    if (focusRes.success && focusRes.data) setResearchFocusList(focusRes.data);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects' as Tab, label: 'Projects', icon: FolderKanban },
    { id: 'members' as Tab, label: 'Members', icon: Users },
    { id: 'focus' as Tab, label: 'Research Focus', icon: Compass },
    { id: 'news' as Tab, label: 'News', icon: Newspaper },
    { id: 'notices' as Tab, label: 'Notices', icon: Bell },
    { id: 'settings' as Tab, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card text-foreground sticky top-0 z-50 border-b border-border shadow-sm">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 shrink-0">
                <img
                  src="/photos/Logo.png"
                  alt="Yunus Ahmed Lab logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="font-heading text-xs lg:text-sm font-semibold text-foreground">
                  <span>Biochemical and </span>
                  <span className="text-[#15803D]">Environmental</span>
                </span>
                <span className="text-[9px] lg:text-[10px] uppercase tracking-[0.3em] text-[#15803D] font-medium mt-0.5">
                  Research Lab
                </span>
              </div>
            </Link>
            <span className="text-muted-foreground hidden sm:inline">|</span>
            <span className="text-sm hidden sm:inline text-muted-foreground">Admin Panel</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border hover:bg-secondary transition-colors text-sm text-muted-foreground"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar Overlay for Mobile */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-auto bg-card border-r border-border transition-all duration-300 flex flex-col pt-8 lg:pt-0 ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } ${sidebarCollapsed ? 'w-16' : 'w-64'}`}
        >
          <div className="flex-1 py-4">
            <nav className="space-y-1 px-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'bg-accent text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                  title={sidebarCollapsed ? tab.label : undefined}
                >
                  <tab.icon className="w-5 h-5 shrink-0" />
                  {!sidebarCollapsed && <span>{tab.label}</span>}
                </button>
              ))}
            </nav>
          </div>

          {/* Collapse Button */}
          <div className="p-2 border-t border-border hidden lg:block">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors text-sm"
            >
              <ChevronLeft className={`w-4 h-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
              {!sidebarCollapsed && <span>Collapse</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {activeTab === 'dashboard' && (
            <DashboardView stats={stats} loading={loading} />
          )}
          {activeTab === 'projects' && (
            <ProjectsView projects={projects} loading={loading} onRefresh={fetchData} toast={toast} />
          )}
          {activeTab === 'members' && (
            <MembersView members={members} loading={loading} onRefresh={fetchData} toast={toast} />
          )}
          {activeTab === 'focus' && (
            <ResearchFocusView focusList={researchFocusList} loading={loading} onRefresh={fetchData} toast={toast} />
          )}
          {activeTab === 'news' && (
            <NewsView news={news} loading={loading} onRefresh={fetchData} toast={toast} />
          )}
          {activeTab === 'notices' && (
            <NoticesView notices={notices} loading={loading} onRefresh={fetchData} toast={toast} />
          )}
          {activeTab === 'settings' && (
            <SettingsView settings={settings} loading={loading} onRefresh={fetchData} toast={toast} />
          )}
        </main>
      </div>
    </div>
  );
}

function DashboardView({
  stats,
  loading,
}: {
  stats: {
    totalProjects: number;
    totalPublications: number;
    totalMembers: number;
    ongoingProjects: number;
  };
  loading: boolean;
}) {
  return (
    <div>
      <h2 className="font-heading text-2xl text-foreground mb-6">Overview</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse shadow-sm">
              <div className="h-10 w-20 bg-secondary rounded mb-2" />
              <div className="h-4 w-24 bg-secondary rounded" />
            </div>
          ))
        ) : (
          <>
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="text-3xl font-bold text-accent mb-1">{stats.totalProjects}</div>
              <div className="text-sm text-muted-foreground">Total Projects</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="text-3xl font-bold text-accent mb-1">{stats.totalPublications}</div>
              <div className="text-sm text-muted-foreground">Publications</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="text-3xl font-bold text-accent mb-1">{stats.totalMembers}</div>
              <div className="text-sm text-muted-foreground">Team Members</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="text-3xl font-bold text-accent mb-1">{stats.ongoingProjects}</div>
              <div className="text-sm text-muted-foreground">Ongoing Projects</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ProjectsView({
  projects,
  loading,
  onRefresh,
  toast,
}: {
  projects: Project[];
  loading: boolean;
  onRefresh: () => void;
  toast: ReturnType<typeof useToast>['toast'];
}) {
  const navigate = useNavigate();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    const res = await adminService.deleteProject(id);
    if (res.success) {
      toast({ title: 'Success', description: 'Project deleted successfully' });
      onRefresh();
    } else {
      toast({ title: 'Error', description: res.error || 'Failed to delete project', variant: 'destructive' });
    }
  };

  const ongoingProjects = [...projects]
    .filter((p) => p.status === 'ongoing')
    .sort((a, b) => new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime());

  const completedProjects = [...projects]
    .filter((p) => p.status === 'completed')
    .sort((a, b) => new Date(b.endDate || b.startDate || 0).getTime() - new Date(a.endDate || a.startDate || 0).getTime());

  const renderProjectCard = (project: Project) => (
    <div key={project.id} className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1.5 flex-wrap">
          <h3 className="font-heading font-semibold text-foreground text-lg">{project.title}</h3>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
            project.status === 'ongoing' ? 'bg-[#DCFCE7] text-[#166534] dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-secondary text-secondary-foreground'
          }`}>
            {project.status}
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2" dangerouslySetInnerHTML={{ __html: project.description }} />
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {project.startDate && <span>Started: {project.startDate}</span>}
          {project.endDate && <span>Ended: {project.endDate}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <button
          onClick={() => navigate(`/admin/projects/edit/${project.id}`)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-secondary/50 text-foreground hover:bg-secondary text-xs font-medium transition-colors"
        >
          <Edit className="w-3.5 h-3.5 text-muted-foreground" /> Edit
        </button>
        <button
          onClick={() => handleDelete(project.id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400 text-xs font-medium transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-2xl text-foreground font-bold">Research Projects</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage research projects, statuses, and descriptions.</p>
        </div>
        <Button onClick={() => navigate('/admin/projects/new')} className="bg-accent text-primary-foreground hover:bg-accent/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse shadow-sm">
              <div className="h-5 w-2/3 bg-secondary rounded mb-3" />
              <div className="h-4 w-full bg-secondary rounded mb-2" />
              <div className="h-4 w-1/3 bg-secondary rounded" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <FolderKanban className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-heading text-lg font-semibold text-foreground mb-1">No projects found</h3>
          <p className="text-sm text-muted-foreground mb-4">Get started by creating your first research project.</p>
          <Button onClick={() => navigate('/admin/projects/new')} className="bg-accent text-primary-foreground hover:bg-accent/90">
            <Plus className="w-4 h-4 mr-2" /> Add Project
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Ongoing Projects Section */}
          <div>
            <h3 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Ongoing Projects ({ongoingProjects.length})
            </h3>
            {ongoingProjects.length === 0 ? (
              <div className="text-center py-8 bg-card border border-border rounded-xl text-muted-foreground text-sm">
                No ongoing projects.
              </div>
            ) : (
              <div className="space-y-4">
                {ongoingProjects.map(renderProjectCard)}
              </div>
            )}
          </div>

          {/* Completed Projects Section */}
          <div>
            <h3 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              Completed Projects ({completedProjects.length})
            </h3>
            {completedProjects.length === 0 ? (
              <div className="text-center py-8 bg-card border border-border rounded-xl text-muted-foreground text-sm">
                No completed projects.
              </div>
            ) : (
              <div className="space-y-4">
                {completedProjects.map(renderProjectCard)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MembersView({
  members,
  loading,
  onRefresh,
  toast,
}: {
  members: TeamMember[];
  loading: boolean;
  onRefresh: () => void;
  toast: ReturnType<typeof useToast>['toast'];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    position: '' as TeamMember['position'] | '',
    title: '',
    bio: '',
  });
  const [saving, setSaving] = useState(false);

  const openAddModal = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      position: '',
      title: '',
      bio: '',
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsModalOpen(true);
  };

  const openEditModal = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      username: member.username,
      email: member.email,
      password: '',
      confirmPassword: '',
      position: member.position,
      title: normalizeMemberTitle(member.title),
      bio: member.bio || '',
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.username) {
      toast({ title: 'Error', description: 'Name and username are required', variant: 'destructive' });
      return;
    }

    if (!editingMember) {
      // Creating new member - password required
      if (!formData.password) {
        toast({ title: 'Error', description: 'Password is required for new members', variant: 'destructive' });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
        return;
      }
      if (formData.password.length < 6) {
        toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
        return;
      }
    }

    setSaving(true);
    try {
      if (editingMember) {
        const res = await adminService.updateMember(editingMember.id, {
          name: formData.name,
          username: formData.username,
          email: formData.email,
          position: formData.position as TeamMember['position'],
          title: normalizeMemberTitle(formData.title),
          bio: formData.bio,
        });
        if (res.success) {
          toast({ title: 'Success', description: 'Member updated successfully' });
        } else {
          toast({ title: 'Error', description: res.error || 'Failed to update member', variant: 'destructive' });
        }
      } else {
        const res = await adminService.createMemberWithPassword({
          name: formData.name,
          username: formData.username,
          email: formData.email || `${formData.username}@cuet.ac.bd`,
          position: formData.position as TeamMember['position'],
          title: normalizeMemberTitle(formData.title),
          password: formData.password,
        });
        if (res.success) {
          toast({ title: 'Success', description: 'Member added successfully. They can now login with their username and password.' });
        } else {
          toast({ title: 'Error', description: res.error || 'Failed to add member', variant: 'destructive' });
        }
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (error) {
      toast({ title: 'Error', description: 'An error occurred', variant: 'destructive' });
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return;
    const res = await adminService.deleteMember(id);
    if (res.success) {
      toast({ title: 'Success', description: 'Member deleted successfully' });
      onRefresh();
    } else {
      toast({ title: 'Error', description: res.error || 'Failed to delete member', variant: 'destructive' });
    }
  };

  const handleGenerateSecurityCode = async (memberId: string) => {
    const result = await adminService.generateMemberSecurityCode(memberId);
    if (result.success && result.data) {
      setGeneratedCodes((prev) => ({ ...prev, [memberId]: result.data!.securityCode }));
      toast({ title: 'Security code generated', description: 'Share this code with the member. It expires in 30 minutes.' });
    } else {
      toast({ title: 'Error', description: result.error || 'Failed to generate security code', variant: 'destructive' });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl text-foreground">Team Members</h2>
        <Button onClick={openAddModal} className="bg-accent text-primary-foreground hover:bg-accent/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-secondary rounded-full" />
                <div className="flex-1">
                  <div className="h-4 w-24 bg-secondary rounded mb-1" />
                  <div className="h-3 w-20 bg-secondary rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          No members yet. Click "Add Member" to add one.
        </div>
      ) : (
        (() => {
          const teamLeaders = sortMembersWithinSection(members.filter((m) => m.position === 'team_leader'));
          const faculty = sortMembersWithinSection(members.filter((m) => m.position === 'faculty'));
          const researchers = sortMembersWithinSection(members.filter((m) => m.position === 'researcher'));
          const students = sortMembersWithinSection(members.filter((m) => m.position === 'student'));
          const administrative = sortMembersWithinSection(members.filter((m) => m.position === 'Administrative'));

          const renderMemberCard = (member: TeamMember) => (
            <div key={member.id} className="bg-card border border-border rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <img
                  src={member.photoUrl || '/photos/blank_profile.png'}
                  alt={member.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">{member.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{normalizeMemberTitle(member.title) || 'No title'}</p>
                  <p className="text-xs text-accent/70 truncate capitalize">{member.position?.replace('_', ' ') || 'No position'}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEditModal(member)} className="p-2 hover:bg-secondary rounded-lg transition-colors" title="Edit">
                    <Edit className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => handleDelete(member.id)} className="p-2 hover:bg-[#FEE2E2] rounded-lg transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4 text-[#EF4444]" />
                  </button>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <button
                  onClick={() => handleGenerateSecurityCode(member.id)}
                  className="w-full py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  Generate Security Code
                </button>
                {generatedCodes[member.id] && (
                  <div className="rounded-xl border border-border bg-slate-50 p-3 text-sm text-foreground">
                    <div className="font-semibold">Code generated:</div>
                    <div className="mt-1 break-all">{generatedCodes[member.id]}</div>
                    <div className="text-xs text-muted-foreground mt-1">Valid for 30 minutes.</div>
                  </div>
                )}
              </div>
            </div>
          );

          return (
            <div className="space-y-10">
              {teamLeaders.length > 0 && (
                <div>
                  <h3 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    Team Leader ({teamLeaders.length})
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teamLeaders.map(renderMemberCard)}
                  </div>
                </div>
              )}

              {faculty.length > 0 && (
                <div>
                  <h3 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    Faculty ({faculty.length})
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {faculty.map(renderMemberCard)}
                  </div>
                </div>
              )}

              {researchers.length > 0 && (
                <div>
                  <h3 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    Researchers ({researchers.length})
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {researchers.map(renderMemberCard)}
                  </div>
                </div>
              )}

              {students.length > 0 && (
                <div>
                  <h3 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    Students ({students.length})
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {students.map(renderMemberCard)}
                  </div>
                </div>
              )}

              {administrative.length > 0 && (
                <div>
                  <h3 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    Administrative ({administrative.length})
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {administrative.map(renderMemberCard)}
                  </div>
                </div>
              )}
            </div>
          );
        })()
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editingMember ? 'Edit Member' : 'Add Member'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name" className="text-muted-foreground">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
                className="bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
            <div>
              <Label htmlFor="username" className="text-muted-foreground">Username *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                placeholder="Enter username (for login)"
                disabled={!!editingMember}
                className="bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
              {!editingMember && (
                <p className="text-xs text-muted-foreground mt-1">
                  This will be used for login
                </p>
              )}
            </div>

            {!editingMember && (
              <>
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="position">Position *</Label>
              <Select value={formData.position} onValueChange={(v) => setFormData({ ...formData, position: v as TeamMember['position'] })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select position (category)" />
                </SelectTrigger>
                <SelectContent>
                  {POSITION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Determines the section on the team page</p>
            </div>

            <div>
              <Label htmlFor="title">Title *</Label>
              <Select value={formData.title} onValueChange={(v) => setFormData({ ...formData, title: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select title" />
                </SelectTrigger>
                <SelectContent>
                  {TITLE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Academic/professional title</p>
            </div>

            <div>
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={`${formData.username || 'username'}@cuet.ac.bd`}
              />
            </div>

            {editingMember && (
              <div>
                <Label className="text-muted-foreground mb-1 block">About / Biography</Label>
                <RichTextEditor
                  value={formData.bio}
                  onChange={(val) => setFormData({ ...formData, bio: val })}
                  placeholder="Enter member's biography, achievements, research interests..."
                  minHeight="180px"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingMember ? 'Update' : 'Create Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NewsView({
  news,
  loading,
  onRefresh,
  toast,
}: {
  news: News[];
  loading: boolean;
  onRefresh: () => void;
  toast: ReturnType<typeof useToast>['toast'];
}) {
  const navigate = useNavigate();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news?')) return;
    const res = await newsService.deleteNews(id);
    if (res.success) {
      toast({ title: 'Success', description: 'News deleted successfully' });
      onRefresh();
    } else {
      toast({ title: 'Error', description: res.error || 'Failed to delete news', variant: 'destructive' });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl text-foreground">News</h2>
        <Button onClick={() => navigate('/admin/news/new')} className="bg-accent text-primary-foreground hover:bg-accent/90">
          <Plus className="w-4 h-4 mr-2" />
          Add News
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse shadow-sm">
              <div className="h-5 w-2/3 bg-secondary rounded mb-2" />
              <div className="h-4 w-full bg-secondary rounded" />
            </div>
          ))}
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          No news yet. Click "Add News" to publish one.
        </div>
      ) : (
        <div className="space-y-4">
          {news.map((item) => (
            <div key={item.id} className="bg-card border border-border rounded-xl p-4 flex items-start justify-between shadow-sm">
              <div className="flex-1 min-w-0 mr-4">
                <h3 className="font-medium text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1" dangerouslySetInnerHTML={{ __html: item.summary || item.content }} />
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>{new Date(item.date).toLocaleDateString()}</span>
                  {item.author && <span>by {item.author}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => navigate(`/admin/news/edit/${item.id}`)} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                  <Edit className="w-4 h-4 text-muted-foreground" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-[#FEE2E2] rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4 text-[#EF4444]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NoticesView({
  notices,
  loading,
  onRefresh,
  toast,
}: {
  notices: Notice[];
  loading: boolean;
  onRefresh: () => void;
  toast: ReturnType<typeof useToast>['toast'];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal' as 'normal' | 'important',
  });
  const [saving, setSaving] = useState(false);

  const openAddModal = () => {
    setEditingNotice(null);
    setFormData({
      title: '',
      content: '',
      priority: 'normal',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (notice: Notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      priority: notice.priority,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      toast({ title: 'Error', description: 'Title and content are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      if (editingNotice) {
        const res = await adminService.updateNotice(editingNotice.id, formData);
        if (res.success) {
          toast({ title: 'Success', description: 'Notice updated successfully' });
        } else {
          toast({ title: 'Error', description: res.error || 'Failed to update notice', variant: 'destructive' });
        }
      } else {
        const res = await adminService.createNotice(formData);
        if (res.success) {
          toast({ title: 'Success', description: 'Notice created successfully' });
        } else {
          toast({ title: 'Error', description: res.error || 'Failed to create notice', variant: 'destructive' });
        }
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (error) {
      toast({ title: 'Error', description: 'An error occurred', variant: 'destructive' });
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    const res = await adminService.deleteNotice(id);
    if (res.success) {
      toast({ title: 'Success', description: 'Notice deleted successfully' });
      onRefresh();
    } else {
      toast({ title: 'Error', description: res.error || 'Failed to delete notice', variant: 'destructive' });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl text-foreground">Notices</h2>
        <Button onClick={openAddModal} className="bg-accent text-primary-foreground hover:bg-accent/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Notice
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse shadow-sm">
              <div className="h-5 w-2/3 bg-secondary rounded mb-2" />
              <div className="h-4 w-full bg-secondary rounded" />
            </div>
          ))}
        </div>
      ) : notices.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          No notices yet. Click "Add Notice" to create one.
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div key={notice.id} className="bg-card border border-border rounded-xl p-4 flex items-start justify-between shadow-sm">
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-foreground">{notice.title}</h3>
                  {notice.priority === 'important' && (
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#FEE2E2] text-[#EF4444]">
                      Important
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{notice.content}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(notice.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEditModal(notice)} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                  <Edit className="w-4 h-4 text-muted-foreground" />
                </button>
                <button onClick={() => handleDelete(notice.id)} className="p-2 hover:bg-[#FEE2E2] rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4 text-[#EF4444]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editingNotice ? 'Edit Notice' : 'Add Notice'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title" className="text-muted-foreground">Title *</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="bg-card border-border text-foreground focus:border-primary" />
            </div>
            <div>
              <Label htmlFor="content" className="text-muted-foreground">Content *</Label>
              <Textarea id="content" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={4} className="bg-card border-border text-foreground focus:border-primary" />
            </div>
            <div>
              <Label htmlFor="priority" className="text-muted-foreground">Priority</Label>
              <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v as 'normal' | 'important' })}>
                <SelectTrigger className="bg-card border-border text-foreground"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="border-border text-muted-foreground hover:bg-secondary">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-accent text-primary-foreground hover:bg-accent/90">
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SettingsView({
  settings,
  loading,
  onRefresh,
  toast,
}: {
  settings: SiteSettings | null;
  loading: boolean;
  onRefresh: () => void;
  toast: ReturnType<typeof useToast>['toast'];
}) {
  const [formData, setFormData] = useState({
    googleScholarUrl: '',
    aboutUs: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        googleScholarUrl: settings.googleScholarUrl || '',
        aboutUs: settings.aboutUs || '',
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await adminService.updateSettings(formData);
      if (res.success) {
        toast({ title: 'Success', description: 'Settings saved successfully' });
        onRefresh();
      } else {
        toast({ title: 'Error', description: res.error || 'Failed to save settings', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An error occurred', variant: 'destructive' });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-card rounded animate-pulse" />
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 animate-pulse shadow-sm">
          <div className="h-4 w-32 bg-secondary rounded" />
          <div className="h-10 w-full bg-secondary rounded" />
          <div className="h-4 w-32 bg-secondary rounded" />
          <div className="h-24 w-full bg-secondary rounded" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-heading text-2xl text-foreground mb-6">Site Settings</h2>
      <div className="bg-card border border-border rounded-xl p-6 max-w-4xl shadow-sm">
        <div className="space-y-6">
          <div>
            <Label htmlFor="googleScholarUrl" className="text-base font-medium text-foreground">Google Scholar Profile URL</Label>
            <p className="text-sm text-muted-foreground mb-2">
              This URL is used to fetch publications for the Publications page.
            </p>
            <Input
              id="googleScholarUrl"
              value={formData.googleScholarUrl}
              onChange={(e) => setFormData({ ...formData, googleScholarUrl: e.target.value })}
              placeholder="https://scholar.google.com/citations?user=..."
              className="bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
            />
          </div>
          <div>
            <Label className="text-base font-medium text-foreground mb-1 block">About Us</Label>
            <p className="text-sm text-muted-foreground mb-2">
              This text appears on the homepage About Us section. Use the rich text editor to format paragraphs, bold text, lists, and links.
            </p>
            <RichTextEditor
              value={formData.aboutUs}
              onChange={(value) => setFormData({ ...formData, aboutUs: value })}
              placeholder="Write about the research group, vision, mission, and achievements..."
              minHeight="280px"
            />
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-accent text-primary-foreground hover:bg-accent/90">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ResearchFocusView({
  focusList,
  loading,
  onRefresh,
  toast,
}: {
  focusList: ResearchFocus[];
  loading: boolean;
  onRefresh: () => void;
  toast: ReturnType<typeof useToast>['toast'];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFocus, setEditingFocus] = useState<ResearchFocus | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    details: '',
    displayOrder: 0,
  });
  const [saving, setSaving] = useState(false);

  const openAddModal = () => {
    setEditingFocus(null);
    setFormData({
      title: '',
      shortDescription: '',
      details: '',
      displayOrder: focusList.length,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (focus: ResearchFocus) => {
    setEditingFocus(focus);
    setFormData({
      title: focus.title || '',
      shortDescription: focus.shortDescription || '',
      details: focus.details || '',
      displayOrder: focus.displayOrder ?? 0,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({ title: 'Validation Error', description: 'Title is required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      let res;
      if (editingFocus) {
        res = await researchFocusService.update(editingFocus.id, formData);
      } else {
        res = await researchFocusService.create(formData);
      }

      if (res.success) {
        toast({
          title: 'Success',
          description: editingFocus ? 'Research focus updated successfully' : 'Research focus created successfully',
        });
        setIsModalOpen(false);
        onRefresh();
      } else {
        toast({
          title: 'Error',
          description: res.error || 'Failed to save research focus',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An error occurred', variant: 'destructive' });
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this research focus item?')) return;
    const res = await researchFocusService.delete(id);
    if (res.success) {
      toast({ title: 'Success', description: 'Research focus deleted successfully' });
      onRefresh();
    } else {
      toast({
        title: 'Error',
        description: res.error || 'Failed to delete research focus',
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-2xl text-foreground">Our Research Focus</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage the dynamic research focus areas shown on the homepage and their full detail pages.
          </p>
        </div>
        <Button onClick={openAddModal} className="bg-accent text-primary-foreground hover:bg-accent/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Research Focus
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse shadow-sm">
              <div className="h-5 w-1/3 bg-secondary rounded mb-2" />
              <div className="h-4 w-3/4 bg-secondary rounded" />
            </div>
          ))}
        </div>
      ) : focusList.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-10 text-center text-muted-foreground shadow-sm">
          <Compass className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-base font-medium mb-1">No research focus areas found</p>
          <p className="text-sm text-muted-foreground mb-4">Click "Add Research Focus" to add your first domain.</p>
          <Button onClick={openAddModal} className="bg-accent text-primary-foreground hover:bg-accent/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Research Focus
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {focusList.map((focus, index) => (
            <div
              key={focus.id}
              className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 shadow-sm hover:border-accent/40 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-6 h-6 rounded-full bg-accent/15 text-accent text-xs font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <h3 className="font-heading text-lg font-bold text-foreground">
                    {focus.title}
                  </h3>
                </div>
                {focus.shortDescription && (
                  <p className="text-sm text-muted-foreground line-clamp-2 pl-8">
                    {focus.shortDescription}
                  </p>
                )}
                {focus.details && (
                  <p className="text-xs text-accent/80 font-medium mt-2 pl-8 flex items-center gap-1">
                    ✓ Rich text details included
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 sm:self-center shrink-0 pl-8 sm:pl-0">
                <Link
                  to={`/research-focus/${focus.id}`}
                  target="_blank"
                  className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                  title="Preview detail page"
                >
                  <Eye className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => openEditModal(focus)}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(focus.id)}
                  className="p-2 hover:bg-[#FEE2E2] dark:hover:bg-red-950/40 rounded-lg transition-colors text-[#EF4444]"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Focus Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground font-heading text-xl">
              {editingFocus ? 'Edit Research Focus' : 'Add Research Focus'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure the research focus title, short summary, and detailed content.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div>
              <Label htmlFor="focus-title" className="text-foreground font-medium mb-1.5 block">
                Title *
              </Label>
              <Input
                id="focus-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Environmental Remediation"
                className="bg-card border-border text-foreground focus:border-primary"
              />
            </div>

            <div>
              <Label htmlFor="focus-short-desc" className="text-foreground font-medium mb-1.5 block">
                Short Description / Bio *
              </Label>
              <Textarea
                id="focus-short-desc"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                rows={2}
                placeholder="Brief 1-2 sentence overview shown on homepage card..."
                className="bg-card border-border text-foreground focus:border-primary"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-foreground font-medium block">
                  Detailed Information (Full Page) *
                </Label>
                <span className="text-xs text-muted-foreground">Rich text supported</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                This comprehensive content is shown on the dedicated detail page when users click on this research focus.
              </p>
              <RichTextEditor
                value={formData.details}
                onChange={(value) => setFormData({ ...formData, details: value })}
                placeholder="Write in-depth research methodologies, key achievements, objectives, bullet points..."
                minHeight="260px"
              />
            </div>

            <div>
              <Label htmlFor="focus-order" className="text-foreground font-medium mb-1.5 block">
                Display Order
              </Label>
              <Input
                id="focus-order"
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                className="bg-card border-border text-foreground focus:border-primary w-32"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="border-border text-muted-foreground hover:bg-secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-accent text-primary-foreground hover:bg-accent/90"
            >
              {saving ? 'Saving...' : 'Save Research Focus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
