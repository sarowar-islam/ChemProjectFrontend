import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, GraduationCap, Building2, MapPin, ExternalLink, Briefcase, Linkedin, BookOpen, Globe } from 'lucide-react';
import { teamService } from '@/services/team.service';
import { TeamMember } from '@/services/types';
import { sortAlumniByJoinDate } from '@/lib/memberSorting';
import { useQuery } from '@tanstack/react-query';
import { SEO } from '@/components/SEO';

export default function AlumniPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResearchArea, setSelectedResearchArea] = useState<string>('all');

  const { data: members = [], isLoading: loading } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const res = await teamService.getMembers();
      return res.success && res.data ? res.data : [];
    },
  });

  const alumniList = useMemo(() => {
    const rawAlumni = members.filter((m) => m.position === 'alumni' || m.position?.toLowerCase() === 'alumni');
    return sortAlumniByJoinDate(rawAlumni);
  }, [members]);

  const researchAreas = useMemo(() => {
    const areas = new Set<string>();
    alumniList.forEach((m) => {
      if (m.researchArea) areas.add(m.researchArea);
    });
    return Array.from(areas);
  }, [alumniList]);

  const filteredAlumni = useMemo(() => {
    return alumniList.filter((m) => {
      const matchesSearch =
        searchTerm === '' ||
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.currentTitle && m.currentTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.currentOrganization && m.currentOrganization.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.researchArea && m.researchArea.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.location && m.location.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesArea = selectedResearchArea === 'all' || m.researchArea === selectedResearchArea;

      return matchesSearch && matchesArea;
    });
  }, [alumniList, searchTerm, selectedResearchArea]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Alumni Directory"
        description="Explore the professional directory of former lab members of Biochemical and Environmental Research Lab (BCER Lab)."
        canonicalPath="/alumni"
      />
      {/* Hero Section */}
      <section className="relative py-10 sm:py-14 md:py-16 overflow-hidden bg-gradient-to-br from-secondary/70 dark:from-secondary/25 via-secondary/45 dark:via-secondary/15 to-background">
        <div className="absolute top-10 right-20 w-72 h-72 bg-secondary/70 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-20 w-96 h-96 bg-secondary/55 rounded-full blur-3xl" />

        <div className="container-wide relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#166534] dark:text-foreground mb-4 sm:mb-6 animate-fade-in-up">
              Our Alumni
            </h1>
            <p className="text-sm sm:text-lg md:text-xl text-muted-foreground animate-fade-in-up px-4 mb-8">
              Explore the professional directory of former lab members who have contributed to our research group and are now leading impactful careers across academia and industry worldwide.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative animate-fade-in-up">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, position, company, university, or location..."
                className="w-full bg-card border border-border rounded-2xl pl-12 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Grid */}
      <section className="container-wide py-10 bg-background">
        {/* Filter Pills */}
        {researchAreas.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <button
              onClick={() => setSelectedResearchArea('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                selectedResearchArea === 'all'
                  ? 'bg-accent text-primary-foreground shadow-md'
                  : 'bg-card text-muted-foreground border border-border hover:bg-secondary'
              }`}
            >
              All Research Areas
            </button>
            {researchAreas.map((area) => (
              <button
                key={area}
                onClick={() => setSelectedResearchArea(area)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  selectedResearchArea === area
                    ? 'bg-accent text-primary-foreground shadow-md'
                    : 'bg-card text-muted-foreground border border-border hover:bg-secondary'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 animate-pulse">
                <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4" />
                <div className="h-5 w-2/3 bg-muted rounded mx-auto mb-2" />
                <div className="h-4 w-1/2 bg-muted rounded mx-auto" />
              </div>
            ))}
          </div>
        ) : filteredAlumni.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-3xl max-w-xl mx-auto">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-heading text-xl text-foreground mb-2">No alumni found</h3>
            <p className="text-muted-foreground text-sm">
              {searchTerm || selectedResearchArea !== 'all'
                ? 'Try adjusting your search query or research area filter.'
                : 'Alumni will appear here once added and categorized.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlumni.map((alumnus) => {
              const slug = alumnus.username || alumnus.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              return (
                <Link
                  key={alumnus.id}
                  to={`/alumni/${slug}`}
                  className="group bg-card rounded-2xl border border-border p-6 shadow-card hover:shadow-elevated hover:border-accent/40 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Photo & Name */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border group-hover:border-accent transition-colors shrink-0 bg-secondary">
                        <img
                          src={alumnus.photoUrl || '/photos/blank_profile.png'}
                          alt={alumnus.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-heading font-semibold text-foreground group-hover:text-accent transition-colors text-lg truncate">
                          {alumnus.name}
                        </h3>
                        {alumnus.researchArea && (
                          <span className="inline-block px-2.5 py-0.5 rounded-md bg-secondary text-secondary-foreground text-[11px] font-medium mt-1 truncate">
                            {alumnus.researchArea}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Current Position (Prominent) */}
                    <div className="mb-4 bg-secondary/60 rounded-xl p-3 border border-border/50">
                      <div className="flex items-start gap-2">
                        <Briefcase className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {alumnus.currentTitle || alumnus.title || 'Alumnus'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {alumnus.currentOrganization || 'Research Institution'}
                          </p>
                        </div>
                      </div>
                      {(alumnus.currentDepartment || alumnus.location) && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2 pt-2 border-t border-border/40 truncate">
                          <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                          <span className="truncate">
                            {[alumnus.currentDepartment, alumnus.location].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Former Lab Affiliation (Secondary) */}
                    <div className="text-xs text-muted-foreground mb-4 space-y-1">
                      {alumnus.formerRole && (
                        <p><span className="font-medium text-foreground">Former Lab Role:</span> {alumnus.formerRole}</p>
                      )}
                      {alumnus.labAffiliation && (
                        <p><span className="font-medium text-foreground">Lab Period:</span> {alumnus.labAffiliation}</p>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {alumnus.googleScholarLink && (
                        <span className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-accent transition-colors" title="Google Scholar">
                          <BookOpen className="w-3.5 h-3.5" />
                        </span>
                      )}
                      {alumnus.socialLinks?.some((l) => l.platform.toLowerCase().includes('linkedin')) && (
                        <span className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-accent transition-colors" title="LinkedIn">
                          <Linkedin className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent group-hover:underline">
                      View Profile
                      <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
