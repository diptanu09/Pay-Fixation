use payfix_domain::PayFixationCase;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use uuid::Uuid;

use crate::errors::ApiError;
use crate::models::dto::CaseQueryFilter;
use crate::models::workflow::CaseStatus;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PersistentCaseRecord {
    pub case: PayFixationCase,
    pub status: CaseStatus,
    pub version: u32,
    pub assigned_to: Option<String>,
    pub rejection_reason: Option<String>,
    pub verification_notes: Option<String>,
    pub approval_notes: Option<String>,
    pub authorized_by: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Clone, Default)]
pub struct CaseRepository {
    records: Arc<RwLock<HashMap<Uuid, PersistentCaseRecord>>>,
}

impl CaseRepository {
    pub fn save_case(&self, mut case: PayFixationCase, operator: &str) -> PersistentCaseRecord {
        if case.case_id == Uuid::nil() {
            case.case_id = Uuid::new_v4();
        }

        let record = PersistentCaseRecord {
            case: case.clone(),
            status: CaseStatus::Draft,
            version: 1,
            assigned_to: Some(operator.to_string()),
            rejection_reason: None,
            verification_notes: None,
            approval_notes: None,
            authorized_by: None,
            created_at: chrono::Utc::now().to_rfc3339(),
            updated_at: chrono::Utc::now().to_rfc3339(),
        };

        if let Ok(mut store) = self.records.write() {
            store.insert(case.case_id, record.clone());
        }

        record
    }

    pub fn find_by_id(&self, id: Uuid) -> Option<PersistentCaseRecord> {
        let store = self.records.read().ok()?;
        store.get(&id).cloned()
    }

    pub fn update_case(
        &self,
        id: Uuid,
        expected_version: u32,
        updated_case: PayFixationCase,
    ) -> Result<PersistentCaseRecord, ApiError> {
        let mut store = self.records.write().map_err(|_| {
            ApiError::InternalServerError("Database write lock acquisition failed".into())
        })?;

        let record = store
            .get_mut(&id)
            .ok_or_else(|| ApiError::NotFound(format!("Case {}", id)))?;

        if record.version != expected_version {
            return Err(ApiError::ConcurrencyConflict {
                expected: expected_version,
                found: record.version,
            });
        }

        record.case = updated_case;
        record.version += 1;
        record.updated_at = chrono::Utc::now().to_rfc3339();

        Ok(record.clone())
    }

    pub fn query_cases(&self, filter: &CaseQueryFilter) -> (Vec<PersistentCaseRecord>, usize) {
        let store = match self.records.read() {
            Ok(s) => s,
            Err(_) => return (vec![], 0),
        };

        let mut list: Vec<PersistentCaseRecord> = store.values().cloned().collect();

        // 1. Search Filter
        if let Some(query) = &filter.search {
            let q = query.to_lowercase();
            list.retain(|r| {
                r.case.case_no.to_lowercase().contains(&q)
                    || r.case.employee.name.to_lowercase().contains(&q)
                    || r.case.employee.pr_no.to_lowercase().contains(&q)
                    || r.case.employee.application_no.to_lowercase().contains(&q)
            });
        }

        // 2. Status Filter
        if let Some(status_str) = &filter.status {
            let target = status_str.to_uppercase();
            list.retain(|r| r.status.as_str() == target);
        }

        let total_records = list.len();

        // 3. Pagination
        let page = filter.page.unwrap_or(1).max(1);
        let page_size = filter.page_size.unwrap_or(25).max(1);
        let start = ((page - 1) * page_size) as usize;

        let paginated = if start >= list.len() {
            vec![]
        } else {
            let end = (start + page_size as usize).min(list.len());
            list[start..end].to_vec()
        };

        (paginated, total_records)
    }

    pub fn transition_status(
        &self,
        id: Uuid,
        expected_version: u32,
        target_status: CaseStatus,
        notes: Option<String>,
        operator: &str,
    ) -> Result<PersistentCaseRecord, ApiError> {
        let mut store = self.records.write().map_err(|_| {
            ApiError::InternalServerError("Database write lock acquisition failed".into())
        })?;

        let record = store
            .get_mut(&id)
            .ok_or_else(|| ApiError::NotFound(format!("Case {}", id)))?;

        // 1. Optimistic Concurrency Check
        if record.version != expected_version {
            return Err(ApiError::ConcurrencyConflict {
                expected: expected_version,
                found: record.version,
            });
        }

        // 2. State Machine Rule Verification
        if !record.status.can_transition_to(&target_status) {
            return Err(ApiError::InvalidStateTransition {
                from: record.status.as_str().to_string(),
                to: target_status.as_str().to_string(),
            });
        }

        // 3. Apply Transition & Increment Version
        record.status = target_status.clone();
        record.version += 1;
        record.updated_at = chrono::Utc::now().to_rfc3339();

        match target_status {
            CaseStatus::Verification => record.verification_notes = notes,
            CaseStatus::Approval => record.approval_notes = notes,
            CaseStatus::Rejected => record.rejection_reason = notes,
            CaseStatus::Authorization => record.authorized_by = Some(operator.to_string()),
            _ => {}
        }

        Ok(record.clone())
    }
}
