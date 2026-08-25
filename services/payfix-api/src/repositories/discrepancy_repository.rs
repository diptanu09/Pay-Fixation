use payfix_domain::{DiscrepancyStatus, ParityDiscrepancy};
use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use uuid::Uuid;

use crate::errors::ApiError;

#[derive(Clone)]
pub struct DiscrepancyRepository {
    items: Arc<RwLock<HashMap<Uuid, ParityDiscrepancy>>>,
}

impl Default for DiscrepancyRepository {
    fn default() -> Self {
        Self {
            items: Arc::new(RwLock::new(HashMap::new())),
        }
    }
}

impl DiscrepancyRepository {
    pub fn save(&self, disc: ParityDiscrepancy) {
        let mut store = self.items.write().unwrap();
        store.insert(disc.discrepancy_id, disc);
    }

    pub fn list(&self) -> Vec<ParityDiscrepancy> {
        let store = self.items.read().unwrap();
        store.values().cloned().collect()
    }

    pub fn resolve(
        &self,
        discrepancy_id: Uuid,
        notes: String,
        resolved_by: String,
    ) -> Result<ParityDiscrepancy, ApiError> {
        let mut store = self.items.write().unwrap();
        if let Some(item) = store.get_mut(&discrepancy_id) {
            item.status = DiscrepancyStatus::Accepted;
            item.investigation_notes = Some(notes);
            item.resolved_by = Some(resolved_by);
            item.resolved_at = Some(chrono::Utc::now());
            Ok(item.clone())
        } else {
            Err(ApiError::NotFound(format!(
                "Discrepancy {} not found",
                discrepancy_id
            )))
        }
    }
}
