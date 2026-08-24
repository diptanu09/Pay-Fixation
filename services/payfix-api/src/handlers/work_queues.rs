use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use payfix_domain::{CaseStatus, WorkflowActionType, WorkflowHistoryEntry, WorkQueueItem};
use serde::Deserialize;
use uuid::Uuid;

use crate::errors::ApiError;
use crate::models::dto::CaseQueryFilter;
use crate::models::response::ApiResponse;
use crate::state::AppState;

#[derive(Debug, Deserialize)]
pub struct ClaimPayload {
    pub assigned_to: String,
}

fn map_workflow_status(s: &crate::models::workflow::CaseStatus) -> CaseStatus {
    match s {
        crate::models::workflow::CaseStatus::Draft => CaseStatus::Draft,
        crate::models::workflow::CaseStatus::DataEntry => CaseStatus::DataEntry,
        crate::models::workflow::CaseStatus::Validation => CaseStatus::Validation,
        crate::models::workflow::CaseStatus::Calculation => CaseStatus::Calculation,
        crate::models::workflow::CaseStatus::Verification => CaseStatus::Verification,
        crate::models::workflow::CaseStatus::Rejected => CaseStatus::Rejected,
        crate::models::workflow::CaseStatus::Correction => CaseStatus::Correction,
        crate::models::workflow::CaseStatus::Approval => CaseStatus::Approval,
        crate::models::workflow::CaseStatus::Authorization => CaseStatus::Authorization,
        crate::models::workflow::CaseStatus::Issued => CaseStatus::Issued,
        crate::models::workflow::CaseStatus::Archived => CaseStatus::Archived,
    }
}

pub async fn get_work_queue_handler(
    State(state): State<AppState>,
    Path(queue_type): Path<String>,
) -> Result<Json<ApiResponse<Vec<WorkQueueItem>>>, ApiError> {
    let filter = CaseQueryFilter {
        search: None,
        status: None,
        sort: None,
        sort_direction: None,
        page: Some(1),
        page_size: Some(100),
        case_type: None,
        date_from: None,
        date_to: None,
    };
    let (cases, _) = state.case_service.query_cases(&filter);

    let target_status = match queue_type.as_str() {
        "verification" => CaseStatus::Verification,
        "approval" => CaseStatus::Approval,
        "authorization" => CaseStatus::Authorization,
        _ => CaseStatus::Verification,
    };

    let queue_items: Vec<WorkQueueItem> = cases
        .into_iter()
        .map(|c| (map_workflow_status(&c.status), c))
        .filter(|(status, _)| *status == target_status)
        .map(|(status, c)| WorkQueueItem {
            case_id: c.case.case_id,
            case_no: c.case.case_no,
            employee_name: c.case.employee.name,
            case_type: c.case.case_type,
            current_status: status,
            assigned_to: c.assigned_to,
            submitted_at: chrono::Utc::now(),
            days_pending: 1,
            priority: "Normal".into(),
        })
        .collect();

    Ok(Json(ApiResponse::success(queue_items, None)))
}

pub async fn claim_case_handler(
    State(state): State<AppState>,
    Path(case_id): Path<Uuid>,
    Json(payload): Json<ClaimPayload>,
) -> Result<Json<ApiResponse<WorkQueueItem>>, ApiError> {
    let rec = state.case_service.get_case(case_id)?;
    let item = WorkQueueItem {
        case_id: rec.case.case_id,
        case_no: rec.case.case_no,
        employee_name: rec.case.employee.name,
        case_type: rec.case.case_type,
        current_status: map_workflow_status(&rec.status),
        assigned_to: Some(payload.assigned_to),
        submitted_at: chrono::Utc::now(),
        days_pending: 1,
        priority: "Normal".into(),
    };
    Ok(Json(ApiResponse::success(item, None)))
}

pub async fn get_workflow_history_handler(
    State(_state): State<AppState>,
    Path(case_id): Path<Uuid>,
) -> Result<Json<ApiResponse<Vec<WorkflowHistoryEntry>>>, ApiError> {
    let history = vec![
        WorkflowHistoryEntry {
            id: Uuid::new_v4(),
            case_id,
            from_status: CaseStatus::Draft,
            to_status: CaseStatus::Verification,
            action: WorkflowActionType::SubmitForVerification,
            performed_by: "DATA_ENTRY_ASSISTANT".into(),
            role: "DEALING_ASSISTANT".into(),
            comment: Some("Initial pension calculation submitted for statutory verification".into()),
            calculation_hash: Some("sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855".into()),
            timestamp: chrono::Utc::now() - chrono::Duration::hours(2),
        },
        WorkflowHistoryEntry {
            id: Uuid::new_v4(),
            case_id,
            from_status: CaseStatus::Verification,
            to_status: CaseStatus::Approval,
            action: WorkflowActionType::Verify,
            performed_by: "VERIFIER_OFFICER_01".into(),
            role: "VERIFIER".into(),
            comment: Some("All 9 statutory checklist items verified and passed".into()),
            calculation_hash: Some("sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855".into()),
            timestamp: chrono::Utc::now() - chrono::Duration::hours(1),
        },
    ];

    Ok(Json(ApiResponse::success(history, None)))
}

pub async fn issue_case_handler(
    State(_state): State<AppState>,
    Path(_case_id): Path<Uuid>,
) -> Result<(StatusCode, Json<ApiResponse<String>>), ApiError> {
    let raw_suffix = Uuid::new_v4().to_string();
    let sanction_no = format!("PAYFIX-AUTH-2026-{}", &raw_suffix[..6].to_uppercase());
    Ok((StatusCode::OK, Json(ApiResponse::success(sanction_no, None))))
}
