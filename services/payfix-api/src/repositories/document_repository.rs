use payfix_domain::{GeneratedDocument, OfficialPackageManifest};
use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use uuid::Uuid;

use crate::errors::ApiError;

#[derive(Clone, Default)]
pub struct DocumentRepository {
    docs: Arc<RwLock<HashMap<Uuid, GeneratedDocument>>>,
    manifests: Arc<RwLock<HashMap<Uuid, OfficialPackageManifest>>>,
}

impl DocumentRepository {
    #[allow(dead_code)]
    pub fn new() -> Self {
        Self::default()
    }

    pub fn save_document(&self, doc: GeneratedDocument) -> Result<GeneratedDocument, ApiError> {
        let mut guard = self.docs.write().unwrap();
        guard.insert(doc.document_id, doc.clone());
        Ok(doc)
    }

    pub fn find_document_by_id(&self, id: Uuid) -> Option<GeneratedDocument> {
        let guard = self.docs.read().unwrap();
        guard.get(&id).cloned()
    }

    pub fn find_documents_by_case_id(&self, case_id: Uuid) -> Vec<GeneratedDocument> {
        let guard = self.docs.read().unwrap();
        let mut list: Vec<GeneratedDocument> = guard
            .values()
            .filter(|d| d.case_id == case_id)
            .cloned()
            .collect();
        list.sort_by(|a, b| a.generated_at.cmp(&b.generated_at));
        list
    }

    pub fn save_manifest(&self, manifest: OfficialPackageManifest) -> Result<OfficialPackageManifest, ApiError> {
        let mut guard = self.manifests.write().unwrap();
        guard.insert(manifest.case_id, manifest.clone());
        Ok(manifest)
    }

    pub fn find_manifest_by_case_id(&self, case_id: Uuid) -> Option<OfficialPackageManifest> {
        let guard = self.manifests.read().unwrap();
        guard.get(&case_id).cloned()
    }
}
