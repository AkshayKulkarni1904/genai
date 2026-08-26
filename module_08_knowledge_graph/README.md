# Module 8: Knowledge Graph Fundamentals

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![NetworkX](https://img.shields.io/badge/NetworkX-3.0+-orange.svg)](https://networkx.org/)
[![Status](https://img.shields.io/badge/status-production--ready-brightgreen.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

This module implements enterprise-grade **Knowledge Graph Architecture** for IT Service Management (ITSM). It transforms fragmented IT operational records into a strongly-typed, schema-validated property graph capable of multi-hop causal reasoning and Cypher pattern matching.

```
       (User: Employee)
             │
        [:REPORTS]
             ▼
      (Incident: P1 Outage) ──[:AFFECTS]──► (Application: Checkout-API)
             │                                        │
    [:CAUSED_BY_KNOWN_ERROR]                     [:HOSTED_ON]
             ▼                                        ▼
   (KnownError: REDIS_OOM)               (Host: k8s-node-cluster-04)
             │
       [:RESOLVED_BY]
             ▼
   (Resolution: SOP-Scale-Cluster) ──[:OWNED_BY]──► (Team: SRE-Core)
```

---

## Key Architectural Concepts

1. **Graph Primitives**: Strongly typed nodes, directed semantic relationships, property maps, and composite labels using NetworkX.
2. **Ontology vs. Taxonomy**: Formal domain taxonomy defining hierarchical classifications alongside an enterprise ontology specifying valid relationship cardinalities.
3. **Entity Resolution**: Normalizes messy textual mentions (e.g., `"postgres"`, `"pgsql"`, `"pg_cluster"`) into unambiguous canonical identifiers (`APP::ACME::pg_cluster`).
4. **Cypher Query Engine**: In-memory Cypher-like pattern matcher executing multi-hop relationship traversals (e.g., `MATCH (i:Incident)-[:CAUSED_BY_KNOWN_ERROR]->(ke:KnownError)-[:RESOLVED_BY]->(r:Resolution)`).
5. **Root-Cause Analysis (RCA)**: Automated causal path traversal linking reported symptoms to underlying infrastructure faults and remediation SOPs.
6. **Graph Governance & Quality Assurance**: Verification suites detecting orphaned nodes, invalid property schemas, and schema violations.

---

## File Structure

```
module_08_knowledge_graph/
├── data/
│   └── it_support_data.json      # Production IT support dataset (Users, Devices, Incidents, SOPs)
├── it_support_graph.py           # Enterprise ITSM Property Graph and Cypher query execution
├── schema.py                     # Ontology, Taxonomy, and Entity Resolution engine
├── main.py                       # Standalone CLI executable runner
└── README.md                     # Module documentation
```

---

## Supported Entity & Relationship Ontology

| Entity Label | Properties | Description |
| :--- | :--- | :--- |
| `User` | `user_id`, `name`, `department`, `role` | Enterprise employees and system users |
| `Device` | `device_id`, `model`, `os`, `ip_address` | Workstations, servers, edge devices |
| `Application` | `app_id`, `name`, `tier`, `repo` | Microservices, databases, platforms |
| `Incident` | `incident_id`, `severity`, `status`, `summary` | Operational outage reports |
| `KnownError` | `error_id`, `code`, `root_cause_summary` | Documented bugs and architectural faults |
| `Team` | `team_id`, `name`, `oncall_pager` | Engineering and operations teams |
| `Resolution` | `sop_id`, `title`, `steps`, `estimated_mins` | Standard Operating Procedures |

---

## Execution

### CLI Runner
```bash
python main.py
```

### Via Root Orchestrator
```bash
# Run from repository root:
python run_all.py 2
```

### Via Interactive Web Console
Open `http://127.0.0.1:8000` to interactively visualize the IT Support Knowledge Graph, execute custom Cypher traversal patterns, and test entity resolution normalization.
