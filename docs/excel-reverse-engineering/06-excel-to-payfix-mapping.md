# 06 — Excel to PAYFIX Full Stack Mapping Matrix

This matrix maps every legacy Excel component in `Pay Fixation.xlsm` to the new PAYFIX platform across all architectural tiers (Excel Cell → Business Concept → Rule ID → Database Column → Rust Crate → API Endpoint → React Component → Report Section → Test Vector).

## Comprehensive Tier-by-Tier Mapping

| Excel Cell | Business Concept | Rule ID | PostgreSQL Column | Rust Crate / Module | REST API Endpoint | React UI Component | Report Document | Test Vector Case |
|------------|------------------|---------|-------------------|---------------------|-------------------|--------------------|-----------------|------------------|
| `IPS!B3` | Employee Name | `PAYFIX-EMP-001` | `employees.name` | `payfix-domain::Employee` | `POST /api/v1/employees` | `<EmployeeFormInput name="name" />` | Pension Report (Item 3) | `GOLDEN-001` |
| `IPS!B7` | Date of Birth | `PAYFIX-EMP-002` | `employees.dob` | `payfix-domain::Employee` | `POST /api/v1/employees` | `<DatePicker name="dob" />` | Pension Report (Item 5) | `GOLDEN-001` |
| `IPS!B8` | Date of Joining | `PAYFIX-QS-001` | `employees.doj` | `payfix-service::ServiceEngine` | `POST /api/v1/cases/{id}/service` | `<DatePicker name="doj" />` | Service Statement | `GOLDEN-001` |
| `IPS!B10` | Date of Retirement | `PAYFIX-QS-001` | `employees.date_retirement_or_death` | `payfix-service::ServiceEngine` | `POST /api/v1/cases/{id}/service` | `<DatePicker name="dor" />` | Service Statement | `GOLDEN-001` |
| `IPS!B15` | Non-Qualifying Days | `PAYFIX-QS-001` | `pension_cases.non_qualifying_days` | `payfix-service::ServiceEngine` | `POST /api/v1/cases/{id}/service` | `<NumberInput name="non_qualifying" />` | Service Statement | `GOLDEN-002` |
| `IPS!H22` | Last Basic Pay | `PAYFIX-PAY-001` | `pension_cases.last_basic_pay` | `payfix-pay-fixation::PayEngine` | `POST /api/v1/calculations/pay-fixation` | `<CurrencyInput name="last_pay" />` | Pay Fixation Statement | `GOLDEN-001` |
| `IPS!B28` | Half-Year Periods | `PAYFIX-QS-001` | `snapshots.half_year_periods` | `payfix-service::QualifyingService` | `POST /api/v1/calculations/service` | `<Badge label="Half Years" />` | Pension Report (Item 10) | `GOLDEN-001` |
| `PR!D15` | Gross Basic Pension | `PAYFIX-PEN-001` | `snapshots.gross_pension` | `payfix-pension::PensionEngine` | `POST /api/v1/calculations/pension` | `<CalculationCard title="Pension" />` | Pension Order (Item 12) | `GOLDEN-001` |
| `PR!D18` | Normal Family Pension | `PAYFIX-PEN-002` | `snapshots.family_pension_normal` | `payfix-pension::PensionEngine` | `POST /api/v1/calculations/pension` | `<CalculationCard title="Family Pension" />` | Pension Order (Item 15) | `GOLDEN-004` |
| `FAM DCRG!F25` | Gross DCRG | `PAYFIX-DCRG-001` | `snapshots.dcrg_gross` | `payfix-dcrg::DcrgEngine` | `POST /api/v1/calculations/dcrg` | `<CalculationCard title="DCRG" />` | Gratuity Sanction Order | `GOLDEN-007` |
| `PR!D25` | Commuted Value | `PAYFIX-COMM-001` | `snapshots.commuted_value` | `payfix-commutation::CommutationEngine` | `POST /api/v1/calculations/commutation` | `<CalculationCard title="Commutation" />` | Commutation Sanction Order | `GOLDEN-006` |
| `PR!D28` | Reduced Pension | `PAYFIX-COMM-001` | `snapshots.reduced_pension` | `payfix-commutation::CommutationEngine` | `POST /api/v1/calculations/commutation` | `<CalculationCard title="Reduced Pay" />` | Pension Payment Order (PPO) | `GOLDEN-001` |
