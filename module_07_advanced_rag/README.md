# Module 7: Advanced RAG Patterns

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Status](https://img.shields.io/badge/status-production--ready-brightgreen.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

This module implements enterprise-grade **Advanced Retrieval-Augmented Generation (RAG)** patterns designed to overcome the limitations of naive vector search. It synthesizes unstructured product documentation, historical resolved incidents, known bug databases, and relational customer configuration data from SQLite.

```
                  ┌──────────────────────┐
                  │ Enterprise Support   │
                  │ Ticket / User Query  │
                  └──────────┬───────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
   [Query Decomposition]             [Semantic LRU Cache]
   - Sub-query 1: Doc search         - Check cached embeddings
   - Sub-query 2: SQLite config      - Return on cache HIT
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│ Multi-Source Hybrid Retrieval Layer                         │
│ ├─ Parent-Child Store (Small search chunk -> Full context)   │
│ ├─ Multi-Vector Index (Summary + Keywords + Dense Embedding) │
│ ├─ Incident & Known-Error Corpus                            │
│ └─ Relational SQLite Customer Configuration DB              │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
               [Corrective RAG (CRAG) Evaluator]
               ├─ Confidence >= 0.70 ──► Synthesize Resolution
               └─ Confidence <  0.70 ──► Fallback Playbook Search
```

---

## Key Architectural Patterns

1. **Parent-Child Chunking**: Small, dense child chunks are indexed for high retrieval precision, while full parent chunks are passed to the synthesizer to preserve holistic context.
2. **Multi-Vector Representations**: Generates multiple representations (executive summary, keyword vector, raw text) for each knowledge asset.
3. **Query Decomposition**: Breaks compound multi-hop queries into atomic sub-questions resolved sequentially across heterogeneous data sources.
4. **Corrective RAG (CRAG)**: Evaluates the semantic relevance score of retrieved documents before generation; triggers graceful fallback mechanisms if confidence is low.
5. **Relational Data Integration**: Queries live SQLite database (`customer_configs.sqlite`) to fetch tenant-specific quotas, SAML configurations, and environment parameters.
6. **Semantic LRU Caching**: Caches frequent query embeddings and retrieval artifacts with LRU eviction to cut retrieval latency.
7. **Knowledge-Base Lifecycle**: Full support for versioning, upserting, and soft/hard document deprecation.

---

## File Structure

```
module_07_advanced_rag/
├── data/
│   ├── customer_configs.sqlite   # SQLite DB storing customer environments & tenant configurations
│   ├── known_issues.json         # Active bug tracker and known platform defects
│   ├── product_docs.json         # Enterprise product manuals and API specifications
│   └── resolved_incidents.json   # Historical incident post-mortems and resolutions
├── main.py                       # Standalone CLI executable runner
├── rag_components.py             # Advanced RAG primitives (Parent-Child, Multi-Vector, CRAG, Cache)
├── support_assistant.py          # Practical: Support-Resolution Assistant Pipeline
└── README.md                     # Module documentation
```

---

## Practical Implementation: Support-Resolution Assistant

The `SupportAssistant` class orchestrates a multi-step resolution pipeline:
1. Validates query against **Semantic Cache**.
2. Decomposes the customer query into technical error codes and configuration lookups.
3. Queries the **SQLite Customer DB** for tenant tier and environment settings.
4. Executes **Parent-Child & Multi-Vector searches** across documentation, incidents, and bug trackers.
5. Runs **CRAG Evaluation** to score document confidence.
6. Generates a verified, audit-compliant resolution plan with exact root-cause citations.

---

## Execution

### CLI Runner
```bash
python main.py
```

### Via Root Orchestrator
```bash
# Run from repository root:
python run_all.py 1
```

### Via Interactive Web Console
Access the **Advanced RAG** tab at `http://127.0.0.1:8000` to run live queries with custom customer IDs, inspect retrieved parent/child chunks, and toggle CRAG evaluation.
