use axum::{
    middleware,
    routing::{get, post},
    Json, Router,
};
use serde_json::json;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;

use crate::handlers::{
    auth::login_handler,
    calculations::{
        calculate_case_handler, calculate_case_pension_workspace_handler,
        calculate_pay_fixation_handler, calculate_session_handler, get_snapshots_handler,
    },
    cases::{create_case_handler, get_case_handler, list_cases_handler, update_case_handler},
    health::{health_check, health_live, health_ready},
    revisions::{
        calculate_arrears_handler, create_revision_handler, get_revision_comparison_handler,
        get_revision_handler, list_case_revisions_handler,
    },
    rules::list_rules_handler,
    documents::{
        generate_case_documents_handler, get_document_handler, get_package_manifest_handler,
        list_case_documents_handler, render_document_handler, verify_document_handler,
    },
    migrations::{
        commit_migration_batch_handler, create_migration_batch_handler,
        dry_run_migration_handler, get_migration_batch_handler, get_migration_records_handler,
        list_migration_batches_handler, rollback_migration_batch_handler,
    },
    mis::{
        export_mis_report_handler, get_mis_aging_handler, get_mis_financial_handler,
        get_mis_migration_handler, get_mis_overview_handler, get_mis_revisions_handler,
        get_mis_workflow_handler,
    },
    pilot::{
        create_discrepancy_handler, create_incident_handler, execute_go_no_go_handler,
        get_pilot_metrics_handler, get_pilot_operations_handler, get_pilot_readiness_handler,
        get_release_certification_handler, list_discrepancies_handler, list_incidents_handler,
        resolve_discrepancy_handler, resolve_incident_handler,
    },
    operations::{
        get_daily_operations_report_handler, get_operations_probes_handler,
        list_user_access_records_handler, update_user_status_handler,
    },
    production::{
        execute_cutover_handler, get_production_manifest_handler,
        run_production_smoke_test_handler, trigger_emergency_rollback_handler,
    },
    rule_governance::{
        activate_rule_handler, approve_rule_proposal_handler, create_rule_proposal_handler,
        get_rule_details_handler, list_rule_registry_handler, run_impact_analysis_handler,
        run_rule_regression_handler, simulate_rule_change_handler,
    },
    system::{
        execute_dr_drill_handler, get_feature_flags_handler, get_system_diagnostics_handler,
        trigger_backup_handler, verify_case_integrity_handler,
    },
    work_queues::{
        claim_case_handler, get_work_queue_handler, get_workflow_history_handler,
        issue_case_handler,
    },
    workflow::{
        approve_case_handler, authorize_case_handler, reject_case_handler,
        submit_verification_handler, verify_case_handler,
    },
    sai_pension::{get_sai_oracle_info_handler, lookup_sai_pension_handler, sync_sai_oracle_handler},
};
use crate::middleware::request_id::request_id_middleware;
use crate::middleware::security::security_headers_middleware;
use crate::state::AppState;

pub fn create_router(state: AppState) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    Router::new()
        // Health Endpoints
        .route("/health", get(health_check))
        .route("/health/live", get(health_live))
        .route("/health/ready", get(health_ready))

        // SAI Pension Oracle 12c Integration Endpoints
        .route("/api/v1/sai-pension/oracle-info", get(get_sai_oracle_info_handler))
        .route("/api/v1/sai-pension/sync-oracle", post(sync_sai_oracle_handler))
        .route("/api/v1/sai-pension/lookup", get(lookup_sai_pension_handler))

        // OpenAPI Specification Endpoint
        .route("/api/openapi.json", get(|| async {
            Json(json!({
                "openapi": "3.0.3",
                "info": {
                    "title": "PAYFIX Pay Fixation & Pension Calculation Engine API",
                    "version": "1.0.0",
                    "description": "Government of Tripura Pay Fixation & Pension Engine REST Contract"
                },
                "paths": {
                    "/api/v1/auth/login": { "post": { "summary": "Authenticate user & issue JWT" } },
                    "/api/v1/cases": { 
                        "get": { "summary": "Search & filter cases (paginated)" },
                        "post": { "summary": "Create new pay fixation / pension case" }
                    },
                    "/api/v1/cases/{id}": { 
                        "get": { "summary": "Retrieve case details" },
                        "put": { "summary": "Update draft case details" }
                    },
                    "/api/v1/cases/{id}/revisions": {
                        "post": { "summary": "Initiate non-destructive revision case" },
                        "get": { "summary": "List revision chain for case" }
                    },
                    "/api/v1/revisions/{id}": { "get": { "summary": "Retrieve revision case details" } },
                    "/api/v1/revisions/{id}/comparison": { "get": { "summary": "Retrieve Before/After revision comparison" } },
                    "/api/v1/revisions/{id}/calculate-arrears": { "post": { "summary": "Calculate period-wise arrears" } },
                    "/api/v1/cases/{id}/calculate": { "post": { "summary": "Execute pension calculation & save snapshot" } },
                    "/api/v1/cases/{id}/calculate-pension": { "post": { "summary": "Execute workspace pension calculation" } },
                    "/api/v1/cases/{id}/calculate-session": { "post": { "summary": "Execute unified calculation session across all benefits" } },
                    "/api/v1/calculations/pay-fixation": { "post": { "summary": "Execute standalone Pay Fixation calculation" } },
                    "/api/v1/cases/{id}/submit-verification": { "post": { "summary": "Submit case for verification" } },
                    "/api/v1/cases/{id}/verify": { "post": { "summary": "Verify case calculation" } },
                    "/api/v1/cases/{id}/reject": { "post": { "summary": "Reject case" } },
                    "/api/v1/cases/{id}/approve": { "post": { "summary": "Approve case calculation" } },
                    "/api/v1/cases/{id}/authorize": { "post": { "summary": "Authorize and issue sanction order" } }
                }
            }))
        }))

        // Auth Endpoints
        .route("/api/v1/auth/login", post(login_handler))

        // Cases & Calculation Endpoints
        .route("/api/v1/cases", post(create_case_handler).get(list_cases_handler))
        .route("/api/v1/cases/:id", get(get_case_handler).put(update_case_handler))
        .route("/api/v1/cases/:id/calculate", post(calculate_case_handler))
        .route("/api/v1/cases/:id/calculate-pension", post(calculate_case_pension_workspace_handler))
        .route("/api/v1/cases/:id/calculate-session", post(calculate_session_handler))
        .route("/api/v1/calculations/pay-fixation", post(calculate_pay_fixation_handler))
        .route("/api/v1/cases/:id/snapshots", get(get_snapshots_handler))

        // Revision Endpoints
        .route("/api/v1/cases/:id/revisions", post(create_revision_handler).get(list_case_revisions_handler))
        .route("/api/v1/revisions/:id", get(get_revision_handler))
        .route("/api/v1/revisions/:id/comparison", get(get_revision_comparison_handler))
        .route("/api/v1/revisions/:id/calculate-arrears", post(calculate_arrears_handler))

        // Case Workflow State Machine Endpoints
        .route("/api/v1/cases/:id/submit-verification", post(submit_verification_handler))
        .route("/api/v1/cases/:id/claim", post(claim_case_handler))
        .route("/api/v1/cases/:id/verify", post(verify_case_handler))
        .route("/api/v1/cases/:id/reject", post(reject_case_handler))
        .route("/api/v1/cases/:id/approve", post(approve_case_handler))
        .route("/api/v1/cases/:id/authorize", post(authorize_case_handler))
        .route("/api/v1/cases/:id/issue", post(issue_case_handler))
        .route("/api/v1/cases/:id/workflow", get(get_workflow_history_handler))

        // Document & Reporting Endpoints
        .route("/api/v1/cases/:id/documents/generate", post(generate_case_documents_handler))
        .route("/api/v1/cases/:id/documents", get(list_case_documents_handler))
        .route("/api/v1/documents/:id", get(get_document_handler))
        .route("/api/v1/documents/:id/render", get(render_document_handler))
        .route("/api/v1/documents/:id/verify", get(verify_document_handler))
        .route("/api/v1/cases/:id/package", get(get_package_manifest_handler))

        // Migration Endpoints
        .route("/api/v1/migrations/dry-run", post(dry_run_migration_handler))
        .route("/api/v1/migrations", post(create_migration_batch_handler).get(list_migration_batches_handler))
        .route("/api/v1/migrations/:id", get(get_migration_batch_handler))
        .route("/api/v1/migrations/:id/records", get(get_migration_records_handler))
        .route("/api/v1/migrations/:id/commit", post(commit_migration_batch_handler))
        .route("/api/v1/migrations/:id/rollback", post(rollback_migration_batch_handler))

        // Work Queues Endpoints
        .route("/api/v1/work-queues/:queue_type", get(get_work_queue_handler))

        // System Diagnostics, Backup & Integrity Endpoints
        .route("/api/v1/system/diagnostics", get(get_system_diagnostics_handler))
        .route("/api/v1/system/backup", post(trigger_backup_handler))
        .route("/api/v1/system/dr-drill", post(execute_dr_drill_handler))
        .route("/api/v1/integrity/cases/:id", get(verify_case_integrity_handler))
        .route("/api/v1/system/feature-flags", get(get_feature_flags_handler))

        // Controlled Pilot & Discrepancy Endpoints
        .route("/api/v1/pilot/dashboard", get(get_pilot_metrics_handler))
        .route("/api/v1/pilot/operations", get(get_pilot_operations_handler))
        .route("/api/v1/pilot/release-certification", get(get_release_certification_handler))
        .route("/api/v1/pilot/readiness", get(get_pilot_readiness_handler))
        .route("/api/v1/pilot/go-no-go", post(execute_go_no_go_handler))
        .route("/api/v1/pilot/incidents", post(create_incident_handler).get(list_incidents_handler))
        .route("/api/v1/pilot/incidents/:id/resolve", post(resolve_incident_handler))
        .route("/api/v1/discrepancies", post(create_discrepancy_handler).get(list_discrepancies_handler))
        .route("/api/v1/discrepancies/:id/resolve", post(resolve_discrepancy_handler))

        // Production Cutover & Operations Endpoints
        .route("/api/v1/production/manifest", get(get_production_manifest_handler))
        .route("/api/v1/production/cutover", post(execute_cutover_handler))
        .route("/api/v1/production/smoke-test", post(run_production_smoke_test_handler))
        .route("/api/v1/production/rollback", post(trigger_emergency_rollback_handler))
        .route("/api/v1/operations/health", get(get_operations_probes_handler))
        .route("/api/v1/operations/daily-report", get(get_daily_operations_report_handler))
        .route("/api/v1/operations/users", get(list_user_access_records_handler))
        .route("/api/v1/operations/users/:id/status", post(update_user_status_handler))

        // Rule Governance & Simulator Endpoints
        .route("/api/v1/rule-registry", get(list_rule_registry_handler).post(create_rule_proposal_handler))
        .route("/api/v1/rule-registry/:id", get(get_rule_details_handler))
        .route("/api/v1/rule-registry/:id/impact-analysis", post(run_impact_analysis_handler))
        .route("/api/v1/rule-changes/:id/run-tests", post(run_rule_regression_handler))
        .route("/api/v1/rule-changes/:id/approve", post(approve_rule_proposal_handler))
        .route("/api/v1/rule-changes/:id/activate", post(activate_rule_handler))
        .route("/api/v1/rules/simulate", post(simulate_rule_change_handler))

        // MIS & Management Intelligence Endpoints
        .route("/api/v1/mis/overview", get(get_mis_overview_handler))
        .route("/api/v1/mis/workflow", get(get_mis_workflow_handler))
        .route("/api/v1/mis/aging", get(get_mis_aging_handler))
        .route("/api/v1/mis/financial", get(get_mis_financial_handler))
        .route("/api/v1/mis/revisions", get(get_mis_revisions_handler))
        .route("/api/v1/mis/migration", get(get_mis_migration_handler))
        .route("/api/v1/mis/reports/export", post(export_mis_report_handler))

        // Rule Inspection Endpoints
        .route("/api/v1/rules", get(list_rules_handler))

        .layer(cors)
        .layer(middleware::from_fn(security_headers_middleware))
        .layer(middleware::from_fn(request_id_middleware))
        .layer(TraceLayer::new_for_http())
        .with_state(state)
}
