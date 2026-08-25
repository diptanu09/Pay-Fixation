import os
import json
import sys
from datetime import datetime

try:
    import oracledb
except ImportError:
    oracledb = None

ORACLE_HOST = os.getenv("ORACLE_HOST", "192.168.0.140")
ORACLE_PORT = os.getenv("ORACLE_PORT", "1521")
ORACLE_USER = os.getenv("ORACLE_USER", "sai_agartala")
ORACLE_PASS = os.getenv("ORACLE_PASS", "sai_agartala")
ORACLE_SERVICE = os.getenv("ORACLE_SERVICE", "orcl")

API_URL = os.getenv("PAYFIX_API_URL", "http://localhost:8085/api/v1")

def inspect_oracle_sai_schema():
    print(f"[*] Authenticating with Oracle 12c (v12.2.0.1.0) at {ORACLE_HOST}:{ORACLE_PORT}/{ORACLE_SERVICE}...")
    dsn = f"{ORACLE_HOST}:{ORACLE_PORT}/{ORACLE_SERVICE}"
    
    try:
        conn = oracledb.connect(user=ORACLE_USER, password=ORACLE_PASS, dsn=dsn)
        print(f"[+] Connected to Oracle 12c Database successfully!")
        cursor = conn.cursor()
        
        # 1. Fetch all tables owned by sai_agartala
        cursor.execute("SELECT table_name, num_rows FROM user_tables ORDER BY table_name")
        tables = cursor.fetchall()
        print(f"[+] Discovered {len(tables)} tables in schema '{ORACLE_USER}':")
        
        table_summary = []
        for t_name, num_rows in tables:
            print(f"    - Table: {t_name:<30} | Rows: {num_rows if num_rows is not None else 0}")
            table_summary.append({"table_name": t_name, "estimated_rows": num_rows})
            
        conn.close()
        
        # Save discovery report
        report_path = os.path.join(os.path.dirname(__file__), "..", "artifacts", "oracle_sai_schema_discovery.json")
        os.makedirs(os.path.dirname(report_path), exist_ok=True)
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump({
                "host": ORACLE_HOST,
                "port": ORACLE_PORT,
                "schema": ORACLE_USER,
                "service_name": ORACLE_SERVICE,
                "tables_count": len(tables),
                "tables": table_summary,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }, f, indent=2)
        print(f"[+] Schema discovery artifact generated at {report_path}")
        return True
    except Exception as e:
        print(f"[-] Oracle DB connection error: {e}")
        return False

if __name__ == "__main__":
    inspect_oracle_sai_schema()
