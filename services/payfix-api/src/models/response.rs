use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiMeta {
    pub request_id: String,
    pub timestamp: String,
}

impl Default for ApiMeta {
    fn default() -> Self {
        Self {
            request_id: format!("REQ-{}", uuid::Uuid::new_v4().to_string()[..8].to_uppercase()),
            timestamp: chrono::Utc::now().to_rfc3339(),
        }
    }
}

impl ApiMeta {
    pub fn with_request_id(request_id: Option<&str>) -> Self {
        Self {
            request_id: request_id
                .unwrap_or(&format!("REQ-{}", uuid::Uuid::new_v4().to_string()[..8].to_uppercase()))
                .to_string(),
            timestamp: chrono::Utc::now().to_rfc3339(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiResponse<T: Serialize> {
    pub success: bool,
    pub data: T,
    pub meta: ApiMeta,
}

impl<T: Serialize> ApiResponse<T> {
    pub fn success(data: T, request_id: Option<&str>) -> Self {
        Self {
            success: true,
            data,
            meta: ApiMeta::with_request_id(request_id),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaginationMeta {
    pub page: u32,
    pub page_size: u32,
    pub total_records: usize,
    pub total_pages: u32,
    pub request_id: String,
    pub timestamp: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaginatedResponse<T: Serialize> {
    pub success: bool,
    pub data: Vec<T>,
    pub meta: PaginationMeta,
}

impl<T: Serialize> PaginatedResponse<T> {
    pub fn new(data: Vec<T>, page: u32, page_size: u32, total_records: usize, request_id: Option<&str>) -> Self {
        let total_pages = if page_size == 0 {
            1
        } else {
            ((total_records as f64) / (page_size as f64)).ceil() as u32
        };

        Self {
            success: true,
            data,
            meta: PaginationMeta {
                page,
                page_size,
                total_records,
                total_pages,
                request_id: request_id
                    .unwrap_or(&format!("REQ-{}", uuid::Uuid::new_v4().to_string()[..8].to_uppercase()))
                    .to_string(),
                timestamp: chrono::Utc::now().to_rfc3339(),
            },
        }
    }
}
