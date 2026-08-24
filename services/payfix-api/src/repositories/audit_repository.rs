use payfix_reports::ReportGenerator;
use std::sync::{Arc, RwLock};
use uuid::Uuid;

use crate::models::dto::AuditLogDto;

#[derive(Clone, Default)]
pub struct AuditRepository {
    logs: Arc<RwLock<Vec<AuditLogDto>>>,
}

impl AuditRepository {
    pub fn record_event(&self, mut log: AuditLogDto) -> AuditLogDto {
        let mut store = self.logs.write().unwrap();
        let prev_hash = store.last().and_then(|l| l.current_audit_hash.clone()).unwrap_or_else(|| "0000000000000000000000000000000000000000000000000000000000000000".into());
        
        let payload = format!("{}:{}:{}:{}:{}", prev_hash, log.entity_id, log.action, log.performed_by, log.created_at);
        let curr_hash = ReportGenerator::compute_sha256(&payload);

        log.previous_audit_hash = Some(prev_hash);
        log.current_audit_hash = Some(curr_hash);

        store.push(log.clone());
        log
    }

    pub fn find_by_entity(&self, entity_id: Uuid) -> Vec<AuditLogDto> {
        let store = self.logs.read().unwrap();
        store
            .iter()
            .filter(|l| l.entity_id == entity_id)
            .cloned()
            .collect()
    }

    pub fn verify_chain_integrity(&self) -> bool {
        let store = self.logs.read().unwrap();
        let mut expected_prev = "0000000000000000000000000000000000000000000000000000000000000000".to_string();
        for log in store.iter() {
            if let Some(ref prev) = log.previous_audit_hash {
                if prev != &expected_prev {
                    return false;
                }
            }
            if let Some(ref curr) = log.current_audit_hash {
                expected_prev = curr.clone();
            }
        }
        true
    }
}
