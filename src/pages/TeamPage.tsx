import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, GraduationCap, Microscope, BookUser, ExternalLink, LogIn, Crown, Wrench } from 'lucide-react';
import { teamService } from '@/services/team.service';
import { TeamMember } from '@/services/types';

// Title seniority map (lower number = higher seniority)
// Researchers order: Post-doctoral > PhD Fellow > Research Associate > Research Assistant
// Students order: PhD > MPhil > MSc > BSc
const TITLE_SENIORITY: Record<string, number> = {
  // Faculty titles (for sorting within faculty if needed)
  'Professor': 1,
  'Professor & Principal Investigator': 1,
  'Associate Professor': 2,
  'Assistant Professor': 3,
  // Researcher titles (seniority order)
  'Post Doctoral Researcher': 10,
  'Post-Doctoral Researcher': 10,
  'Postdoctoral Researcher': 10,
  'PhD Fellow': 20,
  'PhD Researcher': 20,
  'Research Associate': 30,
  "Master's Fellowship": 35,
  'Research Assistant': 40,
  'Research Assistant (RA)': 40,
  'Visiting Researcher': 45,
  // Student titles (seniority order)
  'PhD Student': 50,
  'MPhil Student': 60,
  'M.Phil Student': 60,
  'MSc Student': 70,
  'M.Sc Student': 70,
  'MSc Researcher': 70,
  'BSc Student': 80,
  'BSc Researcher': 80,
  // Administrative titles
  'Office Secretary': 85,
  'Office Assistant': 86,
  'Lab Technician': 90,
  'Lab Assistant': 95,
};

// Get seniority value for a title (returns high number for unknown titles)
const getTitleSeniority = (title: string): number => {
  // Try exact match first
  if (TITLE_SENIORITY[title] !== undefined) {
    return TITLE_SENIORITY[title];
  }
  // Try case-insensitive match
  const lowerTitle = title.toLowerCase();
  for (const [key, value] of Object.entries(TITLE_SENIORITY)) {
    if (key.toLowerCase() === lowerTitle) {
      return value;
    }
  }
  // Try partial match for common patterns
  if (lowerTitle.includes('post') && lowerTitle.includes('doc')) return 10;
  if (lowerTitle.includes('phd') && lowerTitle.includes('fellow')) return 20;
  if (lowerTitle.includes('phd') && !lowerTitle.includes('student')) return 20;
  if (lowerTitle.includes('research associate')) return 30;
  if (lowerTitle.includes('research assistant') || lowerTitle.includes('(ra)')) return 40;
  if (lowerTitle.includes('phd') && lowerTitle.includes('student')) return 50;
  if (lowerTitle.includes('mphil') || lowerTitle.includes('m.phil')) return 60;
  if (lowerTitle.includes('msc') || lowerTitle.includes('m.sc') || lowerTitle.includes('master')) return 70;
  if (lowerTitle.includes('bsc') || lowerTitle.includes('b.sc') || lowerTitle.includes('bachelor')) return 80;
  // Unknown titles go last
  return 100;
};

// Sort members by title seniority
const sortByTitleSeniority = (members: TeamMember[]): TeamMember[] => {
  return [...members].sort((a, b) => getTitleSeniority(a.title) - getTitleSeniority(b.title));
};

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const fetchMembers = async () => {
      const res = await teamService.getMembers();
      if (res.success && res.data) {
        setMembers(res.data);
      }
      setLoading(false);
    };

    fetchMembers();
  }, []);

  // Group and sort members by position and title seniority
  const teamLeaders = useMemo(() => 
    sortByTitleSeniority(members.filter((m) => m.position === 'team_leader')), [members]);
  const faculty = useMemo(() => 
    sortByTitleSeniority(members.filter((m) => m.position === 'faculty')), [members]);
  const researchers = useMemo(() => 
    sortByTitleSeniority(members.filter((m) => m.position === 'researcher')), [members]);
  const students = useMemo(() => 
    sortByTitleSeniority(members.filter((m) => m.position === 'student')), [members]);
  const Administrative = useMemo(() => 
    sortByTitleSeniority(members.filter((m) => m.position === 'Administrative')), [members]);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-8 sm:py-10 md:py-14 overflow-hidden bg-gradient-to-br from-secondary/70 dark:from-secondary/25 via-secondary/45 dark:via-secondary/15 to-background">
        <div className="absolute top-10 sm:top-20 right-10 sm:right-20 w-48 sm:w-72 h-48 sm:h-72 bg-secondary/70 rounded-full blur-3xl" />
        <div className="absolute bottom-10 sm:bottom-20 left-10 sm:left-20 w-64 sm:w-96 h-64 sm:h-96 bg-secondary/55 rounded-full blur-3xl" />
        
        <div className="container-wide relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#166534] dark:text-foreground mb-4 sm:mb-6 animate-fade-in-up" style={{ letterSpacing: '-0.02em' }}>
              Our Research Team
            </h1>
            <p className="text-sm sm:text-lg md:text-xl text-muted-foreground animate-fade-in-up px-4 mb-4" style={{ animationDelay: '0.1s' }}>
              Meet the dedicated researchers and students driving our scientific discoveries and pushing the boundaries of chemistry.
            </p>
            
            <Link
              to="/teamlogin"
              className="group inline-flex items-center gap-2.5 px-6 py-3 bg-accent text-primary-foreground rounded-xl text-sm font-semibold shadow-lg hover:bg-accent/90 transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              <LogIn className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              Team Member Login
            </Link>
          </div>
        </div>
      </section>

      {/* Team Stats */}
      <section className="container-wide -mt-4 sm:-mt-10 relative z-10 mb-6 sm:mb-8">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto">
          <button
            type="button"
            onClick={() => scrollToSection('team-leader-section')}
            className="bg-card rounded-xl sm:rounded-xl p-3 sm:p-6 shadow-card border border-border text-center animate-fade-in-up hover:border-accent/40 hover:shadow-elevated transition-all duration-300 w-full"
          >
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <GraduationCap className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="font-heading text-lg sm:text-2xl font-bold text-accent">{teamLeaders.length + faculty.length}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Faculty</div>
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('researchers-section')}
            className="bg-card rounded-xl sm:rounded-xl p-3 sm:p-6 shadow-card border border-border text-center animate-fade-in-up hover:border-accent/40 hover:shadow-elevated transition-all duration-300 w-full"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <Microscope className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="font-heading text-lg sm:text-2xl font-bold text-accent">{researchers.length}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Researchers</div>
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('students-section')}
            className="bg-card rounded-xl sm:rounded-xl p-3 sm:p-6 shadow-card border border-border text-center animate-fade-in-up hover:border-accent/40 hover:shadow-elevated transition-all duration-300 w-full"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <BookUser className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="font-heading text-lg sm:text-2xl font-bold text-accent">{students.length}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Students</div>
          </button>
        </div>
      </section>

      {/* Team Members */}
      <section className="container-wide pb-10 md:pb-16 bg-background">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card-academic p-6 animate-pulse">
                <div className="w-32 h-32 bg-muted rounded-full mx-auto mb-4" />
                <div className="h-5 w-2/3 bg-muted rounded mx-auto mb-2" />
                <div className="h-4 w-1/2 bg-muted rounded mx-auto" />
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-10 bg-secondary rounded-3xl">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-heading text-xl text-foreground mb-2">No team members found</h3>
            <p className="text-muted-foreground">Team members will appear here once added.</p>
          </div>
        ) : (
          <div className="space-y-20">
            {/* Team Leader */}
            {teamLeaders.length > 0 && (
              <div id="team-leader-section">
                <TeamSection 
                  title="Team Leader" 
                  subtitle="Leading our research group"
                  icon={<Crown className="w-5 h-5" />}
                  members={teamLeaders} 
                  startIndex={0}
                  featured
                />
              </div>
            )}

            {/* Faculty */}
            {faculty.length > 0 && (
              <TeamSection 
                title="Faculty" 
                subtitle="Leading our research initiatives"
                icon={<GraduationCap className="w-5 h-5" />}
                members={faculty} 
                startIndex={teamLeaders.length}
                featured
              />
            )}

            {/* Researchers */}
            {researchers.length > 0 && (
              <div id="researchers-section">
                <TeamSection
                  title="Researchers"
                  subtitle="PhD scholars and research associates"
                  icon={<Microscope className="w-5 h-5" />}
                  members={researchers}
                  startIndex={teamLeaders.length + faculty.length}
                />
              </div>
            )}

            {/* Students */}
            {students.length > 0 && (
              <div id="students-section">
                <TeamSection
                  title="Students"
                  subtitle="The future of chemistry research"
                  icon={<BookUser className="w-5 h-5" />}
                  members={students}
                  startIndex={teamLeaders.length + faculty.length + researchers.length}
                />
              </div>
            )}

            {/* Administrative */}
            {Administrative.length > 0 && (
              <TeamSection
                title="Administrative"
                subtitle="Supporting our research operations"
                icon={<Wrench className="w-5 h-5" />}
                members={Administrative}
                startIndex={teamLeaders.length + faculty.length + researchers.length + students.length}
              />
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function TeamSection({
  title,
  subtitle,
  icon,
  members,
  startIndex,
  featured,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  members: TeamMember[];
  startIndex: number;
  featured?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 rounded-xl bg-secondary text-secondary-foreground">
          {icon}
        </div>
        <div>
          <h2 className="font-heading text-2xl md:text-3xl text-[#166534] dark:text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent ml-4" />
      </div>
      <div className={`grid grid-cols-1 ${featured ? 'sm:grid-cols-2 lg:grid-cols-3' : 'xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'} gap-4 sm:gap-6`}>
        {members.map((member, index) => (
          <MemberCard
            key={member.id}
            member={member}
            delay={`${(startIndex + index) * 0.05}s`}
            featured={featured}
          />
        ))}
      </div>
    </div>
  );
}

function MemberCard({ member, delay, featured }: { member: TeamMember; delay: string; featured?: boolean }) {
  return (
    <Link
      to={`/team/${member.username}`}
      className={`group relative bg-card rounded-xl sm:rounded-2xl border border-border overflow-hidden hover:shadow-elevated hover:border-accent/30 transition-all duration-300 animate-fade-in-up ${featured ? 'p-4 sm:p-8' : 'p-4 sm:p-6'}`}
      style={{ animationDelay: delay }}
    >
      <div className="absolute top-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-b from-secondary/80 to-transparent" />
      
      <div className="relative text-center">
        <div className={`relative mx-auto mb-3 sm:mb-4 overflow-hidden rounded-full border-2 sm:border-4 border-white shadow-lg group-hover:border-[#15803D] transition-colors ${featured ? 'w-24 h-24 sm:w-36 sm:h-36' : 'w-20 h-20 sm:w-28 sm:h-28'}`}>
          <img
            src={member.photoUrl || '/photos/blank_profile.png'}
            alt={member.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        
        <h3 className={`font-heading font-semibold text-foreground group-hover:text-accent transition-colors ${featured ? 'text-base sm:text-xl' : 'text-sm sm:text-lg'}`}>
          {member.name}
        </h3>
        <p className="text-xs sm:text-sm text-secondary-foreground mt-1">{member.title}</p>
        
        {member.researchArea && (
          <div className="mt-2 sm:mt-3 inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-secondary text-secondary-foreground text-[10px] sm:text-xs font-medium">
            {member.researchArea}
          </div>
        )}

        {/* Expertise Tags */}
        {member.expertise && member.expertise.length > 0 && (
          <div className="mt-2 flex flex-wrap justify-center gap-1">
            {member.expertise.slice(0, 2).map((exp) => (
              <span
                key={exp}
                className="text-[9px] sm:text-[10px] px-1.5 py-0.5 bg-secondary text-muted-foreground rounded"
              >
                {exp}
              </span>
            ))}
            {member.expertise.length > 2 && (
              <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 text-muted-foreground">
                +{member.expertise.length - 2}
              </span>
            )}
          </div>
        )}
        
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground group-hover:text-accent transition-colors">
            <ExternalLink className="w-3 h-3" />
            View Profile
          </span>
        </div>
      </div>
    </Link>
  );
}
