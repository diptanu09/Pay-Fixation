use std::sync::Arc;

use payfix_calculation::CalculationOrchestrator;

use crate::repositories::{
    audit_repository::AuditRepository, calculation_repository::CalculationRepository,
    case_repository::CaseRepository, discrepancy_repository::DiscrepancyRepository,
    document_repository::DocumentRepository, incident_repository::IncidentRepository,
    migration_repository::MigrationRepository, revision_repository::RevisionRepository,
    user_repository::UserRepository,
};
use crate::services::{
    audit_service::AuditService, auth_service::AuthService,
    calculation_service::CalculationService, case_service::CaseService,
    workflow_service::WorkflowService,
};

#[derive(Clone)]
pub struct AppState {
    pub auth_service: AuthService,
    pub case_service: CaseService,
    pub workflow_service: WorkflowService,
    pub calc_service: CalculationService,
    pub audit_service: AuditService,
    pub revision_repo: RevisionRepository,
    pub doc_repo: DocumentRepository,
    pub migration_repo: MigrationRepository,
    pub discrepancy_repo: DiscrepancyRepository,
    pub incident_repo: IncidentRepository,
}

impl Default for AppState {
    fn default() -> Self {
        let case_repo = CaseRepository::default();
        let calc_repo = CalculationRepository::default();
        let audit_repo = AuditRepository::default();
        let user_repo = UserRepository::default();
        let revision_repo = RevisionRepository::default();
        let doc_repo = DocumentRepository::default();
        let migration_repo = MigrationRepository::default();
        let discrepancy_repo = DiscrepancyRepository::default();
        let incident_repo = IncidentRepository::default();

        Self {
            auth_service: AuthService { user_repo },
            case_service: CaseService { case_repo: case_repo.clone() },
            workflow_service: WorkflowService { case_repo },
            calc_service: CalculationService {
                orchestrator: Arc::new(CalculationOrchestrator::default()),
                calc_repo,
            },
            audit_service: AuditService { audit_repo },
            revision_repo,
            doc_repo,
            migration_repo,
            discrepancy_repo,
            incident_repo,
        }
    }
}
