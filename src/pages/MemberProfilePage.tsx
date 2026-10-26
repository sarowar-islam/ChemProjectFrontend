import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Mail, Phone, BookOpen, GraduationCap, Calendar, MapPin, Award, Briefcase, RefreshCw, Quote, FileText, Globe, Linkedin, Facebook, Instagram, Twitter, Github, Youtube } from 'lucide-react';
import { teamService } from '@/services/team.service';
import { scholarService, ScholarPublication, ScholarProfile } from '@/services';
import { TeamMember } from '@/services/types';
import { linkifyHtml } from '@/lib/htmlUtils';
import { SEO } from '@/components/SEO';

export default function MemberProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<TeamMember | null>(null);
  const [publications, setPublications] = useState<ScholarPublication[]>([]);
  const [scholarProfile, setScholarProfile] = useState<ScholarProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pubsLoading, setPubsLoading] = useState(false);
  const [pubsError, setPubsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'publications'>('overview');
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'citations'>('recent');

  const createSlug = (title: string) => {
    if (!title) return '';
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };

  const years = [...new Set(publications.map((p) => p.year).filter(Boolean))].sort((a, b) =>
    parseInt(b) - parseInt(a)
  );

  const filteredPublications = selectedYear
    ? publications.filter((p) => p.year === selectedYear)
    : publications;

  const sortedPublications = [...filteredPublications].sort((a, b) => {
    if (sortBy === 'citations') {
      const citeA = parseInt(a.citedBy) || 0;
      const citeB = parseInt(b.citedBy) || 0;
      if (citeB !== citeA) return citeB - citeA;
      return (parseInt(b.year) || 0) - (parseInt(a.year) || 0);
    } else {
      const yearA = parseInt(a.year) || 0;
      const yearB = parseInt(b.year) || 0;
      if (yearB !== yearA) return yearB - yearA;
      return (parseInt(b.citedBy) || 0) - (parseInt(a.citedBy) || 0);
    }
  });

  const groupedByYear = sortedPublications.reduce((acc, pub) => {
    const year = pub.year || 'Unknown';
    if (!acc[year]) acc[year] = [];
    acc[year].push(pub);
    return acc;
  }, {} as Record<string, ScholarPublication[]>);

  const totalPubCitations = scholarProfile?.totalCitations ||
    publications.reduce((sum, pub) => sum + (parseInt(pub.citedBy) || 0), 0);

  const fetchPublications = async (memberId: string) => {
    setPubsLoading(true);
    setPubsError(null);
    
    const res = await scholarService.getMemberPublications(memberId);
    if (res.success && res.data) {
      if (res.data.success) {
        setPublications(res.data.publications || []);
        setScholarProfile(res.data.profile || null);
      } else {
        setPubsError(res.data.error || res.data.message || 'Failed to fetch publications');
      }
    } else {
      setPubsError(res.error || 'Failed to fetch publications');
    }
    
    setPubsLoading(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!username) return;

      const memberRes = await teamService.getMemberByUsername(username);
      if (memberRes.success && memberRes.data) {
        setMember(memberRes.data);

        // Fetch member's publications from their Google Scholar profile
        if (memberRes.data.googleScholarLink) {
          await fetchPublications(memberRes.data.id);
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-wide py-6">
          <div className="max-w-5xl mx-auto animate-pulse">
            <div className="h-6 w-24 bg-secondary rounded mb-4" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-xl p-6 text-center">
                  <div className="w-48 h-48 bg-secondary rounded-full mx-auto mb-4" />
                  <div className="h-6 w-32 bg-secondary rounded mx-auto mb-2" />
                  <div className="h-4 w-24 bg-secondary rounded mx-auto" />
                </div>
              </div>
              <div className="lg:col-span-2">
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="h-8 w-48 bg-secondary rounded mb-4" />
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-secondary rounded" />
                    <div className="h-4 w-full bg-secondary rounded" />
                    <div className="h-4 w-2/3 bg-secondary rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-2xl text-foreground mb-4">Member Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The team member you're looking for doesn't exist.
          </p>
          <Link
            to="/team"
            className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Team
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={member ? `${member.name} - ${member.title}` : 'Team Member Profile'}
        description={member ? (member.bio?.replace(/<[^>]*>/g, '').slice(0, 160) || `Research profile of ${member.name}, ${member.title} at BCER Lab.`) : 'Research team member profile at BCER Lab.'}
        canonicalPath={`/team/${username}`}
        image={member?.photoUrl || '/photos/bcerlab-og-image.png'}
        type="profile"
        schema={member ? {
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          "mainEntity": {
            "@type": "Person",
            "name": member.name,
            "jobTitle": member.title,
            "description": member.bio?.replace(/<[^>]*>/g, ''),
            "image": member.photoUrl || "https://bcerlab.com/photos/blank_profile.png",
            "worksFor": {
              "@type": "ResearchOrganization",
              "name": "Biochemical and Environmental Research Lab (BCER Lab)"
            }
          }
        } : undefined}
      />
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-secondary/70 dark:from-secondary/25 via-secondary/45 dark:via-secondary/15 to-background">
        <div className="container-wide py-4">
          <Link
            to="/team"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Team
          </Link>
        </div>
      </div>

      <div className="container-wide py-4 -mt-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-xl p-6 text-center sticky top-8">
                {/* Profile Image */}
                <div className="relative -mt-10 mb-4">
                  <div className="w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-[#15803D] shadow-xl bg-secondary">
                    <img
                      src={member.photoUrl || '/photos/blank_profile.png'}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Name & Title */}
                <h1 className="font-heading text-2xl font-bold text-foreground mb-1">
                  {member.name}
                </h1>
                <p className="text-accent font-medium mb-3">
                  {member.title}
                </p>

                {/* Research Area Badge */}
                {member.researchArea && (
                  <span className="inline-block px-4 py-1.5 bg-accent/15 text-accent rounded-full text-sm font-semibold border border-[#15803D]/30 mb-4">
                    {member.researchArea}
                  </span>
                )}

                {/* Top 2% Scientist Badge for Prof. Dr. Yunus Ahmed */}
                {(member.name.toLowerCase().includes('yunus ahmed') || member.username?.toLowerCase().includes('yunus')) && (
                  <div className="mb-4 flex justify-center">
                    <a
                      href="https://topscinet.com/scientist_profile/Ahmed,%20Yunus/2010/?stype=single_year"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block hover:opacity-95 transition-opacity"
                    >
                      <img
                        src="https://topscinet.com/badge/U50012.png?style=horizontal-light&type=single&name=1"
                        alt="Top 2% Scientist badge, TOPSCINET, 2026"
                        className="w-full max-w-[320px] h-auto rounded-lg shadow-sm"
                      />
                    </a>
                  </div>
                )}

                {/* Contact Buttons */}
                <div className="space-y-2 mb-6">
                  {member.email && (
                    <a
                      href={`https://mail.google.com/mail/?view=cm&to=${member.email}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-accent text-primary-foreground rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Send Email
                    </a>
                  )}
                  {member.googleScholarLink && (
                    <a
                      href={member.googleScholarLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-accent/15 transition-colors border border-border"
                    >
                      <BookOpen className="w-4 h-4" />
                      Google Scholar
                    </a>
                  )}

                  {/* Social Media Icons Row */}
                  {member.socialLinks && member.socialLinks.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      {member.socialLinks.map((link, index) => {
                        const platformLower = link.platform.toLowerCase();
                        let IconComponent = Globe;
                        if (platformLower.includes('linkedin')) IconComponent = Linkedin;
                        else if (platformLower.includes('facebook')) IconComponent = Facebook;
                        else if (platformLower.includes('instagram')) IconComponent = Instagram;
                        else if (platformLower.includes('twitter') || platformLower.includes('x')) IconComponent = Twitter;
                        else if (platformLower.includes('github')) IconComponent = Github;
                        else if (platformLower.includes('youtube')) IconComponent = Youtube;

                        return (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={link.platform}
                            className="p-2.5 rounded-full bg-secondary text-foreground hover:bg-accent hover:text-primary-foreground transition-all duration-300 shadow-sm border border-border"
                          >
                            <IconComponent className="w-4 h-4" />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Quick Info */}
                <div className="border-t border-border pt-4 space-y-3 text-left">
                  {member.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-accent" />
                      <span className="text-muted-foreground">{member.phone}</span>
                    </div>
                  )}
                  {member.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-accent" />
                      <span className="text-muted-foreground truncate">{member.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-accent" />
                    <span className="text-muted-foreground">CUET, Chittagong</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-accent" />
                    <span className="text-muted-foreground">
                      Member since {new Date(member.joinedDate).getFullYear()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="flex gap-4 mb-6 border-b border-border bg-card rounded-t-xl px-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
                    activeTab === 'overview'
                      ? 'border-[#15803D] text-accent'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('publications')}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
                    activeTab === 'publications'
                      ? 'border-[#15803D] text-accent'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  Publications
                  {publications.length > 0 && (
                    <span className="text-xs bg-accent/15 text-accent px-2 py-0.5 rounded-full">
                      {publications.length}
                    </span>
                  )}
                </button>
              </div>

              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Biography */}
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h2 className="font-heading text-xl text-foreground mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-accent" />
                      About
                    </h2>
                    {member.bio ? (
                      <div
                        className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_a]:text-accent [&_a]:underline hover:[&_a]:text-accent/80 [&_strong]:text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground"
                        dangerouslySetInnerHTML={{ __html: linkifyHtml(member.bio) }}
                      />
                    ) : (
                      <p className="text-muted-foreground italic">
                        No biography available yet.
                      </p>
                    )}
                  </div>

                  {/* Expertise */}
                  {member.expertise && member.expertise.length > 0 && (
                    <div className="bg-card border border-border rounded-xl p-6">
                      <h2 className="font-heading text-xl text-foreground mb-4 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-accent" />
                        Areas of Expertise
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {member.expertise.map((item) => (
                          <span
                            key={item}
                            className="inline-flex items-center px-4 py-2 bg-accent/15 text-accent rounded-lg text-sm font-medium border border-[#15803D]/20"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Research Stats */}
                  {(publications.length > 0 || scholarProfile) && (
                    <div className="bg-card border border-border rounded-xl p-6">
                      <h2 className="font-heading text-xl text-foreground mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-accent" />
                        Research Metrics
                      </h2>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-secondary rounded-xl p-4 text-center">
                          <p className="text-3xl font-bold text-accent mb-1">
                            {publications.length}
                          </p>
                          <p className="text-sm text-muted-foreground">Publications</p>
                        </div>
                        <div className="bg-secondary rounded-xl p-4 text-center">
                          <p className="text-3xl font-bold text-accent mb-1">
                            {scholarProfile?.totalCitations || publications.reduce((sum, pub) => sum + (parseInt(pub.citedBy) || 0), 0)}
                          </p>
                          <p className="text-sm text-muted-foreground">Total Citations</p>
                        </div>
                        {scholarProfile && (
                          <>
                            <div className="bg-secondary rounded-xl p-4 text-center">
                              <p className="text-3xl font-bold text-accent mb-1">
                                {scholarProfile.hIndex}
                              </p>
                              <p className="text-sm text-muted-foreground">h-index</p>
                            </div>
                            <div className="bg-secondary rounded-xl p-4 text-center">
                              <p className="text-3xl font-bold text-accent mb-1">
                                {scholarProfile.i10Index}
                              </p>
                              <p className="text-sm text-muted-foreground">i10-index</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'publications' && (
                <div className="space-y-5">
                  {/* Publications Stats & Filter Card */}
                  <div className="bg-card border border-border rounded-xl p-3 sm:p-4 shadow-2xs">
                    {/* Top Stats Row */}
                    <div className="flex items-center justify-between flex-wrap gap-3 pb-2.5">
                      <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-secondary text-secondary-foreground">
                            <FileText className="w-3.5 h-3.5 text-accent" />
                          </div>
                          <div>
                            <div className="font-heading text-base sm:text-lg font-bold text-accent leading-none">{publications.length}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">Publications</div>
                          </div>
                        </div>

                        <div className="w-px h-6 bg-border" />

                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-secondary text-secondary-foreground">
                            <Quote className="w-3.5 h-3.5 text-accent" />
                          </div>
                          <div>
                            <div className="font-heading text-base sm:text-lg font-bold text-accent leading-none">{totalPubCitations}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">Citations</div>
                          </div>
                        </div>

                        {scholarProfile && (
                          <>
                            <div className="w-px h-6 bg-border hidden sm:block" />
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-md bg-secondary text-secondary-foreground">
                                <GraduationCap className="w-3.5 h-3.5 text-accent" />
                              </div>
                              <div>
                                <div className="font-heading text-base sm:text-lg font-bold text-accent leading-none">{scholarProfile.hIndex}</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">h-index</div>
                              </div>
                            </div>

                            <div className="w-px h-6 bg-border hidden sm:block" />
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-md bg-secondary text-secondary-foreground">
                                <Award className="w-3.5 h-3.5 text-accent" />
                              </div>
                              <div>
                                <div className="font-heading text-base sm:text-lg font-bold text-accent leading-none">{scholarProfile.i10Index}</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">i10-index</div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {member?.googleScholarLink && (
                        <button
                          onClick={() => member && fetchPublications(member.id)}
                          disabled={pubsLoading}
                          className="p-1.5 rounded-md bg-secondary hover:bg-secondary/80 text-accent transition-colors disabled:opacity-50"
                          title="Refresh publications"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${pubsLoading ? 'animate-spin' : ''}`} />
                        </button>
                      )}
                    </div>

                    {/* Filter & Sort Controls Row */}
                    {publications.length > 0 && (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-2.5 border-t border-border/70">
                        {/* Sort By Controls */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                            Sort by:
                          </span>
                          <div className="inline-flex p-0.5 bg-secondary/80 rounded-md border border-border">
                            <button
                              type="button"
                              onClick={() => setSortBy('recent')}
                              className={`px-2.5 py-0.5 rounded text-xs font-medium transition-all ${
                                sortBy === 'recent'
                                  ? 'bg-accent text-primary-foreground shadow-2xs'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              Recent
                            </button>
                            <button
                              type="button"
                              onClick={() => setSortBy('citations')}
                              className={`px-2.5 py-0.5 rounded text-xs font-medium transition-all ${
                                sortBy === 'citations'
                                  ? 'bg-accent text-primary-foreground shadow-2xs'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              Citations
                            </button>
                          </div>
                        </div>

                        {/* Year Filter Controls - 3 Recent Years + Dropdown */}
                        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedYear(null)}
                            className={`px-2.5 py-0.5 rounded-md text-xs font-medium transition-all ${
                              selectedYear === null
                                ? 'bg-accent text-primary-foreground shadow-xs'
                                : 'bg-card text-muted-foreground border border-border hover:bg-secondary'
                            }`}
                          >
                            All
                          </button>
                          {years.slice(0, 3).map((year) => (
                            <button
                              key={year}
                              type="button"
                              onClick={() => setSelectedYear(year)}
                              className={`px-2.5 py-0.5 rounded-md text-xs font-medium transition-all ${
                                selectedYear === year
                                  ? 'bg-accent text-primary-foreground shadow-xs'
                                  : 'bg-card text-muted-foreground border border-border hover:bg-secondary'
                              }`}
                            >
                              {year}
                            </button>
                          ))}
                          {years.length > 3 && (
                            <select
                              value={years.slice(3).includes(selectedYear || '') ? (selectedYear || '') : ''}
                              onChange={(e) => setSelectedYear(e.target.value || null)}
                              className={`px-2 py-0.5 rounded-md text-xs font-medium transition-all border cursor-pointer focus:outline-none ${
                                years.slice(3).includes(selectedYear || '')
                                  ? 'bg-accent text-primary-foreground border-accent'
                                  : 'bg-card text-muted-foreground border-border hover:bg-secondary'
                              }`}
                            >
                              <option value="" className="bg-card text-foreground">
                                {years.slice(3).includes(selectedYear || '') ? selectedYear : 'More Years...'}
                              </option>
                              {years.slice(3).map((year) => (
                                <option key={year} value={year} className="bg-card text-foreground">
                                  {year}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {pubsLoading ? (
                    <div className="bg-card border border-border rounded-xl p-8">
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-5 w-3/4 bg-secondary rounded mb-2" />
                            <div className="h-4 w-1/2 bg-secondary rounded mb-2" />
                            <div className="h-4 w-1/3 bg-secondary rounded" />
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground text-center mt-4">
                        Fetching publications from Google Scholar...
                      </p>
                    </div>
                  ) : pubsError ? (
                    <div className="bg-card border border-border rounded-xl p-8 text-center">
                      <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-muted-foreground mb-2">Could not load publications.</p>
                      <p className="text-xs text-muted-foreground mb-4">{pubsError}</p>
                      {member?.googleScholarLink && (
                        <button
                          onClick={() => member && fetchPublications(member.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-primary-foreground rounded-lg hover:bg-accent/90 transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Try Again
                        </button>
                      )}
                    </div>
                  ) : filteredPublications.length === 0 ? (
                    <div className="bg-card border border-border rounded-xl p-8 text-center">
                      <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="font-heading text-lg text-foreground mb-2">
                        {selectedYear ? `No Publications Found for ${selectedYear}` : 'No Publications Yet'}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {selectedYear ? 'Try selecting another year or click "All".' : 'Publications will appear here once they are linked to a Google Scholar profile.'}
                      </p>
                    </div>
                  ) : sortBy === 'citations' ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-secondary text-secondary-foreground">
                          <Quote className="w-4 h-4 text-accent" />
                        </div>
                        <h3 className="font-heading text-lg font-bold text-[#166534] dark:text-foreground">
                          {selectedYear ? `${selectedYear} Publications` : 'Publications Sorted by Citations'}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                          {sortedPublications.length} {sortedPublications.length === 1 ? 'paper' : 'papers'}
                        </span>
                        <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
                      </div>
                      <div className="space-y-3 sm:space-y-4">
                        {sortedPublications.map((pub, index) => {
                          const slug = createSlug(pub.title) || pub.scholarId || String(index);
                          const citations = parseInt(pub.citedBy) || 0;
                          return (
                            <div
                              key={pub.scholarId || index}
                              onClick={() => navigate(`/publications/${slug}`)}
                              className="group bg-card border border-border rounded-xl p-4 sm:p-5 hover:shadow-md hover:border-accent/30 transition-all cursor-pointer"
                            >
                              <div className="flex items-start gap-3 sm:gap-4">
                                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-accent/15 text-accent font-bold text-xs sm:text-sm shrink-0 group-hover:bg-accent group-hover:text-primary-foreground transition-colors">
                                  {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-foreground mb-1.5 leading-snug group-hover:text-accent transition-colors text-sm sm:text-base">
                                    {pub.title}
                                  </h3>
                                  <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">
                                    {pub.authors?.join(', ') || 'Authors not available'}
                                  </p>
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-xs text-muted-foreground italic line-clamp-1">
                                      {pub.journal || 'Journal not specified'} {pub.year && `• ${pub.year}`}
                                    </span>
                                    <div className="flex items-center gap-3">
                                      {citations > 0 && (
                                        <span className="inline-flex items-center gap-1 text-xs bg-accent/15 text-accent px-2.5 py-0.5 rounded-full font-semibold">
                                          <Quote className="w-3 h-3" />
                                          Cited by {citations}
                                        </span>
                                      )}
                                      {pub.articleUrl && (
                                        <a
                                          href={pub.articleUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent/80 hover:underline font-medium"
                                        >
                                          View Paper
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {Object.entries(groupedByYear)
                        .sort(([a], [b]) => {
                          const numA = parseInt(a) || 0;
                          const numB = parseInt(b) || 0;
                          return numB - numA;
                        })
                        .map(([year, pubs]) => (
                          <div key={year}>
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-1.5 rounded-lg bg-secondary text-secondary-foreground">
                                <GraduationCap className="w-4 h-4 text-accent" />
                              </div>
                              <h3 className="font-heading text-lg font-bold text-[#166534] dark:text-foreground">
                                {year}
                              </h3>
                              <span className="px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                                {pubs.length} {pubs.length === 1 ? 'paper' : 'papers'}
                              </span>
                              <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
                            </div>
                            <div className="space-y-3 sm:space-y-4">
                              {pubs.map((pub, index) => {
                                const slug = createSlug(pub.title) || pub.scholarId || String(index);
                                const citations = parseInt(pub.citedBy) || 0;
                                return (
                                  <div
                                    key={pub.scholarId || index}
                                    onClick={() => navigate(`/publications/${slug}`)}
                                    className="group bg-card border border-border rounded-xl p-4 sm:p-5 hover:shadow-md hover:border-accent/30 transition-all cursor-pointer"
                                  >
                                    <div className="flex items-start gap-3 sm:gap-4">
                                      <div className="p-2 rounded-lg bg-secondary text-secondary-foreground shrink-0 group-hover:bg-accent group-hover:text-primary-foreground transition-colors">
                                        <FileText className="w-4 h-4 text-accent group-hover:text-primary-foreground" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-foreground mb-1.5 leading-snug group-hover:text-accent transition-colors text-sm sm:text-base">
                                          {pub.title}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">
                                          {pub.authors?.join(', ') || 'Authors not available'}
                                        </p>
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                          <span className="text-xs text-muted-foreground italic line-clamp-1">
                                            {pub.journal || 'Journal not specified'} {pub.year && `• ${pub.year}`}
                                          </span>
                                          <div className="flex items-center gap-3">
                                            {citations > 0 && (
                                              <span className="inline-flex items-center gap-1 text-xs bg-accent/15 text-accent px-2.5 py-0.5 rounded-full font-semibold">
                                                <Quote className="w-3 h-3" />
                                                Cited by {citations}
                                              </span>
                                            )}
                                            {pub.articleUrl && (
                                              <a
                                                href={pub.articleUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent/80 hover:underline font-medium"
                                              >
                                                View Paper
                                                <ExternalLink className="w-3 h-3" />
                                              </a>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
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
      </div>
    </div>
  );
}
