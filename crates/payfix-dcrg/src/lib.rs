use payfix_domain::{CalculationWarning, DcrgCalculationInput, DcrgCalculationResult, PayRevisionRule, QualifyingService};
use payfix_rules::RuleSet;
use rust_decimal::Decimal;
use rust_decimal_macros::dec;

pub struct DcrgEngine {
    pub rule_set: RuleSet,
}

impl Default for DcrgEngine {
    fn default() -> Self {
        Self {
            rule_set: RuleSet::default(),
        }
    }
}

impl DcrgEngine {
    pub fn calculate_dcrg(
        &self,
        last_emoluments: Decimal,
        qs: &QualifyingService,
        outstanding_recovery: Decimal,
    ) -> (Decimal, Decimal) {
        let max_half_years = qs.half_year_periods.min(66);
        let gross_dcrg = (last_emoluments / dec!(4.0)) * Decimal::from(max_half_years);
        let capped_gross = gross_dcrg.min(self.rule_set.dcrg_ceiling.value).round();
        let net_dcrg = capped_gross.saturating_sub(outstanding_recovery);

        (capped_gross, net_dcrg)
    }

    pub fn calculate_versioned(
        input: &DcrgCalculationInput,
    ) -> (DcrgCalculationResult, Vec<CalculationWarning>) {
        let ceiling = match input.revision {
            PayRevisionRule::Rop2018 => dec!(2000000.00),
            PayRevisionRule::Rop2017 => dec!(1000000.00),
            PayRevisionRule::Rop1999 => dec!(350000.00),
            PayRevisionRule::Rop1988 => dec!(100000.00),
            PayRevisionRule::Rop1982 => dec!(50000.00),
        };

        let raw_gross = (input.last_emoluments / dec!(4.0)) * Decimal::from(input.half_year_periods.min(66));
        let ceiling_applied = raw_gross > ceiling;
        let gross_dcrg = raw_gross.min(ceiling).ceil();

        let net_dcrg = gross_dcrg.saturating_sub(input.amount_already_paid);

        let mut warnings = vec![];
        if ceiling_applied {
            warnings.push(CalculationWarning {
                code: "STATUTORY_CEILING_APPLIED".into(),
                message: format!(
                    "Calculated DCRG (₹{}) exceeded statutory ceiling of ₹{}. Capped at statutory ceiling.",
                    raw_gross, ceiling
                ),
            });
        }

        let res = DcrgCalculationResult {
            gross_dcrg,
            statutory_ceiling: ceiling,
            ceiling_applied,
            recoveries: dec!(0.00),
            amount_already_paid: input.amount_already_paid,
            net_dcrg,
        };

        (res, warnings)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_dcrg_calculation() {
        let engine = DcrgEngine::default();
        let qs = QualifyingService {
            gross_years: 30,
            gross_months: 8,
            gross_days: 12,
            non_qualifying_days: 0,
            net_years: 30,
            net_months: 8,
            net_days: 12,
            half_year_periods: 61,
        };
        let emoluments = dec!(53200.00);
        let (gross, net) = engine.calculate_dcrg(emoluments, &qs, dec!(0.00));
        assert_eq!(gross, dec!(811300.00));
        assert_eq!(net, dec!(811300.00));
    }
}
