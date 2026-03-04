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
    <div className="bg-[#FAFBF8]">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 md:py-32 overflow-hidden bg-gradient-to-br from-[#F0F9FF] via-[#DBEAFE] to-[#F8FAFC]">
        <div className="absolute top-10 sm:top-20 right-10 sm:right-20 w-48 sm:w-72 h-48 sm:h-72 bg-[#3B82F6]/10 rounded-full blur-3xl" />
        
        <div className="container-wide relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#DBEAFE] text-[#3B82F6] text-xs sm:text-sm font-medium mb-4 sm:mb-6 animate-fade-in border border-[#3B82F6]/20">
              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Research Publications</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#1E40AF] mb-4 sm:mb-6 animate-fade-in-up" style={{ letterSpacing: '-0.02em' }}>
              Publications
            </h1>
            <p className="text-sm sm:text-lg md:text-xl text-[#475569] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Our research contributions to the scientific community through peer-reviewed publications.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container-wide -mt-8 sm:-mt-10 relative z-10 mb-8 sm:mb-12">
        <div className="bg-white rounded-xl sm:rounded-xl shadow-card border border-[#E5E7EB] p-4 sm:p-6 md:p-8">
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Stats */}
            <div className="flex items-center justify-center sm:justify-start gap-4 sm:gap-8 flex-wrap">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-[#DBEAFE] text-[#3B82F6]">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="font-heading text-xl sm:text-2xl font-bold text-[#3B82F6]">{publications.length}</div>
                  <div className="text-[10px] sm:text-xs text-[#94A3B8]">Publications</div>
                </div>
              </div>
              <div className="w-px h-10 sm:h-12 bg-[#E5E7EB]" />
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-[#DBEAFE] text-[#3B82F6]">
                  <Quote className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="font-heading text-xl sm:text-2xl font-bold text-[#3B82F6]">{totalCitations}</div>
                  <div className="text-[10px] sm:text-xs text-[#94A3B8]">Citations</div>
                </div>
              </div>
              {profile && (
                <>
                  <div className="w-px h-10 sm:h-12 bg-[#E5E7EB] hidden sm:block" />
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-[#DBEAFE] text-[#3B82F6]">
                      <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <div className="font-heading text-xl sm:text-2xl font-bold text-[#3B82F6]">{profile.hIndex}</div>
                      <div className="text-[10px] sm:text-xs text-[#94A3B8]">h-index</div>
                    </div>
                  </div>
                  <div className="w-px h-10 sm:h-12 bg-[#E5E7EB] hidden sm:block" />
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-[#DBEAFE] text-[#3B82F6]">
                      <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <div className="font-heading text-xl sm:text-2xl font-bold text-[#3B82F6]">{profile.i10Index}</div>
                      <div className="text-[10px] sm:text-xs text-[#94A3B8]">i10-index</div>
                    </div>
                  </div>
                </>
              )}
              
              {/* Refresh button */}
              <button
                onClick={fetchPublications}
                disabled={loading}
                className="ml-auto p-2 rounded-lg bg-[#F3F8FF] hover:bg-[#DBEAFE] text-[#3B82F6] transition-colors disabled:opacity-50"
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
                    ? 'bg-[#3B82F6] text-white shadow-md'
                    : 'bg-white text-[#475569] border border-[#E5E7EB] hover:bg-[#F3F8FF]'
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
                      ? 'bg-[#3B82F6] text-white shadow-md'
                      : 'bg-white text-[#475569] border border-[#E5E7EB] hover:bg-[#F3F8FF]'
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
      <section className="container-wide pb-20 md:pb-32 bg-[#FAFBF8]">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-6 animate-pulse">
                <div className="h-5 w-3/4 bg-[#F3F8FF] rounded mb-3" />
                <div className="h-4 w-1/2 bg-[#F3F8FF] rounded mb-2" />
                <div className="h-4 w-1/3 bg-[#F3F8FF] rounded" />
              </div>
            ))}
            <p className="text-sm text-[#475569] text-center mt-8">
              Fetching publications from Google Scholar...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-[#F3F8FF] rounded-3xl border border-[#E5E7EB]">
            <BookOpen className="w-16 h-16 mx-auto text-[#94A3B8] mb-4" />
            <h3 className="font-heading text-xl text-[#0F172A] mb-2">Could not load publications</h3>
            <p className="text-sm text-[#475569] mb-4">{error}</p>
            <button
              onClick={fetchPublications}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        ) : filteredPublications.length === 0 ? (
          <div className="text-center py-20 bg-[#F3F8FF] rounded-3xl border border-[#E5E7EB]">
            <BookOpen className="w-16 h-16 mx-auto text-[#94A3B8] mb-4" />
            <h3 className="font-heading text-xl text-[#0F172A] mb-2">No publications found</h3>
            <p className="text-[#475569]">Publications will appear here once the Google Scholar profile is configured.</p>
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
                    <div className="p-2 rounded-lg bg-[#DBEAFE] text-[#3B82F6]">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <h2 className="font-heading text-2xl text-[#1E40AF]">{year}</h2>
                    <span className="px-3 py-1 rounded-full bg-[#DBEAFE] text-[#3B82F6] text-sm">
                      {pubs.length} {pubs.length === 1 ? 'paper' : 'papers'}
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#E5E7EB] to-transparent" />
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
          <div className="absolute inset-0 bg-gradient-to-r from-[#3B82F6] via-[#2563EB] to-[#1E40AF]" />
          <div className="relative p-6 sm:p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/15">
                <Award className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h3 className="font-heading text-lg sm:text-xl text-white mb-1">View Complete Publication List</h3>
                <p className="text-white/80 text-xs sm:text-sm">
                  For the full list of publications with detailed metrics, visit Google Scholar.
                </p>
              </div>
            </div>
            <a
              href={scholarUrl || "https://scholar.google.com/citations?user=5oILmB0AAAAJ&hl=en"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-white text-[#3B82F6] rounded-lg sm:rounded-xl font-semibold hover:bg-[#F0F9FF] transition-colors shrink-0 text-sm sm:text-base"
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
      className="group bg-white rounded-lg sm:rounded-xl border border-[#E5E7EB] p-4 sm:p-6 hover:shadow-lg hover:border-[#3B82F6]/25 transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-[#DBEAFE] text-[#3B82F6] shrink-0 group-hover:bg-[#3B82F6] group-hover:text-white transition-colors">
          <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading text-sm sm:text-lg font-medium text-[#0F172A] mb-1.5 sm:mb-2 leading-snug group-hover:text-[#3B82F6] transition-colors">
            {publication.title}
          </h3>
          <p className="text-xs sm:text-sm text-[#475569] mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-none">
            {publication.authors?.join(', ') || 'Authors not available'}
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <span className="text-xs sm:text-sm text-[#475569] italic line-clamp-1">
              {publication.journal || 'Journal not specified'}
            </span>
            <div className="flex items-center gap-3 sm:gap-4">
              {citations > 0 && (
                <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#DBEAFE] text-[#3B82F6] text-[10px] sm:text-xs font-medium">
                  <Quote className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  {citations} citations
                </span>
              )}
              {publication.articleUrl && (
                <a
                  href={publication.articleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-[#3B82F6] hover:text-[#2563EB] font-medium transition-colors"
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
