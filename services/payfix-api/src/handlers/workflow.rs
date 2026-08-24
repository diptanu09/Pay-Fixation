use axum::{
    extract::{Path, State},
    Json,
};
use uuid::Uuid;

use crate::errors::ApiError;
use crate::models::response::ApiResponse;
use crate::models::workflow::{CaseStatus, RejectCaseRequest, TransitionCaseRequest, WorkflowActionResponse};
use crate::state::AppState;

pub async fn submit_verification_handler(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(payload): Json<TransitionCaseRequest>,
) -> Result<Json<ApiResponse<WorkflowActionResponse>>, ApiError> {
    let res = state.workflow_service.transition_case(
        id,
        payload.version,
        CaseStatus::Verification,
        payload.notes,
        "DEALING_ASSISTANT",
    )?;

    state.audit_service.log_action(
        None,
        "pension_case",
        id,
        "SUBMIT_VERIFICATION",
        "DEALING_ASSISTANT",
        Some("DATA_ENTRY".into()),
        serde_json::to_value(&res).unwrap_or_default(),
    );

    Ok(Json(ApiResponse::success(res, None)))
}

pub async fn verify_case_handler(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(payload): Json<TransitionCaseRequest>,
) -> Result<Json<ApiResponse<WorkflowActionResponse>>, ApiError> {
    let res = state.workflow_service.transition_case(
        id,
        payload.version,
        CaseStatus::Approval,
        payload.notes,
        "VERIFIER_OFFICER",
    )?;

    state.audit_service.log_action(
        None,
        "pension_case",
        id,
        "VERIFY_CASE",
        "VERIFIER_OFFICER",
        Some("VERIFIER".into()),
        serde_json::to_value(&res).unwrap_or_default(),
    );

    Ok(Json(ApiResponse::success(res, None)))
}

pub async fn reject_case_handler(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(payload): Json<RejectCaseRequest>,
) -> Result<Json<ApiResponse<WorkflowActionResponse>>, ApiError> {
    let res = state.workflow_service.transition_case(
        id,
        payload.version,
        CaseStatus::Rejected,
        Some(payload.reason),
        "VERIFIER_OFFICER",
    )?;

    state.audit_service.log_action(
        None,
        "pension_case",
        id,
        "REJECT_CASE",
        "VERIFIER_OFFICER",
        Some("VERIFIER".into()),
        serde_json::to_value(&res).unwrap_or_default(),
    );

    Ok(Json(ApiResponse::success(res, None)))
}

pub async fn approve_case_handler(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(payload): Json<TransitionCaseRequest>,
) -> Result<Json<ApiResponse<WorkflowActionResponse>>, ApiError> {
    let res = state.workflow_service.transition_case(
        id,
        payload.version,
        CaseStatus::Authorization,
        payload.notes,
        "SUPERINTENDENT",
    )?;

    state.audit_service.log_action(
        None,
        "pension_case",
        id,
        "APPROVE_CASE",
        "SUPERINTENDENT",
        Some("SUPERINTENDENT".into()),
        serde_json::to_value(&res).unwrap_or_default(),
    );

    Ok(Json(ApiResponse::success(res, None)))
}

pub async fn authorize_case_handler(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(payload): Json<TransitionCaseRequest>,
) -> Result<Json<ApiResponse<WorkflowActionResponse>>, ApiError> {
    let res = state.workflow_service.transition_case(
        id,
        payload.version,
        CaseStatus::Issued,
        payload.notes,
        "AUTHORIZING_OFFICER",
    )?;

    state.audit_service.log_action(
        None,
        "pension_case",
        id,
        "AUTHORIZE_AND_ISSUE_CASE",
        "AUTHORIZING_OFFICER",
        Some("AUTHORIZING_OFFICER".into()),
        serde_json::to_value(&res).unwrap_or_default(),
    );

    Ok(Json(ApiResponse::success(res, None)))
}
