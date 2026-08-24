use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use payfix_domain::{
    CalculationContext, CalculationResult, CalculationSession, CommutationCalculationResult,
    DcrgCalculationInput, PayFixationInput, PayFixationReason, PayFixationResult, PayRevisionRule,
    PensionCalculationInput, PensionCalculationRequest, PensionCalculationResult,
};
use rust_decimal_macros::dec;
use uuid::Uuid;

use crate::errors::ApiError;
use crate::models::dto::CalculationSnapshotDto;
use crate::models::response::ApiResponse;
use crate::state::AppState;

pub async fn calculate_case_handler(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(payload): Json<PensionCalculationRequest>,
) -> Result<(StatusCode, Json<ApiResponse<CalculationResult<PensionCalculationResult>>>), ApiError> {
    let result = state
        .calc_service
        .calculate_and_snapshot(id, &payload, "CALCULATION_ENGINE")?;

    state.audit_service.log_action(
        None,
        "pension_case",
        id,
        "CALCULATE_PENSION",
        "CALCULATION_ENGINE",
        Some("DATA_ENTRY".into()),
        serde_json::json!({
            "calculation_hash": result.calculation_hash,
            "gross_pension": result.value.gross_pension,
            "dcrg_gross": result.value.dcrg_gross,
        }),
    );

    Ok((StatusCode::OK, Json(ApiResponse::success(result, None))))
}

pub async fn calculate_case_pension_workspace_handler(
    State(_state): State<AppState>,
    Json(input): Json<PensionCalculationInput>,
) -> Result<Json<ApiResponse<CalculationResult<PensionCalculationResult>>>, ApiError> {
    let engine = payfix_pension::PensionEngine::default();
    let result = engine.calculate_full_workspace(&input);
    Ok(Json(ApiResponse::success(result, None)))
}

pub async fn calculate_pay_fixation_handler(
    State(_state): State<AppState>,
    Json(input): Json<PayFixationInput>,
) -> Result<Json<ApiResponse<CalculationResult<PayFixationResult>>>, ApiError> {
    let (res_val, steps, hash) = payfix_pay_fixation::PayFixationEngine::calculate(&input);
    let envelope = CalculationResult {
        value: res_val,
        context: CalculationContext {
            case_id: input.case_id,
            employee_id: input.employee_id,
            calculation_date: input.effective_date,
            rule_version: "TRIPURA-ROP-2017/2026.01".into(),
            engine_version: "1.0.0".into(),
            rop_version: input.revision,
        },
        steps,
        warnings: vec![],
        calculation_hash: hash,
    };
    Ok(Json(ApiResponse::success(envelope, None)))
}

pub async fn calculate_session_handler(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<CalculationSession>>, ApiError> {
    let case_record = state.case_service.get_case(id)?;

    let pay_input = PayFixationInput {
        case_id: id,
        employee_id: case_record.case.employee.id,
        effective_date: chrono::NaiveDate::from_ymd_opt(2017, 1, 1).unwrap(),
        revision: PayRevisionRule::Rop2017,
        previous_basic_pay: dec!(18300),
        pay_level: "Level 8".into(),
        reason: PayFixationReason::Revision,
    };
    let (pay_res, _, _) = payfix_pay_fixation::PayFixationEngine::calculate(&pay_input);

    let pen_input = PensionCalculationInput {
        case_id: id,
        employee_id: case_record.case.employee.id,
        case_type: case_record.case.case_type,
        retirement_date: chrono::NaiveDate::from_ymd_opt(2026, 3, 31).unwrap(),
        last_basic_pay: pay_res.final_revised_basic_pay,
        non_qualifying_days: case_record.case.non_qualifying_days,
        commutation_percentage: case_record.case.commutation_percentage,
        age_next_birthday: case_record.case.age_next_birthday,
        pay_fixation_calculation_id: Some(Uuid::new_v4()),
    };
    let pen_engine = payfix_pension::PensionEngine::default();
    let pen_envelope = pen_engine.calculate_full_workspace(&pen_input);

    let dcrg_input = DcrgCalculationInput {
        case_id: id,
        last_emoluments: pay_res.final_revised_basic_pay,
        half_year_periods: pen_envelope.value.qualifying_service.half_year_periods,
        revision: PayRevisionRule::Rop2017,
        amount_already_paid: dec!(0),
    };
    let (dcrg_res, _) = payfix_dcrg::DcrgEngine::calculate_versioned(&dcrg_input);

    let comm_factor = payfix_rules::get_commutation_factor_by_revision(61, &PayRevisionRule::Rop2017);
    let comm_res = CommutationCalculationResult {
        basic_pension: pen_envelope.value.gross_pension,
        commuted_percentage: case_record.case.commutation_percentage,
        age_next_birthday: 61,
        commutation_factor: comm_factor,
        commuted_lump_sum: pen_envelope.value.commuted_value,
        reduced_monthly_pension: pen_envelope.value.reduced_pension,
    };

    let total_net_payable = pen_envelope.value.gross_pension + pen_envelope.value.dcrg_gross + pen_envelope.value.commuted_value;

    let session = CalculationSession {
        session_id: Uuid::new_v4(),
        case_id: id,
        pay_fixation_result: pay_res,
        pension_result: pen_envelope.value,
        dcrg_result: dcrg_res,
        commutation_result: comm_res,
        family_members: vec![],
        total_net_payable,
        is_consistent: true,
        package_hash: pen_envelope.calculation_hash,
    };

    Ok(Json(ApiResponse::success(session, None)))
}

pub async fn get_snapshots_handler(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<Vec<CalculationSnapshotDto>>>, ApiError> {
    let snapshots = state.calc_service.get_snapshots(id);
    Ok(Json(ApiResponse::success(snapshots, None)))
}
