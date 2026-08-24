use payfix_domain::PayFixationCase;
use uuid::Uuid;

use crate::errors::ApiError;
use crate::models::dto::CaseQueryFilter;
use crate::repositories::case_repository::{CaseRepository, PersistentCaseRecord};

#[derive(Clone, Default)]
pub struct CaseService {
    pub case_repo: CaseRepository,
}

impl CaseService {
    pub fn create_case(&self, case: PayFixationCase, operator: &str) -> PersistentCaseRecord {
        self.case_repo.save_case(case, operator)
    }

    pub fn get_case(&self, id: Uuid) -> Result<PersistentCaseRecord, ApiError> {
        self.case_repo
            .find_by_id(id)
            .ok_or_else(|| ApiError::NotFound(format!("Case {}", id)))
    }

    pub fn get_case_by_string(&self, id_or_case_no: &str) -> Result<PersistentCaseRecord, ApiError> {
        self.case_repo
            .find_by_string(id_or_case_no)
            .ok_or_else(|| ApiError::NotFound(format!("Case {}", id_or_case_no)))
    }

    pub fn update_case(
        &self,
        id: Uuid,
        version: u32,
        case: PayFixationCase,
    ) -> Result<PersistentCaseRecord, ApiError> {
        self.case_repo.update_case(id, version, case)
    }

    pub fn query_cases(&self, filter: &CaseQueryFilter) -> (Vec<PersistentCaseRecord>, usize) {
        self.case_repo.query_cases(filter)
    }
}
