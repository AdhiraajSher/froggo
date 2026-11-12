export type RoleType = 'Freelancer' | 'Tenant' | 'Student';
export type ContractRole = RoleType;

export type FindingSeverity = 'high' | 'medium' | 'safe' | 'not_assessed';

export interface DocumentClause {
  id: string; // e.g. "c-001"
  text: string;
  start: number;
  end: number;
  title?: string;
}

export interface DocumentFinding {
  id: string; // e.g. "f-001"
  clauseId: string; // references DocumentClause.id
  category: string;
  severity: FindingSeverity;
  title: string;
  explanation: string;
  suggestedQuestionOrEdit: string;
  quotedText?: string;
  quotedTextVerified?: boolean;
  confidence?: number;
}

export interface StatutoryCheckResult {
  sec27Status: string;
  msme45DayStatus: string;
  tds194JStatus: string;
  sec43BhStatus?: string;
  dpdpStatus?: string;
}

export interface MissingClauseSuggestion {
  title: string;
  wording: string;
  reason: string;
  importance: 'Essential' | 'Recommended';
}

export interface ScorePenalty {
  clauseId: string;
  title: string;
  severity: FindingSeverity;
  points: number;
  reason: string;
}

export interface ScoreBreakdown {
  totalScore: number;
  baseScore: number;
  penalties: ScorePenalty[];
  unassessedClausesCount: number;
  totalClausesCount: number;
  assessedClausesCount: number;
  disclaimer: string;
}

export interface ContractDocument {
  id: string;
  title: string;
  sourceFileName: string;
  rawText: string;
  clauses: DocumentClause[];
  findings: DocumentFinding[];
  score: number; // 0-100 risk score estimate
  scoreBreakdown: ScoreBreakdown;
  role: RoleType;
  createdAt: string; // ISO 8601 string
  isSample?: boolean;
  statutoryChecks: StatutoryCheckResult;
  roleImpact: Record<RoleType, string[]>;
  plainSummary: string[];
  missingClauses: MissingClauseSuggestion[];
}
