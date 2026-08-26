# Module 9: GraphRAG (Graph-Augmented Generation)

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Status](https://img.shields.io/badge/status-production--ready-brightgreen.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

This module demonstrates **Graph-Augmented Generation (GraphRAG)** for complex multi-hop enterprise incident resolution. While naive vector search fails when critical context is spread across multiple distant documents, GraphRAG extracts entity-relation graphs, detects thematic communities, and traverses causal dependency topologies.

```
       [Raw Incident Report & Telemetry]
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 4-Step Incident Resolution GraphRAG Pipeline                │
│                                                             │
│ 1. Identity Extraction                                      │
│    └─ Extract Product, Error Code, Customer, & Environment  │
│                                                             │
│ 2. Multi-Source Hybrid Retrieval                            │
│    └─ Vector Search + Dependency Graph + SQL Metadata       │
│                                                             │
│ 3. Multi-Hop Graph Traversal                                │
│    └─ Trace Upstream Dependency Paths & Known Defect Links  │
│                                                             │
│ 4. Grounded Recommendation with Provenance                  │
│    └─ Generate Actionable SOP with Explicit Audit Chains   │
└─────────────────────────────────────────────────────────────┘
```

---

## Vector RAG vs. GraphRAG

| Feature | Standard Vector RAG | Enterprise GraphRAG |
| :--- | :--- | :--- |
| **Retrieval Unit** | Flat text chunks | Entity subgraphs + community summaries |
| **Multi-Hop Reasoning** | Poor (blind to relationships) | Native (graph path traversal) |
| **Global Thematic Context** | Low (only local passages) | High (hierarchical community detection) |
| **Auditability & Provenance** | Opaque similarity score | Explicit node-to-node topological chains |
| **Handling Structured Topology** | Ignores dependency graphs | Directly traverses infrastructure trees |

---

## File Structure

```
module_09_graph_rag/
├── data/
│   ├── dependency_graph.json         # Enterprise microservice & infrastructure dependency topology
│   └── incident_corpus.json          # Historical incident reports and post-mortems
├── graph_extractor.py                # Entity/relation extractor & community hierarchical summarizer
├── hybrid_retriever.py               # Unified retriever (Vector + Graph Traversal + Metadata)
├── incident_graphrag_pipeline.py     # Practical: 4-Step Incident Resolution GraphRAG Pipeline
├── main.py                           # Standalone CLI executable runner
└── README.md                         # Module documentation
```

---

## The 4-Step Resolution Pipeline

1. **Identification**: Extracts key operational entities (Product, Error Code, Environment, Customer Tier) from raw telemetry and incident descriptions.
2. **Hybrid Retrieval**: Combines semantic embeddings with graph neighborhood exploration to find relevant post-mortems and documentation.
3. **Topological Traversal**: Follows dependency edges (e.g., `Checkout-Service -> Redis-Cluster -> Storage-SAN`) to identify cascading failure sources.
4. **Actionable Recommendation**: Formulates concrete remediation steps backed by cryptographic/topological provenance linking every claim to a verified graph node.

---

## Execution

### CLI Runner
```bash
python main.py
```

### Via Root Orchestrator
```bash
# Run from repository root:
python run_all.py 3
```

### Via Interactive Web Console
Visit `http://127.0.0.1:8000` to run the interactive GraphRAG pipeline, view graph traversal paths, and inspect full provenance trees.
