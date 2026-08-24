use uuid::Uuid;

use crate::models::dto::AuditLogDto;
use crate::repositories::audit_repository::AuditRepository;

#[derive(Clone, Default)]
pub struct AuditService {
    pub audit_repo: AuditRepository,
}

impl AuditService {
    pub fn log_action(
        &self,
        request_id: Option<String>,
        entity_type: &str,
        entity_id: Uuid,
        action: &str,
        operator: &str,
        user_role: Option<String>,
        details: serde_json::Value,
    ) -> AuditLogDto {
        let entry = AuditLogDto {
            id: Uuid::new_v4(),
            request_id,
            entity_type: entity_type.to_string(),
            entity_id,
            action: action.to_string(),
            performed_by: operator.to_string(),
            user_role,
            details,
            created_at: chrono::Utc::now().to_rfc3339(),
            previous_audit_hash: None,
            current_audit_hash: None,
        };

        self.audit_repo.record_event(entry)
    }
}
