/** Initial design contract. Not a runtime validator or database migration. */
export type Id = string;
export type SourceKind = "github" | "zip" | "folder" | "files" | "none";
export type RuntimeKind = "url" | "sandbox" | "private-runner" | "none";
export type RunState = "draft" | "queued" | "preflight" | "running" | "pausing" |
  "paused" | "canceling" | "finalizing" | "completed" | "failed" | "canceled";
export type AgentState = "queued" | "starting" | "running" | "waiting" |
  "complete" | "partial" | "failed" | "canceled";
export type JourneyOutcome = "pass" | "fail" | "partial" | "code-review-only" | "untested";
export type Severity = "critical" | "high" | "medium" | "low" | "unassessed";
export type FailureType = "BLOCKER" | "PERMISSION FAILURE" | "LOGIC FAILURE" |
  "STATE FAILURE" | "DEAD END" | "RECOVERY FAILURE" | "MISSING STEP" |
  "AMBIGUITY" | "POOR FEEDBACK" | "EDGE CASE" | "REDUNDANT STEP" | "UX FRICTION" | "POLISH";
export type EvidenceBasis = "observed" | "inferred" | "unknown";
export type Verification = "unverified" | "reproduced" | "independently-verified";
export type RetestResult = "resolved" | "improved" | "reproduced" | "unable-to-verify";
export interface Scope { workspaceId: Id; projectId: Id; }
export interface SourceSnapshot extends Scope {
  id: Id; kind: Exclude<SourceKind, "none">; digest: string;
  repository?: string; commitSha?: string; manifestArtifactId: Id; createdAt: string;
}
export interface RuntimeTarget extends Scope {
  id: Id; kind: RuntimeKind; allowedOrigins: string[];
  readiness: "unknown" | "checking" | "ready" | "blocked" | "unavailable";
  sourceCorrespondence: "verified" | "unverified"; deploymentId?: string;
}
export interface Persona {
  id: Id; name: string; role: string; goal: string;
  testAccountReference?: Id; permissions: string[]; knowledge: string;
}
export interface Journey {
  id: Id; personaId: Id; goal: string; preconditions: string[];
  expectedOutcome: string; viewport: { width: number; height: number };
  dependsOn: Id[]; assertionIds: Id[]; requiredCapabilities: string[];
}
export interface TestPlanVersion extends Scope {
  id: Id; version: number; hash: string; intentVersionId: Id;
  sourceSnapshotId?: Id; runtimeTargetId: Id; policyId: Id;
  personas: Persona[]; journeys: Journey[];
  coordinatorModel: string; subagentModel: string; maxRunBudgetUsd: number;
}
export interface Approval extends Scope {
  id: Id; actorId: Id; approvedPlanHash: string; grantedAt: string;
  expiresAt: string; revokedAt?: string;
}
export interface Run extends Scope {
  id: Id; planVersionId: Id; approvalId: Id; attemptIds: Id[];
  state: RunState; coverageState: "unknown" | "partial" | "complete";
  requestedModel: string; actualModels: string[]; sdkVersion: string;
  throughSequence: number; startedAt?: string; finishedAt?: string;
}
export interface EvidenceArtifact extends Scope {
  id: Id; runId: Id; attemptId: Id; agentExecutionId?: Id;
  kind: "screenshot" | "accessibility" | "console" | "network" | "source" |
    "log" | "database" | "external";
  sha256: string; bytes: number; objectKey: string; capturedAt: string;
  redaction: "pending" | "redacted" | "reviewed-safe" | "quarantined";
  originalArtifactId?: Id; runtimeTargetId?: Id; sourceSnapshotId?: Id;
}
export interface Finding extends Scope {
  id: Id; displayId: string; title: string; severity: Severity;
  failureType: FailureType; legacySeverity?: string;
  basis: EvidenceBasis; observedLayer?: EvidenceArtifact["kind"];
  verification: Verification; personaIds: Id[]; journeyIds: Id[];
  expected: string; observed: string; impact: string; reproduction: string[];
  evidenceIds: Id[]; rootCauseHypothesis?: string; recommendedChange: string;
  acceptanceCriteria: string[];
}
export interface RunEvent {
  schemaVersion: 1; eventId: Id; workspaceId: Id; runId: Id; attemptId: Id;
  sequence: number; occurredAt: string; type: string; agentExecutionId?: Id;
  parentInvocationId?: Id;
  /** Payload-specific runtime validation, authorization, and redaction are required. */
  payload: Record<string, unknown>;
}
