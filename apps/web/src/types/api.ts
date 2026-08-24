export type CaseStatus =
  | 'DRAFT'
  | 'DATA_ENTRY'
  | 'VALIDATION'
  | 'CALCULATION'
  | 'VERIFICATION'
  | 'REJECTED'
  | 'CORRECTION'
  | 'APPROVAL'
  | 'AUTHORIZATION'
  | 'ISSUED'
  | 'ARCHIVED';

export type CaseType =
  | 'Superannuation'
  | 'RegularPension'
  | 'FamilyPension'
  | 'EnhancedFamilyPension'
  | 'DrwPension'
  | 'DrwFamilyPension'
  | 'Vrs'
  | 'Lta'
  | 'SpecialPension'
  | 'PensionRevision';

export type PayFixationReason =
  | 'InitialFixation'
  | 'Promotion'
  | 'Fr22'
  | 'Acp'
  | 'Macp'
  | 'Cas'
  | 'FinancialUpgradation'
  | 'PayProtection'
  | 'Revision'
  | 'NotionalIncrement';

export type RevisionReason =
  | 'PayRevision'
  | 'NotionalIncrement'
  | 'ServiceCorrection'
  | 'QualifyingServiceCorrection'
  | 'PensionRevision'
  | 'FamilyPensionRevision'
  | 'DcrgRevision'
  | 'CommutationRevision'
  | 'RecoveryCorrection'
  | 'AdministrativeCorrection'
  | 'Other';

export type WorkflowActionType =
  | 'SubmitForVerification'
  | 'ClaimCase'
  | 'Verify'
  | 'RejectVerification'
  | 'SubmitForApproval'
  | 'Approve'
  | 'ReturnForCorrection'
  | 'SubmitForAuthorization'
  | 'Authorize'
  | 'Issue'
  | 'Archive';

export type DocumentType =
  | 'PayFixationStatement'
  | 'PensionReport'
  | 'FamilyPensionReport'
  | 'DcrgAuthorization'
  | 'CommutationStatement'
  | 'RevisionPensionReport'
  | 'ArrearStatement'
  | 'CalculationSheet'
  | 'OfficialSanctionOrder';

export type MigrationStatus =
  | 'DryRun'
  | 'Imported'
  | 'Normalized'
  | 'Validated'
  | 'Matched'
  | 'Warning'
  | 'Blocked'
  | 'Reviewed'
  | 'Accepted'
  | 'Committed'
  | 'RolledBack';

export type UserRole =
  | 'SYSTEM_ADMIN'
  | 'DATA_ENTRY'
  | 'DEALING_ASSISTANT'
  | 'VERIFIER'
  | 'SUPERINTENDENT'
  | 'AUTHORIZING_OFFICER'
  | 'AUDITOR'
  | 'REPORT_USER'
  | 'READ_ONLY';

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  designation: string;
  ddo_code: string;
  roles: UserRole[];
  is_active: boolean;
}

export interface Employee {
  id: string;
  name: string;
  designation: string;
  group_class: string;
  dob: string;
  doj: string;
  date_regularization?: string;
  date_retirement_or_death: string;
  pr_no: string;
  application_no: string;
  ddo_code: string;
}

export interface ServiceEvent {
  id: string;
  from_date: string;
  to_date: string;
  designation: string;
  nature_of_service: 'Regular' | 'AdHoc' | 'DRW' | 'BreakInService' | 'LWA';
  excluded_days: number;
  remarks?: string;
}

export interface PayHistoryEntry {
  id: string;
  effective_date: string;
  pay_revision: 'Rop1982' | 'Rop1988' | 'Rop1999' | 'Rop2017' | 'Rop2018';
  pay_scale: string;
  grade_pay: number;
  basic_pay: number;
  pay_level?: string;
  reason: string;
}

export interface RecoveryDetails {
  house_building_advance: number;
  motor_car_advance: number;
  overpayment_recovery: number;
  other_deductions: number;
}

export interface CalculationContext {
  case_id: string;
  employee_id: string;
  calculation_date: string;
  rule_version: string;
  engine_version: string;
  rop_version: string;
}

export interface PayFixationCase {
  case_id: string;
  case_no: string;
  case_type: CaseType;
  employee: Employee;
  service_history: ServiceEvent[];
  pay_history: PayHistoryEntry[];
  recovery_details?: RecoveryDetails;
  calculation_context?: CalculationContext;
  non_qualifying_days: number;
  commutation_percentage: number;
  age_next_birthday: number;
}

export interface PersistentCaseRecord {
  case: PayFixationCase;
  status: CaseStatus;
  version: number;
  assigned_to?: string;
  rejection_reason?: string;
  verification_notes?: string;
  approval_notes?: string;
  authorized_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MigrationBatch {
  batch_id: string;
  batch_code: string;
  source_description: string;
  file_name: string;
  file_hash: string;
  total_records: number;
  valid_records: number;
  warning_records: number;
  blocked_records: number;
  match_rate: number;
  status: MigrationStatus;
  created_by: string;
  created_at: string;
}

export interface MigrationComparison {
  component: string;
  excel_value: string;
  payfix_value: string;
  is_matched: boolean;
  match_type: string;
}

export interface MigrationRecord {
  record_id: string;
  batch_id: string;
  source_sheet: string;
  employee_name: string;
  pr_no: string;
  source_values: Record<string, string>;
  normalized_values: Record<string, string>;
  legacy_calculated_pension: number;
  payfix_calculated_pension: number;
  status: MigrationStatus;
  validation_errors: string[];
  comparisons: MigrationComparison[];
}

export interface SystemHealthStatus {
  api_status: string;
  database_status: string;
  backup_status: string;
  audit_chain_status: string;
  rule_engine_status: string;
  storage_status: string;
  last_backup_timestamp: string;
  active_sessions_count: number;
}

export interface BackupRecord {
  backup_id: string;
  filename: string;
  file_size_bytes: number;
  checksum_sha256: string;
  created_at: string;
  created_by: string;
  status: string;
}

export interface IntegrityReport {
  case_id: string;
  official_sanction_no: string;
  case_snapshot_valid: boolean;
  calculation_hash_valid: boolean;
  document_hashes_valid: boolean;
  official_package_hash_valid: boolean;
  audit_chain_valid: boolean;
  overall_status: string;
  verified_at: string;
}

export interface FeatureFlags {
  legacy_excel_import: boolean;
  public_qr_verification: boolean;
  revision_arrears: boolean;
  tamper_evident_audit: boolean;
  digital_signatures: boolean;
}

export interface ParityDiscrepancy {
  discrepancy_id: string;
  case_id: string;
  case_no: string;
  employee_name: string;
  component: string;
  excel_value: string;
  payfix_value: string;
  difference_amount: number;
  classification: 'RuleDifference' | 'SourceDifference' | 'MaterialDifference' | 'RoundingDifference' | 'Unresolved';
  investigation_notes?: string;
  status: 'Open' | 'Investigating' | 'Resolved' | 'Accepted';
  resolved_by?: string;
  resolved_at?: string;
}

export interface PilotMetrics {
  active_pilot_users: number;
  total_cases_processed: number;
  exact_match_percentage: number;
  open_discrepancies_count: number;
  average_calc_time_ms: number;
  workflow_rejections_count: number;
  release_candidate_tag: string;
  certification_status: string;
}

export interface PilotIncident {
  incident_id: string;
  severity: 'P1Critical' | 'P2High' | 'P3Medium' | 'P4Low';
  case_id?: string;
  case_no?: string;
  reported_by: string;
  reported_at: string;
  category: string;
  description: string;
  status: 'Open' | 'Investigating' | 'Resolved';
  resolution?: string;
  resolved_by?: string;
  resolved_at?: string;
}

export interface GoNoGoItem {
  item_code: string;
  category: string;
  requirement: string;
  passed: boolean;
  evidence: string;
}

export interface GoNoGoEvaluation {
  decision: 'Go' | 'ConditionalGo' | 'NoGo';
  evaluated_at: string;
  evaluated_by: string;
  passed_items_count: number;
  total_items_count: number;
  items: GoNoGoItem[];
}

export interface PilotOperationsSummary {
  metrics: PilotMetrics;
  health: SystemHealthStatus;
  open_incidents_count: number;
  go_no_go_status: string;
}

export interface ProductionReleaseManifest {
  release_tag: string;
  release_name: string;
  backend_version: string;
  frontend_version: string;
  db_migration_version: string;
  rule_set_version: string;
  importer_version: string;
  release_certificate_hash: string;
  manifest_sha256: string;
  released_at: string;
  status: string;
}

export interface ProductionCutoverRecord {
  cutover_id: string;
  release_tag: string;
  cutover_date: string;
  legacy_excel_archive_hash: string;
  final_migration_batch_id: string;
  final_backup_id: string;
  integrity_status: string;
  smoke_test_status: string;
  authorized_by: string;
  status: string;
}

export interface ProductionSmokeTestResult {
  test_name: string;
  passed: boolean;
  latency_ms: number;
  details: string;
}

export interface OperationalAlert {
  alert_id: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  category: string;
  message: string;
  triggered_at: string;
  acknowledged: boolean;
}

export interface DailyOperationsReport {
  report_date: string;
  cases_created: number;
  cases_calculated: number;
  cases_verified: number;
  cases_approved: number;
  cases_authorized: number;
  documents_issued: number;
  calculation_errors: number;
  security_incidents: number;
  system_health: string;
  backup_status: string;
  audit_integrity_status: string;
  generated_at: string;
}

export interface UserAccessRecord {
  user_id: string;
  username: string;
  full_name: string;
  role: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'DISABLED';
  last_login: string;
  department: string;
}

export interface ContinuousMonitoringSummary {
  system_status: string;
  active_alerts_count: number;
  daily_report: DailyOperationsReport;
  alerts: OperationalAlert[];
  user_records: UserAccessRecord[];
}

export interface RuleRegistryEntry {
  rule_id: string;
  rule_code: string;
  rule_name: string;
  category: string;
  authority: string;
  source_order_no: string;
  source_order_date: string;
  source_document_hash: string;
  active_version_tag: string;
  effective_from: string;
  effective_to?: string;
  created_at: string;
}

export interface RuleVersionDetail {
  version_id: string;
  rule_id: string;
  version_tag: string;
  status: string;
  effective_from: string;
  effective_to?: string;
  value_json: string;
  content_hash: string;
  created_by: string;
  approved_by?: string;
  approved_at?: string;
}

export interface RuleImpactAnalysis {
  proposal_id: string;
  rule_code: string;
  proposed_version_tag: string;
  affected_engines: string[];
  affected_test_count: number;
  affected_rule_paths_count: number;
  potential_historical_cases_count: number;
  impact_summary: string;
}

export interface RuleRegressionReport {
  proposal_id: string;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  status: string;
  executed_at: string;
}

export interface RuleSimulationRequest {
  case_id: string;
  current_version_tag: string;
  proposed_version_tag: string;
}

export interface RuleSimulationResult {
  case_id: string;
  current_pension: number;
  proposed_pension: number;
  current_dcrg: number;
  proposed_dcrg: number;
  current_commutation: number;
  proposed_commutation: number;
  financial_delta_pension: number;
  financial_delta_commutation: number;
  simulation_summary: string;
}

export interface MisOverviewMetrics {
  total_cases: number;
  authorized_cases: number;
  pending_cases: number;
  revision_cases: number;
  avg_processing_days: number;
  pension_authorized: number;
  dcrg_authorized: number;
  commutation_authorized: number;
  arrears_authorized: number;
  critical_incidents: number;
  audit_integrity_status: string;
  backup_status: string;
}

export interface WorkflowPipelineStage {
  stage_name: string;
  pending_count: number;
  avg_days_in_stage: number;
  oldest_case_no: string;
  oldest_days: number;
}

export interface AgingBucket {
  bucket_range: string;
  count: number;
}

export interface FinancialLiabilitySummary {
  period_name: string;
  financial_year: string;
  pension_authorized: number;
  family_pension_authorized: number;
  dcrg_authorized: number;
  commutation_authorized: number;
  arrears_authorized: number;
  pending_pension_liability: number;
  pending_dcrg_liability: number;
}

export interface RevisionAnalyticsSummary {
  total_revisions: number;
  pay_revision_count: number;
  service_correction_count: number;
  pension_revision_count: number;
  additional_pension_liability: number;
  total_arrears_authorized: number;
}

export interface MigrationAnalyticsSummary {
  imported_cases: number;
  exact_matches: number;
  warnings: number;
  material_differences: number;
  match_percentage: number;
}

export interface ReportExportRecord {
  export_id: string;
  report_type: string;
  financial_year: string;
  exported_by: string;
  exported_at: string;
  record_count: number;
  export_hash: string;
}

export interface RevisionCase {
  revision_id: string;
  original_case_id: string;
  predecessor_revision_id?: string;
  revision_number: string;
  reason: RevisionReason;
  effective_date: string;
  original_snapshot_id: string;
  revised_snapshot_id?: string;
  requested_by: string;
  requested_at: string;
  status: CaseStatus;
}

export interface RevisionDifference {
  category: 'PAY' | 'SERVICE' | 'PENSION' | 'DCRG' | 'COMMUTATION';
  field_name: string;
  old_value: string;
  new_value: string;
  difference_value: number;
}

export interface ArrearPeriod {
  year_month: string;
  old_monthly_amount: number;
  revised_monthly_amount: number;
  monthly_difference: number;
}

export interface ArrearCalculationResult {
  gross_arrears: number;
  amount_already_paid: number;
  recoveries: number;
  net_arrears_payable: number;
  periods: ArrearPeriod[];
}

export interface WorkflowHistoryEntry {
  id: string;
  case_id: string;
  from_status: CaseStatus;
  to_status: CaseStatus;
  action: WorkflowActionType;
  performed_by: string;
  role: string;
  comment?: string;
  calculation_hash?: string;
  timestamp: string;
}

export interface GeneratedDocument {
  document_id: string;
  case_id: string;
  document_type: DocumentType;
  title: string;
  template_code: string;
  template_version: string;
  generated_by: string;
  generated_at: string;
  sha256_hash: string;
  qr_verification_url: string;
  content_html: string;
}

export interface OfficialPackageManifest {
  case_id: string;
  official_sanction_no: string;
  case_no: string;
  employee_name: string;
  generated_at: string;
  package_hash: string;
  documents: GeneratedDocument[];
}

export interface DocumentVerificationResult {
  document_id: string;
  official_sanction_no: string;
  document_type: DocumentType;
  is_valid: boolean;
  issue_date: string;
  sha256_hash: string;
  verification_message: string;
}

export interface ChecklistItem {
  item_code: string;
  item_name: string;
  passed: boolean;
  comment?: string;
}

export interface VerificationChecklist {
  case_id: string;
  items: ChecklistItem[];
  verified_by: string;
  verified_at: string;
}

export interface WorkQueueItem {
  case_id: string;
  case_no: string;
  employee_name: string;
  case_type: CaseType;
  current_status: CaseStatus;
  assigned_to?: string;
  submitted_at: string;
  days_pending: number;
  priority: string;
}

export interface PayFixationInput {
  case_id: string;
  employee_id: string;
  effective_date: string;
  revision: 'Rop1982' | 'Rop1988' | 'Rop1999' | 'Rop2017' | 'Rop2018';
  previous_basic_pay: number;
  pay_level: string;
  reason: PayFixationReason;
}

export interface PayFixationResult {
  previous_basic_pay: number;
  fitment_factor: number;
  calculated_basic_pay: number;
  matched_pay_level: string;
  matched_matrix_index: number;
  final_revised_basic_pay: number;
  increase_amount: number;
  rule_reference: string;
}

export interface PensionCalculationInput {
  case_id: string;
  employee_id: string;
  case_type: CaseType;
  retirement_date: string;
  last_basic_pay: number;
  non_qualifying_days: number;
  commutation_percentage: number;
  age_next_birthday: number;
  pay_fixation_calculation_id?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  dob: string;
  is_eligible: boolean;
}

export interface DcrgCalculationResult {
  gross_dcrg: number;
  statutory_ceiling: number;
  ceiling_applied: boolean;
  recoveries: number;
  amount_already_paid: number;
  net_dcrg: number;
}

export interface CommutationCalculationResult {
  basic_pension: number;
  commuted_percentage: number;
  age_next_birthday: number;
  commutation_factor: number;
  commuted_lump_sum: number;
  reduced_monthly_pension: number;
}

export interface CalculationSession {
  session_id: string;
  case_id: string;
  pay_fixation_result: PayFixationResult;
  pension_result: PensionCalculationResult;
  dcrg_result: DcrgCalculationResult;
  commutation_result: CommutationCalculationResult;
  family_members: FamilyMember[];
  total_net_payable: number;
  is_consistent: boolean;
  package_hash: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: {
    request_id: string;
    timestamp: string;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    page_size: number;
    total_records: number;
    total_pages: number;
    request_id: string;
    timestamp: string;
  };
}

export interface CalculationStep {
  step_number: number;
  step_name: string;
  rule_applied: string;
  input_description: string;
  formula_expression: string;
  result_value: string;
}

export interface PensionCalculationResult {
  calculation_id: string;
  employee_id: string;
  last_basic_pay: number;
  qualifying_service: {
    gross_years: number;
    gross_months: number;
    gross_days: number;
    non_qualifying_days: number;
    net_years: number;
    net_months: number;
    net_days: number;
    half_year_periods: number;
  };
  gross_pension: number;
  family_pension_normal: number;
  family_pension_enhanced: number;
  dcrg_gross: number;
  dcrg_net: number;
  commuted_percentage: number;
  commuted_value: number;
  reduced_pension: number;
  rule_version: string;
}

export interface CalculationResultEnvelope<T = PensionCalculationResult> {
  value: T;
  steps: CalculationStep[];
  warnings: { code: string; message: string }[];
  calculation_hash: string;
}
