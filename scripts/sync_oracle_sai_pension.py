import sys
import os

# Delegate to tools/sai_oracle_sync.py
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "tools"))
import sai_oracle_sync

if __name__ == "__main__":
    print("=== SAI Pension Oracle 12c Database Synchronizer ===")
    print("Target DB: 192.168.0.140:1521 | Schema: sai_agartala")
    sai_oracle_sync.test_oracle_connection()
    sai_oracle_sync.sync_sai_pension_cases()
