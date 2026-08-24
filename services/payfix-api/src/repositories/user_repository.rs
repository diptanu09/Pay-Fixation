use crate::models::auth::{User, UserRole};
use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use uuid::Uuid;

#[derive(Clone)]
pub struct UserRepository {
    users: Arc<RwLock<HashMap<String, (User, String)>>>, // username -> (User, password_hash)
}

impl Default for UserRepository {
    fn default() -> Self {
        let mut map = HashMap::new();
        // Seed default admin user (username: "admin", password: "Password123!")
        let admin_user = User {
            id: Uuid::new_v4(),
            username: "admin".to_string(),
            email: "admin@payfix.tripura.gov.in".to_string(),
            full_name: "SYSTEM ADMINISTRATOR".to_string(),
            designation: "Senior System Analyst".to_string(),
            ddo_code: "DDO-08122".to_string(),
            roles: vec![UserRole::SystemAdmin],
            is_active: true,
        };
        map.insert("admin".to_string(), (admin_user, "Password123!".to_string()));

        // Seed default data entry user (username: "da_user")
        let da_user = User {
            id: Uuid::new_v4(),
            username: "da_user".to_string(),
            email: "da@payfix.tripura.gov.in".to_string(),
            full_name: "SWAPAN DEBBARMA".to_string(),
            designation: "Dealing Assistant".to_string(),
            ddo_code: "DDO-08122".to_string(),
            roles: vec![UserRole::DataEntry, UserRole::DealingAssistant],
            is_active: true,
        };
        map.insert("da_user".to_string(), (da_user, "Password123!".to_string()));

        // Seed default verifier user (username: "verifier")
        let verifier_user = User {
            id: Uuid::new_v4(),
            username: "verifier".to_string(),
            email: "verifier@payfix.tripura.gov.in".to_string(),
            full_name: "AMALENDU CHOUDHURY".to_string(),
            designation: "Section Officer / Verifier".to_string(),
            ddo_code: "DDO-08122".to_string(),
            roles: vec![UserRole::Verifier],
            is_active: true,
        };
        map.insert("verifier".to_string(), (verifier_user, "Password123!".to_string()));

        // Seed default authorizing officer user (username: "authorizer")
        let authorizer_user = User {
            id: Uuid::new_v4(),
            username: "authorizer".to_string(),
            email: "authorizer@payfix.tripura.gov.in".to_string(),
            full_name: "DR. R. K. BHOWMIK".to_string(),
            designation: "Joint Director / Authorizing Officer".to_string(),
            ddo_code: "DDO-08122".to_string(),
            roles: vec![UserRole::AuthorizingOfficer, UserRole::Superintendent],
            is_active: true,
        };
        map.insert("authorizer".to_string(), (authorizer_user, "Password123!".to_string()));

        Self {
            users: Arc::new(RwLock::new(map)),
        }
    }
}

impl UserRepository {
    pub fn find_by_username(&self, username: &str) -> Option<(User, String)> {
        let store = self.users.read().ok()?;
        store.get(username).cloned()
    }

    pub fn find_by_id(&self, id: Uuid) -> Option<User> {
        let store = self.users.read().ok()?;
        store.values().find(|(u, _)| u.id == id).map(|(u, _)| u.clone())
    }
}
