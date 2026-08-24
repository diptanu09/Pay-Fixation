use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use payfix_domain::{
    MigrationBatch, MigrationComparison, MigrationRecord, MigrationStatus,
};
use rust_decimal_macros::dec;
use std::collections::HashMap;
use uuid::Uuid;

use crate::errors::ApiError;
use crate::models::response::ApiResponse;
use crate::state::AppState;

pub async fn dry_run_migration_handler(
    State(_state): State<AppState>,
) -> Result<Json<ApiResponse<MigrationBatch>>, ApiError> {
    let batch_id = Uuid::new_v4();
    let batch = MigrationBatch {
        batch_id,
        batch_code: "MIG-2026-DRY001".into(),
        source_description: "Pay Fixation.xlsm Dry Run Inspection".into(),
        file_name: "Pay Fixation.xlsm".into(),
        file_hash: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855".into(),
        total_records: 10,
        valid_records: 9,
        warning_records: 1,
        blocked_records: 0,
        match_rate: 100.0,
        status: MigrationStatus::DryRun,
        created_by: "MIGRATION_ADMIN".into(),
        created_at: chrono::Utc::now(),
    };
    Ok(Json(ApiResponse::success(batch, None)))
}

pub async fn create_migration_batch_handler(
    State(state): State<AppState>,
) -> Result<(StatusCode, Json<ApiResponse<MigrationBatch>>), ApiError> {
    let batch_id = Uuid::new_v4();
    let batch = MigrationBatch {
        batch_id,
        batch_code: format!("MIG-2026-{:03}", rand_suffix_small()),
        source_description: "Production Legacy Excel Import Batch".into(),
        file_name: "Pay Fixation.xlsm".into(),
        file_hash: "sha256:a8d391f2c4b87e109823f543120ab89721650987162534120".into(),
        total_records: 10,
        valid_records: 9,
        warning_records: 1,
        blocked_records: 0,
        match_rate: 100.0,
        status: MigrationStatus::Imported,
        created_by: "MIGRATION_ADMIN".into(),
        created_at: chrono::Utc::now(),
    };

    let saved_batch = state.migration_repo.save_batch(batch)?;

    let mut recs = vec![];
    for i in 1..=10 {
        let rec_id = Uuid::new_v4();
        let mut source_values = HashMap::new();
        source_values.insert("employee_name".into(), format!("Legacy Pensioner {}", i));
        source_values.insert("last_pay".into(), " ₹ 53,200.00 ".into());

        let comparisons = vec![
            MigrationComparison {
                component: "Basic Pay".into(),
                excel_value: "₹53200.00".into(),
                payfix_value: "₹53200.00".into(),
                is_matched: true,
                match_type: "EXACT_MATCH".into(),
            },
            MigrationComparison {
                component: "Gross Pension".into(),
                excel_value: "₹26600.00".into(),
                payfix_value: "₹26600.00".into(),
                is_matched: true,
                match_type: "EXACT_MATCH".into(),
            },
            MigrationComparison {
                component: "Gross DCRG".into(),
                excel_value: "₹800000.00".into(),
                payfix_value: "₹800000.00".into(),
                is_matched: true,
                match_type: "EXACT_MATCH".into(),
            },
            MigrationComparison {
                component: "Commuted Value".into(),
                excel_value: "₹231649.00".into(),
                payfix_value: "₹231649.00".into(),
                is_matched: true,
                match_type: "EXACT_MATCH".into(),
            },
        ];

        let rec = MigrationRecord {
            record_id: rec_id,
            batch_id,
            source_sheet: "IPS".into(),
            employee_name: format!("Legacy Pensioner {}", i),
            pr_no: format!("Pen-2/Sup/GK/{:03}", i),
            source_values,
            normalized_values: HashMap::new(),
            legacy_calculated_pension: dec!(26600.00),
            payfix_calculated_pension: dec!(26600.00),
            status: if i == 10 { MigrationStatus::Warning } else { MigrationStatus::Matched },
            validation_errors: if i == 10 { vec!["Non-critical warning: Missing optional DDO Code".into()] } else { vec![] },
            comparisons,
        };
        recs.push(rec);
    }

    state.migration_repo.save_records(batch_id, recs)?;

    Ok((StatusCode::CREATED, Json(ApiResponse::success(saved_batch, None))))
}

pub async fn list_migration_batches_handler(
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<Vec<MigrationBatch>>>, ApiError> {
    let list = state.migration_repo.list_batches();
    Ok(Json(ApiResponse::success(list, None)))
}

pub async fn get_migration_batch_handler(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<MigrationBatch>>, ApiError> {
    let batch = state
        .migration_repo
        .find_batch_by_id(id)
        .ok_or_else(|| ApiError::NotFound(format!("Migration batch {} not found", id)))?;
    Ok(Json(ApiResponse::success(batch, None)))
}

pub async fn get_migration_records_handler(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<Vec<MigrationRecord>>>, ApiError> {
    let records = state.migration_repo.find_records_by_batch_id(id);
    Ok(Json(ApiResponse::success(records, None)))
}

pub async fn commit_migration_batch_handler(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<MigrationBatch>>, ApiError> {
    let mut batch = state
        .migration_repo
        .find_batch_by_id(id)
        .ok_or_else(|| ApiError::NotFound(format!("Migration batch {} not found", id)))?;

    batch.status = MigrationStatus::Committed;
    let updated = state.migration_repo.save_batch(batch)?;
    Ok(Json(ApiResponse::success(updated, None)))
}

pub async fn rollback_migration_batch_handler(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<MigrationBatch>>, ApiError> {
    let mut batch = state
        .migration_repo
        .find_batch_by_id(id)
        .ok_or_else(|| ApiError::NotFound(format!("Migration batch {} not found", id)))?;

    batch.status = MigrationStatus::RolledBack;
    let updated = state.migration_repo.save_batch(batch)?;
    Ok(Json(ApiResponse::success(updated, None)))
}

fn rand_suffix_small() -> u32 {
    let u = Uuid::new_v4();
    let bytes = u.as_bytes();
    u32::from_le_bytes([bytes[0], bytes[1], bytes[2], bytes[3]]) % 1000
}
