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

const DESIGNATION_OPTIONS = [
  'Faculty',
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Post Doctoral Researcher',
  'PhD Student',
  'M.Phil Student',
  'M.Sc Student',
  'MSc Student Researcher',
  "Master's Fellowship",
  'Research Associate',
  'Research Assistant',
  'Research Assistant (RA)',
  'BSc Student',
  'Visiting Researcher',
  'Lab Technician',
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
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground sticky top-0 z-50">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 hover:bg-primary-foreground/10 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary-foreground/10">
                <FlaskConical className="w-5 h-5" />
              </div>
              <span className="font-heading font-semibold hidden sm:inline">
                Prof. Dr. Yunus Ahmed Research Group
              </span>
            </Link>
            <span className="text-primary-foreground/50 hidden sm:inline">|</span>
            <span className="text-sm hidden sm:inline">Admin Panel</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-primary-foreground/70 hidden sm:inline">
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors text-sm"
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
          className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-auto bg-card border-r border-border transition-all duration-300 flex flex-col pt-16 lg:pt-0 ${
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
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-sm"
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
      <h2 className="font-heading text-2xl text-primary mb-6">Overview</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="stat-card animate-pulse">
              <div className="h-10 w-20 bg-muted rounded mb-2" />
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
          ))
        ) : (
          <>
            <div className="stat-card">
              <div className="stat-number">{stats.totalProjects}</div>
              <div className="stat-label">Total Projects</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.totalPublications}</div>
              <div className="stat-label">Publications</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.totalMembers}</div>
              <div className="stat-label">Team Members</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.ongoingProjects}</div>
              <div className="stat-label">Ongoing Projects</div>
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
        <h2 className="font-heading text-2xl text-primary">Projects</h2>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card-academic p-4 animate-pulse">
              <div className="h-5 w-2/3 bg-muted rounded mb-2" />
              <div className="h-4 w-full bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No projects yet. Click "Add Project" to create one.
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="card-academic p-4 flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-4">
                <h3 className="font-medium text-foreground truncate">{project.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{project.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  project.status === 'ongoing' ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'
                }`}>
                  {project.status}
                </span>
                <button onClick={() => openEditModal(project)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <Edit className="w-4 h-4 text-muted-foreground" />
                </button>
                <button onClick={() => handleDelete(project.id)} className="p-2 hover:bg-destructive/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProject ? 'Edit Project' : 'Add Project'}</DialogTitle>
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
    designation: '',
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
      designation: '',
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
      designation: member.designation,
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
          designation: formData.designation,
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
          designation: formData.designation,
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
        <h2 className="font-heading text-2xl text-primary">Team Members</h2>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card-academic p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-muted rounded-full" />
                <div className="flex-1">
                  <div className="h-4 w-24 bg-muted rounded mb-1" />
                  <div className="h-3 w-20 bg-muted rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No members yet. Click "Add Member" to add one.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <div key={member.id} className="card-academic p-4">
              <div className="flex items-center gap-3">
                <img
                  src={member.photoUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'}
                  alt={member.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">{member.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{member.designation || 'No designation'}</p>
                  <p className="text-xs text-muted-foreground/70 truncate">@{member.username}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEditModal(member)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <Edit className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => handleDelete(member.id)} className="p-2 hover:bg-destructive/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingMember ? 'Edit Member' : 'Add Member'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="username">Username *</Label>
              <Input 
                id="username" 
                value={formData.username} 
                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '') })} 
                placeholder="Enter username (for login)"
                disabled={!!editingMember}
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
              <Label htmlFor="designation">Designation *</Label>
              <Select value={formData.designation} onValueChange={(v) => setFormData({ ...formData, designation: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  {DESIGNATION_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        <h2 className="font-heading text-2xl text-primary">News</h2>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add News
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card-academic p-4 animate-pulse">
              <div className="h-5 w-2/3 bg-muted rounded mb-2" />
              <div className="h-4 w-full bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No news yet. Click "Add News" to publish one.
        </div>
      ) : (
        <div className="space-y-4">
          {news.map((item) => (
            <div key={item.id} className="card-academic p-4 flex items-start justify-between">
              <div className="flex-1 min-w-0 mr-4">
                <h3 className="font-medium text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {item.summary || item.content.substring(0, 150)}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>{new Date(item.date).toLocaleDateString()}</span>
                  {item.author && <span>by {item.author}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEditModal(item)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <Edit className="w-4 h-4 text-muted-foreground" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-destructive/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingNews ? 'Edit News' : 'Add News'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="summary">Summary</Label>
              <Input id="summary" value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} placeholder="Brief summary for preview" />
            </div>
            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea id="content" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={6} />
            </div>
            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
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
        <h2 className="font-heading text-2xl text-primary">Notices</h2>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Notice
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card-academic p-4 animate-pulse">
              <div className="h-5 w-2/3 bg-muted rounded mb-2" />
              <div className="h-4 w-full bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : notices.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No notices yet. Click "Add Notice" to create one.
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div key={notice.id} className="card-academic p-4 flex items-start justify-between">
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-foreground">{notice.title}</h3>
                  {notice.priority === 'important' && (
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-destructive/10 text-destructive">
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
                <button onClick={() => openEditModal(notice)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <Edit className="w-4 h-4 text-muted-foreground" />
                </button>
                <button onClick={() => handleDelete(notice.id)} className="p-2 hover:bg-destructive/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingNotice ? 'Edit Notice' : 'Add Notice'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea id="content" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={4} />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v as 'normal' | 'important' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="card-academic p-6 space-y-4 animate-pulse">
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="h-10 w-full bg-muted rounded" />
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="h-24 w-full bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-heading text-2xl text-primary mb-6">Site Settings</h2>
      <div className="card-academic p-6 max-w-2xl">
        <div className="space-y-6">
          <div>
            <Label htmlFor="googleScholarUrl" className="text-base font-medium">Google Scholar Profile URL</Label>
            <p className="text-sm text-muted-foreground mb-2">
              This URL is used to fetch publications for the Publications page.
            </p>
            <Input
              id="googleScholarUrl"
              value={formData.googleScholarUrl}
              onChange={(e) => setFormData({ ...formData, googleScholarUrl: e.target.value })}
              placeholder="https://scholar.google.com/citations?user=..."
            />
          </div>
          <div>
            <Label htmlFor="aboutUs" className="text-base font-medium">About Us</Label>
            <p className="text-sm text-muted-foreground mb-2">
              This text appears on the homepage About Us section.
            </p>
            <Textarea
              id="aboutUs"
              value={formData.aboutUs}
              onChange={(e) => setFormData({ ...formData, aboutUs: e.target.value })}
              rows={6}
            />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}
