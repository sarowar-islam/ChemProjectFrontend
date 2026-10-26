import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  LogOut,
  Save,
  Loader2,
  Upload,
  BookOpen,
  Mail,
  Phone,
  Plus,
  X,
  User,
  GraduationCap,
  FileText,
  ExternalLink,
  LayoutDashboard,
  Settings,
  Info,
  Sparkles,
  Award,
  Calendar,
  ChevronRight,
  Eye,
  EyeOff,
  Share2,
  Trash2,
  Menu,
  XIcon,
  Briefcase,
  Building2,
  MapPin,
  CheckCircle,
  AlertCircle,
  Edit,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { teamService } from '@/services/team.service';
import { authService } from '@/services/auth.service';
import { scholarService, ScholarPublication, ScholarProfile } from '@/services';
import { TeamMember, SocialLink, CareerItem, EducationItem } from '@/services/types';
import RichTextEditor from '@/components/RichTextEditor';
import { stripHtml } from '@/lib/htmlUtils';

type ActiveSection =
  | 'dashboard'
  | 'profile'
  | 'position'
  | 'career'
  | 'education'
  | 'skills'
  | 'publications'
  | 'links'
  | 'settings';

const VALID_SECTIONS: ActiveSection[] = [
  'dashboard',
  'profile',
  'position',
  'career',
  'education',
  'skills',
  'publications',
  'links',
  'settings',
];

export default function AlumniDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [member, setMember] = useState<TeamMember | null>(null);
  const [publications, setPublications] = useState<ScholarPublication[]>([]);
  const [scholarProfile, setScholarProfile] = useState<ScholarProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pubsLoading, setPubsLoading] = useState(false);

  const getInitialSection = (): ActiveSection => {
    const sectionParam = searchParams.get('section') as ActiveSection | null;
    if (sectionParam && VALID_SECTIONS.includes(sectionParam)) {
      return sectionParam;
    }
    const saved = localStorage.getItem('alumni_active_section') as ActiveSection | null;
    if (saved && VALID_SECTIONS.includes(saved)) {
      return saved;
    }
    return 'dashboard';
  };

  const [activeSection, setActiveSectionState] = useState<ActiveSection>(getInitialSection);

  const setActiveSection = (section: ActiveSection) => {
    setActiveSectionState(section);
    localStorage.setItem('alumni_active_section', section);
    setSearchParams(section === 'dashboard' ? {} : { section }, { replace: true });
  };

  useEffect(() => {
    const sectionParam = searchParams.get('section') as ActiveSection | null;
    if (sectionParam && VALID_SECTIONS.includes(sectionParam)) {
      if (sectionParam !== activeSection) {
        setActiveSectionState(sectionParam);
        localStorage.setItem('alumni_active_section', sectionParam);
      }
    } else if (!sectionParam && activeSection !== 'dashboard') {
      setSearchParams({ section: activeSection }, { replace: true });
    }
  }, [searchParams, activeSection, setSearchParams]);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [googleScholarLink, setGoogleScholarLink] = useState('');
  const [orcid, setOrcid] = useState('');
  const [researchGate, setResearchGate] = useState('');
  const [personalWebsite, setPersonalWebsite] = useState('');
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [expertise, setExpertise] = useState<string[]>([]);
  const [newExpertise, setNewExpertise] = useState('');
  const [researchArea, setResearchArea] = useState('');

  // Current Position state
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentOrganization, setCurrentOrganization] = useState('');
  const [currentDepartment, setCurrentDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [currentPositionStartDate, setCurrentPositionStartDate] = useState('');
  const [currentPositionDescription, setCurrentPositionDescription] = useState('');

  // Career History state
  const [careerHistory, setCareerHistory] = useState<CareerItem[]>([]);
  const [newCareer, setNewCareer] = useState<CareerItem>({
    title: '',
    organization: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
  });

  // Education state
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [newEdu, setNewEdu] = useState<EducationItem>({
    degree: '',
    institution: '',
    department: '',
    graduationYear: '',
    thesis: '',
  });

  // Privacy preferences
  const [isEmailPublic, setIsEmailPublic] = useState(true);
  const [isContactPublic, setIsContactPublic] = useState(true);

  // Settings state
  const [settingsUsername, setSettingsUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');
  const [settingsError, setSettingsError] = useState('');

  const fetchPublications = async (memberId: string) => {
    setPubsLoading(true);
    const res = await scholarService.getMemberPublications(memberId);
    if (res.success && res.data) {
      if (res.data.success) {
        setPublications(res.data.publications || []);
        setScholarProfile(res.data.profile || null);
      }
    }
    setPubsLoading(false);
  };

  const getUsername = () => {
    if (user?.username) return user.username;
    const stored = authService.getStoredUser();
    if (stored?.username) return stored.username;
    try {
      const authUserStr = localStorage.getItem('auth_user');
      if (authUserStr) {
        const parsed = JSON.parse(authUserStr);
        if (parsed?.username) return parsed.username;
      }
    } catch (e) {}
    return '';
  };

  useEffect(() => {
    const fetchData = async () => {
      const uname = getUsername();
      if (!uname) return;

      const memberRes = await teamService.getMemberByUsername(uname);
      if (memberRes.success && memberRes.data) {
        const m = memberRes.data;
        setMember(m);
        setName(m.name || '');
        setEmail(m.email || '');
        setPhone(m.phone || '');
        setBio(m.bio || '');
        setPhotoUrl(m.photoUrl || '');
        setGoogleScholarLink(m.googleScholarLink || '');
        setOrcid(m.orcid || '');
        setResearchGate(m.researchGate || '');
        setPersonalWebsite(m.personalWebsite || '');
        setSocialLinks(m.socialLinks || []);
        setExpertise(m.expertise || []);
        setResearchArea(m.researchArea || '');
        setCurrentTitle(m.currentTitle || '');
        setCurrentOrganization(m.currentOrganization || '');
        setCurrentDepartment(m.currentDepartment || '');
        setLocation(m.location || '');
        setCurrentPositionStartDate(m.currentPositionStartDate || '');
        setCurrentPositionDescription(m.currentPositionDescription || '');
        setCareerHistory(m.careerHistory || []);
        setEducation(m.education || []);
        setIsEmailPublic(m.isEmailPublic ?? true);
        setIsContactPublic(m.isContactPublic ?? true);
        setSettingsUsername(m.username || '');

        if (m.googleScholarLink) {
          await fetchPublications(m.id);
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const uname = getUsername();
    if (!file || !uname) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const res = await teamService.uploadMemberPhoto(uname, file);
      if (res.success && res.data) {
        setPhotoUrl(res.data.photoUrl);
        setSuccessMessage('Photo uploaded successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert(res.error || 'Failed to upload photo.');
      }
    } catch (error) {
      alert('Failed to upload photo.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveAll = async () => {
    const uname = getUsername();
    if (!uname) {
      alert('User session not found. Please log in again.');
      return;
    }

    setSaving(true);
    setSuccessMessage('');

    const payload: Partial<TeamMember> = {
      name,
      email,
      phone,
      bio,
      photoUrl,
      googleScholarLink,
      orcid,
      researchGate,
      personalWebsite,
      socialLinks,
      expertise,
      researchArea,
      currentTitle,
      currentOrganization,
      currentDepartment,
      location,
      currentPositionStartDate,
      currentPositionDescription,
      careerHistory,
      education,
      isEmailPublic,
      isContactPublic,
    };

    try {
      const res = await teamService.updateMemberProfile(uname, payload);

      if (res.success && res.data) {
        setMember(res.data);
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorMsg = res.error || 'Failed to update profile in database.';
        setSuccessMessage('');
        alert(`Error: ${errorMsg}`);
      }
    } catch (err: any) {
      setSuccessMessage('');
      alert(`Database error: ${err?.message || 'Failed to store data in database.'}`);
    } finally {
      setSaving(false);
    }
  };

  const saveDirectUpdate = async (overrides: Partial<TeamMember>) => {
    const uname = getUsername();
    if (!uname) {
      alert('User session not found. Please log in again.');
      return;
    }
    setSaving(true);
    setSuccessMessage('');
    const payload: Partial<TeamMember> = {
      name,
      email,
      phone,
      bio,
      photoUrl,
      googleScholarLink,
      orcid,
      researchGate,
      personalWebsite,
      socialLinks,
      expertise,
      researchArea,
      currentTitle,
      currentOrganization,
      currentDepartment,
      location,
      currentPositionStartDate,
      currentPositionDescription,
      careerHistory,
      education,
      isEmailPublic,
      isContactPublic,
      ...overrides,
    };
    try {
      const res = await teamService.updateMemberProfile(uname, payload);
      if (res.success && res.data) {
        setMember(res.data);
        setSuccessMessage('Saved successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorMsg = res.error || 'Failed to save to database.';
        setSuccessMessage('');
        alert(`Error: ${errorMsg}`);
      }
    } catch (err: any) {
      setSuccessMessage('');
      alert(`Database error: ${err?.message || 'Failed to store data in database.'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddCareer = async () => {
    if (!newCareer.title || !newCareer.organization) {
      alert('Please enter job title and organization');
      return;
    }
    const updated = [...careerHistory, newCareer];
    setCareerHistory(updated);
    setNewCareer({ title: '', organization: '', startDate: '', endDate: '', isCurrent: false, description: '' });
    await saveDirectUpdate({ careerHistory: updated });
  };

  const handleRemoveCareer = async (index: number) => {
    const updated = careerHistory.filter((_, i) => i !== index);
    setCareerHistory(updated);
    await saveDirectUpdate({ careerHistory: updated });
  };

  const handleAddEducation = async () => {
    if (!newEdu.degree || !newEdu.institution) {
      alert('Please enter degree and institution');
      return;
    }
    const updated = [...education, newEdu];
    setEducation(updated);
    setNewEdu({ degree: '', institution: '', department: '', graduationYear: '', thesis: '' });
    await saveDirectUpdate({ education: updated });
  };

  const handleRemoveEducation = async (index: number) => {
    const updated = education.filter((_, i) => i !== index);
    setEducation(updated);
    await saveDirectUpdate({ education: updated });
  };

  const handleAddSocialLink = async () => {
    const updated = [...socialLinks, { platform: 'LinkedIn', url: '' }];
    setSocialLinks(updated);
    await saveDirectUpdate({ socialLinks: updated });
  };

  const handleUpdateSocialLink = async (index: number, field: 'platform' | 'url', value: string) => {
    const updated = [...socialLinks];
    updated[index][field] = value;
    setSocialLinks(updated);
    await saveDirectUpdate({ socialLinks: updated });
  };

  const handleRemoveSocialLink = async (index: number) => {
    const updated = socialLinks.filter((_, i) => i !== index);
    setSocialLinks(updated);
    await saveDirectUpdate({ socialLinks: updated });
  };

  const handleSaveSettings = async () => {
    if (!user?.username) return;

    setSettingsError('');
    setSettingsMessage('');

    if (newPassword) {
      if (newPassword !== confirmPassword) {
        setSettingsError('New passwords do not match');
        return;
      }
      if (newPassword.length < 6) {
        setSettingsError('Password must be at least 6 characters');
        return;
      }
      if (!currentPassword) {
        setSettingsError('Please enter your current password');
        return;
      }
    }

    setSavingSettings(true);
    try {
      const res = await teamService.updateMemberSettings(user.username, {
        name,
        username: settingsUsername,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      if (res.success && res.data) {
        setMember(res.data);
        setSettingsMessage('Settings updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSettingsMessage(''), 3000);
      } else {
        setSettingsError(res.error || 'Failed to update settings');
      }
    } catch (error) {
      setSettingsError('An error occurred.');
    }
    setSavingSettings(false);
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'profile', label: 'Profile Information', icon: User },
    { id: 'position', label: 'Current Position', icon: Briefcase },
    { id: 'career', label: 'Career History', icon: Building2 },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Research & Expertise', icon: Sparkles },
    { id: 'publications', label: 'Publications', icon: BookOpen },
    { id: 'links', label: 'Professional Links & Privacy', icon: Share2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const slug = member?.username || member?.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card text-foreground shadow-sm h-16 border-b border-border">
        <div className="h-full px-4 lg:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              {sidebarOpen ? <XIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 shrink-0">
                <img src="/photos/Logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="font-heading text-xs lg:text-sm font-semibold text-foreground">
                  Alumni Portal
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {slug && (
              <Link
                to={`/alumni/${slug}`}
                target="_blank"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Preview Public Profile
              </Link>
            )}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-border bg-secondary">
                <img
                  src={photoUrl || member?.photoUrl || '/photos/blank_profile.png'}
                  alt={member?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm font-medium hidden sm:inline text-foreground">{member?.name}</span>
            </div>
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

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-card border-r border-border z-40 transform transition-transform duration-200 ease-in-out overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4">
          <div className="mb-6 p-4 rounded-xl bg-secondary border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-border">
                <img
                  src={photoUrl || member?.photoUrl || '/photos/blank_profile.png'}
                  alt={member?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate">{member?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{currentTitle || 'Alumnus'}</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id as ActiveSection);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-accent text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="truncate">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-24 pb-16 min-h-screen">
        <div className="p-6 lg:p-8 max-w-5xl mx-auto">
          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-2 animate-fade-in">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. Overview Section */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-heading text-2xl lg:text-3xl text-foreground mb-1">
                    Welcome back, {member?.name?.split(' ')[0]}!
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Manage your alumni professional profile, career history, and publications.
                  </p>
                </div>
                {slug && (
                  <Link
                    to={`/alumni/${slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-primary-foreground rounded-xl text-sm font-medium hover:bg-accent/90 transition-colors shadow-sm w-fit"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Preview Public Profile
                  </Link>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-accent/15 text-accent">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-foreground truncate">{currentTitle || 'Not Set'}</p>
                      <p className="text-xs text-muted-foreground">Current Title</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-accent/15 text-accent">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{publications.length}</p>
                      <p className="text-xs text-muted-foreground">Publications</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-accent/15 text-accent">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{careerHistory.length}</p>
                      <p className="text-xs text-muted-foreground">Career Roles</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-accent/15 text-accent">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{education.length}</p>
                      <p className="text-xs text-muted-foreground">Degrees</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions / Status */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <h3 className="font-heading text-lg text-foreground mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-accent" />
                    Profile Completion Checklist
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Profile Photo</span>
                      {photoUrl ? <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">Complete</span> : <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full font-medium">Missing</span>}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Current Position</span>
                      {currentTitle && currentOrganization ? <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">Complete</span> : <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full font-medium">Incomplete</span>}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Biography</span>
                      {bio ? <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">Complete</span> : <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full font-medium">Missing</span>}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Google Scholar</span>
                      {googleScholarLink ? <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">Linked</span> : <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full font-medium">Not Linked</span>}
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading text-lg text-foreground mb-2">Quick Navigation</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Update your current career designation, add education history, or link your Google Scholar profile.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setActiveSection('position')}
                      className="px-4 py-2.5 bg-accent text-primary-foreground rounded-xl text-sm font-medium hover:bg-accent/90 transition-colors"
                    >
                      Update Current Position
                    </button>
                    <button
                      onClick={() => setActiveSection('career')}
                      className="px-4 py-2.5 bg-secondary text-secondary-foreground rounded-xl text-sm font-medium hover:bg-secondary/80 transition-colors border border-border"
                    >
                      Manage Career History
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Profile Information Section */}
          {activeSection === 'profile' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="font-heading text-2xl lg:text-3xl text-foreground mb-1">Profile Information</h1>
                <p className="text-muted-foreground text-sm">Update your name, photo, biography, and research interests.</p>
              </div>

              {/* Photo Upload */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h2 className="font-heading text-lg text-foreground mb-4">Profile Photo</h2>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-border shadow-md bg-secondary">
                    <img src={photoUrl || '/photos/blank_profile.png'} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="px-4 py-2.5 bg-accent text-primary-foreground rounded-xl text-sm font-medium hover:bg-accent/90 transition-colors flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {uploading ? 'Uploading...' : 'Upload New Photo'}
                    </button>
                    <p className="text-xs text-muted-foreground mt-2">Recommended: Square image, max 5MB.</p>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="font-heading text-lg text-foreground mb-4">Basic Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Primary Research Area</label>
                    <input
                      type="text"
                      value={researchArea}
                      onChange={(e) => setResearchArea(e.target.value)}
                      placeholder="e.g., Organic Synthesis & Catalysis"
                      className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Biography & Professional Background</label>
                  <RichTextEditor
                    value={bio}
                    onChange={setBio}
                    placeholder="Write your biography, professional background, and current interests..."
                    minHeight="200px"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="px-6 py-3 bg-accent text-primary-foreground rounded-xl font-medium hover:bg-accent/90 transition-colors flex items-center gap-2 shadow-sm"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* 3. Current Position Section */}
          {activeSection === 'position' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="font-heading text-2xl lg:text-3xl text-foreground mb-1">Current Position</h1>
                <p className="text-muted-foreground text-sm">Manage your current job title, organization, and work description.</p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Current Job Title / Designation *</label>
                    <input
                      type="text"
                      value={currentTitle}
                      onChange={(e) => setCurrentTitle(e.target.value)}
                      placeholder="e.g., Senior Research Scientist, Assistant Professor"
                      className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Company / University / Institution *</label>
                    <input
                      type="text"
                      value={currentOrganization}
                      onChange={(e) => setCurrentOrganization(e.target.value)}
                      placeholder="e.g., MIT, Pfizer, Max Planck Institute"
                      className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Department / Division</label>
                    <input
                      type="text"
                      value={currentDepartment}
                      onChange={(e) => setCurrentDepartment(e.target.value)}
                      placeholder="e.g., Department of Chemistry"
                      className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., Boston, MA, USA"
                      className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Starting Year / Date</label>
                    <input
                      type="text"
                      value={currentPositionStartDate}
                      onChange={(e) => setCurrentPositionStartDate(e.target.value)}
                      placeholder="e.g., 2024 or Jan 2024"
                      className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Work Description & Responsibilities</label>
                  <RichTextEditor
                    value={currentPositionDescription}
                    onChange={setCurrentPositionDescription}
                    placeholder="Describe your current role, research focus, or responsibilities..."
                    minHeight="160px"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="px-6 py-3 bg-accent text-primary-foreground rounded-xl font-medium hover:bg-accent/90 transition-colors flex items-center gap-2 shadow-sm"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Current Position
                </button>
              </div>
            </div>
          )}

          {/* 4. Career History Section */}
          {activeSection === 'career' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="font-heading text-2xl lg:text-3xl text-foreground mb-1">Career History</h1>
                <p className="text-muted-foreground text-sm">Add and manage previous professional positions and ongoing roles.</p>
              </div>

              {/* Existing Career Items */}
              {careerHistory.length > 0 && (
                <div className="space-y-4">
                  {careerHistory.map((career, index) => (
                    <div key={index} className="bg-card border border-border rounded-2xl p-5 flex items-start justify-between gap-4 shadow-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-foreground">{career.title}</h3>
                          <span className="text-xs bg-accent/15 text-accent px-2.5 py-0.5 rounded-full font-medium">
                            {career.startDate} {career.endDate ? `- ${career.endDate}` : career.isCurrent ? '- Present' : ''}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">{career.organization}</p>
                        {career.description && <p className="text-xs text-muted-foreground mt-1">{career.description}</p>}
                      </div>
                      <button
                        onClick={() => handleRemoveCareer(index)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Career Form */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="font-heading text-lg text-foreground mb-2 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-accent" />
                  Add Position
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Job Title *</label>
                    <input
                      type="text"
                      value={newCareer.title}
                      onChange={(e) => setNewCareer({ ...newCareer, title: e.target.value })}
                      placeholder="e.g., Postdoctoral Fellow"
                      className="w-full bg-card border border-border rounded-xl px-4 py-2 text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Organization / Company *</label>
                    <input
                      type="text"
                      value={newCareer.organization}
                      onChange={(e) => setNewCareer({ ...newCareer, organization: e.target.value })}
                      placeholder="e.g., University of Oxford"
                      className="w-full bg-card border border-border rounded-xl px-4 py-2 text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Start Date / Year</label>
                    <input
                      type="text"
                      value={newCareer.startDate}
                      onChange={(e) => setNewCareer({ ...newCareer, startDate: e.target.value })}
                      placeholder="e.g., 2022"
                      className="w-full bg-card border border-border rounded-xl px-4 py-2 text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">End Date / Year</label>
                    <input
                      type="text"
                      value={newCareer.endDate}
                      onChange={(e) => setNewCareer({ ...newCareer, endDate: e.target.value })}
                      placeholder="e.g., 2024"
                      disabled={newCareer.isCurrent}
                      className="w-full bg-card border border-border rounded-xl px-4 py-2 text-foreground text-sm disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isCurrent"
                    checked={newCareer.isCurrent || false}
                    onChange={(e) => setNewCareer({ ...newCareer, isCurrent: e.target.checked, endDate: e.target.checked ? '' : newCareer.endDate })}
                    className="rounded border-border text-accent focus:ring-accent"
                  />
                  <label htmlFor="isCurrent" className="text-sm text-foreground font-medium">I currently work here</label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Description / Responsibilities</label>
                  <textarea
                    value={newCareer.description || ''}
                    onChange={(e) => setNewCareer({ ...newCareer, description: e.target.value })}
                    rows={3}
                    placeholder="Key responsibilities and achievements..."
                    className="w-full bg-card border border-border rounded-xl p-3 text-foreground text-sm"
                  />
                </div>

                <button
                  onClick={handleAddCareer}
                  className="px-5 py-2.5 bg-secondary text-secondary-foreground rounded-xl text-sm font-medium hover:bg-secondary/80 transition-colors border border-border flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Position to List
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="px-6 py-3 bg-accent text-primary-foreground rounded-xl font-medium hover:bg-accent/90 transition-colors flex items-center gap-2 shadow-sm"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Career History
                </button>
              </div>
            </div>
          )}

          {/* 5. Education Section */}
          {activeSection === 'education' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="font-heading text-2xl lg:text-3xl text-foreground mb-1">Education</h1>
                <p className="text-muted-foreground text-sm">Manage your degrees, institutions, departments, and thesis information.</p>
              </div>

              {education.length > 0 && (
                <div className="space-y-4">
                  {education.map((edu, index) => (
                    <div key={index} className="bg-card border border-border rounded-2xl p-5 flex items-start justify-between gap-4 shadow-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-foreground">{edu.degree}</h3>
                          {edu.graduationYear && (
                            <span className="text-xs bg-accent/15 text-accent px-2.5 py-0.5 rounded-full font-medium">
                              Graduated {edu.graduationYear}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">{[edu.institution, edu.department].filter(Boolean).join(' • ')}</p>
                        {edu.thesis && <p className="text-xs text-muted-foreground italic mt-1">Thesis: {edu.thesis}</p>}
                      </div>
                      <button
                        onClick={() => handleRemoveEducation(index)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="font-heading text-lg text-foreground mb-2 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-accent" />
                  Add Degree / Education
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Degree *</label>
                    <input
                      type="text"
                      value={newEdu.degree}
                      onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                      placeholder="e.g., Ph.D. in Chemistry"
                      className="w-full bg-card border border-border rounded-xl px-4 py-2 text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Institution / University *</label>
                    <input
                      type="text"
                      value={newEdu.institution}
                      onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })}
                      placeholder="e.g., CUET"
                      className="w-full bg-card border border-border rounded-xl px-4 py-2 text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Department</label>
                    <input
                      type="text"
                      value={newEdu.department}
                      onChange={(e) => setNewEdu({ ...newEdu, department: e.target.value })}
                      placeholder="e.g., Department of Chemistry"
                      className="w-full bg-card border border-border rounded-xl px-4 py-2 text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Graduation Year</label>
                    <input
                      type="text"
                      value={newEdu.graduationYear}
                      onChange={(e) => setNewEdu({ ...newEdu, graduationYear: e.target.value })}
                      placeholder="e.g., 2023"
                      className="w-full bg-card border border-border rounded-xl px-4 py-2 text-foreground text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Thesis Title / Summary (Optional)</label>
                  <textarea
                    value={newEdu.thesis || ''}
                    onChange={(e) => setNewEdu({ ...newEdu, thesis: e.target.value })}
                    rows={2}
                    placeholder="Thesis title..."
                    className="w-full bg-card border border-border rounded-xl p-3 text-foreground text-sm"
                  />
                </div>

                <button
                  onClick={handleAddEducation}
                  className="px-5 py-2.5 bg-secondary text-secondary-foreground rounded-xl text-sm font-medium hover:bg-secondary/80 transition-colors border border-border flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Education to List
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="px-6 py-3 bg-accent text-primary-foreground rounded-xl font-medium hover:bg-accent/90 transition-colors flex items-center gap-2 shadow-sm"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Education History
                </button>
              </div>
            </div>
          )}

          {/* 6. Research & Expertise Section */}
          {activeSection === 'skills' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="font-heading text-2xl lg:text-3xl text-foreground mb-1">Research & Expertise</h1>
                <p className="text-muted-foreground text-sm">Manage your research interests and professional skills.</p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Primary Research Area / Focus</label>
                  <input
                    type="text"
                    value={researchArea}
                    onChange={(e) => setResearchArea(e.target.value)}
                    placeholder="e.g., Catalysis, Organic Synthesis, Nanomaterials"
                    className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Skills & Professional Expertise</label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {expertise.map((skill) => (
                      <span key={skill} className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-accent/15 text-accent rounded-full text-sm font-medium">
                        {skill}
                        <button
                          onClick={() => setExpertise(expertise.filter((s) => s !== skill))}
                          className="hover:bg-secondary rounded-full p-0.5 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                    {expertise.length === 0 && <p className="text-sm text-muted-foreground italic">No skills added yet.</p>}
                  </div>

                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newExpertise}
                      onChange={(e) => setNewExpertise(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newExpertise.trim() && !expertise.includes(newExpertise.trim())) {
                            setExpertise([...expertise, newExpertise.trim()]);
                            setNewExpertise('');
                          }
                        }
                      }}
                      placeholder="Add a skill (e.g., NMR Spectroscopy, HPLC)..."
                      className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <button
                      onClick={() => {
                        if (newExpertise.trim() && !expertise.includes(newExpertise.trim())) {
                          setExpertise([...expertise, newExpertise.trim()]);
                          setNewExpertise('');
                        }
                      }}
                      className="px-5 py-2.5 bg-accent text-primary-foreground rounded-xl text-sm font-medium hover:bg-accent/90 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Skill
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="px-6 py-3 bg-accent text-primary-foreground rounded-xl font-medium hover:bg-accent/90 transition-colors flex items-center gap-2 shadow-sm"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Expertise
                </button>
              </div>
            </div>
          )}

          {/* 7. Publications Section */}
          {activeSection === 'publications' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-heading text-2xl lg:text-3xl text-foreground mb-1">Publications</h1>
                  <p className="text-muted-foreground text-sm">Your publications synced from Google Scholar.</p>
                </div>
                {googleScholarLink && (
                  <button
                    onClick={() => member && fetchPublications(member.id)}
                    disabled={pubsLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-xl text-sm font-medium hover:bg-secondary/80 transition-colors border border-border"
                  >
                    <RefreshCw className={`w-4 h-4 ${pubsLoading ? 'animate-spin' : ''}`} />
                    Refresh from Scholar
                  </button>
                )}
              </div>

              {pubsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-accent" />
                </div>
              ) : publications.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-8 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <h3 className="font-heading text-lg text-foreground mb-1">No Publications Found</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {googleScholarLink ? 'No publications found on your Google Scholar profile.' : 'Link your Google Scholar profile in Professional Links & Privacy to display publications.'}
                  </p>
                  {!googleScholarLink && (
                    <button
                      onClick={() => setActiveSection('links')}
                      className="text-sm text-accent hover:underline font-medium"
                    >
                      Link Google Scholar →
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {publications.map((pub, index) => (
                    <div key={index} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                      <h3 className="font-medium text-foreground mb-1">{pub.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{pub.authors?.join(', ')}</p>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground italic">
                        <span>{pub.journal} • {pub.year}</span>
                        {pub.citedBy && parseInt(pub.citedBy) > 0 && (
                          <span className="bg-accent/15 text-accent px-2 py-0.5 rounded-full not-italic font-semibold">
                            Cited by {pub.citedBy}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 8. Professional Links & Privacy Section */}
          {activeSection === 'links' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="font-heading text-2xl lg:text-3xl text-foreground mb-1">Professional Links & Privacy</h1>
                <p className="text-muted-foreground text-sm">Manage your academic profiles, social links, and public contact preferences.</p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="font-heading text-lg text-foreground mb-2">Academic & Professional Profiles</h2>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Google Scholar Profile URL</label>
                  <input
                    type="url"
                    value={googleScholarLink}
                    onChange={(e) => setGoogleScholarLink(e.target.value)}
                    placeholder="https://scholar.google.com/citations?user=..."
                    className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-foreground text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">ORCID ID or URL</label>
                  <input
                    type="text"
                    value={orcid}
                    onChange={(e) => setOrcid(e.target.value)}
                    placeholder="e.g., 0000-0002-1825-0097"
                    className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-foreground text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">ResearchGate Profile URL</label>
                  <input
                    type="url"
                    value={researchGate}
                    onChange={(e) => setResearchGate(e.target.value)}
                    placeholder="https://www.researchgate.net/profile/..."
                    className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-foreground text-sm"
                  />
                </div>
                
              </div>

              {/* Social Media Links */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading text-lg text-foreground flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-accent" />
                    Social Media Links
                  </h2>
                  <button
                    type="button"
                    onClick={handleAddSocialLink}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Link
                  </button>
                </div>

                {socialLinks.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No social media links added yet.</p>
                ) : (
                  <div className="space-y-3">
                    {socialLinks.map((link, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <select
                          value={link.platform}
                          onChange={(e) => handleUpdateSocialLink(index, 'platform', e.target.value)}
                          className="bg-card border border-border rounded-xl px-3 py-2.5 text-foreground text-sm w-36"
                        >
                          <option value="LinkedIn">LinkedIn</option>
                          <option value="Facebook">Facebook</option>
                          <option value="Instagram">Instagram</option>
                          <option value="Twitter">Twitter / X</option>
                          <option value="GitHub">GitHub</option>
                          <option value="YouTube">YouTube</option>
                          <option value="ResearchGate">ResearchGate</option>
                          <option value="Website">Website</option>
                          <option value="Other">Other</option>
                        </select>
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => handleUpdateSocialLink(index, 'url', e.target.value)}
                          placeholder="https://..."
                          className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 text-foreground text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSocialLink(index)}
                          className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Privacy Preferences */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="font-heading text-lg text-foreground mb-2">Privacy & Contact Visibility</h2>
                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary">
                  <div>
                    <p className="font-medium text-foreground text-sm">Make Email Public</p>
                    <p className="text-xs text-muted-foreground">Allow visitors on the alumni details page to view and email you.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isEmailPublic}
                    onChange={(e) => setIsEmailPublic(e.target.checked)}
                    className="w-5 h-5 rounded border-border text-accent focus:ring-accent"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="px-6 py-3 bg-accent text-primary-foreground rounded-xl font-medium hover:bg-accent/90 transition-colors flex items-center gap-2 shadow-sm"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Links & Privacy
                </button>
              </div>
            </div>
          )}

          {/* 9. Settings Section */}
          {activeSection === 'settings' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="font-heading text-2xl lg:text-3xl text-foreground mb-1">Settings</h1>
                <p className="text-muted-foreground text-sm">Manage your account username and change password.</p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="font-heading text-lg text-foreground mb-2">Account Credentials</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Username (Login ID)</label>
                    <input
                      type="text"
                      value={settingsUsername}
                      onChange={(e) => setSettingsUsername(e.target.value)}
                      className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-foreground text-sm"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border space-y-4 max-w-md">
                  <h3 className="font-medium text-foreground">Change Password</h3>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Current Password</label>
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-foreground text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">New Password</label>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-foreground text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-foreground text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {settingsMessage && <p className="text-sm text-emerald-600 font-medium">✓ {settingsMessage}</p>}
                {settingsError && <p className="text-sm text-red-600 font-medium">✗ {settingsError}</p>}

                <div className="pt-4">
                  <button
                    onClick={handleSaveSettings}
                    disabled={savingSettings}
                    className="px-6 py-3 bg-accent text-primary-foreground rounded-xl font-medium hover:bg-accent/90 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
