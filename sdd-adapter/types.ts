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
