import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Mail, Phone, BookOpen, GraduationCap, Calendar, MapPin, Award, Briefcase, RefreshCw, Quote, FileText, Globe, Linkedin, Facebook, Instagram, Twitter, Github, Youtube, Building2, BookMarked, GraduationCap as CapIcon } from 'lucide-react';
import { teamService } from '@/services/team.service';
import { scholarService, ScholarPublication, ScholarProfile } from '@/services';
import { TeamMember } from '@/services/types';
import { linkifyHtml } from '@/lib/htmlUtils';

export default function AlumniDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<TeamMember | null>(null);
  const [publications, setPublications] = useState<ScholarPublication[]>([]);
  const [scholarProfile, setScholarProfile] = useState<ScholarProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pubsLoading, setPubsLoading] = useState(false);
  const [pubsError, setPubsError] = useState<string | null>(null);

  const createSlug = (title: string) => {
    if (!title) return '';
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };

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
      if (!slug) return;

      // Try fetching by username first
      const res = await teamService.getMemberByUsername(slug);
      if (res.success && res.data) {
        setMember(res.data);
        if (res.data.googleScholarLink) {
          await fetchPublications(res.data.id);
        }
      } else {
        // Fallback: fetch all members and find by slugified name
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
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-2xl text-foreground mb-4">Alumnus Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The alumnus profile you're looking for doesn't exist.
          </p>
          <Link
            to="/alumni"
            className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Alumni Directory
          </Link>
        </div>
      </div>
    );
  }

  const totalPubCitations = scholarProfile?.totalCitations ||
    publications.reduce((sum, pub) => sum + (parseInt(pub.citedBy) || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-secondary/70 dark:from-secondary/25 via-secondary/45 dark:via-secondary/15 to-background border-b border-border">
        <div className="container-wide py-4">
          <Link
            to="/alumni"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Alumni Directory
          </Link>
        </div>
      </div>

      <div className="container-wide py-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Summary Card */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-2xl p-6 text-center sticky top-8 shadow-sm">
                <div className="w-36 h-36 mx-auto rounded-full overflow-hidden border-4 border-accent shadow-xl bg-secondary mb-4">
                  <img
                    src={member.photoUrl || '/photos/blank_profile.png'}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <h1 className="font-heading text-2xl font-bold text-foreground mb-1">
                  {member.name}
                </h1>
                <p className="text-accent font-semibold mb-2">
                  {member.currentTitle || member.title || 'Alumnus'}
                </p>
                {member.currentOrganization && (
                  <p className="text-sm text-muted-foreground mb-4 font-medium flex items-center justify-center gap-1.5">
                    <Building2 className="w-4 h-4 text-accent" />
                    {member.currentOrganization}
                  </p>
                )}

                {member.researchArea && (
                  <div className="mb-6">
                    <span className="inline-block px-3 py-1 bg-accent/15 text-accent rounded-full text-xs font-semibold">
                      {member.researchArea}
                    </span>
                  </div>
                )}

                {/* Primary Action Buttons */}
                <div className="space-y-2 mb-6">
                  {member.email && member.isEmailPublic !== false && (
                    <a
                      href={`mailto:${member.email}`}
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-accent text-primary-foreground rounded-xl text-sm font-medium hover:bg-accent/90 transition-colors shadow-sm"
                    >
                      <Mail className="w-4 h-4" />
                      Contact Alumnus
                    </a>
                  )}
                  {member.googleScholarLink && (
                    <a
                      href={member.googleScholarLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-secondary text-foreground rounded-xl text-sm font-medium hover:bg-secondary/80 transition-colors border border-border"
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
                      className="flex items-center justify-center gap-2 w-full px-4 py-2 text-secondary text-foreground rounded-xl text-xs font-medium hover:bg-secondary transition-colors border border-border"
                    >
                      <Globe className="w-3.5 h-3.5 text-accent" />
                      ORCID Profile
                    </a>
                  )}
                </div>

                {/* Professional Links Row */}
                {member.socialLinks && member.socialLinks.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-4 border-t border-border">
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
                          className="p-2.5 rounded-full bg-secondary text-foreground hover:bg-accent hover:text-primary-foreground transition-all duration-300 shadow-2xs border border-border"
                        >
                          <IconComponent className="w-4 h-4" />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Detailed Sections */}
            <div className="lg:col-span-2 space-y-6">
              {/* Current Position Section (Prominent) */}
              {(member.currentTitle || member.currentOrganization || member.currentDepartment || member.location) && (
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <h2 className="font-heading text-xl text-[#166534] dark:text-foreground mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-accent" />
                    Current Position
                  </h2>
                  <div className="space-y-3">
                    {member.currentTitle && (
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Designation</p>
                        <p className="text-lg font-bold text-foreground">{member.currentTitle}</p>
                      </div>
                    )}
                    {member.currentOrganization && (
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Organization / University</p>
                        <p className="text-base font-medium text-foreground">{member.currentOrganization}</p>
                      </div>
                    )}
                    {(member.currentDepartment || member.location) && (
                      <div className="flex flex-wrap gap-6 text-sm text-muted-foreground pt-2">
                        {member.currentDepartment && (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-accent" />
                            <span>{member.currentDepartment}</span>
                          </div>
                        )}
                        {member.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-accent" />
                            <span>{member.location}</span>
                          </div>
                        )}
                        {member.currentPositionStartDate && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-accent" />
                            <span>Since {member.currentPositionStartDate}</span>
                          </div>
                        )}
                      </div>
                    )}
                    {member.currentPositionDescription && (
                      <div className="mt-4 pt-3 border-t border-border text-sm text-muted-foreground leading-relaxed">
                        <p>{member.currentPositionDescription}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* About Section */}
              {member.bio && (
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <h2 className="font-heading text-xl text-[#166534] dark:text-foreground mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-accent" />
                    About & Professional Background
                  </h2>
                  <div
                    className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed [&_p]:mb-3"
                    dangerouslySetInnerHTML={{ __html: linkifyHtml(member.bio) }}
                  />
                </div>
              )}

              {/* Career History Section */}
              {member.careerHistory && member.careerHistory.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <h2 className="font-heading text-xl text-[#166534] dark:text-foreground mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-accent" />
                    Career History
                  </h2>
                  <div className="space-y-4">
                    {member.careerHistory.map((career, index) => (
                      <div key={index} className="p-4 rounded-xl bg-secondary/50 border border-border">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                          <h3 className="font-semibold text-foreground text-base">{career.title}</h3>
                          <span className="text-xs text-accent font-medium bg-accent/15 px-2.5 py-0.5 rounded-full w-fit">
                            {career.startDate} {career.endDate ? `- ${career.endDate}` : career.isCurrent ? '- Present' : ''}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">{career.organization}</p>
                        {career.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed">{career.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education Section */}
              {member.education && member.education.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <h2 className="font-heading text-xl text-[#166534] dark:text-foreground mb-4 flex items-center gap-2">
                    <CapIcon className="w-5 h-5 text-accent" />
                    Education
                  </h2>
                  <div className="space-y-4">
                    {member.education.map((edu, index) => (
                      <div key={index} className="p-4 rounded-xl bg-secondary/50 border border-border">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                          <h3 className="font-semibold text-foreground text-base">{edu.degree}</h3>
                          {edu.graduationYear && (
                            <span className="text-xs text-accent font-medium bg-accent/15 px-2.5 py-0.5 rounded-full w-fit">
                              Graduated {edu.graduationYear}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          {[edu.institution, edu.department].filter(Boolean).join(' • ')}
                        </p>
                        {edu.thesis && (
                          <p className="text-xs text-muted-foreground mt-2 italic">
                            <span className="font-medium not-italic">Thesis:</span> {edu.thesis}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Research & Expertise Section */}
              {((member.expertise && member.expertise.length > 0) || member.researchArea) && (
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <h2 className="font-heading text-xl text-[#166534] dark:text-foreground mb-4 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-accent" />
                    Research & Expertise
                  </h2>
                  {member.researchArea && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Research Focus</p>
                      <p className="text-sm font-medium text-foreground">{member.researchArea}</p>
                    </div>
                  )}
                  {member.expertise && member.expertise.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Skills & Areas of Expertise</p>
                      <div className="flex flex-wrap gap-2">
                        {member.expertise.map((skill) => (
                          <span key={skill} className="px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-medium border border-accent/20">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Lab Experience Section */}
              {(member.formerRole || member.labAffiliation || member.labContributions) && (
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <h2 className="font-heading text-xl text-[#166534] dark:text-foreground mb-4 flex items-center gap-2">
                    <BookMarked className="w-5 h-5 text-accent" />
                    Lab Experience & Contributions
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    {member.formerRole && (
                      <div className="p-3 rounded-xl bg-secondary">
                        <p className="text-xs text-muted-foreground">Former Role</p>
                        <p className="text-sm font-semibold text-foreground">{member.formerRole}</p>
                      </div>
                    )}
                    {member.labAffiliation && (
                      <div className="p-3 rounded-xl bg-secondary">
                        <p className="text-xs text-muted-foreground">Years in Lab</p>
                        <p className="text-sm font-semibold text-foreground">{member.labAffiliation}</p>
                      </div>
                    )}
                  </div>
                  {member.labContributions && (
                    <div className="text-sm text-muted-foreground leading-relaxed pt-2 border-t border-border">
                      <p>{member.labContributions}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Publications Section */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading text-xl text-[#166534] dark:text-foreground flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-accent" />
                    Publications ({publications.length})
                  </h2>
                  {member.googleScholarLink && (
                    <a
                      href={member.googleScholarLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline font-medium"
                    >
                      View on Google Scholar
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {pubsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <RefreshCw className="w-6 h-6 animate-spin text-accent" />
                  </div>
                ) : publications.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No publications listed or linked.</p>
                ) : (
                  <div className="space-y-4">
                    {publications.map((pub, index) => {
                      const slug = createSlug(pub.title) || pub.scholarId || String(index);
                      return (
                        <div
                          key={pub.scholarId || index}
                          onClick={() => navigate(`/publications/${slug}`)}
                          className="p-4 rounded-xl bg-secondary/50 border border-border hover:border-accent/40 transition-all cursor-pointer group"
                        >
                          <h3 className="font-medium text-foreground group-hover:text-accent transition-colors text-sm sm:text-base mb-1">
                            {pub.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{pub.authors?.join(', ')}</p>
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground italic">
                            <span>{pub.journal} • {pub.year}</span>
                            {pub.citedBy && parseInt(pub.citedBy) > 0 && (
                              <span className="bg-accent/15 text-accent px-2.5 py-0.5 rounded-full not-italic font-semibold">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
