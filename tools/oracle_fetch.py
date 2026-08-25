import os
import sys
import json
import argparse
from datetime import datetime

try:
    # pyrefly: ignore [missing-import]
    import oracledb
except ImportError:
    oracledb = None

ORACLE_HOST = os.getenv("ORACLE_HOST", "192.168.0.140")
ORACLE_PORT = os.getenv("ORACLE_PORT", "1521")
ORACLE_USER = os.getenv("ORACLE_USER", "sai_agartala")
ORACLE_PASS = os.getenv("ORACLE_PASS", "sai_agartala")
ORACLE_SERVICE = os.getenv("ORACLE_SERVICE", "orcl")

def date_to_str(dt):
    if dt is None:
        return ""
    if isinstance(dt, (datetime, datetime.date)):
        return dt.strftime("%Y-%m-%d")
    return str(dt)

def fetch_pensioner_from_oracle(query_term):
    if not oracledb:
        return {"error": "python oracledb package not installed"}

    dsn = f"{ORACLE_HOST}:{ORACLE_PORT}/{ORACLE_SERVICE}"
    clean_term = str(query_term).strip()

    try:
        conn = oracledb.connect(user=ORACLE_USER, password=ORACLE_PASS, dsn=dsn)
        cursor = conn.cursor()

        sql = """
        SELECT 
          h.APPLN_PK,
          h.APPLN_NO,
          h.APPLN_PNSNR_NAME,
          h.APPLN_DDO_NAME,
          h.EMP_NO,
          h.APPLN_SECN_ID,
          p.APEN_DOB,
          p.APEN_DOA,
          p.APEN_DOR,
          p.APEN_DOD,
          p.APEN_AR_COUNTRY,
          p.APEN_AR_PHONE,
          p.APEN_AR_MOBILE,
          p.APEN_SPOUSE_NAME AS SPOUSE,
          q.LOV_NAME AS SPOUSE_REL,
          ct.LOV_NAME AS CASE_TYPE,
          TRIM(
            REGEXP_REPLACE(
              REPLACE(
                REPLACE(
                  NVL(p.APEN_AR_ADDR1,'') || ', ' ||
                  NVL(p.APEN_AR_ADDR2,'') || ', ' ||
                  NVL(p.APEN_AR_ADDR3,''),
                  CHR(13), ' '
                ),
                CHR(10), ' '
              ),
              '[[:space:]]+', ' '
            )
          ) AS PENSIONER_ADDRESS,
          d.DESG_NAME,
          b.ADBK_ID AS REAL_DDO_CODE
        FROM T_APPLICATION_HDR h
        LEFT JOIN T_APPLN_PENSIONER p ON h.APPLN_PK = p.APEN_APPLN_PK
        LEFT JOIN M_DESIGNATION d ON d.DESG_PK = p.APEN_DESG_PK
        LEFT JOIN M_LOV q ON q.LOV_PK = p.APEN_RELATION
        LEFT JOIN M_LOV ct ON ct.LOV_PK = h.APPLN_CASE_TYPE
        LEFT JOIN T_APPLN_BENEFITS i ON i.APB_APPLN_PK = h.APPLN_PK
        LEFT JOIN M_ADDR_BOOK b ON h.APPLN_DDO_PK = b.ADBK_PK
        WHERE TRIM(h.APPLN_NO) = :target OR h.APPLN_PK = :target
        """

        cursor.execute(sql, target=clean_term)
        row = cursor.fetchone()

        if not row:
            # Fallback search by LIKE
            sql_like = """
            SELECT 
              h.APPLN_PK,
              h.APPLN_NO,
              h.APPLN_PNSNR_NAME,
              h.APPLN_DDO_NAME,
              h.EMP_NO,
              h.APPLN_SECN_ID,
              p.APEN_DOB,
              p.APEN_DOA,
              p.APEN_DOR,
              p.APEN_DOD,
              p.APEN_AR_COUNTRY,
              p.APEN_AR_PHONE,
              p.APEN_AR_MOBILE,
              p.APEN_SPOUSE_NAME AS SPOUSE,
              q.LOV_NAME AS SPOUSE_REL,
              ct.LOV_NAME AS CASE_TYPE,
              TRIM(
                REGEXP_REPLACE(
                  REPLACE(
                    REPLACE(
                      NVL(p.APEN_AR_ADDR1,'') || ', ' ||
                      NVL(p.APEN_AR_ADDR2,'') || ', ' ||
                      NVL(p.APEN_AR_ADDR3,''),
                      CHR(13), ' '
                    ),
                    CHR(10), ' '
                  ),
                  '[[:space:]]+', ' '
                )
              ) AS PENSIONER_ADDRESS,
              d.DESG_NAME,
              b.ADBK_ID AS REAL_DDO_CODE
            FROM T_APPLICATION_HDR h
            LEFT JOIN T_APPLN_PENSIONER p ON h.APPLN_PK = p.APEN_APPLN_PK
            LEFT JOIN M_DESIGNATION d ON d.DESG_PK = p.APEN_DESG_PK
            LEFT JOIN M_LOV q ON q.LOV_PK = p.APEN_RELATION
            LEFT JOIN M_LOV ct ON ct.LOV_PK = h.APPLN_CASE_TYPE
            LEFT JOIN T_APPLN_BENEFITS i ON i.APB_APPLN_PK = h.APPLN_PK
            LEFT JOIN M_ADDR_BOOK b ON h.APPLN_DDO_PK = b.ADBK_PK
            WHERE TRIM(h.APPLN_NO) LIKE :like_target OR h.APPLN_PK LIKE :like_target
            """
            cursor.execute(sql_like, like_target=f"%{clean_term}%")
            row = cursor.fetchone()

        conn.close()

        if not row:
            return {"error": f"No record found in Oracle 12c (sai_agartala) for search query: '{clean_term}'"}

        (
            appln_pk, appln_no, pnsnr_name, ddo_name, emp_no, secn_id,
            dob, doa, dor, dod, country, phone, mobile,
            spouse, spouse_rel, case_type, pensioner_address, desg_name, real_ddo_code
        ) = row

        # Clean name formatting
        clean_name = pnsnr_name.lstrip('.').strip() if pnsnr_name else "N/A"
        clean_pr = str(emp_no).strip() if emp_no else f"PR-{appln_pk}"

        # Resolve true DDO Code from M_ADDR_BOOK.ADBK_ID
        formatted_ddo_code = str(real_ddo_code).strip() if real_ddo_code else (f"DDO-{secn_id}" if secn_id else "DDO-STATE")

        record = {
            "appln_pk": str(appln_pk),
            "application_no": str(appln_no) if appln_no else str(appln_pk),
            "name": clean_name,
            "designation": str(desg_name) if desg_name else "Officer",
            "pr_no": clean_pr,
            "group_class": "Group B",
            "dob": date_to_str(dob),
            "doj": date_to_str(doa),
            "date_retirement_or_death": date_to_str(dor or dod),
            "ddo_code": formatted_ddo_code,
            "ddo_name": str(ddo_name) if ddo_name else None,
            "spouse": str(spouse) if spouse else None,
            "spouse_rel": str(spouse_rel) if spouse_rel else None,
            "case_type": str(case_type) if case_type else None,
            "pensioner_address": str(pensioner_address) if pensioner_address else None,
            "phone_mobile": str(mobile or phone) if (mobile or phone) else None,
            "source": f"SAI Pension Live (Oracle 12c - sai_agartala.T_APPLICATION_HDR / PK: {appln_pk})"
        }
        return record
    except Exception as e:
        return {"error": f"Oracle Database query error: {str(e)}"}

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fetch SAI Pensioner record from Oracle 12c database")
    parser.add_argument("--query", required=True, help="APPLN_NO or APPLN_PK to fetch")
    args = parser.parse_args()

    res = fetch_pensioner_from_oracle(args.query)
    print(json.dumps(res, indent=2))
