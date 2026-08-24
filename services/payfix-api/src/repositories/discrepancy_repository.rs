use payfix_domain::{DiscrepancyClassification, DiscrepancyStatus, ParityDiscrepancy};
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
        let repo = Self {
            items: Arc::new(RwLock::new(HashMap::new())),
        };

        // Seed initial discrepancy record for pilot demonstration
        let sample_id = Uuid::new_v4();
        let disc = ParityDiscrepancy {
            discrepancy_id: sample_id,
            case_id: Uuid::new_v4(),
            case_no: "PEN-2026-000123".into(),
            employee_name: "Shri Debabrata Roy".into(),
            component: "Commutation Value".into(),
            excel_value: "₹639,174.00".into(),
            payfix_value: "₹639,174.00".into(),
            difference_amount: rust_decimal_macros::dec!(0.00),
            classification: DiscrepancyClassification::RuleDifference,
            investigation_notes: Some("Commutation factor 8.194 verified against 2026 Tripura Rule Schedule".into()),
            status: DiscrepancyStatus::Accepted,
            resolved_by: Some("AUDITOR_OFFICER".into()),
            resolved_at: Some(chrono::Utc::now()),
        };
        repo.save(disc);
        repo
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
