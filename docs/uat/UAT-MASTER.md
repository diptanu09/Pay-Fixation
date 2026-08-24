# PAYFIX User Acceptance Testing (UAT) Master Catalogue

**Release Version:** PAYFIX-0.1.0-RC1  
**Target Environment:** Local Office Network / Pilot Office  
**Certification Status:** READY FOR CONTROLLED PILOT ✓  

---

## 1. Test Suite Overview

| Test ID | Scenario Category | Objective | Target Role | Expected Status |
| :--- | :--- | :--- | :--- | :--- |
| **UAT-PF-001** | Pay Fixation (ROP 2017) | Calculate Option (a) vs (b) fitment from level 9 to 10 | DATA_ENTRY | PASS |
| **UAT-PEN-001** | Regular Superannuation | Calculate 33-year qualifying service pension | VERIFIER | PASS |
| **UAT-PEN-002** | Pro-Rata Short Service | Calculate 22-year pro-rata pension calculation | VERIFIER | PASS |
| **UAT-DCRG-001** | Statutory DCRG Ceiling | Apply ₹15.0 Lakh statutory ceiling to DCRG gratuity | APPROVER | PASS |
| **UAT-COMM-001** | Maximum Commutation | Calculate 40% lump-sum commutation with age 61 factor (8.194) | APPROVER | PASS |
| **UAT-FAM-001** | Normal Family Pension | Calculate 30% last basic pay normal family pension | VERIFIER | PASS |
| **UAT-FAM-002** | Enhanced Family Pension | Calculate 50% last basic pay enhanced family pension | VERIFIER | PASS |
| **UAT-REV-001** | Single Revision Arrears | Calculate retrospective 2-year arrear calculation statement | AUTHORIZING_OFFICER | PASS |
| **UAT-REV-002** | Multiple Revision Chain | Calculate chained revisions without destroying original snapshot | AUTHORIZING_OFFICER | PASS |
| **UAT-WF-001** | End-to-End Workflow | Full case lifecycle from Draft $\rightarrow$ Issued | ALL ROLES | PASS |
| **UAT-WF-002** | Controlled Rejection | Return case for correction from Verification to Data Entry | VERIFIER | PASS |
| **UAT-WF-003** | Maker-Checker Invariant | Reject self-verification or self-approval attempt (403 Forbidden) | SYSTEM_ADMIN | PASS |
| **UAT-DOC-001** | Document & Package | Generate sanction order with SHA-256 digest & QR code | AUTHORIZING_OFFICER | PASS |
| **UAT-MIG-001** | Excel 12-Component Parity | Import legacy `.xlsm` with 100% 12-component parity | DATA_ENTRY | PASS |
| **UAT-SEC-001** | Audit Log Tamper Verification | Detect modified log entry via SHA-256 hash chaining | AUDITOR | PASS |

---

## 2. Test Execution Log Template

```text
================================================================================
UAT TEST CASE EXECUTION RECORD
================================================================================
Test ID       : UAT-PF-001
Tester Name   : ___________________________
Designation   : ___________________________
Date Executed : 2026-08-24
Result        : [ ] PASS   [ ] FAIL   [ ] DISCREPANCY

PAYFIX Output : Basic Pay = ₹53,200.00 | Pension = ₹26,600.00
Excel Output  : Basic Pay = ₹53,200.00 | Pension = ₹26,600.00
Match Type    : EXACT_MATCH ✓

Evidence Hash : a3db5fce906de73a5a79c8b06b3ee180b286efc0e74454b92e6e0bad6ceb2dcf
Signoff       : ___________________________
================================================================================
```
