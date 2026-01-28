import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Mail, Phone, BookOpen, GraduationCap, Calendar, MapPin, Award, Briefcase, RefreshCw, Quote } from 'lucide-react';
import { teamService } from '@/services/team.service';
import { scholarService, ScholarPublication, ScholarProfile } from '@/services';
import { TeamMember } from '@/services/types';

export default function MemberProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [member, setMember] = useState<TeamMember | null>(null);
  const [publications, setPublications] = useState<ScholarPublication[]>([]);
  const [scholarProfile, setScholarProfile] = useState<ScholarProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pubsLoading, setPubsLoading] = useState(false);
  const [pubsError, setPubsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'publications'>('overview');

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
      <div className="min-h-screen bg-muted/30">
        <div className="container-wide py-12">
          <div className="max-w-5xl mx-auto animate-pulse">
            <div className="h-6 w-24 bg-muted rounded mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="card-academic p-6 text-center">
                  <div className="w-48 h-48 bg-muted rounded-full mx-auto mb-4" />
                  <div className="h-6 w-32 bg-muted rounded mx-auto mb-2" />
                  <div className="h-4 w-24 bg-muted rounded mx-auto" />
                </div>
              </div>
              <div className="lg:col-span-2">
                <div className="card-academic p-6">
                  <div className="h-8 w-48 bg-muted rounded mb-4" />
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-muted rounded" />
                    <div className="h-4 w-full bg-muted rounded" />
                    <div className="h-4 w-2/3 bg-muted rounded" />
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
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-2xl text-primary mb-4">Member Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The team member you're looking for doesn't exist.
          </p>
          <Link
            to="/team"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Team
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-white">
        <div className="container-wide py-8">
          <Link
            to="/team"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Team
          </Link>
        </div>
      </div>

      <div className="container-wide py-8 -mt-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Card */}
            <div className="lg:col-span-1">
              <div className="card-academic p-6 text-center sticky top-8">
                {/* Profile Image */}
                <div className="relative -mt-20 mb-4">
                  <div className="w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-white shadow-xl bg-white">
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Name & Title */}
                <h1 className="font-heading text-2xl font-bold text-primary mb-1">
                  {member.name}
                </h1>
                <p className="text-muted-foreground font-medium mb-3">
                  {member.designation}
                </p>

                {/* Research Area Badge */}
                {member.researchArea && (
                  <span className="inline-block badge-gold mb-4">
                    {member.researchArea}
                  </span>
                )}

                {/* Contact Buttons */}
                <div className="space-y-2 mb-6">
                  {member.email && (
                    <a
                      href={`https://mail.google.com/mail/?view=cm&to=${member.email}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
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
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
                    >
                      <BookOpen className="w-4 h-4" />
                      Google Scholar
                    </a>
                  )}
                </div>

                {/* Quick Info */}
                <div className="border-t border-border pt-4 space-y-3 text-left">
                  {member.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{member.phone}</span>
                    </div>
                  )}
                  {member.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground truncate">{member.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">CUET, Chittagong</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
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
              <div className="flex gap-4 mb-6 border-b border-border bg-white rounded-t-xl px-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
                    activeTab === 'overview'
                      ? 'border-primary text-primary'
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
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  Publications
                  {publications.length > 0 && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {publications.length}
                    </span>
                  )}
                </button>
              </div>

              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Biography */}
                  <div className="card-academic p-6">
                    <h2 className="font-heading text-xl text-primary mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      About
                    </h2>
                    {member.bio ? (
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {member.bio}
                      </p>
                    ) : (
                      <p className="text-muted-foreground italic">
                        No biography available yet.
                      </p>
                    )}
                  </div>

                  {/* Expertise */}
                  {member.expertise && member.expertise.length > 0 && (
                    <div className="card-academic p-6">
                      <h2 className="font-heading text-xl text-primary mb-4 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5" />
                        Areas of Expertise
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {member.expertise.map((item) => (
                          <span
                            key={item}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 text-primary rounded-lg text-sm font-medium border border-primary/10"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Research Stats */}
                  {(publications.length > 0 || scholarProfile) && (
                    <div className="card-academic p-6">
                      <h2 className="font-heading text-xl text-primary mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Research Metrics
                      </h2>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-muted/50 rounded-xl p-4 text-center">
                          <p className="text-3xl font-bold text-primary mb-1">
                            {publications.length}
                          </p>
                          <p className="text-sm text-muted-foreground">Publications</p>
                        </div>
                        <div className="bg-muted/50 rounded-xl p-4 text-center">
                          <p className="text-3xl font-bold text-primary mb-1">
                            {scholarProfile?.totalCitations || publications.reduce((sum, pub) => sum + (parseInt(pub.citedBy) || 0), 0)}
                          </p>
                          <p className="text-sm text-muted-foreground">Total Citations</p>
                        </div>
                        {scholarProfile && (
                          <>
                            <div className="bg-muted/50 rounded-xl p-4 text-center">
                              <p className="text-3xl font-bold text-primary mb-1">
                                {scholarProfile.hIndex}
                              </p>
                              <p className="text-sm text-muted-foreground">h-index</p>
                            </div>
                            <div className="bg-muted/50 rounded-xl p-4 text-center">
                              <p className="text-3xl font-bold text-primary mb-1">
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
                <div>
                  {/* Refresh button */}
                  {member?.googleScholarLink && (
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={() => member && fetchPublications(member.id)}
                        disabled={pubsLoading}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 ${pubsLoading ? 'animate-spin' : ''}`} />
                        Refresh
                      </button>
                    </div>
                  )}
                  
                  {pubsLoading ? (
                    <div className="card-academic p-8">
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-5 w-3/4 bg-muted rounded mb-2" />
                            <div className="h-4 w-1/2 bg-muted rounded mb-2" />
                            <div className="h-4 w-1/3 bg-muted rounded" />
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground text-center mt-4">
                        Fetching publications from Google Scholar...
                      </p>
                    </div>
                  ) : pubsError ? (
                    <div className="card-academic p-8 text-center">
                      <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-muted-foreground mb-2">Could not load publications.</p>
                      <p className="text-xs text-muted-foreground mb-4">{pubsError}</p>
                      {member?.googleScholarLink && (
                        <button
                          onClick={() => member && fetchPublications(member.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Try Again
                        </button>
                      )}
                    </div>
                  ) : publications.length > 0 ? (
                    <div className="space-y-4">
                      {publications.slice(0, 20).map((pub, index) => (
                        <div
                          key={pub.scholarId || index}
                          className="card-academic p-5 hover:shadow-md transition-shadow"
                        >
                          <div className="flex gap-4">
                            <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary font-bold shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-foreground mb-2 leading-snug">
                                {pub.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {pub.authors?.join(', ') || 'Authors not available'}
                              </p>
                              <div className="flex flex-wrap items-center gap-3">
                                <span className="text-xs text-muted-foreground italic">
                                  {pub.journal || 'Journal not specified'} {pub.year && `• ${pub.year}`}
                                </span>
                                {pub.citedBy && parseInt(pub.citedBy) > 0 && (
                                  <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                                    <Quote className="w-3 h-3" />
                                    Cited by {pub.citedBy}
                                  </span>
                                )}
                                {pub.articleUrl && (
                                  <a
                                    href={pub.articleUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                                  >
                                    View Paper
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {publications.length > 20 && (
                        <div className="card-academic p-4 text-center">
                          <p className="text-sm text-muted-foreground">
                            Showing 20 of {publications.length} publications.{' '}
                            <a
                              href={member.googleScholarLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline font-medium"
                            >
                              View all on Google Scholar
                            </a>
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="card-academic p-8 text-center">
                      <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="font-heading text-lg text-foreground mb-2">
                        No Publications Yet
                      </h3>
                      <p className="text-muted-foreground">
                        Publications will appear here once they are linked to a Google Scholar profile.
                      </p>
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
