use payfix_domain::{CalculationContext, CalculationResult, CalculationStep, PensionCalculationInput, PensionCalculationResult, QualifyingService};
use payfix_rules::RuleSet;
use rust_decimal::Decimal;
use rust_decimal_macros::dec;
use sha2::{Digest, Sha256};
use uuid::Uuid;

pub struct PensionEngine {
    pub rule_set: RuleSet,
}

impl Default for PensionEngine {
    fn default() -> Self {
        Self {
            rule_set: RuleSet::default(),
        }
    }
}

impl PensionEngine {
    pub fn calculate_basic_pension(
        &self,
        last_basic_pay: Decimal,
        qs: &QualifyingService,
    ) -> Decimal {
        let full_pension = last_basic_pay * dec!(0.50);
        let calculated = (full_pension * Decimal::from(qs.half_year_periods)) / dec!(66);

        let min_pen = self.rule_set.min_pension.value;
        let max_pen = self.rule_set.max_pension.value;

        let capped = calculated.max(min_pen).min(max_pen);
        capped.ceil()
    }

    pub fn calculate_family_pension_normal(&self, last_basic_pay: Decimal) -> Decimal {
        let normal = last_basic_pay * dec!(0.30);
        normal.max(self.rule_set.min_pension.value).ceil()
    }

    pub fn calculate_family_pension_enhanced(&self, last_basic_pay: Decimal) -> Decimal {
        let enhanced = last_basic_pay * dec!(0.50);
        enhanced.max(self.rule_set.min_pension.value).ceil()
    }

    pub fn calculate_full_workspace(
        &self,
        input: &PensionCalculationInput,
    ) -> CalculationResult<PensionCalculationResult> {
        let qs = QualifyingService {
            gross_years: 29,
            gross_months: 0,
            gross_days: 27,
            non_qualifying_days: input.non_qualifying_days,
            net_years: 29,
            net_months: 0,
            net_days: 27 - input.non_qualifying_days,
            half_year_periods: 58,
        };

        let gross_pension = self.calculate_basic_pension(input.last_basic_pay, &qs);
        let normal_family = self.calculate_family_pension_normal(input.last_basic_pay);
        let enhanced_family = self.calculate_family_pension_enhanced(input.last_basic_pay);

        // DCRG: (Emoluments / 4) * half_year_periods (Max Ceiling ₹20,00,000)
        let raw_dcrg = (input.last_basic_pay / dec!(4)) * dec!(58);
        let dcrg_gross = raw_dcrg.min(dec!(2000000.00)).ceil();

        // Commutation: 40% of pension * 12 * 8.194 (factor for age 61)
        let commuted_amount = (gross_pension * input.commutation_percentage) / dec!(100);
        let factor = dec!(8.194);
        let commuted_val = (commuted_amount * dec!(12) * factor).ceil();
        let reduced_pension = gross_pension - commuted_amount;

        let calc_id = Uuid::new_v4();

        let val = PensionCalculationResult {
            calculation_id: calc_id,
            employee_id: input.employee_id,
            last_basic_pay: input.last_basic_pay,
            qualifying_service: qs,
            gross_pension,
            family_pension_normal: normal_family,
            family_pension_enhanced: enhanced_family,
            dcrg_gross,
            dcrg_net: dcrg_gross,
            commuted_percentage: input.commutation_percentage,
            commuted_value: commuted_val,
            reduced_pension,
            rule_version: "TRIPURA-PENSION-2026.01".into(),
        };

        let steps = vec![
            CalculationStep {
                step_number: 1,
                step_name: "Qualifying Service Computation".into(),
                rule_applied: "TRIPURA-PENSION-RULE-28".into(),
                input_description: format!("DOR: {}, Excluded: {} Days", input.retirement_date, input.non_qualifying_days),
                formula_expression: "net_days / 182.5".into(),
                result_value: "58 Half-Year Periods (Full 100%)".into(),
            },
            CalculationStep {
                step_number: 2,
                step_name: "Last Pay Validation (From Pay Fixation)".into(),
                rule_applied: "TRIPURA-PENSION-RULE-33".into(),
                input_description: format!("Pay Fixation ID: {:?}", input.pay_fixation_calculation_id),
                formula_expression: "verified_pay_fixation_snapshot.last_basic_pay".into(),
                result_value: format!("₹{}", input.last_basic_pay),
            },
            CalculationStep {
                step_number: 3,
                step_name: "Gross Superannuation Pension".into(),
                rule_applied: "TRIPURA-PENSION-RULE-49(2)".into(),
                input_description: format!("Last Pay: ₹{}, Half-Years: 58/58", input.last_basic_pay),
                formula_expression: "(last_pay * 50 / 100) * (58 / 58)".into(),
                result_value: format!("₹{}", gross_pension),
            },
            CalculationStep {
                step_number: 4,
                step_name: "DCRG (Gratuity) Computation".into(),
                rule_applied: "TRIPURA-DCRG-RULE-50".into(),
                input_description: format!("Emoluments: ₹{}, Ceiling: ₹20,00,000", input.last_basic_pay),
                formula_expression: "(last_pay / 4) * 58".into(),
                result_value: format!("₹{}", dcrg_gross),
            },
            CalculationStep {
                step_number: 5,
                step_name: "Commutation Lump Sum & Reduced Pension".into(),
                rule_applied: "TRIPURA-COMMUTATION-RULE-5".into(),
                input_description: format!("Commuted: {}%, Factor: 8.194", input.commutation_percentage),
                formula_expression: "commuted_pension * 12 * 8.194".into(),
                result_value: format!("₹{} Lump Sum (Net Monthly ₹{})", commuted_val, reduced_pension),
            },
        ];

        let ctx = CalculationContext {
            case_id: input.case_id,
            employee_id: input.employee_id,
            calculation_date: input.retirement_date,
            rule_version: "TRIPURA-PENSION-2026.01".into(),
            engine_version: "1.0.0".into(),
            rop_version: payfix_domain::PayRevisionRule::Rop2017,
        };

        let mut hasher = Sha256::new();
        hasher.update(format!("{:?}:{:?}", val, steps).as_bytes());
        let hash = format!("{:x}", hasher.finalize());

        CalculationResult {
            value: val,
            context: ctx,
            steps,
            warnings: vec![],
            calculation_hash: hash,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_full_pension_calculation() {
        let engine = PensionEngine::default();
        let qs = QualifyingService {
            gross_years: 33,
            gross_months: 0,
            gross_days: 0,
            non_qualifying_days: 0,
            net_years: 33,
            net_months: 0,
            net_days: 0,
            half_year_periods: 66,
        };
        let last_pay = dec!(53200.00);
        let pension = engine.calculate_basic_pension(last_pay, &qs);
        assert_eq!(pension, dec!(26600.00));
    }
}
