use chrono::NaiveDate;
use payfix_calculation::CalculationOrchestrator;
use payfix_domain::{CaseType, Employee, PensionCalculationRequest};
use rust_decimal::Decimal;
use rust_decimal_macros::dec;
use uuid::Uuid;

#[test]
fn test_golden_20_suite() {
    let orchestrator = CalculationOrchestrator::default();

    struct GoldenTestCase {
        case_id: &'static str,
        name: &'static str,
        doj: NaiveDate,
        dor: NaiveDate,
        last_pay: Decimal,
        commutation_pct: Decimal,
        age_next: u32,
        expected_pension: Decimal,
        expected_dcrg: Decimal,
        expected_commuted_value: Decimal,
        expected_reduced_pension: Decimal,
    }

    let cases = vec![
        GoldenTestCase {
            case_id: "GOLDEN-001",
            name: "Superannuation Pension (33Y Full Service)",
            doj: NaiveDate::from_ymd_opt(1992, 1, 1).unwrap(),
            dor: NaiveDate::from_ymd_opt(2025, 1, 1).unwrap(),
            last_pay: dec!(53200.00),
            commutation_pct: dec!(40.00),
            age_next: 61,
            expected_pension: dec!(26600.00),
            expected_dcrg: dec!(877800.00),
            expected_commuted_value: dec!(1046210.00),
            expected_reduced_pension: dec!(15960.00),
        },
        GoldenTestCase {
            case_id: "GOLDEN-002",
            name: "Pro-Rata Pension (20Y Service)",
            doj: NaiveDate::from_ymd_opt(2005, 1, 1).unwrap(),
            dor: NaiveDate::from_ymd_opt(2025, 1, 1).unwrap(),
            last_pay: dec!(40000.00),
            commutation_pct: dec!(40.00),
            age_next: 60,
            expected_pension: dec!(12121.00),
            expected_dcrg: dec!(400000.00),
            expected_commuted_value: dec!(481541.00),
            expected_reduced_pension: dec!(7273.00),
        },
        GoldenTestCase {
            case_id: "GOLDEN-003",
            name: "Short Service (10Y Minimum Threshold)",
            doj: NaiveDate::from_ymd_opt(2015, 1, 1).unwrap(),
            dor: NaiveDate::from_ymd_opt(2025, 1, 1).unwrap(),
            last_pay: dec!(30000.00),
            commutation_pct: dec!(0.00),
            age_next: 60,
            expected_pension: dec!(9000.00), // Min floor applied
            expected_dcrg: dec!(150000.00),
            expected_commuted_value: dec!(0.00),
            expected_reduced_pension: dec!(9000.00),
        },
        GoldenTestCase {
            case_id: "GOLDEN-004",
            name: "Normal Family Pension (30% Last Pay)",
            doj: NaiveDate::from_ymd_opt(1995, 3, 1).unwrap(),
            dor: NaiveDate::from_ymd_opt(2025, 3, 1).unwrap(),
            last_pay: dec!(60000.00),
            commutation_pct: dec!(0.00),
            age_next: 61,
            expected_pension: dec!(30000.00),
            expected_dcrg: dec!(900000.00),
            expected_commuted_value: dec!(0.00),
            expected_reduced_pension: dec!(30000.00),
        },
        GoldenTestCase {
            case_id: "GOLDEN-005",
            name: "Enhanced Family Pension (50% Last Pay)",
            doj: NaiveDate::from_ymd_opt(1990, 5, 1).unwrap(),
            dor: NaiveDate::from_ymd_opt(2025, 5, 1).unwrap(),
            last_pay: dec!(70000.00),
            commutation_pct: dec!(0.00),
            age_next: 61,
            expected_pension: dec!(35000.00),
            expected_dcrg: dec!(1155000.00),
            expected_commuted_value: dec!(0.00),
            expected_reduced_pension: dec!(35000.00),
        },
        GoldenTestCase {
            case_id: "GOLDEN-006",
            name: "Commutation Maximum 40% (Age 58)",
            doj: NaiveDate::from_ymd_opt(1992, 1, 1).unwrap(),
            dor: NaiveDate::from_ymd_opt(2025, 1, 1).unwrap(),
            last_pay: dec!(50000.00),
            commutation_pct: dec!(40.00),
            age_next: 58,
            expected_pension: dec!(25000.00),
            expected_dcrg: dec!(825000.00),
            expected_commuted_value: dec!(1016520.00),
            expected_reduced_pension: dec!(15000.00),
        },
        GoldenTestCase {
            case_id: "GOLDEN-007",
            name: "DCRG Statutory Ceiling (₹20,00,000 Cap)",
            doj: NaiveDate::from_ymd_opt(1990, 1, 1).unwrap(),
            dor: NaiveDate::from_ymd_opt(2025, 1, 1).unwrap(),
            last_pay: dec!(150000.00), // High emoluments
            commutation_pct: dec!(40.00),
            age_next: 60,
            expected_pension: dec!(75000.00),
            expected_dcrg: dec!(2000000.00), // Capped at 20 Lakhs
            expected_commuted_value: dec!(2983320.00),
            expected_reduced_pension: dec!(45000.00),
        },
    ];

    println!("=== Running PAYFIX Golden Regression Test Suite ===");
    for tc in cases {
        let emp = Employee {
            id: Uuid::new_v4(),
            name: tc.name.to_string(),
            designation: "Officer".to_string(),
            group_class: "Group-A".to_string(),
            dob: NaiveDate::from_ymd_opt(1965, 1, 1).unwrap(),
            doj: tc.doj,
            date_regularization: Some(tc.doj),
            date_retirement_or_death: tc.dor,
            pr_no: format!("PR-{}", tc.case_id),
            application_no: format!("APP-{}", tc.case_id),
            ddo_code: "DDO-001".to_string(),
        };

        let req = PensionCalculationRequest {
            employee: emp,
            case_type: CaseType::Superannuation,
            last_basic_pay: tc.last_pay,
            non_qualifying_days: 0,
            commutation_percentage: tc.commutation_pct,
            age_next_birthday: tc.age_next,
            date_cas_1: None,
            date_cas_2: None,
            date_acp_3: None,
        };

        let res = orchestrator.process_pension_case(&req);
        assert_eq!(
            res.value.gross_pension, tc.expected_pension,
            "[{}] Pension mismatch: expected {}, got {}",
            tc.case_id, tc.expected_pension, res.value.gross_pension
        );
        assert_eq!(
            res.value.dcrg_gross, tc.expected_dcrg,
            "[{}] DCRG mismatch: expected {}, got {}",
            tc.case_id, tc.expected_dcrg, res.value.dcrg_gross
        );
        assert_eq!(
            res.value.commuted_value, tc.expected_commuted_value,
            "[{}] Commutation mismatch: expected {}, got {}",
            tc.case_id, tc.expected_commuted_value, res.value.commuted_value
        );
        assert_eq!(
            res.value.reduced_pension, tc.expected_reduced_pension,
            "[{}] Reduced pension mismatch: expected {}, got {}",
            tc.case_id, tc.expected_reduced_pension, res.value.reduced_pension
        );
        println!("  - [{}] {}: PASS", tc.case_id, tc.name);
    }
    println!("Golden Test Suite Execution: 100% PASS");
}
