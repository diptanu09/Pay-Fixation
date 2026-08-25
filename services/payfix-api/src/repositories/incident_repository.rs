use payfix_domain::{IncidentStatus, PilotIncident};
use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use uuid::Uuid;

use crate::errors::ApiError;

#[derive(Clone)]
pub struct IncidentRepository {
    items: Arc<RwLock<HashMap<Uuid, PilotIncident>>>,
}

impl Default for IncidentRepository {
    fn default() -> Self {
        Self {
            items: Arc::new(RwLock::new(HashMap::new())),
        }
    }
}

impl IncidentRepository {
    pub fn save(&self, incident: PilotIncident) {
        let mut store = self.items.write().unwrap();
        store.insert(incident.incident_id, incident);
    }

    pub fn list(&self) -> Vec<PilotIncident> {
        let store = self.items.read().unwrap();
        store.values().cloned().collect()
    }

    pub fn resolve(
        &self,
        incident_id: Uuid,
        resolution: String,
        resolved_by: String,
    ) -> Result<PilotIncident, ApiError> {
        let mut store = self.items.write().unwrap();
        if let Some(item) = store.get_mut(&incident_id) {
            item.status = IncidentStatus::Resolved;
            item.resolution = Some(resolution);
            item.resolved_by = Some(resolved_by);
            item.resolved_at = Some(chrono::Utc::now());
            Ok(item.clone())
        } else {
            Err(ApiError::NotFound(format!(
                "Incident {} not found",
                incident_id
            )))
        }
    }

    pub fn open_count(&self) -> usize {
        let store = self.items.read().unwrap();
        store
            .values()
            .filter(|i| i.status != IncidentStatus::Resolved)
            .count()
    }
}
