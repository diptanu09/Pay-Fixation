use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum UserRole {
    SystemAdmin,
    DataEntry,
    DealingAssistant,
    Verifier,
    Superintendent,
    AuthorizingOfficer,
    Auditor,
    ReportUser,
    ReadOnly,
}

impl UserRole {
    pub fn as_str(&self) -> &'static str {
        match self {
            UserRole::SystemAdmin => "SYSTEM_ADMIN",
            UserRole::DataEntry => "DATA_ENTRY",
            UserRole::DealingAssistant => "DEALING_ASSISTANT",
            UserRole::Verifier => "VERIFIER",
            UserRole::Superintendent => "SUPERINTENDENT",
            UserRole::AuthorizingOfficer => "AUTHORIZING_OFFICER",
            UserRole::Auditor => "AUDITOR",
            UserRole::ReportUser => "REPORT_USER",
            UserRole::ReadOnly => "READ_ONLY",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: Uuid,
    pub username: String,
    pub email: String,
    pub full_name: String,
    pub designation: String,
    pub ddo_code: String,
    pub roles: Vec<UserRole>,
    pub is_active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,       // User ID
    pub username: String,  // Username
    pub role: String,      // Primary Role Name
    pub exp: usize,        // Expiration timestamp
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct AuthTokenResponse {
    pub token: String,
    pub token_type: String,
    pub expires_in: usize,
    pub user: User,
}
