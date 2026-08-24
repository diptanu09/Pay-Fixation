use jsonwebtoken::{encode, EncodingKey, Header};

use crate::errors::ApiError;
use crate::middleware::auth::JWT_SECRET;
use crate::models::auth::{AuthTokenResponse, Claims, LoginRequest};
use crate::repositories::user_repository::UserRepository;

#[derive(Clone, Default)]
pub struct AuthService {
    pub user_repo: UserRepository,
}

impl AuthService {
    pub fn authenticate(&self, req: LoginRequest) -> Result<AuthTokenResponse, ApiError> {
        let (user, stored_pass) = self
            .user_repo
            .find_by_username(&req.username)
            .ok_or_else(|| ApiError::Unauthorized("Invalid username or password".into()))?;

        if req.password != stored_pass {
            return Err(ApiError::Unauthorized("Invalid username or password".into()));
        }

        if !user.is_active {
            return Err(ApiError::Unauthorized("User account is deactivated".into()));
        }

        let primary_role = user
            .roles
            .first()
            .map(|r| r.as_str())
            .unwrap_or("READ_ONLY")
            .to_string();

        let exp = (chrono::Utc::now() + chrono::Duration::hours(24)).timestamp() as usize;
        let claims = Claims {
            sub: user.id.to_string(),
            username: user.username.clone(),
            role: primary_role,
            exp,
        };

        let token = encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(JWT_SECRET),
        )
        .map_err(|e| ApiError::InternalServerError(format!("JWT generation failed: {}", e)))?;

        Ok(AuthTokenResponse {
            token,
            token_type: "Bearer".to_string(),
            expires_in: 86400,
            user,
        })
    }
}
