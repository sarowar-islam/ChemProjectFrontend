import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FlaskConical,
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
  Menu,
  XIcon,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { teamService } from '@/services/team.service';
import { scholarService, ScholarPublication, ScholarProfile } from '@/services';
import { TeamMember } from '@/services/types';

type ActiveSection = 'dashboard' | 'publications' | 'skills' | 'info' | 'settings';

export default function MemberDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [member, setMember] = useState<TeamMember | null>(null);
  const [publications, setPublications] = useState<ScholarPublication[]>([]);
  const [scholarProfile, setScholarProfile] = useState<ScholarProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pubsLoading, setPubsLoading] = useState(false);

  // Form state for Info section
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [googleScholarLink, setGoogleScholarLink] = useState('');
  const [expertise, setExpertise] = useState<string[]>([]);
  const [newExpertise, setNewExpertise] = useState('');

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
        setGoogleScholarLink(memberRes.data.googleScholarLink);
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
      expertise,
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

    // Validate password if changing
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
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <Loader2 className="w-8 h-8 animate-spin text-[#FACC15]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1E293B] text-[#F8FAFC] shadow-lg h-16 border-b border-[#CBD5E1]/[0.18]">
        <div className="h-full px-4 lg:px-6 flex items-center justify-between">
          {/* Left: Logo & Menu toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-[#0F172A]/50 transition-colors"
            >
              {sidebarOpen ? <XIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/" className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#FACC15]/10">
                <FlaskConical className="w-5 h-5 text-[#FACC15]" />
              </div>
              <div className="hidden sm:block">
                <span className="font-heading font-semibold text-sm text-[#F8FAFC]">
                  Prof. Dr. Yunus Research Group
                </span>
                <span className="text-[#94A3B8] mx-2">|</span>
                <span className="text-xs text-[#CBD5E1]">Member Portal</span>
              </div>
            </Link>
          </div>

          {/* Right: Profile & Logout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#CBD5E1]/30 bg-[#0F172A]">
                {(photoUrl || member?.photoUrl) ? (
                  <img
                    src={photoUrl || member?.photoUrl}
                    alt={member?.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-5 h-5 text-[#94A3B8]" />
                  </div>
                )}
              </div>
              <span className="text-sm font-medium hidden sm:inline text-[#F8FAFC]">
                {member?.name}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0F172A]/50 hover:bg-[#0F172A] transition-colors text-sm text-[#F8FAFC]"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-[#1E293B] border-r border-[#CBD5E1]/[0.18] z-40 transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4">
          {/* Member Info Card */}
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-[#FACC15]/5 to-[#FACC15]/10 border border-[#FACC15]/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#FACC15]/20">
                {(photoUrl || member?.photoUrl) ? (
                  <img
                    src={photoUrl || member?.photoUrl}
                    alt={member?.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#0F172A] flex items-center justify-center">
                    <User className="w-6 h-6 text-[#94A3B8]" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#F8FAFC] text-sm truncate">{member?.name}</p>
                <p className="text-xs text-[#94A3B8] truncate">{member?.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
              <Mail className="w-3 h-3" />
              <span className="truncate">{member?.email}</span>
            </div>
          </div>

          {/* Navigation */}
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
                      ? 'bg-[#FACC15] text-[#0F172A] shadow-md'
                      : 'text-[#94A3B8] hover:bg-[#0F172A] hover:text-[#F8FAFC]'
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
      <main className="lg:ml-64 pt-16 min-h-screen">
        <div className="p-6 lg:p-8 max-w-5xl">
          {/* Dashboard Section */}
          {activeSection === 'dashboard' && (
            <div className="animate-fade-in">
              <h1 className="font-heading text-2xl lg:text-3xl text-[#F8FAFC] mb-2">
                Welcome back, {member?.name?.split(' ')[0]}!
              </h1>
              <p className="text-[#94A3B8] mb-8">
                Here's an overview of your profile and research activities.
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-[#1E293B] border border-[#CBD5E1]/[0.18] rounded-xl p-5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-[#FACC15]/10 text-[#FACC15]">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#F8FAFC]">{publications.length}</p>
                      <p className="text-sm text-[#94A3B8]">Publications</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#1E293B] border border-[#CBD5E1]/[0.18] rounded-xl p-5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-green-900/30 text-green-400">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#F8FAFC]">
                        {scholarProfile?.totalCitations || 0}
                      </p>
                      <p className="text-sm text-[#94A3B8]">Total Citations</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#1E293B] border border-[#CBD5E1]/[0.18] rounded-xl p-5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-900/30 text-blue-400">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#F8FAFC]">{expertise.length}</p>
                      <p className="text-sm text-[#94A3B8]">Skills</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#1E293B] border border-[#CBD5E1]/[0.18] rounded-xl p-5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-amber-900/30 text-amber-400">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#F8FAFC]">
                        {scholarProfile?.hIndex || '-'}
                      </p>
                      <p className="text-sm text-[#94A3B8]">H-Index</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Info Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Completion */}
                <div className="bg-[#1E293B] border border-[#CBD5E1]/[0.18] rounded-xl p-6">
                  <h3 className="font-heading text-lg text-[#F8FAFC] mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-[#FACC15]" />
                    Profile Status
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#94A3B8]">Photo</span>
                      {(photoUrl || member?.photoUrl) ? (
                        <span className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded-full">Complete</span>
                      ) : (
                        <span className="text-xs text-amber-400 bg-amber-900/30 px-2 py-1 rounded-full">Missing</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#94A3B8]">Biography</span>
                      {bio ? (
                        <span className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded-full">Complete</span>
                      ) : (
                        <span className="text-xs text-amber-400 bg-amber-900/30 px-2 py-1 rounded-full">Missing</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#94A3B8]">Google Scholar</span>
                      {googleScholarLink ? (
                        <span className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded-full">Linked</span>
                      ) : (
                        <span className="text-xs text-amber-400 bg-amber-900/30 px-2 py-1 rounded-full">Not Linked</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#94A3B8]">Skills</span>
                      {expertise.length > 0 ? (
                        <span className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded-full">{expertise.length} Added</span>
                      ) : (
                        <span className="text-xs text-amber-400 bg-amber-900/30 px-2 py-1 rounded-full">None Added</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Publications */}
                <div className="bg-[#1E293B] border border-[#CBD5E1]/[0.18] rounded-xl p-6">
                  <h3 className="font-heading text-lg text-[#F8FAFC] mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#FACC15]" />
                    Recent Publications
                  </h3>
                  {publications.length > 0 ? (
                    <div className="space-y-3">
                      {publications.slice(0, 3).map((pub, index) => (
                        <div key={index} className="text-sm">
                          <p className="font-medium text-[#F8FAFC] line-clamp-1">{pub.title}</p>
                          <p className="text-xs text-[#94A3B8]">{pub.year} • Cited by {pub.citedBy || 0}</p>
                        </div>
                      ))}
                      {publications.length > 3 && (
                        <button
                          onClick={() => setActiveSection('publications')}
                          className="text-sm text-[#FACC15] hover:underline font-medium"
                        >
                          View all {publications.length} publications →
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-[#94A3B8]">
                      {googleScholarLink ? 'No publications found.' : 'Link your Google Scholar to see publications.'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Publications Section */}
          {activeSection === 'publications' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="font-heading text-2xl lg:text-3xl text-[#F8FAFC] mb-2">Publications</h1>
                  <p className="text-[#94A3B8]">
                    Your publications from Google Scholar
                  </p>
                </div>
                {member?.googleScholarLink && (
                  <a
                    href={member.googleScholarLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#FACC15] text-[#0F172A] rounded-lg text-sm font-medium hover:bg-[#FDE047] transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline">View on Scholar</span>
                  </a>
                )}
              </div>

              {/* Scholar Stats */}
              {scholarProfile && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  <div className="bg-[#1E293B] border border-[#CBD5E1]/[0.18] rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-[#FACC15]">{scholarProfile.totalCitations || 0}</p>
                    <p className="text-xs text-[#94A3B8]">Citations</p>
                  </div>
                  <div className="bg-[#1E293B] border border-[#CBD5E1]/[0.18] rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-[#FACC15]">{scholarProfile.hIndex || 0}</p>
                    <p className="text-xs text-[#94A3B8]">H-Index</p>
                  </div>
                  <div className="bg-[#1E293B] border border-[#CBD5E1]/[0.18] rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-[#FACC15]">{scholarProfile.i10Index || 0}</p>
                    <p className="text-xs text-[#94A3B8]">i10-Index</p>
                  </div>
                  <div className="bg-[#1E293B] border border-[#CBD5E1]/[0.18] rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-[#FACC15]">{publications.length}</p>
                    <p className="text-xs text-[#94A3B8]">Publications</p>
                  </div>
                </div>
              )}

              {pubsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#FACC15]" />
                </div>
              ) : publications.length === 0 ? (
                <div className="bg-[#1E293B] border border-[#CBD5E1]/[0.18] rounded-xl p-8 text-center">
                  <BookOpen className="w-12 h-12 text-[#94A3B8]/50 mx-auto mb-4" />
                  <h3 className="font-heading text-lg text-[#F8FAFC] mb-2">No Publications Found</h3>
                  <p className="text-[#94A3B8] mb-4">
                    {googleScholarLink
                      ? 'No publications found on your Google Scholar profile.'
                      : 'Link your Google Scholar profile to display your publications.'}
                  </p>
                  {!googleScholarLink && (
                    <button
                      onClick={() => setActiveSection('info')}
                      className="inline-flex items-center gap-2 text-[#FACC15] hover:underline font-medium"
                    >
                      Add your Google Scholar link →
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {publications.map((pub, index) => (
                    <div key={index} className="bg-[#1E293B] border border-[#CBD5E1]/[0.18] rounded-xl p-5 hover:shadow-md transition-shadow">
                      <h3 className="font-medium text-[#F8FAFC] mb-2">{pub.title}</h3>
                      <p className="text-sm text-[#94A3B8] mb-3">{pub.authors.join(', ')}</p>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs text-[#94A3B8] italic">
                          {pub.journal} • {pub.year}
                        </span>
                        {pub.citedBy && parseInt(pub.citedBy) > 0 && (
                          <span className="text-xs bg-[#FACC15]/10 text-[#FACC15] px-2 py-0.5 rounded-full font-medium">
                            Cited by {pub.citedBy}
                          </span>
                        )}
                        {pub.articleUrl && (
                          <a
                            href={pub.articleUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-[#FACC15] hover:underline font-medium"
                          >
                            View Article
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Skills Section */}
          {activeSection === 'skills' && (
            <div className="animate-fade-in">
              <h1 className="font-heading text-2xl lg:text-3xl text-[#FACC15] mb-2">Skills & Expertise</h1>
              <p className="text-[#94A3B8] mb-8">
                Manage your areas of expertise and skills
              </p>

              <div className="bg-[#1E293B] border border-[#CBD5E1]/[0.18] rounded-xl p-6">
                <h2 className="font-heading text-lg text-[#F8FAFC] mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#FACC15]" />
                  Current Skills
                </h2>

                <div className="flex flex-wrap gap-2 mb-6">
                  {expertise.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#FACC15]/10 text-[#FACC15] rounded-full text-sm font-medium"
                    >
                      {item}
                      <button
                        onClick={() => handleRemoveExpertise(item)}
                        className="hover:bg-[#FACC15]/20 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                  {expertise.length === 0 && (
                    <p className="text-[#94A3B8]">
                      No skills added yet. Add your areas of expertise below.
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newExpertise}
                    onChange={(e) => setNewExpertise(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExpertise())}
                    className="flex-1 bg-[#0F172A] border border-[#CBD5E1]/[0.18] rounded-lg px-4 py-2 text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50"
                    placeholder="e.g., Organic Chemistry, Spectroscopy, Catalysis..."
                  />
                  <button
                    onClick={handleAddExpertise}
                    className="px-6 py-2 bg-[#FACC15] text-[#0F172A] rounded-lg text-sm font-medium hover:bg-[#FDE047] transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-[#CBD5E1]/[0.18]">
                  <button
                    onClick={handleSaveInfo}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FACC15] text-[#0F172A] rounded-lg font-medium hover:bg-[#FDE047] transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                  {successMessage && (
                    <span className="ml-4 text-sm text-green-400 font-medium">✓ {successMessage}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Info Section */}
          {activeSection === 'info' && (
            <div className="animate-fade-in">
              <h1 className="font-heading text-2xl lg:text-3xl text-[#FACC15] mb-2">Profile Information</h1>
              <p className="text-[#94A3B8] mb-8">
                Update your profile details and contact information
              </p>

              <div className="space-y-6">
                {/* Profile Photo */}
                <div className="bg-[#1E293B] border border-[#CBD5E1]/[0.18] rounded-xl p-6">
                  <h2 className="font-heading text-lg text-[#F8FAFC] mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-[#FACC15]" />
                    Profile Photo
                  </h2>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-[#CBD5E1]/[0.18] shadow-lg">
                        {(photoUrl || member?.photoUrl) ? (
                          <img
                            src={photoUrl || member?.photoUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#0F172A] flex items-center justify-center">
                            <User className="w-12 h-12 text-[#94A3B8]" />
                          </div>
                        )}
                      </div>
                      {uploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                          <Loader2 className="w-6 h-6 animate-spin text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
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
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FACC15] text-[#0F172A] rounded-lg text-sm font-medium hover:bg-[#FDE047] transition-colors disabled:opacity-50"
                      >
                        <Upload className="w-4 h-4" />
                        {uploading ? 'Uploading...' : 'Upload New Photo'}
                      </button>
                      <p className="text-xs text-[#94A3B8] mt-3">
                        Recommended: Square image, at least 400x400 pixels. Max 5MB.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-[#1E293B] border border-[#CBD5E1]/[0.18] rounded-xl p-6">
                  <h2 className="font-heading text-lg text-[#F8FAFC] mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-[#FACC15]" />
                    Contact Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#F8FAFC] mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-[#0F172A] border border-[#CBD5E1]/[0.18] rounded-lg pl-10 pr-4 py-2 text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50"
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#F8FAFC] mb-2">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-[#0F172A] border border-[#CBD5E1]/[0.18] rounded-lg pl-10 pr-4 py-2 text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50"
                          placeholder="+880 1XXX-XXXXXX"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Biography */}
                <div className="bg-[#1E293B] border border-[#CBD5E1]/[0.18] rounded-xl p-6">
                  <h2 className="font-heading text-lg text-[#F8FAFC] mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#FACC15]" />
                    Biography
                  </h2>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={6}
                    className="w-full bg-[#0F172A] border border-[#CBD5E1]/[0.18] rounded-lg px-4 py-3 text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50 resize-none"
                    placeholder="Write a short biography about yourself, your research interests, achievements, and academic journey..."
                  />
                  <p className="text-xs text-[#94A3B8] mt-2">
                    This will be displayed on your public profile page.
                  </p>
                </div>

                {/* Google Scholar */}
                <div className="bg-[#1E293B] border border-[#CBD5E1]/[0.18] rounded-xl p-6">
                  <h2 className="font-heading text-lg text-[#F8FAFC] mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#FACC15]" />
                    Google Scholar Profile
                  </h2>
                  <input
                    type="url"
                    value={googleScholarLink}
                    onChange={(e) => setGoogleScholarLink(e.target.value)}
                    className="w-full bg-[#0F172A] border border-[#CBD5E1]/[0.18] rounded-lg px-4 py-2 text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50"
                    placeholder="https://scholar.google.com/citations?user=..."
                  />
                  <p className="text-xs text-[#94A3B8] mt-2">
                    Link to your Google Scholar profile to display your publications automatically.
                  </p>
                </div>

                {/* Save Button */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleSaveInfo}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-[#FACC15] text-[#0F172A] rounded-lg font-medium hover:bg-[#FDE047] transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save All Changes
                      </>
                    )}
                  </button>
                  {successMessage && (
                    <span className="text-sm text-green-400 font-medium bg-green-900/30 px-4 py-2 rounded-lg">
                      ✓ {successMessage}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Settings Section */}
          {activeSection === 'settings' && (
            <div className="animate-fade-in">
              <h1 className="font-heading text-2xl lg:text-3xl text-[#FACC15] mb-2">Settings</h1>
              <p className="text-[#94A3B8] mb-8">
                Manage your account settings and security
              </p>

              <div className="space-y-6">
                {/* Account Settings */}
                <div className="bg-[#1E293B] border border-[#CBD5E1]/[0.18] rounded-xl p-6">
                  <h2 className="font-heading text-lg text-[#F8FAFC] mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-[#FACC15]" />
                    Account Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#F8FAFC] mb-2">Display Name</label>
                      <input
                        type="text"
                        value={settingsName}
                        onChange={(e) => setSettingsName(e.target.value)}
                        className="w-full bg-[#0F172A] border border-[#CBD5E1]/[0.18] rounded-lg px-4 py-2 text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#F8FAFC] mb-2">Username</label>
                      <input
                        type="text"
                        value={settingsUsername}
                        onChange={(e) => setSettingsUsername(e.target.value)}
                        className="w-full bg-[#0F172A] border border-[#CBD5E1]/[0.18] rounded-lg px-4 py-2 text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50"
                        placeholder="username"
                      />
                      <p className="text-xs text-[#94A3B8] mt-1">Used for login</p>
                    </div>
                  </div>
                </div>

                {/* Profile Photo in Settings */}
                <div className="bg-[#1E293B] border border-[#CBD5E1]/[0.18] rounded-xl p-6">
                  <h2 className="font-heading text-lg text-[#F8FAFC] mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-[#FACC15]" />
                    Profile Photo
                  </h2>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#CBD5E1]/[0.18]">
                      {(photoUrl || member?.photoUrl) ? (
                        <img
                          src={photoUrl || member?.photoUrl}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#0F172A] flex items-center justify-center">
                          <User className="w-8 h-8 text-[#94A3B8]" />
                        </div>
                      )}
                    </div>
                    <div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F172A] border border-[#CBD5E1]/[0.18] text-[#F8FAFC] rounded-lg text-sm font-medium hover:bg-[#1E293B] transition-colors disabled:opacity-50"
                      >
                        <Upload className="w-4 h-4" />
                        {uploading ? 'Uploading...' : 'Change Photo'}
                      </button>
                      <p className="text-xs text-[#94A3B8] mt-2">JPG, PNG. Max 5MB.</p>
                    </div>
                  </div>
                </div>

                {/* Password Change */}
                <div className="bg-[#1E293B] border border-[#CBD5E1]/[0.18] rounded-xl p-6">
                  <h2 className="font-heading text-lg text-[#F8FAFC] mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-[#FACC15]" />
                    Change Password
                  </h2>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-[#F8FAFC] mb-2">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full bg-[#0F172A] border border-[#CBD5E1]/[0.18] rounded-lg px-4 py-2 pr-10 text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#F8FAFC]"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#F8FAFC] mb-2">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-[#0F172A] border border-[#CBD5E1]/[0.18] rounded-lg px-4 py-2 pr-10 text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#F8FAFC]"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#F8FAFC] mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-[#0F172A] border border-[#CBD5E1]/[0.18] rounded-lg px-4 py-2 text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Settings */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <button
                    onClick={handleSaveSettings}
                    disabled={savingSettings}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-[#FACC15] text-[#0F172A] rounded-lg font-medium hover:bg-[#FDE047] transition-colors disabled:opacity-50"
                  >
                    {savingSettings ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Settings
                      </>
                    )}
                  </button>
                  {settingsMessage && (
                    <span className="text-sm text-green-400 font-medium bg-green-900/30 px-4 py-2 rounded-lg">
                      ✓ {settingsMessage}
                    </span>
                  )}
                  {settingsError && (
                    <span className="text-sm text-red-400 font-medium bg-red-900/30 px-4 py-2 rounded-lg">
                      ✗ {settingsError}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
