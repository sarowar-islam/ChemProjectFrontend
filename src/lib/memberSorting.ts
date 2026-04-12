import { TeamMember } from '@/services/types';

const POSITION_ORDER: Record<TeamMember['position'], number> = {
  team_leader: 1,
  faculty: 2,
  researcher: 3,
  student: 4,
  Administrative: 5,
};

const TITLE_RANK: Record<string, number> = {
  // Faculty
  'professor': 10,
  'professor & principal investigator': 10,
  'associate professor': 20,
  'assistant professor': 30,
  'lecturer': 40,

  // Researchers
  'post doctoral researcher': 100,
  'post-doctoral researcher': 100,
  'postdoctoral researcher': 100,
  'research associate': 110,
  'research assistant': 120,
  'research assistant (ra)': 120,
  'phd research fellow': 130,
  'phd fellow': 130,
  'mphil research fellow': 140,
  "master's fellowship": 150,
  'masters fellow': 150,
  'visiting researcher': 160,

  // Students
  'phd student': 200,
  'm.phil student': 210,
  'mphil student': 210,
  'masters/m.sc. student': 220,
  'masters/m.sc student': 220,
  'm.sc student': 220,
  'msc student': 220,
  'bachelor/b.sc student': 230,
  'b.sc student': 230,
  'bsc student': 230,

  // Administrative
  'office secretary': 300,
  'lab technician': 310,
  'lab assistant': 320,
  'office assistant': 330,
};

export function normalizeMemberTitle(title: string): string {
  const raw = (title || '').trim();
  const lower = raw.toLowerCase();

  if (!raw) return raw;
  if (lower.includes('computer operator')) return 'Office Assistant';
  if (lower === "master's fellowship") return 'Masters Fellow';
  if (lower === 'masters fellowship') return 'Masters Fellow';
  if (lower === 'phd fellow') return 'PhD Research Fellow';
  if (lower === 'm.phil student') return 'MPhil Student';
  if (lower === 'm.sc student') return 'MSc Student';
  if (lower === 'b.sc student') return 'BSc Student';
  return raw;
}

function getTitleRank(title: string): number {
  const normalized = normalizeMemberTitle(title);
  const exact = TITLE_RANK[normalized.toLowerCase()];
  if (exact !== undefined) return exact;

  const lower = normalized.toLowerCase();
  if (lower.includes('post') && lower.includes('doc')) return 100;
  if (lower.includes('research associate')) return 110;
  if (lower.includes('research assistant')) return 120;
  if (lower.includes('phd') && lower.includes('fellow')) return 130;
  if (lower.includes('mphil') && lower.includes('fellow')) return 140;
  if (lower.includes('master') && lower.includes('fellow')) return 150;
  if (lower.includes('phd') && lower.includes('student')) return 200;
  if (lower.includes('mphil') && lower.includes('student')) return 210;
  if ((lower.includes('msc') || lower.includes('m.sc') || lower.includes('master')) && lower.includes('student')) return 220;
  if ((lower.includes('bsc') || lower.includes('b.sc') || lower.includes('bachelor')) && lower.includes('student')) return 230;
  if (lower.includes('computer operator')) return 330;

  return 999;
}

function getJoinedTime(joinedDate?: string): number {
  if (!joinedDate) return Number.POSITIVE_INFINITY;
  const parsed = Date.parse(joinedDate);
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
}

function compareByTitleAndDate(a: TeamMember, b: TeamMember): number {
  const titleDiff = getTitleRank(a.title) - getTitleRank(b.title);
  if (titleDiff !== 0) return titleDiff;

  const joinDiff = getJoinedTime(a.joinedDate) - getJoinedTime(b.joinedDate);
  if (joinDiff !== 0) return joinDiff;

  return a.name.localeCompare(b.name);
}

export function sortMembersWithinSection(members: TeamMember[]): TeamMember[] {
  return [...members].sort(compareByTitleAndDate);
}

export function sortMembersForAdmin(members: TeamMember[]): TeamMember[] {
  return [...members].sort((a, b) => {
    const positionDiff = POSITION_ORDER[a.position] - POSITION_ORDER[b.position];
    if (positionDiff !== 0) return positionDiff;
    return compareByTitleAndDate(a, b);
  });
}
