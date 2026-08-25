use payfix_domain::{CalculationStep, CalculationWarning, PensionCalculationResult};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CalculationSnapshotDto {
    pub id: Uuid,
    pub case_id: Uuid,
    pub engine_version: String,
    pub rule_version: String,
    pub calculation_hash: String,
    pub input_snapshot: serde_json::Value,
    pub result_snapshot: PensionCalculationResult,
    pub calculation_steps: Vec<CalculationStep>,
    pub warnings: Vec<CalculationWarning>,
    pub is_approved: bool,
    pub is_immutable: bool,
    pub calculated_by: String,
    pub calculated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditLogDto {
    pub id: Uuid,
    pub request_id: Option<String>,
    pub entity_type: String,
    pub entity_id: Uuid,
    pub action: String,
    pub performed_by: String,
    pub user_role: Option<String>,
    pub details: serde_json::Value,
    pub created_at: String,
    pub previous_audit_hash: Option<String>,
    pub current_audit_hash: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Default)]
#[allow(dead_code)]
pub struct CaseQueryFilter {
    pub page: Option<u32>,
    pub page_size: Option<u32>,
    pub sort: Option<String>,
    pub sort_direction: Option<String>,
    pub search: Option<String>,
    pub status: Option<String>,
    pub case_type: Option<String>,
    pub date_from: Option<String>,
    pub date_to: Option<String>,
}
