use axum::{
    extract::Request,
    http::{HeaderName, HeaderValue},
    middleware::Next,
    response::Response,
};
use uuid::Uuid;

pub static REQUEST_ID_HEADER: &str = "x-request-id";

pub async fn request_id_middleware(mut req: Request, next: Next) -> Response {
    let request_id = match req.headers().get(REQUEST_ID_HEADER) {
        Some(val) => val.to_str().unwrap_or("").to_string(),
        None => format!("REQ-{}", Uuid::new_v4().to_string()[..8].to_uppercase()),
    };

    req.headers_mut().insert(
        HeaderName::from_static(REQUEST_ID_HEADER),
        HeaderValue::from_str(&request_id).unwrap(),
    );

    let mut response = next.run(req).await;

    response.headers_mut().insert(
        HeaderName::from_static(REQUEST_ID_HEADER),
        HeaderValue::from_str(&request_id).unwrap(),
    );

    response
}
