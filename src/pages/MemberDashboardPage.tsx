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
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { teamService } from '@/services/team.service';
import { scholarService, ScholarPublication, ScholarProfile } from '@/services';
import { TeamMember, SocialLink } from '@/services/types';
import RichTextEditor from '@/components/RichTextEditor';
import { stripHtml } from '@/lib/htmlUtils';

type ActiveSection = 'dashboard' | 'publications' | 'skills' | 'info' | 'settings';
const VALID_SECTIONS: ActiveSection[] = ['dashboard', 'publications', 'skills', 'info', 'settings'];

export default function MemberDashboardPage() {
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

  const getInitialSection = (): ActiveSection => {
    const sectionParam = searchParams.get('section') as ActiveSection | null;
    if (sectionParam && VALID_SECTIONS.includes(sectionParam)) {
      return sectionParam;
    }
    const saved = localStorage.getItem('member_active_section') as ActiveSection | null;
    if (saved && VALID_SECTIONS.includes(saved)) {
      return saved;
    }
    return 'dashboard';
  };

  const [activeSection, setActiveSectionState] = useState<ActiveSection>(getInitialSection);

  const setActiveSection = (section: ActiveSection) => {
    setActiveSectionState(section);
    localStorage.setItem('member_active_section', section);
    setSearchParams(section === 'dashboard' ? {} : { section }, { replace: true });
  };

  useEffect(() => {
    const sectionParam = searchParams.get('section') as ActiveSection | null;
    if (sectionParam && VALID_SECTIONS.includes(sectionParam)) {
      if (sectionParam !== activeSection) {
        setActiveSectionState(sectionParam);
        localStorage.setItem('member_active_section', sectionParam);
      }
    } else if (!sectionParam && activeSection !== 'dashboard') {
      setSearchParams({ section: activeSection }, { replace: true });
    }
  }, [searchParams, activeSection, setSearchParams]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pubsLoading, setPubsLoading] = useState(false);

  // Form state for Info section
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [googleScholarLink, setGoogleScholarLink] = useState('');
  const [orcid, setOrcid] = useState('');
  const [researchGate, setResearchGate] = useState('');
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [expertise, setExpertise] = useState<string[]>([]);
  const [newExpertise, setNewExpertise] = useState('');

  const handleAddSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: 'LinkedIn', url: '' }]);
  };

  const handleUpdateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    const updated = [...socialLinks];
    updated[index][field] = value;
    setSocialLinks(updated);
  };

  const handleRemoveSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  // Settings form state
  const [settingsName, setSettingsName] = useState('');
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

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.username) return;

      const memberRes = await teamService.getMemberByUsername(user.username);
      if (memberRes.success && memberRes.data) {
        setMember(memberRes.data);
        setEmail(memberRes.data.email || '');
        setPhone(memberRes.data.phone || '');
        setBio(memberRes.data.bio);
        setPhotoUrl(memberRes.data.photoUrl);
        setGoogleScholarLink(memberRes.data.googleScholarLink || '');
        setOrcid(memberRes.data.orcid || '');
        setResearchGate(memberRes.data.researchGate || '');
        setSocialLinks(memberRes.data.socialLinks || []);
        setExpertise(memberRes.data.expertise || []);
        setSettingsName(memberRes.data.name);
        setSettingsUsername(memberRes.data.username);

        if (memberRes.data.googleScholarLink) {
          await fetchPublications(memberRes.data.id);
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
    if (!file || !user?.username) return;

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
      const res = await teamService.uploadMemberPhoto(user.username, file);
      if (res.success && res.data) {
        setPhotoUrl(res.data.photoUrl);
        setSuccessMessage('Photo uploaded successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert(res.error || 'Failed to upload photo. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddExpertise = () => {
    if (newExpertise.trim() && !expertise.includes(newExpertise.trim())) {
      setExpertise([...expertise, newExpertise.trim()]);
      setNewExpertise('');
    }
  };

  const handleRemoveExpertise = (item: string) => {
    setExpertise(expertise.filter((e) => e !== item));
  };

  const handleSaveInfo = async () => {
    if (!user?.username) return;

    setSaving(true);
    setSuccessMessage('');

    const res = await teamService.updateMemberProfile(user.username, {
      email,
      phone,
      bio,
      photoUrl,
      googleScholarLink,
      orcid,
      researchGate,
      expertise,
      socialLinks,
    });

    if (res.success && res.data) {
      setMember(res.data);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }

    setSaving(false);
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
        name: settingsName,
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
      setSettingsError('An error occurred. Please try again.');
    }

    setSavingSettings(false);
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'publications', label: 'Publications', icon: BookOpen },
    { id: 'skills', label: 'Skills & Expertise', icon: Sparkles },
    { id: 'info', label: 'Profile Info', icon: Info },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

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
                <img
                  src="/photos/Logo.png"
                  alt="Yunus Ahmed Lab logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <div className="flex flex-col leading-tight">
                  <span className="font-heading text-xs lg:text-sm font-semibold text-foreground">
                    <span>Biochemical and </span>
                    <span className="text-[#15803D]">Environmental</span>
                  </span>
                  <span className="text-[9px] lg:text-[10px] uppercase tracking-[0.3em] text-[#15803D] font-medium mt-0.5">
                    Research Lab
                  </span>
                </div>
                <span className="text-muted-foreground">|</span>
                <span className="text-xs text-muted-foreground">Member Portal</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-border bg-secondary">
                <img
                  src={photoUrl || member?.photoUrl || '/photos/blank_profile.png'}
                  alt={member?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm font-medium hidden sm:inline text-foreground">
                {member?.name}
              </span>
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
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-card border-r border-border z-40 transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4">
          <div className="mb-6 p-4 rounded-xl bg-secondary border border-secondary-foreground/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-secondary-foreground/20">
                <img
                  src={photoUrl || member?.photoUrl || '/photos/blank_profile.png'}
                  alt={member?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate">{member?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{member?.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="w-3 h-3" />
              <span className="truncate">{member?.email}</span>
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-accent text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-8 min-h-screen">
        <div className="p-6 lg:p-8 max-w-5xl">
          {activeSection === 'dashboard' && (
            <div className="animate-fade-in">
              <h1 className="font-heading text-2xl lg:text-3xl text-foreground mb-2">
                Welcome back, {member?.name?.split(' ')[0]}!
              </h1>
              <p className="text-muted-foreground mb-4">
                Here's an overview of your profile and research activities.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-accent/15 text-accent">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{publications.length}</p>
                      <p className="text-sm text-muted-foreground">Publications</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-[#DCFCE7] text-[#22C55E]">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {scholarProfile?.totalCitations || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Citations</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-accent/15 text-accent">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{expertise.length}</p>
                      <p className="text-sm text-muted-foreground">Skills</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-[#FEF3C7] text-[#F59E0B]">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {scholarProfile?.hIndex || '-'}
                      </p>
                      <p className="text-sm text-muted-foreground">H-Index</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'publications' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="font-heading text-2xl lg:text-3xl text-foreground mb-2">Publications</h1>
                  <p className="text-muted-foreground">
                    Your publications from Google Scholar
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'skills' && (
            <div className="animate-fade-in">
              <h1 className="font-heading text-2xl lg:text-3xl text-foreground mb-2">Skills & Expertise</h1>
              <p className="text-muted-foreground mb-4">Manage your areas of expertise and skills</p>
            </div>
          )}

          {/* Info Section */}
          {activeSection === 'info' && (
            <div className="animate-fade-in">
              <h1 className="font-heading text-2xl lg:text-3xl text-foreground mb-2">Profile Information</h1>
              <p className="text-muted-foreground mb-4">
                Update your profile details, contact information, and academic profiles (ORCID, ResearchGate, Google Scholar)
              </p>

              <div className="space-y-6">
                {/* Profile Photo */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <h2 className="font-heading text-lg text-foreground mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-accent" />
                    Profile Photo
                  </h2>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-border shadow-lg bg-secondary">
                      {photoUrl ? (
                        <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-primary-foreground rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
                      >
                        <Upload className="w-4 h-4" />
                        {uploading ? 'Uploading...' : 'Upload New Photo'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <h2 className="font-heading text-lg text-foreground mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-accent" />
                    Contact Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-card border border-border rounded-lg px-4 py-2 text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-card border border-border rounded-lg px-4 py-2 text-foreground"
                      />
                    </div>
                  </div>
                </div>

                {/* Biography */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <h2 className="font-heading text-lg text-foreground mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-accent" />
                    Biography / About Info
                  </h2>
                  <RichTextEditor
                    value={bio}
                    onChange={setBio}
                    placeholder="Write a short biography about yourself..."
                    minHeight="220px"
                  />
                </div>

                {/* Academic Profiles (Google Scholar, ORCID, ResearchGate) */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
                  <h2 className="font-heading text-lg text-foreground mb-2 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-accent" />
                    Academic Profiles (Google Scholar, ORCID, ResearchGate)
                  </h2>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Google Scholar Profile URL</label>
                    <input
                      type="url"
                      value={googleScholarLink}
                      onChange={(e) => setGoogleScholarLink(e.target.value)}
                      className="w-full bg-card border border-border rounded-lg px-4 py-2 text-foreground"
                      placeholder="https://scholar.google.com/citations?user=..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">ORCID ID or Profile URL</label>
                    <input
                      type="text"
                      value={orcid}
                      onChange={(e) => setOrcid(e.target.value)}
                      className="w-full bg-card border border-border rounded-lg px-4 py-2 text-foreground"
                      placeholder="0000-0002-1825-0097 or https://orcid.org/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">ResearchGate Profile URL</label>
                    <input
                      type="url"
                      value={researchGate}
                      onChange={(e) => setResearchGate(e.target.value)}
                      className="w-full bg-card border border-border rounded-lg px-4 py-2 text-foreground"
                      placeholder="https://www.researchgate.net/profile/..."
                    />
                  </div>
                </div>

                {/* Social Media Links */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-heading text-lg text-foreground flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-accent" />
                      Social Media Links
                    </h2>
                    <button
                      type="button"
                      onClick={handleAddSocialLink}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
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
                            className="bg-card border border-border rounded-lg px-3 py-2 text-foreground text-sm w-36"
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
                            className="flex-1 bg-card border border-border rounded-lg px-4 py-2 text-foreground text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveSocialLink(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Save Button */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleSaveInfo}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-accent text-primary-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save All Changes
                  </button>
                  {successMessage && (
                    <span className="text-sm text-[#22C55E] font-medium bg-[#DCFCE7] px-4 py-2 rounded-lg">
                      ✓ {successMessage}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="animate-fade-in">
              <h1 className="font-heading text-2xl lg:text-3xl text-foreground mb-2">Settings</h1>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
