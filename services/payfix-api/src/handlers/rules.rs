use axum::{extract::State, http::StatusCode, Json};
use payfix_rules::RuleSet;

use crate::models::response::ApiResponse;
use crate::state::AppState;

pub async fn list_rules_handler(
    State(state): State<AppState>,
) -> (StatusCode, Json<ApiResponse<RuleSet>>) {
    let rule_set = state.calc_service.orchestrator.pension_engine.rule_set.clone();
    (StatusCode::OK, Json(ApiResponse::success(rule_set, None)))
}
