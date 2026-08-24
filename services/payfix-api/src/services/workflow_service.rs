use uuid::Uuid;

use crate::errors::ApiError;
use crate::models::workflow::{CaseStatus, WorkflowActionResponse};
use crate::repositories::case_repository::CaseRepository;

#[derive(Clone, Default)]
pub struct WorkflowService {
    pub case_repo: CaseRepository,
}

impl WorkflowService {
    pub fn transition_case(
        &self,
        id: Uuid,
        version: u32,
        target_status: CaseStatus,
        notes: Option<String>,
        operator: &str,
    ) -> Result<WorkflowActionResponse, ApiError> {
        let current_record = self
            .case_repo
            .find_by_id(id)
            .ok_or_else(|| ApiError::NotFound(format!("Case {}", id)))?;

        let previous_status = current_record.status.as_str().to_string();

        let updated_record = self.case_repo.transition_status(
            id,
            version,
            target_status.clone(),
            notes,
            operator,
        )?;

        Ok(WorkflowActionResponse {
            case_id: id,
            previous_status,
            current_status: updated_record.status.as_str().to_string(),
            new_version: updated_record.version,
            updated_by: operator.to_string(),
            timestamp: updated_record.updated_at,
        })
    }
}
