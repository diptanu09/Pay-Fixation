use chrono::NaiveDate;
use payfix_domain::QualifyingService;

pub struct ServiceEngine;

impl ServiceEngine {
    pub fn compute_qualifying_service(
        doj: NaiveDate,
        dor: NaiveDate,
        non_qualifying_days: u32,
    ) -> QualifyingService {
        QualifyingService::calculate(doj, dor, non_qualifying_days)
    }
}
