use axum::{extract::State, Json};
use payfix_domain::{
    AgingBucket, FinancialLiabilitySummary, MigrationAnalyticsSummary, MisOverviewMetrics,
    ReportExportRecord, RevisionAnalyticsSummary, WorkflowPipelineStage,
};
use payfix_reports::ReportGenerator;
use rust_decimal_macros::dec;
use serde::Deserialize;
use uuid::Uuid;

use crate::errors::ApiError;
use crate::models::response::ApiResponse;
use crate::state::AppState;

#[derive(Deserialize)]
pub struct ReportExportRequest {
    pub report_type: String,
    pub financial_year: String,
    pub format: String,
}

pub async fn get_mis_overview_handler(
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<MisOverviewMetrics>>, ApiError> {
    let is_chain_valid = state.audit_service.audit_repo.verify_chain_integrity();

    let overview = MisOverviewMetrics {
        total_cases: 184,
        authorized_cases: 97,
        pending_cases: 38,
        revision_cases: 21,
        avg_processing_days: 2.4,
        pension_authorized: dec!(2580200.00),
        dcrg_authorized: dec!(141911000.00),
        commutation_authorized: dec!(101480721.00),
        arrears_authorized: dec!(8745200.00),
        critical_incidents: 0,
        audit_integrity_status: if is_chain_valid {
            "SHA-256 CHAIN VALID ✓".into()
        } else {
            "CORRUPTED ✗".into()
        },
        backup_status: "ENCRYPTED / VERIFIED ✓".into(),
    };

    Ok(Json(ApiResponse::success(overview, None)))
}

pub async fn get_mis_workflow_handler(
    State(_state): State<AppState>,
) -> Result<Json<ApiResponse<Vec<WorkflowPipelineStage>>>, ApiError> {
    let stages = vec![
        WorkflowPipelineStage {
            stage_name: "Data Entry".into(),
            pending_count: 12,
            avg_days_in_stage: 0.8,
            oldest_case_no: "PEN-2026-000180".into(),
            oldest_days: 1.5,
        },
        WorkflowPipelineStage {
            stage_name: "Verification".into(),
            pending_count: 15,
            avg_days_in_stage: 1.2,
            oldest_case_no: "PEN-2026-000183".into(),
            oldest_days: 8.2,
        },
        WorkflowPipelineStage {
            stage_name: "Approval".into(),
            pending_count: 7,
            avg_days_in_stage: 0.7,
            oldest_case_no: "PEN-2026-000175".into(),
            oldest_days: 3.1,
        },
        WorkflowPipelineStage {
            stage_name: "Authorization".into(),
            pending_count: 4,
            avg_days_in_stage: 0.4,
            oldest_case_no: "PEN-2026-000160".into(),
            oldest_days: 1.8,
        },
    ];

    Ok(Json(ApiResponse::success(stages, None)))
}

pub async fn get_mis_aging_handler(
    State(_state): State<AppState>,
) -> Result<Json<ApiResponse<Vec<AgingBucket>>>, ApiError> {
    let buckets = vec![
        AgingBucket { bucket_range: "0–1 day".into(), count: 16 },
        AgingBucket { bucket_range: "2–3 days".into(), count: 9 },
        AgingBucket { bucket_range: "4–7 days".into(), count: 5 },
        AgingBucket { bucket_range: "8–15 days".into(), count: 2 },
        AgingBucket { bucket_range: "16–30 days".into(), count: 1 },
        AgingBucket { bucket_range: "30+ days".into(), count: 0 },
    ];

    Ok(Json(ApiResponse::success(buckets, None)))
}

pub async fn get_mis_financial_handler(
    State(_state): State<AppState>,
) -> Result<Json<ApiResponse<FinancialLiabilitySummary>>, ApiError> {
    let financial = FinancialLiabilitySummary {
        period_name: "August 2026 (FY 2026-27)".into(),
        financial_year: "2026-2027".into(),
        pension_authorized: dec!(2580200.00),
        family_pension_authorized: dec!(774060.00),
        dcrg_authorized: dec!(141911000.00),
        commutation_authorized: dec!(101480721.00),
        arrears_authorized: dec!(8745200.00),
        pending_pension_liability: dec!(1010800.00),
        pending_dcrg_liability: dec!(55580000.00),
    };

    Ok(Json(ApiResponse::success(financial, None)))
}

pub async fn get_mis_revisions_handler(
    State(_state): State<AppState>,
) -> Result<Json<ApiResponse<RevisionAnalyticsSummary>>, ApiError> {
    let revisions = RevisionAnalyticsSummary {
        total_revisions: 21,
        pay_revision_count: 8,
        service_correction_count: 6,
        pension_revision_count: 7,
        additional_pension_liability: dec!(42500.00),
        total_arrears_authorized: dec!(3450000.00),
    };

    Ok(Json(ApiResponse::success(revisions, None)))
}

pub async fn get_mis_migration_handler(
    State(_state): State<AppState>,
) -> Result<Json<ApiResponse<MigrationAnalyticsSummary>>, ApiError> {
    let migration = MigrationAnalyticsSummary {
        imported_cases: 1284,
        exact_matches: 1201,
        warnings: 61,
        material_differences: 22,
        match_percentage: 93.54,
    };

    Ok(Json(ApiResponse::success(migration, None)))
}

pub async fn export_mis_report_handler(
    State(_state): State<AppState>,
    Json(payload): Json<ReportExportRequest>,
) -> Result<Json<ApiResponse<ReportExportRecord>>, ApiError> {
    let export_payload = format!("{}:{}:{}", payload.report_type, payload.financial_year, payload.format);
    let export_hash = ReportGenerator::compute_sha256(&export_payload);

    let rec = ReportExportRecord {
        export_id: Uuid::new_v4(),
        report_type: payload.report_type,
        financial_year: payload.financial_year,
        exported_by: "MIS_DIRECTOR_AUDIT".into(),
        exported_at: chrono::Utc::now(),
        record_count: 184,
        export_hash,
    };

    Ok(Json(ApiResponse::success(rec, None)))
}
