use payfix_domain::{
    CalculationSession, DocumentType, GeneratedDocument, OfficialCaseSnapshot,
    OfficialPackageManifest, PensionCalculationResult,
};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PensionReportData {
    pub report_title: String,
    pub application_no: String,
    pub pr_no: String,
    pub employee_name: String,
    pub designation: String,
    pub qualifying_service_str: String,
    pub last_pay_str: String,
    pub basic_pension_str: String,
    pub family_pension_normal_str: String,
    pub family_pension_enhanced_str: String,
    pub dcrg_net_str: String,
    pub commuted_value_str: String,
    pub reduced_pension_str: String,
}

pub struct ReportGenerator;

impl ReportGenerator {
    pub fn build_pension_report_data(
        res: &PensionCalculationResult,
        emp_name: &str,
        desig: &str,
        app_no: &str,
        pr_no: &str,
    ) -> PensionReportData {
        PensionReportData {
            report_title: "PENSION REPORT & AUTHORIZATION STATEMENT".to_string(),
            application_no: app_no.to_string(),
            pr_no: pr_no.to_string(),
            employee_name: emp_name.to_string(),
            designation: desig.to_string(),
            qualifying_service_str: format!(
                "{} Years {} Months {} Days",
                res.qualifying_service.net_years,
                res.qualifying_service.net_months,
                res.qualifying_service.net_days
            ),
            last_pay_str: format!("₹{}", res.last_basic_pay),
            basic_pension_str: format!("₹{}", res.gross_pension),
            family_pension_normal_str: format!("₹{}", res.family_pension_normal),
            family_pension_enhanced_str: format!("₹{}", res.family_pension_enhanced),
            dcrg_net_str: format!("₹{}", res.dcrg_net),
            commuted_value_str: format!("₹{}", res.commuted_value),
            reduced_pension_str: format!("₹{}", res.reduced_pension),
        }
    }

    pub fn compute_sha256(content: &str) -> String {
        let mut hasher = Sha256::new();
        hasher.update(content.as_bytes());
        format!("{:x}", hasher.finalize())
    }

    pub fn build_document(
        case_id: Uuid,
        doc_type: DocumentType,
        sanction_no: &str,
        session: &CalculationSession,
        emp_name: &str,
        desig: &str,
        pr_no: &str,
    ) -> GeneratedDocument {
        let (title, template_code, body) = match doc_type {
            DocumentType::PensionReport => (
                "Official Pension Authorization Report",
                "PENSION-REPORT-V1.0",
                format!(
                    "<h1>GOVERNMENT OF TRIPURA</h1><h2>PENSION AUTHORIZATION REPORT</h2><p>Sanction: {}</p><p>Employee: {} ({})</p><p>Gross Pension: ₹{}</p>",
                    sanction_no, emp_name, desig, session.pension_result.gross_pension
                ),
            ),
            DocumentType::PayFixationStatement => (
                "ROP 2017 Pay Fixation Statement",
                "PAY-FIX-STATEMENT-V1.0",
                format!(
                    "<h1>GOVERNMENT OF TRIPURA</h1><h2>PAY FIXATION STATEMENT (ROP 2017)</h2><p>Sanction: {}</p><p>Employee: {}</p><p>Final Revised Pay: ₹{}</p>",
                    sanction_no, emp_name, session.pay_fixation_result.final_revised_basic_pay
                ),
            ),
            DocumentType::DcrgAuthorization => (
                "DCRG Gratuity Authorization Order",
                "DCRG-SANCTION-V1.0",
                format!(
                    "<h1>GOVERNMENT OF TRIPURA</h1><h2>DCRG GRATUITY SANCTION</h2><p>Sanction: {}</p><p>Net DCRG: ₹{}</p>",
                    sanction_no, session.dcrg_result.net_dcrg
                ),
            ),
            DocumentType::CommutationStatement => (
                "Commutation Lump Sum Statement",
                "COMMUTATION-STATEMENT-V1.0",
                format!(
                    "<h1>GOVERNMENT OF TRIPURA</h1><h2>COMMUTATION SANCTION</h2><p>Sanction: {}</p><p>Lump Sum: ₹{}</p>",
                    sanction_no, session.commutation_result.commuted_lump_sum
                ),
            ),
            DocumentType::FamilyPensionReport => (
                "Family Pension Authorization",
                "FAMILY-PENSION-V1.0",
                format!(
                    "<h1>GOVERNMENT OF TRIPURA</h1><h2>FAMILY PENSION AUTHORIZATION</h2><p>Sanction: {}</p><p>Normal Pension: ₹{}</p>",
                    sanction_no, session.pension_result.family_pension_normal
                ),
            ),
            DocumentType::OfficialSanctionOrder => (
                "Official Government Sanction Order",
                "SANCTION-ORDER-V1.0",
                format!(
                    "<h1>GOVERNMENT OF TRIPURA</h1><h2>OFFICIAL SANCTION ORDER</h2><p>Sanction Order No: {}</p><p>Employee PR No: {}</p><p>Total Net Payable: ₹{}</p>",
                    sanction_no, pr_no, session.total_net_payable
                ),
            ),
            _ => (
                "Calculation Summary Sheet",
                "CALC-SHEET-V1.0",
                format!(
                    "<h1>GOVERNMENT OF TRIPURA</h1><h2>CALCULATION SHEET</h2><p>Sanction: {}</p>",
                    sanction_no
                ),
            ),
        };

        let doc_id = Uuid::new_v4();
        let hash = Self::compute_sha256(&body);
        let qr_url = format!("/verify/{}", sanction_no);

        GeneratedDocument {
            document_id: doc_id,
            case_id,
            document_type: doc_type,
            title: title.to_string(),
            template_code: template_code.to_string(),
            template_version: "1.0.0".to_string(),
            generated_by: "SYSTEM_AUTHORIZATION_OFFICER".to_string(),
            generated_at: chrono::Utc::now(),
            sha256_hash: hash,
            qr_verification_url: qr_url,
            content_html: body,
        }
    }

    pub fn build_official_package_manifest(
        snapshot: &OfficialCaseSnapshot,
        docs: Vec<GeneratedDocument>,
    ) -> OfficialPackageManifest {
        let manifest_text = format!("{}:{}", snapshot.official_sanction_no, snapshot.package_hash);
        let package_hash = Self::compute_sha256(&manifest_text);

        OfficialPackageManifest {
            case_id: snapshot.case_id,
            official_sanction_no: snapshot.official_sanction_no.clone(),
            case_no: snapshot.case_data.case_no.clone(),
            employee_name: snapshot.case_data.employee.name.clone(),
            generated_at: chrono::Utc::now(),
            package_hash,
            documents: docs,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sha256_hashing() {
        let hash = ReportGenerator::compute_sha256("test-content");
        assert_eq!(hash.len(), 64);
    }
}
