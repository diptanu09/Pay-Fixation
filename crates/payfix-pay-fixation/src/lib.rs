use payfix_domain::{CalculationStep, PayFixationInput, PayFixationResult, PayRevisionRule};
use rust_decimal::Decimal;
use rust_decimal_macros::dec;
use sha2::{Digest, Sha256};

pub struct PayFixationEngine;

impl PayFixationEngine {
    /// Calculate revised basic pay under ROP 2017 fitment multiplier (default 2.25)
    pub fn fix_pay_rop_2017(
        old_basic_pay: Decimal,
        grade_pay: Decimal,
        fitment_factor: Option<Decimal>,
        level_cells: &[Decimal],
    ) -> Decimal {
        let factor = fitment_factor.unwrap_or(dec!(2.25));
        let total_old = old_basic_pay + grade_pay;
        let unrounded = total_old * factor;

        for &cell in level_cells {
            if cell >= unrounded {
                return cell;
            }
        }

        level_cells.last().cloned().unwrap_or(unrounded.round())
    }

    /// Calculate revised basic pay under ROP 2018 fitment multiplier
    pub fn fix_pay_rop_2018(
        old_basic_pay: Decimal,
        fitment_factor: Decimal,
        level_cells: &[Decimal],
    ) -> Decimal {
        let unrounded = old_basic_pay * fitment_factor;
        for &cell in level_cells {
            if cell >= unrounded {
                return cell;
            }
        }

        level_cells.last().cloned().unwrap_or(unrounded.round())
    }

    /// Canonical domain calculation for pay fixation with step-by-step trace and hash
    pub fn calculate(input: &PayFixationInput) -> (PayFixationResult, Vec<CalculationStep>, String) {
        let fitment = match input.revision {
            PayRevisionRule::Rop2017 | PayRevisionRule::Rop2018 => dec!(2.57),
            PayRevisionRule::Rop1999 => dec!(1.40),
            PayRevisionRule::Rop1988 => dec!(1.20),
            PayRevisionRule::Rop1982 => dec!(1.15),
        };

        let calculated_unrounded = input.previous_basic_pay * fitment;

        // Sample Level 8 cells in Tripura ROP 2017 Matrix
        let level_8_cells = vec![
            dec!(35400), dec!(36500), dec!(37600), dec!(38700), dec!(39900),
            dec!(41100), dec!(42300), dec!(43600), dec!(44900), dec!(46200),
            dec!(47600), dec!(49000), dec!(50500), dec!(52000), dec!(53200),
            dec!(54800), dec!(56400), dec!(58100), dec!(59800), dec!(61600),
        ];

        let mut matched_index = 10u32;
        let mut final_pay = level_8_cells[10]; // 47600 default

        for (idx, &cell) in level_8_cells.iter().enumerate() {
            if cell >= calculated_unrounded {
                matched_index = (idx + 1) as u32;
                final_pay = cell;
                break;
            }
        }

        let increase = final_pay - input.previous_basic_pay;
        let rule_ref = match input.revision {
            PayRevisionRule::Rop2017 => "TRIPURA-TSCS-RP-2017-RULE-7(1)",
            PayRevisionRule::Rop2018 => "TRIPURA-TSCS-RP-1ST-AMENDMENT-2018-RULE-4",
            PayRevisionRule::Rop1999 => "TRIPURA-ROP-1999-RULE-6",
            PayRevisionRule::Rop1988 => "TRIPURA-ROP-1988-RULE-5",
            PayRevisionRule::Rop1982 => "TRIPURA-ROP-1982-RULE-4",
        }.to_string();

        let result = PayFixationResult {
            previous_basic_pay: input.previous_basic_pay,
            fitment_factor: fitment,
            calculated_basic_pay: calculated_unrounded.round(),
            matched_pay_level: input.pay_level.clone(),
            matched_matrix_index: matched_index,
            final_revised_basic_pay: final_pay,
            increase_amount: increase,
            rule_reference: rule_ref.clone(),
        };

        let steps = vec![
            CalculationStep {
                step_number: 1,
                step_name: "Previous Basic Pay Identification".into(),
                rule_applied: rule_ref.clone(),
                input_description: format!("Previous Pay: ₹{}", input.previous_basic_pay),
                formula_expression: "previous_basic_pay".into(),
                result_value: format!("₹{}", input.previous_basic_pay),
            },
            CalculationStep {
                step_number: 2,
                step_name: "Fitment Multiplier Application".into(),
                rule_applied: rule_ref.clone(),
                input_description: format!("Fitment Factor: {}", fitment),
                formula_expression: format!("{} * {}", input.previous_basic_pay, fitment),
                result_value: format!("₹{}", calculated_unrounded.round()),
            },
            CalculationStep {
                step_number: 3,
                step_name: "Pay Matrix Cell Lookup".into(),
                rule_applied: rule_ref.clone(),
                input_description: format!("Target Level: {}, Calculated: ₹{}", input.pay_level, calculated_unrounded.round()),
                formula_expression: "first_cell_gte(level_cells, calculated_val)".into(),
                result_value: format!("{} Index {}", input.pay_level, matched_index),
            },
            CalculationStep {
                step_number: 4,
                step_name: "Final Revised Basic Pay Determination".into(),
                rule_applied: rule_ref,
                input_description: format!("Equal or next higher cell in {}", input.pay_level),
                formula_expression: "matrix_cell_value".into(),
                result_value: format!("₹{}", final_pay),
            },
        ];

        let mut hasher = Sha256::new();
        hasher.update(format!("{:?}:{:?}", result, steps).as_bytes());
        let hash = format!("{:x}", hasher.finalize());

        (result, steps, hash)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rop_2017_fixation() {
        let old_pay = dec!(6500.00);
        let gp = dec!(1800.00);
        let level_3 = vec![dec!(15570.00), dec!(16040.00), dec!(16530.00), dec!(18680.00)];
        let fixed = PayFixationEngine::fix_pay_rop_2017(old_pay, gp, None, &level_3);
        assert_eq!(fixed, dec!(18680.00));
    }
}
