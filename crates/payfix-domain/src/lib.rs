use chrono::NaiveDate;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum CaseStatus {
    Draft,
    DataEntry,
    Validation,
    Calculation,
    Verification,
    Rejected,
    Correction,
    Approval,
    Authorization,
    Issued,
    Archived,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum CaseType {
    Superannuation,
    RegularPension,
    FamilyPension,
    EnhancedFamilyPension,
    DrwPension,
    DrwFamilyPension,
    Vrs,
    Lta,
    SpecialPension,
    PensionRevision,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum PayRevisionRule {
    Rop1982,
    Rop1988,
    Rop1999,
    Rop2017,
    Rop2018,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum PayFixationReason {
    InitialFixation,
    Promotion,
    Fr22,
    Acp,
    Macp,
    Cas,
    FinancialUpgradation,
    PayProtection,
    Revision,
    NotionalIncrement,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PayFixationInput {
    pub case_id: Uuid,
    pub employee_id: Uuid,
    pub effective_date: NaiveDate,
    pub revision: PayRevisionRule,
    pub previous_basic_pay: Decimal,
    pub pay_level: String,
    pub reason: PayFixationReason,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PayFixationResult {
    pub previous_basic_pay: Decimal,
    pub fitment_factor: Decimal,
    pub calculated_basic_pay: Decimal,
    pub matched_pay_level: String,
    pub matched_matrix_index: u32,
    pub final_revised_basic_pay: Decimal,
    pub increase_amount: Decimal,
    pub rule_reference: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Employee {
    pub id: Uuid,
    pub name: String,
    pub designation: String,
    pub group_class: String,
    pub dob: NaiveDate,
    pub doj: NaiveDate,
    pub date_regularization: Option<NaiveDate>,
    pub date_retirement_or_death: NaiveDate,
    pub pr_no: String,
    pub application_no: String,
    pub ddo_code: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceEvent {
    #[serde(default = "Uuid::new_v4")]
    pub id: Uuid,
    #[serde(default = "default_event_type")]
    pub event_type: String, // Appointment, Regularization, Promotion, CAS-1, CAS-2, ACP-3
    #[serde(default = "default_naive_date")]
    pub effective_date: NaiveDate,
    #[serde(default)]
    pub from_date: Option<NaiveDate>,
    #[serde(default)]
    pub to_date: Option<NaiveDate>,
    #[serde(default = "default_designation")]
    pub designation: String,
    #[serde(default)]
    pub nature_of_service: Option<String>,
    #[serde(default)]
    pub excluded_days: Option<u32>,
    #[serde(default)]
    pub remarks: Option<String>,
}

fn default_event_type() -> String {
    "Regular".to_string()
}
fn default_designation() -> String {
    "Staff".to_string()
}
fn default_naive_date() -> NaiveDate {
    NaiveDate::from_ymd_opt(2020, 1, 1).unwrap()
}
fn default_pay_revision() -> PayRevisionRule {
    PayRevisionRule::Rop2017
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PayHistoryEntry {
    #[serde(default = "Uuid::new_v4")]
    pub id: Uuid,
    #[serde(default = "default_naive_date")]
    pub effective_date: NaiveDate,
    #[serde(default)]
    pub from_date: Option<NaiveDate>,
    #[serde(default)]
    pub to_date: Option<NaiveDate>,
    #[serde(default = "default_pay_revision")]
    pub pay_revision: PayRevisionRule,
    #[serde(default)]
    pub pay_scale: String,
    #[serde(default)]
    pub grade_pay: Decimal,
    #[serde(default)]
    pub basic_pay: Decimal,
    #[serde(default)]
    pub pay_level: Option<String>,
    #[serde(default)]
    pub reason: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FamilyDetails {
    pub spouse_name: Option<String>,
    pub date_of_death: Option<NaiveDate>,
    pub beneficiary_name: String,
    pub relationship: String,
    pub is_eligible_for_family_pension: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecoveryDetails {
    pub house_building_advance: Decimal,
    pub motor_car_advance: Decimal,
    pub overpayment_recovery: Decimal,
    pub other_deductions: Decimal,
}

impl RecoveryDetails {
    pub fn total_recovery(&self) -> Decimal {
        self.house_building_advance + self.motor_car_advance + self.overpayment_recovery + self.other_deductions
    }
}

/// Canonical Unified Case Model for PAYFIX
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PayFixationCase {
    pub case_id: Uuid,
    pub case_no: String,
    pub case_type: CaseType,
    pub employee: Employee,
    pub service_history: Vec<ServiceEvent>,
    pub pay_history: Vec<PayHistoryEntry>,
    pub family_details: Option<FamilyDetails>,
    pub recovery_details: RecoveryDetails,
    pub non_qualifying_days: u32,
    pub commutation_percentage: Decimal,
    pub age_next_birthday: u32,
    pub calculation_context: CalculationContext,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QualifyingService {
    pub gross_years: u32,
    pub gross_months: u32,
    pub gross_days: u32,
    pub non_qualifying_days: u32,
    pub net_years: u32,
    pub net_months: u32,
    pub net_days: u32,
    pub half_year_periods: u32,
}

impl QualifyingService {
    pub fn calculate(
        doj: NaiveDate,
        dor: NaiveDate,
        non_qualifying_days: u32,
    ) -> Self {
        let total_days = (dor - doj).num_days().max(0) as u32 + 1;
        let net_total_days = total_days.saturating_sub(non_qualifying_days);

        let gross_years = total_days / 365;
        let rem_days_gross = total_days % 365;
        let gross_months = rem_days_gross / 30;
        let gross_days = rem_days_gross % 30;

        let net_years = net_total_days / 365;
        let rem_days_net = net_total_days % 365;
        let net_months = rem_days_net / 30;
        let net_days = rem_days_net % 30;

        let mut half_years = net_years * 2;
        if net_months >= 6 {
            half_years += 1;
        }
        let half_year_periods = half_years.min(66);

        Self {
            gross_years,
            gross_months,
            gross_days,
            non_qualifying_days,
            net_years,
            net_months,
            net_days,
            half_year_periods,
        }
    }
}

/// Explicit Execution Context for Calculation Reproducibility
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CalculationContext {
    pub case_id: Uuid,
    pub employee_id: Uuid,
    pub calculation_date: NaiveDate,
    pub rule_version: String,
    pub engine_version: String,
    pub rop_version: PayRevisionRule,
}

/// Step-by-Step Calculation Log for UI Explanation & Audit
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CalculationStep {
    pub step_number: u32,
    pub step_name: String,
    pub rule_applied: String,
    pub input_description: String,
    pub formula_expression: String,
    pub result_value: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CalculationWarning {
    pub code: String,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CalculationResult<T: Serialize> {
    pub value: T,
    pub context: CalculationContext,
    pub steps: Vec<CalculationStep>,
    pub warnings: Vec<CalculationWarning>,
    pub calculation_hash: String,
}

impl<T: Serialize> CalculationResult<T> {
    pub fn compute_sha256_hash(value: &T, context: &CalculationContext, steps: &[CalculationStep]) -> String {
        let mut hasher = Sha256::new();
        if let Ok(val_json) = serde_json::to_string(value) {
            hasher.update(val_json.as_bytes());
        }
        if let Ok(ctx_json) = serde_json::to_string(context) {
            hasher.update(ctx_json.as_bytes());
        }
        if let Ok(steps_json) = serde_json::to_string(steps) {
            hasher.update(steps_json.as_bytes());
        }
        format!("{:x}", hasher.finalize())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PensionCalculationInput {
    pub case_id: Uuid,
    pub employee_id: Uuid,
    pub case_type: CaseType,
    pub retirement_date: NaiveDate,
    pub last_basic_pay: Decimal,
    pub non_qualifying_days: u32,
    pub commutation_percentage: Decimal,
    pub age_next_birthday: u32,
    pub pay_fixation_calculation_id: Option<Uuid>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PensionCalculationRequest {
    pub employee: Employee,
    pub case_type: CaseType,
    pub last_basic_pay: Decimal,
    pub non_qualifying_days: u32,
    pub commutation_percentage: Decimal,
    pub age_next_birthday: u32,
    pub date_cas_1: Option<NaiveDate>,
    pub date_cas_2: Option<NaiveDate>,
    pub date_acp_3: Option<NaiveDate>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PensionCalculationResult {
    pub calculation_id: Uuid,
    pub employee_id: Uuid,
    pub last_basic_pay: Decimal,
    pub qualifying_service: QualifyingService,
    pub gross_pension: Decimal,
    pub family_pension_normal: Decimal,
    pub family_pension_enhanced: Decimal,
    pub dcrg_gross: Decimal,
    pub dcrg_net: Decimal,
    pub commuted_percentage: Decimal,
    pub commuted_value: Decimal,
    pub reduced_pension: Decimal,
    pub rule_version: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FamilyMember {
    pub id: Uuid,
    pub name: String,
    pub relationship: String,
    pub dob: NaiveDate,
    pub is_eligible: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DcrgCalculationInput {
    pub case_id: Uuid,
    pub last_emoluments: Decimal,
    pub half_year_periods: u32,
    pub revision: PayRevisionRule,
    pub amount_already_paid: Decimal,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DcrgCalculationResult {
    pub gross_dcrg: Decimal,
    pub statutory_ceiling: Decimal,
    pub ceiling_applied: bool,
    pub recoveries: Decimal,
    pub amount_already_paid: Decimal,
    pub net_dcrg: Decimal,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommutationCalculationResult {
    pub basic_pension: Decimal,
    pub commuted_percentage: Decimal,
    pub age_next_birthday: u32,
    pub commutation_factor: Decimal,
    pub commuted_lump_sum: Decimal,
    pub reduced_monthly_pension: Decimal,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CalculationSession {
    pub session_id: Uuid,
    pub case_id: Uuid,
    pub pay_fixation_result: PayFixationResult,
    pub pension_result: PensionCalculationResult,
    pub dcrg_result: DcrgCalculationResult,
    pub commutation_result: CommutationCalculationResult,
    pub family_members: Vec<FamilyMember>,
    pub total_net_payable: Decimal,
    pub is_consistent: bool,
    pub package_hash: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum RevisionReason {
    PayRevision,
    NotionalIncrement,
    ServiceCorrection,
    QualifyingServiceCorrection,
    PensionRevision,
    FamilyPensionRevision,
    DcrgRevision,
    CommutationRevision,
    RecoveryCorrection,
    AdministrativeCorrection,
    Other,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RevisionCase {
    pub revision_id: Uuid,
    pub original_case_id: Uuid,
    pub predecessor_revision_id: Option<Uuid>,
    pub revision_number: String,
    pub reason: RevisionReason,
    pub effective_date: NaiveDate,
    pub original_snapshot_id: Uuid,
    pub revised_snapshot_id: Option<Uuid>,
    pub requested_by: String,
    pub requested_at: chrono::DateTime<chrono::Utc>,
    pub status: CaseStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RevisionDifference {
    pub category: String,
    pub field_name: String,
    pub old_value: String,
    pub new_value: String,
    pub difference_value: Decimal,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArrearPeriod {
    pub year_month: String,
    pub old_monthly_amount: Decimal,
    pub revised_monthly_amount: Decimal,
    pub monthly_difference: Decimal,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArrearCalculationInput {
    pub old_monthly_pension: Decimal,
    pub revised_monthly_pension: Decimal,
    pub effective_date: NaiveDate,
    pub calculation_date: NaiveDate,
    pub amount_already_paid: Decimal,
    pub recoveries: Decimal,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArrearCalculationResult {
    pub gross_arrears: Decimal,
    pub amount_already_paid: Decimal,
    pub recoveries: Decimal,
    pub net_arrears_payable: Decimal,
    pub periods: Vec<ArrearPeriod>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum WorkflowActionType {
    SubmitForVerification,
    ClaimCase,
    Verify,
    RejectVerification,
    SubmitForApproval,
    Approve,
    ReturnForCorrection,
    SubmitForAuthorization,
    Authorize,
    Issue,
    Archive,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowHistoryEntry {
    pub id: Uuid,
    pub case_id: Uuid,
    pub from_status: CaseStatus,
    pub to_status: CaseStatus,
    pub action: WorkflowActionType,
    pub performed_by: String,
    pub role: String,
    pub comment: Option<String>,
    pub calculation_hash: Option<String>,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChecklistItem {
    pub item_code: String,
    pub item_name: String,
    pub passed: bool,
    pub comment: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerificationChecklist {
    pub case_id: Uuid,
    pub items: Vec<ChecklistItem>,
    pub verified_by: String,
    pub verified_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OfficialCaseSnapshot {
    pub snapshot_id: Uuid,
    pub case_id: Uuid,
    pub official_sanction_no: String,
    pub case_data: PayFixationCase,
    pub calculation_session: CalculationSession,
    pub workflow_history: Vec<WorkflowHistoryEntry>,
    pub authorized_by: String,
    pub authorized_at: chrono::DateTime<chrono::Utc>,
    pub package_hash: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkQueueItem {
    pub case_id: Uuid,
    pub case_no: String,
    pub employee_name: String,
    pub case_type: CaseType,
    pub current_status: CaseStatus,
    pub assigned_to: Option<String>,
    pub submitted_at: chrono::DateTime<chrono::Utc>,
    pub days_pending: u32,
    pub priority: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum DocumentType {
    PayFixationStatement,
    PensionReport,
    FamilyPensionReport,
    DcrgAuthorization,
    CommutationStatement,
    RevisionPensionReport,
    ArrearStatement,
    CalculationSheet,
    OfficialSanctionOrder,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeneratedDocument {
    pub document_id: Uuid,
    pub case_id: Uuid,
    pub document_type: DocumentType,
    pub title: String,
    pub template_code: String,
    pub template_version: String,
    pub generated_by: String,
    pub generated_at: chrono::DateTime<chrono::Utc>,
    pub sha256_hash: String,
    pub qr_verification_url: String,
    pub content_html: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OfficialPackageManifest {
    pub case_id: Uuid,
    pub official_sanction_no: String,
    pub case_no: String,
    pub employee_name: String,
    pub generated_at: chrono::DateTime<chrono::Utc>,
    pub package_hash: String,
    pub documents: Vec<GeneratedDocument>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentVerificationResult {
    pub document_id: Uuid,
    pub official_sanction_no: String,
    pub document_type: DocumentType,
    pub is_valid: bool,
    pub issue_date: chrono::DateTime<chrono::Utc>,
    pub sha256_hash: String,
    pub verification_message: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum MigrationStatus {
    DryRun,
    Imported,
    Normalized,
    Validated,
    Matched,
    Warning,
    Blocked,
    Reviewed,
    Accepted,
    Committed,
    RolledBack,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MigrationBatch {
    pub batch_id: Uuid,
    pub batch_code: String,
    pub source_description: String,
    pub file_name: String,
    pub file_hash: String,
    pub total_records: u32,
    pub valid_records: u32,
    pub warning_records: u32,
    pub blocked_records: u32,
    pub match_rate: f64,
    pub status: MigrationStatus,
    pub created_by: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MigrationComparison {
    pub component: String,
    pub excel_value: String,
    pub payfix_value: String,
    pub is_matched: bool,
    pub match_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MigrationRecord {
    pub record_id: Uuid,
    pub batch_id: Uuid,
    pub source_sheet: String,
    pub employee_name: String,
    pub pr_no: String,
    pub source_values: std::collections::HashMap<String, String>,
    pub normalized_values: std::collections::HashMap<String, String>,
    pub legacy_calculated_pension: rust_decimal::Decimal,
    pub payfix_calculated_pension: rust_decimal::Decimal,
    pub status: MigrationStatus,
    pub validation_errors: Vec<String>,
    pub comparisons: Vec<MigrationComparison>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MigrationSnapshot {
    pub snapshot_id: Uuid,
    pub batch_id: Uuid,
    pub record_id: Uuid,
    pub source_file_hash: String,
    pub migration_version: String,
    pub committed_case_id: Option<Uuid>,
    pub committed_at: chrono::DateTime<chrono::Utc>,
    pub committed_by: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemHealthStatus {
    pub api_status: String,
    pub database_status: String,
    pub backup_status: String,
    pub audit_chain_status: String,
    pub rule_engine_status: String,
    pub storage_status: String,
    pub last_backup_timestamp: chrono::DateTime<chrono::Utc>,
    pub active_sessions_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackupRecord {
    pub backup_id: Uuid,
    pub filename: String,
    pub file_size_bytes: u64,
    pub checksum_sha256: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub created_by: String,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IntegrityReport {
    pub case_id: Uuid,
    pub official_sanction_no: String,
    pub case_snapshot_valid: bool,
    pub calculation_hash_valid: bool,
    pub document_hashes_valid: bool,
    pub official_package_hash_valid: bool,
    pub audit_chain_valid: bool,
    pub overall_status: String,
    pub verified_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeatureFlags {
    pub legacy_excel_import: bool,
    pub public_qr_verification: bool,
    pub revision_arrears: bool,
    pub tamper_evident_audit: bool,
    pub digital_signatures: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum DiscrepancyClassification {
    RuleDifference,
    SourceDifference,
    MaterialDifference,
    RoundingDifference,
    Unresolved,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum DiscrepancyStatus {
    Open,
    Investigating,
    Resolved,
    Accepted,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParityDiscrepancy {
    pub discrepancy_id: Uuid,
    pub case_id: Uuid,
    pub case_no: String,
    pub employee_name: String,
    pub component: String,
    pub excel_value: String,
    pub payfix_value: String,
    pub difference_amount: rust_decimal::Decimal,
    pub classification: DiscrepancyClassification,
    pub investigation_notes: Option<String>,
    pub status: DiscrepancyStatus,
    pub resolved_by: Option<String>,
    pub resolved_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PilotMetrics {
    pub active_pilot_users: u32,
    pub total_cases_processed: u32,
    pub exact_match_percentage: f64,
    pub open_discrepancies_count: u32,
    pub average_calc_time_ms: u64,
    pub workflow_rejections_count: u32,
    pub release_candidate_tag: String,
    pub certification_status: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum IncidentSeverity {
    P1Critical,
    P2High,
    P3Medium,
    P4Low,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum IncidentStatus {
    Open,
    Investigating,
    Resolved,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PilotIncident {
    pub incident_id: Uuid,
    pub severity: IncidentSeverity,
    pub case_id: Option<Uuid>,
    pub case_no: Option<String>,
    pub reported_by: String,
    pub reported_at: chrono::DateTime<chrono::Utc>,
    pub category: String,
    pub description: String,
    pub status: IncidentStatus,
    pub resolution: Option<String>,
    pub resolved_by: Option<String>,
    pub resolved_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GoNoGoItem {
    pub item_code: String,
    pub category: String,
    pub requirement: String,
    pub passed: bool,
    pub evidence: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum GoNoGoDecision {
    Go,
    ConditionalGo,
    NoGo,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GoNoGoEvaluation {
    pub decision: GoNoGoDecision,
    pub evaluated_at: chrono::DateTime<chrono::Utc>,
    pub evaluated_by: String,
    pub passed_items_count: usize,
    pub total_items_count: usize,
    pub items: Vec<GoNoGoItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PilotOperationsSummary {
    pub metrics: PilotMetrics,
    pub health: SystemHealthStatus,
    pub open_incidents_count: usize,
    pub go_no_go_status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductionReleaseManifest {
    pub release_tag: String,
    pub release_name: String,
    pub backend_version: String,
    pub frontend_version: String,
    pub db_migration_version: String,
    pub rule_set_version: String,
    pub importer_version: String,
    pub release_certificate_hash: String,
    pub manifest_sha256: String,
    pub released_at: chrono::DateTime<chrono::Utc>,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductionCutoverRecord {
    pub cutover_id: Uuid,
    pub release_tag: String,
    pub cutover_date: chrono::DateTime<chrono::Utc>,
    pub legacy_excel_archive_hash: String,
    pub final_migration_batch_id: Uuid,
    pub final_backup_id: Uuid,
    pub integrity_status: String,
    pub smoke_test_status: String,
    pub authorized_by: String,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductionSmokeTestResult {
    pub test_name: String,
    pub passed: bool,
    pub latency_ms: u64,
    pub details: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OperationalAlert {
    pub alert_id: Uuid,
    pub severity: String,
    pub category: String,
    pub message: String,
    pub triggered_at: chrono::DateTime<chrono::Utc>,
    pub acknowledged: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DailyOperationsReport {
    pub report_date: String,
    pub cases_created: usize,
    pub cases_calculated: usize,
    pub cases_verified: usize,
    pub cases_approved: usize,
    pub cases_authorized: usize,
    pub documents_issued: usize,
    pub calculation_errors: usize,
    pub security_incidents: usize,
    pub system_health: String,
    pub backup_status: String,
    pub audit_integrity_status: String,
    pub generated_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserAccessRecord {
    pub user_id: Uuid,
    pub username: String,
    pub full_name: String,
    pub role: String,
    pub status: String,
    pub last_login: chrono::DateTime<chrono::Utc>,
    pub department: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContinuousMonitoringSummary {
    pub system_status: String,
    pub active_alerts_count: usize,
    pub daily_report: DailyOperationsReport,
    pub alerts: Vec<OperationalAlert>,
    pub user_records: Vec<UserAccessRecord>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RuleRegistryEntry {
    pub rule_id: Uuid,
    pub rule_code: String,
    pub rule_name: String,
    pub category: String,
    pub authority: String,
    pub source_order_no: String,
    pub source_order_date: String,
    pub source_document_hash: String,
    pub active_version_tag: String,
    pub effective_from: String,
    pub effective_to: Option<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RuleVersionDetail {
    pub version_id: Uuid,
    pub rule_id: Uuid,
    pub version_tag: String,
    pub status: String,
    pub effective_from: String,
    pub effective_to: Option<String>,
    pub value_json: String,
    pub content_hash: String,
    pub created_by: String,
    pub approved_by: Option<String>,
    pub approved_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RuleImpactAnalysis {
    pub proposal_id: Uuid,
    pub rule_code: String,
    pub proposed_version_tag: String,
    pub affected_engines: Vec<String>,
    pub affected_test_count: usize,
    pub affected_rule_paths_count: usize,
    pub potential_historical_cases_count: usize,
    pub impact_summary: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RuleRegressionReport {
    pub proposal_id: Uuid,
    pub total_tests: usize,
    pub passed_tests: usize,
    pub failed_tests: usize,
    pub status: String,
    pub executed_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RuleSimulationRequest {
    pub case_id: Uuid,
    pub current_version_tag: String,
    pub proposed_version_tag: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RuleSimulationResult {
    pub case_id: Uuid,
    pub current_pension: Decimal,
    pub proposed_pension: Decimal,
    pub current_dcrg: Decimal,
    pub proposed_dcrg: Decimal,
    pub current_commutation: Decimal,
    pub proposed_commutation: Decimal,
    pub financial_delta_pension: Decimal,
    pub financial_delta_commutation: Decimal,
    pub simulation_summary: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MisOverviewMetrics {
    pub total_cases: usize,
    pub authorized_cases: usize,
    pub pending_cases: usize,
    pub revision_cases: usize,
    pub avg_processing_days: f64,
    pub pension_authorized: Decimal,
    pub dcrg_authorized: Decimal,
    pub commutation_authorized: Decimal,
    pub arrears_authorized: Decimal,
    pub critical_incidents: usize,
    pub audit_integrity_status: String,
    pub backup_status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowPipelineStage {
    pub stage_name: String,
    pub pending_count: usize,
    pub avg_days_in_stage: f64,
    pub oldest_case_no: String,
    pub oldest_days: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgingBucket {
    pub bucket_range: String,
    pub count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FinancialLiabilitySummary {
    pub period_name: String,
    pub financial_year: String,
    pub pension_authorized: Decimal,
    pub family_pension_authorized: Decimal,
    pub dcrg_authorized: Decimal,
    pub commutation_authorized: Decimal,
    pub arrears_authorized: Decimal,
    pub pending_pension_liability: Decimal,
    pub pending_dcrg_liability: Decimal,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RevisionAnalyticsSummary {
    pub total_revisions: usize,
    pub pay_revision_count: usize,
    pub service_correction_count: usize,
    pub pension_revision_count: usize,
    pub additional_pension_liability: Decimal,
    pub total_arrears_authorized: Decimal,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MigrationAnalyticsSummary {
    pub imported_cases: usize,
    pub exact_matches: usize,
    pub warnings: usize,
    pub material_differences: usize,
    pub match_percentage: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReportExportRecord {
    pub export_id: Uuid,
    pub report_type: String,
    pub financial_year: String,
    pub exported_by: String,
    pub exported_at: chrono::DateTime<chrono::Utc>,
    pub record_count: usize,
    pub export_hash: String,
}
