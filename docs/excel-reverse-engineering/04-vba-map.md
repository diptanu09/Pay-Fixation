# 04 — VBA Macro Inventory & Automation Procedures

This document maps all VBA macro modules, procedures, triggers, sheet modifications, and cell interactions extracted from `xl/vbaProject.bin` inside `Pay Fixation.xlsm`.

## VBA Binary Overview

- **Binary Location**: `xl/vbaProject.bin`
- **Binary Size**: ~84,480 bytes
- **Total VBA Modules**: 1 macro binary containing Sheet handlers & standard modules (`Module1`, `Module4`, `Module6`, `Module7`, `Module8`, `Module9`).
- **Interaction Strategy**: Extract operational behavior into Rust service endpoints (do not translate VBA line-by-line).

---

## Macro Module Registry

| Module Name | Procedure Name | Trigger / Button | Cells Read | Cells Written | Business Behavior / Action |
|-------------|----------------|------------------|------------|---------------|----------------------------|
| `Module1` | `Calculate_Click()` | Button on `IPS` | `IPS!B3:B15`, `IPS!H22` | `IPS!N20:N35`, `PR!D15:D30` | Triggers full worksheet recalculation, updates qualifying service counters, and unhides print summary blocks. |
| `Module4` | `Print_Pension_Report()` | Button on `PR` | `PR!A1:X50` | Printer Stream | Applies page setup margins, sets print area to `PR!$A$1:$X$50`, and outputs PDF/print buffer. |
| `Module6` | `Switch_ROP_Matrix()` | Dropdown on `IPS` | `IPS!D12` (ROP Selection) | `2017!`, `2018!` views | Toggles visibility between Pay Matrix 2017 and Pay Matrix 2018 sheets based on retirement date. |
| `Module7` | `Clear_Form()` | Button on `IPS` | None | `IPS!B3:B15`, `IPS!H22` | Clears user input fields and resets calculation flags to default state. |
| `Module8` | `Lookup_DDO()` | Event Handler | `IPS!D3` (DDO Code) | `IPS!D4:D5` | Performs lookup against `DDO` master list (1,272 rows) and populates DDO Name and Office details. |

---

## Behavioral Extraction Matrix (VBA → Rust Service)

```text
Excel VBA Macro Action                 Rust / PAYFIX Service Equivalent
----------------------                 --------------------------------
Calculate_Click()                  →   POST /api/v1/calculations/process-case
Print_Pension_Report()             →   GET /api/v1/reports/pension-report/pdf
Switch_ROP_Matrix()                →   Rule Engine automatic matrix selection based on effective date
Lookup_DDO()                       →   GET /api/v1/master-data/ddo/{code}
Clear_Form()                       →   Client-side React form state reset (`form.reset()`)
```
