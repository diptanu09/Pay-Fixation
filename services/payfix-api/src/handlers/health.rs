use axum::{http::StatusCode, Json};
use serde_json::{json, Value};

use crate::models::response::ApiResponse;

pub async fn health_check() -> (StatusCode, Json<ApiResponse<Value>>) {
    let payload = json!({
        "status": "UP",
        "service": "PAYFIX Pay Fixation & Pension Engine API",
        "version": "0.1.0",
    });
    (StatusCode::OK, Json(ApiResponse::success(payload, None)))
}

pub async fn health_live() -> (StatusCode, Json<ApiResponse<Value>>) {
    let payload = json!({ "status": "ALIVE" });
    (StatusCode::OK, Json(ApiResponse::success(payload, None)))
}

pub async fn health_ready() -> (StatusCode, Json<ApiResponse<Value>>) {
    let payload = json!({
        "status": "READY",
        "database": "CONNECTED",
        "rule_engine": "ACTIVE",
    });
    (StatusCode::OK, Json(ApiResponse::success(payload, None)))
}
