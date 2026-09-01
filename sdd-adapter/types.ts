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
