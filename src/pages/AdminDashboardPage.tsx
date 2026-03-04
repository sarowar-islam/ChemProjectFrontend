import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Bell,
  LogOut,
  Plus,
  Trash2,
  Edit,
  FlaskConical,
  Settings,
  Save,
  Newspaper,
  Eye,
  EyeOff,
  ChevronLeft,
  Menu,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { adminService } from '@/services/admin.service';
import { Project, TeamMember, Notice, News } from '@/services/types';
import { SiteSettings } from '@/services/settings.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { newsService } from '@/services/news.service';

type Tab = 'dashboard' | 'projects' | 'members' | 'news' | 'notices' | 'settings';

// Position options - determines the category/section on team page
const POSITION_OPTIONS = [
  { value: 'team_leader', label: 'Team Leader' },
  { value: 'faculty', label: 'Faculty' },
  { value: 'researcher', label: 'Researcher' },
  { value: 'student', label: 'Student' },
  { value: 'staff', label: 'Staff' },
] as const;

// Title options - the academic/professional title (ordered by seniority)
const TITLE_OPTIONS = [
  // Faculty titles
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  // Researcher titles (seniority: Post-doc > PhD Fellow > Research Associate > Research Assistant)
  'Post Doctoral Researcher',
  'PhD Fellow',
  'Research Associate',
  "Master's Fellowship",
  'Research Assistant',
  'Research Assistant (RA)',
  'Visiting Researcher',
  // Student titles (seniority: PhD > MPhil > MSc > BSc)
  'PhD Student',
  'M.Phil Student',
  'M.Sc Student',
  'BSc Student',
  // Staff titles
  'Lab Technician',
  'Lab Assistant',
];

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
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
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [statsRes, projectsRes, membersRes, noticesRes, settingsRes, newsRes] = await Promise.all([
      adminService.getDashboardStats(),
      adminService.getProjects(),
      adminService.getMembers(),
      adminService.getNotices(),
      adminService.getSettings(),
      newsService.getNews(),
    ]);

    if (statsRes.success && statsRes.data) setStats(statsRes.data);
    if (projectsRes.success && projectsRes.data) setProjects(projectsRes.data);
    if (membersRes.success && membersRes.data) setMembers(membersRes.data);
    if (noticesRes.success && noticesRes.data) setNotices(noticesRes.data);
    if (settingsRes.success && settingsRes.data) setSettings(settingsRes.data);
    if (newsRes.success && newsRes.data) setNews(newsRes.data);

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
    { id: 'news' as Tab, label: 'News', icon: Newspaper },
    { id: 'notices' as Tab, label: 'Notices', icon: Bell },
    { id: 'settings' as Tab, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FAFBF8] flex flex-col">
      {/* Header */}
      <header className="bg-white text-[#0F172A] sticky top-0 z-50 border-b border-[#E5E7EB] shadow-sm">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 hover:bg-[#F3F8FF] rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#DBEAFE]">
                <FlaskConical className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <span className="font-heading font-semibold hidden sm:inline text-[#0F172A]">
                Prof. Dr. Yunus Ahmed Research Group
              </span>
            </Link>
            <span className="text-[#94A3B8] hidden sm:inline">|</span>
            <span className="text-sm hidden sm:inline text-[#475569]">Admin Panel</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#94A3B8] hidden sm:inline">
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#E5E7EB] hover:bg-[#F3F8FF] transition-colors text-sm text-[#475569]"
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
          className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-auto bg-white border-r border-[#E5E7EB] transition-all duration-300 flex flex-col pt-16 lg:pt-0 ${
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
                      ? 'bg-[#3B82F6] text-white'
                      : 'text-[#475569] hover:bg-[#F3F8FF] hover:text-[#0F172A]'
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
          <div className="p-2 border-t border-[#E5E7EB] hidden lg:block">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[#475569] hover:bg-[#F3F8FF] hover:text-[#0F172A] transition-colors text-sm"
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
      <h2 className="font-heading text-2xl text-[#1E40AF] mb-6">Overview</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-6 animate-pulse shadow-sm">
              <div className="h-10 w-20 bg-[#F3F8FF] rounded mb-2" />
              <div className="h-4 w-24 bg-[#F3F8FF] rounded" />
            </div>
          ))
        ) : (
          <>
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
              <div className="text-3xl font-bold text-[#3B82F6] mb-1">{stats.totalProjects}</div>
              <div className="text-sm text-[#94A3B8]">Total Projects</div>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
              <div className="text-3xl font-bold text-[#3B82F6] mb-1">{stats.totalPublications}</div>
              <div className="text-sm text-[#94A3B8]">Publications</div>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
              <div className="text-3xl font-bold text-[#3B82F6] mb-1">{stats.totalMembers}</div>
              <div className="text-sm text-[#94A3B8]">Team Members</div>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
              <div className="text-3xl font-bold text-[#3B82F6] mb-1">{stats.ongoingProjects}</div>
              <div className="text-sm text-[#94A3B8]">Ongoing Projects</div>
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    researchLink: '',
    status: 'ongoing' as 'ongoing' | 'completed',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });
  const [saving, setSaving] = useState(false);

  const openAddModal = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      description: '',
      researchLink: '',
      status: 'ongoing',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      researchLink: project.researchLink,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.description) {
      toast({ title: 'Error', description: 'Title and description are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      if (editingProject) {
        const res = await adminService.updateProject(editingProject.id, formData);
        if (res.success) {
          toast({ title: 'Success', description: 'Project updated successfully' });
        } else {
          toast({ title: 'Error', description: res.error || 'Failed to update project', variant: 'destructive' });
        }
      } else {
        const res = await adminService.createProject(formData);
        if (res.success) {
          toast({ title: 'Success', description: 'Project created successfully' });
        } else {
          toast({ title: 'Error', description: res.error || 'Failed to create project', variant: 'destructive' });
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
    if (!confirm('Are you sure you want to delete this project?')) return;
    const res = await adminService.deleteProject(id);
    if (res.success) {
      toast({ title: 'Success', description: 'Project deleted successfully' });
      onRefresh();
    } else {
      toast({ title: 'Error', description: res.error || 'Failed to delete project', variant: 'destructive' });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl text-[#1E40AF]">Projects</h2>
        <Button onClick={openAddModal} className="bg-[#3B82F6] text-white hover:bg-[#2563EB]">
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-4 animate-pulse shadow-sm">
              <div className="h-5 w-2/3 bg-[#F3F8FF] rounded mb-2" />
              <div className="h-4 w-full bg-[#F3F8FF] rounded" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 text-[#94A3B8]">
          No projects yet. Click "Add Project" to create one.
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex-1 min-w-0 mr-4">
                <h3 className="font-medium text-[#0F172A] truncate">{project.title}</h3>
                <p className="text-sm text-[#94A3B8] truncate">{project.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  project.status === 'ongoing' ? 'bg-[#DCFCE7] text-[#22C55E]' : 'bg-[#F3F8FF] text-[#94A3B8]'
                }`}>
                  {project.status}
                </span>
                <button onClick={() => openEditModal(project)} className="p-2 hover:bg-[#F3F8FF] rounded-lg transition-colors">
                  <Edit className="w-4 h-4 text-[#475569]" />
                </button>
                <button onClick={() => handleDelete(project.id)} className="p-2 hover:bg-[#FEE2E2] rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4 text-[#EF4444]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg bg-white border-[#E5E7EB]">
          <DialogHeader>
            <DialogTitle className="text-[#0F172A]">{editingProject ? 'Edit Project' : 'Add Project'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="researchLink">Research Link</Label>
              <Input id="researchLink" value={formData.researchLink} onChange={(e) => setFormData({ ...formData, researchLink: e.target.value })} placeholder="https://" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as 'ongoing' | 'completed' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
              </div>
            </div>
            {formData.status === 'completed' && (
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    position: '' as TeamMember['position'] | '',
    title: '',
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
      title: member.title,
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
          title: formData.title,
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
          title: formData.title,
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl text-[#1E40AF]">Team Members</h2>
        <Button onClick={openAddModal} className="bg-[#3B82F6] text-white hover:bg-[#2563EB]">
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-4 animate-pulse shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#F3F8FF] rounded-full" />
                <div className="flex-1">
                  <div className="h-4 w-24 bg-[#F3F8FF] rounded mb-1" />
                  <div className="h-3 w-20 bg-[#F3F8FF] rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-12 text-[#94A3B8]">
          No members yet. Click "Add Member" to add one.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <div key={member.id} className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <img
                  src={member.photoUrl || '/photos/blank_profile.png'}
                  alt={member.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-[#0F172A] truncate">{member.name}</h3>
                  <p className="text-sm text-[#94A3B8] truncate">{member.title || 'No title'}</p>
                  <p className="text-xs text-[#3B82F6]/70 truncate capitalize">{member.position?.replace('_', ' ') || 'No position'}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEditModal(member)} className="p-2 hover:bg-[#F3F8FF] rounded-lg transition-colors">
                    <Edit className="w-4 h-4 text-[#475569]" />
                  </button>
                  <button onClick={() => handleDelete(member.id)} className="p-2 hover:bg-[#FEE2E2] rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-[#EF4444]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md bg-white border-[#E5E7EB]">
          <DialogHeader>
            <DialogTitle className="text-[#0F172A]">{editingMember ? 'Edit Member' : 'Add Member'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name" className="text-[#475569]">Name *</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                placeholder="Enter full name"
                className="bg-white border-[#E5E7EB] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#3B82F6]"
              />
            </div>
            <div>
              <Label htmlFor="username" className="text-[#475569]">Username *</Label>
              <Input 
                id="username" 
                value={formData.username} 
                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '') })} 
                placeholder="Enter username (for login)"
                disabled={!!editingMember}
                className="bg-white border-[#E5E7EB] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#3B82F6]"
              />
              {!editingMember && (
                <p className="text-xs text-[#94A3B8] mt-1">
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
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#94A3B8] hover:text-[#0F172A]"
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
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#94A3B8] hover:text-[#0F172A]"
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
              <p className="text-xs text-[#94A3B8] mt-1">Determines the section on the team page</p>
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
              <p className="text-xs text-[#94A3B8] mt-1">Academic/professional title</p>
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    imageUrl: '',
    author: '',
  });
  const [saving, setSaving] = useState(false);

  const openAddModal = () => {
    setEditingNews(null);
    setFormData({
      title: '',
      summary: '',
      content: '',
      imageUrl: '',
      author: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: News) => {
    setEditingNews(item);
    setFormData({
      title: item.title,
      summary: item.summary || '',
      content: item.content,
      imageUrl: item.imageUrl || '',
      author: item.author || '',
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
      if (editingNews) {
        const res = await newsService.updateNews(editingNews.id, formData);
        if (res.success) {
          toast({ title: 'Success', description: 'News updated successfully' });
        } else {
          toast({ title: 'Error', description: res.error || 'Failed to update news', variant: 'destructive' });
        }
      } else {
        const res = await newsService.createNews(formData);
        if (res.success) {
          toast({ title: 'Success', description: 'News published successfully' });
        } else {
          toast({ title: 'Error', description: res.error || 'Failed to publish news', variant: 'destructive' });
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
        <h2 className="font-heading text-2xl text-[#1E40AF]">News</h2>
        <Button onClick={openAddModal} className="bg-[#3B82F6] text-white hover:bg-[#2563EB]">
          <Plus className="w-4 h-4 mr-2" />
          Add News
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-4 animate-pulse shadow-sm">
              <div className="h-5 w-2/3 bg-[#F3F8FF] rounded mb-2" />
              <div className="h-4 w-full bg-[#F3F8FF] rounded" />
            </div>
          ))}
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-12 text-[#94A3B8]">
          No news yet. Click "Add News" to publish one.
        </div>
      ) : (
        <div className="space-y-4">
          {news.map((item) => (
            <div key={item.id} className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex items-start justify-between shadow-sm">
              <div className="flex-1 min-w-0 mr-4">
                <h3 className="font-medium text-[#0F172A]">{item.title}</h3>
                <p className="text-sm text-[#94A3B8] line-clamp-2 mt-1">
                  {item.summary || item.content.substring(0, 150)}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-[#94A3B8]">
                  <span>{new Date(item.date).toLocaleDateString()}</span>
                  {item.author && <span>by {item.author}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEditModal(item)} className="p-2 hover:bg-[#F3F8FF] rounded-lg transition-colors">
                  <Edit className="w-4 h-4 text-[#475569]" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-[#FEE2E2] rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4 text-[#EF4444]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white border-[#E5E7EB]">
          <DialogHeader>
            <DialogTitle className="text-[#0F172A]">{editingNews ? 'Edit News' : 'Add News'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title" className="text-[#475569]">Title *</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="bg-white border-[#E5E7EB] text-[#0F172A] focus:border-[#3B82F6]" />
            </div>
            <div>
              <Label htmlFor="summary" className="text-[#475569]">Summary</Label>
              <Input id="summary" value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} placeholder="Brief summary for preview" className="bg-white border-[#E5E7EB] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#3B82F6]" />
            </div>
            <div>
              <Label htmlFor="content" className="text-[#475569]">Content *</Label>
              <Textarea id="content" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={6} className="bg-white border-[#E5E7EB] text-[#0F172A] focus:border-[#3B82F6]" />
            </div>
            <div>
              <Label htmlFor="imageUrl" className="text-[#475569]">Image URL</Label>
              <Input id="imageUrl" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="https://" />
            </div>
            <div>
              <Label htmlFor="author">Author</Label>
              <Input id="author" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} placeholder="Author name" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingNews ? 'Update' : 'Publish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
        <h2 className="font-heading text-2xl text-[#1E40AF]">Notices</h2>
        <Button onClick={openAddModal} className="bg-[#3B82F6] text-white hover:bg-[#2563EB]">
          <Plus className="w-4 h-4 mr-2" />
          Add Notice
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-4 animate-pulse shadow-sm">
              <div className="h-5 w-2/3 bg-[#F3F8FF] rounded mb-2" />
              <div className="h-4 w-full bg-[#F3F8FF] rounded" />
            </div>
          ))}
        </div>
      ) : notices.length === 0 ? (
        <div className="text-center py-12 text-[#94A3B8]">
          No notices yet. Click "Add Notice" to create one.
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div key={notice.id} className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex items-start justify-between shadow-sm">
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-[#0F172A]">{notice.title}</h3>
                  {notice.priority === 'important' && (
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#FEE2E2] text-[#EF4444]">
                      Important
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#94A3B8] line-clamp-1">{notice.content}</p>
                <p className="text-xs text-[#94A3B8] mt-1">
                  {new Date(notice.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEditModal(notice)} className="p-2 hover:bg-[#F3F8FF] rounded-lg transition-colors">
                  <Edit className="w-4 h-4 text-[#475569]" />
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
        <DialogContent className="max-w-lg bg-white border-[#E5E7EB]">
          <DialogHeader>
            <DialogTitle className="text-[#0F172A]">{editingNotice ? 'Edit Notice' : 'Add Notice'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title" className="text-[#475569]">Title *</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="bg-white border-[#E5E7EB] text-[#0F172A] focus:border-[#3B82F6]" />
            </div>
            <div>
              <Label htmlFor="content" className="text-[#475569]">Content *</Label>
              <Textarea id="content" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={4} className="bg-white border-[#E5E7EB] text-[#0F172A] focus:border-[#3B82F6]" />
            </div>
            <div>
              <Label htmlFor="priority" className="text-[#475569]">Priority</Label>
              <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v as 'normal' | 'important' })}>
                <SelectTrigger className="bg-white border-[#E5E7EB] text-[#0F172A]"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white border-[#E5E7EB]">
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="border-[#E5E7EB] text-[#475569] hover:bg-[#F3F8FF]">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#3B82F6] text-white hover:bg-[#2563EB]">
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
        <div className="h-8 w-48 bg-white rounded animate-pulse" />
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-4 animate-pulse shadow-sm">
          <div className="h-4 w-32 bg-[#F3F8FF] rounded" />
          <div className="h-10 w-full bg-[#F3F8FF] rounded" />
          <div className="h-4 w-32 bg-[#F3F8FF] rounded" />
          <div className="h-24 w-full bg-[#F3F8FF] rounded" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-heading text-2xl text-[#1E40AF] mb-6">Site Settings</h2>
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 max-w-2xl shadow-sm">
        <div className="space-y-6">
          <div>
            <Label htmlFor="googleScholarUrl" className="text-base font-medium text-[#0F172A]">Google Scholar Profile URL</Label>
            <p className="text-sm text-[#94A3B8] mb-2">
              This URL is used to fetch publications for the Publications page.
            </p>
            <Input
              id="googleScholarUrl"
              value={formData.googleScholarUrl}
              onChange={(e) => setFormData({ ...formData, googleScholarUrl: e.target.value })}
              placeholder="https://scholar.google.com/citations?user=..."
              className="bg-white border-[#E5E7EB] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#3B82F6]"
            />
          </div>
          <div>
            <Label htmlFor="aboutUs" className="text-base font-medium text-[#0F172A]">About Us</Label>
            <p className="text-sm text-[#94A3B8] mb-2">
              This text appears on the homepage About Us section.
            </p>
            <Textarea
              id="aboutUs"
              value={formData.aboutUs}
              onChange={(e) => setFormData({ ...formData, aboutUs: e.target.value })}
              rows={6}
              className="bg-white border-[#E5E7EB] text-[#0F172A] focus:border-[#3B82F6]"
            />
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-[#3B82F6] text-white hover:bg-[#2563EB]">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}
