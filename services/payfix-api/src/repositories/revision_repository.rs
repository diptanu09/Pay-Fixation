use payfix_domain::RevisionCase;
use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use uuid::Uuid;

use crate::errors::ApiError;

#[derive(Clone, Default)]
pub struct RevisionRepository {
    store: Arc<RwLock<HashMap<Uuid, RevisionCase>>>,
}

impl RevisionRepository {
    #[allow(dead_code)]
    pub fn new() -> Self {
        Self::default()
    }

    pub fn save(&self, revision: RevisionCase) -> Result<RevisionCase, ApiError> {
        let mut guard = self.store.write().unwrap();
        guard.insert(revision.revision_id, revision.clone());
        Ok(revision)
    }

    pub fn find_by_id(&self, id: Uuid) -> Option<RevisionCase> {
        let guard = self.store.read().unwrap();
        guard.get(&id).cloned()
    }

    pub fn find_by_case_id(&self, case_id: Uuid) -> Vec<RevisionCase> {
        let guard = self.store.read().unwrap();
        let mut list: Vec<RevisionCase> = guard
            .values()
            .filter(|r| r.original_case_id == case_id)
            .cloned()
            .collect();
        list.sort_by(|a, b| a.requested_at.cmp(&b.requested_at));
        list
    }
}
