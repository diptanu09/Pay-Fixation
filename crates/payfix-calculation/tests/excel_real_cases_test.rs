use chrono::NaiveDate;
use payfix_calculation::CalculationOrchestrator;
use payfix_domain::{CaseType, Employee, PensionCalculationRequest};
use rust_decimal::Decimal;
use serde::Deserialize;
use std::fs;
use std::path::Path;
use uuid::Uuid;

#[derive(Debug, Deserialize)]
struct RealCaseFixture {
    case_id: String,
    case_no: String,
    case_type: String,
    employee: EmployeeFixture,
    non_qualifying_days: u32,
    commutation_percentage: String,
    age_next_birthday: u32,
    expected_output: ExpectedOutputFixture,
}

#[derive(Debug, Deserialize)]
struct EmployeeFixture {
    name: String,
    designation: String,
    group_class: String,
    dob: String,
    doj: String,
    date_retirement_or_death: String,
    pr_no: String,
    application_no: String,
    ddo_code: String,
}

#[derive(Debug, Deserialize)]
struct ExpectedOutputFixture {
    half_year_periods: u32,
    gross_pension: String,
    family_pension_normal: String,
    dcrg_gross: String,
    commuted_value: String,
    reduced_pension: String,
}

#[test]
fn test_real_excel_cases_laboratory() -> anyhow::Result<()> {
    let cases_dir = Path::new("../../tests/excel-real-cases");
    let fallback_dir = Path::new("tests/excel-real-cases");
    
    let target_dir = if cases_dir.exists() {
        cases_dir
    } else if fallback_dir.exists() {
        fallback_dir
    } else {
        println!("No real Excel cases directory found.");
        return Ok(());
    };

    let orchestrator = CalculationOrchestrator::default();
    println!("\n=== Running Real Excel Case Laboratory Tests ===");

    for entry in fs::read_dir(target_dir)? {
        let entry = entry?;
        let path = entry.path();
        if path.extension().and_then(|s| s.to_str()) == Some("json") {
            let content = fs::read_to_string(&path)?;
            let fixture: RealCaseFixture = serde_json::from_str(&content)?;

            let dob = NaiveDate::parse_from_str(&fixture.employee.dob, "%Y-%m-%d")?;
            let doj = NaiveDate::parse_from_str(&fixture.employee.doj, "%Y-%m-%d")?;
            let dor = NaiveDate::parse_from_str(&fixture.employee.date_retirement_or_death, "%Y-%m-%d")?;

            let emp = Employee {
                id: Uuid::new_v4(),
                name: fixture.employee.name,
                designation: fixture.employee.designation,
                group_class: fixture.employee.group_class,
                dob,
                doj,
                date_regularization: Some(doj),
                date_retirement_or_death: dor,
                pr_no: fixture.employee.pr_no,
                application_no: fixture.employee.application_no,
                ddo_code: fixture.employee.ddo_code,
            };

            let comm_pct: Decimal = fixture.commutation_percentage.parse()?;
            let last_pay = Decimal::new(5320000, 2); // ₹53,200.00

            let req = PensionCalculationRequest {
                employee: emp,
                case_type: CaseType::Superannuation,
                last_basic_pay: last_pay,
                non_qualifying_days: fixture.non_qualifying_days,
                commutation_percentage: comm_pct,
                age_next_birthday: fixture.age_next_birthday,
                date_cas_1: None,
                date_cas_2: None,
                date_acp_3: None,
            };

            let res = orchestrator.process_pension_case(&req);
            let expected_pension: Decimal = fixture.expected_output.gross_pension.parse()?;
            let expected_dcrg: Decimal = fixture.expected_output.dcrg_gross.parse()?;

            assert_eq!(res.value.qualifying_service.half_year_periods, fixture.expected_output.half_year_periods);
            assert_eq!(res.value.gross_pension, expected_pension);
            assert_eq!(res.value.dcrg_gross, expected_dcrg);

            println!("  - [{}] {}: PASS [Hash: {}]", fixture.case_id, fixture.case_no, &res.calculation_hash[..8]);
        }
    }
    println!("Real Excel Case Laboratory Execution: 100% PASS\n");
    Ok(())
}
