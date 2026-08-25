use payfix_domain::{MigrationBatch, MigrationRecord, MigrationSnapshot};
use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use uuid::Uuid;

use crate::errors::ApiError;

#[derive(Clone, Default)]
#[allow(dead_code)]
pub struct MigrationRepository {
    batches: Arc<RwLock<HashMap<Uuid, MigrationBatch>>>,
    records: Arc<RwLock<HashMap<Uuid, Vec<MigrationRecord>>>>,
    snapshots: Arc<RwLock<HashMap<Uuid, Vec<MigrationSnapshot>>>>,
}

impl MigrationRepository {
    #[allow(dead_code)]
    pub fn new() -> Self {
        Self::default()
    }

    pub fn save_batch(&self, batch: MigrationBatch) -> Result<MigrationBatch, ApiError> {
        let mut guard = self.batches.write().unwrap();
        guard.insert(batch.batch_id, batch.clone());
        Ok(batch)
    }

    pub fn find_batch_by_id(&self, batch_id: Uuid) -> Option<MigrationBatch> {
        let guard = self.batches.read().unwrap();
        guard.get(&batch_id).cloned()
    }

    pub fn list_batches(&self) -> Vec<MigrationBatch> {
        let guard = self.batches.read().unwrap();
        let mut list: Vec<MigrationBatch> = guard.values().cloned().collect();
        list.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        list
    }

    pub fn save_records(&self, batch_id: Uuid, recs: Vec<MigrationRecord>) -> Result<Vec<MigrationRecord>, ApiError> {
        let mut guard = self.records.write().unwrap();
        guard.insert(batch_id, recs.clone());
        Ok(recs)
    }

    pub fn find_records_by_batch_id(&self, batch_id: Uuid) -> Vec<MigrationRecord> {
        let guard = self.records.read().unwrap();
        guard.get(&batch_id).cloned().unwrap_or_default()
    }

    #[allow(dead_code)]
    pub fn save_snapshot(&self, snap: MigrationSnapshot) {
        let mut guard = self.snapshots.write().unwrap();
        guard.entry(snap.batch_id).or_default().push(snap);
    }
}
