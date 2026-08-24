use payfix_calculation::CalculationOrchestrator;
use payfix_domain::{CalculationResult, PensionCalculationRequest, PensionCalculationResult};
use std::sync::Arc;
use uuid::Uuid;

use crate::errors::ApiError;
use crate::models::dto::CalculationSnapshotDto;
use crate::repositories::calculation_repository::CalculationRepository;

#[derive(Clone)]
pub struct CalculationService {
    pub orchestrator: Arc<CalculationOrchestrator>,
    pub calc_repo: CalculationRepository,
}

impl Default for CalculationService {
    fn default() -> Self {
        Self {
            orchestrator: Arc::new(CalculationOrchestrator::default()),
            calc_repo: CalculationRepository::default(),
        }
    }
}

impl CalculationService {
    pub fn calculate_and_snapshot(
        &self,
        case_id: Uuid,
        req: &PensionCalculationRequest,
        operator: &str,
    ) -> Result<CalculationResult<PensionCalculationResult>, ApiError> {
        let result = self.orchestrator.process_pension_case(req);

        let input_json = serde_json::to_value(req).unwrap_or_default();

        let snapshot = CalculationSnapshotDto {
            id: Uuid::new_v4(),
            case_id,
            engine_version: "1.0.0".to_string(),
            rule_version: result.context.rule_version.clone(),
            calculation_hash: result.calculation_hash.clone(),
            input_snapshot: input_json,
            result_snapshot: result.value.clone(),
            calculation_steps: result.steps.clone(),
            warnings: result.warnings.clone(),
            is_approved: false,
            is_immutable: false,
            calculated_by: operator.to_string(),
            calculated_at: chrono::Utc::now().to_rfc3339(),
        };

        self.calc_repo.save_snapshot(snapshot);

        Ok(result)
    }

    pub fn get_snapshots(&self, case_id: Uuid) -> Vec<CalculationSnapshotDto> {
        self.calc_repo.find_by_case_id(case_id)
    }
}
