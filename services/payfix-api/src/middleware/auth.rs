use axum::{
    extract::Request,
    http::header,
    middleware::Next,
    response::Response,
};
use jsonwebtoken::{decode, DecodingKey, Validation};

use crate::errors::ApiError;
use crate::models::auth::Claims;

pub const JWT_SECRET: &[u8] = b"PAYFIX_SECRET_KEY_FOR_JWT_AUTHENTICATION_2026";

pub async fn auth_middleware(mut req: Request, next: Next) -> Result<Response, ApiError> {
    let auth_header = req
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|val| val.to_str().ok());

    let token = match auth_header {
        Some(header_str) if header_str.starts_with("Bearer ") => &header_str[7..],
        _ => {
            return Err(ApiError::Unauthorized(
                "Missing or invalid Authorization header. Bearer token required.".into(),
            ))
        }
    };

    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(JWT_SECRET),
        &Validation::default(),
    )
    .map_err(|_| ApiError::Unauthorized("Invalid or expired JWT token".into()))?;

    req.extensions_mut().insert(token_data.claims);

    Ok(next.run(req).await)
}
