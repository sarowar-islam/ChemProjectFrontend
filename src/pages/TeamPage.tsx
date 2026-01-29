import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, GraduationCap, Microscope, BookUser, ExternalLink, LogIn, Crown, Wrench } from 'lucide-react';
import { teamService } from '@/services/team.service';
import { TeamMember } from '@/services/types';

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Group members by position
  const teamLeaders = members.filter((m) => m.position === 'team_leader');
  const faculty = members.filter((m) => m.position === 'faculty');
  const researchers = members.filter((m) => m.position === 'researcher');
  const students = members.filter((m) => m.position === 'student');
  const staff = members.filter((m) => m.position === 'staff');

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[#0F172A]" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        </div>
        <div className="absolute top-10 sm:top-20 right-10 sm:right-20 w-48 sm:w-72 h-48 sm:h-72 bg-[#FACC15]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 sm:bottom-20 left-10 sm:left-20 w-64 sm:w-96 h-64 sm:h-96 bg-white/5 rounded-full blur-3xl" />
        
        <div className="container-wide relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#F8FAFC] mb-4 sm:mb-6 animate-fade-in-up" style={{ letterSpacing: '-0.02em' }}>
              Our Research Team
            </h1>
            <p className="text-sm sm:text-lg md:text-xl text-[#CBD5E1] animate-fade-in-up px-4 mb-8" style={{ animationDelay: '0.1s' }}>
              Meet the dedicated researchers and students driving our scientific discoveries and pushing the boundaries of chemistry.
            </p>
            
            <Link
              to="/teamlogin"
              className="group inline-flex items-center gap-2.5 px-6 py-3 bg-[#FACC15] text-[#0F172A] rounded-xl text-sm font-semibold shadow-lg hover:bg-[#FDE047] transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              <LogIn className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              Team Member Login
            </Link>
          </div>
        </div>
      </section>

      {/* Team Stats */}
      <section className="container-wide -mt-8 sm:-mt-10 relative z-10 mb-12 sm:mb-16">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto">
          <div className="bg-card rounded-xl sm:rounded-xl p-3 sm:p-6 shadow-card border border-border text-center animate-fade-in-up">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-[#FACC15] text-[#0F172A] flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <GraduationCap className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="font-heading text-lg sm:text-2xl font-bold text-[#FACC15]">{teamLeaders.length + faculty.length}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Faculty</div>
          </div>
          <div className="bg-card rounded-xl sm:rounded-xl p-3 sm:p-6 shadow-card border border-border text-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-[#FACC15] text-[#0F172A] flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <Microscope className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="font-heading text-lg sm:text-2xl font-bold text-[#FACC15]">{researchers.length}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Researchers</div>
          </div>
          <div className="bg-card rounded-xl sm:rounded-xl p-3 sm:p-6 shadow-card border border-border text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-[#FACC15] text-[#0F172A] flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <BookUser className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="font-heading text-lg sm:text-2xl font-bold text-[#FACC15]">{students.length}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Students</div>
          </div>
        </div>
      </section>

      {/* Team Members */}
      <section className="container-wide pb-20 md:pb-32">
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
          <div className="text-center py-20 bg-muted/30 rounded-3xl">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-heading text-xl text-foreground mb-2">No team members found</h3>
            <p className="text-muted-foreground">Team members will appear here once added.</p>
          </div>
        ) : (
          <div className="space-y-20">
            {/* Team Leader */}
            {teamLeaders.length > 0 && (
              <TeamSection 
                title="Team Leader" 
                subtitle="Leading our research group"
                icon={<Crown className="w-5 h-5" />}
                members={teamLeaders} 
                startIndex={0}
                featured
              />
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
              <TeamSection
                title="Researchers"
                subtitle="PhD scholars and research associates"
                icon={<Microscope className="w-5 h-5" />}
                members={researchers}
                startIndex={teamLeaders.length + faculty.length}
              />
            )}

            {/* Students */}
            {students.length > 0 && (
              <TeamSection
                title="Students"
                subtitle="The future of chemistry research"
                icon={<BookUser className="w-5 h-5" />}
                members={students}
                startIndex={teamLeaders.length + faculty.length + researchers.length}
              />
            )}

            {/* Staff */}
            {staff.length > 0 && (
              <TeamSection
                title="Staff"
                subtitle="Supporting our research operations"
                icon={<Wrench className="w-5 h-5" />}
                members={staff}
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
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-xl bg-[#FACC15]/15 text-[#FACC15]">
          {icon}
        </div>
        <div>
          <h2 className="font-heading text-2xl md:text-3xl text-foreground">{title}</h2>
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
      className={`group relative bg-card rounded-xl sm:rounded-2xl border border-border overflow-hidden hover:shadow-elevated hover:border-[#FACC15]/25 transition-all duration-300 animate-fade-in-up ${featured ? 'p-4 sm:p-8' : 'p-4 sm:p-6'}`}
      style={{ animationDelay: delay }}
    >
      <div className="absolute top-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-b from-[#FACC15]/5 to-transparent" />
      
      <div className="relative text-center">
        <div className={`relative mx-auto mb-3 sm:mb-4 overflow-hidden rounded-full border-2 sm:border-4 border-background shadow-lg group-hover:border-[#FACC15] transition-colors ${featured ? 'w-24 h-24 sm:w-36 sm:h-36' : 'w-20 h-20 sm:w-28 sm:h-28'}`}>
          <img
            src={member.photoUrl}
            alt={member.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        
        <h3 className={`font-heading font-semibold text-foreground group-hover:text-[#FACC15] transition-colors ${featured ? 'text-base sm:text-xl' : 'text-sm sm:text-lg'}`}>
          {member.name}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">{member.title}</p>
        
        {member.researchArea && (
          <div className="mt-2 sm:mt-3 inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#FACC15]/10 text-[#FACC15] text-[10px] sm:text-xs font-medium">
            {member.researchArea}
          </div>
        )}

        {/* Expertise Tags */}
        {member.expertise && member.expertise.length > 0 && (
          <div className="mt-2 flex flex-wrap justify-center gap-1">
            {member.expertise.slice(0, 2).map((exp) => (
              <span
                key={exp}
                className="text-[9px] sm:text-[10px] px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded"
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
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground group-hover:text-[#FACC15] transition-colors">
            <ExternalLink className="w-3 h-3" />
            View Profile
          </span>
        </div>
      </div>
    </Link>
  );
}
