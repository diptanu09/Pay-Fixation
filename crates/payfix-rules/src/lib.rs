use chrono::NaiveDate;
use payfix_domain::PayRevisionRule;
use rust_decimal::Decimal;
use rust_decimal_macros::dec;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RuleValue {
    pub rule_code: String,
    pub rule_name: String,
    pub value: Decimal,
    pub effective_from: NaiveDate,
    pub effective_to: Option<NaiveDate>,
    pub authority: String,
    pub order_no: String,
    pub order_date: NaiveDate,
    pub clause: String,
    pub source_document: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RuleSet {
    pub version: String,
    pub min_pension: RuleValue,
    pub max_pension: RuleValue,
    pub dcrg_ceiling: RuleValue,
    pub max_commutation_percent: RuleValue,
}

impl Default for RuleSet {
    fn default() -> Self {
        let eff_date = NaiveDate::from_ymd_opt(2018, 10, 1).unwrap();
        Self {
            version: "TRIPURA-ROP-2018/2026.01".to_string(),
            min_pension: RuleValue {
                rule_code: "RULE-PEN-MIN-001".to_string(),
                rule_name: "Minimum Basic Pension".to_string(),
                value: dec!(9000.00),
                effective_from: eff_date,
                effective_to: None,
                authority: "Finance Department, Govt of Tripura".to_string(),
                order_no: "F.1(2)-FIN(G)/2018".to_string(),
                order_date: eff_date,
                clause: "Rule 49(2)".to_string(),
                source_document: "Tripura State Civil Services (Revised Pay) Rules 2018".to_string(),
            },
            max_pension: RuleValue {
                rule_code: "RULE-PEN-MAX-001".to_string(),
                rule_name: "Maximum Pension Ceiling".to_string(),
                value: dec!(125000.00),
                effective_from: eff_date,
                effective_to: None,
                authority: "Finance Department, Govt of Tripura".to_string(),
                order_no: "F.1(2)-FIN(G)/2018".to_string(),
                order_date: eff_date,
                clause: "Rule 49(3)".to_string(),
                source_document: "Tripura State Civil Services (Revised Pay) Rules 2018".to_string(),
            },
            dcrg_ceiling: RuleValue {
                rule_code: "RULE-DCRG-CEIL-001".to_string(),
                rule_name: "DCRG Maximum Ceiling".to_string(),
                value: dec!(2000000.00),
                effective_from: eff_date,
                effective_to: None,
                authority: "Finance Department, Govt of Tripura".to_string(),
                order_no: "F.1(2)-FIN(G)/2018".to_string(),
                order_date: eff_date,
                clause: "Rule 50(1)(a)".to_string(),
                source_document: "Tripura State Civil Services (Revised Pay) Rules 2018".to_string(),
            },
            max_commutation_percent: RuleValue {
                rule_code: "RULE-COMM-MAX-001".to_string(),
                rule_name: "Maximum Pension Commutation Percentage".to_string(),
                value: dec!(40.00),
                effective_from: eff_date,
                effective_to: None,
                authority: "Finance Department, Govt of Tripura".to_string(),
                order_no: "F.8(3)-FIN(G)/2017".to_string(),
                order_date: NaiveDate::from_ymd_opt(2017, 7, 1).unwrap(),
                clause: "Rule 6".to_string(),
                source_document: "Civil Services (Commutation of Pension) Rules".to_string(),
            },
        }
    }
}

pub fn get_commutation_factor(age_next_birthday: u32) -> Decimal {
    get_commutation_factor_by_revision(age_next_birthday, &PayRevisionRule::Rop2017)
}

pub fn get_commutation_factor_by_revision(age_next_birthday: u32, revision: &PayRevisionRule) -> Decimal {
    if age_next_birthday == 58 {
        match revision {
            PayRevisionRule::Rop2017 | PayRevisionRule::Rop2018 => return dec!(8.446),
            _ => return dec!(8.471),
        }
    }

    match age_next_birthday {
        20..=30 => dec!(9.178),
        31 => dec!(9.172),
        32 => dec!(9.164),
        33 => dec!(9.155),
        34 => dec!(9.145),
        35 => dec!(9.135),
        36 => dec!(9.123),
        37 => dec!(9.110),
        38 => dec!(9.096),
        39 => dec!(9.080),
        40 => dec!(9.064),
        41 => dec!(9.046),
        42 => dec!(9.027),
        43 => dec!(9.006),
        44 => dec!(8.984),
        45 => dec!(8.960),
        46 => dec!(8.934),
        47 => dec!(8.907),
        48 => dec!(8.878),
        49 => dec!(8.847),
        50 => dec!(8.814),
        51 => dec!(8.779),
        52 => dec!(8.742),
        53 => dec!(8.703),
        54 => dec!(8.661),
        55 => dec!(8.771),
        56 => dec!(8.665),
        57 => dec!(8.557),
        58 => dec!(8.446),
        59 => dec!(8.371),
        60 => dec!(8.287),
        61 => dec!(8.194),
        62 => dec!(8.093),
        63 => dec!(7.982),
        64 => dec!(7.862),
        65 => dec!(7.731),
        66 => dec!(7.591),
        67 => dec!(7.441),
        68 => dec!(7.279),
        69 => dec!(7.107),
        70 => dec!(6.923),
        _ => dec!(8.194),
    }
}
