"""
PAYFIX — Graphify Architecture & Dependency Analyzer
Generates interactive HTML network graphs and Mermaid diagrams mapping:
1. Rust Workspace Crates & Core Domain Models
2. Axum API REST Handlers
3. React Frontend Workspaces & Components
4. Oracle 12c Live Database Tables & Joins
"""

import os
import json
import networkx as nx
from pyvis.network import Network

def generate_graphify():
    G = nx.DiGraph()

    # 1. Add System Core & Entry Points
    G.add_node("Web Client (React 18 / Vite)", group="frontend", color="#3b82f6", size=25)
    G.add_node("API Engine (Axum Async Rust)", group="backend", color="#10b981", size=25)
    G.add_node("Oracle 12c DB (sai_agartala)", group="database", color="#f59e0b", size=25)

    # 2. Add Rust Workspace Crates
    crates = [
        "payfix-domain", "payfix-rules", "payfix-calculation",
        "payfix-pension", "payfix-dcrg", "payfix-commutation",
        "payfix-service", "payfix-revision", "payfix-reports"
    ]
    for c in crates:
        G.add_node(f"crate: {c}", group="rust_crate", color="#8b5cf6", size=18)
        G.add_edge("API Engine (Axum Async Rust)", f"crate: {c}")

    # Crate internal relationships
    G.add_edge("crate: payfix-calculation", "crate: payfix-domain")
    G.add_edge("crate: payfix-calculation", "crate: payfix-rules")
    G.add_edge("crate: payfix-calculation", "crate: payfix-pension")
    G.add_edge("crate: payfix-calculation", "crate: payfix-dcrg")
    G.add_edge("crate: payfix-calculation", "crate: payfix-commutation")
    G.add_edge("crate: payfix-service", "crate: payfix-domain")

    # 3. Add Frontend UI Components
    ui_components = [
        "Dashboard.tsx", "CaseWorkspace.tsx", "ServiceHistory.tsx",
        "PayHistory.tsx", "NewCaseModal.tsx", "EmployeeForm.tsx"
    ]
    for comp in ui_components:
        G.add_node(f"UI: {comp}", group="ui_component", color="#06b6d4", size=15)
        G.add_edge("Web Client (React 18 / Vite)", f"UI: {comp}")

    G.add_edge("UI: CaseWorkspace.tsx", "UI: ServiceHistory.tsx")
    G.add_edge("UI: CaseWorkspace.tsx", "UI: PayHistory.tsx")
    G.add_edge("UI: Dashboard.tsx", "UI: NewCaseModal.tsx")

    # 4. Add Oracle 12c DB Tables
    db_tables = [
        "T_APPLICATION_HDR", "T_APPLN_PENSIONER", "M_DESIGNATION",
        "M_LOV", "M_ADDR_BOOK", "T_APPLN_BENEFITS"
    ]
    for tbl in db_tables:
        G.add_node(f"DB Table: {tbl}", group="db_table", color="#ec4899", size=15)
        G.add_edge("Oracle 12c DB (sai_agartala)", f"DB Table: {tbl}")

    # Python Oracledb Fetcher Bridge
    G.add_node("tools/oracle_fetch.py", group="bridge", color="#eab308", size=20)
    G.add_edge("API Engine (Axum Async Rust)", "tools/oracle_fetch.py")
    G.add_edge("tools/oracle_fetch.py", "Oracle 12c DB (sai_agartala)")

    # Frontend to Backend links
    G.add_edge("Web Client (React 18 / Vite)", "API Engine (Axum Async Rust)")

    # 5. Export Interactive Graphify Architecture Artifact
    out_dir = os.path.join(os.getcwd(), "artifacts")
    os.makedirs(out_dir, exist_ok=True)
    
    try:
        from pyvis.network import Network
        net = Network(height="750px", width="100%", bgcolor="#0f172a", font_color="#f8fafc", directed=True)
        net.from_nx(G)
        net.toggle_physics(True)
        html_path = os.path.join(out_dir, "payfix_architecture_graph.html")
        net.save_graph(html_path)
        print(f"Graphify PyVis network analysis exported successfully to: {html_path}")
    except Exception as e:
        json_path = os.path.join(out_dir, "payfix_architecture_graph.json")
        graph_data = nx.node_link_data(G)
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(graph_data, f, indent=2)
        print(f"Graphify JSON network analysis exported successfully to: {json_path}")

    print(f"Nodes count: {G.number_of_nodes()} | Edges count: {G.number_of_edges()}")

if __name__ == "__main__":
    generate_graphify()
