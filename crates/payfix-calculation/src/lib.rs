use chrono::Utc;
use payfix_commutation::CommutationEngine;
use payfix_dcrg::DcrgEngine;
use payfix_domain::{
    CalculationContext, CalculationResult, CalculationStep, CalculationWarning,
    PayRevisionRule, PensionCalculationRequest, PensionCalculationResult,
};
use payfix_pension::PensionEngine;
use payfix_service::ServiceEngine;
use rust_decimal_macros::dec;
use uuid::Uuid;

pub struct CalculationOrchestrator {
    pub pension_engine: PensionEngine,
    pub dcrg_engine: DcrgEngine,
    pub commutation_engine: CommutationEngine,
}

impl Default for CalculationOrchestrator {
    fn default() -> Self {
        Self {
            pension_engine: PensionEngine::default(),
            dcrg_engine: DcrgEngine::default(),
            commutation_engine: CommutationEngine::default(),
        }
    }
}

impl CalculationOrchestrator {
    pub fn process_pension_case(
        &self,
        req: &PensionCalculationRequest,
    ) -> CalculationResult<PensionCalculationResult> {
        let mut steps = Vec::new();
        let mut warnings = Vec::new();
        let calc_id = Uuid::new_v4();

        // Step 1: Compute Qualifying Service
        let qs = ServiceEngine::compute_qualifying_service(
            req.employee.doj,
            req.employee.date_retirement_or_death,
            req.non_qualifying_days,
        );

        steps.push(CalculationStep {
            step_number: 1,
            step_name: "Qualifying Service Computation".to_string(),
            rule_applied: "PAYFIX-QS-001".to_string(),
            input_description: format!(
                "DOJ: {}, DOR: {}, Non-Qualifying: {} days",
                req.employee.doj, req.employee.date_retirement_or_death, req.non_qualifying_days
            ),
            formula_expression: "Net Days = (DOR - DOJ + 1) - Non-Qualifying; Half-Years = min(66, Years*2 + (1 if Months>=6))".to_string(),
            result_value: format!(
                "{} Years {} Months {} Days ({} Half-Year Periods)",
                qs.net_years, qs.net_months, qs.net_days, qs.half_year_periods
            ),
        });

        if qs.net_years < 10 {
            warnings.push(CalculationWarning {
                code: "WARN-QS-SHORT".to_string(),
                message: "Qualifying service is under 10 years. Eligible for Service Gratuity rather than Regular Pension.".to_string(),
            });
        }

        // Step 2: Compute Gross Basic Pension
        let gross_pension = self
            .pension_engine
            .calculate_basic_pension(req.last_basic_pay, &qs);

        steps.push(CalculationStep {
            step_number: 2,
            step_name: "Basic Pension Calculation".to_string(),
            rule_applied: "PAYFIX-PEN-001".to_string(),
            input_description: format!("Last Basic Pay: ₹{}, Half-Years: {}", req.last_basic_pay, qs.half_year_periods),
            formula_expression: "Gross Pension = max(9000, min(125000, roundup(LastPay * 0.50 * (HalfYears / 66), 0)))".to_string(),
            result_value: format!("₹{}", gross_pension),
        });

        // Step 3: Compute Family Pensions
        let family_pension_normal = self
            .pension_engine
            .calculate_family_pension_normal(req.last_basic_pay);
        let family_pension_enhanced = self
            .pension_engine
            .calculate_family_pension_enhanced(req.last_basic_pay);

        steps.push(CalculationStep {
            step_number: 3,
            step_name: "Family Pension Entitlement".to_string(),
            rule_applied: "PAYFIX-PEN-002".to_string(),
            input_description: format!("Last Basic Pay: ₹{}", req.last_basic_pay),
            formula_expression: "Normal = roundup(LastPay * 0.30, 0); Enhanced = roundup(LastPay * 0.50, 0)".to_string(),
            result_value: format!("Normal: ₹{}, Enhanced: ₹{}", family_pension_normal, family_pension_enhanced),
        });

        // Step 4: Compute DCRG
        let (dcrg_gross, dcrg_net) =
            self.dcrg_engine
                .calculate_dcrg(req.last_basic_pay, &qs, dec!(0.00));

        steps.push(CalculationStep {
            step_number: 4,
            step_name: "DCRG Computation".to_string(),
            rule_applied: "PAYFIX-DCRG-001".to_string(),
            input_description: format!("Emoluments: ₹{}, Half-Years: {}", req.last_basic_pay, qs.half_year_periods),
            formula_expression: "DCRG = min(2000000, roundup((Emoluments / 4) * min(66, HalfYears), 0))".to_string(),
            result_value: format!("Gross: ₹{}, Net: ₹{}", dcrg_gross, dcrg_net),
        });

        if dcrg_gross >= dec!(2000000.00) {
            warnings.push(CalculationWarning {
                code: "WARN-DCRG-CAP".to_string(),
                message: "DCRG gross amount reached the statutory maximum ceiling of ₹20,00,000.".to_string(),
            });
        }

        // Step 5: Compute Commutation & Reduced Pension
        let comm_res = self.commutation_engine.calculate_commutation(
            gross_pension,
            req.commutation_percentage,
            req.age_next_birthday,
        );

        steps.push(CalculationStep {
            step_number: 5,
            step_name: "Pension Commutation".to_string(),
            rule_applied: "PAYFIX-COMM-001".to_string(),
            input_description: format!("Commutation: {}%, Age Next Birthday: {}", comm_res.commuted_percentage, req.age_next_birthday),
            formula_expression: "LumpSum = roundup(CommutedPension * 12 * AgeFactor, 0); Reduced = BasicPension - CommutedPension".to_string(),
            result_value: format!("Lump Sum: ₹{}, Reduced Pension: ₹{}", comm_res.commuted_lump_sum_value, comm_res.reduced_pension),
        });

        let context = CalculationContext {
            case_id: calc_id,
            employee_id: req.employee.id,
            calculation_date: Utc::now().date_naive(),
            rule_version: self.pension_engine.rule_set.version.clone(),
            engine_version: "1.0.0".to_string(),
            rop_version: PayRevisionRule::Rop2018,
        };

        let result = PensionCalculationResult {
            calculation_id: calc_id,
            employee_id: req.employee.id,
            last_basic_pay: req.last_basic_pay,
            qualifying_service: qs,
            gross_pension,
            family_pension_normal,
            family_pension_enhanced,
            dcrg_gross,
            dcrg_net,
            commuted_percentage: comm_res.commuted_percentage,
            commuted_value: comm_res.commuted_lump_sum_value,
            reduced_pension: comm_res.reduced_pension,
            rule_version: self.pension_engine.rule_set.version.clone(),
        };

        let calculation_hash = CalculationResult::compute_sha256_hash(&result, &context, &steps);

        CalculationResult {
            value: result,
            context,
            steps,
            warnings,
            calculation_hash,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::NaiveDate;
    use payfix_domain::{CaseType, Employee};
    use rust_decimal_macros::dec;

    #[test]
    fn test_orchestration_with_tracing_and_hash() {
        let orchestrator = CalculationOrchestrator::default();
        let emp = Employee {
            id: Uuid::new_v4(),
            name: "Shri Test Employee".to_string(),
            designation: "Sr. Accountant".to_string(),
            group_class: "Group-B".to_string(),
            dob: NaiveDate::from_ymd_opt(1965, 7, 12).unwrap(),
            doj: NaiveDate::from_ymd_opt(1987, 3, 5).unwrap(),
            date_regularization: Some(NaiveDate::from_ymd_opt(1987, 3, 5).unwrap()),
            date_retirement_or_death: NaiveDate::from_ymd_opt(2025, 7, 31).unwrap(),
            pr_no: "Pen-2/Sup/GK//2026-27".to_string(),
            application_no: "APP-2026-001".to_string(),
            ddo_code: "DDO-001".to_string(),
        };

        let req = PensionCalculationRequest {
            employee: emp,
            case_type: CaseType::Superannuation,
            last_basic_pay: dec!(53200.00),
            non_qualifying_days: 0,
            commutation_percentage: dec!(40.00),
            age_next_birthday: 61,
            date_cas_1: None,
            date_cas_2: None,
            date_acp_3: None,
        };

        let res = orchestrator.process_pension_case(&req);
        assert_eq!(res.steps.len(), 5);
        assert!(!res.calculation_hash.is_empty());
        assert_eq!(res.calculation_hash.len(), 64); // Valid 64-char hex SHA-256 string
    }
}
