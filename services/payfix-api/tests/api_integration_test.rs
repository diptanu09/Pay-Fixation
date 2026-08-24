use axum_test::TestServer;
use chrono::NaiveDate;
use payfix_api::models::auth::LoginRequest;
use payfix_api::models::workflow::{RejectCaseRequest, TransitionCaseRequest};
use payfix_api::routes::create_router;
use payfix_api::state::AppState;
use payfix_domain::{CaseType, Employee, PayFixationCase, PensionCalculationRequest, RecoveryDetails};
use rust_decimal::Decimal;
use uuid::Uuid;

fn create_sample_case() -> PayFixationCase {
    let emp = Employee {
        id: Uuid::new_v4(),
        name: "GOUTAM KUMAR PAL".to_string(),
        designation: "Upper Division Clerk (UDC)".to_string(),
        group_class: "Group C".to_string(),
        dob: NaiveDate::from_ymd_opt(1966, 3, 5).unwrap(),
        doj: NaiveDate::from_ymd_opt(1997, 3, 5).unwrap(),
        date_regularization: Some(NaiveDate::from_ymd_opt(1997, 3, 5).unwrap()),
        date_retirement_or_death: NaiveDate::from_ymd_opt(2026, 3, 31).unwrap(),
        pr_no: "PR-8820192".to_string(),
        application_no: "APP-2026-9921".to_string(),
        ddo_code: "DDO-08122".to_string(),
    };

    let emp_id = emp.id;

    PayFixationCase {
        case_id: Uuid::new_v4(),
        case_no: "PEN-2026-000123".to_string(),
        case_type: CaseType::Superannuation,
        employee: emp,
        service_history: vec![],
        pay_history: vec![],
        family_details: None,
        recovery_details: RecoveryDetails {
            house_building_advance: Decimal::ZERO,
            motor_car_advance: Decimal::ZERO,
            overpayment_recovery: Decimal::ZERO,
            other_deductions: Decimal::ZERO,
        },
        non_qualifying_days: 0,
        commutation_percentage: Decimal::new(4000, 2),
        age_next_birthday: 61,
        calculation_context: payfix_domain::CalculationContext {
            case_id: Uuid::new_v4(),
            employee_id: emp_id,
            calculation_date: chrono::Utc::now().naive_utc().date(),
            rule_version: "TRIPURA-PENSION-2026.01".to_string(),
            engine_version: "1.0.0".to_string(),
            rop_version: payfix_domain::PayRevisionRule::Rop2017,
        },
    }
}

#[tokio::test]
async fn test_api_health_endpoints() {
    let state = AppState::default();
    let app = create_router(state);
    let server = TestServer::new(app).unwrap();

    let res = server.get("/health").await;
    res.assert_status_ok();
    let json: serde_json::Value = res.json();
    assert_eq!(json["success"], true);
    assert_eq!(json["data"]["status"], "UP");
    assert!(json["meta"]["request_id"].is_string());

    let res_live = server.get("/health/live").await;
    res_live.assert_status_ok();
    assert_eq!(res_live.json::<serde_json::Value>()["data"]["status"], "ALIVE");

    let res_ready = server.get("/health/ready").await;
    res_ready.assert_status_ok();
    assert_eq!(res_ready.json::<serde_json::Value>()["data"]["status"], "READY");
}

#[tokio::test]
async fn test_auth_login_endpoint() {
    let state = AppState::default();
    let app = create_router(state);
    let server = TestServer::new(app).unwrap();

    let login_req = LoginRequest {
        username: "admin".to_string(),
        password: "Password123!".to_string(),
    };

    let res = server.post("/api/v1/auth/login").json(&login_req).await;
    res.assert_status_ok();
    
    let json: serde_json::Value = res.json();
    assert_eq!(json["success"], true);
    assert!(json["data"]["token"].is_string());
    assert_eq!(json["data"]["user"]["username"], "admin");
}

#[tokio::test]
async fn test_case_lifecycle_state_machine_and_concurrency() {
    let state = AppState::default();
    let app = create_router(state);
    let server = TestServer::new(app).unwrap();

    let sample_case = create_sample_case();

    // 1. Create Case
    let res_create = server.post("/api/v1/cases").json(&sample_case).await;
    res_create.assert_status(axum::http::StatusCode::CREATED);
    let created_envelope: serde_json::Value = res_create.json();
    assert_eq!(created_envelope["success"], true);
    let created_record = &created_envelope["data"];
    assert_eq!(created_record["status"], "DRAFT");
    assert_eq!(created_record["version"], 1);

    let case_id = created_record["case"]["case_id"].as_str().unwrap();

    // 2. Execute Calculation
    let calc_req = PensionCalculationRequest {
        employee: sample_case.employee.clone(),
        case_type: CaseType::Superannuation,
        last_basic_pay: Decimal::new(5320000, 2), // ₹53,200
        non_qualifying_days: 0,
        commutation_percentage: Decimal::new(4000, 2),
        age_next_birthday: 61,
        date_cas_1: None,
        date_cas_2: None,
        date_acp_3: None,
    };

    let calc_url = format!("/api/v1/cases/{}/calculate", case_id);
    let res_calc = server.post(&calc_url).json(&calc_req).await;
    res_calc.assert_status_ok();
    let calc_envelope: serde_json::Value = res_calc.json();
    assert_eq!(calc_envelope["success"], true);
    assert_eq!(calc_envelope["data"]["value"]["gross_pension"], 23376.0);
    assert_eq!(calc_envelope["data"]["calculation_hash"].as_str().unwrap().len(), 64);

    // 3. Verify Snapshot Created
    let snap_url = format!("/api/v1/cases/{}/snapshots", case_id);
    let res_snap = server.get(&snap_url).await;
    res_snap.assert_status_ok();
    let snap_envelope: serde_json::Value = res_snap.json();
    let snaps = snap_envelope["data"].as_array().unwrap();
    assert_eq!(snaps.len(), 1);

    // 4. Submit Verification (Version 1 -> 2)
    let sub_url = format!("/api/v1/cases/{}/submit-verification", case_id);
    let res_sub = server.post(&sub_url).json(&TransitionCaseRequest { version: 1, notes: Some("Submitted for review".into()) }).await;
    res_sub.assert_status_ok();
    let sub_envelope: serde_json::Value = res_sub.json();
    assert_eq!(sub_envelope["data"]["current_status"], "VERIFICATION");
    assert_eq!(sub_envelope["data"]["new_version"], 2);

    // 5. Test Optimistic Concurrency Conflict (Submitting stale version 1 again)
    let res_conflict = server.post(&sub_url).json(&TransitionCaseRequest { version: 1, notes: None }).await;
    res_conflict.assert_status(axum::http::StatusCode::CONFLICT);
    let err_envelope: serde_json::Value = res_conflict.json();
    assert_eq!(err_envelope["success"], false);
    assert_eq!(err_envelope["error"]["code"], "CONCURRENCY_CONFLICT");

    // 6. Verify Case (Version 2 -> 3)
    let ver_url = format!("/api/v1/cases/{}/verify", case_id);
    let res_ver = server.post(&ver_url).json(&TransitionCaseRequest { version: 2, notes: Some("Calculation verified".into()) }).await;
    res_ver.assert_status_ok();

    // 7. Approve Case (Version 3 -> 4)
    let app_url = format!("/api/v1/cases/{}/approve", case_id);
    let res_app = server.post(&app_url).json(&TransitionCaseRequest { version: 3, notes: Some("Superintendent Approval".into()) }).await;
    res_app.assert_status_ok();

    // 8. Authorize & Issue Case (Version 4 -> 5)
    let aut_url = format!("/api/v1/cases/{}/authorize", case_id);
    let res_aut = server.post(&aut_url).json(&TransitionCaseRequest { version: 4, notes: Some("Sanction Order Issued".into()) }).await;
    res_aut.assert_status_ok();
    let aut_envelope: serde_json::Value = res_aut.json();
    assert_eq!(aut_envelope["data"]["current_status"], "ISSUED");
    assert_eq!(aut_envelope["data"]["new_version"], 5);
}

#[tokio::test]
async fn test_case_controlled_rejection_flow() {
    let state = AppState::default();
    let app = create_router(state);
    let server = TestServer::new(app).unwrap();

    let sample_case = create_sample_case();

    let res_create = server.post("/api/v1/cases").json(&sample_case).await;
    res_create.assert_status(axum::http::StatusCode::CREATED);
    let created_envelope: serde_json::Value = res_create.json();
    let case_id = created_envelope["data"]["case"]["case_id"].as_str().unwrap();

    // Move DRAFT -> VERIFICATION
    let sub_url = format!("/api/v1/cases/{}/submit-verification", case_id);
    server.post(&sub_url).json(&TransitionCaseRequest { version: 1, notes: None }).await.assert_status_ok();

    // Reject Case: VERIFICATION -> REJECTED
    let rej_url = format!("/api/v1/cases/{}/reject", case_id);
    let res_rej = server.post(&rej_url).json(&RejectCaseRequest { version: 2, reason: "Service history anomaly".into() }).await;
    res_rej.assert_status_ok();
    let rej_envelope: serde_json::Value = res_rej.json();
    assert_eq!(rej_envelope["data"]["current_status"], "REJECTED");
    assert_eq!(rej_envelope["data"]["new_version"], 3);
}

#[tokio::test]
async fn test_paginated_case_search_endpoint() {
    let state = AppState::default();
    let app = create_router(state);
    let server = TestServer::new(app).unwrap();

    let sample_case = create_sample_case();
    server.post("/api/v1/cases").json(&sample_case).await.assert_status(axum::http::StatusCode::CREATED);

    // GET /api/v1/cases?search=GOUTAM
    let res = server.get("/api/v1/cases?search=GOUTAM").await;
    res.assert_status_ok();
    let json: serde_json::Value = res.json();
    assert_eq!(json["success"], true);
    assert_eq!(json["meta"]["total_records"], 1);
    assert_eq!(json["data"][0]["case"]["employee"]["name"], "GOUTAM KUMAR PAL");
}
