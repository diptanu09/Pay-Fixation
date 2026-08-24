use axum::{extract::State, Json};

use crate::errors::ApiError;
use crate::models::auth::{AuthTokenResponse, LoginRequest};
use crate::models::response::ApiResponse;
use crate::state::AppState;

pub async fn login_handler(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<ApiResponse<AuthTokenResponse>>, ApiError> {
    let response = state.auth_service.authenticate(payload)?;
    Ok(Json(ApiResponse::success(response, None)))
}
