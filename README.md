# PAYFIX — State Government Pay Fixation & Pension Calculation System

> **Enterprise-grade Pay Fixation, Pension, DCRG, Commutation Engine & Live Oracle 12c Integration** for Government of Tripura Pay Rules & Civil Service Pension Rules (TSCS RP 2017, TSCS RP 2018 1st Amendment, ROP 1999, ROP 1988, ROP 1982).

---

## 📌 Architecture & Technology Stack

| Layer | Technology / Framework | Function |
| :--- | :--- | :--- |
| **Frontend Web App** | React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons | Responsive UI with Live Oracle 12c search, Case Workspace, Service History Timeline, and Pay Fixation Workspace |
| **Backend API Service** | Rust (Axum, Tokio, Serde, Rust Decimal, Chrono, Uuid) | High-concurrency async REST API for pension calculations, case persistence, and workflow operations |
| **Domain & Calculation Engine** | Rust Workspace Crates (`payfix-*`) | Government pay fixation, qualifying service calculation, pension rules engine, DCRG, and CVP commutation |
| **Database Integration Layer** | Python 3, `oracledb` Driver | Direct live interface to Oracle 12c Database (`sai_agartala` schema @ `192.168.0.140:1521/orcl`) |
| **Container & Orchestration** | Docker, Docker Compose, Nginx | Multi-stage production container builds and automated deployment scripts |

---

## 📁 Repository Directory Structure

```text
Pay-Fixation/
├── apps/
│   └── web/                                 # Frontend Web Application (React + Vite + TS)
│       ├── src/
│       │   ├── components/                  # UI Components & Modals
│       │   │   ├── case/
│       │   │   │   ├── ServiceHistory.tsx   # Interactive Service History Timeline (Modal Form Entry)
│       │   │   │   ├── PayHistory.tsx       # Interactive Pay Fixation History (Modal Form Entry)
│       │   │   │   ├── NewCaseModal.tsx     # New Case Creation & Live Oracle Search Modal
│       │   │   │   ├── EmployeeForm.tsx     # Employee Demographics Form
│       │   │   │   └── Workspaces.tsx       # Pension, DCRG & Commutation Workspaces
│       │   │   └── common/                  # Header, Badges, Tabs, Stats UI
│       │   ├── pages/
│       │   │   ├── Dashboard.tsx            # Case Directory & Quick Action Dashboard
│       │   │   └── CaseWorkspace.tsx        # Unified Employee Case Management Workspace
│       │   ├── lib/
│       │   │   └── api.ts                   # Frontend API Client with Safe JSON Fetching
│       │   └── types/
│       │       └── api.ts                   # TypeScript Interfaces matching Rust Domain Models
│       └── package.json
│
├── crates/                                  # Rust Core Calculation Domain Engine
│   ├── payfix-domain/                       # Unified Data Models (PayFixationCase, Employee, ServiceEvent, PayHistoryEntry)
│   ├── payfix-rules/                        # ROP Rule Definitions (TSCS RP 2017/2018, ROP 1999, 1988, 1982)
│   ├── payfix-calculation/                  # Master Engine (Qualifying Service, Pension, DCRG, Commutation)
│   ├── payfix-service/                      # Workflow & State Transitions (Draft -> Verification -> Approved)
│   ├── payfix-pension/                      # Basic Pension & Family Pension Calculation Rules
│   ├── payfix-dcrg/                         # Death-cum-Retirement Gratuity (DCRG) Rules & Maximum Limits
│   ├── payfix-commutation/                  # Commutation of Pension (CVP) Table & Values
│   ├── payfix-revision/                     # Pay Revision & Fitment Factor Calculations
│   └── payfix-reports/                      # Formal Sanction Order & Last Pay Certificate (LPC) Generators
│
├── services/
│   └── payfix-api/                          # Axum REST API Server (Port 8085)
│       └── src/
│           ├── handlers/
│           │   ├── sai_pension.rs           # Live Oracle 12c Pension Lookup Handler
│           │   └── cases.rs                 # Case CRUD & Calculation Engine Endpoint Handlers
│           └── main.rs                      # Axum Server Bootstrap & Router Registration
│
├── tools/
│   ├── oracle_fetch.py                      # Live Oracle 12c Data Fetcher (Queries sai_agartala DB)
│   ├── excel-importer/                      # Forensic Import Utilities
│   └── release-certifier/                   # Automated Release Verification Tool
│
├── docker/
│   ├── Dockerfile.api                       # Multi-stage Rust + Python + Oracle client container
│   ├── Dockerfile.web                       # Multi-stage Node build + Nginx container
│   ├── docker-compose.yml                   # Container stack orchestration
│   └── nginx.conf                           # Nginx web server configuration
│
├── scripts/
│   └── deploy_docker.ps1                    # PowerShell 1-Click Container Deployment Script
│
└── Cargo.toml                               # Rust Workspace Manifest
```

---

## 🛢️ Live Oracle 12c Database Integration (`sai_agartala`)

The system queries live Government pensioner data directly from the Oracle 12c server (`192.168.0.140:1521/orcl`, Schema: `sai_agartala`) using `tools/oracle_fetch.py`.

### Primary Tables & Schema Joins

- **`T_APPLICATION_HDR` (`h`)**: Master application header (`APPLN_NO`, `APPLN_PK`, `APPLN_DDO_NAME`, `APPLN_DDO_PK`).
- **`T_APPLN_PENSIONER` (`p`)**: Pensioner details (`APEN_DOB`, `APEN_DOA`, `APEN_DOR`, `APEN_DOD`, `APEN_AR_ADDR1..3`, `APEN_SPOUSE_NAME`).
- **`M_DESIGNATION` (`d`)**: Office designation (`DESG_NAME`).
- **`M_LOV` (`q`, `ct`)**: Lookups for relation and case classification.
- **`M_ADDR_BOOK` (`b`)**: State DDO Code lookup (`ADBK_ID`).

> ⚠️ **Data Integrity Note**: All queries use `LEFT JOIN` syntax to ensure pensioner records with optional or missing fields (e.g. `APEN_RELATION`) are retrieved cleanly without dropping rows.

---

## 🚀 How to Run & Deploy

### Option 1: Automated Docker Stack Deployment (Recommended)

Run the PowerShell deployment script from the project root:

```powershell
.\scripts\deploy_docker.ps1
```

Access services at:
- **Web Interface**: `http://localhost:5173`
- **REST API Engine**: `http://localhost:8085`

### Option 2: Local Development Execution

#### 1. Backend API Engine (Rust)
```bash
cargo run --bin payfix-api
```
*API runs on `http://localhost:8085`*

#### 2. Frontend Application (React + Vite)
```bash
cd apps/web
npm install
npm run dev
```
*UI runs on `http://localhost:5173`*

---

## ⚙️ Key Workflows & Features

1. **Live Oracle Pensioner Lookup**:
   - Type an Application No (e.g. `10260665007`, `1026065279`) or APPLN_PK (e.g. `65218`, `65490`) in the search modal.
   - Automatically auto-fills Name, Designation, Date of Birth (`DOB`), Date of Joining (`DOA`), Date of Retirement (`DOR`), and State DDO Code.

2. **Interactive Service History Timeline**:
   - Click `+ Add Period` to launch an interactive modal form.
   - Enter From Date, To Date, Designation, Nature of Service, Excluded Days, and Remarks without hardcoded sample entries.

3. **Pay Progression & Fixation Workspace**:
   - Click `+ Add Pay Event` to enter ROP rule revisions, Pay Level/Scale, Grade Pay, Basic Pay, and Reason/Authority.

4. **Calculation Engine Execution**:
   - Calculates Qualifying Service (Gross Years/Months/Days, Net Half-Year Periods).
   - Computes Basic Pension (50% of Last Basic Pay), Family Pension (Enhanced vs Normal), DCRG Gratuity, and Commutation (CVP) Value using official rule multipliers.

---

## 🛠️ Verification & Testing Commands

```bash
# Test Rust Backend Compilation
cargo check --package payfix-api

# Build Frontend Web Application
npm --prefix apps/web run build

# Test Live Oracle Data Query Script
C:\Python314\python.exe tools/oracle_fetch.py --query 1026065279
```
