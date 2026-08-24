# 01 — Workbook Map & Architecture (`Pay Fixation.xlsm`)

This document details the layout, sheet inventory, and structural properties of the legacy `Pay Fixation.xlsm` macro-enabled Excel workbook.

## Workbook Summary

- **File Name**: `Pay Fixation.xlsm`
- **File Format**: Microsoft Excel Macro-Enabled Workbook (OpenXML `.xlsm`)
- **Total Worksheets**: 14
- **Named Ranges**: 10
- **Total Formula Cells**: 3,061 (1,185 active distinct formulas)
- **Extracted Outputs**: 339
- **Data Validations**: 3
- **Author/Credit**: Shri Nabajyoti Debnath, Sr. Accountant

---

## Complete Sheet Inventory

| # | Sheet Name | State | Purpose / Domain | Key Cell Dimensions |
|---|------------|-------|------------------|---------------------|
| 1 | `1982` | Visible | Historical Pay Scales (ROP 1982 Rules) | Max Row 26, Max Col 22 |
| 2 | `1988` | Visible | Historical Pay Scales (ROP 1988 Rules) | Max Row 39, Max Col 22 |
| 3 | `1999` | Visible | Historical Pay Scales (ROP 1999 Rules) | Max Row 40, Max Col 21 |
| 4 | `2017` | Visible | Tripura State Pay Matrix 2017 (Levels 1–21) | Max Row 45, Max Col 22 |
| 5 | `2018` | Visible | Tripura State Pay Matrix 2018 (Revised Entry Pay) | Max Row 45, Max Col 31 |
| 6 | `IPS` | Visible | **Central Calculation Sheet** ("Regular Pension Case") | Max Row 171, Max Col 20 |
| 7 | `PR` | Visible | **Pension Report & Sanction Statement** | Max Row 59, Max Col 19 |
| 8 | `LTA` | Visible | Life Time Arrear Calculation Sheet | Max Row 83, Max Col 19 |
| 9 | `FAM DCRG` | Visible | Family Pension & DCRG Entitlement Sheet | Max Row 67, Max Col 25 |
| 10 | `Special Pension` | Visible | Special Pension Case Computations | Max Row 32, Max Col 14 |
| 11 | `Rev PR` | Visible | Revised Pension Report Format | Max Row 40, Max Col 18 |
| 12 | `Rev Auth` | Visible | Revised Pension Authorization Statement | Max Row 43, Max Col 19 |
| 13 | `Pay Scales` | Visible | Historical Pay Scale Reference Master | Max Row 270, Max Col 19 |
| 14 | `DDO` | Visible | Drawing & Disbursing Officer Registry | Max Row 1,272, Max Col 16,384 |

---

## Named Ranges Catalog

| Range Name | Refers To / Target | Scope | Description |
|------------|-------------------|-------|-------------|
| `PAY_MATRIX_2017` | `='2017'!$A$1:$V$45` | Global | 2017 Tripura State Pay Matrix Lookup Table |
| `PAY_MATRIX_2018` | `='2018'!$A$1:$AE$45` | Global | 2018 Tripura State Pay Matrix Lookup Table |
| `ROP_1982_SCALES` | `='1982'!$A$1:$V$26` | Global | 1982 Revision of Pay Scale Cells |
| `ROP_1988_SCALES` | `='1988'!$A$1:$V$39` | Global | 1988 Revision of Pay Scale Cells |
| `ROP_1999_SCALES` | `='1999'!$A$1:$U$40` | Global | 1999 Revision of Pay Scale Cells |
| `DDO_LIST` | `='DDO'!$A$2:$C$1272` | Global | DDO Code and Office Name Master Registry |
| `EMPLOYEE_BASIC` | `='IPS'!$B$3:$B$15` | Sheet | Input block for Employee Service Profile |
| `QUALIFYING_SERVICE` | `='IPS'!$B$20:$B$35` | Sheet | Qualifying Service Computation Block |
| `PENSION_SUMMARY` | `='PR'!$B$2:$X$45` | Sheet | Final Calculated Pension Summary Block |
| `DCRG_SUMMARY` | `='FAM DCRG'!$A$1:$Y$67` | Sheet | Family Pension & Gratuity Calculation Block |
