use chrono::Datelike;
use payfix_domain::{
    ArrearCalculationInput, ArrearCalculationResult, ArrearPeriod, CalculationSession,
    RevisionDifference,
};
use rust_decimal::Decimal;
use rust_decimal_macros::dec;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RevisionDifferential {
    pub original_pension: Decimal,
    pub revised_pension: Decimal,
    pub pension_difference: Decimal,
    pub original_dcrg: Decimal,
    pub revised_dcrg: Decimal,
    pub dcrg_difference: Decimal,
    pub original_commutation: Decimal,
    pub revised_commutation: Decimal,
    pub commutation_difference: Decimal,
}

pub struct RevisionEngine;

impl RevisionEngine {
    pub fn calculate_revision_differential(
        original_pension: Decimal,
        revised_pension: Decimal,
        original_dcrg: Decimal,
        revised_dcrg: Decimal,
        original_commutation: Decimal,
        revised_commutation: Decimal,
    ) -> RevisionDifferential {
        RevisionDifferential {
            original_pension,
            revised_pension,
            pension_difference: revised_pension - original_pension,
            original_dcrg,
            revised_dcrg,
            dcrg_difference: revised_dcrg - original_dcrg,
            original_commutation,
            revised_commutation,
            commutation_difference: revised_commutation - original_commutation,
        }
    }

    pub fn compute_differences(
        old_session: &CalculationSession,
        new_session: &CalculationSession,
    ) -> Vec<RevisionDifference> {
        let mut diffs = vec![];

        // 1. Last Basic Pay
        let old_pay = old_session.pay_fixation_result.final_revised_basic_pay;
        let new_pay = new_session.pay_fixation_result.final_revised_basic_pay;
        if old_pay != new_pay {
            diffs.push(RevisionDifference {
                category: "PAY".into(),
                field_name: "Last Basic Pay".into(),
                old_value: format!("₹{}", old_pay),
                new_value: format!("₹{}", new_pay),
                difference_value: new_pay - old_pay,
            });
        }

        // 2. Gross Basic Pension
        let old_pen = old_session.pension_result.gross_pension;
        let new_pen = new_session.pension_result.gross_pension;
        if old_pen != new_pen {
            diffs.push(RevisionDifference {
                category: "PENSION".into(),
                field_name: "Gross Monthly Pension".into(),
                old_value: format!("₹{}", old_pen),
                new_value: format!("₹{}", new_pen),
                difference_value: new_pen - old_pen,
            });
        }

        // 3. DCRG Gratuity
        let old_dcrg = old_session.dcrg_result.gross_dcrg;
        let new_dcrg = new_session.dcrg_result.gross_dcrg;
        if old_dcrg != new_dcrg {
            diffs.push(RevisionDifference {
                category: "DCRG".into(),
                field_name: "Gross DCRG Gratuity".into(),
                old_value: format!("₹{}", old_dcrg),
                new_value: format!("₹{}", new_dcrg),
                difference_value: new_dcrg - old_dcrg,
            });
        }

        // 4. Commutation Lump Sum
        let old_comm = old_session.commutation_result.commuted_lump_sum;
        let new_comm = new_session.commutation_result.commuted_lump_sum;
        if old_comm != new_comm {
            diffs.push(RevisionDifference {
                category: "COMMUTATION".into(),
                field_name: "Commuted Lump Sum".into(),
                old_value: format!("₹{}", old_comm),
                new_value: format!("₹{}", new_comm),
                difference_value: new_comm - old_comm,
            });
        }

        diffs
    }
}

pub struct ArrearEngine;

impl ArrearEngine {
    pub fn calculate_period_arrears(input: &ArrearCalculationInput) -> ArrearCalculationResult {
        let monthly_diff = input.revised_monthly_pension - input.old_monthly_pension;
        let mut periods = vec![];
        let mut gross_arrears = dec!(0.00);

        let mut curr_y = input.effective_date.year();
        let mut curr_m = input.effective_date.month();
        let end_y = input.calculation_date.year();
        let end_m = input.calculation_date.month();

        while (curr_y < end_y) || (curr_y == end_y && curr_m <= end_m) {
            let label = format!("{:04}-{:02}", curr_y, curr_m);
            periods.push(ArrearPeriod {
                year_month: label,
                old_monthly_amount: input.old_monthly_pension,
                revised_monthly_amount: input.revised_monthly_pension,
                monthly_difference: monthly_diff,
            });
            gross_arrears += monthly_diff;

            curr_m += 1;
            if curr_m > 12 {
                curr_m = 1;
                curr_y += 1;
            }
        }

        let net_arrears_payable = gross_arrears
            .saturating_sub(input.amount_already_paid)
            .saturating_sub(input.recoveries);

        ArrearCalculationResult {
            gross_arrears,
            amount_already_paid: input.amount_already_paid,
            recoveries: input.recoveries,
            net_arrears_payable,
            periods,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_arrear_calculation() {
        let input = ArrearCalculationInput {
            old_monthly_pension: dec!(25600.00),
            revised_monthly_pension: dec!(26600.00),
            effective_date: NaiveDate::from_ymd_opt(2024, 4, 1).unwrap(),
            calculation_date: NaiveDate::from_ymd_opt(2024, 6, 30).unwrap(),
            amount_already_paid: dec!(0.00),
            recoveries: dec!(0.00),
        };
        let res = ArrearEngine::calculate_period_arrears(&input);
        assert_eq!(res.periods.len(), 3);
        assert_eq!(res.gross_arrears, dec!(3000.00));
        assert_eq!(res.net_arrears_payable, dec!(3000.00));
    }
}
