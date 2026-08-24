# 03 — Excel Calculation Dependency Graph & Formula Parsing

This document traces the complete calculation dependency chain from raw user inputs (`IPS` sheet) to intermediate calculation cells and final sanction report outputs (`PR`, `FAM DCRG`, `LTA`).

## High-Level Calculation Graph

```text
                               ┌───────────────────────────┐
                               │       USER INPUTS         │
                               │ DOB, DOJ, DOR, Last Pay   │
                               └─────────────┬─────────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
         ┌───────────────────────────┐               ┌───────────────────────────┐
         │  Qualifying Service Block │               │   Pay Fixation & Matrix   │
         │  IPS!B20..B28             │               │   2017! / 2018! Matrices      │
         └─────────────┬─────────────┘               └─────────────┬─────────────┘
                       │                                           │
                       │           ┌───────────────────────────────┘
                       ▼           ▼
         ┌──────────────────────────────────────────┐
         │         Central Calculation Engine       │
         │   IPS!H22 (Last Pay), IPS!B28 (QS Half)  │
         └─────────────────────┬────────────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
     ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
     │ Basic       │    │ Family      │    │ DCRG        │
     │ Pension     │    │ Pension     │    │ Engine      │
     │ PR!D15      │    │ PR!D18      │    │ FAM DCRG!   │
     └──────┬──────┘    └─────────────┘    └─────────────┘
            │
            ▼
     ┌─────────────┐
     │ Commutation │
     │ Engine      │
     │ PR!D25, D28 │
     └─────────────┘
```

---

## Detailed Formula Dependency Chains

### 1. Net Qualifying Service & Half-Year Periods
- **Input Cells**: `IPS!B8` (DOJ), `IPS!B10` (DOR), `IPS!B15` (Non-Qualifying Days)
- **Intermediate Formulas**:
  - `IPS!B20` (Total Gross Days): `=DATEDIF(IPS!B8, IPS!B10, "d") + 1`
  - `IPS!B21` (Net Days): `=IPS!B20 - IPS!B15`
  - `IPS!B25` (Net Years): `=INT(IPS!B21 / 365)`
  - `IPS!B26` (Net Remaining Months): `=INT(MOD(IPS!B21, 365) / 30)`
  - `IPS!B28` (Half-Year Periods): `=MIN(66, IF(IPS!B26 >= 6, (IPS!B25 * 2) + 1, IPS!B25 * 2))`
- **Downstream Targets**: `PR!D15`, `FAM DCRG!F25`

### 2. Basic Pension Calculation
- **Input Cells**: `IPS!H22` (Last Basic Pay), `IPS!B28` (Half-Year Periods)
- **Formula**:
  - `PR!D15`: `=MAX(9000, MIN(125000, ROUNDUP(IPS!H22 * 0.5 * (IPS!B28 / 66), 0)))`
- **Downstream Targets**: `PR!D25` (Commutation), `PR!D28` (Reduced Pension)

### 3. Death-cum-Retirement Gratuity (DCRG)
- **Input Cells**: `IPS!H22` (Last Basic Pay), `IPS!B28` (Half-Year Periods)
- **Formula**:
  - `FAM DCRG!F25`: `=MIN(2000000, ROUNDUP((IPS!H22 / 4) * MIN(66, IPS!B28), 0))`

### 4. Commutation Lump Sum & Reduced Pension
- **Input Cells**: `PR!D15` (Basic Pension), `IPS!N30` (Commutation %), `IPS!N32` (Age Next Birthday)
- **Intermediate Lookup**:
  - `IPS!N34` (Age Factor): `=VLOOKUP(IPS!N32, CommutationTable, 2, FALSE)`
- **Formulas**:
  - `PR!D25` (Lump Sum Value): `=ROUNDUP(PR!D15 * (IPS!N30 / 100) * 12 * IPS!N34, 0)`
  - `PR!D28` (Reduced Monthly Pension): `=PR!D15 - ROUNDUP(PR!D15 * (IPS!N30 / 100), 0)`
