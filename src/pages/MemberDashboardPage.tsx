import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FlaskConical, LogOut, Save, Loader2, Upload, BookOpen, Mail, Phone, Plus, X, User, GraduationCap, FileText, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { teamService } from '@/services/team.service';
import { publicationService } from '@/services/publication.service';
import { TeamMember, Publication } from '@/services/types';

export default function MemberDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [member, setMember] = useState<TeamMember | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'publications'>('profile');

  // Form state
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [googleScholarLink, setGoogleScholarLink] = useState('');
  const [expertise, setExpertise] = useState<string[]>([]);
  const [newExpertise, setNewExpertise] = useState('');

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

        const pubsRes = await publicationService.getPublicationsByMember(memberRes.data.id);
        if (pubsRes.success && pubsRes.data) {
          setPublications(pubsRes.data);
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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      // Upload to Cloudinary via backend API
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

  const handleSave = async () => {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container-wide py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary-foreground/10">
                <FlaskConical className="w-5 h-5" />
              </div>
              <span className="font-heading font-semibold hidden sm:inline">
                Prof. Dr. Yunus Ahmed Research Group
              </span>
            </Link>
            <span className="text-primary-foreground/50">|</span>
            <span className="text-sm">Member Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary-foreground/30">
                <img
                  src={photoUrl || member?.photoUrl}
                  alt={member?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm text-primary-foreground/90 hidden sm:inline">
                {member?.name}
              </span>
            </div>
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

      <div className="container-wide py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="font-heading text-3xl text-primary mb-2">Welcome, {member?.name}!</h1>
            <p className="text-muted-foreground">Manage your profile and view your publications</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-border">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
                activeTab === 'profile'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <User className="w-4 h-4" />
              My Profile
            </button>
            <button
              onClick={() => setActiveTab('publications')}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
                activeTab === 'publications'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Publications
            </button>
          </div>

          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Photo Section */}
              <div className="card-academic p-6">
                <h2 className="font-heading text-lg text-primary mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Photo
                </h2>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-border shadow-lg">
                      <img
                        src={photoUrl || member?.photoUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
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
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4" />
                      {uploading ? 'Uploading...' : 'Upload New Photo'}
                    </button>
                    <p className="text-xs text-muted-foreground mt-3">
                      Recommended: Square image, at least 400x400 pixels. Max 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="card-academic p-6">
                <h2 className="font-heading text-lg text-primary mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-input-academic pl-10"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="form-input-academic pl-10"
                        placeholder="+880 1XXX-XXXXXX"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Biography Section */}
              <div className="card-academic p-6">
                <h2 className="font-heading text-lg text-primary mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Biography
                </h2>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={6}
                  className="form-input-academic resize-none"
                  placeholder="Write a short biography about yourself, your research interests, achievements, and academic journey..."
                />
                <p className="text-xs text-muted-foreground mt-2">
                  This will be displayed on your public profile page.
                </p>
              </div>

              {/* Expertise Section */}
              <div className="card-academic p-6">
                <h2 className="font-heading text-lg text-primary mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Areas of Expertise
                </h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {expertise.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
                    >
                      {item}
                      <button
                        onClick={() => handleRemoveExpertise(item)}
                        className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  {expertise.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No expertise added yet. Add your areas of expertise below.
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newExpertise}
                    onChange={(e) => setNewExpertise(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExpertise())}
                    className="form-input-academic flex-1"
                    placeholder="e.g., Organic Chemistry, Spectroscopy, Catalysis..."
                  />
                  <button
                    onClick={handleAddExpertise}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>

              {/* Google Scholar Section */}
              <div className="card-academic p-6">
                <h2 className="font-heading text-lg text-primary mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Google Scholar Profile
                </h2>
                <input
                  type="url"
                  value={googleScholarLink}
                  onChange={(e) => setGoogleScholarLink(e.target.value)}
                  className="form-input-academic"
                  placeholder="https://scholar.google.com/citations?user=..."
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Link to your Google Scholar profile to display your publications automatically.
                </p>
              </div>

              {/* Save Button */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
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
                  <span className="text-sm text-green-600 font-medium bg-green-50 px-4 py-2 rounded-lg">
                    ✓ {successMessage}
                  </span>
                )}
              </div>
            </div>
          )}

          {activeTab === 'publications' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-heading text-xl text-primary">My Publications</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Publications are fetched from your Google Scholar profile.
                  </p>
                </div>
                {member?.googleScholarLink && (
                  <a
                    href={member.googleScholarLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on Scholar
                  </a>
                )}
              </div>

              {publications.length === 0 ? (
                <div className="card-academic p-8 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-heading text-lg text-foreground mb-2">No Publications Found</h3>
                  <p className="text-muted-foreground mb-4">
                    Publications are automatically fetched from your Google Scholar profile.
                  </p>
                  {!member?.googleScholarLink && (
                    <button
                      onClick={() => setActiveTab('profile')}
                      className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                    >
                      Add your Google Scholar link
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {publications.map((pub) => (
                    <div key={pub.id} className="card-academic p-5 hover:shadow-md transition-shadow">
                      <h3 className="font-medium text-foreground mb-2">{pub.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {pub.authors.join(', ')}
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs text-muted-foreground italic">
                          {pub.journal} • {pub.year}
                        </span>
                        {pub.citedBy !== undefined && pub.citedBy > 0 && (
                          <span className="text-xs bg-accent/20 text-accent-foreground px-2 py-0.5 rounded-full">
                            Cited by {pub.citedBy}
                          </span>
                        )}
                        {pub.pdfLink && (
                          <a
                            href={pub.pdfLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                          >
                            View PDF
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
        </div>
      </div>
    </div>
  );
}
