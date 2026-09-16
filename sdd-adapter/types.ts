export interface SddSkillPatternSet {
  skillId: string;
  fileExtensions: string[];
  patterns: SddPattern[];
}

export interface SddPattern {
  id: string;
  name: string;
  description: string;
  severity: string;
  LLevel: number;
  reachability: string;
  sdltStage: string[];
  fix: string;
  regex: string;
}

export interface SddRuntimePatternSet {
  definition: string;
  source: string;
  patterns: SddPattern[];
}

export interface SddSecurityLevel {
  name: string;
  description: string;
  runtimePatterns: string[];
}

export interface SddGateDecision {
  decision: string;
  exitCode: number;
  obsEvent: string;
}

export interface HookPayload {
  session_id: string;
  tool_name: string;
  tool_input: {
    file_path?: string;
    content?: string;
    [key: string]: unknown;
  };
  tool_use_id?: string;
}

export interface GateResult {
  decision: string;
  exitCode: number;
  message: string;
  findings: PatternMatch[];
}

export interface PatternMatch {
  patternId: string;
  patternName: string;
  description: string;
  severity: string;
  LLevel: number;
  reachability: string;
  fix: string;
  lineNumber: number;
  matchedText: string;
}

export interface ObsEvent {
  id: string;
  type: string;
  timestamp: string;
  correlationId: string;
  causationId?: string;
  actor: string;
  source: string;
  payload: Record<string, unknown>;
}

export interface ProvenanceFinding {
  kind: string;
  suspicious: boolean;
  report: string;
  layer?: string;
}

export interface ProvenanceReport {
  ok: boolean;
  kind: string;
  suspicious: boolean;
  report: ProvenanceFinding[];
  cleaned?: string;
  available?: boolean;
  error?: string;
}

export interface ProvenanceCapabilities {
  ok: boolean;
  version?: string;
  tools?: Record<string, boolean>;
  detectors?: Record<string, boolean>;
  available?: boolean;
  error?: string;
}

export interface ProvenanceClientOptions {
  serviceUrl: string;
  apiKey?: string;
  timeoutMs: number;
}

export interface ProvenanceClient {
  health(): Promise<ProvenanceCapabilities>;
  capabilities(): Promise<ProvenanceCapabilities>;
  inspect(fileName: string, content: string, detect?: boolean): Promise<ProvenanceReport>;
  detect(fileName: string, content: string): Promise<ProvenanceReport>;
  clean(fileName: string, content: string, options?: Record<string, unknown>): Promise<ProvenanceReport>;
}

export type DesignEvaluationCategory =
  | "taste" | "heuristics" | "visual" | "ux" | "accessibility"
  | "design-system" | "consistency" | "performance";

export interface DesignEvaluation {
  id: string;
  category: DesignEvaluationCategory;
  score: number;
  issues: Array<{
    severity: "HIGH" | "MEDIUM" | "LOW";
    description: string;
    recommendation: string;
  }>;
  passed: boolean;
  skillUsed: string;
}

export interface DesignContext {
  domain: string;
  keywords: string[];
  suggestedSkills: string[];
  autoInvoked: boolean;
}

export interface AutoInvokeResult {
  invoked: boolean;
  skills: string[];
  confidence: number;
  context: string;
}

export type DriftType =
  | "structural"
  | "behavioral"
  | "contract"
  | "database"
  | "security"
  | "configuration"
  | "documentation"
  | "terminology";

export type DriftClassification =
  | "DECLARATION_WRONG"
  | "CODE_WRONG"
  | "BOTH_OUTDATED"
  | "UNKNOWN";

export type SyncOperation =
  | "SYNC_SDD"
  | "SYNC_CODE"
  | "SYNC_BOTH"
  | "NO_CHANGE"
  | "REVIEW";

export type EpistemicState = "OBSERVED" | "INFERRED" | "DECLARED" | "VERIFIED";

export type ProofType = "STATIC" | "TEST" | "RUNTIME" | "HUMAN" | "EXTERNAL" | "FORMAL";

export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";

export interface DriftRecord {
  id: string;
  type: DriftType;
  classification: DriftClassification;
  confidence: ConfidenceLevel;
  declared: string;
  observed: string;
  evidence: string[];
  syncOp: SyncOperation;
  severity: "HIGH" | "MEDIUM" | "LOW";
  status: "DETECTED" | "REVIEWED" | "ACCEPTED" | "FALSE_POSITIVE" | "FIXED" | "VERIFIED";
  sourceOfTruth?: string;
  epistemicState: EpistemicState;
  excluded?: boolean;
  exclusionReason?: string;
}

export interface SyncPlan {
  id: string;
  driftId: string;
  operation: SyncOperation;
  targetFiles: string[];
  rationale: string;
  requiresApproval: boolean;
}

export interface TraceNode {
  id: string;
  prefix: "R" | "D" | "T" | "C" | "X" | "P";
  type: string;
  artifact: string;
  status: string;
}

export interface TraceChain {
  direction: "forward" | "reverse";
  start: string;
  nodes: TraceNode[];
}

export interface ProofRecord {
  id: string;
  rule: string;
  type: ProofType;
  result: "PASS" | "FAIL" | "PARTIAL";
  confidence: ConfidenceLevel;
  evidence: string[];
}

export interface EvidenceSource {
  id: string;
  type: "STATIC" | "TEST" | "RUNTIME" | "HUMAN" | "EXTERNAL" | "FORMAL";
  path?: string;
  content?: string;
  confidence: ConfidenceLevel;
}

export interface FactRecord {
  id: string;
  statement: string;
  source: "config" | "migration" | "test" | "runtime" | "human";
  confidence: ConfidenceLevel;
  verifiedAt?: string;
}

export interface ConstraintRecord {
  id: string;
  type: "BUSINESS" | "ARCHITECTURE" | "SECURITY" | "COMPLIANCE" | "PERFORMANCE" | "COST" | "TIME" | "TEAM" | "SKILL";
  statement: string;
  hard: boolean;
  source: string;
  appliesTo: string[];
  status: "ACTIVE" | "RELAXED" | "REMOVED";
}

export interface DriftDetectionResult {
  totalDrifts: number;
  byType: Record<DriftType, number>;
  byClassification: Record<DriftClassification, number>;
  items: DriftRecord[];
}

export type ContextLayer = "L0" | "L1" | "L2" | "L3" | "L4" | "L5" | "L6" | "L7" | "L8" | "L9" | "L10";
export type ContextPriority = "P0" | "P1" | "P2" | "P3" | "P4" | "P5" | "P6";
export type Freshness = "FRESH" | "STALE" | "CORRUPT";
export type BudgetRisk = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface ContextBudget {
  maxRefs: number;
  maxTokens: number;
  maxLayers: ContextLayer[];
}

export interface ContextReference {
  id: string;
  layer: ContextLayer;
  priority: ContextPriority;
  score: number;
  included: boolean;
  exclusionReason?: string;
  authority?: string;
  freshness?: Freshness;
}

export interface ContextManifest {
  id: string;
  taskId: string;
  compiledAt: string;
  layers: ContextLayer[];
  included: ContextReference[];
  excluded: ContextReference[];
  budget: ContextBudget;
  budgetUsed: { refs: number; tokens: number };
  confidence: "HIGH" | "MEDIUM" | "LOW";
  freshness: Freshness;
  contradictions: string[];
  version: string;
  invalidatedBy: string[];
}

export interface ContextPack {
  manifest: ContextManifest;
  references: Map<string, string>;
}

export type TypedOutcomeCodes =
  | "SUCCESS"
  | "PARTIAL"
  | "BLOCKED"
  | "NEEDS_CLARIFICATION"
  | "POLICY_VIOLATION"
  | "TOOL_ERROR"
  | "UNSAFE";
