use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use uuid::Uuid;

use crate::errors::ApiError;
use crate::models::dto::CalculationSnapshotDto;

#[derive(Clone, Default)]
pub struct CalculationRepository {
    snapshots: Arc<RwLock<HashMap<Uuid, Vec<CalculationSnapshotDto>>>>, // case_id -> list of snapshots
}

impl CalculationRepository {
    pub fn save_snapshot(&self, snapshot: CalculationSnapshotDto) -> CalculationSnapshotDto {
        let mut store = self.snapshots.write().unwrap();
        let list = store.entry(snapshot.case_id).or_insert_with(Vec::new);
        list.push(snapshot.clone());
        snapshot
    }

    pub fn find_by_case_id(&self, case_id: Uuid) -> Vec<CalculationSnapshotDto> {
        let store = self.snapshots.read().unwrap();
        store.get(&case_id).cloned().unwrap_or_default()
    }

    pub fn lock_as_approved(&self, case_id: Uuid, snapshot_id: Uuid) -> Result<(), ApiError> {
        let mut store = self.snapshots.write().unwrap();
        let list = store
            .get_mut(&case_id)
            .ok_or_else(|| ApiError::NotFound(format!("No calculation snapshots found for case {}", case_id)))?;

        let snapshot = list
            .iter_mut()
            .find(|s| s.id == snapshot_id)
            .ok_or_else(|| ApiError::NotFound(format!("Snapshot {}", snapshot_id)))?;

        snapshot.is_approved = true;
        snapshot.is_immutable = true;
        Ok(())
    }
}
