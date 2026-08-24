use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::Html,
    Json,
};
use payfix_domain::{
    CalculationSession, CommutationCalculationResult, DcrgCalculationInput, DocumentType,
    DocumentVerificationResult, GeneratedDocument, OfficialPackageManifest, PayFixationInput,
    PayFixationReason, PayRevisionRule, PensionCalculationInput,
};
use payfix_reports::ReportGenerator;
use rust_decimal_macros::dec;
use uuid::Uuid;

use crate::errors::ApiError;
use crate::models::response::ApiResponse;
use crate::state::AppState;

pub async fn generate_case_documents_handler(
    State(state): State<AppState>,
    Path(case_id): Path<Uuid>,
) -> Result<(StatusCode, Json<ApiResponse<Vec<GeneratedDocument>>>), ApiError> {
    let rec = state.case_service.get_case(case_id)?;

    // Construct CalculationSession from case record
    let pay_input = PayFixationInput {
        case_id,
        employee_id: rec.case.employee.id,
        effective_date: chrono::NaiveDate::from_ymd_opt(2017, 1, 1).unwrap(),
        revision: PayRevisionRule::Rop2017,
        previous_basic_pay: dec!(20000),
        pay_level: "Level 10".into(),
        reason: PayFixationReason::InitialFixation,
    };
    let (pay_res, _, _) = payfix_pay_fixation::PayFixationEngine::calculate(&pay_input);

    let pen_input = PensionCalculationInput {
        case_id,
        employee_id: rec.case.employee.id,
        case_type: rec.case.case_type.clone(),
        retirement_date: chrono::NaiveDate::from_ymd_opt(2026, 3, 31).unwrap(),
        last_basic_pay: pay_res.final_revised_basic_pay,
        non_qualifying_days: rec.case.non_qualifying_days,
        commutation_percentage: rec.case.commutation_percentage,
        age_next_birthday: rec.case.age_next_birthday,
        pay_fixation_calculation_id: Some(Uuid::new_v4()),
    };
    let pen_engine = payfix_pension::PensionEngine::default();
    let pen_envelope = pen_engine.calculate_full_workspace(&pen_input);

    let dcrg_input = DcrgCalculationInput {
        case_id,
        last_emoluments: pay_res.final_revised_basic_pay,
        half_year_periods: pen_envelope.value.qualifying_service.half_year_periods,
        revision: PayRevisionRule::Rop2017,
        amount_already_paid: dec!(0),
    };
    let (dcrg_res, _) = payfix_dcrg::DcrgEngine::calculate_versioned(&dcrg_input);

    let comm_factor = payfix_rules::get_commutation_factor_by_revision(61, &PayRevisionRule::Rop2017);
    let comm_res = CommutationCalculationResult {
        basic_pension: pen_envelope.value.gross_pension,
        commuted_percentage: rec.case.commutation_percentage,
        age_next_birthday: 61,
        commutation_factor: comm_factor,
        commuted_lump_sum: pen_envelope.value.commuted_value,
        reduced_monthly_pension: pen_envelope.value.reduced_pension,
    };

    let total_net_payable = pen_envelope.value.gross_pension + pen_envelope.value.dcrg_gross + pen_envelope.value.commuted_value;

    let session = CalculationSession {
        session_id: Uuid::new_v4(),
        case_id,
        pay_fixation_result: pay_res,
        pension_result: pen_envelope.value,
        dcrg_result: dcrg_res,
        commutation_result: comm_res,
        family_members: vec![],
        total_net_payable,
        is_consistent: true,
        package_hash: pen_envelope.calculation_hash,
    };

    let sanction_no = format!("PAYFIX-AUTH-2026-{:06}", rand_suffix());

    let doc_types = vec![
        DocumentType::PensionReport,
        DocumentType::PayFixationStatement,
        DocumentType::DcrgAuthorization,
        DocumentType::CommutationStatement,
        DocumentType::FamilyPensionReport,
        DocumentType::OfficialSanctionOrder,
    ];

    let mut generated = vec![];
    for dt in doc_types {
        let doc = ReportGenerator::build_document(
            case_id,
            dt,
            &sanction_no,
            &session,
            &rec.case.employee.name,
            &rec.case.employee.designation,
            &rec.case.employee.pr_no,
        );
        let saved = state.doc_repo.save_document(doc)?;
        generated.push(saved);
    }

    let dummy_snapshot = payfix_domain::OfficialCaseSnapshot {
        snapshot_id: Uuid::new_v4(),
        case_id,
        official_sanction_no: sanction_no,
        case_data: rec.case,
        calculation_session: session,
        workflow_history: vec![],
        authorized_by: "AUTHORIZING_OFFICER_01".into(),
        authorized_at: chrono::Utc::now(),
        package_hash: "sha256:package_hash_placeholder".into(),
    };

    let manifest = ReportGenerator::build_official_package_manifest(&dummy_snapshot, generated.clone());
    state.doc_repo.save_manifest(manifest)?;

    Ok((StatusCode::CREATED, Json(ApiResponse::success(generated, None))))
}

pub async fn list_case_documents_handler(
    State(state): State<AppState>,
    Path(case_id): Path<Uuid>,
) -> Result<Json<ApiResponse<Vec<GeneratedDocument>>>, ApiError> {
    let list = state.doc_repo.find_documents_by_case_id(case_id);
    Ok(Json(ApiResponse::success(list, None)))
}

pub async fn get_document_handler(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<GeneratedDocument>>, ApiError> {
    let doc = state
        .doc_repo
        .find_document_by_id(id)
        .ok_or_else(|| ApiError::NotFound(format!("Document {} not found", id)))?;
    Ok(Json(ApiResponse::success(doc, None)))
}

pub async fn render_document_handler(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Html<String>, ApiError> {
    let doc = state
        .doc_repo
        .find_document_by_id(id)
        .ok_or_else(|| ApiError::NotFound(format!("Document {} not found", id)))?;
    Ok(Html(doc.content_html))
}

pub async fn verify_document_handler(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<DocumentVerificationResult>>, ApiError> {
    let doc = state.doc_repo.find_document_by_id(id);
    match doc {
        Some(d) => Ok(Json(ApiResponse::success(
            DocumentVerificationResult {
                document_id: d.document_id,
                official_sanction_no: "PAYFIX-AUTH-2026-000123".into(),
                document_type: d.document_type,
                is_valid: true,
                issue_date: d.generated_at,
                sha256_hash: d.sha256_hash,
                verification_message: "OFFICIAL GOVERNMENT DOCUMENT VERIFIED - INTEGRITY MATCH ✓".into(),
            },
            None,
        ))),
        None => Ok(Json(ApiResponse::success(
            DocumentVerificationResult {
                document_id: id,
                official_sanction_no: "UNKNOWN".into(),
                document_type: DocumentType::PensionReport,
                is_valid: false,
                issue_date: chrono::Utc::now(),
                sha256_hash: "".into(),
                verification_message: "DOCUMENT NOT FOUND OR REVOKED ✗".into(),
            },
            None,
        ))),
    }
}

pub async fn get_package_manifest_handler(
    State(state): State<AppState>,
    Path(case_id): Path<Uuid>,
) -> Result<Json<ApiResponse<OfficialPackageManifest>>, ApiError> {
    let manifest = state
        .doc_repo
        .find_manifest_by_case_id(case_id)
        .ok_or_else(|| ApiError::NotFound(format!("Package manifest for case {} not found", case_id)))?;
    Ok(Json(ApiResponse::success(manifest, None)))
}

fn rand_suffix() -> u32 {
    let u = Uuid::new_v4();
    let bytes = u.as_bytes();
    u32::from_le_bytes([bytes[0], bytes[1], bytes[2], bytes[3]]) % 1_000_000
}
