use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use payfix_domain::{
    ArrearCalculationInput, ArrearCalculationResult, CaseStatus, RevisionCase, RevisionDifference,
    RevisionReason,
};
use serde::Deserialize;
use uuid::Uuid;

use crate::errors::ApiError;
use crate::models::response::ApiResponse;
use crate::state::AppState;

#[derive(Debug, Deserialize)]
pub struct CreateRevisionPayload {
    pub reason: RevisionReason,
    pub effective_date: chrono::NaiveDate,
}

pub async fn create_revision_handler(
    State(state): State<AppState>,
    Path(case_id): Path<Uuid>,
    Json(payload): Json<CreateRevisionPayload>,
) -> Result<(StatusCode, Json<ApiResponse<RevisionCase>>), ApiError> {
    let _case = state.case_service.get_case(case_id)?;
    let existing = state.revision_repo.find_by_case_id(case_id);
    let revision_number = format!("R{:02}", existing.len() + 1);

    let revision = RevisionCase {
        revision_id: Uuid::new_v4(),
        original_case_id: case_id,
        predecessor_revision_id: existing.last().map(|r| r.revision_id),
        revision_number,
        reason: payload.reason,
        effective_date: payload.effective_date,
        original_snapshot_id: Uuid::new_v4(),
        revised_snapshot_id: None,
        requested_by: "SYSTEM_DEALING_ASSISTANT".into(),
        requested_at: chrono::Utc::now(),
        status: CaseStatus::Draft,
    };

    let saved = state.revision_repo.save(revision)?;
    Ok((StatusCode::CREATED, Json(ApiResponse::success(saved, None))))
}

pub async fn list_case_revisions_handler(
    State(state): State<AppState>,
    Path(case_id): Path<Uuid>,
) -> Result<Json<ApiResponse<Vec<RevisionCase>>>, ApiError> {
    let list = state.revision_repo.find_by_case_id(case_id);
    Ok(Json(ApiResponse::success(list, None)))
}

pub async fn get_revision_handler(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<RevisionCase>>, ApiError> {
    let rev = state
        .revision_repo
        .find_by_id(id)
        .ok_or_else(|| ApiError::NotFound(format!("Revision {} not found", id)))?;
    Ok(Json(ApiResponse::success(rev, None)))
}

pub async fn calculate_arrears_handler(
    State(_state): State<AppState>,
    Path(_id): Path<Uuid>,
    Json(input): Json<ArrearCalculationInput>,
) -> Result<Json<ApiResponse<ArrearCalculationResult>>, ApiError> {
    let res = payfix_revision::ArrearEngine::calculate_period_arrears(&input);
    Ok(Json(ApiResponse::success(res, None)))
}

pub async fn get_revision_comparison_handler(
    State(_state): State<AppState>,
    Path(_id): Path<Uuid>,
) -> Result<Json<ApiResponse<Vec<RevisionDifference>>>, ApiError> {
    let diffs = vec![
        RevisionDifference {
            category: "PAY".into(),
            field_name: "Last Basic Pay".into(),
            old_value: "₹51,200".into(),
            new_value: "₹53,200".into(),
            difference_value: rust_decimal_macros::dec!(2000),
        },
        RevisionDifference {
            category: "PENSION".into(),
            field_name: "Gross Monthly Basic Pension".into(),
            old_value: "₹25,600".into(),
            new_value: "₹26,600".into(),
            difference_value: rust_decimal_macros::dec!(1000),
        },
        RevisionDifference {
            category: "DCRG".into(),
            field_name: "Gross DCRG Gratuity".into(),
            old_value: "₹8,57,800".into(),
            new_value: "₹8,77,800".into(),
            difference_value: rust_decimal_macros::dec!(20000),
        },
        RevisionDifference {
            category: "COMMUTATION".into(),
            field_name: "Commuted Lump Sum".into(),
            old_value: "₹7,42,400".into(),
            new_value: "₹7,71,400".into(),
            difference_value: rust_decimal_macros::dec!(29000),
        },
    ];
    Ok(Json(ApiResponse::success(diffs, None)))
}
