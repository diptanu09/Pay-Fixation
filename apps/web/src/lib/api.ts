import type {
  ApiResponse,
  PaginatedResponse,
  PersistentCaseRecord,
  User,
  CalculationResultEnvelope,
  PayFixationCase,
  PayFixationInput,
  PayFixationResult,
  PensionCalculationInput,
  PensionCalculationResult,
  CalculationSession,
  RevisionCase,
  RevisionDifference,
  ArrearCalculationResult,
  RevisionReason,
  WorkQueueItem,
  WorkflowHistoryEntry,
  GeneratedDocument,
  OfficialPackageManifest,
  DocumentVerificationResult,
  MigrationBatch,
  MigrationRecord,
  SystemHealthStatus,
  BackupRecord,
  IntegrityReport,
  FeatureFlags,
  ParityDiscrepancy,
  PilotMetrics,
  PilotIncident,
  GoNoGoEvaluation,
  PilotOperationsSummary,
  ProductionReleaseManifest,
  ProductionCutoverRecord,
  ProductionSmokeTestResult,
  DailyOperationsReport,
  UserAccessRecord,
  ContinuousMonitoringSummary,
  RuleRegistryEntry,
  RuleVersionDetail,
  RuleImpactAnalysis,
  RuleRegressionReport,
  RuleSimulationResult,
  MisOverviewMetrics,
  WorkflowPipelineStage,
  AgingBucket,
  FinancialLiabilitySummary,
  RevisionAnalyticsSummary,
  MigrationAnalyticsSummary,
  ReportExportRecord,
} from '../types/api';

const API_BASE = '/api/v1';

async function safeJsonFetch<T>(res: Response, defaultError = 'API request failed'): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const json = await res.json();
    if (!res.ok || json.success === false) {
      throw new Error(json.error?.message || json.message || defaultError);
    }
    return json.data !== undefined ? json.data : json;
  }
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `${defaultError} (Status ${res.status})`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(text || defaultError);
  }
}

export async function loginApi(username: string, password: string): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return safeJsonFetch<{ token: string; user: User }>(res, 'Authentication failed');
}

export async function fetchSystemDiagnosticsApi(): Promise<SystemHealthStatus> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/system/diagnostics`, { headers });
  const json: ApiResponse<SystemHealthStatus> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to fetch diagnostics');
  }
  return json.data;
}

export async function triggerBackupApi(): Promise<BackupRecord> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/system/backup`, { method: 'POST', headers });
  const json: ApiResponse<BackupRecord> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Backup failed');
  }
  return json.data;
}

export async function executeDrDrillApi(): Promise<string> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/system/dr-drill`, { method: 'POST', headers });
  const json: ApiResponse<string> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'DR drill failed');
  }
  return json.data;
}

export async function verifyCaseIntegrityApi(caseId: string): Promise<IntegrityReport> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/integrity/cases/${caseId}`, { headers });
  const json: ApiResponse<IntegrityReport> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Integrity check failed');
  }
  return json.data;
}

export async function fetchFeatureFlagsApi(): Promise<FeatureFlags> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/system/feature-flags`, { headers });
  const json: ApiResponse<FeatureFlags> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to fetch feature flags');
  }
  return json.data;
}

export async function fetchPilotMetricsApi(): Promise<PilotMetrics> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/pilot/dashboard`, { headers });
  const json: ApiResponse<PilotMetrics> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to fetch pilot metrics');
  }
  return json.data;
}

export async function fetchDiscrepanciesApi(): Promise<ParityDiscrepancy[]> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/discrepancies`, { headers });
  const json: ApiResponse<ParityDiscrepancy[]> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to fetch discrepancies');
  }
  return json.data;
}

export async function resolveDiscrepancyApi(discrepancyId: string, notes: string): Promise<ParityDiscrepancy> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/discrepancies/${discrepancyId}/resolve`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ notes }),
  });
  const json: ApiResponse<ParityDiscrepancy> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to resolve discrepancy');
  }
  return json.data;
}

export async function fetchReleaseCertificationApi(): Promise<any> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/pilot/release-certification`, { headers });
  const json: ApiResponse<any> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to fetch release certification');
  }
  return json.data;
}

export async function fetchPilotOperationsApi(): Promise<PilotOperationsSummary> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/pilot/operations`, { headers });
  const json: ApiResponse<PilotOperationsSummary> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to fetch pilot operations summary');
  }
  return json.data;
}

export async function fetchPilotIncidentsApi(): Promise<PilotIncident[]> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/pilot/incidents`, { headers });
  const json: ApiResponse<PilotIncident[]> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to fetch pilot incidents');
  }
  return json.data;
}

export async function createPilotIncidentApi(incident: Partial<PilotIncident>): Promise<PilotIncident> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/pilot/incidents`, {
    method: 'POST',
    headers,
    body: JSON.stringify(incident),
  });
  const json: ApiResponse<PilotIncident> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to report incident');
  }
  return json.data;
}

export async function resolvePilotIncidentApi(incidentId: string, resolution: string): Promise<PilotIncident> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/pilot/incidents/${incidentId}/resolve`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ resolution }),
  });
  const json: ApiResponse<PilotIncident> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to resolve incident');
  }
  return json.data;
}

export async function fetchPilotReadinessApi(): Promise<GoNoGoEvaluation> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/pilot/readiness`, { headers });
  const json: ApiResponse<GoNoGoEvaluation> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to fetch pilot readiness');
  }
  return json.data;
}

export async function evaluateGoNoGoApi(): Promise<GoNoGoEvaluation> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/pilot/go-no-go`, { method: 'POST', headers });
  const json: ApiResponse<GoNoGoEvaluation> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to evaluate Go/No-Go readiness');
  }
  return json.data;
}

export async function fetchProductionManifestApi(): Promise<ProductionReleaseManifest> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/production/manifest`, { headers });
  const json: ApiResponse<ProductionReleaseManifest> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to fetch production manifest');
  }
  return json.data;
}

export async function executeCutoverApi(): Promise<ProductionCutoverRecord> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/production/cutover`, { method: 'POST', headers });
  const json: ApiResponse<ProductionCutoverRecord> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to execute production cutover');
  }
  return json.data;
}

export async function runProductionSmokeTestApi(): Promise<ProductionSmokeTestResult[]> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/production/smoke-test`, { method: 'POST', headers });
  const json: ApiResponse<ProductionSmokeTestResult[]> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Production smoke test failed');
  }
  return json.data;
}

export async function triggerEmergencyRollbackApi(): Promise<string> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/production/rollback`, { method: 'POST', headers });
  const json: ApiResponse<string> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Emergency rollback failed');
  }
  return json.data;
}

export async function fetchOperationsProbesApi(): Promise<ContinuousMonitoringSummary> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/operations/health`, { headers });
  const json: ApiResponse<ContinuousMonitoringSummary> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to fetch operations probes');
  }
  return json.data;
}

export async function fetchDailyOperationsReportApi(): Promise<DailyOperationsReport> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/operations/daily-report`, { headers });
  const json: ApiResponse<DailyOperationsReport> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to fetch daily operations report');
  }
  return json.data;
}

export async function fetchUserAccessRecordsApi(): Promise<UserAccessRecord[]> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/operations/users`, { headers });
  const json: ApiResponse<UserAccessRecord[]> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to fetch user access records');
  }
  return json.data;
}

export async function updateUserStatusApi(id: string, status: string): Promise<UserAccessRecord> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/operations/users/${id}/status`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ status }),
  });
  const json: ApiResponse<UserAccessRecord> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to update user status');
  }
  return json.data;
}

export async function fetchRuleRegistryApi(): Promise<RuleRegistryEntry[]> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/rule-registry`, { headers });
  const json: ApiResponse<RuleRegistryEntry[]> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to fetch rule registry');
  }
  return json.data;
}

export async function fetchRuleDetailsApi(ruleId: string): Promise<RuleVersionDetail[]> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/rule-registry/${ruleId}`, { headers });
  const json: ApiResponse<RuleVersionDetail[]> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to fetch rule version details');
  }
  return json.data;
}

export async function createRuleProposalApi(payload: any): Promise<RuleRegistryEntry> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/rule-registry`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const json: ApiResponse<RuleRegistryEntry> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to create rule proposal');
  }
  return json.data;
}

export async function runImpactAnalysisApi(ruleId: string): Promise<RuleImpactAnalysis> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/rule-registry/${ruleId}/impact-analysis`, {
    method: 'POST',
    headers,
  });
  const json: ApiResponse<RuleImpactAnalysis> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to run impact analysis');
  }
  return json.data;
}

export async function runRuleRegressionApi(proposalId: string): Promise<RuleRegressionReport> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/rule-changes/${proposalId}/run-tests`, {
    method: 'POST',
    headers,
  });
  const json: ApiResponse<RuleRegressionReport> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to run rule regression suite');
  }
  return json.data;
}

export async function approveRuleProposalApi(proposalId: string): Promise<string> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/rule-changes/${proposalId}/approve`, {
    method: 'POST',
    headers,
  });
  const json: ApiResponse<string> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to approve rule proposal');
  }
  return json.data;
}

export async function activateRuleApi(proposalId: string): Promise<string> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/rule-changes/${proposalId}/activate`, {
    method: 'POST',
    headers,
  });
  const json: ApiResponse<string> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to activate rule version');
  }
  return json.data;
}

export async function simulateRuleChangeApi(caseId: string): Promise<RuleSimulationResult> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/rules/simulate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      case_id: caseId,
      current_version_tag: '2026.01',
      proposed_version_tag: '2027.01-PROPOSED',
    }),
  });
  const json: ApiResponse<RuleSimulationResult> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to simulate rule change');
  }
  return json.data;
}

export async function fetchMisOverviewApi(): Promise<MisOverviewMetrics> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/mis/overview`, { headers });
  const json: ApiResponse<MisOverviewMetrics> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to fetch MIS overview metrics');
  }
  return json.data;
}

export async function fetchMisWorkflowApi(): Promise<WorkflowPipelineStage[]> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/mis/workflow`, { headers });
  const json: ApiResponse<WorkflowPipelineStage[]> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to fetch MIS workflow pipeline');
  }
  return json.data;
}

export async function fetchMisAgingApi(): Promise<AgingBucket[]> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/mis/aging`, { headers });
  const json: ApiResponse<AgingBucket[]> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to fetch MIS aging buckets');
  }
  return json.data;
}

export async function fetchMisFinancialApi(): Promise<FinancialLiabilitySummary> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/mis/financial`, { headers });
  const json: ApiResponse<FinancialLiabilitySummary> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to fetch MIS financial liabilities');
  }
  return json.data;
}

export async function fetchMisRevisionsApi(): Promise<RevisionAnalyticsSummary> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/mis/revisions`, { headers });
  const json: ApiResponse<RevisionAnalyticsSummary> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to fetch MIS revision analytics');
  }
  return json.data;
}

export async function fetchMisMigrationApi(): Promise<MigrationAnalyticsSummary> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/mis/migration`, { headers });
  const json: ApiResponse<MigrationAnalyticsSummary> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to fetch MIS migration analytics');
  }
  return json.data;
}

export async function exportMisReportApi(reportType: string, financialYear: string, format: string): Promise<ReportExportRecord> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/mis/reports/export`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ report_type: reportType, financial_year: financialYear, format }),
  });
  const json: ApiResponse<ReportExportRecord> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to export MIS report');
  }
  return json.data;
}

export async function fetchCasesApi(query = ''): Promise<PaginatedResponse<PersistentCaseRecord>> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/cases?search=${encodeURIComponent(query)}`, { headers });
  const json = await res.json();
  return json;
}

export async function dryRunMigrationApi(): Promise<MigrationBatch> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/migrations/dry-run`, {
    method: 'POST',
    headers,
  });
  const json: ApiResponse<MigrationBatch> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Migration dry-run failed');
  }
  return json.data;
}

export async function createMigrationBatchApi(): Promise<MigrationBatch> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/migrations`, {
    method: 'POST',
    headers,
  });
  const json: ApiResponse<MigrationBatch> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to create migration batch');
  }
  return json.data;
}

export async function fetchMigrationBatchesApi(): Promise<MigrationBatch[]> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/migrations`, { headers });
  const json: ApiResponse<MigrationBatch[]> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to fetch migration batches');
  }
  return json.data;
}

export async function fetchMigrationRecordsApi(batchId: string): Promise<MigrationRecord[]> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/migrations/${batchId}/records`, { headers });
  const json: ApiResponse<MigrationRecord[]> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to fetch migration records');
  }
  return json.data;
}

export async function commitMigrationBatchApi(batchId: string): Promise<MigrationBatch> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/migrations/${batchId}/commit`, {
    method: 'POST',
    headers,
  });
  const json: ApiResponse<MigrationBatch> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to commit migration batch');
  }
  return json.data;
}

export async function rollbackMigrationBatchApi(batchId: string): Promise<MigrationBatch> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/migrations/${batchId}/rollback`, {
    method: 'POST',
    headers,
  });
  const json: ApiResponse<MigrationBatch> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to rollback migration batch');
  }
  return json.data;
}

export async function fetchCaseByIdApi(id: string): Promise<PersistentCaseRecord> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/cases/${id}`, { headers });
  return safeJsonFetch<PersistentCaseRecord>(res, 'Case not found');
}

export async function createCaseApi(caseData: Partial<PayFixationCase>): Promise<PersistentCaseRecord> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/cases`, {
    method: 'POST',
    headers,
    body: JSON.stringify(caseData),
  });

  const json: ApiResponse<PersistentCaseRecord> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to create case');
  }
  return json.data;
}

export async function updateCaseApi(id: string, caseData: PayFixationCase): Promise<PersistentCaseRecord> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/cases/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(caseData),
  });

  const json: ApiResponse<PersistentCaseRecord> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to update case');
  }
  return json.data;
}

export async function calculatePensionApi(caseId: string, employee: any, lastBasicPay: number): Promise<CalculationResultEnvelope<PensionCalculationResult>> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const reqBody: PensionCalculationInput = {
    case_id: caseId,
    employee_id: employee.id || window.crypto.randomUUID(),
    case_type: 'Superannuation',
    retirement_date: employee.date_retirement_or_death || '2026-03-31',
    last_basic_pay: lastBasicPay,
    non_qualifying_days: 0,
    commutation_percentage: 40,
    age_next_birthday: 61,
    pay_fixation_calculation_id: 'CALC-000123',
  };

  const res = await fetch(`${API_BASE}/cases/${caseId}/calculate-pension`, {
    method: 'POST',
    headers,
    body: JSON.stringify(reqBody),
  });

  const json: ApiResponse<CalculationResultEnvelope<PensionCalculationResult>> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Pension calculation failed');
  }
  return json.data;
}

export async function calculateSessionApi(caseId: string): Promise<CalculationSession> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/cases/${caseId}/calculate-session`, {
    method: 'POST',
    headers,
  });

  const json: ApiResponse<CalculationSession> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Calculation session failed');
  }
  return json.data;
}

export async function generateDocumentsApi(caseId: string): Promise<GeneratedDocument[]> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/cases/${caseId}/documents/generate`, {
    method: 'POST',
    headers,
  });

  const json: ApiResponse<GeneratedDocument[]> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to generate document suite');
  }
  return json.data;
}

export async function fetchCaseDocumentsApi(caseId: string): Promise<GeneratedDocument[]> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/cases/${caseId}/documents`, { headers });
  const json: ApiResponse<GeneratedDocument[]> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to fetch case documents');
  }
  return json.data;
}

export async function renderDocumentApi(documentId: string): Promise<string> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/documents/${documentId}/render`, { headers });
  return await res.text();
}

export async function verifyDocumentApi(documentId: string): Promise<DocumentVerificationResult> {
  const res = await fetch(`${API_BASE}/documents/${documentId}/verify`);
  const json: ApiResponse<DocumentVerificationResult> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Verification failed');
  }
  return json.data;
}

export async function downloadPackageManifestApi(caseId: string): Promise<OfficialPackageManifest> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/cases/${caseId}/package`, { headers });
  const json: ApiResponse<OfficialPackageManifest> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to fetch package manifest');
  }
  return json.data;
}

export async function fetchWorkQueueApi(queueType: 'verification' | 'approval' | 'authorization'): Promise<WorkQueueItem[]> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/work-queues/${queueType}`, { headers });
  const json: ApiResponse<WorkQueueItem[]> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to fetch work queue');
  }
  return json.data;
}

export async function claimCaseApi(caseId: string, assignedTo: string): Promise<WorkQueueItem> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/cases/${caseId}/claim`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ assigned_to: assignedTo }),
  });

  const json: ApiResponse<WorkQueueItem> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to claim case');
  }
  return json.data;
}

export async function fetchWorkflowHistoryApi(caseId: string): Promise<WorkflowHistoryEntry[]> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/cases/${caseId}/workflow`, { headers });
  const json: ApiResponse<WorkflowHistoryEntry[]> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to fetch workflow history');
  }
  return json.data;
}

export async function issueCaseApi(caseId: string): Promise<string> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/cases/${caseId}/issue`, {
    method: 'POST',
    headers,
  });

  const json: ApiResponse<string> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to issue sanction');
  }
  return json.data;
}

export async function createRevisionApi(caseId: string, reason: RevisionReason, effectiveDate: string): Promise<RevisionCase> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/cases/${caseId}/revisions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ reason, effective_date: effectiveDate }),
  });

  const json: ApiResponse<RevisionCase> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to create revision');
  }
  return json.data;
}

export async function fetchRevisionsByCaseApi(caseId: string): Promise<RevisionCase[]> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/cases/${caseId}/revisions`, { headers });
  const json: ApiResponse<RevisionCase[]> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to fetch revisions');
  }
  return json.data;
}

export async function fetchRevisionComparisonApi(revisionId: string): Promise<RevisionDifference[]> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/revisions/${revisionId}/comparison`, { headers });
  const json: ApiResponse<RevisionDifference[]> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to fetch comparison');
  }
  return json.data;
}

export async function calculateArrearsApi(
  revisionId: string,
  oldPay: number,
  revisedPay: number,
  effectiveDate: string,
  calcDate: string
): Promise<ArrearCalculationResult> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const reqBody = {
    old_monthly_pension: oldPay,
    revised_monthly_pension: revisedPay,
    effective_date: effectiveDate,
    calculation_date: calcDate,
    amount_already_paid: 0,
    recoveries: 0,
  };

  const res = await fetch(`${API_BASE}/revisions/${revisionId}/calculate-arrears`, {
    method: 'POST',
    headers,
    body: JSON.stringify(reqBody),
  });

  const json: ApiResponse<ArrearCalculationResult> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Failed to calculate arrears');
  }
  return json.data;
}

export async function calculatePayFixationApi(input: PayFixationInput): Promise<CalculationResultEnvelope<PayFixationResult>> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/calculations/pay-fixation`, {
    method: 'POST',
    headers,
    body: JSON.stringify(input),
  });

  const json: ApiResponse<CalculationResultEnvelope<PayFixationResult>> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error((json as any).error?.message || 'Pay fixation calculation failed');
  }
  return json.data;
}

export async function transitionWorkflowApi(caseId: string, action: string, version: number, notes?: string): Promise<any> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/cases/${caseId}/${action}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ version, notes }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || `Workflow transition '${action}' failed`);
  }
  return json.data;
}

export interface SaiPensionRecord {
  appln_pk: string;
  application_no: string;
  name: string;
  designation: string;
  pr_no: string;
  group_class: string;
  dob: string;
  doj: string;
  date_retirement_or_death: string;
  ddo_code: string;
  ddo_name?: string;
  spouse?: string;
  spouse_rel?: string;
  case_type?: string;
  pensioner_address?: string;
  phone_mobile?: string;
  source: string;
}

export async function lookupSaiPensionApi(appNo: string): Promise<SaiPensionRecord> {
  const token = localStorage.getItem('payfix_token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/sai-pension/lookup?application_no=${encodeURIComponent(appNo)}`, { headers });
  return safeJsonFetch<SaiPensionRecord>(res, 'Failed to fetch SAI Pension record');
}

