import organizations from '../../data/organizations.json';
import projects from '../../data/projects.json';
import policies from '../../data/policies.json';
import relations from '../../data/relations.json';
import sources from '../../data/sources.json';
import events from '../../data/events.json';
import changelog from '../../data/changelog.json';
import coverage from '../../data/coverage.json';
import status from '../../data/status.json';
import reviewQueue from '../../data/review_queue.json';

export interface Organization {
  id: string;
  name: string;
  shortName: string;
  englishName: string;
  sector: '증권' | '은행' | '금융지주' | '수탁사' | '공공·인프라' | '핀테크' | '가상자산사업자' | '해외·블록체인';
  parentOrgId: string | null;
  previousNames: { name: string; period: string }[];
  disambiguationNote: string;
  investigationStatus: '조사완료' | '일부조사' | '미조사';
  lastVerifiedAt: string;
  summary: string;
  keyBusinessAreas: string[];
}

export interface Project {
  id: string;
  name: string;
  shortName: string;
  businessArea: string;
  purpose: string;
  targetAssets: string;
  targetClients: string;
  currentStage: '발표·협약' | 'PoC' | '실증' | '제한적 서비스' | '상용 운영' | '보류·종료' | '미확인';
  stageHistory: { stage: string; date: string; evidenceId: string }[];
  keySchedule: { title: string; date: string }[];
  recentProgress: string;
  businessSignificance: {
    verifiedFacts: string;
    analysis: string;
    unverifiedAspects: string;
  };
  remainingIssues: string;
  networks: { name: string; type: string; status: string }[];
  participatingOrgs: { orgId: string; role: string; participationType: string }[];
  relatedPolicyIds: string[];
  lastVerifiedAt: string;
  isSample?: boolean;
}

export interface Policy {
  id: string;
  title: string;
  shortTitle: string;
  authority: string;
  policyType: '법률' | '시행령·감독규정' | '정책 발표' | '입법 추진' | '규제특례' | '감독 지침과 해석' | '실증사업' | '시장 인프라' | '정책연구';
  implementationStatus: '시행 중' | '확정·시행 전' | '추진 중' | '연구·제안';
  currentStage: string;
  stageHistory: { stage: string; date: string; note: string }[];
  nextSchedule: { title: string; date: string } | null;
  keyContent: string;
  applicableTargets: string;
  sourceUrl: string;
  sourceEvidenceId: string;
  lastVerifiedAt: string;
  relatedProjectLinks: { projectId: string; impactType: '직접 적용' | '향후 영향 가능'; description: string }[];
}

export interface Relation {
  id: string;
  source: string;
  target: string;
  relationType: '공동사업' | 'PoC 참여' | '기술 제공' | '수탁' | '투자' | '컨소시엄 참여' | '네트워크 사용';
  role: string;
  verifiedDate: string;
  evidenceSourceId: string;
  evidenceSummary: string;
  networkUsageStatus: string;
}

export interface Source {
  id: string;
  title: string;
  url: string;
  publisher: string;
  docType: string;
  publishedDate: string;
  eventDate: string;
  verifiedDate: string;
  evidenceLevel: '공식 확인' | '언론 보도' | '미확인 주장' | '분석';
  eventId: string;
}

export interface EventItem {
  id: string;
  title: string;
  eventDate: string;
  summary: string;
  relatedOrgIds: string[];
  relatedProjectIds: string[];
  sourceIds: string[];
}

export interface ChangelogItem {
  id: string;
  timestamp: string;
  targetType: 'project' | 'policy' | 'organization';
  targetId: string;
  targetName: string;
  field: string;
  oldValue: string | null;
  newValue: string;
  changeType: string;
  evidenceSourceId: string;
  appliedMode: string;
  summary: string;
}

export interface ReviewItem {
  id: string;
  discoveredAt: string;
  title: string;
  publisher: string;
  url: string;
  matchedEntities: string[];
  issue: string;
  details: string;
  status: string;
}

export const getOrganizations = (): Organization[] => organizations as Organization[];
export const getProjects = (): Project[] => (projects as Project[]).filter(p => !p.isSample);
export const getPolicies = (): Policy[] => policies as Policy[];
export const getRelations = (): Relation[] => relations as Relation[];
export const getSources = (): Source[] => sources as Source[];
export const getEvents = (): EventItem[] => events as EventItem[];
export const getChangelogs = (): ChangelogItem[] => changelog as ChangelogItem[];
export const getCoverage = () => coverage;
export const getStatus = () => status;
export const getReviewQueue = (): ReviewItem[] => reviewQueue as ReviewItem[];

export const getOrganizationById = (id: string): Organization | undefined =>
  getOrganizations().find(o => o.id === id);

export const getProjectById = (id: string): Project | undefined =>
  getProjects().find(p => p.id === id);

export const getPolicyById = (id: string): Policy | undefined =>
  getPolicies().find(p => p.id === id);

export const getSourceById = (id: string): Source | undefined =>
  getSources().find(s => s.id === id);

export const getProjectsForOrg = (orgId: string): Project[] =>
  getProjects().filter(p => p.participatingOrgs.some(part => part.orgId === orgId));

export const getPoliciesForProject = (projectId: string): Policy[] => {
  const proj = getProjectById(projectId);
  if (!proj) return [];
  return getPolicies().filter(pol => proj.relatedPolicyIds.includes(pol.id));
};

export const getProjectsForPolicy = (policyId: string): Project[] => {
  const pol = getPolicyById(policyId);
  if (!pol) return [];
  const pids = pol.relatedProjectLinks.map(l => l.projectId);
  return getProjects().filter(p => pids.includes(p.id));
};

export const isOutdated = (dateStr: string, daysThreshold = 180): boolean => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > daysThreshold;
};
