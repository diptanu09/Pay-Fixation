# 02 — Excel Input & Output Cell Mapping

This document establishes the precise bidirectional mapping between Excel cells in `Pay Fixation.xlsm` and the target domain concepts, PostgreSQL database fields, API parameters, and UI form fields.

## Input Cells Inventory (`IPS` Sheet)

| Excel Cell | Label / Field Name | Data Type | Required | Allowed Values / Validation | Database Target | UI Field |
|------------|-------------------|-----------|----------|-----------------------------|-----------------|----------|
| `IPS!B3` | Employee Name | Text | Yes | String (max 255) | `employees.name` | `name` |
| `IPS!B4` | Designation | Text | Yes | String / Master Dropdown | `employees.designation` | `designation` |
| `IPS!B5` | Application No. | Text | Yes | String / Serial pattern | `employees.application_no` | `application_no` |
| `IPS!B6` | PR No. | Text | Yes | String (e.g. `Pen-2/Sup/...`) | `employees.pr_no` | `pr_no` |
| `IPS!B7` | Date of Birth | Date | Yes | `YYYY-MM-DD` | `employees.dob` | `dob` |
| `IPS!B8` | Date of Joining | Date | Yes | `YYYY-MM-DD` | `employees.doj` | `doj` |
| `IPS!B9` | Date of Regularization | Date | No | `YYYY-MM-DD` | `employees.date_regularization` | `date_regularization` |
| `IPS!B10` | Date of Retirement / Death | Date | Yes | `YYYY-MM-DD` | `employees.date_retirement_or_death` | `date_retirement_or_death` |
| `IPS!E5` | CAS-1 Date | Date | No | `YYYY-MM-DD` | `service_records.date_cas_1` | `date_cas_1` |
| `IPS!E6` | CAS-2 Date | Date | No | `YYYY-MM-DD` | `service_records.date_cas_2` | `date_cas_2` |
| `IPS!E7` | ACP-3 Date | Date | No | `YYYY-MM-DD` | `service_records.date_acp_3` | `date_acp_3` |
| `IPS!B15` | Non-Qualifying Service (Days) | Integer | No | `0..3650` | `pension_cases.non_qualifying_days` | `non_qualifying_days` |
| `IPS!H22` | Last Basic Pay | Decimal | Yes | Currency (`NUMERIC(12,2)`) | `pension_cases.last_basic_pay` | `last_basic_pay` |
| `IPS!N30` | Commutation Requested % | Decimal | No | `0.00..40.00` | `pension_cases.commutation_percent` | `commutation_percent` |
| `IPS!N32` | Age Next Birthday | Integer | Yes | `20..80` | `pension_cases.age_next_birthday` | `age_next_birthday` |

---

## Output Cells Inventory (`PR`, `FAM DCRG`, `LTA` Sheets)

| Excel Cell | Output Field Label | Source Formula / Cell | Rule Reference | Target Database Column | Report Section |
|------------|-------------------|-----------------------|----------------|------------------------|----------------|
| `PR!D15` | Gross Basic Pension | `=ROUNDUP(IPS!H22*0.5*IPS!B28/66, 0)` | ROP 2017/2018 Sec 4 | `snapshots.gross_pension` | Pension Report (Item 12) |
| `PR!D18` | Normal Family Pension | `=ROUNDUP(IPS!H22*0.3, 0)` | Pension Rule 54 | `snapshots.family_pension_normal` | Pension Report (Item 15) |
| `PR!D20` | Enhanced Family Pension | `=ROUNDUP(IPS!H22*0.5, 0)` | Pension Rule 54(3) | `snapshots.family_pension_enhanced` | Pension Report (Item 16) |
| `FAM DCRG!F25` | Gross DCRG | `=MIN(ROUNDUP(IPS!H22/4*IPS!B28,0), 2000000)` | DCRG Cap Rule 2018 | `snapshots.dcrg_gross` | Gratuity Order (Item 5) |
| `PR!D25` | Commuted Lump-Sum Value | `=ROUNDUP(PR!D15*(IPS!N30/100)*12*IPS!N34,0)` | Commutation Rule 6 | `snapshots.commuted_value` | Commutation Order |
| `PR!D28` | Reduced Monthly Pension | `=PR!D15 - ROUNDUP(PR!D15*(IPS!N30/100),0)` | Commutation Rule 10 | `snapshots.reduced_pension` | Pension Payment Order |
