# 05 — Formal Business Rule Catalog

This catalog documents the official government pay revision, qualifying service, pension entitlement, DCRG, and commutation business rules extracted from `Pay Fixation.xlsm`.

## Rule Catalog Structure

```text
Rule ID
 ├── Rule Name
 ├── Effective Period
 ├── Statutory Reference
 ├── Scope / Application
 ├── Mathematical Formula
 ├── Rounding Policy
 └── Exception Handling
```

---

## 1. Rule `PAYFIX-QS-001`: Qualifying Service Calculation

- **Rule ID**: `PAYFIX-QS-001`
- **Name**: Net Qualifying Service & Half-Year Counter
- **Effective From**: 01-01-1982 to Present
- **Statutory Reference**: Tripura Civil Services (Pension) Rules, Rule 28
- **Formula**:
  $$\text{Net Days} = (\text{DOR} - \text{DOJ} + 1) - \text{Non-Qualifying Days}$$
  $$\text{Net Years} = \lfloor \text{Net Days} / 365 \rfloor$$
  $$\text{Net Months} = \lfloor (\text{Net Days} \bmod 365) / 30 \rfloor$$
  $$\text{Half-Year Periods} = \min\left(66, \begin{cases} (\text{Net Years} \times 2) + 1 & \text{if } \text{Net Months} \ge 6 \\ \text{Net Years} \times 2 & \text{otherwise} \end{cases}\right)$$
- **Rounding Policy**: Minimum threshold for 1 half-year is 6 months; 33 years (66 half-years) maximum ceiling.

---

## 2. Rule `PAYFIX-PEN-001`: Superannuation Pension

- **Rule ID**: `PAYFIX-PEN-001`
- **Name**: Basic Superannuation Pension Entitlement
- **Effective From**: 01-01-2017 / 01-10-2018
- **Statutory Reference**: Revision of Pay (ROP) 2017 / 2018, Pension Rule 49
- **Formula**:
  $$\text{Gross Pension} = \min\left(125000, \max\left(9000, \left\lceil \text{Last Basic Pay} \times 0.50 \times \frac{\text{Half-Year Periods}}{66} \right\rceil\right)\right)$$
- **Rounding Policy**: Rounded up to the next higher integer rupee (`CEILING` / `ROUNDUP`).

---

## 3. Rule `PAYFIX-DCRG-001`: Death-cum-Retirement Gratuity (DCRG)

- **Rule ID**: `PAYFIX-DCRG-001`
- **Name**: DCRG Entitlement & Maximum Ceiling
- **Effective From**: 01-10-2018 to Present
- **Statutory Reference**: Tripura State ROP 2018, Rule 50
- **Formula**:
  $$\text{Gross DCRG} = \min\left(2000000, \left\lceil \frac{\text{Last Basic Pay}}{4} \times \min(66, \text{Half-Year Periods}) \right\rceil\right)$$
  $$\text{Net DCRG} = \text{Gross DCRG} - \text{Outstanding Recovery}$$
- **Maximum Ceiling**: ₹20,00,000 (20 Lakhs).

---

## 4. Rule `PAYFIX-COMM-001`: Pension Commutation

- **Rule ID**: `PAYFIX-COMM-001`
- **Name**: Pension Commutation Lump Sum & Reduced Pension
- **Effective From**: 01-01-2017 to Present
- **Statutory Reference**: Civil Services (Commutation of Pension) Rules
- **Formula**:
  $$\text{Commuted Pension} = \left\lceil \text{Basic Pension} \times \frac{\min(40, \text{Requested \%})}{100} \right\rceil$$
  $$\text{Lump Sum Value} = \left\lceil \text{Commuted Pension} \times 12 \times \text{Factor}(\text{Age Next Birthday}) \right\rceil$$
  $$\text{Reduced Pension} = \text{Basic Pension} - \text{Commuted Pension}$$
- **Maximum Commutation**: 40% of Basic Pension.
