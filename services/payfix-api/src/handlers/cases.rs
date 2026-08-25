use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    Json,
};
use payfix_domain::PayFixationCase;

use crate::errors::ApiError;
use crate::models::dto::CaseQueryFilter;
use crate::models::response::{ApiResponse, PaginatedResponse};
use crate::repositories::case_repository::PersistentCaseRecord;
use crate::state::AppState;

pub async fn create_case_handler(
    State(state): State<AppState>,
    Json(case): Json<PayFixationCase>,
) -> Result<(StatusCode, Json<ApiResponse<PersistentCaseRecord>>), ApiError> {
    let record = state.case_service.create_case(case, "DATA_ENTRY_OFFICER");

    state.audit_service.log_action(
        None,
        "pension_case",
        record.case.case_id,
        "CREATE_CASE",
        "DATA_ENTRY_OFFICER",
        Some("DATA_ENTRY".into()),
        serde_json::to_value(&record.case).unwrap_or_default(),
    );

    Ok((StatusCode::CREATED, Json(ApiResponse::success(record, None))))
}

pub async fn get_case_handler(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<ApiResponse<PersistentCaseRecord>>, ApiError> {
    let record = state.case_service.get_case_by_string(&id)?;
    Ok(Json(ApiResponse::success(record, None)))
}

pub async fn update_case_handler(
    State(state): State<AppState>,
    Path(id_str): Path<String>,
    Json(case): Json<PayFixationCase>,
) -> Result<Json<ApiResponse<PersistentCaseRecord>>, ApiError> {
    let current = state.case_service.get_case_by_string(&id_str)?;
    let id = current.case.case_id;
    let record = state.case_service.update_case(id, current.version, case)?;

    state.audit_service.log_action(
        None,
        "pension_case",
        id,
        "UPDATE_CASE",
        "DATA_ENTRY_OFFICER",
        Some("DATA_ENTRY".into()),
        serde_json::to_value(&record.case).unwrap_or_default(),
    );

    Ok(Json(ApiResponse::success(record, None)))
}

pub async fn list_cases_handler(
    State(state): State<AppState>,
    Query(filter): Query<CaseQueryFilter>,
) -> Result<Json<PaginatedResponse<PersistentCaseRecord>>, ApiError> {
    let page = filter.page.unwrap_or(1);
    let page_size = filter.page_size.unwrap_or(25);
    let (items, total) = state.case_service.query_cases(&filter);

    Ok(Json(PaginatedResponse::new(items, page, page_size, total, None)))
}
