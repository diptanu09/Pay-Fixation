# PAYFIX Official Operator & Administrator Handbook

**Product Name:** PAYFIX — Tripura State Pay Fixation & Pension Calculation Platform  
**System Release:** PAYFIX-0.1.0-RC1  
**Target Roles:** Data Entry Officers, Verifiers, Approvers, Authorizing Officers, System Administrators  

---

## 1. Role & Operational Responsibilities Matrix

```text
┌─────────────────────────┬────────────┬──────────┬──────────┬─────────────┐
│ Action / Operation      │ Data Entry │ Verifier │ Approver │ Authorizer  │
├─────────────────────────┼────────────┼──────────┼──────────┼─────────────┤
│ Create / Edit Case      │     ✓      │    ✗     │    ✗     │      ✗      │
│ Run Calculation Engine  │     ✓      │    ✓     │    ✓     │      ✓      │
│ Submit for Verification │     ✓      │    ✗     │    ✗     │      ✗      │
│ Verify Case             │     ✗      │    ✓     │    ✗     │      ✗      │
│ Approve Case            │     ✗      │    ✗     │    ✓     │      ✗      │
│ Authorize Case          │     ✗      │    ✗     │    ✗     │      ✓      │
│ Issue Sanction & Package│     ✗      │    ✗     │    ✗     │      ✓      │
│ System Diagnostics & DR │     ✗      │    ✗     │    ✗     │ (Admin Only)│
└─────────────────────────┴────────────┴──────────┴──────────┴─────────────┘
```

---

## 2. Maker-Checker & Separation of Duties Policy
1. **No Self-Verification:** The user who created or last edited a case cannot perform the `Verify` action on that case.
2. **No Self-Approval:** The user who verified a case cannot perform the `Approve` action.
3. **No Self-Authorization:** The user who approved a case cannot perform the `Authorize` action.
4. **Immutability Post-Authorization:** Once a case reaches `AUTHORIZED` or `ISSUED` status, the case parameters, calculation snapshots, official documents, and package manifests are permanently sealed and locked.

---

## 3. Standard Operating Procedures (SOP)

### SOP-01: Data Entry & Calculation Setup
1. Log in to PAYFIX using your credentials.
2. Navigate to **Case Workspace** $\rightarrow$ Click **Create New Case**.
3. Fill employee service details, DOB, DOJ, date of retirement, and pay level history.
4. Click **Run Statutory Pension Engine** to execute pay fixation, pension, DCRG, and commutation calculations.
5. Inspect calculation trace steps for exact rule compliance.
6. Click **Submit for Verification**.

### SOP-02: Verification & Checklist Review
1. Open **Work Queues** $\rightarrow$ Select **Verification Queue**.
2. Claim the target case $\rightarrow$ Open Case Workspace.
3. Verify service book records against calculation steps.
4. Complete the 5-point verification checklist.
5. Click **Verify Case** (or **Reject / Return for Correction** with mandatory reason).

### SOP-03: Approval & Financial Sanction
1. Open **Work Queues** $\rightarrow$ Select **Approval Queue**.
2. Inspect calculation session summary, DCRG statutory ceiling compliance, and commutation lump-sum.
3. Click **Approve Case**.

### SOP-04: Authorization, Document Generation & Issuance
1. Open **Work Queues** $\rightarrow$ Select **Authorization Queue**.
2. Perform final statutory review $\rightarrow$ Click **Authorize Case**.
3. Click **Generate Official Document Suite** to produce Pay Fixation Statement, Pension Calculation Sheet, DCRG Authorization, and Commutation Statement.
4. Click **Issue Official Sanction Package**.

---

## 4. Disaster Recovery & System Diagnostics Procedure
1. Open **System Diagnostics** tab.
2. Check health indicators: API, Database Pool, Audit Log Chain, Rule Engine, Storage, and Backup Subsystem.
3. To take an immediate encrypted database snapshot, click **Trigger Encrypted Backup**.
4. To test RPO/RTO restoration readiness, click **Execute DR Restoration Drill**.
5. To verify complete data integrity for a case, use the **Full Case Integrity Verifier**.
