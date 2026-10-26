import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  Mail,
  BookOpen,
  GraduationCap,
  Calendar,
  MapPin,
  Award,
  Briefcase,
  RefreshCw,
  Globe,
  Linkedin,
  Facebook,
  Instagram,
  Twitter,
  Github,
  Youtube,
  Building2,
  BookMarked,
  User,
  LayoutDashboard,
  Sparkles,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { teamService } from '@/services/team.service';
import { scholarService, ScholarPublication, ScholarProfile } from '@/services';
import { TeamMember } from '@/services/types';
import { linkifyHtml } from '@/lib/htmlUtils';
import { SEO } from '@/components/SEO';

type PortfolioTab =
  | 'overview'
  | 'position'
  | 'about'
  | 'career'
  | 'education'
  | 'expertise'
  | 'publications'
  | 'lab';

export default function AlumniDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<TeamMember | null>(null);
  const [publications, setPublications] = useState<ScholarPublication[]>([]);
  const [scholarProfile, setScholarProfile] = useState<ScholarProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pubsLoading, setPubsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<PortfolioTab>('overview');
  const [imageError, setImageError] = useState(false);

  const createSlug = (title: string) => {
    if (!title) return '';
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };

  const getInitials = (name: string) => {
    if (!name) return 'AL';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
      if (!slug) return;

      const res = await teamService.getMemberByUsername(slug);
      if (res.success && res.data) {
        setMember(res.data);
        if (res.data.googleScholarLink) {
          await fetchPublications(res.data.id);
        }
      } else {
        const allRes = await teamService.getMembers();
        if (allRes.success && allRes.data) {
          const found = allRes.data.find(
            (m) =>
              m.username?.toLowerCase() === slug.toLowerCase() ||
              m.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug.toLowerCase()
          );
          if (found) {
            setMember(found);
            if (found.googleScholarLink) {
              await fetchPublications(found.id);
            }
          }
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading Alumni Portfolio...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-card p-8 rounded-3xl border border-border shadow-elevated">
          <div className="w-16 h-16 bg-secondary text-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Alumnus Not Found</h1>
          <p className="text-muted-foreground text-sm mb-6">
            The alumnus profile you're looking for doesn't exist or may have been removed.
          </p>
          <Link
            to="/alumni"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-primary-foreground rounded-xl text-sm font-semibold hover:bg-accent/90 transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Alumni Directory
          </Link>
        </div>
      </div>
    );
  }

  const navTabs: { id: PortfolioTab; label: string; icon: any; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'position', label: 'Current Position', icon: Briefcase },
    { id: 'about', label: 'About', icon: User },
    { id: 'career', label: 'Career History', icon: Building2, count: member.careerHistory?.length },
    { id: 'education', label: 'Education', icon: GraduationCap, count: member.education?.length },
    { id: 'expertise', label: 'Research & Expertise', icon: Award },
    { id: 'publications', label: 'Publications', icon: BookOpen, count: publications.length },
    { id: 'lab', label: 'Lab Experience', icon: BookMarked },
  ];

  return (
    <div className="min-h-screen bg-background pb-28">
      <SEO
        title={member ? `${member.name} - Alumni Portfolio` : 'Alumni Portfolio'}
        description={member ? `Professional academic portfolio of ${member.name}, alumnus of BCER Lab. ${member.currentTitle ? `Current position: ${member.currentTitle}` : ''}` : 'Alumni profile at BCER Lab.'}
        canonicalPath={`/alumni/${slug}`}
        image={member?.photoUrl || '/photos/bcerlab-og-image.png'}
        type="profile"
        schema={member ? {
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          "mainEntity": {
            "@type": "Person",
            "name": member.name,
            "jobTitle": member.currentTitle || member.title,
            "worksFor": {
              "@type": "Organization",
              "name": member.currentOrganization || "Research Institution"
            },
            "description": member.bio?.replace(/<[^>]*>/g, ''),
            "image": member.photoUrl || "https://bcerlab.com/photos/blank_profile.png",
            "alumniOf": {
              "@type": "ResearchOrganization",
              "name": "Biochemical and Environmental Research Lab (BCER Lab)"
            }
          }
        } : undefined}
      />
      {/* Top Header / Back Link */}
      <div className="bg-card/70 backdrop-blur-md border-b border-border sticky top-0 z-40">
        <div className="container-wide py-3.5 flex items-center justify-between">
          <Link
            to="/alumni"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-semibold group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-accent" />
            Back to Alumni Directory
          </Link>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent/15 text-accent rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Alumni Portfolio
          </span>
        </div>
      </div>

      {/* TOP CENTER PORTFOLIO HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-secondary/50 via-secondary/15 to-background pt-14 pb-12 border-b border-border">
        <div className="container-wide relative z-10">
          <div className="max-w-3xl mx-auto flex flex-col items-center text-center">

            {/* 1. Center Photo */}
            <div className="relative mb-6">
              <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-card shadow-2xl bg-secondary relative group mx-auto">
                <img
                  src={!imageError && member.photoUrl ? member.photoUrl : '/photos/blank_profile.png'}
                  alt={member.name}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="absolute bottom-1 right-2 bg-accent text-primary-foreground p-2.5 rounded-full shadow-lg border-2 border-card">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>

            {/* 2. Center Name */}
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2.5">
              {member.name}
            </h1>

            {/* 3. Center Current Position / Role */}
            <p className="text-xl sm:text-2xl font-semibold text-accent mb-2">
              {member.currentTitle || member.title || 'Research Alumnus'}
            </p>

            {/* 4. Center Little Details (Organization & Location) */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground font-medium mb-4">
              {member.currentOrganization && (
                <span className="flex items-center gap-1.5 text-foreground font-semibold bg-secondary/80 px-3.5 py-1.5 rounded-full border border-border">
                  <Building2 className="w-4 h-4 text-accent" />
                  {member.currentOrganization}
                  {member.currentDepartment && <span className="font-normal text-muted-foreground">({member.currentDepartment})</span>}
                </span>
              )}
              {member.location && (
                <span className="flex items-center gap-1 bg-secondary/80 px-3 py-1.5 rounded-full border border-border">
                  <MapPin className="w-4 h-4 text-accent" />
                  {member.location}
                </span>
              )}
            </div>

            {/* Research Focus Tag */}
            {member.researchArea && (
              <div className="mb-6">
                <span className="px-4 py-1.5 bg-accent/15 text-accent rounded-full text-xs sm:text-sm font-semibold border border-accent/20">
                  Focus: {member.researchArea}
                </span>
              </div>
            )}

            {/* 5. Center Contact & Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
              {member.email && member.isEmailPublic !== false && (
                <a
                  href={`mailto:${member.email}`}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent text-primary-foreground rounded-xl text-sm font-semibold hover:bg-accent/90 transition-all shadow-md hover:-translate-y-0.5"
                >
                  <Mail className="w-4 h-4" />
                  Contact
                </a>
              )}
              {member.googleScholarLink && (
                <a
                  href={member.googleScholarLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-card text-foreground rounded-xl text-sm font-semibold hover:bg-secondary transition-all border border-border shadow-sm hover:-translate-y-0.5"
                >
                  <BookOpen className="w-4 h-4 text-accent" />
                  Google Scholar
                </a>
              )}
              {member.orcid && (
                <a
                  href={member.orcid.startsWith('http') ? member.orcid : `https://orcid.org/${member.orcid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-card text-foreground rounded-xl text-sm font-semibold hover:bg-secondary transition-all border border-border shadow-sm hover:-translate-y-0.5"
                >
                  <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.375c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 0 1-.947-.947c0-.525.422-.947.947-.947zm-.72 3.47h1.44v11.78H6.649V7.845zm5.31 0h3.585c2.616 0 4.239 1.638 4.239 4.097 0 2.476-1.623 4.11-4.239 4.11h-2.146v3.573H11.96V7.845zm1.44 6.78h2.001c1.785 0 2.766-.937 2.766-2.683 0-1.734-.981-2.67-2.766-2.67h-2.001v5.353z"/>
                  </svg>
                  ORCID
                </a>
              )}
              {member.researchGate && (
                <a
                  href={member.researchGate.startsWith('http') ? member.researchGate : `https://www.researchgate.net/profile/${member.researchGate}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-card text-foreground rounded-xl text-sm font-semibold hover:bg-secondary transition-all border border-border shadow-sm hover:-translate-y-0.5"
                >
                  <svg className="w-4 h-4 text-emerald-700 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 2.41a12 12 0 1 0 0 19.18 12 12 0 0 0 0-19.18zM9.54 16.55H8.33V7.45h1.21zm4.77 0h-1.21v-4.1h-2.14v4.1H8.33V7.45h1.21v3.95h2.14V7.45h1.21z"/>
                  </svg>
                  ResearchGate
                </a>
              )}
              {member.personalWebsite && (
                <a
                  href={member.personalWebsite.startsWith('http') ? member.personalWebsite : `https://${member.personalWebsite}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-card text-foreground rounded-xl text-sm font-semibold hover:bg-secondary transition-all border border-border shadow-sm hover:-translate-y-0.5"
                >
                  <ExternalLink className="w-4 h-4 text-accent" />
                  Website
                </a>
              )}
            </div>

            {/* 6. Social Links Row */}
            {member.socialLinks && member.socialLinks.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {member.socialLinks.map((link, idx) => {
                  const plat = link.platform.toLowerCase();
                  let IconComp = Globe;
                  if (plat.includes('linkedin')) IconComp = Linkedin;
                  else if (plat.includes('facebook')) IconComp = Facebook;
                  else if (plat.includes('instagram')) IconComp = Instagram;
                  else if (plat.includes('twitter') || plat.includes('x')) IconComp = Twitter;
                  else if (plat.includes('github')) IconComp = Github;
                  else if (plat.includes('youtube')) IconComp = Youtube;

                  return (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={link.platform}
                      className="p-3 rounded-full bg-card hover:bg-accent hover:text-primary-foreground text-foreground border border-border transition-all shadow-sm hover:-translate-y-0.5"
                    >
                      <IconComp className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            )}

          </div>
        </div>
      </section>

      {/* PORTFOLIO SECTION SELECTOR / TABS */}
      <div className="sticky top-14 z-30 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container-wide">
          <nav className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 py-2 px-4">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-accent text-primary-foreground shadow-sm font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      className={`ml-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        isActive
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ACTIVE SECTION PORTFOLIO VIEW */}
      <div className="container-wide py-10">
        <div className="max-w-4xl mx-auto">

          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              {/* Snapshot Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Role Snapshot */}
                <div className="bg-card border border-border rounded-3xl p-6 shadow-card hover:border-accent/40 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-accent/15 text-accent flex items-center justify-center">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-bold text-foreground">Current Position</h3>
                      <p className="text-xs text-muted-foreground">Professional affiliation</p>
                    </div>
                  </div>
                  <p className="font-bold text-foreground text-lg mb-1">{member.currentTitle || member.title || 'Alumnus'}</p>
                  <p className="text-sm font-medium text-accent mb-2">{member.currentOrganization || 'Organization not specified'}</p>
                  {member.location && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-accent" /> {member.location}
                    </p>
                  )}
                </div>

                {/* Research Focus Snapshot */}
                <div className="bg-card border border-border rounded-3xl p-6 shadow-card hover:border-accent/40 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-accent/15 text-accent flex items-center justify-center">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-bold text-foreground">Research Focus</h3>
                      <p className="text-xs text-muted-foreground">Scientific domain</p>
                    </div>
                  </div>
                  <p className="text-base font-semibold text-foreground mb-3">{member.researchArea || 'Research focus not specified'}</p>
                  {member.expertise && member.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {member.expertise.slice(0, 4).map((skill) => (
                        <span key={skill} className="px-2.5 py-1 bg-secondary text-foreground rounded-lg text-xs font-medium border border-border">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Biography Section */}
              {member.bio && (
                <div className="bg-card border border-border rounded-3xl p-8 shadow-card">
                  <h3 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2.5">
                    <User className="w-5 h-5 text-accent" /> About & Professional Background
                  </h3>
                  <div
                    className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-base [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_a]:text-accent [&_a]:underline hover:[&_a]:text-accent/80 [&_strong]:text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground"
                    dangerouslySetInnerHTML={{ __html: linkifyHtml(member.bio) }}
                  />
                </div>
              )}

              {/* Career Highlights Preview */}
              {member.careerHistory && member.careerHistory.length > 0 && (
                <div className="bg-card border border-border rounded-3xl p-8 shadow-card">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-heading text-xl font-bold text-foreground flex items-center gap-2.5">
                      <Building2 className="w-5 h-5 text-accent" /> Career Journey
                    </h3>
                    <button
                      onClick={() => setActiveTab('career')}
                      className="text-xs font-bold text-accent hover:underline inline-flex items-center gap-1"
                    >
                      View Full Career Timeline →
                    </button>
                  </div>
                  <div className="space-y-4">
                    {member.careerHistory.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-secondary/40 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="font-bold text-foreground text-sm">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.organization}</p>
                        </div>
                        <span className="text-xs font-semibold text-accent bg-accent/15 px-3 py-1 rounded-full w-fit">
                          {item.startDate} {item.endDate ? `- ${item.endDate}` : item.isCurrent ? '- Present' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education Highlights Preview */}
              {member.education && member.education.length > 0 && (
                <div className="bg-card border border-border rounded-3xl p-8 shadow-card">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-heading text-xl font-bold text-foreground flex items-center gap-2.5">
                      <GraduationCap className="w-5 h-5 text-accent" /> Academic Background
                    </h3>
                    <button
                      onClick={() => setActiveTab('education')}
                      className="text-xs font-bold text-accent hover:underline inline-flex items-center gap-1"
                    >
                      View Full Education →
                    </button>
                  </div>
                  <div className="space-y-4">
                    {member.education.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-secondary/40 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="font-bold text-foreground text-sm">{item.degree}</p>
                          <p className="text-xs text-muted-foreground">{[item.institution, item.department].filter(Boolean).join(' • ')}</p>
                        </div>
                        {item.graduationYear && (
                          <span className="text-xs font-semibold text-accent bg-accent/15 px-3 py-1 rounded-full w-fit">
                            Graduated {item.graduationYear}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Publications Preview */}
              {publications.length > 0 && (
                <div className="bg-card border border-border rounded-3xl p-8 shadow-card">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-heading text-xl font-bold text-foreground flex items-center gap-2.5">
                      <BookOpen className="w-5 h-5 text-accent" /> Selected Publications ({publications.length})
                    </h3>
                    <button
                      onClick={() => setActiveTab('publications')}
                      className="text-xs font-bold text-accent hover:underline inline-flex items-center gap-1"
                    >
                      View All Publications →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {publications.slice(0, 3).map((pub, idx) => (
                      <div
                        key={idx}
                        onClick={() => navigate(`/publications/${createSlug(pub.title) || pub.scholarId || idx}`)}
                        className="p-4 rounded-2xl bg-secondary/40 border border-border hover:border-accent/40 cursor-pointer transition-all"
                      >
                        <p className="font-bold text-foreground text-sm mb-1 line-clamp-1">{pub.title}</p>
                        <p className="text-xs text-muted-foreground">{pub.journal} • {pub.year}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. CURRENT POSITION TAB */}
          {activeTab === 'position' && (
            <div className="bg-card border border-border rounded-3xl p-8 shadow-card animate-fade-in space-y-6">
              <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-3">
                <Briefcase className="w-6 h-6 text-accent" /> Current Position
              </h2>

              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-secondary/50 border border-border">
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Designation / Role</p>
                  <p className="text-2xl font-bold text-foreground">{member.currentTitle || member.title || 'Not specified'}</p>
                </div>

                <div className="p-5 rounded-2xl bg-secondary/50 border border-border">
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Organization / Institution</p>
                  <p className="text-xl font-semibold text-foreground">{member.currentOrganization || 'Not specified'}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-secondary/50 border border-border">
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Department</p>
                    <p className="text-base font-medium text-foreground">{member.currentDepartment || 'Not specified'}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-secondary/50 border border-border">
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Location</p>
                    <p className="text-base font-medium text-foreground">{member.location || 'Not specified'}</p>
                  </div>
                </div>

                {member.currentPositionStartDate && (
                  <div className="p-4 rounded-2xl bg-secondary/50 border border-border">
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Start Date</p>
                    <p className="text-base font-medium text-foreground">{member.currentPositionStartDate}</p>
                  </div>
                )}

                {member.currentPositionDescription && (
                  <div className="p-6 rounded-2xl bg-secondary/30 border border-border">
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Role Description & Responsibilities</p>
                    <div
                      className="prose dark:prose-invert max-w-none text-sm text-muted-foreground leading-relaxed [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_a]:text-accent [&_a]:underline hover:[&_a]:text-accent/80 [&_strong]:text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground"
                      dangerouslySetInnerHTML={{ __html: linkifyHtml(member.currentPositionDescription) }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. ABOUT TAB */}
          {activeTab === 'about' && (
            <div className="bg-card border border-border rounded-3xl p-8 shadow-card animate-fade-in space-y-6">
              <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-3">
                <User className="w-6 h-6 text-accent" /> About Alumnus
              </h2>
              {member.bio ? (
                <div
                  className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-base [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_a]:text-accent [&_a]:underline hover:[&_a]:text-accent/80 [&_strong]:text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground"
                  dangerouslySetInnerHTML={{ __html: linkifyHtml(member.bio) }}
                />
              ) : (
                <p className="text-muted-foreground text-sm italic">Biography has not been added yet.</p>
              )}
            </div>
          )}

          {/* 4. CAREER HISTORY TAB */}
          {activeTab === 'career' && (
            <div className="bg-card border border-border rounded-3xl p-8 shadow-card animate-fade-in space-y-6">
              <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-3">
                <Building2 className="w-6 h-6 text-accent" /> Career History
              </h2>

              {member.careerHistory && member.careerHistory.length > 0 ? (
                <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-border">
                  {member.careerHistory.map((career, index) => (
                    <div key={index} className="relative pl-10">
                      <div className="absolute left-2.5 top-2 w-3.5 h-3.5 rounded-full bg-accent ring-4 ring-card" />
                      <div className="p-6 rounded-2xl bg-secondary/50 border border-border shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <h3 className="font-heading font-bold text-foreground text-lg">{career.title}</h3>
                          <span className="text-xs font-bold text-accent bg-accent/15 px-3 py-1 rounded-full w-fit">
                            {career.startDate} {career.endDate ? `- ${career.endDate}` : career.isCurrent ? '- Present' : ''}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-muted-foreground mb-3">{career.organization}</p>
                        {career.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed">{career.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm italic">No career history entries listed.</p>
              )}
            </div>
          )}

          {/* 5. EDUCATION TAB */}
          {activeTab === 'education' && (
            <div className="bg-card border border-border rounded-3xl p-8 shadow-card animate-fade-in space-y-6">
              <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-3">
                <GraduationCap className="w-6 h-6 text-accent" /> Education Background
              </h2>

              {member.education && member.education.length > 0 ? (
                <div className="space-y-6">
                  {member.education.map((edu, index) => (
                    <div key={index} className="p-6 rounded-2xl bg-secondary/50 border border-border shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <h3 className="font-heading font-bold text-foreground text-lg">{edu.degree}</h3>
                        {edu.graduationYear && (
                          <span className="text-xs font-bold text-accent bg-accent/15 px-3 py-1 rounded-full w-fit">
                            Graduated {edu.graduationYear}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-muted-foreground mb-2">
                        {[edu.institution, edu.department].filter(Boolean).join(' • ')}
                      </p>
                      {edu.thesis && (
                        <p className="text-sm text-muted-foreground mt-3 italic bg-secondary/60 p-3 rounded-xl border border-border">
                          <span className="font-bold not-italic text-foreground">Thesis:</span> {edu.thesis}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm italic">No education history entries listed.</p>
              )}
            </div>
          )}

          {/* 6. RESEARCH & EXPERTISE TAB */}
          {activeTab === 'expertise' && (
            <div className="bg-card border border-border rounded-3xl p-8 shadow-card animate-fade-in space-y-6">
              <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-3">
                <Award className="w-6 h-6 text-accent" /> Research & Expertise
              </h2>

              {member.researchArea && (
                <div className="p-6 rounded-2xl bg-secondary/50 border border-border">
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Primary Research Area</p>
                  <p className="text-lg font-bold text-foreground">{member.researchArea}</p>
                </div>
              )}

              {member.expertise && member.expertise.length > 0 ? (
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-3">Skills & Technical Competencies</p>
                  <div className="flex flex-wrap gap-2.5">
                    {member.expertise.map((skill) => (
                      <span
                        key={skill}
                        className="px-4 py-2 rounded-xl bg-accent/15 text-accent text-sm font-semibold border border-accent/20 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm italic">No expertise tags listed.</p>
              )}
            </div>
          )}

          {/* 7. PUBLICATIONS TAB */}
          {activeTab === 'publications' && (
            <div className="bg-card border border-border rounded-3xl p-8 shadow-card animate-fade-in space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div>
                  <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-accent" /> Publications ({publications.length})
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">Research papers indexed from Google Scholar</p>
                </div>
                {member.googleScholarLink && (
                  <a
                    href={member.googleScholarLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground hover:bg-accent hover:text-primary-foreground rounded-xl text-xs font-semibold transition-all border border-border shadow-sm w-fit"
                  >
                    Google Scholar Profile <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {pubsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : publications.length === 0 ? (
                <div className="text-center py-12 bg-secondary/30 rounded-2xl border border-border">
                  <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground font-medium">No publications found or linked.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {publications.map((pub, index) => {
                    const pubSlug = createSlug(pub.title) || pub.scholarId || String(index);
                    return (
                      <div
                        key={pub.scholarId || index}
                        onClick={() => navigate(`/publications/${pubSlug}`)}
                        className="p-6 rounded-2xl bg-secondary/50 border border-border hover:border-accent/40 transition-all cursor-pointer group shadow-sm"
                      >
                        <h3 className="font-heading font-bold text-foreground group-hover:text-accent transition-colors text-base mb-2">
                          {pub.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2">
                          {pub.authors?.join(', ')}
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground italic">
                          <span>{pub.journal} • {pub.year}</span>
                          {pub.citedBy && parseInt(pub.citedBy) > 0 && (
                            <span className="bg-accent/15 text-accent px-3 py-1 rounded-full not-italic font-bold">
                              Cited by {pub.citedBy}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 8. LAB EXPERIENCE TAB */}
          {activeTab === 'lab' && (
            <div className="bg-card border border-border rounded-3xl p-8 shadow-card animate-fade-in space-y-6">
              <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-3">
                <BookMarked className="w-6 h-6 text-accent" /> Lab Experience & Contributions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-secondary/50 border border-border">
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Former Lab Role</p>
                  <p className="text-base font-bold text-foreground">{member.formerRole || 'Research Member'}</p>
                </div>
                <div className="p-5 rounded-2xl bg-secondary/50 border border-border">
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Lab Tenure / Affiliation</p>
                  <p className="text-base font-bold text-foreground">{member.labAffiliation || 'Alumni'}</p>
                </div>
              </div>
              {member.labContributions && (
                <div className="p-6 rounded-2xl bg-secondary/30 border border-border">
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Key Contributions & Projects</p>
                  <div
                    className="prose dark:prose-invert max-w-none text-sm text-muted-foreground leading-relaxed [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_a]:text-accent [&_a]:underline hover:[&_a]:text-accent/80 [&_strong]:text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground"
                    dangerouslySetInnerHTML={{ __html: linkifyHtml(member.labContributions) }}
                  />
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
