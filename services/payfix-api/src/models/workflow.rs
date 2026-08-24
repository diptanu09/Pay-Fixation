use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
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

impl CaseStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            CaseStatus::Draft => "DRAFT",
            CaseStatus::DataEntry => "DATA_ENTRY",
            CaseStatus::Validation => "VALIDATION",
            CaseStatus::Calculation => "CALCULATION",
            CaseStatus::Verification => "VERIFICATION",
            CaseStatus::Rejected => "REJECTED",
            CaseStatus::Correction => "CORRECTION",
            CaseStatus::Approval => "APPROVAL",
            CaseStatus::Authorization => "AUTHORIZATION",
            CaseStatus::Issued => "ISSUED",
            CaseStatus::Archived => "ARCHIVED",
        }
    }

    pub fn can_transition_to(&self, target: &CaseStatus) -> bool {
        match (self, target) {
            (CaseStatus::Draft, CaseStatus::DataEntry) => true,
            (CaseStatus::Draft, CaseStatus::Verification) => true, // direct draft submit for testing
            (CaseStatus::DataEntry, CaseStatus::Validation) => true,
            (CaseStatus::Validation, CaseStatus::Calculation) => true,
            (CaseStatus::Calculation, CaseStatus::Verification) => true,
            (CaseStatus::Verification, CaseStatus::Approval) => true,
            (CaseStatus::Verification, CaseStatus::Rejected) => true,
            (CaseStatus::Rejected, CaseStatus::Correction) => true,
            (CaseStatus::Correction, CaseStatus::Calculation) => true,
            (CaseStatus::Approval, CaseStatus::Authorization) => true,
            (CaseStatus::Approval, CaseStatus::Rejected) => true,
            (CaseStatus::Authorization, CaseStatus::Issued) => true,
            (CaseStatus::Issued, CaseStatus::Archived) => true,
            _ => false,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransitionCaseRequest {
    pub version: u32,
    pub notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RejectCaseRequest {
    pub version: u32,
    pub reason: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowActionResponse {
    pub case_id: Uuid,
    pub previous_status: String,
    pub current_status: String,
    pub new_version: u32,
    pub updated_by: String,
    pub timestamp: String,
}
