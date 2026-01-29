import { useEffect, useState } from 'react';
import { FileText, ExternalLink, BookOpen, GraduationCap, Quote, Award, RefreshCw } from 'lucide-react';
import { scholarService, ScholarPublication, ScholarProfile } from '@/services';
import { settingsService } from '@/services/settings.service';

export default function PublicationsPage() {
  const [publications, setPublications] = useState<ScholarPublication[]>([]);
  const [profile, setProfile] = useState<ScholarProfile | null>(null);
  const [scholarUrl, setScholarUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const fetchPublications = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First get the scholar URL from settings
      const settingsRes = await settingsService.getSettings();
      if (settingsRes.success && settingsRes.data?.googleScholarUrl) {
        setScholarUrl(settingsRes.data.googleScholarUrl);
      }

      // Fetch publications from Google Scholar
      const res = await scholarService.getMainPublications();
      
      if (res.success && res.data) {
        if (res.data.success) {
          setPublications(res.data.publications || []);
          setProfile(res.data.profile || null);
        } else {
          setError(res.data.error || 'Failed to fetch publications');
        }
      } else {
        setError(res.error || 'Failed to fetch publications');
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchPublications();
  }, []);

  // Get unique years from publications
  const years = [...new Set(publications.map((p) => p.year).filter(Boolean))].sort((a, b) => 
    parseInt(b) - parseInt(a)
  );

  const filteredPublications = selectedYear
    ? publications.filter((p) => p.year === selectedYear)
    : publications;

  // Group publications by year
  const groupedByYear = filteredPublications.reduce((acc, pub) => {
    const year = pub.year || 'Unknown';
    if (!acc[year]) acc[year] = [];
    acc[year].push(pub);
    return acc;
  }, {} as Record<string, ScholarPublication[]>);

  // Calculate total citations
  const totalCitations = profile?.totalCitations || 
    publications.reduce((sum, p) => sum + (parseInt(p.citedBy) || 0), 0);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920&q=80" 
            alt="Publications"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0F172A]/85" />
        </div>
        <div className="absolute top-10 sm:top-20 right-10 sm:right-20 w-48 sm:w-72 h-48 sm:h-72 bg-[#FACC15]/20 rounded-full blur-3xl" />
        
        <div className="container-wide relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 text-[#F8FAFC] text-xs sm:text-sm font-medium mb-4 sm:mb-6 animate-fade-in border border-white/20">
              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Research Publications</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#F8FAFC] mb-4 sm:mb-6 animate-fade-in-up" style={{ letterSpacing: '-0.02em' }}>
              Publications
            </h1>
            <p className="text-sm sm:text-lg md:text-xl text-[#CBD5E1] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Our research contributions to the scientific community through peer-reviewed publications.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container-wide -mt-8 sm:-mt-10 relative z-10 mb-8 sm:mb-12">
        <div className="bg-card rounded-xl sm:rounded-xl shadow-card border border-border p-4 sm:p-6 md:p-8">
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Stats */}
            <div className="flex items-center justify-center sm:justify-start gap-4 sm:gap-8 flex-wrap">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-[#FACC15]/15 text-[#FACC15]">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="font-heading text-xl sm:text-2xl font-bold text-[#FACC15]">{publications.length}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">Publications</div>
                </div>
              </div>
              <div className="w-px h-10 sm:h-12 bg-border" />
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-[#FACC15]/15 text-[#FACC15]">
                  <Quote className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="font-heading text-xl sm:text-2xl font-bold text-[#FACC15]">{totalCitations}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">Citations</div>
                </div>
              </div>
              {profile && (
                <>
                  <div className="w-px h-10 sm:h-12 bg-border hidden sm:block" />
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-[#FACC15]/15 text-[#FACC15]">
                      <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <div className="font-heading text-xl sm:text-2xl font-bold text-[#FACC15]">{profile.hIndex}</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">h-index</div>
                    </div>
                  </div>
                  <div className="w-px h-10 sm:h-12 bg-border hidden sm:block" />
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-[#FACC15]/15 text-[#FACC15]">
                      <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <div className="font-heading text-xl sm:text-2xl font-bold text-[#FACC15]">{profile.i10Index}</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">i10-index</div>
                    </div>
                  </div>
                </>
              )}
              
              {/* Refresh button */}
              <button
                onClick={fetchPublications}
                disabled={loading}
                className="ml-auto p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground transition-colors disabled:opacity-50"
                title="Refresh publications"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            {/* Year Filter */}
            <div className="flex flex-wrap justify-center sm:justify-end gap-1.5 sm:gap-2">
              <button
                onClick={() => setSelectedYear(null)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  selectedYear === null
                    ? 'bg-accent text-accent-foreground shadow-md'
                    : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                }`}
              >
                All
              </button>
              {years.slice(0, 5).map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    selectedYear === year
                      ? 'bg-accent text-accent-foreground shadow-md'
                      : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Publications List */}
      <section className="container-wide pb-20 md:pb-32">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card-academic p-6 animate-pulse">
                <div className="h-5 w-3/4 bg-muted rounded mb-3" />
                <div className="h-4 w-1/2 bg-muted rounded mb-2" />
                <div className="h-4 w-1/3 bg-muted rounded" />
              </div>
            ))}
            <p className="text-sm text-muted-foreground text-center mt-8">
              Fetching publications from Google Scholar...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-muted/30 rounded-3xl">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-heading text-xl text-foreground mb-2">Could not load publications</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <button
              onClick={fetchPublications}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        ) : filteredPublications.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-3xl">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-heading text-xl text-foreground mb-2">No publications found</h3>
            <p className="text-muted-foreground">Publications will appear here once the Google Scholar profile is configured.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedByYear)
              .sort(([a], [b]) => {
                const numA = parseInt(a) || 0;
                const numB = parseInt(b) || 0;
                return numB - numA;
              })
              .map(([year, pubs]) => (
                <div key={year}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <h2 className="font-heading text-2xl text-primary">{year}</h2>
                    <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                      {pubs.length} {pubs.length === 1 ? 'paper' : 'papers'}
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
                  </div>
                  <div className="space-y-4">
                    {pubs.map((publication, index) => (
                      <PublicationCard
                        key={publication.scholarId || index}
                        publication={publication}
                        delay={`${index * 0.05}s`}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Google Scholar Link */}
        <div className="mt-12 sm:mt-16 relative rounded-xl sm:rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/90" />
          <div className="relative p-6 sm:p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/10">
                <Award className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h3 className="font-heading text-lg sm:text-xl text-white mb-1">View Complete Publication List</h3>
                <p className="text-white/70 text-xs sm:text-sm">
                  For the full list of publications with detailed metrics, visit Google Scholar.
                </p>
              </div>
            </div>
            <a
              href={scholarUrl || "https://scholar.google.com/citations?user=5oILmB0AAAAJ&hl=en"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-white text-primary rounded-lg sm:rounded-xl font-semibold hover:bg-white/90 transition-colors shrink-0 text-sm sm:text-base"
            >
              Google Scholar
              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function PublicationCard({
  publication,
  delay,
}: {
  publication: ScholarPublication;
  delay: string;
}) {
  const citations = parseInt(publication.citedBy) || 0;
  
  return (
    <div
      className="group bg-card rounded-lg sm:rounded-xl border border-border p-4 sm:p-6 hover:shadow-elevated hover:border-[#FACC15]/25 transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-[#FACC15]/10 text-[#FACC15] shrink-0 group-hover:bg-[#FACC15] group-hover:text-[#0F172A] transition-colors">
          <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading text-sm sm:text-lg font-medium text-foreground mb-1.5 sm:mb-2 leading-snug group-hover:text-[#FACC15] transition-colors">
            {publication.title}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-none">
            {publication.authors?.join(', ') || 'Authors not available'}
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <span className="text-xs sm:text-sm text-muted-foreground italic line-clamp-1">
              {publication.journal || 'Journal not specified'}
            </span>
            <div className="flex items-center gap-3 sm:gap-4">
              {citations > 0 && (
                <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#FACC15]/15 text-[#FACC15] text-[10px] sm:text-xs font-medium">
                  <Quote className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  {citations} citations
                </span>
              )}
              {publication.articleUrl && (
                <a
                  href={publication.articleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-[#FACC15] hover:text-[#FDE047] font-medium transition-colors"
                >
                  View
                  <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
