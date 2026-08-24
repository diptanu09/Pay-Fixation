use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;

#[derive(Debug, thiserror::Error)]
pub enum ApiError {
    #[error("Authentication failed: {0}")]
    Unauthorized(String),

    #[error("Forbidden: Insufficient permissions for role '{0}'")]
    Forbidden(String),

    #[error("Resource not found: {0}")]
    NotFound(String),

    #[error("Invalid state transition: Cannot move from {from} to {to}")]
    InvalidStateTransition { from: String, to: String },

    #[error("Optimistic concurrency conflict: Case version mismatch (expected {expected}, found {found})")]
    ConcurrencyConflict { expected: u32, found: u32 },

    #[error("Immutable record conflict: Calculation #{0} is locked and cannot be modified")]
    ImmutableRecord(String),

    #[error("Validation failed: {0}")]
    ValidationError(String),

    #[error("Internal server error: {0}")]
    InternalServerError(String),
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let (status, error_code, message, details) = match &self {
            ApiError::Unauthorized(msg) => (StatusCode::UNAUTHORIZED, "UNAUTHORIZED", msg.clone(), json!({})),
            ApiError::Forbidden(msg) => (StatusCode::FORBIDDEN, "FORBIDDEN", msg.clone(), json!({})),
            ApiError::NotFound(msg) => (StatusCode::NOT_FOUND, "NOT_FOUND", msg.clone(), json!({})),
            ApiError::InvalidStateTransition { from, to } => (
                StatusCode::BAD_REQUEST,
                "INVALID_STATE_TRANSITION",
                format!("Cannot transition case from status '{}' to '{}'", from, to),
                json!({ "from": from, "to": to }),
            ),
            ApiError::ConcurrencyConflict { expected, found } => (
                StatusCode::CONFLICT,
                "CONCURRENCY_CONFLICT",
                format!("Case was modified by another user (current version: {}, submitted version: {})", found, expected),
                json!({ "expected_version": expected, "actual_version": found }),
            ),
            ApiError::ImmutableRecord(msg) => (StatusCode::LOCKED, "IMMUTABLE_RECORD", msg.clone(), json!({})),
            ApiError::ValidationError(msg) => (StatusCode::UNPROCESSABLE_ENTITY, "VALIDATION_ERROR", msg.clone(), json!({})),
            ApiError::InternalServerError(msg) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "INTERNAL_SERVER_ERROR",
                msg.clone(),
                json!({}),
            ),
        };

        let request_id = format!("REQ-{}", uuid::Uuid::new_v4().to_string()[..8].to_uppercase());

        let body = Json(json!({
            "success": false,
            "error": {
                "code": error_code,
                "message": message,
                "details": details
            },
            "meta": {
                "request_id": request_id,
                "timestamp": chrono::Utc::now().to_rfc3339()
            }
        }));

        (status, body).into_response()
    }
}
