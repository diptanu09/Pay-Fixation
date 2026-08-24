use payfix_rules::{get_commutation_factor, RuleSet};
use rust_decimal::Decimal;
use rust_decimal_macros::dec;

pub struct CommutationEngine {
    pub rule_set: RuleSet,
}

impl Default for CommutationEngine {
    fn default() -> Self {
        Self {
            rule_set: RuleSet::default(),
        }
    }
}

pub struct CommutationResult {
    pub commuted_percentage: Decimal,
    pub commuted_pension_amount: Decimal,
    pub commuted_lump_sum_value: Decimal,
    pub reduced_pension: Decimal,
    pub commutation_factor: Decimal,
}

impl CommutationEngine {
    pub fn calculate_commutation(
        &self,
        basic_pension: Decimal,
        requested_percentage: Decimal,
        age_next_birthday: u32,
    ) -> CommutationResult {
        let percent = requested_percentage.min(self.rule_set.max_commutation_percent.value);
        let commuted_pension_amount = (basic_pension * percent / dec!(100.0)).ceil();
        let factor = get_commutation_factor(age_next_birthday);
        let commuted_lump_sum_value = (commuted_pension_amount * dec!(12.0) * factor).ceil();
        let reduced_pension = basic_pension - commuted_pension_amount;

        CommutationResult {
            commuted_percentage: percent,
            commuted_pension_amount,
            commuted_lump_sum_value,
            reduced_pension,
            commutation_factor: factor,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_commutation() {
        let engine = CommutationEngine::default();
        let result = engine.calculate_commutation(dec!(26600.00), dec!(40.00), 61);
        assert_eq!(result.commuted_pension_amount, dec!(10640.00));
        assert_eq!(result.reduced_pension, dec!(15960.00));
    }
}
